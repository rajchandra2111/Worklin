-- COMPLETELY RESET AND RECREATE DATABASE SCHEMA

-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.client_profiles CASCADE;
DROP TABLE IF EXISTS public.freelancer_profiles CASCADE;
DROP TABLE IF EXISTS public.legacy_users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create Client Profiles
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

-- 3. Create Freelancer Profiles
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

-- 4. Create Projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.client_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_type TEXT NOT NULL,
    budget NUMERIC NOT NULL,
    timeline TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Proposals Table
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    freelancer_id UUID REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_rate NUMERIC NOT NULL,
    estimated_timeline TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Client Profiles
CREATE POLICY "Client profiles are viewable by everyone" ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own client profile" ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own client profile" ON public.client_profiles FOR UPDATE USING (auth.uid() = id);

-- Freelancer Profiles
CREATE POLICY "Freelancer profiles are viewable by everyone" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own freelancer profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own freelancer profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Clients can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = client_id);

-- Proposals
CREATE POLICY "Proposals are viewable by everyone" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Freelancers can insert their own proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update their own proposals" ON public.proposals FOR UPDATE USING (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can delete their own proposals" ON public.proposals FOR DELETE USING (auth.uid() = freelancer_id);
