-- SAAS MONETIZATION, BILLING, TAX, & COMPLIANCE MIGRATION

-- 1. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'freelancer')),
    plan_tier TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'pro', 'plus', 'premium'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
    billing_provider TEXT, -- 'stripe', 'paypal'
    provider_customer_id TEXT, -- e.g. stripe_customer_id
    provider_subscription_id TEXT, -- e.g. stripe_subscription_id
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Billing History / Invoices Table (for taxes and legal compliance)
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD' NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'open', 'void', 'uncollectible'
    invoice_pdf_url TEXT,
    billing_provider TEXT NOT NULL,
    provider_invoice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add Tax & Legal fields to profiles
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tax_id TEXT, -- e.g. VAT number, EIN
ADD COLUMN IF NOT EXISTS legal_entity_type TEXT, -- 'individual', 'company'
ADD COLUMN IF NOT EXISTS accepted_tos_version TEXT;

ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS legal_entity_type TEXT,
ADD COLUMN IF NOT EXISTS accepted_tos_version TEXT,
ADD COLUMN IF NOT EXISTS connects_balance INTEGER DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- 5. Subscriptions RLS Policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users cannot modify subscriptions directly" ON public.subscriptions 
FOR ALL USING (false); -- Handled securely by backend webhooks (Service Role)

-- 6. Billing History RLS Policies
CREATE POLICY "Users can view their own billing history" ON public.billing_history 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users cannot modify billing history directly" ON public.billing_history 
FOR ALL USING (false);

-- 7. Functions & Triggers for Plan Limits

-- Restrict Clients from posting > 3 projects on Basic plan
CREATE OR REPLACE FUNCTION check_client_project_limits()
RETURNS TRIGGER AS $$
DECLARE
    active_plan TEXT;
    monthly_project_count INT;
BEGIN
    -- Get current active plan for the client
    SELECT plan_tier INTO active_plan 
    FROM public.subscriptions 
    WHERE user_id = NEW.client_id AND role = 'client' AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    -- Default to basic if no subscription found
    IF active_plan IS NULL THEN
        active_plan := 'basic';
    END IF;

    -- If Basic, check project count in current month
    IF active_plan = 'basic' THEN
        SELECT COUNT(*) INTO monthly_project_count 
        FROM public.projects 
        WHERE client_id = NEW.client_id 
          AND date_trunc('month', created_at) = date_trunc('month', now());
          
        IF monthly_project_count >= 3 THEN
            RAISE EXCEPTION 'Basic plan limit reached: You can only post 3 projects per month. Please upgrade your plan.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_client_project_limits ON public.projects;
CREATE TRIGGER enforce_client_project_limits
    BEFORE INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION check_client_project_limits();

-- Restrict Freelancers from applying to > 15 projects on Basic plan
CREATE OR REPLACE FUNCTION check_freelancer_proposal_limits()
RETURNS TRIGGER AS $$
DECLARE
    active_plan TEXT;
    monthly_proposal_count INT;
BEGIN
    SELECT plan_tier INTO active_plan 
    FROM public.subscriptions 
    WHERE user_id = NEW.freelancer_id AND role = 'freelancer' AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    IF active_plan IS NULL THEN active_plan := 'basic'; END IF;

    IF active_plan = 'basic' THEN
        SELECT COUNT(*) INTO monthly_proposal_count 
        FROM public.proposals 
        WHERE freelancer_id = NEW.freelancer_id 
          AND date_trunc('month', created_at) = date_trunc('month', now());
          
        IF monthly_proposal_count >= 15 THEN
            RAISE EXCEPTION 'Basic plan limit reached: You can only submit 15 proposals per month. Please upgrade your plan.';
        END IF;
    ELSIF active_plan = 'pro' THEN
        SELECT COUNT(*) INTO monthly_proposal_count 
        FROM public.proposals 
        WHERE freelancer_id = NEW.freelancer_id 
          AND date_trunc('month', created_at) = date_trunc('month', now());
          
        IF monthly_proposal_count >= 50 THEN
            RAISE EXCEPTION 'Pro plan limit reached: You can only submit 50 proposals per month. Please upgrade to Premium.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_freelancer_proposal_limits ON public.proposals;
CREATE TRIGGER enforce_freelancer_proposal_limits
    BEFORE INSERT ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION check_freelancer_proposal_limits();

