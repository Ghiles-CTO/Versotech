-- Migration: Fix Priority Enum Mismatch
-- Date: 2025-01-06
-- Description: Corrects priority enum from 'normal' to proper values (low/medium/high/critical)
-- Priority: CRITICAL - Fixes SLA calculation and data integrity issues
-- Issue: Database default 'normal' conflicts with TypeScript types and SLA trigger logic

-- =============================================================================
-- FIX: Correct priority enum and migrate existing data
-- =============================================================================

-- Step 1: Migrate existing 'normal' values to 'medium'
UPDATE approvals
SET priority = 'medium'
WHERE priority = 'normal';

-- Step 2: Add proper CHECK constraint
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_priority_check;
ALTER TABLE approvals ADD CONSTRAINT approvals_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Step 3: Change default from 'normal' to 'medium'
ALTER TABLE approvals ALTER COLUMN priority SET DEFAULT 'medium';

-- Step 4: Verify no bad data remains
DO $$
DECLARE
  v_bad_count int;
BEGIN
  SELECT COUNT(*) INTO v_bad_count
  FROM approvals
  WHERE priority NOT IN ('low', 'medium', 'high', 'critical');

  IF v_bad_count > 0 THEN
    RAISE EXCEPTION 'Found % approvals with invalid priority values', v_bad_count;
  END IF;

  RAISE NOTICE 'Priority enum migration completed successfully. All approvals now use low/medium/high/critical.';
END $$;

-- Comments for documentation
COMMENT ON CONSTRAINT approvals_priority_check ON approvals IS
  'Ensures priority values match TypeScript types and SLA calculation logic: low(72h), medium(24h), high(4h), critical(2h)';

