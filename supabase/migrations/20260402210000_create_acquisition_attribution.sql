-- ETAPA 10A: acquisition_attribution table
-- Stores first-touch UTM attribution for each user at signup.
-- ETAPA 10A+: last_utm_* columns for last-touch model (parallel, always overwrites).

create table if not exists public.acquisition_attribution (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  workspace_id   uuid references public.workspaces(id) on delete set null,

  -- First-touch columns
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_content    text,
  utm_term       text,
  landing_page   text,
  first_touch_at timestamptz,

  -- Last-touch columns (ETAPA 10A+)
  last_utm_source   text,
  last_utm_medium   text,
  last_utm_campaign text,
  last_utm_content  text,
  last_utm_term     text,
  last_touch_at     timestamptz,

  created_at timestamptz not null default now(),

  constraint acquisition_attribution_user_id_key unique (user_id)
);

create index if not exists attribution_user_id_idx    on public.acquisition_attribution (user_id);
create index if not exists attribution_utm_source_idx on public.acquisition_attribution (utm_source);
create index if not exists attribution_created_at_idx on public.acquisition_attribution (created_at desc);

alter table public.acquisition_attribution enable row level security;

create policy "Users can insert own attribution"
  on public.acquisition_attribution for insert
  with check (auth.uid() = user_id);

create policy "Users can update own attribution"
  on public.acquisition_attribution for update
  using (auth.uid() = user_id);

create policy "Users can read own attribution"
  on public.acquisition_attribution for select
  using (auth.uid() = user_id);
