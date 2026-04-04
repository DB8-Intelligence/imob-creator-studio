-- ============================================================
-- ETAPA 11B — Funnel Tracking + Onboarding Progress
-- ============================================================

-- ── onboarding_progress: per-user activation state ───────────
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steps_done    TEXT[]      NOT NULL DEFAULT '{}',
  activated_at  TIMESTAMPTZ,               -- set when all core steps complete
  dismissed     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding"
  ON public.onboarding_progress FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_onboarding_progress_updated_at ON public.onboarding_progress;
CREATE TRIGGER trg_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── funnel_metrics view: aggregate funnel from user_events ────
-- RLS on user_events already limits each user to their own rows,
-- so this view returns per-user funnel stats when queried by user.
CREATE OR REPLACE VIEW public.funnel_metrics_personal AS
SELECT
  user_id,
  MAX(CASE WHEN event_type = 'signup'           THEN created_at END) AS signup_at,
  MAX(CASE WHEN event_type = 'dashboard_viewed' THEN created_at END) AS first_login_at,
  MAX(CASE WHEN event_type = 'creative_generated'THEN created_at END) AS first_creative_at,
  MAX(CASE WHEN event_type = 'trial_start'      THEN created_at END) AS trial_start_at,
  MAX(CASE WHEN event_type = 'paid_conversion'  THEN created_at END) AS paid_at,
  COUNT(CASE WHEN event_type = 'creative_generated' THEN 1 END)       AS total_creatives,
  COUNT(CASE WHEN event_type = 'upgrade_viewed' THEN 1 END)           AS upgrade_views
FROM public.user_events
GROUP BY user_id;

-- ── user_events: add funnel event types to the event catalogue ─
-- (No schema change needed — event_type is free-text TEXT column.
--  New event types: 'upgrade_viewed', 'onboarding_step_completed',
--  'welcome_dismissed', 'first_share', 'brand_kit_created')
-- Index for funnel queries
CREATE INDEX IF NOT EXISTS user_events_funnel_idx
  ON public.user_events (user_id, event_type, created_at DESC);
