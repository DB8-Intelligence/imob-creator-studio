create table if not exists public.video_job_segments (
  id uuid primary key default gen_random_uuid(),
  video_job_id uuid not null references public.video_jobs(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sequence_index integer not null,
  source_image_path text,
  source_image_name text,
  clip_duration_seconds integer not null default 5,
  status text not null default 'pending' check (status in ('pending', 'queued', 'processing', 'completed', 'failed', 'skipped')),
  output_clip_url text,
  provider text,
  provider_job_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (video_job_id, sequence_index)
);

create index if not exists idx_video_job_segments_video_job_id on public.video_job_segments(video_job_id);
create index if not exists idx_video_job_segments_workspace_id on public.video_job_segments(workspace_id);
create index if not exists idx_video_job_segments_status on public.video_job_segments(status);

alter table public.video_job_segments enable row level security;

create policy "Members can view video job segments"
  on public.video_job_segments for select
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_job_segments.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

create policy "Editors can insert video job segments"
  on public.video_job_segments for insert
  with check (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_job_segments.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'editor', 'member')
        and wm.status = 'active'
    )
  );

create policy "Editors can update video job segments"
  on public.video_job_segments for update
  using (
    exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = video_job_segments.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'editor', 'member')
        and wm.status = 'active'
    )
  );

create trigger update_video_job_segments_updated_at
  before update on public.video_job_segments
  for each row execute function public.handle_updated_at();
