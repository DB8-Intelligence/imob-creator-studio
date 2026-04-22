-- Criativos Pro — Sprint 1: schema delta.
--
-- Spec: docs/criativos-pro-spec.md
--
-- Pipeline end-to-end (foto no WhatsApp → Vision → copy/CTA → imagem → aprovação
-- bidirecional por WhatsApp → publicação Instagram) como módulo pago separado.
--
-- Esta migration prepara o schema; o pipeline em si (edge function pipeline-criativo
-- + fork em whatsapp-events + fallback via pg_cron) é Sprint 2-3.
--
-- Reutiliza infra existente: whatsapp-events (intake), creatives_gallery (jobs),
-- publish-social (Instagram Graph API), gerar-criativo (Gemini/DALL-E).

-- ── 1. creatives_gallery: aprovação bidirecional WhatsApp ───────────────────

ALTER TABLE public.creatives_gallery
  ADD COLUMN IF NOT EXISTS approval_deadline        timestamptz,
  ADD COLUMN IF NOT EXISTS approval_reminders_sent  int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id      text;

COMMENT ON COLUMN public.creatives_gallery.approval_deadline IS
  'Deadline pra corretor responder 👍/👎 no WhatsApp. pg_cron varre vencidos e envia fallback / expira.';
COMMENT ON COLUMN public.creatives_gallery.whatsapp_message_id IS
  'ID da mensagem Evolution enviada com preview. Usado pra casar resposta (quoted message) com o job certo.';

-- Status expandido: novos valores pra cobrir pipeline + aprovação WhatsApp.
--   analyzing        → Sprint 2: Vision + parse da caption em andamento
--   pending_approval → Sprint 3: preview enviado, aguardando 👍/👎 no WhatsApp
--   rejected         → Sprint 3: corretor rejeitou, retorna pra edição
--   error            → qualquer etapa do pipeline falhou
ALTER TABLE public.creatives_gallery
  DROP CONSTRAINT IF EXISTS creatives_gallery_status_check;

ALTER TABLE public.creatives_gallery
  ADD CONSTRAINT creatives_gallery_status_check CHECK (status IN (
    'analyzing',
    'generating',
    'pending_approval',
    'ready',
    'approved',
    'rejected',
    'scheduled',
    'published',
    'expired',
    'error'
  ));

CREATE INDEX IF NOT EXISTS idx_creatives_pending_deadline
  ON public.creatives_gallery(approval_deadline)
  WHERE status = 'pending_approval';

-- ── 2. module_id 'criativos_pro' em user_subscriptions + asaas_subscriptions ─

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_module_id_check;

ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_module_id_check
  CHECK (module_id = ANY (ARRAY[
    'criativos'::text, 'criativos_pro'::text, 'videos'::text, 'site'::text,
    'crm'::text, 'whatsapp'::text, 'social'::text,
    'saas'::text, 'addons'::text
  ]));

ALTER TABLE public.asaas_subscriptions
  DROP CONSTRAINT IF EXISTS asaas_subscriptions_module_id_check;

ALTER TABLE public.asaas_subscriptions
  ADD CONSTRAINT asaas_subscriptions_module_id_check
  CHECK (module_id = ANY (ARRAY[
    'criativos'::text, 'criativos_pro'::text, 'videos'::text, 'site'::text,
    'crm'::text, 'whatsapp'::text, 'social'::text,
    'saas'::text, 'addons'::text
  ]));
