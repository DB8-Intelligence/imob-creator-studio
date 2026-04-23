-- Instagram OAuth multi-tenant delta (2026-04-23)
-- 1) data_deletion_requests para rastrear pedidos Meta (art. 18 LGPD)
-- 2) social_accounts ganha coluna meta_user_id para lookup via signed_request

CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_user_id       text NOT NULL,
  confirmation_code  text NOT NULL UNIQUE,
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','rejected')),
  payload            jsonb,
  notes              text,
  created_at         timestamptz DEFAULT now(),
  completed_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status
  ON public.data_deletion_requests(status);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_meta_user_id
  ON public.data_deletion_requests(meta_user_id);

-- Service role only (admin operational table, no RLS needed on user side)
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access"
  ON public.data_deletion_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- social_accounts: adicionar meta_user_id para permitir deauth callback
-- localizar a conta correta via signed_request (payload.user_id)
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS meta_user_id text;

CREATE INDEX IF NOT EXISTS idx_social_accounts_meta_user_id
  ON public.social_accounts(meta_user_id);

-- page_id (Facebook Page) separado de account_id (IG Business ID)
-- porque publish-social precisa dos dois para Graph API
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS page_id text,
  ADD COLUMN IF NOT EXISTS page_access_token text;
