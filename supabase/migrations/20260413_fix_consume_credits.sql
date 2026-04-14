-- P0.1 — Reescreve consume_credits para operar em user_plans (fonte canônica)
-- Fixa o bug em que public.users tem 0 rows e qualquer conta não-MAX quebra.
--
-- Contexto:
-- - Sessão anterior migrou o sidebar para ler de user_plans/my_plan (commit 83c067f)
-- - public.users nunca é populada para usuários OAuth (não há trigger)
-- - consume_credits antiga lia de public.users -> "Usuário não encontrado" para todos
-- - credit_transactions.user_id também apontava para public.users (bug correlato)
--
-- Esta migration:
-- 1. Move a FK de credit_transactions.user_id para auth.users
-- 2. Reescreve consume_credits para operar em user_plans (retorno muda de int -> jsonb)
-- 3. Cria trigger on_auth_user_created que popula user_plans com trial 7 dias para novos users

-- ============================================================
-- 1. Corrige FK de credit_transactions para auth.users
-- ============================================================
ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_user_id_fkey;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- 2. Reescreve consume_credits
-- ============================================================
-- DROP necessário porque estamos trocando o tipo de retorno (integer -> jsonb)
DROP FUNCTION IF EXISTS public.consume_credits(uuid, integer);

CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_slug TEXT;
  v_plan_name TEXT;
  v_credits_total INTEGER;
  v_credits_used INTEGER;
  v_credits_remaining INTEGER;
  v_status TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT plan_slug, plan_name, credits_total, COALESCE(credits_used, 0), status, expires_at
  INTO v_plan_slug, v_plan_name, v_credits_total, v_credits_used, v_status, v_expires_at
  FROM public.user_plans
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_plan',
      'message', 'Usuário sem plano ativo. Faça upgrade para continuar.'
    );
  END IF;

  IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'plan_expired',
      'message', 'Seu plano expirou. Renove para continuar gerando.',
      'plan_slug', v_plan_slug,
      'expires_at', v_expires_at
    );
  END IF;

  IF v_status <> 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'plan_inactive',
      'message', 'Plano inativo. Entre em contato com o suporte.',
      'status', v_status
    );
  END IF;

  -- Plano MAX ou credits_total >= 999999 = ilimitado
  IF v_plan_slug = 'max' OR v_credits_total >= 999999 THEN
    INSERT INTO public.credit_transactions(user_id, order_id, type, amount, credits_after, description)
    VALUES (
      p_user_id,
      'consume_' || gen_random_uuid()::text,
      'consume',
      -p_amount,
      999999,
      'Geração (plano ilimitado)'
    );
    RETURN jsonb_build_object(
      'success', true,
      'unlimited', true,
      'credits_remaining', 999999,
      'credits_used', v_credits_used,
      'plan_slug', v_plan_slug,
      'plan_name', v_plan_name
    );
  END IF;

  -- Verifica saldo
  v_credits_remaining := v_credits_total - v_credits_used;

  IF v_credits_remaining < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'message', format('Créditos insuficientes. Disponível: %s, necessário: %s.', v_credits_remaining, p_amount),
      'credits_remaining', v_credits_remaining,
      'credits_total', v_credits_total,
      'plan_slug', v_plan_slug
    );
  END IF;

  -- Consome atomicamente
  UPDATE public.user_plans
  SET credits_used = credits_used + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  v_credits_used := v_credits_used + p_amount;
  v_credits_remaining := v_credits_total - v_credits_used;

  INSERT INTO public.credit_transactions(user_id, order_id, type, amount, credits_after, description)
  VALUES (
    p_user_id,
    'consume_' || gen_random_uuid()::text,
    'consume',
    -p_amount,
    v_credits_remaining,
    'Geração de conteúdo'
  );

  RETURN jsonb_build_object(
    'success', true,
    'unlimited', false,
    'credits_remaining', v_credits_remaining,
    'credits_used', v_credits_used,
    'credits_total', v_credits_total,
    'plan_slug', v_plan_slug,
    'plan_name', v_plan_name
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'unexpected',
    'message', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO service_role;

COMMENT ON FUNCTION public.consume_credits(UUID, INTEGER) IS
  'Consume credits from user_plans. Returns jsonb with success/error fields. Updated 2026-04-13 to use user_plans instead of public.users.';

-- ============================================================
-- 3. Trigger on_auth_user_created — evita regressão
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere trial em user_plans para novos usuários OAuth/email.
  -- Usa plan_slug='starter' porque o CHECK constraint só aceita starter/basico/pro/max.
  -- O plan_name='Trial 7 dias' diferencia semanticamente no UI (AppLayout lê plan_name primeiro).
  INSERT INTO public.user_plans (
    user_id, email, plan_slug, plan_name,
    credits_total, credits_used, status, activated_at, expires_at
  )
  VALUES (
    NEW.id, NEW.email, 'starter', 'Trial 7 dias',
    50, 0, 'active', NOW(), NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear criação de usuário por falha no trigger
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
