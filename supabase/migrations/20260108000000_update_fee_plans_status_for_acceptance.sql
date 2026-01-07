-- Update fee_plans status constraint to support acceptance workflow
-- Allows partner/introducer approval states and signature-based flows

ALTER TABLE fee_plans
DROP CONSTRAINT IF EXISTS fee_plans_status_check;

ALTER TABLE fee_plans
ADD CONSTRAINT fee_plans_status_check
CHECK (status IN (
  'draft',
  'pending_signature',
  'sent',
  'accepted',
  'rejected',
  'archived'
));

COMMENT ON COLUMN fee_plans.status IS
'Fee plan lifecycle: draft, pending_signature, sent, accepted, rejected, archived.';
