-- Migration: Add placement agreement columns to signature_requests
-- Date: 2025-12-27
-- Adds placement_id and placement_agreement_id for Commercial Partner placement agreement signing

ALTER TABLE signature_requests
ADD COLUMN IF NOT EXISTS placement_id uuid REFERENCES commercial_partners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS placement_agreement_id uuid REFERENCES placement_agreements(id) ON DELETE SET NULL;

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_signature_requests_placement_id
ON signature_requests(placement_id)
WHERE placement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_signature_requests_placement_agreement_id
ON signature_requests(placement_agreement_id)
WHERE placement_agreement_id IS NOT NULL;

COMMENT ON COLUMN signature_requests.placement_id IS 'Reference to commercial partner for CP placement agreement signing';
COMMENT ON COLUMN signature_requests.placement_agreement_id IS 'Reference to placement agreement for CP agreement signing';
