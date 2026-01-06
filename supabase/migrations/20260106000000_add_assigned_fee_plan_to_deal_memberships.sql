-- Migration: Add assigned_fee_plan_id to deal_memberships
-- Purpose: Link dispatched investors to their fee plan at dispatch time
-- Reference: DISPATCHING_NDA_CLOSING_IMPLEMENTATION.md
--
-- This column stores the fee plan that was selected when an investor was
-- dispatched through an introducer/partner. It enables:
-- 1. Commission calculation based on the correct fee plan
-- 2. Audit trail of which fee terms applied to each investor
-- 3. Validation that fee plan was accepted before dispatch

-- Add the foreign key column
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS assigned_fee_plan_id uuid REFERENCES fee_plans(id) ON DELETE SET NULL;

-- Create index for efficient lookups (only on non-null values)
CREATE INDEX IF NOT EXISTS idx_deal_memberships_assigned_fee_plan
ON deal_memberships(assigned_fee_plan_id)
WHERE assigned_fee_plan_id IS NOT NULL;

-- Add documentation
COMMENT ON COLUMN deal_memberships.assigned_fee_plan_id IS
'Fee plan assigned at investor dispatch time, linking investor to introducer/partner commission terms.
Required when referred_by_entity_id is set. Must reference an accepted fee plan for the referring entity.';

-- Validation: Ensure assigned_fee_plan_id is set when referred_by_entity_id is set
-- Note: This is enforced at application level, not database level, because:
-- 1. We need to check fee_plan status = accepted
-- 2. We need to validate the fee plan belongs to the correct entity
-- 3. Existing data may not have this column populated
