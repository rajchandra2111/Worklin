-- PROFILE SYSTEM ARCHITECTURE MIGRATION
-- This script ALTERS existing tables so data is not lost.

-- 1. Alter Client Profiles
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS about_company TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS hiring_interests TEXT[],
ADD COLUMN IF NOT EXISTS hiring_metrics JSONB DEFAULT '{"projects_posted": 0, "projects_completed": 0, "total_spent": 0, "avg_freelancer_rating": 0, "hire_rate": 0, "repeat_hires": 0}',
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Alter Freelancer Profiles
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Available',
ADD COLUMN IF NOT EXISTS about_me TEXT,
ADD COLUMN IF NOT EXISTS experience JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_specialization TEXT[],
ADD COLUMN IF NOT EXISTS work_preferences JSONB DEFAULT '{"size": [], "engagement": []}',
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{"projects_completed": 0, "total_earnings": 0, "success_rate": 0, "avg_rating": 0, "repeat_clients": 0, "response_time": ""}',
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'freelancer')),
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- 4. Setup Storage for Avatars
-- (Run this part if you have Storage enabled in Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
