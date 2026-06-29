-- SAVED PROJECTS MIGRATION

CREATE TABLE IF NOT EXISTS public.saved_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(freelancer_id, project_id) -- A freelancer can only save a project once
);

-- Enable RLS
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Freelancers can view their own saved projects"
ON public.saved_projects FOR SELECT
USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can save projects"
ON public.saved_projects FOR INSERT
WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can unsave projects"
ON public.saved_projects FOR DELETE
USING (auth.uid() = freelancer_id);
