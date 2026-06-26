import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    // Bypass RLS to insert into payments table
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // When the session completes successfully, we record the payment
      const {
        contractId,
        clientId,
        freelancerId,
        projectId,
        platformFee,
        netAmount
      } = session.metadata || {}

      if (contractId) {
        // 1. Insert into Payments table
        const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .insert({
            contract_id: contractId,
            client_id: clientId,
            freelancer_id: freelancerId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            platform_fee: parseFloat(platformFee || '0'),
            net_amount: parseFloat(netAmount || '0'),
            status: 'escrowed'
          })

        if (paymentError) {
          console.error('Error inserting payment:', paymentError)
          throw paymentError
        }

        // 2. Update Contract status to 'active'
        await supabaseAdmin
          .from('contracts')
          .update({ status: 'active' })
          .eq('id', contractId)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
