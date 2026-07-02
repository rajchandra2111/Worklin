-- Create Admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);

-- Grant Blog Management access to Admins
-- 1. Policy: Admins can insert posts
CREATE POLICY "Admins can insert blog posts" 
ON public.blog_posts FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- 2. Policy: Admins can update posts
CREATE POLICY "Admins can update blog posts" 
ON public.blog_posts FOR UPDATE 
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- 3. Policy: Admins can delete posts
CREATE POLICY "Admins can delete blog posts" 
ON public.blog_posts FOR DELETE 
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- 4. Policy: Admins can delete any comment (Moderation)
CREATE POLICY "Admins can delete any comment" 
ON public.blog_comments FOR DELETE 
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
