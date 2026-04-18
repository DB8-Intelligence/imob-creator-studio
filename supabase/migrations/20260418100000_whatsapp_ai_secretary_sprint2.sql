-- ============================================================
-- Migration: Secretária Virtual 24h — Sprint 2
--
-- Adds:
--   * calendar_integrations — tokens OAuth Google por usuário
--   * calendar_events — eventos criados pela IA (linkados a conversa)
--   * whatsapp_conversations.next_followup_at/followup_count/followup_paused
--   * whatsapp_followup_log — audit de follow-ups enviados pela IA
-- ============================================================

-- ── calendar_integrations ───────────────────────────────────
-- Um registro por user_id (primary calendar do Google). Tokens armazenados
-- apenas com acesso service_role; nunca expostos ao client.

CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  user_id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider           text NOT NULL DEFAULT 'google',
  access_token       text NOT NULL,
  refresh_token      text,
  token_expires_at   timestamptz,
  calendar_id        text NOT NULL DEFAULT 'primary',
  email              text,
  scope              text,
  connected_at       timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Owner read-only (to know if connected); NEVER expose tokens via PostgREST.
-- Workaround: owner reads a VIEW that omits tokens.
CREATE POLICY "service_role_manages_calendar_integrations"
  ON public.calendar_integrations FOR ALL
  USING (auth.role() = 'service_role');

-- Public view (no tokens exposed)
CREATE OR REPLACE VIEW public.calendar_integration_status AS
SELECT
  user_id,
  provider,
  calendar_id,
  email,
  scope,
  connected_at,
  updated_at,
  (token_expires_at > now()) AS token_valid
FROM public.calendar_integrations;

GRANT SELECT ON public.calendar_integration_status TO authenticated;
-- The view inherits RLS from the base table? No — views don't auto-inherit.
-- Recreate with row_security applied via security_invoker.
ALTER VIEW public.calendar_integration_status SET (security_invoker = on);

-- owner_reads_status policy on the base table for the view to filter
CREATE POLICY "owner_reads_calendar_integration"
  ON public.calendar_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── calendar_events ─────────────────────────────────────────
-- Eventos criados pela IA. Link para conversa para rastrear contexto.

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id   uuid REFERENCES public.whatsapp_conversations(id) ON DELETE SET NULL,
  phone             text,
  google_event_id   text,
  summary           text NOT NULL,
  description       text,
  location          text,
  start_at          timestamptz NOT NULL,
  end_at            timestamptz NOT NULL,
  status            text NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','cancelled','completed','no_show')),
  created_by        text NOT NULL DEFAULT 'ai'
                      CHECK (created_by IN ('ai','manual')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user  ON public.calendar_events (user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON public.calendar_events (user_id, start_at);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_reads_calendar_events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "owner_manages_manual_calendar_events"
  ON public.calendar_events FOR ALL
  USING (auth.uid() = user_id AND created_by = 'manual')
  WITH CHECK (auth.uid() = user_id AND created_by = 'manual');

CREATE POLICY "service_role_manages_calendar_events"
  ON public.calendar_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── whatsapp_conversations: follow-up fields ────────────────
-- next_followup_at: quando o runner deve tentar reengajar
-- followup_count: quantos follow-ups já foram enviados (cap em 3)
-- followup_paused: corretor pausou follow-ups dessa conversa

ALTER TABLE public.whatsapp_conversations
  ADD COLUMN IF NOT EXISTS next_followup_at  timestamptz,
  ADD COLUMN IF NOT EXISTS followup_count    int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followup_paused   bool NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_wa_conversations_next_followup
  ON public.whatsapp_conversations (next_followup_at)
  WHERE next_followup_at IS NOT NULL AND NOT followup_paused;

-- ── whatsapp_followup_log ───────────────────────────────────
-- Audit: cada follow-up disparado (ou tentado) pelo runner.

CREATE TABLE IF NOT EXISTS public.whatsapp_followup_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id  uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  phone            text NOT NULL,
  body             text,
  status           text NOT NULL DEFAULT 'sent'
                     CHECK (status IN ('sent','skipped','failed')),
  skipped_reason   text,
  triggered_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_followup_log_user ON public.whatsapp_followup_log (user_id, triggered_at DESC);

ALTER TABLE public.whatsapp_followup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_reads_followup_log"
  ON public.whatsapp_followup_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_manages_followup_log"
  ON public.whatsapp_followup_log FOR ALL
  USING (auth.role() = 'service_role');

-- ── user_whatsapp_instances: followup settings ──────────────

ALTER TABLE public.user_whatsapp_instances
  ADD COLUMN IF NOT EXISTS followup_enabled    bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS followup_delay_hours int NOT NULL DEFAULT 48
    CHECK (followup_delay_hours BETWEEN 6 AND 168),
  ADD COLUMN IF NOT EXISTS followup_max_attempts int NOT NULL DEFAULT 2
    CHECK (followup_max_attempts BETWEEN 1 AND 5);
