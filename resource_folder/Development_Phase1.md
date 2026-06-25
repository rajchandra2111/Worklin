Good — you've got the stack (Supabase + Vercel + GitHub) and a clear Phase 1 goal. Let me build a proper engineering plan before a single line of code gets written.Now let me build this properly. 20+ years of experience means: think before typing, spec before coding, sequence matters.
::view-transition-group(_),
::view-transition-old(_),
::view-transition-new(\*) {
animation-duration: 0.25s;
animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
VvisualizeVvisualize show_widgetNow here's the full technical brief to execute against, step by step.

The execution plan
Start with the database, not the UI. Every senior dev who's rebuilt a feature twice did it because they started with the component and retrofitted the schema. Don't.
Step 1 — Run this migration first
sql-- 1. bids table
CREATE TABLE bids (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
amount numeric(10,2) NOT NULL CHECK (amount > 0),
estimated_days integer NOT NULL CHECK (estimated_days > 0),
cover_letter text NOT NULL,
status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending','accepted','rejected')),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
UNIQUE (project_id, freelancer_id) -- one bid per freelancer per project
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- 2. Add columns to your existing projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open'
CHECK (status IN ('open','hired','completed','cancelled')),
ADD COLUMN IF NOT EXISTS hired_bid_id uuid REFERENCES bids(id),
ADD COLUMN IF NOT EXISTS hired_freelancer_id uuid REFERENCES profiles(id);
The UNIQUE (project_id, freelancer_id) constraint is your duplicate-bid guard at the database level. Don't rely on frontend logic alone.
Step 2 — RLS policies
Paste these verbatim into Supabase SQL editor after the migration:
sql-- Freelancer sees their own bids
CREATE POLICY "freelancer_read_own_bids" ON bids FOR SELECT
USING (auth.uid() = freelancer_id);

-- Client sees bids on their projects
CREATE POLICY "client_read_project_bids" ON bids FOR SELECT
USING (auth.uid() = (SELECT client_id FROM projects WHERE id = bids.project_id));

-- Freelancer can submit a bid (project must be open, one per project)
CREATE POLICY "freelancer_insert_bid" ON bids FOR INSERT
WITH CHECK (
auth.uid() = freelancer_id
AND (SELECT status FROM projects WHERE id = project_id) = 'open'
AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'freelancer'
);

-- Only the project's client can update bid status (via the RPC)
CREATE POLICY "client_update_bid_status" ON bids FOR UPDATE
USING (auth.uid() = (SELECT client_id FROM projects WHERE id = bids.project_id));
Step 3 — The accept_bid() RPC
Paste the full Postgres function from the diagram above into the Supabase SQL editor. Then test it directly:
sql-- Test in SQL editor (replace with real IDs from your data)
SELECT accept_bid('your-bid-uuid-here');
Verify: the bid goes to accepted, all other bids on that project go to rejected, the project moves to hired. If this fails in SQL, it'll fail in prod — fix it here.
Step 4 — Frontend calls
typescript// Submit a bid
const { error } = await supabase
.from('bids')
.insert({
project_id: projectId,
freelancer_id: user.id,
amount: parseFloat(formData.amount),
estimated_days: parseInt(formData.days),
cover_letter: formData.coverLetter,
});

// Hire a freelancer (atomic RPC — not two separate calls)
const { error } = await supabase
.rpc('accept_bid', { p_bid_id: bidId });

// After success: invalidate both queries
queryClient.invalidateQueries(['project', projectId]);
queryClient.invalidateQueries(['bids', projectId]);

The three things most devs get wrong here

1. Two client-side calls instead of an RPC. Doing UPDATE bids then UPDATE projects as two separate calls will eventually fail mid-way and corrupt your data. The RPC is not optional — it's a transaction boundary.
2. Skipping RLS or testing it wrong. Test your policies by creating two test users (one client, one freelancer) and running queries as each. Don't just check that the happy path works — check that the freelancer cannot read another freelancer's bids.
3. Not handling the "already bid" state. When a freelancer loads a project they've already bid on, your UI should show their existing bid (status, amount, cover letter) — not a blank form. Query for an existing bid on mount and conditionally render.
