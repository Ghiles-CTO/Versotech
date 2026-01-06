-- Migration: 20260106000005_extend_kyc_submissions.sql
-- Purpose: Extend kyc_submissions to support all entity types and enhanced document tracking
-- Currently only supports investor_id, need to add other entity types

-- Add entity references for other persona types
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS partner_member_id uuid REFERENCES public.partner_members(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS introducer_id uuid REFERENCES public.introducers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS introducer_member_id uuid REFERENCES public.introducer_members(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS lawyer_member_id uuid REFERENCES public.lawyer_members(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS commercial_partner_id uuid REFERENCES public.commercial_partners(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS commercial_partner_member_id uuid REFERENCES public.commercial_partner_members(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS arranger_entity_id uuid REFERENCES public.arranger_entities(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS arranger_member_id uuid REFERENCES public.arranger_members(id) ON DELETE CASCADE;

-- Add document date tracking (when the underlying document was issued/dated)
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS document_date date,
  ADD COLUMN IF NOT EXISTS document_valid_from date,
  ADD COLUMN IF NOT EXISTS document_valid_to date;

-- For proof of address - track document age at submission
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS document_age_days_at_submission integer;

-- Verification tracking (for enhanced due diligence)
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS verification_method text,
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Add check constraint for verification method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kyc_submissions_verification_method_check'
  ) THEN
    ALTER TABLE public.kyc_submissions
      ADD CONSTRAINT kyc_submissions_verification_method_check
      CHECK (verification_method IS NULL OR verification_method IN ('manual', 'automated', 'third_party', 'in_person'));
  END IF;
END;
$$;

-- Create indexes for the new entity references
CREATE INDEX IF NOT EXISTS kyc_submissions_partner_idx
  ON public.kyc_submissions(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_introducer_idx
  ON public.kyc_submissions(introducer_id) WHERE introducer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_lawyer_idx
  ON public.kyc_submissions(lawyer_id) WHERE lawyer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_cp_idx
  ON public.kyc_submissions(commercial_partner_id) WHERE commercial_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_arranger_idx
  ON public.kyc_submissions(arranger_entity_id) WHERE arranger_entity_id IS NOT NULL;

-- Create indexes for member-level documents
CREATE INDEX IF NOT EXISTS kyc_submissions_partner_member_idx
  ON public.kyc_submissions(partner_member_id) WHERE partner_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_introducer_member_idx
  ON public.kyc_submissions(introducer_member_id) WHERE introducer_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_lawyer_member_idx
  ON public.kyc_submissions(lawyer_member_id) WHERE lawyer_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_cp_member_idx
  ON public.kyc_submissions(commercial_partner_member_id) WHERE commercial_partner_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS kyc_submissions_arranger_member_idx
  ON public.kyc_submissions(arranger_member_id) WHERE arranger_member_id IS NOT NULL;

-- Add RLS policies for new entity types

-- Partners can read their own submissions
DROP POLICY IF EXISTS kyc_submissions_partner_read ON public.kyc_submissions;
CREATE POLICY kyc_submissions_partner_read
  ON public.kyc_submissions
  FOR SELECT
  USING (
    partner_id IN (
      SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
    )
    OR partner_member_id IN (
      SELECT pm.id FROM public.partner_members pm
      JOIN public.partner_users pu ON pm.partner_id = pu.partner_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Partners can insert their own submissions
DROP POLICY IF EXISTS kyc_submissions_partner_insert ON public.kyc_submissions;
CREATE POLICY kyc_submissions_partner_insert
  ON public.kyc_submissions
  FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
    )
  );

-- Introducers can read their own submissions
DROP POLICY IF EXISTS kyc_submissions_introducer_read ON public.kyc_submissions;
CREATE POLICY kyc_submissions_introducer_read
  ON public.kyc_submissions
  FOR SELECT
  USING (
    introducer_id IN (
      SELECT introducer_id FROM public.introducer_users WHERE user_id = auth.uid()
    )
  );

-- Introducers can insert their own submissions
DROP POLICY IF EXISTS kyc_submissions_introducer_insert ON public.kyc_submissions;
CREATE POLICY kyc_submissions_introducer_insert
  ON public.kyc_submissions
  FOR INSERT
  WITH CHECK (
    introducer_id IN (
      SELECT introducer_id FROM public.introducer_users WHERE user_id = auth.uid()
    )
  );

-- Lawyers can read their own submissions
DROP POLICY IF EXISTS kyc_submissions_lawyer_read ON public.kyc_submissions;
CREATE POLICY kyc_submissions_lawyer_read
  ON public.kyc_submissions
  FOR SELECT
  USING (
    lawyer_id IN (
      SELECT lawyer_id FROM public.lawyer_users WHERE user_id = auth.uid()
    )
  );

-- Lawyers can insert their own submissions
DROP POLICY IF EXISTS kyc_submissions_lawyer_insert ON public.kyc_submissions;
CREATE POLICY kyc_submissions_lawyer_insert
  ON public.kyc_submissions
  FOR INSERT
  WITH CHECK (
    lawyer_id IN (
      SELECT lawyer_id FROM public.lawyer_users WHERE user_id = auth.uid()
    )
  );

-- Commercial Partners can read their own submissions
DROP POLICY IF EXISTS kyc_submissions_cp_read ON public.kyc_submissions;
CREATE POLICY kyc_submissions_cp_read
  ON public.kyc_submissions
  FOR SELECT
  USING (
    commercial_partner_id IN (
      SELECT commercial_partner_id FROM public.commercial_partner_users WHERE user_id = auth.uid()
    )
  );

-- Commercial Partners can insert their own submissions
DROP POLICY IF EXISTS kyc_submissions_cp_insert ON public.kyc_submissions;
CREATE POLICY kyc_submissions_cp_insert
  ON public.kyc_submissions
  FOR INSERT
  WITH CHECK (
    commercial_partner_id IN (
      SELECT commercial_partner_id FROM public.commercial_partner_users WHERE user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON COLUMN public.kyc_submissions.document_date IS 'Date the document was issued/dated (not upload date)';
COMMENT ON COLUMN public.kyc_submissions.document_age_days_at_submission IS 'Age of document in days when submitted (for proof of address freshness validation)';
COMMENT ON COLUMN public.kyc_submissions.verification_method IS 'How the document was verified: manual, automated, third_party, in_person';
