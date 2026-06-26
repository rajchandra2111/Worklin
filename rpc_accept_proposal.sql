-- Create RPC function to handle atomic hiring
CREATE OR REPLACE FUNCTION public.accept_proposal(p_proposal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_freelancer_id UUID;
    v_client_id UUID;
    v_amount NUMERIC;
BEGIN
    -- 1. Get proposal details
    SELECT project_id, freelancer_id, proposed_rate 
    INTO v_project_id, v_freelancer_id, v_amount
    FROM public.proposals 
    WHERE id = p_proposal_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found';
    END IF;

    -- 2. Get client_id from project
    SELECT client_id INTO v_client_id
    FROM public.projects
    WHERE id = v_project_id;

    -- 3. Update the winning proposal
    UPDATE public.proposals
    SET status = 'accepted'
    WHERE id = p_proposal_id;

    -- 4. Update all other proposals for this project to rejected
    UPDATE public.proposals
    SET status = 'rejected'
    WHERE project_id = v_project_id AND id != p_proposal_id;

    -- 5. Update the project status to hired
    UPDATE public.projects
    SET status = 'hired'
    WHERE id = v_project_id;

    -- 6. Create a contract (from stripe_migration.sql schema)
    INSERT INTO public.contracts (
        project_id,
        client_id,
        freelancer_id,
        proposal_id,
        amount,
        status
    ) VALUES (
        v_project_id,
        v_client_id,
        v_freelancer_id,
        p_proposal_id,
        v_amount,
        'pending'
    );

END;
$$;
