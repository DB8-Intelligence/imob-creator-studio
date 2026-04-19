-- ============================================================
-- 20260419_ai_work_hours_delay.sql — Sprint 12b: Horário comercial + delay
--
-- Mudanças em user_whatsapp_instances:
-- 1. ai_work_hours_start/end (time) — janela em que IA responde
-- 2. ai_work_days (int[]) — dias ISO da semana: 1=seg, 7=dom
-- 3. ai_delay_min/max_seconds — delay aleatório antes de enviar (simula digitação)
-- 4. ai_after_hours_message — mensagem opcional enviada fora do horário
--
-- Impacto: whatsapp-ai-reply valida horário antes de responder e aplica
-- delay random. Evita "IA respondendo 3h da manhã" que vira reclame-aqui.
-- ============================================================

ALTER TABLE public.user_whatsapp_instances
  ADD COLUMN IF NOT EXISTS ai_work_hours_start time DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS ai_work_hours_end   time DEFAULT '19:00:00',
  ADD COLUMN IF NOT EXISTS ai_work_days        int[] DEFAULT ARRAY[1,2,3,4,5,6], -- seg–sab (1=seg, 7=dom ISO)
  ADD COLUMN IF NOT EXISTS ai_delay_min_seconds int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS ai_delay_max_seconds int DEFAULT 8,
  ADD COLUMN IF NOT EXISTS ai_after_hours_message text;

COMMENT ON COLUMN public.user_whatsapp_instances.ai_work_hours_start IS 'Horário início atendimento IA (timezone America/Sao_Paulo)';
COMMENT ON COLUMN public.user_whatsapp_instances.ai_work_hours_end   IS 'Horário fim atendimento IA';
COMMENT ON COLUMN public.user_whatsapp_instances.ai_work_days        IS 'Dias da semana (ISO: 1=seg...7=dom) em que IA responde';
COMMENT ON COLUMN public.user_whatsapp_instances.ai_delay_min_seconds IS 'Delay mínimo antes de enviar (simula digitação humana)';
COMMENT ON COLUMN public.user_whatsapp_instances.ai_delay_max_seconds IS 'Delay máximo antes de enviar';
COMMENT ON COLUMN public.user_whatsapp_instances.ai_after_hours_message IS 'Mensagem opcional enviada ao lead fora do horário comercial. Null = não responder.';
