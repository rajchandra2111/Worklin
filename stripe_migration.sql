-- STRIPE ESCROW & CONNECT MIGRATION

-- 1. Create Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, active, completed, cancelled
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_transfer_id TEXT,
    amount NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL, -- 10% fee
    net_amount NUMERIC NOT NULL, -- amount - platform_fee
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, escrowed, released, refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add Stripe fields to Freelancer Profiles
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

-- 4. Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Contracts RLS Policies
CREATE POLICY "Clients can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Freelancers can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = freelancer_id);
CREATE POLICY "Clients can create contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their contracts" ON public.contracts FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Freelancers can update their contracts" ON public.contracts FOR UPDATE USING (auth.uid() = freelancer_id);

-- 6. Payments RLS Policies
CREATE POLICY "Clients can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Freelancers can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = freelancer_id);
-- Insert and Update for payments will be handled via Service Role in Edge Functions (Webhooks)
CREATE POLICY "Users cannot insert payments directly" ON public.payments FOR INSERT WITH CHECK (false);
CREATE POLICY "Users cannot update payments directly" ON public.payments FOR UPDATE USING (false);
