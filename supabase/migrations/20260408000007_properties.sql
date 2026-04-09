-- Properties table — main real estate listings
CREATE TABLE public.properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  reference       text UNIQUE,
  type            text,
  category        text,
  purpose         text,
  pretension      text DEFAULT 'venda',
  price           numeric,
  price_per_sqm   numeric,
  bedrooms        int,
  suites          int,
  parking         int,
  area_built      numeric,
  address         jsonb DEFAULT '{}',
  lat             float,
  lng             float,
  photos          text[] DEFAULT '{}',
  description     text,
  amenities       text[] DEFAULT '{}',
  status          text DEFAULT 'draft'
                  CHECK (status IN ('draft','pending_approval','active','archived','sold')),
  published_site  bool DEFAULT false,
  portals_feed    bool DEFAULT false,
  source          text DEFAULT 'manual'
                  CHECK (source IN ('whatsapp','manual','upload','link')),
  source_contact  text,
  source_phone    text,
  captured_by     uuid REFERENCES auth.users(id),
  ai_extracted    jsonb,
  seo_title       text,
  seo_description text,
  seo_keywords    text[],
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_manages_properties"
  ON public.properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );
CREATE POLICY "service_role_properties"
  ON public.properties FOR ALL USING (auth.role() = 'service_role');

-- Auto-reference: CA00001, AP00001, TE00001...
CREATE OR REPLACE FUNCTION public.generate_property_reference()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  prefix text;
  seq    int;
BEGIN
  prefix := CASE COALESCE(NEW.type, '')
    WHEN 'Apartamento' THEN 'AP'
    WHEN 'Terreno'     THEN 'TE'
    WHEN 'Sala'        THEN 'SA'
    ELSE 'CA'
  END;
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 3) AS int)), 0) + 1
    INTO seq FROM public.properties
   WHERE reference LIKE prefix || '%' AND workspace_id = NEW.workspace_id;
  NEW.reference := prefix || LPAD(seq::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_property_reference
  BEFORE INSERT ON public.properties
  FOR EACH ROW WHEN (NEW.reference IS NULL)
  EXECUTE FUNCTION public.generate_property_reference();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WhatsApp message inbox
CREATE TABLE public.whatsapp_inbox (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  instance_name text NOT NULL,
  from_phone    text NOT NULL,
  from_name     text,
  message_type  text,
  message_text  text,
  media_urls    text[] DEFAULT '{}',
  processed     bool DEFAULT false,
  property_id   uuid REFERENCES public.properties(id),
  received_at   timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_inbox" ON public.whatsapp_inbox FOR ALL USING (auth.role() = 'service_role');
