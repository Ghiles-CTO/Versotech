-- Migration: Add introducer_id column to documents table
-- Purpose: Enable KYC document storage for introducer entities
-- Pattern: Follows existing arranger_entity_id implementation

-- Add introducer_id column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS introducer_id uuid REFERENCES introducers(id) ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_documents_introducer_id ON documents(introducer_id);

-- Add comment for documentation
COMMENT ON COLUMN documents.introducer_id IS 'Reference to introducer entity for KYC documents';

-- Grant necessary permissions (following existing patterns)
-- RLS policies for staff access are already handled by documents_staff_all policy
-- which allows staff roles to access all documents
