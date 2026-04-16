-- ============================================================
-- Migration: WhatsApp outbound messaging + flow builder support
--
-- Tables:
--   whatsapp_sent_messages — audit log for outgoing messages
--
-- Alter:
--   automation_rules — add nodes/edges/description for flow builder
-- ============================================================

-- ── whatsapp_sent_messages ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.whatsapp_sent_messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_phone           text NOT NULL,
  body               text NOT NULL,
  evolution_response jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_sent_user   ON public.whatsapp_sent_messages (user_id);
CREATE INDEX idx_whatsapp_sent_phone  ON public.whatsapp_sent_messages (to_phone);
CREATE INDEX idx_whatsapp_sent_date   ON public.whatsapp_sent_messages (created_at DESC);

ALTER TABLE public.whatsapp_sent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sent messages"
  ON public.whatsapp_sent_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages sent messages"
  ON public.whatsapp_sent_messages FOR ALL
  USING (auth.role() = 'service_role');

-- ── Extend automation_rules for flow builder ────────────────

ALTER TABLE public.automation_rules
  ADD COLUMN IF NOT EXISTS nodes       jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS edges       jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS description text;

-- Add RLS policy for workspace-scoped inbox reads
-- (existing policy is service_role only; add user read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'whatsapp_inbox'
      AND policyname = 'workspace_owner_reads_inbox'
  ) THEN
    CREATE POLICY "workspace_owner_reads_inbox"
      ON public.whatsapp_inbox FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.workspaces w
          WHERE w.id = workspace_id AND w.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
