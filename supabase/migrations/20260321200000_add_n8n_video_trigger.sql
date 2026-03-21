-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: n8n event dispatch for video_jobs status changes
-- When a video_job transitions to 'completed' or 'failed', automatically
-- call the n8n-bridge Edge Function via pg_net so n8n can run post-processing
-- (notifications, analytics, Instagram scheduling, etc.)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pg_net extension if not already enabled
create extension if not exists pg_net schema extensions;

-- ─── Helper function ─────────────────────────────────────────────────────────

create or replace function public.dispatch_video_job_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _event_type  text;
  _payload     jsonb;
  _edge_url    text;
  _service_key text;
begin
  -- Only fire on status transitions to completed or failed
  if NEW.status not in ('completed', 'failed') then
    return NEW;
  end if;
  if OLD.status = NEW.status then
    return NEW;
  end if;

  _event_type := case NEW.status
    when 'completed' then 'video_completed'
    when 'failed'    then 'video_failed'
  end;

  _payload := jsonb_build_object(
    'event_type', _event_type,
    'data', jsonb_build_object(
      'job_id',      NEW.id,
      'user_id',     NEW.user_id,
      'workspace_id',NEW.workspace_id,
      'status',      NEW.status,
      'output_url',  NEW.output_url,
      'error',       NEW.error_message,
      'duration_s',  extract(epoch from (NEW.updated_at - NEW.created_at))::int,
      'triggered_at',now()
    )
  );

  -- Edge Function URL — set via Supabase secrets as SUPABASE_URL
  _edge_url    := current_setting('app.supabase_url', true)
                  || '/functions/v1/n8n-bridge';
  _service_key := current_setting('app.service_role_key', true);

  -- Fire-and-forget HTTP call via pg_net
  perform extensions.http_post(
    _edge_url,
    _payload::text,
    'application/json',
    ARRAY[
      extensions.http_header('x-service-key', _service_key)
    ]
  );

  return NEW;
exception
  when others then
    -- Never block the main transaction; just log
    raise warning 'dispatch_video_job_event failed: %', sqlerrm;
    return NEW;
end;
$$;

-- ─── Trigger ─────────────────────────────────────────────────────────────────

drop trigger if exists trg_video_job_n8n_dispatch on public.video_jobs;

create trigger trg_video_job_n8n_dispatch
  after update of status on public.video_jobs
  for each row
  execute function public.dispatch_video_job_event();

comment on trigger trg_video_job_n8n_dispatch on public.video_jobs
  is 'Dispatches video_completed / video_failed events to n8n Central Router via n8n-bridge Edge Function';
