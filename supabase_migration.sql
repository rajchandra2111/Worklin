-- Clean up previous failed attempts
DROP TABLE IF EXISTS public.client_profiles CASCADE;
DROP TABLE IF EXISTS public.freelancer_profiles CASCADE;

-- Create Client Profiles
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    company_name TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Freelancer Profiles
CREATE TABLE public.freelancer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    skills TEXT[],
    country TEXT,
    hourly_rate NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Client Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own client profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own client profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Freelancer Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own freelancer profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own freelancer profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = id);

-- Migrate existing users based on their role
INSERT INTO public.client_profiles (id, full_name, company_name)
SELECT id, full_name, company_name FROM public.users WHERE role = 'client'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.freelancer_profiles (id, full_name, skills)
SELECT id, full_name, skills FROM public.users WHERE role = 'freelancer'
ON CONFLICT (id) DO NOTHING;

-- Update foreign keys to allow automatic GraphQL/PostgREST joins
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.client_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_freelancer_id_fkey;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE;

-- Rename old users table to prevent accidental usage
ALTER TABLE public.users RENAME TO legacy_users;
