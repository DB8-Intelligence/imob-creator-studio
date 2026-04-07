-- ============================================================
-- Migration: Automation Tables (DEV-26 / QA-26B)
--
-- Tabelas:
--   automation_rules  — regras de automação de conteúdo
--   automation_logs   — log de execução de cada disparo
--
-- Dependências:
--   auth.users, public.workspaces, public.properties
-- ============================================================

-- ── automation_rules ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.automation_rules (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id     uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  property_id      uuid REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Configuração da regra
  name             text NOT NULL,
  generation_type  text NOT NULL CHECK (generation_type IN ('post', 'video')),
  template_id      text,
  preset           text,
  mood             text,
  engine_id        text,
  frequency        text NOT NULL DEFAULT 'daily'
                   CHECK (frequency IN ('daily', 'weekly', 'manual')),
  is_active        boolean NOT NULL DEFAULT true,

  -- Timestamps
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id
  ON public.automation_rules (user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_workspace_id
  ON public.automation_rules (workspace_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active
  ON public.automation_rules (is_active) WHERE is_active = true;

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_automation_rules_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_automation_rules_updated_at ON public.automation_rules;
CREATE TRIGGER trg_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_automation_rules_updated_at();

-- RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own automation_rules" ON public.automation_rules;
CREATE POLICY "Users see own automation_rules"
  ON public.automation_rules FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own automation_rules" ON public.automation_rules;
CREATE POLICY "Users insert own automation_rules"
  ON public.automation_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own automation_rules" ON public.automation_rules;
CREATE POLICY "Users update own automation_rules"
  ON public.automation_rules FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own automation_rules" ON public.automation_rules;
CREATE POLICY "Users delete own automation_rules"
  ON public.automation_rules FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages automation_rules" ON public.automation_rules;
CREATE POLICY "Service role manages automation_rules"
  ON public.automation_rules FOR ALL
  USING (auth.role() = 'service_role');


-- ── automation_logs ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id    uuid NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'running', 'success', 'error')),
  asset_id         uuid REFERENCES public.generated_assets(id) ON DELETE SET NULL,
  job_id           uuid REFERENCES public.generation_jobs(id) ON DELETE SET NULL,
  error            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id
  ON public.automation_logs (automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status
  ON public.automation_logs (status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at
  ON public.automation_logs (created_at DESC);

-- Índice para deduplicação diária no automation-trigger
CREATE INDEX IF NOT EXISTS idx_automation_logs_dedup
  ON public.automation_logs (automation_id, created_at DESC)
  WHERE status IN ('pending', 'running', 'success');

-- RLS
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Usuários veem logs das suas próprias automações
DROP POLICY IF EXISTS "Users see own automation_logs" ON public.automation_logs;
CREATE POLICY "Users see own automation_logs"
  ON public.automation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.automation_rules r
      WHERE r.id = automation_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages automation_logs" ON public.automation_logs;
CREATE POLICY "Service role manages automation_logs"
  ON public.automation_logs FOR ALL
  USING (auth.role() = 'service_role');
