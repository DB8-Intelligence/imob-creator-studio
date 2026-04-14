-- P1 — Fecha 6 policies RLS que estavam abertas ao role `public` apesar dos
-- nomes sugerirem service_role-only. Referência: QA Supervisor 2026-04-13.
--
-- Grupo A (zero regressão) — service_role only:
--   1. billing_events.billing_events_insert_service
--   4. notifications.notifications_insert_service
--   5. referral_events."Service role insert referral events"
--   6. referral_rewards."Service role insert rewards"
--
-- Grupo B (hardcoded admin UUID) — leitura do dashboard /dashboard/metrics
-- depende dessas tabelas via frontend (anon_key), então service_role-only
-- quebraria o front. Fechamos para o admin Douglas por UUID.
--   2. financial_config."Service role manages financial_config"
--   3. mrr_snapshots."Service role manages mrr_snapshots"
--
-- TODO: Migrar financial_config + mrr_snapshots pra RLS via users_roles.role='admin'
-- (option C) quando surgir segundo admin. Atualmente UUID hardcoded pra MVP.

-- ============================================================
-- Grupo A — service_role only
-- ============================================================

-- 1. billing_events
DROP POLICY IF EXISTS "billing_events_insert_service" ON public.billing_events;
CREATE POLICY "billing_events_insert_service_only" ON public.billing_events
  FOR INSERT TO service_role WITH CHECK (true);

-- 4. notifications
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service_only" ON public.notifications
  FOR INSERT TO service_role WITH CHECK (true);

-- 5. referral_events
DROP POLICY IF EXISTS "Service role insert referral events" ON public.referral_events;
CREATE POLICY "referral_events_insert_service_only" ON public.referral_events
  FOR INSERT TO service_role WITH CHECK (true);

-- 6. referral_rewards
DROP POLICY IF EXISTS "Service role insert rewards" ON public.referral_rewards;
CREATE POLICY "referral_rewards_insert_service_only" ON public.referral_rewards
  FOR INSERT TO service_role WITH CHECK (true);

-- ============================================================
-- Grupo B — admin UUID hardcoded (Douglas)
-- ============================================================

-- 2. financial_config
DROP POLICY IF EXISTS "Service role manages financial_config" ON public.financial_config;
CREATE POLICY "financial_config_admin_only" ON public.financial_config
  FOR ALL TO authenticated
  USING (auth.uid() = '0a320fe4-ccd2-40f6-8484-c440be4e9668'::uuid)
  WITH CHECK (auth.uid() = '0a320fe4-ccd2-40f6-8484-c440be4e9668'::uuid);

-- 3. mrr_snapshots
DROP POLICY IF EXISTS "Service role manages mrr_snapshots" ON public.mrr_snapshots;
CREATE POLICY "mrr_snapshots_admin_only" ON public.mrr_snapshots
  FOR ALL TO authenticated
  USING (auth.uid() = '0a320fe4-ccd2-40f6-8484-c440be4e9668'::uuid)
  WITH CHECK (auth.uid() = '0a320fe4-ccd2-40f6-8484-c440be4e9668'::uuid);
