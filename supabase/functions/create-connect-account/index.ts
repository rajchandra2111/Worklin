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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Get Freelancer Profile
    const { data: profile, error: profileError } = await supabase
      .from('freelancer_profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    let accountId = profile.stripe_account_id

    // If they don't have a Stripe account yet, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
      })
      accountId = account.id

      // Save to database
      const { error: updateError } = await supabase
        .from('freelancer_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id)

      if (updateError) throw updateError
    }

    // Create Account Link for onboarding/dashboard
    const origin = req.headers.get('origin') || 'http://localhost:5173'
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/freelancer/earnings?status=refresh`,
      return_url: `${origin}/freelancer/earnings?status=return`,
      type: 'account_onboarding',
    })

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
