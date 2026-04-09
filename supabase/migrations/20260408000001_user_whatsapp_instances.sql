-- User WhatsApp instances — each user connects their own number
-- via Evolution API, used for receiving property data from partners

CREATE TABLE public.user_whatsapp_instances (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  instance_name    text NOT NULL,
  instance_id      text,
  status           text NOT NULL DEFAULT 'disconnected'
                   CHECK (status IN ('disconnected','connecting','connected','error')),
  phone_number     text,
  profile_name     text,
  profile_picture  text,
  connected_at     timestamptz,
  disconnected_at  timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.user_whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manages_own_instance"
  ON public.user_whatsapp_instances FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_full_access"
  ON public.user_whatsapp_instances FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.user_whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
