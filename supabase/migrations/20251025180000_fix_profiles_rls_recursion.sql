-- Migration: Fix infinite recursion in profiles RLS policies
-- Purpose: Resolve circular RLS dependency caused by multiple tables querying profiles
-- Issue: New tables (activity_feed, staff_filter_views, etc.) have policies that query profiles,
--        creating recursion when upserting profiles during signin
-- Created: 2025-10-25

-- The core issue: Multiple RLS policies check staff status by querying profiles table.
-- When inserting/updating a profile, these checks can create infinite recursion.
-- Solution: Use a SECURITY DEFINER function that bypasses RLS for the role check.

-- Step 1: Recreate the user_is_staff function to be more explicit about bypassing RLS
CREATE OR REPLACE FUNCTION public.user_is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
-- This function bypasses RLS to prevent recursion
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND (p.role)::text LIKE 'staff_%'
  );
$$;

-- Step 2: Similarly update user_has_deal_access to be SQL (more efficient)
CREATE OR REPLACE FUNCTION public.user_has_deal_access(target_deal_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Check if user has direct access to the deal
  SELECT EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = target_deal_id
      AND dm.user_id = auth.uid()
  )
  OR EXISTS (
    -- Check if user's investor has access to the deal
    SELECT 1 FROM deal_memberships dm
    JOIN investor_users iu ON iu.investor_id = dm.investor_id
    WHERE dm.deal_id = target_deal_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    -- Check if user is staff
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND (p.role)::text LIKE 'staff_%'
  );
$$;

-- Step 3: Ensure profiles policies are simple and don't create dependencies
-- Drop and recreate profiles RLS policies to ensure they're optimal
DROP POLICY IF EXISTS "can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "can_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "staff_can_read_all_profiles" ON public.profiles;

-- Allow users to insert their own profile (for signup/signin)
CREATE POLICY "can_insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "can_read_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "can_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow staff to read all profiles (using the SECURITY DEFINER function)
CREATE POLICY "staff_can_read_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR user_is_staff()
  );

-- Step 4: Fix activity_feed policies to use the helper function
DROP POLICY IF EXISTS "Staff can view all activity" ON activity_feed;
DROP POLICY IF EXISTS "Staff can insert activity" ON activity_feed;

CREATE POLICY "Staff can view all activity"
  ON activity_feed
  FOR SELECT
  TO authenticated
  USING (user_is_staff());

CREATE POLICY "Staff can insert activity"
  ON activity_feed
  FOR INSERT
  TO authenticated
  WITH CHECK (user_is_staff());

-- Step 5: Fix staff_filter_views policies to use the helper function
DROP POLICY IF EXISTS "Staff can view own filter views" ON staff_filter_views;
DROP POLICY IF EXISTS "Staff can create own filter views" ON staff_filter_views;
DROP POLICY IF EXISTS "Staff can update own filter views" ON staff_filter_views;
DROP POLICY IF EXISTS "Staff can delete own filter views" ON staff_filter_views;

CREATE POLICY "Staff can view own filter views"
  ON staff_filter_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND user_is_staff());

CREATE POLICY "Staff can create own filter views"
  ON staff_filter_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND user_is_staff());

CREATE POLICY "Staff can update own filter views"
  ON staff_filter_views
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND user_is_staff());

CREATE POLICY "Staff can delete own filter views"
  ON staff_filter_views
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND user_is_staff());

-- Step 6: Fix entity_stakeholders policies
DROP POLICY IF EXISTS "entity_stakeholders_staff_all" ON entity_stakeholders;

CREATE POLICY "entity_stakeholders_staff_all"
  ON entity_stakeholders
  FOR ALL
  TO authenticated
  USING (user_is_staff())
  WITH CHECK (user_is_staff());

-- Step 7: Fix entity_investors policies
DROP POLICY IF EXISTS "entity_investors_staff_all" ON entity_investors;

CREATE POLICY "entity_investors_staff_all"
  ON entity_investors
  FOR ALL
  TO authenticated
  USING (user_is_staff())
  WITH CHECK (user_is_staff());

-- Add comment explaining the fix
COMMENT ON FUNCTION public.user_is_staff() IS
'Checks if the current user has a staff role.
Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.
Changed to SQL language for better performance and to avoid plpgsql overhead.';
