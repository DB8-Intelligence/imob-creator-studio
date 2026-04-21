-- ===========================================================
-- Trigger AFTER INSERT em bug_reports: se severity='blocker',
-- dispara edge function bug-webhook-notify via net.http_post.
-- ===========================================================

CREATE OR REPLACE FUNCTION public.notify_blocker_bug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.severity = 'blocker' THEN
    PERFORM net.http_post(
      url := 'https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/bug-webhook-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_webhook_secret')
      ),
      body := jsonb_build_object('bug_id', NEW.id),
      timeout_milliseconds := 10000
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bug_reports_blocker_webhook ON public.bug_reports;
CREATE TRIGGER bug_reports_blocker_webhook
  AFTER INSERT ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_blocker_bug();
