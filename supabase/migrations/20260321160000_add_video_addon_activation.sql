create or replace function public.activate_video_addon(
  target_workspace_id uuid,
  target_addon_type text,
  target_billing_cycle text default 'monthly'
)
returns public.video_plan_addons
language plpgsql
security definer
set search_path = public
as $$
declare
  membership_role text;
  addon_record public.video_plan_addons;
  allowed boolean := false;
begin
  select wm.role into membership_role
  from public.workspace_memberships wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
    and wm.status = 'active'
  limit 1;

  if membership_role is null or membership_role not in ('owner', 'admin') then
    raise exception 'workspace admin access required';
  end if;

  if target_addon_type not in ('starter', 'pro', 'enterprise') then
    raise exception 'invalid addon type';
  end if;

  if target_billing_cycle not in ('monthly', 'yearly') then
    raise exception 'invalid billing cycle';
  end if;

  if target_addon_type = 'starter' then
    allowed := true;
  elsif target_addon_type = 'pro' then
    allowed := exists (
      select 1 from public.workspaces w
      where w.id = target_workspace_id
        and w.plan in ('pro', 'vip')
    );
  elsif target_addon_type = 'enterprise' then
    allowed := exists (
      select 1 from public.workspaces w
      where w.id = target_workspace_id
        and w.plan = 'vip'
    );
  end if;

  if not allowed then
    raise exception 'workspace plan does not allow this video addon';
  end if;

  update public.video_plan_addons
  set status = 'inactive',
      updated_at = now()
  where workspace_id = target_workspace_id
    and status = 'active';

  insert into public.video_plan_addons (
    workspace_id,
    addon_type,
    billing_cycle,
    credits_total,
    credits_used,
    status,
    expires_at
  )
  values (
    target_workspace_id,
    target_addon_type,
    target_billing_cycle,
    case
      when target_addon_type = 'starter' then 5
      when target_addon_type = 'pro' then 20
      else null
    end,
    0,
    'active',
    null
  )
  returning * into addon_record;

  return addon_record;
end;
$$;
