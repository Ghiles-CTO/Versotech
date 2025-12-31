-- Migration: Add status tracking to fee_plans for "Send Fee Model" feature
-- This enables arrangers to send fee models to partners/introducers/commercial partners
-- and track whether the fee plan has been shared.

-- Add status tracking columns
ALTER TABLE fee_plans
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'sent', 'acknowledged')),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_by UUID REFERENCES profiles(id);

-- Add index for efficient status filtering
CREATE INDEX IF NOT EXISTS idx_fee_plans_status ON fee_plans(status);

-- Add comments for documentation
COMMENT ON COLUMN fee_plans.status IS 'Fee plan sharing status: draft (not sent), sent (shared with entity), acknowledged (entity confirmed receipt)';
COMMENT ON COLUMN fee_plans.sent_at IS 'Timestamp when fee plan was sent to the assigned entity';
COMMENT ON COLUMN fee_plans.sent_by IS 'User ID of the arranger who sent the fee plan';
