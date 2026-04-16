-- Funnel events: write-only tracking log.
-- Frontend emits via anon key, backend emits via service_role.
-- Analysts read only via service_role (no public read).

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event      TEXT NOT NULL CHECK (length(event) BETWEEN 1 AND 64),
  email      TEXT,
  session_id TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.funnel_events IS
  'Write-only funnel tracking log. Frontend inserts via anon key; backend inserts via service_role. Read only by service_role.';

CREATE INDEX IF NOT EXISTS idx_funnel_events_event      ON public.funnel_events(event);
CREATE INDEX IF NOT EXISTS idx_funnel_events_email      ON public.funnel_events(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_funnel_events_session    ON public.funnel_events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON public.funnel_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_metadata   ON public.funnel_events USING GIN (metadata);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Anon + authenticated can INSERT any tracking event (public funnel).
-- CHECK on event length already prevents blatant abuse; further rate-limiting
-- at the edge if spam becomes a problem.
DROP POLICY IF EXISTS funnel_events_insert_public ON public.funnel_events;
CREATE POLICY funnel_events_insert_public ON public.funnel_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Nobody reads except service_role (no SELECT policy for public/authenticated).
DROP POLICY IF EXISTS funnel_events_service_all ON public.funnel_events;
CREATE POLICY funnel_events_service_all ON public.funnel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
