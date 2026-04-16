-- ============================================================
-- Migration: Generic background jobs table
--
-- Complements existing generation_jobs/video_jobs with a
-- generic job tracker for restoration, upscale, and future
-- async processing pipelines.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id),
  job_type       text NOT NULL CHECK (job_type IN ('creative', 'video', 'restoration', 'upscale')),
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  input_data     jsonb,
  output_data    jsonb,
  progress       numeric NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message  text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  expires_at     timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_jobs_workspace ON public.jobs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user      ON public.jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status    ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_type      ON public.jobs (job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created   ON public.jobs (created_at DESC);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages jobs"
  ON public.jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Enable Realtime for job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
