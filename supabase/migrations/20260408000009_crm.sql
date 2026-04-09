-- CRM tables: clients, leads, attendances, activities, appointments

CREATE TABLE public.clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  company       text,
  email         text,
  phone_mobile  text,
  phone_mobile_has_whatsapp bool DEFAULT true,
  phone_commercial text,
  phone_residential text,
  first_contact_source text DEFAULT 'manual',
  avatar_url    text,
  notes         text,
  status        text DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE public.leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  client_id      uuid REFERENCES public.clients(id),
  property_id    uuid REFERENCES public.properties(id),
  name           text NOT NULL,
  email          text,
  phone          text,
  message        text,
  source         text DEFAULT 'manual',
  source_detail  text,
  status         text DEFAULT 'new'
                 CHECK (status IN ('new','read','in_attendance','archived')),
  assigned_to    uuid REFERENCES auth.users(id),
  read_at        timestamptz,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE public.attendances (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  lead_id        uuid REFERENCES public.leads(id),
  client_id      uuid REFERENCES public.clients(id),
  assigned_to    uuid REFERENCES auth.users(id) NOT NULL,
  stage          text DEFAULT 'waiting'
                 CHECK (stage IN (
                   'waiting','awaiting_return','in_attendance',
                   'visit_scheduled','proposal','contract','finished','canceled'
                 )),
  thermometer    int DEFAULT 0 CHECK (thermometer BETWEEN 0 AND 5),
  notes          text,
  stage_changed_at timestamptz DEFAULT now(),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE public.attendance_activities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES public.attendances(id) ON DELETE CASCADE NOT NULL,
  type          text NOT NULL CHECK (type IN ('note','email','call','whatsapp','property','task','stage_change','lead_received')),
  content       text,
  property_id   uuid REFERENCES public.properties(id),
  scheduled_at  timestamptz,
  done_at       timestamptz,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE public.appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  attendance_id    uuid REFERENCES public.attendances(id),
  property_id      uuid REFERENCES public.properties(id),
  client_id        uuid REFERENCES public.clients(id),
  title            text NOT NULL,
  scheduled_at     timestamptz NOT NULL,
  ends_at          timestamptz,
  notify_client    bool DEFAULT true,
  notify_broker    bool DEFAULT true,
  notify_owner     bool DEFAULT false,
  google_event_id  text,
  created_at       timestamptz DEFAULT now()
);

-- RLS for all CRM tables
DO $$ DECLARE tbl text;
BEGIN FOR tbl IN SELECT unnest(ARRAY['clients','leads','attendances','attendance_activities','appointments'])
LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('CREATE POLICY "workspace_crm_%I" ON public.%I FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  )', tbl, tbl);
  EXECUTE format('CREATE POLICY "service_role_crm_%I" ON public.%I FOR ALL USING (auth.role() = ''service_role'')', tbl, tbl);
END LOOP; END $$;

-- Triggers
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_attendances_updated_at BEFORE UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
