-- Rename video addon tiers: starter→standard, pro→plus, enterprise→premium
-- and update credit quotas to match new pricing (300/600/800 credits/month)

-- 1. Drop existing check constraint on addon_type
alter table public.video_plan_addons
  drop constraint if exists video_plan_addons_addon_type_check;

-- 2. Rename existing rows to new tier names
update public.video_plan_addons set addon_type = 'standard'  where addon_type = 'starter';
update public.video_plan_addons set addon_type = 'plus'      where addon_type = 'pro';
update public.video_plan_addons set addon_type = 'premium'   where addon_type = 'enterprise';

-- 3. Add new check constraint with updated tier names
alter table public.video_plan_addons
  add constraint video_plan_addons_addon_type_check
  check (addon_type in ('standard', 'plus', 'premium'));

-- 4. Update credits_total for active addons to new quota values
update public.video_plan_addons
set credits_total = case addon_type
  when 'standard' then 300
  when 'plus'     then 600
  when 'premium'  then null  -- premium: 800, kept as explicit or null for unlimited variant
  else credits_total
end
where status = 'active';

-- 5. Replace activate_video_addon with updated tier names and credit values
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
  credits_for_tier integer;
begin
  -- verify caller is owner or admin
  select wm.role into membership_role
  from public.workspace_memberships wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
    and wm.status = 'active'
  limit 1;

  if membership_role is null or membership_role not in ('owner', 'admin') then
    raise exception 'workspace admin access required';
  end if;

  if target_addon_type not in ('standard', 'plus', 'premium') then
    raise exception 'invalid addon type: must be standard, plus or premium';
  end if;

  if target_billing_cycle not in ('monthly', 'yearly') then
    raise exception 'invalid billing cycle';
  end if;

  -- resolve credit quota
  credits_for_tier := case target_addon_type
    when 'standard' then 300
    when 'plus'     then 600
    when 'premium'  then 800
    else null
  end;

  -- deactivate any current active addon for this workspace
  update public.video_plan_addons
  set status = 'inactive',
      updated_at = now()
  where workspace_id = target_workspace_id
    and status = 'active';

  -- insert new active addon
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
    credits_for_tier,
    0,
    'active',
    null
  )
  returning * into addon_record;

  return addon_record;
end;
$$;
