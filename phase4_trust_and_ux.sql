-- PHASE 4: TRUST & UX (Reviews, KYC, Portfolios)

-- 1. Add KYC Fields to Profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_identity_id TEXT;

ALTER TABLE public.freelancer_profiles 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_identity_id TEXT;

-- 2. Storage Bucket for Portfolios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Portfolios Bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'portfolios' );

CREATE POLICY "Authenticated users can upload portfolio items" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'portfolios' AND auth.role() = 'authenticated' );

-- 3. Review Triggers for Metric Rollups
-- Function to update freelancer average rating when a review is added
CREATE OR REPLACE FUNCTION update_freelancer_metrics_on_review()
RETURNS TRIGGER AS $$
DECLARE
    new_avg_rating NUMERIC;
    new_projects_completed INT;
BEGIN
    -- Only update if it's a review for a freelancer
    IF NEW.freelancer_id IS NOT NULL THEN
        -- Calculate new average
        SELECT ROUND(AVG(rating)::numeric, 1) INTO new_avg_rating
        FROM public.reviews
        WHERE freelancer_id = NEW.freelancer_id;

        -- We'll assume one review = one completed project for simplicity,
        -- or you can count completed contracts. Let's just update rating here.
        
        -- Update the JSONB metrics column on freelancer_profiles
        UPDATE public.freelancer_profiles
        SET metrics = jsonb_set(
            jsonb_set(COALESCE(metrics, '{}'::jsonb), '{avg_rating}', to_jsonb(new_avg_rating)),
            '{projects_completed}', 
            (SELECT to_jsonb(COUNT(*)) FROM public.contracts c 
             JOIN public.proposals p ON c.proposal_id = p.id 
             WHERE p.freelancer_id = NEW.freelancer_id AND c.status = 'completed')
        )
        WHERE id = NEW.freelancer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the Trigger
DROP TRIGGER IF EXISTS on_freelancer_review_added ON public.reviews;
CREATE TRIGGER on_freelancer_review_added
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_freelancer_metrics_on_review();
