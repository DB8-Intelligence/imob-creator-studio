-- ============================================================
-- iMobCreatorAI — WhatsApp → Instagram Pipeline (Plano Pro)
-- Fluxo: Corretor envia imagens/descritivo via WhatsApp
--        → sistema seleciona, faz upscale, analisa CTA,
--        → gera criativo, publica no Instagram/Facebook
-- ============================================================

-- 1. Configuração do WhatsApp por workspace (Plano Pro)
CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  phone_number          TEXT NOT NULL,                     -- número do corretor (ex: 5511999998888)
  evolution_instance    TEXT,                              -- nome da instância na Evolution API
  display_name          TEXT,                              -- nome de exibição no WhatsApp
  is_active             BOOLEAN NOT NULL DEFAULT true,
  webhook_secret        TEXT DEFAULT gen_random_uuid()::TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_whatsapp_workspace UNIQUE (workspace_id)
);

-- 2. Submissões recebidas via WhatsApp de corretores parceiros
CREATE TABLE IF NOT EXISTS public.partner_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  whatsapp_config_id    UUID REFERENCES public.whatsapp_configs(id) ON DELETE SET NULL,
  sender_phone          TEXT NOT NULL,                     -- quem enviou (parceiro)
  sender_name           TEXT,                              -- nome do parceiro (se disponível)
  raw_description       TEXT,                              -- descritivo bruto recebido
  refined_description   TEXT,                              -- descritivo refinado pela IA
  images_received       TEXT[] DEFAULT '{}',               -- URLs das imagens originais
  images_selected       TEXT[] DEFAULT '{}',               -- as 10 melhores selecionadas
  images_upscaled       TEXT[] DEFAULT '{}',               -- imagens após upscale
  cover_image_url       TEXT,                              -- imagem capa selecionada pelo corretor
  cta_options           JSONB DEFAULT '[]',                -- [{id, headline, subtext, style}]
  cta_selected          JSONB,                             -- opção aprovada pelo corretor
  creative_url          TEXT,                              -- URL do criativo gerado
  creative_preview_url  TEXT,                             -- URL do preview enviado ao corretor
  instagram_post_id     TEXT,                              -- ID do post publicado no Instagram
  facebook_post_id      TEXT,                              -- ID do post publicado no Facebook
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN (
      'received',       -- imagens/texto chegaram
      'processing',     -- selecionando e fazendo upscale
      'cta_pending',    -- aguardando corretor escolher CTA
      'cover_pending',  -- aguardando corretor escolher capa
      'generating',     -- gerando criativo
      'preview_sent',   -- preview enviado, aguardando aprovação final
      'publishing',     -- publicando nas redes sociais
      'published',      -- publicado com sucesso
      'failed',         -- falhou em alguma etapa
      'cancelled'       -- cancelado pelo corretor
    )),
  error_message         TEXT,
  whatsapp_message_id   TEXT,                              -- ID da mensagem inicial no WhatsApp
  n8n_execution_id      TEXT,                              -- ID da execução no n8n para rastreio
  credits_consumed      NUMERIC(6,2) DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Mídia individual de cada submissão (para rastreio detalhado)
CREATE TABLE IF NOT EXISTS public.partner_submission_media (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id         UUID NOT NULL REFERENCES public.partner_submissions(id) ON DELETE CASCADE,
  original_url          TEXT NOT NULL,
  upscaled_url          TEXT,
  quality_score         NUMERIC(4,2),                      -- 0-10 score da seleção de qualidade
  is_selected           BOOLEAN DEFAULT false,
  is_cover              BOOLEAN DEFAULT false,
  sort_order            INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Log de interações WhatsApp por submissão
CREATE TABLE IF NOT EXISTS public.partner_submission_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id         UUID NOT NULL REFERENCES public.partner_submissions(id) ON DELETE CASCADE,
  event_type            TEXT NOT NULL,                     -- 'message_received'|'cta_sent'|'cta_approved'|'preview_sent'|'published'|'error'
  direction             TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_text          TEXT,
  media_url             TEXT,
  whatsapp_message_id   TEXT,
  metadata              JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_configs_workspace  ON public.whatsapp_configs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_configs_phone      ON public.whatsapp_configs(phone_number);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_ws      ON public.partner_submissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_status  ON public.partner_submissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_sender  ON public.partner_submissions(sender_phone);
CREATE INDEX IF NOT EXISTS idx_partner_media_submission    ON public.partner_submission_media(submission_id);
CREATE INDEX IF NOT EXISTS idx_partner_events_submission   ON public.partner_submission_events(submission_id);

-- Updated_at automático
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_whatsapp_configs_updated_at
  BEFORE UPDATE ON public.whatsapp_configs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_partner_submissions_updated_at
  BEFORE UPDATE ON public.partner_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.whatsapp_configs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_submissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_submission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_submission_events ENABLE ROW LEVEL SECURITY;

-- Políticas: membro do workspace pode ver/editar
CREATE POLICY "workspace_member_whatsapp_configs"
  ON public.whatsapp_configs FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "workspace_member_partner_submissions"
  ON public.partner_submissions FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "workspace_member_partner_media"
  ON public.partner_submission_media FOR ALL
  USING (
    submission_id IN (
      SELECT ps.id FROM public.partner_submissions ps
      JOIN public.workspace_memberships wm ON wm.workspace_id = ps.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "workspace_member_partner_events"
  ON public.partner_submission_events FOR ALL
  USING (
    submission_id IN (
      SELECT ps.id FROM public.partner_submissions ps
      JOIN public.workspace_memberships wm ON wm.workspace_id = ps.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

-- Função para buscar config de WhatsApp por número de telefone (usada pelo webhook)
CREATE OR REPLACE FUNCTION public.get_whatsapp_config_by_phone(p_phone TEXT)
RETURNS TABLE(
  id UUID, workspace_id UUID, phone_number TEXT,
  evolution_instance TEXT, is_active BOOLEAN, workspace_plan TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT wc.id, wc.workspace_id, wc.phone_number, wc.evolution_instance,
         wc.is_active, w.plan::TEXT
  FROM public.whatsapp_configs wc
  JOIN public.workspaces w ON w.id = wc.workspace_id
  WHERE wc.phone_number = p_phone AND wc.is_active = true
  LIMIT 1;
$$;

-- Função para estatísticas do pipeline por workspace
CREATE OR REPLACE FUNCTION public.get_partner_submission_stats(p_workspace_id UUID)
RETURNS JSON LANGUAGE sql SECURITY DEFINER AS $$
  SELECT json_build_object(
    'total',       COUNT(*),
    'received',    COUNT(*) FILTER (WHERE status = 'received'),
    'processing',  COUNT(*) FILTER (WHERE status IN ('processing','cta_pending','cover_pending','generating','preview_sent')),
    'published',   COUNT(*) FILTER (WHERE status = 'published'),
    'failed',      COUNT(*) FILTER (WHERE status = 'failed')
  )
  FROM public.partner_submissions
  WHERE workspace_id = p_workspace_id
    AND created_at >= NOW() - INTERVAL '30 days';
$$;

-- Trigger: notificar n8n quando status muda em partner_submissions
CREATE OR REPLACE FUNCTION public.notify_partner_submission_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    PERFORM pg_notify(
      'partner_submission_status',
      json_build_object(
        'submission_id', NEW.id,
        'workspace_id',  NEW.workspace_id,
        'old_status',    OLD.status,
        'new_status',    NEW.status,
        'updated_at',    NEW.updated_at
      )::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partner_submission_notify
  AFTER UPDATE ON public.partner_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_partner_submission_status();
