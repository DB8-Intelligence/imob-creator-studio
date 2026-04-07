-- DEV-30: Channel connections — credenciais por workspace para publicação
-- Armazena tokens de canais (Instagram, Facebook, WhatsApp) de forma segura.
-- Tokens são criptografados em trânsito (HTTPS) e acessíveis apenas via service role.

create table if not exists public.channel_connections (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  channel         text not null check (channel in (
    'instagram_feed', 'instagram_stories', 'instagram_reels',
    'facebook', 'whatsapp', 'tiktok', 'linkedin'
  )),
  is_active       boolean not null default true,
  display_name    text,

  -- Instagram / Facebook (Meta Graph API)
  ig_user_id      text,
  ig_access_token text,
  page_id         text,
  page_access_token text,

  -- WhatsApp (Evolution API v2)
  evolution_instance_name text,
  evolution_api_key       text,
  evolution_phone         text,

  -- Generic
  credentials     jsonb default '{}'::jsonb,
  metadata        jsonb default '{}'::jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- One active connection per channel per workspace
  unique(workspace_id, channel)
);

create index if not exists idx_chan_conn_workspace on public.channel_connections(workspace_id);
create index if not exists idx_chan_conn_active    on public.channel_connections(workspace_id, channel)
  where is_active = true;

-- RLS: users see only their workspace connections
alter table public.channel_connections enable row level security;

create policy "chan_conn_select_own" on public.channel_connections
  for select using (
    workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "chan_conn_insert_own" on public.channel_connections
  for insert with check (
    workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "chan_conn_update_own" on public.channel_connections
  for update using (
    workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

create policy "chan_conn_delete_own" on public.channel_connections
  for delete using (
    workspace_id in (
      select wm.workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

-- updated_at trigger
create trigger trg_chan_conn_updated_at
  before update on public.channel_connections
  for each row
  execute function public.update_publication_queue_updated_at();
