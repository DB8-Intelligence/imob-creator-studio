-- ===========================================================
-- Storage bucket para screenshots anexados aos bug reports.
-- ===========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "bug_screenshots_user_upload" ON storage.objects;
CREATE POLICY "bug_screenshots_user_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bug-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "bug_screenshots_user_read_own" ON storage.objects;
CREATE POLICY "bug_screenshots_user_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bug-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "bug_screenshots_admin_read_all" ON storage.objects;
CREATE POLICY "bug_screenshots_admin_read_all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bug-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE admin_roles.user_id = auth.uid()
        AND admin_roles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "bug_screenshots_service_role" ON storage.objects;
CREATE POLICY "bug_screenshots_service_role"
  ON storage.objects FOR ALL
  USING (bucket_id = 'bug-screenshots' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'service_role');
