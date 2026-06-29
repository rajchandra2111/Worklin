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

    // 1. Verify Contract and Get Payment Intent ID
    // We use service role to fetch payment details securely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, stripe_payment_intent_id, client_id, status')
      .eq('contract_id', contractId)
      .eq('status', 'escrowed')
      .single()

    if (paymentError || !payment) {
      throw new Error('No escrowed payment found for this contract')
    }

    if (payment.client_id !== user.id) {
      throw new Error('Unauthorized: Only the client can release funds')
    }

    if (!payment.stripe_payment_intent_id) {
      throw new Error('Payment Intent ID missing')
    }

    // 2. Capture the Payment in Stripe
    // This charges the client's card and automatically sends funds to the freelancer via Destination Charge
    const paymentIntent = await stripe.paymentIntents.capture(payment.stripe_payment_intent_id)

    // 3. Update Database Statuses
    if (paymentIntent.status === 'succeeded') {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'released' })
        .eq('id', payment.id)

      await supabaseAdmin
        .from('contracts')
        .update({ status: 'completed' })
        .eq('id', contractId)
    } else {
       throw new Error(`Payment failed to capture. Status: ${paymentIntent.status}`)
    }

    return new Response(JSON.stringify({ success: true, paymentIntentStatus: paymentIntent.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Capture payment error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
