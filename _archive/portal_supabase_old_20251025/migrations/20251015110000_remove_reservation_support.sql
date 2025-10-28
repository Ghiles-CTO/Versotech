-- Migration: Remove Reservation Support
-- Date: 2025-10-15
-- Description: Finalize deprecation of reservation system in favor of interest/subscription workflow

-- Drop RLS policies on reservations table
DROP POLICY IF EXISTS reservations_staff_all ON reservations;
DROP POLICY IF EXISTS reservations_investor_select ON reservations;
DROP POLICY IF EXISTS reservations_investor_update ON reservations;
-- Disable RLS on reservations table
ALTER TABLE IF EXISTS reservations DISABLE ROW LEVEL SECURITY;
-- Add deprecation comment
COMMENT ON TABLE reservations IS 
  'FULLY DEPRECATED: Reservation system has been replaced by investor_deal_interest -> deal_subscription_submissions workflow. 
   Historical data preserved in reservations_archive table. This table should not be used for new records.
   See: investor_deal_interest, deal_subscription_submissions, deal_data_room_access for the current workflow.';
-- Drop reservation lot items junction table if it exists
DROP TABLE IF EXISTS reservation_lot_items CASCADE;
-- Optional: Uncomment below to completely remove the reservations table after confirming archive is complete
-- WARNING: This will permanently delete the table structure (data already archived)
-- DROP TABLE IF EXISTS reservations CASCADE;

-- Log the deprecation
DO $$
BEGIN
  RAISE NOTICE 'Reservation system has been deprecated. Historical data preserved in reservations_archive.';
  RAISE NOTICE 'New workflow uses: investor_deal_interest -> data_room_access -> deal_subscription_submissions';
END $$;
