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

    // Fetch the contract details and freelancer's Stripe Account ID
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        amount, 
        project_id, 
        freelancer_id,
        freelancer:freelancer_profiles (
          stripe_account_id
        )
      `)
      .eq('id', contractId)
      .eq('client_id', user.id)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found or unauthorized')
    }

    const stripeAccountId = contract.freelancer?.stripe_account_id;
    if (!stripeAccountId) {
      throw new Error('Freelancer has not connected their bank account yet. Cannot fund escrow.')
    }

    // Fetch active subscriptions for both users
    const { data: clientSub } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', user.id)
      .eq('role', 'client')
      .eq('status', 'active')
      .maybeSingle()

    const { data: freelancerSub } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', contract.freelancer_id)
      .eq('role', 'freelancer')
      .eq('status', 'active')
      .maybeSingle()

    const clientTier = clientSub?.plan_tier || 'basic'
    const freelancerTier = freelancerSub?.plan_tier || 'basic'

    // Determine Client Fee (added to total amount paid by client)
    let clientFeeRate = 0.05 // Basic: 5%
    if (clientTier === 'plus') clientFeeRate = 0.03 // Plus: 3%
    if (clientTier === 'premium' || clientTier === 'enterprise') clientFeeRate = 0.00 // Premium: 0%

    // Determine Freelancer Fee (deducted from amount before payout)
    let freelancerFeeRate = 0.10 // Basic: 10%
    if (freelancerTier === 'pro') freelancerFeeRate = 0.08 // Pro: 8%
    if (freelancerTier === 'premium') freelancerFeeRate = 0.05 // Premium: 5%

    const clientFeeAmount = contract.amount * clientFeeRate
    const freelancerFeeAmount = contract.amount * freelancerFeeRate
    
    // Total charged to client = contract amount + client fee
    const totalChargeAmount = contract.amount + clientFeeAmount
    
    // Total application fee taken by platform = client fee + freelancer fee
    const totalPlatformFee = clientFeeAmount + freelancerFeeAmount
    
    // Net amount to freelancer = contract amount - freelancer fee
    const netAmount = contract.amount - freelancerFeeAmount

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
            unit_amount: Math.round(totalChargeAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual',
        application_fee_amount: Math.round(totalPlatformFee * 100),
        transfer_data: {
          destination: stripeAccountId,
        },
      },
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
