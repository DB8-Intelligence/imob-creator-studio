-- ===========================================================
-- Bug reports / sugestões enviados via widget in-app
-- User: CRUD dos próprios. Super admin: lê todos + atualiza status.
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'bug'
    CHECK (severity IN ('blocker', 'bug', 'suggestion')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'investigating', 'fixed', 'wont_fix')),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status_date
  ON public.bug_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity_status
  ON public.bug_reports(severity, status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_date
  ON public.bug_reports(user_id, created_at DESC);

DROP TRIGGER IF EXISTS bug_reports_updated_at ON public.bug_reports;
CREATE TRIGGER bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bugs_own_read" ON public.bug_reports;
CREATE POLICY "bugs_own_read"
  ON public.bug_reports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bugs_own_insert" ON public.bug_reports;
CREATE POLICY "bugs_own_insert"
  ON public.bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bugs_admin_read_all" ON public.bug_reports;
CREATE POLICY "bugs_admin_read_all"
  ON public.bug_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE admin_roles.user_id = auth.uid()
        AND admin_roles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "bugs_admin_update" ON public.bug_reports;
CREATE POLICY "bugs_admin_update"
  ON public.bug_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE admin_roles.user_id = auth.uid()
        AND admin_roles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "bugs_service_role_all" ON public.bug_reports;
CREATE POLICY "bugs_service_role_all"
  ON public.bug_reports FOR ALL
  USING (auth.role() = 'service_role');
