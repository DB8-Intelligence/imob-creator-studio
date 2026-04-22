-- Criativos Pro — Sprint 3: pg_cron pro sweep de deadline.
--
-- Substitui o setTimeout(2min) do spec original (não persiste em edge
-- function Deno — invocação morre antes do timeout). A cada minuto o cron
-- chama criativos-sweep-deadline, que:
--   - Manda fallback texto pro corretor (até 2 tentativas, +3min cada)
--   - Marca job 'expired' após 2 tentativas sem resposta
--
-- Mesmo padrão do lp-pdfs-cleanup-daily (20260421_lp_pdfs_cleanup_cron.sql):
-- x-internal-secret validado pela edge function via vault.

SELECT cron.schedule(
  'criativos-sweep-deadline',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/criativos-sweep-deadline',
    headers := jsonb_build_object(
      'Content-Type',       'application/json',
      'x-internal-secret',  (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_webhook_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  ) AS request_id;
  $$
);
