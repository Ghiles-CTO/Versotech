-- kyc_submissions supports multiple entity types (partner/introducer/lawyer/commercial_partner/arranger)
-- so investor_id must be nullable for non-investor submissions.
ALTER TABLE public.kyc_submissions
  ALTER COLUMN investor_id DROP NOT NULL;
