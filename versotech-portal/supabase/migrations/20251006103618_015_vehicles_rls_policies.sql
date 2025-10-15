-- Migration 015: RLS policies for vehicles table
-- Description: Add proper RLS policies for vehicles table to allow staff access
-- Date: 2025-01-23

-- Drop existing policies if they exist
drop policy if exists vehicles_staff_read on vehicles;
drop policy if exists vehicles_staff_write on vehicles;
drop policy if exists vehicles_investor_read on vehicles;

-- Staff can read all vehicles
create policy vehicles_staff_read on vehicles for select
using (user_is_staff());

-- Staff can manage all vehicles
create policy vehicles_staff_write on vehicles for all
using (user_is_staff())
with check (user_is_staff());

-- Investors can read vehicles they have positions in
create policy vehicles_investor_read on vehicles for select
using (
  exists (
    select 1 from positions p
    join investor_users iu on iu.investor_id = p.investor_id
    where p.vehicle_id = vehicles.id
    and iu.user_id = auth.uid()
  )
);;
