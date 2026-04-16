-- Idempotency/dedupe registry for payment provider webhooks.
-- Composite key: ${provider}_${event_type}_${order_id} (built in edge function).
-- Populated by webhooks BEFORE processing; rolled back on processing error
-- so the provider's retry can attempt again.
--
-- Used by:
--   supabase/functions/kiwify-webhook/index.ts  (provider='kiwify')
--   supabase/functions/asaas-webhook/index.ts   (provider='asaas')

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id         TEXT PRIMARY KEY,
  provider   TEXT NOT NULL,
  event_type TEXT,
  order_id   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON public.webhook_events(order_id);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service_role writes. No public read (contains delivery metadata).
DROP POLICY IF EXISTS webhook_events_service_write ON public.webhook_events;
CREATE POLICY webhook_events_service_write ON public.webhook_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.webhook_events IS
  'Webhook delivery dedupe log. Row exists => event was processed. Rolled back by edge function on processing error so provider retries succeed.';
