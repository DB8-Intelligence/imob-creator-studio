-- DEV-29B: Publication queue + logs tables
-- Fila de publicação e rastreio de ações por canal

-- ─── publication_queue ────────────────────────────────────────────────────

create table if not exists public.publication_queue (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  asset_id        uuid references public.generated_assets(id) on delete set null,
  content_feed_id text,
  channel         text not null check (channel in (
    'instagram_feed', 'instagram_stories', 'instagram_reels',
    'facebook', 'whatsapp', 'tiktok', 'linkedin'
  )),
  status          text not null default 'queued' check (status in (
    'queued', 'publishing', 'published', 'error', 'cancelled'
  )),
  caption         text,
  scheduled_at    timestamptz,
  published_at    timestamptz,
  error_message   text,
  retry_count     integer not null default 0,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_pub_queue_workspace   on public.publication_queue(workspace_id);
create index if not exists idx_pub_queue_user        on public.publication_queue(user_id);
create index if not exists idx_pub_queue_status      on public.publication_queue(status);
create index if not exists idx_pub_queue_scheduled   on public.publication_queue(scheduled_at)
  where status = 'queued';
create index if not exists idx_pub_queue_asset       on public.publication_queue(asset_id)
  where asset_id is not null;

-- ─── publication_logs ─────────────────────────────────────────────────────

create table if not exists public.publication_logs (
  id              uuid primary key default gen_random_uuid(),
  publication_id  uuid not null references public.publication_queue(id) on delete cascade,
  action          text not null check (action in (
    'created', 'scheduled', 'publish_started', 'publish_success',
    'publish_error', 'retry', 'cancelled'
  )),
  status          text not null check (status in (
    'queued', 'publishing', 'published', 'error', 'cancelled'
  )),
  payload         jsonb,
  response        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pub_logs_publication on public.publication_logs(publication_id);
create index if not exists idx_pub_logs_action      on public.publication_logs(action);

-- ─── RLS ──────────────────────────────────────────────────────────────────

alter table public.publication_queue enable row level security;
alter table public.publication_logs  enable row level security;

-- publication_queue: users see only their own workspace items
create policy "pub_queue_select_own" on public.publication_queue
  for select using (
    auth.uid() = user_id
    or workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "pub_queue_insert_own" on public.publication_queue
  for insert with check (
    auth.uid() = user_id
  );

create policy "pub_queue_update_own" on public.publication_queue
  for update using (
    auth.uid() = user_id
    or workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "pub_queue_delete_own" on public.publication_queue
  for delete using (
    auth.uid() = user_id
  );

-- publication_logs: users see logs of their own publications
create policy "pub_logs_select_own" on public.publication_logs
  for select using (
    publication_id in (
      select pq.id from public.publication_queue pq
      where pq.user_id = auth.uid()
        or pq.workspace_id in (
          select wm.workspace_id from public.workspace_members wm
          where wm.user_id = auth.uid()
        )
    )
  );

create policy "pub_logs_insert_own" on public.publication_logs
  for insert with check (
    publication_id in (
      select pq.id from public.publication_queue pq
      where pq.user_id = auth.uid()
    )
  );

-- Service role bypass (for edge functions / n8n callbacks)
-- Service role key bypasses RLS by default in Supabase

-- ─── updated_at trigger ───────────────────────────────────────────────────

create or replace function public.update_publication_queue_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_pub_queue_updated_at
  before update on public.publication_queue
  for each row
  execute function public.update_publication_queue_updated_at();

-- ─── Realtime ─────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.publication_queue;
