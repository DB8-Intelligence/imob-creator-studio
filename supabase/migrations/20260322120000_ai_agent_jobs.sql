-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: ai_agent_jobs table
-- Stores async AI agent content-generation jobs triggered from the dashboard.
-- Two-phase job: phase 1 = market research + copywriting options,
--                phase 2 = final content generation (post/carousel/reel).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.ai_agent_jobs (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,

  -- Input provided by user at step 1
  topic           text not null,
  subtopic        text,
  format          text not null check (format in ('post', 'carousel', 'reel')),
  canal           text not null default 'instagram' check (canal in ('instagram', 'facebook')),

  -- Branding snapshot captured at job creation
  brand_snapshot  jsonb,

  -- Phase 1 outputs: 3 copywriting options from n8n Workflow 1
  options         jsonb,           -- array of { id, headline, body, cta, angle, research_sources }

  -- Phase 2 input: which option the client selected
  selected_option_id  text,

  -- Phase 2 output: generated content asset
  output_url      text,
  output_type     text check (output_type in ('post', 'carousel', 'reel')),
  output_metadata jsonb,

  -- Job lifecycle
  phase           integer not null default 1 check (phase in (1, 2)),
  status          text not null default 'queued'
                  check (status in ('queued', 'researching', 'awaiting_selection',
                                    'generating', 'completed', 'failed')),
  error_message   text,
  n8n_execution_id text,  -- for debugging / traceability

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_ai_agent_jobs_workspace_id
  on public.ai_agent_jobs(workspace_id);
create index if not exists idx_ai_agent_jobs_user_id
  on public.ai_agent_jobs(user_id);
create index if not exists idx_ai_agent_jobs_status
  on public.ai_agent_jobs(status);

-- ── updated_at trigger (reuses the existing handle_updated_at function) ──────

create trigger update_ai_agent_jobs_updated_at
  before update on public.ai_agent_jobs
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.ai_agent_jobs enable row level security;

-- Users can view their own jobs
create policy "Users can view own ai_agent_jobs"
  on public.ai_agent_jobs for select
  using (user_id = auth.uid());

-- Users can insert jobs for workspaces they belong to
create policy "Members can insert ai_agent_jobs"
  on public.ai_agent_jobs for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspace_memberships wm
      where wm.workspace_id = ai_agent_jobs.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

-- Users can update only their own jobs (for selecting an option in phase 2)
create policy "Users can update own ai_agent_jobs"
  on public.ai_agent_jobs for update
  using (user_id = auth.uid());

-- Service role (n8n callback via Supabase service key) can update any job
-- This is handled through the service_role key used by n8n, which bypasses RLS.
-- No additional policy needed; service_role always bypasses RLS in Supabase.
