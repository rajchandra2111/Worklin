-- Phase 1 Migration: Bidding & Hiring Engine
-- Please run this in your Supabase SQL Editor.

-- 1. Alter proposals table
ALTER TABLE public.proposals
ADD CONSTRAINT unique_project_freelancer UNIQUE (project_id, freelancer_id),
ADD CONSTRAINT check_proposal_status CHECK (status IN ('pending', 'accepted', 'rejected'));

-- 2. Alter projects table
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS check_project_status,
ADD CONSTRAINT check_project_status CHECK (status IN ('open', 'hired', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS hired_proposal_id UUID REFERENCES public.proposals(id),
ADD COLUMN IF NOT EXISTS hired_freelancer_id UUID REFERENCES public.freelancer_profiles(id);

-- 3. Update RLS for Proposals (Freelancer can only bid on 'open' projects)
DROP POLICY IF EXISTS "Freelancers can insert their own proposals" ON public.proposals;
CREATE POLICY "Freelancers can insert their own proposals" ON public.proposals 
FOR INSERT WITH CHECK (
    auth.uid() = freelancer_id
    AND (SELECT status FROM public.projects WHERE id = project_id) = 'open'
);

-- 4. Create the RPC accept_proposal (Atomic Transaction)
CREATE OR REPLACE FUNCTION accept_proposal(p_proposal_id UUID)
RETURNS void AS $$
DECLARE
    v_project_id UUID;
    v_freelancer_id UUID;
    v_client_id UUID;
BEGIN
    -- Get the proposal details
    SELECT project_id, freelancer_id INTO v_project_id, v_freelancer_id
    FROM public.proposals
    WHERE id = p_proposal_id;

    IF v_project_id IS NULL THEN
        RAISE EXCEPTION 'Proposal not found';
    END IF;

    -- Verify the caller is the client who owns the project
    SELECT client_id INTO v_client_id
    FROM public.projects
    WHERE id = v_project_id;

    IF v_client_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized to accept this proposal';
    END IF;

    -- Accept this proposal
    UPDATE public.proposals
    SET status = 'accepted'
    WHERE id = p_proposal_id;

    -- Reject all other proposals for this project
    UPDATE public.proposals
    SET status = 'rejected'
    WHERE project_id = v_project_id AND id != p_proposal_id;

    -- Update the project status
    UPDATE public.projects
    SET status = 'hired',
        hired_proposal_id = p_proposal_id,
        hired_freelancer_id = v_freelancer_id
    WHERE id = v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
