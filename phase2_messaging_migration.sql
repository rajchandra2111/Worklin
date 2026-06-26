-- PHASE 2: MESSAGING & COLLABORATION MIGRATION

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID NOT NULL, -- Could be client or freelancer
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Messages RLS Policies
-- Users can view messages if they are part of the contract
CREATE POLICY "Users can view contract messages" 
ON public.messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.contracts c 
        WHERE c.id = messages.contract_id 
        AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
    )
);

-- Users can send messages if they are part of the contract
CREATE POLICY "Users can send contract messages" 
ON public.messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contracts c 
        WHERE c.id = contract_id 
        AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
    )
    AND sender_id = auth.uid()
);

-- 4. Create Storage Bucket for Chat Files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_files', 'chat_files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies
-- Note: In a real production app, you might want this bucket to be private and use signed URLs.
-- For now, we use a public bucket but restrict uploads.
CREATE POLICY "Users can upload chat files" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'chat_files' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view chat files" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'chat_files' );

CREATE POLICY "Users can delete own chat files" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'chat_files' AND auth.uid() = owner );
