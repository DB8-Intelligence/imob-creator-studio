-- ============================================================
-- Migration: Secretária Virtual 24h — Sprint 1
--
-- Adds:
--   * AI settings columns on user_whatsapp_instances (agent enabled + prompt)
--   * whatsapp_conversations (per-phone state + lead qualification + AI toggle)
--   * whatsapp_quick_replies (saved shortcuts for the corretor)
--   * whatsapp_inbox.ai_replied flag (tracks which messages the IA answered)
-- ============================================================

-- ── AI settings on user_whatsapp_instances ──────────────────

ALTER TABLE public.user_whatsapp_instances
  ADD COLUMN IF NOT EXISTS ai_enabled            bool   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_agent_name         text   DEFAULT 'Secretária Virtual',
  ADD COLUMN IF NOT EXISTS ai_agent_tone         text   DEFAULT 'profissional, claro e acolhedor',
  ADD COLUMN IF NOT EXISTS ai_custom_instructions text,
  ADD COLUMN IF NOT EXISTS ai_model              text   DEFAULT 'claude-sonnet-4-6';

-- ── whatsapp_conversations ──────────────────────────────────
-- Per-phone state: toggle IA, lead qualification snapshot, last-reply timestamp.
-- One row per (user_id, phone). Service role writes; owner reads.

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone                text NOT NULL,
  contact_name         text,
  ai_enabled           bool,                       -- NULL ⇒ herda do user_whatsapp_instances.ai_enabled
  lead_qualification   jsonb NOT NULL DEFAULT '{}',-- {intent, budget, region, property_type, urgency, confidence, notes}
  last_inbound_at      timestamptz,
  last_ai_reply_at     timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_wa_conversations_user  ON public.whatsapp_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_wa_conversations_phone ON public.whatsapp_conversations (user_id, phone);

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_reads_conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "owner_updates_ai_toggle"
  ON public.whatsapp_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_role_manages_conversations"
  ON public.whatsapp_conversations FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_wa_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── whatsapp_quick_replies ──────────────────────────────────
-- Respostas rápidas salvas por corretor. Usadas via /shortcut no chat.

CREATE TABLE IF NOT EXISTS public.whatsapp_quick_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shortcut    text NOT NULL CHECK (shortcut ~ '^[a-z0-9_-]{1,24}$'),
  label       text NOT NULL,
  body        text NOT NULL,
  usage_count int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, shortcut)
);

CREATE INDEX IF NOT EXISTS idx_wa_quick_replies_user ON public.whatsapp_quick_replies (user_id);

ALTER TABLE public.whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manages_quick_replies"
  ON public.whatsapp_quick_replies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_wa_quick_replies_updated_at
  BEFORE UPDATE ON public.whatsapp_quick_replies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── whatsapp_inbox.ai_replied ───────────────────────────────
-- Marker: true se a IA já respondeu essa mensagem.

ALTER TABLE public.whatsapp_inbox
  ADD COLUMN IF NOT EXISTS ai_replied bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_skipped_reason text;
