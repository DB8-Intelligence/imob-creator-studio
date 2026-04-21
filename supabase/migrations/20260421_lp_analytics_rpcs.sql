-- ===========================================================
-- RPCs de analytics da landing_pages (views + leads)
-- SECURITY DEFINER para permitir incremento por anon (visitantes).
-- Só atualiza LPs ativas e não expiradas.
-- ===========================================================

CREATE OR REPLACE FUNCTION public.increment_lp_views(lp_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.landing_pages
    SET views_count = views_count + 1
    WHERE id = lp_id
      AND ativo = true
      AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_lp_leads(lp_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.landing_pages
    SET leads_count = leads_count + 1
    WHERE id = lp_id
      AND ativo = true
      AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_lp_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_lp_leads(UUID) TO anon, authenticated;

COMMENT ON FUNCTION public.increment_lp_views IS 'Incrementa views_count de uma LP ativa (chamavel por anon).';
COMMENT ON FUNCTION public.increment_lp_leads IS 'Incrementa leads_count de uma LP ativa (chamavel por anon).';
