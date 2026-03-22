create or replace function public.consume_video_credit(target_workspace_id uuid)
returns public.video_plan_addons
language plpgsql
security definer
set search_path = public
as $$
declare
  addon_record public.video_plan_addons;
  membership_ok boolean;
  credit_cost integer;
begin
  select exists (
    select 1 from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ) into membership_ok;

  if not membership_ok then
    raise exception 'workspace access denied';
  end if;

  select * into addon_record
  from public.video_plan_addons vpa
  where vpa.workspace_id = target_workspace_id
    and vpa.status = 'active'
  order by vpa.created_at desc
  limit 1
  for update;

  if addon_record.id is null then
    raise exception 'video add-on not found';
  end if;

  credit_cost := case
    when addon_record.addon_type = 'premium' then 200
    else 100
  end;

  if addon_record.credits_total is null then
    update public.video_plan_addons
    set updated_at = now()
    where id = addon_record.id
    returning * into addon_record;

    return addon_record;
  end if;

  if addon_record.credits_used + credit_cost > addon_record.credits_total then
    raise exception 'video credits exhausted';
  end if;

  update public.video_plan_addons
  set credits_used = credits_used + credit_cost,
      updated_at = now()
  where id = addon_record.id
  returning * into addon_record;

  return addon_record;
end;
$$;

create or replace function public.release_video_credit(target_workspace_id uuid, credit_amount integer default null)
returns public.video_plan_addons
language plpgsql
security definer
set search_path = public
as $$
declare
  addon_record public.video_plan_addons;
  membership_ok boolean;
  rollback_amount integer;
begin
  select exists (
    select 1 from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ) into membership_ok;

  if not membership_ok then
    raise exception 'workspace access denied';
  end if;

  select * into addon_record
  from public.video_plan_addons vpa
  where vpa.workspace_id = target_workspace_id
    and vpa.status = 'active'
  order by vpa.created_at desc
  limit 1
  for update;

  if addon_record.id is null then
    raise exception 'video add-on not found';
  end if;

  if addon_record.credits_total is null then
    return addon_record;
  end if;

  rollback_amount := coalesce(credit_amount, case when addon_record.addon_type = 'premium' then 200 else 100 end);

  update public.video_plan_addons
  set credits_used = greatest(credits_used - rollback_amount, 0),
      updated_at = now()
  where id = addon_record.id
  returning * into addon_record;

  return addon_record;
end;
$$;
