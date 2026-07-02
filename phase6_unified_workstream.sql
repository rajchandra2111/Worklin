-- Phase 6: Unified Workstream (Messages + Contracts)

-- 1. Add message_type and metadata to the messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- message_type can be:
-- 'text' (standard chat message)
-- 'system_event' (e.g. Project Started, Payment Released)
-- 'delivery_submission' (When freelancer submits work)

-- 2. Update storage policy if needed to allow files attached to messages to be public
-- (Since messages already have file_url, and we might use them for delivery, let's make sure the bucket is accessible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('message_attachments', 'message_attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public viewing of message_attachments" ON storage.objects;
CREATE POLICY "Allow public viewing of message_attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'message_attachments');

DROP POLICY IF EXISTS "Allow authenticated uploads to message_attachments" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to message_attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'message_attachments');
