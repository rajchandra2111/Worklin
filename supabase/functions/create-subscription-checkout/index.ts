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

const PLAN_PRICES = {
  client_basic: 0,
  client_plus: 2900,
  client_enterprise: 9900,
  freelancer_basic: 0,
  freelancer_pro: 1500,
  freelancer_premium: 3900,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planName, role, billingCycle } = await req.json()

    if (!planName || !role) {
      throw new Error('Plan name and role are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const planKey = `${role}_${planName.toLowerCase()}` as keyof typeof PLAN_PRICES;
    let unitAmount = PLAN_PRICES[planKey] || 0;

    // Apply 20% discount for yearly billing
    if (billingCycle === 'yearly') {
      unitAmount = Math.floor(unitAmount * 0.8 * 12);
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Worklin ${planName} Plan (${role})`,
              description: billingCycle === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription',
            },
            unit_amount: unitAmount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: user.id,
          role: role,
          planTier: planName.toLowerCase(),
        }
      },
      success_url: `${origin}/pricing?status=success&plan=${planName}`,
      cancel_url: `${origin}/pricing?status=cancel`,
      metadata: {
        userId: user.id,
        role: role,
        planTier: planName.toLowerCase(),
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
