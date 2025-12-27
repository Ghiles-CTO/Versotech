-- Migration: Add payee_arranger_id to fee_events
-- This enables arranger fee tracking and payment requests

-- Add payee_arranger_id column to track which arranger should receive payment
ALTER TABLE fee_events
ADD COLUMN IF NOT EXISTS payee_arranger_id uuid REFERENCES arranger_entities(id);

-- Add index for arranger fee lookups
CREATE INDEX IF NOT EXISTS idx_fee_events_payee_arranger_id
ON fee_events(payee_arranger_id) WHERE payee_arranger_id IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN fee_events.payee_arranger_id IS
'Arranger entity that should receive this fee. Used for arranger payment requests.';

-- RLS policy for arrangers to view their own fee events
DROP POLICY IF EXISTS "Arrangers can view own fee events" ON fee_events;
CREATE POLICY "Arrangers can view own fee events" ON fee_events
FOR SELECT
USING (
  payee_arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
);
