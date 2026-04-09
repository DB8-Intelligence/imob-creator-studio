-- Site configuration per workspace
CREATE TABLE public.site_config (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     uuid REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE NOT NULL,
  subdomain        text UNIQUE,
  custom_domain    text,
  theme_slug       text DEFAULT 'brisa',
  primary_color    text DEFAULT '#1E3A8A',
  secondary_color  text DEFAULT '#F59E0B',
  logo_url         text,
  banner_urls      text[] DEFAULT '{}',
  popup_image_url  text,
  company_name     text,
  creci            text,
  phone1           text,
  phone2           text,
  whatsapp         text,
  email            text,
  address          text,
  about_text       text,
  seo_title        text,
  seo_description  text,
  seo_keywords     text[],
  google_analytics text,
  facebook_pixel   text,
  active_categories text[] DEFAULT '{}',
  show_price       bool DEFAULT true,
  show_address     bool DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_owner_manages_site"
  ON public.site_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE TRIGGER trg_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Property portal publication status
CREATE TABLE public.property_portals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  portal_slug  text NOT NULL,
  is_featured  bool DEFAULT false,
  last_sent_at timestamptz,
  status       text DEFAULT 'pending',
  UNIQUE(property_id, portal_slug)
);
ALTER TABLE public.property_portals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_portals" ON public.property_portals FOR ALL USING (auth.role() = 'service_role');
