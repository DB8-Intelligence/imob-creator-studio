CREATE TABLE IF NOT EXISTS public.import_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  type            text NOT NULL CHECK (type IN ('properties','clients','leads','full')),
  source_platform text,
  file_name       text,
  file_url        text,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','done','error')),
  total_records   int DEFAULT 0,
  imported_records int DEFAULT 0,
  failed_records  int DEFAULT 0,
  errors          jsonb DEFAULT '[]',
  preview_data    jsonb,
  confirmed       bool DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_manages_imports"
  ON public.import_jobs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  ));

CREATE POLICY "service_role_imports"
  ON public.import_jobs FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
