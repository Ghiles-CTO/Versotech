-- Migration: Fix fee_plans constraints
-- 1. Add constraint to ensure only one entity type is assigned
-- 2. Fix sent_by FK to have ON DELETE SET NULL

-- First, drop the existing sent_by constraint if it exists (to recreate with ON DELETE)
DO $$
BEGIN
  -- Check if the column exists and has a constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fee_plans' AND column_name = 'sent_by'
  ) THEN
    -- Drop the existing foreign key constraint
    ALTER TABLE fee_plans DROP CONSTRAINT IF EXISTS fee_plans_sent_by_fkey;

    -- Re-add with ON DELETE SET NULL
    ALTER TABLE fee_plans
    ADD CONSTRAINT fee_plans_sent_by_fkey
    FOREIGN KEY (sent_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add constraint to ensure at most one entity is assigned to a fee plan
-- This prevents undefined behavior when multiple entity IDs are set
ALTER TABLE fee_plans DROP CONSTRAINT IF EXISTS check_single_entity;
ALTER TABLE fee_plans ADD CONSTRAINT check_single_entity CHECK (
  (CASE WHEN partner_id IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN introducer_id IS NOT NULL THEN 1 ELSE 0 END) +
  (CASE WHEN commercial_partner_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- Add comment for documentation
COMMENT ON CONSTRAINT check_single_entity ON fee_plans IS 'Ensures fee plan is assigned to at most one entity type (partner, introducer, or commercial partner)';
