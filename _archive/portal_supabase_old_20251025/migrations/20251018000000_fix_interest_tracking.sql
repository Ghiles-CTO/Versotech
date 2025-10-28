-- Migration: Fix Interest Tracking - Consolidate Open and Closed Deal Interests
-- Date: 2025-10-18
-- Description: Adds is_post_close field to investor_deal_interest table to track all interests in one place

-- Add is_post_close column to investor_deal_interest table
ALTER TABLE investor_deal_interest
ADD COLUMN IF NOT EXISTS is_post_close boolean NOT NULL DEFAULT false;
-- Add index for filtering post-close interests
CREATE INDEX IF NOT EXISTS idx_investor_deal_interest_post_close
ON investor_deal_interest(deal_id, is_post_close);
-- Add comment explaining the field
COMMENT ON COLUMN investor_deal_interest.is_post_close IS 'True if this interest was expressed for a closed deal (future similar opportunities). Post-close interests are auto-approved and do not trigger the approval workflow.';
-- Add a check to ensure post-close interests are always in approved status
-- This prevents confusion and ensures business logic consistency
ALTER TABLE investor_deal_interest
ADD CONSTRAINT investor_deal_interest_post_close_must_be_approved
CHECK (
  NOT is_post_close OR (is_post_close AND status = 'approved')
);
COMMENT ON CONSTRAINT investor_deal_interest_post_close_must_be_approved ON investor_deal_interest IS
'Ensures that post-close interests (future similar opportunities) are always marked as approved since they bypass the approval workflow.';
-- Migrate existing data from investor_interest_signals to investor_deal_interest
-- This ensures any existing closed deal interests are now visible in the staff portal
INSERT INTO investor_deal_interest (
  deal_id,
  investor_id,
  created_by,
  indicative_amount,
  indicative_currency,
  notes,
  status,
  submitted_at,
  approved_at,
  is_post_close
)
SELECT
  deal_id,
  investor_id,
  created_by,
  (metadata->>'indicative_amount')::numeric(18,2) as indicative_amount,
  metadata->>'indicative_currency' as indicative_currency,
  metadata->>'notes' as notes,
  'approved' as status, -- Post-close interests don't need approval workflow
  created_at as submitted_at,
  created_at as approved_at, -- Set approved_at same as submitted_at for post-close
  true as is_post_close
FROM investor_interest_signals
WHERE signal_type = 'closed_deal_interest'
  AND NOT EXISTS (
    -- Don't duplicate if already exists
    SELECT 1 FROM investor_deal_interest idi
    WHERE idi.deal_id = investor_interest_signals.deal_id
      AND idi.investor_id = investor_interest_signals.investor_id
      AND idi.is_post_close = true
      AND idi.submitted_at = investor_interest_signals.created_at
  );
