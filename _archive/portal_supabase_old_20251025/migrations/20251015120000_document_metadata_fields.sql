-- Migration: Document Metadata and Versioning Fields
-- Date: 2025-10-15
-- Description: Add metadata fields to support document management with versioning

-- Add metadata columns to deal_data_room_documents
ALTER TABLE deal_data_room_documents 
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS document_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS document_notes text,
ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS replaced_by_id uuid REFERENCES deal_data_room_documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
ADD COLUMN IF NOT EXISTS mime_type text;
-- Add index for version chains
CREATE INDEX IF NOT EXISTS idx_deal_data_room_documents_replaced_by 
ON deal_data_room_documents(replaced_by_id) 
WHERE replaced_by_id IS NOT NULL;
-- Add index for tag searches
CREATE INDEX IF NOT EXISTS idx_deal_data_room_documents_tags 
ON deal_data_room_documents USING GIN(tags) 
WHERE tags IS NOT NULL;
-- Add index for expiry management
CREATE INDEX IF NOT EXISTS idx_deal_data_room_documents_expires
ON deal_data_room_documents(document_expires_at)
WHERE document_expires_at IS NOT NULL AND visible_to_investors = true;
COMMENT ON COLUMN deal_data_room_documents.tags IS 'Array of tags for document categorization and search';
COMMENT ON COLUMN deal_data_room_documents.document_expires_at IS 'Optional expiry timestamp for time-limited documents';
COMMENT ON COLUMN deal_data_room_documents.document_notes IS 'Internal notes about the document';
COMMENT ON COLUMN deal_data_room_documents.version IS 'Document version number, increments with replacements';
COMMENT ON COLUMN deal_data_room_documents.replaced_by_id IS 'ID of the document that replaced this version (forms version chain)';
COMMENT ON COLUMN deal_data_room_documents.file_size_bytes IS 'File size in bytes for display and validation';
COMMENT ON COLUMN deal_data_room_documents.mime_type IS 'MIME type of the uploaded file';
