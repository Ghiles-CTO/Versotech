create or replace function user_is_staff()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role like 'staff_%'
  );
end;
$$;

create or replace function user_linked_to_investor(target_investor_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from investor_users iu
    where iu.investor_id = target_investor_id
      and iu.user_id = auth.uid()
  );
end;
$$;

create or replace function user_has_deal_access(target_deal_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  if exists (
    select 1 from deal_memberships dm
    where dm.deal_id = target_deal_id
      and dm.user_id = auth.uid()
  ) then
    return true;
  end if;

  if exists (
    select 1 from deal_memberships dm
    join investor_users iu on iu.investor_id = dm.investor_id
    where dm.deal_id = target_deal_id
      and iu.user_id = auth.uid()
  ) then
    return true;
  end if;

  if exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.role like 'staff_%'
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- Migration 014: RLS policies for entities module

-- Enable RLS on new tables
alter table if exists entity_directors enable row level security;
alter table if exists entity_events enable row level security;

-- Staff-only access to entity_directors
drop policy if exists entity_directors_staff_read on entity_directors;
create policy entity_directors_staff_read on entity_directors for select
using (user_is_staff());

drop policy if exists entity_directors_staff_write on entity_directors;
create policy entity_directors_staff_write on entity_directors for all
using (user_is_staff())
with check (user_is_staff());

-- Staff-only access to entity_events (for now)
drop policy if exists entity_events_staff_read on entity_events;
create policy entity_events_staff_read on entity_events for select
using (user_is_staff());

drop policy if exists entity_events_staff_write on entity_events;
create policy entity_events_staff_write on entity_events for all
using (user_is_staff())
with check (user_is_staff());

-- Update documents policy to support entity_id tagging
drop policy if exists documents_read on documents;
create policy documents_read on documents for select
using (
  -- Entity-based access (vehicle-equivalent)
  (entity_id is not null and exists (
    select 1 from positions p
    join investor_users iu on iu.investor_id = p.investor_id
    where p.vehicle_id = documents.entity_id
    and iu.user_id = auth.uid()
  ))
  -- Legacy vehicle-based access
  or (vehicle_id is not null and exists (
    select 1 from positions p
    join investor_users iu on iu.investor_id = p.investor_id
    where p.vehicle_id = documents.vehicle_id
    and iu.user_id = auth.uid()
  ))
  -- Deal-scoped access
  or (deal_id is not null and user_has_deal_access(deal_id))
  -- Staff access
  or user_is_staff()
);

