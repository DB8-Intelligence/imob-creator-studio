-- ===========================================================
-- Storage bucket para PDFs das landing pages (Etapa 3)
-- ===========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('lp-pdfs', 'lp-pdfs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "user_reads_own_lp_pdfs" ON storage.objects;
CREATE POLICY "user_reads_own_lp_pdfs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lp-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "service_role_lp_pdfs" ON storage.objects;
CREATE POLICY "service_role_lp_pdfs"
  ON storage.objects FOR ALL
  USING (bucket_id = 'lp-pdfs' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'lp-pdfs' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "signed_url_access_lp_pdfs" ON storage.objects;
CREATE POLICY "signed_url_access_lp_pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lp-pdfs');
