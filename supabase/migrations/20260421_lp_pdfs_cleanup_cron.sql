-- ===========================================================
-- Cron diário que remove PDFs expirados (tipo=pdf, expires_at < now)
-- Chama a edge function cleanup-expired-lp-pdfs toda madrugada (3h UTC)
-- ===========================================================

SELECT cron.schedule(
  'lp-pdfs-cleanup-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/cleanup-expired-lp-pdfs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_webhook_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);
