-- 1. Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create blog_comments table
CREATE TABLE public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create blog_likes table
CREATE TABLE public.blog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
-- Anyone can read published posts
CREATE POLICY "Anyone can view blog posts" 
ON public.blog_posts FOR SELECT 
USING (true);

-- Blog Comments Policies
-- Anyone can read comments
CREATE POLICY "Anyone can view blog comments" 
ON public.blog_comments FOR SELECT 
USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert comments" 
ON public.blog_comments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON public.blog_comments FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Blog Likes Policies
-- Anyone can read likes
CREATE POLICY "Anyone can view blog likes" 
ON public.blog_likes FOR SELECT 
USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can insert likes" 
ON public.blog_likes FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" 
ON public.blog_likes FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);


-- Insert some mock data for development
INSERT INTO public.blog_posts (title, slug, content, excerpt, category, cover_image, published_at)
VALUES 
('How to Hire Elite Developers in 2026', 'how-to-hire-elite-developers', '# How to Hire Elite Developers\n\nFinding the right talent is hard. Finding elite talent is harder. But with the right strategies, you can secure top developers for your next project.\n\n## 1. Define Clear Objectives\nStart by outlining exactly what you need built. Vague project descriptions attract vague proposals.', 'Discover the proven strategies for finding, vetting, and hiring top-tier freelance developers in the modern gig economy.', 'For Clients', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', now()),
('5 Pricing Strategies for Freelance Designers', 'pricing-strategies-freelance-designers', '# 5 Pricing Strategies for Freelancers\n\nPricing your services is one of the hardest parts of freelancing. Here are 5 strategies you can implement today:\n\n## 1. Value-Based Pricing\nCharge based on the value you provide the client, not the hours you work.', 'Stop charging hourly. Learn how to implement value-based pricing and dramatically increase your freelance income.', 'For Freelancers', 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=800&q=80', now() - interval '2 days'),
('Platform Update: Zero-Risk Escrow is Live', 'platform-update-escrow-live', '# Zero-Risk Escrow is Finally Here\n\nWe are thrilled to announce that our Stripe-backed escrow system is fully operational. This means absolute security for both clients and freelancers.', 'Read all about our latest feature release that brings enterprise-grade financial security to all Worklin_ users.', 'Platform Updates', 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80', now() - interval '5 days');
