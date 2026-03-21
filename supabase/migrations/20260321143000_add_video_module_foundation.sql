create table if not exists public.video_plan_addons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  addon_type text not null check (addon_type in ('starter', 'pro', 'enterprise')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  credits_total integer,
  credits_used integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive', 'trial')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  title text not null,
  style text not null check (style in ('cinematic', 'moderno', 'luxury')),
  format text not null check (format in ('reels', 'feed', 'youtube')),
  duration_seconds integer not null check (duration_seconds in (15, 30, 60)),
  resolution text not null default '4K Ultra HD',
  status text not null default 'queued' check (status in ('draft', 'queued', 'processing', 'completed', 'failed')),
  photos_count integer not null default 0,
  credits_used integer not null default 0,
  output_url text,
  thumbnail_url text,
  metadata jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_video_jobs_workspace_id on public.video_jobs(workspace_id);
create index if not exists idx_video_jobs_property_id on public.video_jobs(property_id);
create index if not exists idx_video_jobs_status on public.video_jobs(status);
create index if not exists idx_video_plan_addons_workspace_id on public.video_plan_addons(workspace_id);

alter table public.video_plan_addons enable row level security;
alter table public.video_jobs enable row level security;

create policy "Members can view video add-ons"
  on public.video_plan_addons for select
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_plan_addons.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

create policy "Owners and admins can manage video add-ons"
  on public.video_plan_addons for all
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_plan_addons.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
        and wm.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_plan_addons.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
        and wm.status = 'active'
    )
  );

create policy "Members can view video jobs"
  on public.video_jobs for select
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_jobs.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

create policy "Editors can insert video jobs"
  on public.video_jobs for insert
  with check (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_jobs.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'editor', 'member')
        and wm.status = 'active'
    )
  );

create policy "Editors can update video jobs"
  on public.video_jobs for update
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_jobs.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'editor', 'member')
        and wm.status = 'active'
    )
  );

create trigger update_video_jobs_updated_at
  before update on public.video_jobs
  for each row execute function public.handle_updated_at();

create trigger update_video_plan_addons_updated_at
  before update on public.video_plan_addons
  for each row execute function public.handle_updated_at();

insert into public.video_plan_addons (workspace_id, addon_type, billing_cycle, credits_total, status)
select id,
       case when plan = 'credits' then 'starter' when plan = 'pro' then 'pro' else 'enterprise' end,
       'monthly',
       case when plan = 'credits' then 5 when plan = 'pro' then 20 else null end,
       'active'
from public.workspaces w
where not exists (
  select 1 from public.video_plan_addons vpa where vpa.workspace_id = w.id
);
