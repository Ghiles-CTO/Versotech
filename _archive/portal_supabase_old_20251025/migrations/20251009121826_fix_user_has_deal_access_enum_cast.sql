-- Fix the user_has_deal_access function to cast enum to text before LIKE comparison
CREATE OR REPLACE FUNCTION public.user_has_deal_access(target_deal_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  -- Check if user has direct access to the deal
  if exists (
    select 1 from deal_memberships dm
    where dm.deal_id = target_deal_id
      and dm.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user's investor has access to the deal
  if exists (
    select 1 from deal_memberships dm
    join investor_users iu on iu.investor_id = dm.investor_id
    where dm.deal_id = target_deal_id
      and iu.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user is staff
  if exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  ) then
    return true;
  end if;

  return false;
end;
$function$;;
