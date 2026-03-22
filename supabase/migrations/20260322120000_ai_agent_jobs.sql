-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: ai_agent_jobs table (adapted for ImobCreatorAI schema)
-- Two-phase job: phase 1 = market research + copywriting options,
--                phase 2 = final content generation (post/carousel/reel).
-- ─────────────────────────────────────────────────────────────────────────────

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.ai_agent_jobs (
  id              uuid primary key default gen_random_uuid(),
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
  n8n_execution_id text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_ai_agent_jobs_user_id
  on public.ai_agent_jobs(user_id);
create index if not exists idx_ai_agent_jobs_status
  on public.ai_agent_jobs(status);

-- ── updated_at trigger ────────────────────────────────────────────────────────

create trigger update_ai_agent_jobs_updated_at
  before update on public.ai_agent_jobs
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.ai_agent_jobs enable row level security;

create policy "Users can view own ai_agent_jobs"
  on public.ai_agent_jobs for select
  using (user_id = auth.uid());

create policy "Users can insert own ai_agent_jobs"
  on public.ai_agent_jobs for insert
  with check (user_id = auth.uid());

create policy "Users can update own ai_agent_jobs"
  on public.ai_agent_jobs for update
  using (user_id = auth.uid());

-- Service role (n8n callback via Supabase service key) bypasses RLS automatically.
