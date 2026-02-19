-- Enforce a single active (pending/under_review) queue item for personal_info and entity_info
-- per exact entity/member target to prevent double-submit race duplicates.

WITH ranked_active AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY
        document_type,
        investor_id,
        investor_member_id,
        partner_id,
        partner_member_id,
        introducer_id,
        introducer_member_id,
        lawyer_id,
        lawyer_member_id,
        commercial_partner_id,
        commercial_partner_member_id,
        arranger_entity_id,
        arranger_member_id
      ORDER BY submitted_at DESC, created_at DESC, id DESC
    ) AS rn
  FROM public.kyc_submissions
  WHERE document_type IN ('entity_info', 'personal_info')
    AND status IN ('pending', 'under_review')
)
UPDATE public.kyc_submissions AS s
SET
  status = 'rejected',
  rejection_reason = trim(both from concat_ws(' | ', s.rejection_reason, 'Auto-rejected duplicate active KYC submission (dedupe migration)')),
  reviewed_at = COALESCE(s.reviewed_at, now()),
  updated_at = now()
FROM ranked_active AS r
WHERE s.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS kyc_submissions_unique_active_entity_personal
  ON public.kyc_submissions (
    document_type,
    investor_id,
    investor_member_id,
    partner_id,
    partner_member_id,
    introducer_id,
    introducer_member_id,
    lawyer_id,
    lawyer_member_id,
    commercial_partner_id,
    commercial_partner_member_id,
    arranger_entity_id,
    arranger_member_id
  )
  WHERE document_type IN ('entity_info', 'personal_info')
    AND status IN ('pending', 'under_review');
