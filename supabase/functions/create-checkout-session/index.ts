import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contractId } = await req.json()

    if (!contractId) {
      throw new Error('Contract ID is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Fetch the contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('amount, project_id, freelancer_id')
      .eq('id', contractId)
      .eq('client_id', user.id)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found or unauthorized')
    }

    // Platform fee logic (10%)
    const platformFee = contract.amount * 0.10
    const netAmount = contract.amount - platformFee

    const origin = req.headers.get('origin') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Project Escrow Deposit (Contract: ${contractId})`,
            },
            unit_amount: Math.round(contract.amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/client/payments?status=success&contract_id=${contractId}`,
      cancel_url: `${origin}/client/payments?status=cancel`,
      metadata: {
        contractId: contractId,
        clientId: user.id,
        freelancerId: contract.freelancer_id,
        projectId: contract.project_id,
        platformFee: platformFee.toString(),
        netAmount: netAmount.toString()
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
