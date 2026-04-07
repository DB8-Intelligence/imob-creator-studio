-- DEV-36: Notifications table

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in (
    'generation_done', 'generation_error',
    'publication_done', 'publication_error',
    'automation_done', 'automation_error',
    'credit_low', 'plan_change', 'system'
  )),
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  link        text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read = false;

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

create policy "notifications_insert_service" on public.notifications
  for insert with check (true);

-- Realtime for instant delivery
alter publication supabase_realtime add table public.notifications;
