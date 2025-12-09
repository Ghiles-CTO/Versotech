-- Add 'draft' to the allowed status values for KYC submissions
-- This allows investors to save questionnaire progress before final submission

ALTER TABLE kyc_submissions
DROP CONSTRAINT kyc_submissions_status_check;

ALTER TABLE kyc_submissions
ADD CONSTRAINT kyc_submissions_status_check
CHECK (status = ANY (ARRAY['draft', 'pending', 'under_review', 'approved', 'rejected', 'expired']));
