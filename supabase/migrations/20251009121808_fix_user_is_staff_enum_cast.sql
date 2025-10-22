-- Fix the user_is_staff function to cast enum to text before LIKE comparison
CREATE OR REPLACE FUNCTION public.user_is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  );
end;
$function$;;
