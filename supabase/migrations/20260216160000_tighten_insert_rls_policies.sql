-- Migration: Tighten overly-permissive INSERT RLS policies
-- Date: 2026-02-16
-- Fixes:
--   1. investor_notifications: WITH CHECK(true) allowed any authenticated user to
--      insert notifications for any other user. All production inserts use service
--      client (bypasses RLS), so restricting to staff won't break anything.
--   2. activity_feed: Two contradictory INSERT policies — the "System can insert"
--      WITH CHECK(true) made the staff-only check meaningless. Replace both with a
--      single policy allowing staff unrestricted + non-staff only for own investors.

-- ============================================================================
-- 1. investor_notifications — restrict INSERT to staff roles
-- ============================================================================

DROP POLICY IF EXISTS investor_notifications_insert_service ON investor_notifications;

CREATE POLICY investor_notifications_insert_staff ON investor_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role::text LIKE 'staff_%'
  )
);

-- ============================================================================
-- 2. activity_feed — consolidate two INSERT policies into one
-- ============================================================================

-- Drop the contradictory pair
DROP POLICY IF EXISTS "System can insert activity" ON activity_feed;
DROP POLICY IF EXISTS "Staff can insert activity" ON activity_feed;

-- Single consolidated policy:
--   Staff can insert for any investor.
--   Non-staff can only insert for investors they belong to.
CREATE POLICY "Authenticated users can insert own activity" ON activity_feed
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
  OR
  investor_id IN (
    SELECT investor_id FROM investor_users
    WHERE user_id = auth.uid()
  )
);
