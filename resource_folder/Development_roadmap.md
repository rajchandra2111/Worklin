SaaS Monetization & Subscription Plan
This document outlines the strategic, financial, and technical plan for introducing tiered SaaS subscriptions to the Worklin platform. Designed from the perspective of both a 20+ year technical architect and a marketplace finance expert, this model focuses on balancing marketplace liquidity (free users) with predictable MRR (subscriptions) and transaction volume (platform fees).

Open Questions
IMPORTANT

Do you agree with using lower platform fees as the primary incentive to upgrade? (e.g., Free users pay 10% fees, Premium pays 5%).
Do we want to strictly lock the number of job posts/proposals for free users, or allow them to buy "credits" ad-hoc if they exceed the limit?
For Stripe integration, do you prefer we use Stripe's hosted Customer Portal for subscription management (easiest, highly secure), or build a custom billing UI inside our dashboard?

1. Freelancer Tiers & Pricing Strategy
   The freelancer monetization strategy leverages "Pay-to-Win" mechanics (credits for premium DMs) combined with "ROI-driven" mechanics (lower fees). If a freelancer makes more than $800/mo on the platform, upgrading to Premium mathematically pays for itself.

🥉 Basic (Free)
Apply to up to 15 projects/month.
Standard profile visibility.
Platform Fee: 10% on all payouts.
No monthly credits included.
🥈 Pro ($15 / month)
Apply to 50 projects/month.
50 Connects/Credits included monthly (can be used to bypass client restrictions and send Premium DMs).
Profile Badge ("Pro Freelancer") to build trust.
See competitor bid ranges (Min, Max, Avg) on projects.
Platform Fee: 8% on payouts.
🥇 Premium ($39 / month)
Unlimited applications.
150 Connects/Credits included monthly.
Featured profile placement (appears higher in client search results).
Custom portfolio URL & enhanced branding.
Platform Fee: 5% on payouts (Highest ROI driver).
Instant Payouts (bypasses the standard 3-day escrow holding period). 2. Client Tiers & Pricing Strategy
Clients are monetized through workflow efficiency, talent quality, and team collaboration. High-volume hiring companies will upgrade to save on processing fees and manage teams.

🥉 Basic (Free)
Post up to 3 projects/month.
Invite up to 5 specific freelancers per project.
Payment Fee: 5% processing fee on funded contracts.
1 User Account (No team members).
🥈 Plus ($29 / month)
Post unlimited projects.
Invite unlimited freelancers.
Highlighted Job Posts (Marked as "Urgent" or "Featured" to attract top 1% talent).
Advanced filtering (e.g., filter proposals by freelancer success rate or specific skill badges).
Team Collaboration: Add up to 3 manager accounts.
Payment Fee: 3% processing fee.
🥇 Premium / Enterprise ($99 / month)
Payment Fee: 0% platform fee (Only standard Stripe card processing fees apply).
Unlimited team members & granular permission roles.
Dedicated Account Manager / Talent matching specialist.
NDA enforcement & custom contract templates.
Consolidated bulk invoicing (pay all freelancers in one monthly invoice). 3. Financial Projections & Mechanics
Why Freemium? Two-sided marketplaces die without liquidity. Free tiers ensure clients always have talent to choose from, and freelancers always have jobs to apply for.
Why Monthly Credits? Giving Pro/Premium freelancers a monthly allowance of credits hooks them into the premium messaging system. Once they see the ROI of sending Premium Direct Messages, they are highly likely to buy more credits ad-hoc.
Stripe Optimization: By pushing high-volume users to subscriptions, we offset Stripe's flat 30¢ transaction fee on micro-transactions, bundling value into a single monthly charge. 4. Proposed Technical Changes
To implement this, we need to introduce subscription tracking alongside the escrow system we previously migrated.

[NEW] Database Schema: subscriptions
sql

CREATE TABLE subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
role TEXT CHECK (role IN ('client', 'freelancer')),
stripe_customer_id TEXT,
stripe_subscription_id TEXT,
plan_tier TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'pro', 'plus', 'premium'
status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
current_period_end TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
[MODIFY] Edge Functions (Stripe Webhooks)
invoice.payment_succeeded: Updates current_period_end and status to 'active'.
customer.subscription.updated / deleted: Updates plan tiers and handles downgrades.
Monthly Credit Drop: When an invoice is paid for a freelancer, the webhook automatically adds 50 or 150 credits to their credits wallet.
[MODIFY] Row Level Security (RLS) & Triggers
Rate Limiting via Triggers: When a client inserts into projects, a Postgres trigger will count their active projects this month and block the insert if they are on basic and exceed 3 projects.
Dynamic Fee Calculation: The payments table logic will dynamically calculate the platform_fee (10%, 8%, 5%, etc.) by checking the subscriptions.plan_tier of the users involved in the contract.
Verification Plan
Database: Deploy the new schema and mock user data for all 6 tiers (Client x3, Freelancer x3).
Logic Check: Write a SQL test to simulate contract creation and verify that the platform_fee math adjusts dynamically based on the users' subscription tiers.
UI Integration: Build the Pricing/Upgrade page in React (/pricing) and connect it to Stripe Checkout test links.
