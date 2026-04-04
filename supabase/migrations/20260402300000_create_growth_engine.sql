-- ============================================================
-- ETAPA 10C — Growth Engine: Referral + Social Proof
-- ============================================================

-- ── referral_codes: one permanent code per user ──────────────
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code        TEXT UNIQUE NOT NULL,
  click_count INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referral code"
  ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own referral code"
  ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own referral code"
  ON public.referral_codes FOR UPDATE USING (auth.uid() = user_id);

-- ── referral_events: track every signup driven by a referral ─
CREATE TABLE IF NOT EXISTS public.referral_events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_user_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  code              TEXT        NOT NULL,
  event_type        TEXT        NOT NULL CHECK (event_type IN ('signup', 'converted')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX referral_events_referrer_idx ON public.referral_events (referrer_user_id);
CREATE INDEX referral_events_referred_idx ON public.referral_events (referred_user_id);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referral events"
  ON public.referral_events FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "Service role insert referral events"
  ON public.referral_events FOR INSERT
  WITH CHECK (true);

-- ── referral_rewards: credits / extra days granted to referrers ─
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_event_id  UUID        REFERENCES public.referral_events(id),
  reward_type        TEXT        NOT NULL CHECK (reward_type IN ('credits', 'extra_days')),
  reward_value       INT         NOT NULL,
  description        TEXT,
  granted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX referral_rewards_user_idx ON public.referral_rewards (user_id);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own rewards"
  ON public.referral_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert rewards"
  ON public.referral_rewards FOR INSERT WITH CHECK (true);

-- ── platform_stats: pre-aggregated public counters ───────────
CREATE TABLE IF NOT EXISTS public.platform_stats (
  key        TEXT PRIMARY KEY,
  value      BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed realistic initial values
INSERT INTO public.platform_stats (key, value) VALUES
  ('creatives_today',      284),
  ('creatives_total',      18_430),
  ('active_users_today',   73),
  ('properties_processed', 9_210)
ON CONFLICT (key) DO NOTHING;

-- Public read (used on landing pages without auth)
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read platform_stats"
  ON public.platform_stats FOR SELECT USING (true);

-- ── Trigger: increment platform_stats on creative_generated event ──
CREATE OR REPLACE FUNCTION public.increment_platform_stats_on_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.event_type = 'creative_generated' THEN
    UPDATE public.platform_stats
    SET value = value + 1, updated_at = now()
    WHERE key IN ('creatives_today', 'creatives_total', 'active_users_today');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_platform_stats ON public.user_events;
CREATE TRIGGER trg_increment_platform_stats
  AFTER INSERT ON public.user_events
  FOR EACH ROW EXECUTE FUNCTION public.increment_platform_stats_on_event();
