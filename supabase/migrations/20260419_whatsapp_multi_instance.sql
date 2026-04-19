-- ============================================================
-- 20260419_whatsapp_multi_instance.sql — Sprint 6: fundação multi-instance
--
-- Prepara schema para N WhatsApps por corretor (ex: "Principal", "Locação").
-- UI full-multi-list fica para quando houver demanda real.
--
-- Mudanças:
-- 1. Remove UNIQUE(user_id) — bloqueava 2+ linhas
-- 2. Adiciona UNIQUE(user_id, instance_name) — evita dup de nome Evolution
-- 3. Nova coluna friendly_name — alias que o corretor dá ao número
-- 4. Index em user_id para queries por user
--
-- Obs: whatsapp-ai-reply atualizada em paralelo para filtrar
-- settings por user_id + instance_name (antes era só user_id).
-- ============================================================

ALTER TABLE public.user_whatsapp_instances
  DROP CONSTRAINT IF EXISTS user_whatsapp_instances_user_id_key;

ALTER TABLE public.user_whatsapp_instances
  ADD CONSTRAINT user_whatsapp_instances_user_instance_unique
  UNIQUE (user_id, instance_name);

ALTER TABLE public.user_whatsapp_instances
  ADD COLUMN IF NOT EXISTS friendly_name text;

COMMENT ON COLUMN public.user_whatsapp_instances.friendly_name IS
  'Nome amigável dado pelo corretor (ex: "Principal", "Locação"). Exibido na UI.';

CREATE INDEX IF NOT EXISTS user_whatsapp_instances_user_idx
  ON public.user_whatsapp_instances (user_id);
