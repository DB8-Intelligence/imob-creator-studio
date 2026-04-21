-- ===========================================================
-- Layout personalizado do Dashboard por usuário.
-- Guarda posições de widgets (react-grid-layout) em JSONB.
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS update_dashboard_layouts_updated_at ON public.dashboard_layouts;
CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON public.dashboard_layouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_manages_own_dashboard_layout" ON public.dashboard_layouts;
CREATE POLICY "user_manages_own_dashboard_layout"
  ON public.dashboard_layouts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "service_role_dashboard_layouts" ON public.dashboard_layouts;
CREATE POLICY "service_role_dashboard_layouts"
  ON public.dashboard_layouts FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.dashboard_layouts IS 'Layout personalizado do dashboard por usuario.';
