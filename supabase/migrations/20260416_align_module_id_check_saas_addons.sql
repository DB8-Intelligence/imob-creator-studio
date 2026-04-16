-- Alinha user_subscriptions + asaas_subscriptions com kiwify_products,
-- que já aceita 'saas' (NexoImob AI Professional TMeCHm5) e 'addons' (add-ons avulsos).
--
-- Antes desta migration, comprar o plano Professional pela Kiwify ou pelo Asaas
-- crashava o webhook com violação de CHECK constraint no upsert de user_subscriptions.
--
-- Descoberto durante a validação final do gate de venda em 2026-04-15/16
-- (ver memory project_gate_venda_status_2026_04_15.md).

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_module_id_check;

ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_module_id_check
  CHECK (module_id = ANY (ARRAY[
    'criativos'::text, 'videos'::text, 'site'::text,
    'crm'::text, 'whatsapp'::text, 'social'::text,
    'saas'::text, 'addons'::text
  ]));

ALTER TABLE public.asaas_subscriptions
  DROP CONSTRAINT IF EXISTS asaas_subscriptions_module_id_check;

ALTER TABLE public.asaas_subscriptions
  ADD CONSTRAINT asaas_subscriptions_module_id_check
  CHECK (module_id = ANY (ARRAY[
    'criativos'::text, 'videos'::text, 'site'::text,
    'crm'::text, 'whatsapp'::text, 'social'::text,
    'saas'::text, 'addons'::text
  ]));
