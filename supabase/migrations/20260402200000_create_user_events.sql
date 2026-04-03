-- ETAPA 9E: user_events table for analytics tracking
-- Stores every trackEvent() call with UTM metadata auto-enriched.

create table if not exists public.user_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  event_type   text not null,
  category     text not null default 'usage',
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists user_events_user_id_idx      on public.user_events (user_id);
create index if not exists user_events_event_type_idx   on public.user_events (event_type);
create index if not exists user_events_category_idx     on public.user_events (category);
create index if not exists user_events_created_at_idx   on public.user_events (created_at desc);
create index if not exists user_events_workspace_id_idx on public.user_events (workspace_id);

-- RLS: users can insert their own events; only service role reads all
alter table public.user_events enable row level security;

create policy "Users can insert own events"
  on public.user_events for insert
  with check (auth.uid() = user_id);

create policy "Users can read own events"
  on public.user_events for select
  using (auth.uid() = user_id);
