-- QA-FINAL: Observability tables — alert_events + system_metrics_snapshots

create table if not exists public.alert_events (
  id              uuid primary key default gen_random_uuid(),
  rule            text not null,
  severity        text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  status          text not null default 'active' check (status in ('active', 'acknowledged', 'resolved')),
  title           text not null,
  message         text not null,
  workspace_id    uuid references public.workspaces(id) on delete set null,
  metric          text,
  metric_value    numeric,
  threshold       numeric,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at     timestamptz
);

create index if not exists idx_alert_events_status  on public.alert_events(status) where status = 'active';
create index if not exists idx_alert_events_rule    on public.alert_events(rule);
create index if not exists idx_alert_events_created on public.alert_events(created_at desc);

alter table public.alert_events enable row level security;

create policy "alert_events_select" on public.alert_events
  for select using (
    workspace_id is null
    or workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "alert_events_insert" on public.alert_events
  for insert with check (true);

create policy "alert_events_update" on public.alert_events
  for update using (true);

-- system_metrics_snapshots
create table if not exists public.system_metrics_snapshots (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  value       numeric not null,
  unit        text not null default '',
  tags        jsonb default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists idx_sys_metrics_name on public.system_metrics_snapshots(name, captured_at desc);

alter table public.system_metrics_snapshots enable row level security;

create policy "sys_metrics_select" on public.system_metrics_snapshots
  for select using (true);

create policy "sys_metrics_insert" on public.system_metrics_snapshots
  for insert with check (true);
