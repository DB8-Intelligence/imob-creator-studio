-- ===========================================================
-- RPC admin_stats() — SECURITY DEFINER retorna métricas globais da
-- plataforma (users, LPs, leads, bugs, sites). Só super_admin pode chamar.
-- ===========================================================

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  result jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'users_active_7d', (
      SELECT count(*) FROM auth.users
      WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
    ),
    'users_new_30d', (
      SELECT count(*) FROM auth.users
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'lps_html_active', (
      SELECT count(*) FROM public.landing_pages
      WHERE tipo = 'html' AND ativo = true
    ),
    'lps_pdf_valid', (
      SELECT count(*) FROM public.landing_pages
      WHERE tipo = 'pdf' AND (expires_at IS NULL OR expires_at > NOW())
    ),
    'lps_total', (SELECT count(*) FROM public.landing_pages),
    'lp_views_total', (SELECT COALESCE(SUM(views_count), 0) FROM public.landing_pages),
    'lp_leads_total', (SELECT COALESCE(SUM(leads_count), 0) FROM public.landing_pages),
    'imoveis_total', (SELECT count(*) FROM public.site_imoveis),
    'leads_30d', (
      SELECT count(*) FROM public.site_leads
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'leads_today', (
      SELECT count(*) FROM public.site_leads
      WHERE created_at > CURRENT_DATE
    ),
    'bugs_new', (SELECT count(*) FROM public.bug_reports WHERE status = 'new'),
    'bugs_investigating', (SELECT count(*) FROM public.bug_reports WHERE status = 'investigating'),
    'bugs_blockers_open', (
      SELECT count(*) FROM public.bug_reports
      WHERE severity = 'blocker' AND status IN ('new', 'investigating')
    ),
    'bugs_30d', (
      SELECT count(*) FROM public.bug_reports
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'sites_published', (
      SELECT count(*) FROM public.corretor_sites WHERE publicado = true
    ),
    'generated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;
