-- Migration: Introducer Agreement Signing Infrastructure
-- Adds columns to support dual-party signing workflow for introducer agreements

-- Add columns to signature_requests for introducer agreement signing
ALTER TABLE signature_requests
ADD COLUMN IF NOT EXISTS introducer_id UUID REFERENCES introducers(id),
ADD COLUMN IF NOT EXISTS introducer_agreement_id UUID REFERENCES introducer_agreements(id);

-- Add signature request tracking to introducer_agreements
ALTER TABLE introducer_agreements
ADD COLUMN IF NOT EXISTS ceo_signature_request_id UUID REFERENCES signature_requests(id),
ADD COLUMN IF NOT EXISTS introducer_signature_request_id UUID REFERENCES signature_requests(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signature_requests_introducer_agreement
ON signature_requests(introducer_agreement_id) WHERE introducer_agreement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_signature_requests_introducer
ON signature_requests(introducer_id) WHERE introducer_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN signature_requests.introducer_id IS 'Links signature request to an introducer for introducer agreement signing';
COMMENT ON COLUMN signature_requests.introducer_agreement_id IS 'Links signature request to an introducer agreement';
COMMENT ON COLUMN introducer_agreements.ceo_signature_request_id IS 'Tracks CEO signature request for this agreement';
COMMENT ON COLUMN introducer_agreements.introducer_signature_request_id IS 'Tracks introducer signature request for this agreement';
