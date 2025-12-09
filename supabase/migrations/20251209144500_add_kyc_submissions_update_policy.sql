-- Add UPDATE policy for investors on kyc_submissions
-- Allows investors to update their own submissions when status is draft/pending/rejected

CREATE POLICY kyc_submissions_investor_update ON kyc_submissions
FOR UPDATE TO authenticated
USING (
  investor_id IN (
    SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
  )
  AND status IN ('draft', 'pending', 'rejected')
)
WITH CHECK (
  investor_id IN (
    SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
  )
  AND status IN ('draft', 'pending')
);
