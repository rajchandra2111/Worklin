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
('How to Hire Elite Developers in 2026', 'how-to-hire-elite-developers', '# How to Hire Elite Developers in 2026

Finding the right talent is hard. Finding elite talent in a crowded global marketplace is even harder. But with the right strategies, you can secure top-tier developers for your next critical project.

In this guide, we will break down the modern playbook for sourcing, vetting, and hiring software engineers who don’t just write code, but solve complex business problems.

## 1. Define Clear Objectives

Start by outlining exactly what you need built. Vague project descriptions attract vague proposals. Elite developers value their time; if your job posting says "Need a clone of Uber but for dogs," a top-tier engineer will scroll past it.

Instead, define your tech stack, your immediate milestones, and the core problem you are trying to solve. For example:
> "Seeking a Senior React Native developer to refactor our real-time geolocation tracking module. Must have experience with WebSockets and high-frequency GPS polling."

## 2. Look Beyond the Resume

Resumes tell you what someone did in the past, but they don’t tell you how they think. When interviewing elite talent, focus on:
- **Architecture discussions:** Ask them how they would design a specific system from scratch.
- **Code reviews:** Give them a pull request with subtle bugs and ask them to review it.
- **Open Source contributions:** A developer’s GitHub profile is often the truest reflection of their passion and skill level.

## 3. Utilize Escrow for Mutual Trust

One of the biggest blockers to hiring elite global talent is trust. Clients worry about paying for incomplete work, and developers worry about not getting paid at all.

By using platforms that offer **Stripe-backed Escrow**, you eliminate this friction. You deposit the funds securely, proving you are a serious client, but the funds are only released when the milestone is successfully delivered.

## 4. Pay for Value, Not Just Hours

The best developers can solve a problem in 2 hours that would take an average developer 2 weeks. If you insist on paying strictly by the hour and comparing hourly rates, you will naturally filter out the fastest and most efficient engineers.

Shift to milestone-based pricing. Agree on the deliverable and the value it brings to your business, and price it accordingly.

## Conclusion

Hiring elite talent requires a shift in mindset. You are not buying hours of typing; you are investing in high-leverage problem solving. Treat the hiring process with the respect it deserves, and you will build a world-class team.', 'Discover the proven strategies for finding, vetting, and hiring top-tier freelance developers in the modern gig economy.', 'For Clients', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', now()),

('5 Pricing Strategies for Freelance Designers', 'pricing-strategies-freelance-designers', '# 5 Pricing Strategies for Freelance Designers

Pricing your services is often cited as the most anxiety-inducing part of being a freelance designer. Are you charging too much? Too little? Are you leaving money on the table?

Here are 5 proven pricing strategies you can implement today to increase your revenue and attract better clients.

## 1. Value-Based Pricing

Charge based on the value you provide the client, not the hours you work. 
If your redesign of an e-commerce checkout flow is going to increase the client’s conversion rate by 2%, and they make $10M a year, your design is worth $200,000 annually to them.

Charging $10,000 for that redesign is a bargain for the client, even if it only takes you 10 hours to complete. Value-based pricing aligns your incentives with the client’s success.

## 2. Productized Services

Instead of offering custom quotes for every single project, package your services into fixed-price, off-the-shelf "products".
For example:
- **Brand Audit:** $500
- **One-Page Landing Page Design:** $1,500
- **Full Brand Identity Package:** $5,000

This eliminates the back-and-forth of proposal writing and sets crystal clear expectations.

## 3. Retainer Agreements

If you want predictable, recurring revenue, transition your best clients to retainers. They pay a fixed monthly fee (e.g., $2,000/month) for a set amount of design output or priority access to your time.

## 4. Tiered Pricing

When you send a proposal, never send just one price. Send three options:
- **The Minimum Viable Product (MVP):** Just the bare essentials to solve their problem.
- **The Standard:** The recommended solution.
- **The Premium:** The "kitchen sink" option with all the bells and whistles (priority support, extra revisions, source files).

Psychologically, giving clients a choice shifts their mindset from "Should I hire this designer?" to "Which package should I choose?"

## 5. The Hourly Rate (With a Twist)

While value-based pricing is ideal, sometimes hourly billing is necessary (e.g., for open-ended maintenance work). If you must charge hourly, ensure you are charging a premium rate that accounts for your non-billable hours (admin, marketing, taxes, health insurance). 

A good rule of thumb: Take your desired annual salary, add 30% for expenses, and divide by 1,000 to get your minimum hourly rate.

Stop competing on price. Position yourself as a premium expert, and the high-value clients will follow.', 'Stop charging hourly. Learn how to implement value-based pricing and dramatically increase your freelance income.', 'For Freelancers', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', now() - interval '2 days'),

('Platform Update: Zero-Risk Escrow is Live', 'platform-update-escrow-live', '# Zero-Risk Escrow is Finally Here

We are thrilled to announce that our Stripe-backed escrow system is fully operational. This means absolute security for both clients and freelancers on the Worklin_ platform.

## Why We Built This

The freelance industry is plagued by a lack of trust.
- **Clients** are afraid to pay upfront because the freelancer might disappear.
- **Freelancers** are afraid to work without upfront payment because the client might ghost them after the work is delivered.

This fundamental lack of trust leads to endless friction. We decided to solve this at the infrastructure level.

## How It Works

1. **Agree on Milestones:** The client and freelancer agree on the project scope and milestone amounts.
2. **Fund Escrow:** The client deposits the funds for the first milestone into our secure, Stripe-backed escrow account via credit card.
3. **Begin Work:** The freelancer is notified that the funds are secured and begins work with total peace of mind.
4. **Deliver & Approve:** The freelancer submits the work. The client reviews it.
5. **Release Funds:** Once the client approves, the funds are instantly released to the freelancer’s connected bank account.

## Built on Stripe Connect

We partnered with Stripe to handle the heavy lifting of compliance, KYC (Know Your Customer), and secure routing. Your financial data never touches our servers. 

By leveraging Stripe Connect, we can offer automated payouts to over 40 countries, ensuring that no matter where you are in the world, you get paid safely and on time.

Start your next project today, and experience the peace of mind that comes with zero-risk escrow.', 'Read all about our latest feature release that brings enterprise-grade financial security to all Worklin_ users.', 'Platform Updates', 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80', now() - interval '5 days');
