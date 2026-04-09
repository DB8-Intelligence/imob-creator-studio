CREATE TABLE public.creatives_gallery (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name   text NOT NULL,
  template_slug   text NOT NULL,
  status          text NOT NULL DEFAULT 'ready'
                  CHECK (status IN ('generating','ready','approved','scheduled','published','expired')),
  format_feed     text,
  format_story    text,
  format_square   text,
  format_reel     text,
  caption         text,
  hashtags        text,
  cta_text        text,
  scheduled_at    timestamptz,
  published_at    timestamptz,
  ig_post_id      text,
  fb_post_id      text,
  expires_at      timestamptz DEFAULT (now() + interval '24 hours'),
  property_id     uuid,
  credits_used    int DEFAULT 1,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.creatives_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manages_own_creatives"
  ON public.creatives_gallery FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_full_access"
  ON public.creatives_gallery FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_creatives_gallery_updated_at
  BEFORE UPDATE ON public.creatives_gallery
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_creatives_gallery_user_id ON public.creatives_gallery(user_id);
CREATE INDEX idx_creatives_gallery_status  ON public.creatives_gallery(status);
CREATE INDEX idx_creatives_gallery_expires ON public.creatives_gallery(expires_at);
