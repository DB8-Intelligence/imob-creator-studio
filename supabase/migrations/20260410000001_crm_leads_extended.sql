-- Extend leads table with campos usados pelo frontend (pipeline Kanban)
-- O frontend usa nomes em PT-BR; a tabela original usa EN. Adicionamos as colunas extras.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interesse_tipo text DEFAULT 'compra';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS imovel_interesse_id uuid REFERENCES public.properties(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS imovel_interesse_nome text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS valor_estimado numeric;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS temperatura text DEFAULT 'morno' CHECK (temperatura IN ('quente','morno','frio'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS corretor_responsavel uuid REFERENCES auth.users(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ultimo_contato timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Permitir status estendidos no pipeline (além de new/read/in_attendance/archived)
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('novo','contato_feito','visita_agendada','proposta_enviada','fechado','perdido',
                    'new','read','in_attendance','archived'));

-- Create lead_activities table para timeline de interações
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  tipo          text NOT NULL,
  descricao     text,
  resultado     text,
  proximo_passo text,
  metadata      jsonb,
  usuario_id    uuid REFERENCES auth.users(id),
  usuario_nome  text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_lead_activities" ON public.lead_activities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.workspaces w ON w.id = l.workspace_id
    WHERE l.id = lead_id AND w.owner_user_id = auth.uid()
  )
);
CREATE POLICY "service_role_lead_activities" ON public.lead_activities FOR ALL
  USING (auth.role() = 'service_role');

-- Extend appointments table with campos do frontend
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS lead_nome text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS lead_telefone text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS property_nome text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS property_endereco text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duracao text DEFAULT '1h';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'visita_presencial';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status text DEFAULT 'agendado';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS resultado text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS proximo_passo text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS corretor_responsavel uuid REFERENCES auth.users(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS observacoes_pos_visita text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS enviar_confirmacao bool DEFAULT true;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Triggers
CREATE OR REPLACE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
