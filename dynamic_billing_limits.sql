-- Migration: Dynamic Billing Limits
-- Updates the database triggers to count usage limits based on subscription current_period_start instead of a strict calendar month for paid tiers.

-- Restrict Clients from posting > 3 projects on Basic plan
CREATE OR REPLACE FUNCTION check_client_project_limits()
RETURNS TRIGGER AS $$
DECLARE
    active_plan TEXT;
    period_start TIMESTAMP WITH TIME ZONE;
    monthly_project_count INT;
BEGIN
    -- Get current active plan and its billing cycle start for the client
    SELECT plan_tier, current_period_start INTO active_plan, period_start
    FROM public.subscriptions 
    WHERE user_id = NEW.client_id AND role = 'client' AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    -- Default to basic if no subscription found
    IF active_plan IS NULL THEN
        active_plan := 'basic';
    END IF;

    -- If no period start is defined (e.g., Basic plan without active stripe sub), 
    -- default to the 1st of the current calendar month
    IF period_start IS NULL THEN
        period_start := date_trunc('month', now());
    END IF;

    -- If Basic, check project count since period_start
    IF active_plan = 'basic' THEN
        SELECT COUNT(*) INTO monthly_project_count 
        FROM public.projects 
        WHERE client_id = NEW.client_id 
          AND created_at >= period_start;
          
        IF monthly_project_count >= 3 THEN
            RAISE EXCEPTION 'Basic plan limit reached: You can only post 3 projects per month. Please upgrade your plan.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Restrict Freelancers from applying to > 15 projects on Basic plan or > 50 on Pro
CREATE OR REPLACE FUNCTION check_freelancer_proposal_limits()
RETURNS TRIGGER AS $$
DECLARE
    active_plan TEXT;
    period_start TIMESTAMP WITH TIME ZONE;
    monthly_proposal_count INT;
BEGIN
    SELECT plan_tier, current_period_start INTO active_plan, period_start
    FROM public.subscriptions 
    WHERE user_id = NEW.freelancer_id AND role = 'freelancer' AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    IF active_plan IS NULL THEN 
        active_plan := 'basic'; 
    END IF;

    IF period_start IS NULL THEN
        period_start := date_trunc('month', now());
    END IF;

    IF active_plan = 'basic' THEN
        SELECT COUNT(*) INTO monthly_proposal_count 
        FROM public.proposals 
        WHERE freelancer_id = NEW.freelancer_id 
          AND created_at >= period_start;
          
        IF monthly_proposal_count >= 15 THEN
            RAISE EXCEPTION 'Basic plan limit reached: You can only submit 15 proposals per month. Please upgrade your plan.';
        END IF;
    ELSIF active_plan = 'pro' THEN
        SELECT COUNT(*) INTO monthly_proposal_count 
        FROM public.proposals 
        WHERE freelancer_id = NEW.freelancer_id 
          AND created_at >= period_start;
          
        IF monthly_proposal_count >= 50 THEN
            RAISE EXCEPTION 'Pro plan limit reached: You can only submit 50 proposals per month. Please upgrade to Premium.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
