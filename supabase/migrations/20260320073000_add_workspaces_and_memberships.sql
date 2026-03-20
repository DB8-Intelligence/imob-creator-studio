-- Sprint 4 foundation: workspaces / memberships / roles

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid references auth.users(id) on delete set null,
  plan text not null default 'credits' check (plan in ('credits', 'pro', 'vip')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'editor', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'inactive')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (workspace_id, user_id)
);

alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;

create policy "Users can view their workspaces"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
    or owner_user_id = auth.uid()
  );

create policy "Users can create owned workspaces"
  on public.workspaces for insert
  with check (owner_user_id = auth.uid());

create policy "Workspace owners/admins can update workspaces"
  on public.workspaces for update
  using (
    owner_user_id = auth.uid()
    or exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
        and wm.status = 'active'
    )
  );

create policy "Users can view their memberships"
  on public.workspace_memberships for select
  using (user_id = auth.uid());

create policy "Workspace owners/admins can manage memberships"
  on public.workspace_memberships for all
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = workspace_memberships.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
        and wm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = workspace_memberships.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
        and wm.status = 'active'
    )
  );

alter table public.brands
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

alter table public.properties
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.templates
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.creatives
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

create index if not exists idx_workspace_memberships_user_id on public.workspace_memberships(user_id);
create index if not exists idx_workspace_memberships_workspace_id on public.workspace_memberships(workspace_id);
create index if not exists idx_brands_workspace_id on public.brands(workspace_id);
create index if not exists idx_properties_workspace_id on public.properties(workspace_id);
create index if not exists idx_templates_workspace_id on public.templates(workspace_id);
create index if not exists idx_creatives_workspace_id on public.creatives(workspace_id);

create trigger update_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

create trigger update_workspace_memberships_updated_at
  before update on public.workspace_memberships
  for each row execute function public.handle_updated_at();

create or replace function public.bootstrap_workspace_for_user(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
  profile_name text;
  workspace_slug text;
begin
  select coalesce(nullif(full_name, ''), 'Workspace') into profile_name
  from public.profiles
  where user_id = target_user_id;

  workspace_slug := lower(regexp_replace(coalesce(profile_name, 'workspace'), '[^a-zA-Z0-9]+', '-', 'g'));
  workspace_slug := trim(both '-' from workspace_slug);
  workspace_slug := coalesce(nullif(workspace_slug, ''), 'workspace') || '-' || substr(target_user_id::text, 1, 8);

  insert into public.workspaces (name, slug, owner_user_id)
  values (coalesce(profile_name, 'Meu Workspace'), workspace_slug, target_user_id)
  returning id into new_workspace_id;

  insert into public.workspace_memberships (workspace_id, user_id, role, status)
  values (new_workspace_id, target_user_id, 'owner', 'active')
  on conflict (workspace_id, user_id) do nothing;

  update public.brands
  set workspace_id = new_workspace_id,
      owner_user_id = coalesce(owner_user_id, target_user_id)
  where workspace_id is null;

  update public.properties
  set workspace_id = new_workspace_id
  where user_id = target_user_id and workspace_id is null;

  update public.creatives
  set workspace_id = new_workspace_id
  where user_id = target_user_id and workspace_id is null;

  update public.templates
  set workspace_id = new_workspace_id
  where workspace_id is null and is_system = false;

  return new_workspace_id;
end;
$$;

create or replace function public.ensure_workspace_for_current_user()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_workspace_id uuid;
begin
  select wm.workspace_id into existing_workspace_id
  from public.workspace_memberships wm
  where wm.user_id = auth.uid()
    and wm.status = 'active'
  order by wm.created_at asc
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  return public.bootstrap_workspace_for_user(auth.uid());
end;
$$;
