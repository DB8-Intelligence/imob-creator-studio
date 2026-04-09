-- User Plans table — stores Hotmart subscription data
-- Linked to auth.users via user_id, resolved by email at webhook time

CREATE TABLE public.user_plans (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email                   text NOT NULL,
  hotmart_subscription_id text UNIQUE,
  hotmart_transaction_id  text,
  plan_slug               text NOT NULL CHECK (plan_slug IN ('starter','basico','pro','max')),
  plan_name               text NOT NULL,
  credits_total           int NOT NULL DEFAULT 0,
  credits_used            int NOT NULL DEFAULT 0,
  status                  text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','canceled','refunded','pending')),
  activated_at            timestamptz DEFAULT now(),
  expires_at              timestamptz,
  canceled_at             timestamptz,
  hotmart_raw             jsonb,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_reads_own_plan"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_manages_plans"
  ON public.user_plans FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE VIEW public.my_plan AS
  SELECT
    plan_slug, plan_name, credits_total, credits_used,
    (credits_total - credits_used) AS credits_remaining,
    status, activated_at, expires_at
  FROM public.user_plans
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1;