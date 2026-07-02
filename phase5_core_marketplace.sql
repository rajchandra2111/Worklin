-- Phase 5: Core Marketplace Upgrade

-- 1. Proposals Table Updates
-- Add deposit required and attachments to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS deposit_required NUMERIC;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- 2. Contracts Table Updates (SafePay / Escrow)
-- Ensure contracts have funding states for PayPal milestones
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS escrow_funded BOOLEAN DEFAULT false;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS remaining_balance_paid BOOLEAN DEFAULT false;

-- Add pending_funding to contract status check constraint
-- The constraint name might vary, so we can drop it and recreate it, or just alter the type if it's an ENUM.
-- Assuming status is just a text column, we don't need a hard constraint, but if there is one:
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Fix any existing contracts that might have a different status (e.g., 'pending')
UPDATE public.contracts 
SET status = 'pending_funding' 
WHERE status NOT IN ('pending_funding', 'active', 'completed', 'cancelled');

ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('pending_funding', 'active', 'completed', 'cancelled'));

-- 3. Storage Bucket for Proposal Attachments
-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal_attachments', 'proposal_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads to proposal_attachments" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to proposal_attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'proposal_attachments');

-- Policy: Allow anyone to view attachments
DROP POLICY IF EXISTS "Allow public viewing of proposal_attachments" ON storage.objects;
CREATE POLICY "Allow public viewing of proposal_attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'proposal_attachments');

-- 4. Update RPC accept_proposal to support SafePay / Escrow
CREATE OR REPLACE FUNCTION accept_proposal(p_proposal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_freelancer_id UUID;
    v_client_id UUID;
    v_rate NUMERIC;
    v_deposit NUMERIC;
BEGIN
    -- Get proposal details
    SELECT project_id, freelancer_id, proposed_rate, COALESCE(deposit_required, 0)
    INTO v_project_id, v_freelancer_id, v_rate, v_deposit
    FROM public.proposals
    WHERE id = p_proposal_id;

    -- Get client ID
    SELECT client_id INTO v_client_id
    FROM public.projects
    WHERE id = v_project_id;

    -- Verify the caller is the client of the project
    IF auth.uid() != v_client_id THEN
        RAISE EXCEPTION 'Only the project owner can accept proposals';
    END IF;

    -- Mark this proposal as accepted
    UPDATE public.proposals
    SET status = 'accepted'
    WHERE id = p_proposal_id;

    -- Reject all other pending proposals for this project
    UPDATE public.proposals
    SET status = 'rejected'
    WHERE project_id = v_project_id AND id != p_proposal_id;

    -- Mark project as in progress
    UPDATE public.projects
    SET status = 'hired'
    WHERE id = v_project_id;

    -- Create contract (pending funding via PayPal)
    INSERT INTO public.contracts (
        project_id, 
        freelancer_id, 
        client_id, 
        proposal_id, 
        status, 
        amount,
        total_amount, 
        escrow_amount
    )
    VALUES (
        v_project_id, 
        v_freelancer_id, 
        v_client_id, 
        p_proposal_id, 
        'pending_funding', 
        v_rate,
        v_rate, 
        v_deposit
    );
END;
$$;
