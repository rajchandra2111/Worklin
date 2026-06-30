-- PHASE 3: MVP COMPLETION (ADMIN, EMAILS, WORKFLOW)

-- 1. Alter Contracts for Work Submission
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS work_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submission_notes TEXT;

-- 2. Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);
-- Only supabase service role (or manual DB insert) can add admins initially
CREATE POLICY "Only admins can add admins" ON public.admins FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- 3. Email Notification Triggers
-- Note: These triggers use the Supabase net.http_post extension (pg_net) to invoke your Edge Function asynchronously.
-- First, ensure pg_net is enabled.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger the email edge function
CREATE OR REPLACE FUNCTION trigger_send_email()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
BEGIN
    -- We construct the payload based on the table
    IF TG_TABLE_NAME = 'proposals' THEN
        -- When a new proposal is created
        payload = jsonb_build_object(
            'type', 'new_proposal',
            'record', row_to_json(NEW)
        );
    ELSIF TG_TABLE_NAME = 'messages' THEN
        -- When a new message is sent
        payload = jsonb_build_object(
            'type', 'new_message',
            'record', row_to_json(NEW)
        );
    ELSIF TG_TABLE_NAME = 'contracts' THEN
        -- When a contract status changes (e.g., active -> completed)
        payload = jsonb_build_object(
            'type', 'contract_update',
            'record', row_to_json(NEW),
            'old_record', row_to_json(OLD)
        );
    END IF;

    -- Call the edge function asynchronously (fire and forget)
    -- REPLACE WITH YOUR ACTUAL PROJECT REFERENCE / URL
    PERFORM net.http_post(
        url := 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
        ),
        body := payload
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
DROP TRIGGER IF EXISTS on_proposal_created ON public.proposals;
CREATE TRIGGER on_proposal_created
    AFTER INSERT ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_send_email();

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_send_email();

DROP TRIGGER IF EXISTS on_contract_updated ON public.contracts;
CREATE TRIGGER on_contract_updated
    AFTER UPDATE OF status ON public.contracts
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION trigger_send_email();
