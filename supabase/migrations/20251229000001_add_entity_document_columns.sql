-- Migration: Add entity reference columns to documents table
-- Purpose: Enable KYC document storage for lawyer, partner, and commercial partner entities
-- Pattern: Follows existing introducer_id and arranger_entity_id implementation

-- Add lawyer_id column
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_lawyer_id ON documents(lawyer_id);

COMMENT ON COLUMN documents.lawyer_id IS 'Reference to lawyer entity for KYC documents';

-- Add partner_id column
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);

COMMENT ON COLUMN documents.partner_id IS 'Reference to partner entity for KYC documents';

-- Add commercial_partner_id column
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS commercial_partner_id uuid REFERENCES commercial_partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_commercial_partner_id ON documents(commercial_partner_id);

COMMENT ON COLUMN documents.commercial_partner_id IS 'Reference to commercial partner entity for KYC documents';
