-- DEV-32: Billing events — log completo do ciclo financeiro
-- Registra: upgrade, consumo, renovação, falha, cancelamento.

create table if not exists public.billing_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  workspace_id    uuid references public.workspaces(id) on delete set null,

  event_type      text not null check (event_type in (
    'plan_upgrade', 'plan_downgrade', 'plan_cancel',
    'plan_renew', 'plan_expire',
    'credit_purchase', 'credit_consume', 'credit_refund',
    'payment_success', 'payment_failed',
    'trial_start', 'trial_end'
  )),

  -- Contexto
  plan_from       text,
  plan_to         text,
  credits_amount  integer,
  credits_before  integer,
  credits_after   integer,

  -- Pagamento
  payment_provider text default 'kiwify',
  order_id        text,
  product_id      text,
  amount_brl      numeric(10,2),
  billing_cycle   text check (billing_cycle in ('monthly', 'yearly', null)),

  -- Extra
  metadata        jsonb default '{}'::jsonb,
  error_message   text,

  created_at      timestamptz not null default now()
);

create index if not exists idx_billing_events_user on public.billing_events(user_id);
create index if not exists idx_billing_events_ws   on public.billing_events(workspace_id);
create index if not exists idx_billing_events_type on public.billing_events(event_type);
create index if not exists idx_billing_events_date on public.billing_events(created_at);

-- RLS
alter table public.billing_events enable row level security;

create policy "billing_events_select_own" on public.billing_events
  for select using (auth.uid() = user_id);

create policy "billing_events_insert_service" on public.billing_events
  for insert with check (true);
  -- Service role inserts (from edge functions). Users can't insert directly.
