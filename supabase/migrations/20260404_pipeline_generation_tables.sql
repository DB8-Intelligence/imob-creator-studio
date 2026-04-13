-- ============================================================
-- Migration: Pipeline Generation Tables
-- Versiona as tabelas criadas pelo DEV-14 pipeline assíncrono.
--
-- Tabelas:
--   generation_jobs      — rastreia cada job de geração (pending → done/error)
--   generated_assets     — assets individuais produzidos por cada job
--   generation_logs      — log estruturado de eventos por job
--
-- Nota: estas tabelas podem já existir no banco de produção
-- (spjnymdizezgmzwoskoj / spjnymdizezgmzwoskoj). Esta migration
-- usa CREATE TABLE IF NOT EXISTS para ser idempotente.
-- ============================================================

-- ── generation_jobs ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id     uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  property_id      uuid REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Identificação do job
  generation_type  text NOT NULL,
  engine_id        text NOT NULL,
  use_case_id      text,
  template_id      text,
  template_name    text,

  -- Payload de entrada
  prompt_base      text,
  style            text,
  aspect_ratio     text,
  visual_style     text,
  editable_fields  jsonb,
  image_urls       text[],
  branding         jsonb,
  request_payload  jsonb,

  -- Controle de execução
  callback_mode    text NOT NULL DEFAULT 'async',
  callback_url     text,
  from_studio      boolean DEFAULT false,
  n8n_execution_id text,

  -- Estado
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','processing','done','error')),
  error_message    text,
  credits_consumed integer,

  -- Resultado
  result_url       text,
  result_urls      text[],
  preview_url      text,
  metadata         jsonb,

  -- Timestamps
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  completed_at     timestamptz
);

-- Índices de acesso frequente
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id
  ON public.generation_jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_workspace_id
  ON public.generation_jobs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status
  ON public.generation_jobs (status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at
  ON public.generation_jobs (created_at DESC);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_generation_jobs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generation_jobs_updated_at ON public.generation_jobs;
CREATE TRIGGER trg_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_generation_jobs_updated_at();

-- RLS
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own generation_jobs" ON public.generation_jobs;
CREATE POLICY "Users see own generation_jobs"
  ON public.generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own generation_jobs" ON public.generation_jobs;
CREATE POLICY "Users insert own generation_jobs"
  ON public.generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages generation_jobs" ON public.generation_jobs;
CREATE POLICY "Service role manages generation_jobs"
  ON public.generation_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Realtime: publicar alterações de status para o frontend
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_jobs;


-- ── generated_assets ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generated_assets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           uuid NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id     uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  property_id      uuid REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Asset
  asset_url        text NOT NULL,
  preview_url      text,
  storage_path     text,
  asset_type       text DEFAULT 'image',   -- image | video | text
  generation_type  text,
  engine_id        text,
  template_id      text,
  format           text,

  -- Dimensões (se imagem)
  width            integer,
  height           integer,
  file_size_bytes  bigint,

  -- Metadados extras
  metadata         jsonb,

  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_assets_job_id
  ON public.generated_assets (job_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_user_id
  ON public.generated_assets (user_id);
CREATE INDEX IF NOT EXISTS idx_generated_assets_created_at
  ON public.generated_assets (created_at DESC);

ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own generated_assets" ON public.generated_assets;
CREATE POLICY "Users see own generated_assets"
  ON public.generated_assets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages generated_assets" ON public.generated_assets;
CREATE POLICY "Service role manages generated_assets"
  ON public.generated_assets FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users delete own generated_assets" ON public.generated_assets;
CREATE POLICY "Users delete own generated_assets"
  ON public.generated_assets FOR DELETE
  USING (auth.uid() = user_id);


-- ── generation_logs ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generation_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     uuid NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  level      text NOT NULL DEFAULT 'info'
             CHECK (level IN ('debug','info','warn','error')),
  message    text NOT NULL,
  details    jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_job_id
  ON public.generation_logs (job_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at
  ON public.generation_logs (created_at DESC);

ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages generation_logs" ON public.generation_logs;
CREATE POLICY "Service role manages generation_logs"
  ON public.generation_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Usuários podem consultar logs dos seus próprios jobs
DROP POLICY IF EXISTS "Users see own generation_logs" ON public.generation_logs;
CREATE POLICY "Users see own generation_logs"
  ON public.generation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.generation_jobs j
      WHERE j.id = job_id AND j.user_id = auth.uid()
    )
  );
