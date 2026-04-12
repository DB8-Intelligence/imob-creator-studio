-- Security hardening migration
-- Fixes critical advisors found in Supabase security audit (2026-04-12):
--   1. public.properties with RLS disabled (ERROR rls_disabled_in_public)
--   2. public.retargeting_segments exposes auth.users (ERROR auth_users_exposed)
--   3. Four views with SECURITY DEFINER bypassing caller RLS (ERROR security_definer_view)
--   4. public.funnel_metrics_personal missing user filter (design bug)

-- =========================================================================
-- 1. Enable RLS on public.properties + owner-scoped policies
-- =========================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Select: owner or workspace member
CREATE POLICY properties_select_own
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      workspace_id IS NOT NULL
      AND workspace_id IN (
        SELECT wm.workspace_id
        FROM public.workspace_memberships wm
        WHERE wm.user_id = auth.uid()
      )
    )
  );

-- Insert: only for own user_id, and if workspace provided it must be one the user belongs to
CREATE POLICY properties_insert_own
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      workspace_id IS NULL
      OR workspace_id IN (
        SELECT wm.workspace_id
        FROM public.workspace_memberships wm
        WHERE wm.user_id = auth.uid()
      )
    )
  );

-- Update: owner only
CREATE POLICY properties_update_own
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Delete: owner only
CREATE POLICY properties_delete_own
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role keeps full access automatically (bypasses RLS).

-- =========================================================================
-- 2. Drop retargeting_segments view (exposes auth.users emails to anon)
-- =========================================================================
-- This view is marketing/retargeting analytics. It belongs in an admin-only
-- schema or should be replaced by a server-side aggregate. Dropping is safe
-- because it was never secured and should not remain accessible.

DROP VIEW IF EXISTS public.retargeting_segments;

-- =========================================================================
-- 3. Recreate my_plan as SECURITY INVOKER (caller's privileges)
-- =========================================================================

DROP VIEW IF EXISTS public.my_plan;

CREATE VIEW public.my_plan
WITH (security_invoker = true)
AS
SELECT
  plan_slug,
  plan_name,
  credits_total,
  credits_used,
  (credits_total - credits_used) AS credits_remaining,
  status,
  activated_at,
  expires_at
FROM public.user_plans
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- =========================================================================
-- 4. Recreate my_modules as SECURITY INVOKER
-- =========================================================================

DROP VIEW IF EXISTS public.my_modules;

CREATE VIEW public.my_modules
WITH (security_invoker = true)
AS
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
WHERE w.owner_user_id = auth.uid()
  AND s.status = 'active';

-- =========================================================================
-- 5. Recreate funnel_metrics_personal as SECURITY INVOKER + caller filter
-- =========================================================================
-- Previous definition grouped by user_id without filtering, so any
-- authenticated caller could see every user's funnel metrics.

DROP VIEW IF EXISTS public.funnel_metrics_personal;

CREATE VIEW public.funnel_metrics_personal
WITH (security_invoker = true)
AS
SELECT
  user_id,
  max(CASE WHEN event_type = 'signup'              THEN created_at END) AS signup_at,
  max(CASE WHEN event_type = 'dashboard_viewed'    THEN created_at END) AS first_login_at,
  max(CASE WHEN event_type = 'creative_generated'  THEN created_at END) AS first_creative_at,
  max(CASE WHEN event_type = 'trial_start'         THEN created_at END) AS trial_start_at,
  max(CASE WHEN event_type = 'paid_conversion'     THEN created_at END) AS paid_at,
  count(CASE WHEN event_type = 'creative_generated' THEN 1 END)         AS total_creatives,
  count(CASE WHEN event_type = 'upgrade_viewed'     THEN 1 END)         AS upgrade_views
FROM public.user_events
WHERE user_id = auth.uid()
GROUP BY user_id;

-- =========================================================================
-- End of migration
-- =========================================================================
