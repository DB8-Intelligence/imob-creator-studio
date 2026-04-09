CREATE TABLE public.user_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email                   text NOT NULL,
  module_id               text NOT NULL
                          CHECK (module_id IN (
                            'criativos','videos','site','crm','whatsapp','social'
                          )),
  plan_slug               text NOT NULL
                          CHECK (plan_slug IN ('starter','basico','pro','max')),
  plan_name               text NOT NULL,
  credits_total           int NOT NULL DEFAULT 0,
  credits_used            int NOT NULL DEFAULT 0,
  max_users               int NOT NULL DEFAULT 1,
  hotmart_subscription_id text UNIQUE,
  hotmart_transaction_id  text,
  hotmart_product_id      text,
  status                  text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','canceled','refunded','pending')),
  activated_at            timestamptz DEFAULT now(),
  expires_at              timestamptz,
  canceled_at             timestamptz,
  hotmart_raw             jsonb,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_reads_subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "service_role_manages_subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- View consolidada para o dashboard
CREATE VIEW public.my_modules AS
  SELECT
    s.module_id,
    s.plan_slug,
    s.plan_name,
    s.credits_total,
    s.credits_used,
    (s.credits_total - s.credits_used) AS credits_remaining,
    s.max_users,
    s.status,
    s.activated_at,
    s.expires_at
  FROM public.user_subscriptions s
  JOIN public.workspaces w ON w.id = s.workspace_id
  WHERE w.owner_id = auth.uid()
    AND s.status = 'active';
