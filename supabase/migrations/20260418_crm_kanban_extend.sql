-- ============================================================
-- 20260418_crm_kanban_extend.sql — Sprint 4: CRM Kanban + sync WhatsApp
--
-- Mudanças:
-- 1. Adiciona estágio 'visita_realizada' no CHECK de leads.status
-- 2. Adiciona whatsapp_conversation_id FK em leads
-- 3. Adiciona qualification_snapshot jsonb (cache da qualificação IA)
-- 4. Função upsert_lead_from_whatsapp() chamada pelo whatsapp-ai-reply
--
-- Obs: colunas reais são name/phone/source (frontend aliasa pra nome/telefone/fonte)
-- ============================================================

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN (
    'novo','contato_feito','visita_agendada','visita_realizada',
    'proposta_enviada','fechado','perdido',
    'new','read','in_attendance','archived'
  ));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS whatsapp_conversation_id uuid
    REFERENCES public.whatsapp_conversations(id) ON DELETE SET NULL;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS qualification_snapshot jsonb;

CREATE INDEX IF NOT EXISTS leads_whatsapp_conversation_idx
  ON public.leads (whatsapp_conversation_id)
  WHERE whatsapp_conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_phone_workspace_idx
  ON public.leads (workspace_id, phone)
  WHERE phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.upsert_lead_from_whatsapp(
  p_workspace_id       uuid,
  p_phone              text,
  p_contact_name       text,
  p_conversation_id    uuid,
  p_qualification      jsonb,
  p_booking_confirmed  boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id    uuid;
  v_temperatura text;
  v_urgency    text;
  v_intent     text;
  v_notes      text;
BEGIN
  v_urgency := COALESCE(p_qualification->>'urgency', 'desconhecida');
  v_intent  := COALESCE(p_qualification->>'intent',  'desconhecido');
  v_notes   := COALESCE(p_qualification->>'notes', '');

  v_temperatura := CASE v_urgency
    WHEN 'alta'  THEN 'quente'
    WHEN 'media' THEN 'morno'
    WHEN 'baixa' THEN 'frio'
    ELSE 'morno'
  END;

  SELECT id INTO v_lead_id
  FROM public.leads
  WHERE workspace_id = p_workspace_id
    AND phone        = p_phone
  LIMIT 1;

  IF v_lead_id IS NULL THEN
    INSERT INTO public.leads (
      workspace_id, name, phone, status, interesse_tipo,
      source, temperatura, notas, ultimo_contato,
      whatsapp_conversation_id, qualification_snapshot
    ) VALUES (
      p_workspace_id, COALESCE(p_contact_name, p_phone), p_phone,
      CASE WHEN p_booking_confirmed THEN 'visita_agendada' ELSE 'contato_feito' END,
      CASE WHEN v_intent = 'aluguel' THEN 'aluguel'
           WHEN v_intent = 'investimento' THEN 'compra'
           ELSE 'compra' END,
      'whatsapp', v_temperatura, NULLIF(v_notes, ''), now(),
      p_conversation_id, p_qualification
    ) RETURNING id INTO v_lead_id;
  ELSE
    UPDATE public.leads SET
      temperatura              = v_temperatura,
      ultimo_contato           = now(),
      whatsapp_conversation_id = COALESCE(leads.whatsapp_conversation_id, p_conversation_id),
      qualification_snapshot   = p_qualification,
      status = CASE
        WHEN p_booking_confirmed AND leads.status IN ('novo','contato_feito')
          THEN 'visita_agendada'
        ELSE leads.status
      END,
      updated_at = now()
    WHERE id = v_lead_id;
  END IF;

  RETURN v_lead_id;
END $$;

GRANT EXECUTE ON FUNCTION public.upsert_lead_from_whatsapp TO service_role;
