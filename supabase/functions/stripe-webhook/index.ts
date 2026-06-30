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
    } else if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object as Stripe.Identity.VerificationSession
      const { user_id, role } = session.metadata || {}
      
      if (user_id && role) {
        const table = role === 'client' ? 'client_profiles' : 'freelancer_profiles'
        const { error: updateError } = await supabaseAdmin
          .from(table)
          .update({ 
            identity_verified: true,
            stripe_identity_id: session.id
          })
          .eq('id', user_id)
          
        if (updateError) {
          console.error(`Error verifying ${role} identity:`, updateError)
          throw updateError
        }
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, role, planTier } = subscription.metadata || {};

      if (userId && role && planTier) {
        // Upsert into subscriptions table
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            role: role,
            plan_tier: planTier,
            status: subscription.status,
            billing_provider: 'stripe',
            provider_customer_id: subscription.customer as string,
            provider_subscription_id: subscription.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          }, { onConflict: 'provider_subscription_id' });

        if (subError) {
          console.error(`Error updating subscription for user ${userId}:`, subError);
          throw subError;
        }

        // If freelancer gets pro/premium, they should get credits. (Future logic can go here for monthly credit drops)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId } = subscription.metadata || {};

      if (userId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled', plan_tier: 'basic' })
          .eq('provider_subscription_id', subscription.id);
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
