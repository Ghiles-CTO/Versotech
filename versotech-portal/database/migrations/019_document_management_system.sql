-- Database Migration 019: Document Management System
-- Description: Adds hierarchical folder structure, version control, approval workflows, and scheduled publishing
-- Dependencies: Existing documents, profiles, investors, vehicles tables
-- Date: 2025-01-22

-- ============================================================================
-- 1) DOCUMENT FOLDERS (Hierarchical Structure)
-- ============================================================================

CREATE TABLE document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_folder_id uuid REFERENCES document_folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  path text NOT NULL, -- computed path like '/VERSO Fund I/Reports'
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  folder_type text CHECK (folder_type IN ('vehicle_root','category','custom')) NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for folder queries
CREATE INDEX idx_folders_vehicle ON document_folders(vehicle_id);
CREATE INDEX idx_folders_parent ON document_folders(parent_folder_id);
CREATE INDEX idx_folders_path ON document_folders(path);
CREATE INDEX idx_folders_type ON document_folders(folder_type);

-- Ensure unique paths
CREATE UNIQUE INDEX idx_folders_unique_path ON document_folders(path);

-- ============================================================================
-- 2) DOCUMENT VERSIONS (Version Control)
-- ============================================================================

CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  file_key text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  changes_description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes for version queries
CREATE INDEX idx_doc_versions_doc ON document_versions(document_id, version_number DESC);
CREATE UNIQUE INDEX idx_doc_versions_unique ON document_versions(document_id, version_number);

-- ============================================================================
-- 3) DOCUMENT APPROVALS (Approval Workflow)
-- ============================================================================

CREATE TABLE document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending','approved','rejected','changes_requested')) DEFAULT 'pending',
  requested_by uuid REFERENCES profiles(id),
  reviewed_by uuid REFERENCES profiles(id),
  review_notes text,
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for approval queries
CREATE INDEX idx_doc_approvals_status ON document_approvals(status, requested_at);
CREATE INDEX idx_doc_approvals_doc ON document_approvals(document_id);
CREATE INDEX idx_doc_approvals_reviewer ON document_approvals(reviewed_by, status);

-- ============================================================================
-- 4) DOCUMENT PUBLISHING SCHEDULE
-- ============================================================================

CREATE TABLE document_publishing_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  publish_at timestamptz NOT NULL,
  unpublish_at timestamptz,
  published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for scheduled publishing
CREATE INDEX idx_doc_schedule_publish ON document_publishing_schedule(publish_at) WHERE NOT published;
CREATE INDEX idx_doc_schedule_unpublish ON document_publishing_schedule(unpublish_at) WHERE published AND unpublish_at IS NOT NULL;
CREATE INDEX idx_doc_schedule_doc ON document_publishing_schedule(document_id);

-- ============================================================================
-- 5) EXTEND DOCUMENTS TABLE
-- ============================================================================

-- Add new columns to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES document_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS current_version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft','pending_approval','approved','published','archived')) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(is_published, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);

-- ============================================================================
-- 6) TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_document_folders_updated_at 
  BEFORE UPDATE ON document_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_approvals_updated_at 
  BEFORE UPDATE ON document_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_schedule_updated_at 
  BEFORE UPDATE ON document_publishing_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7) HELPER FUNCTIONS
-- ============================================================================

-- Function to create default category folders for a vehicle
CREATE OR REPLACE FUNCTION create_default_vehicle_folders(p_vehicle_id uuid, p_created_by uuid)
RETURNS void AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_category_names text[] := ARRAY['Agreements', 'KYC Documents', 'Position Statements', 'NDAs', 'Reports'];
  v_category_name text;
BEGIN
  -- Get vehicle name
  SELECT name INTO v_vehicle_name FROM vehicles WHERE id = p_vehicle_id;
  
  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;
  
  -- Create root folder for vehicle
  INSERT INTO document_folders (name, path, vehicle_id, folder_type, created_by)
  VALUES (v_vehicle_name, '/' || v_vehicle_name, p_vehicle_id, 'vehicle_root', p_created_by)
  RETURNING id INTO v_root_folder_id;
  
  -- Create default category folders
  FOREACH v_category_name IN ARRAY v_category_names
  LOOP
    INSERT INTO document_folders (parent_folder_id, name, path, vehicle_id, folder_type, created_by)
    VALUES (
      v_root_folder_id,
      v_category_name,
      '/' || v_vehicle_name || '/' || v_category_name,
      p_vehicle_id,
      'category',
      p_created_by
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get folder path recursively
CREATE OR REPLACE FUNCTION get_folder_path(p_folder_id uuid)
RETURNS text AS $$
DECLARE
  v_path text;
BEGIN
  WITH RECURSIVE folder_path AS (
    SELECT id, name, parent_folder_id, name::text as path
    FROM document_folders
    WHERE id = p_folder_id
    
    UNION ALL
    
    SELECT f.id, f.name, f.parent_folder_id, f.name || '/' || fp.path
    FROM document_folders f
    INNER JOIN folder_path fp ON f.id = fp.parent_folder_id
  )
  SELECT '/' || path INTO v_path
  FROM folder_path
  WHERE parent_folder_id IS NULL;
  
  RETURN v_path;
END;
$$ LANGUAGE plpgsql;

-- Function to publish scheduled documents (called by cron job)
CREATE OR REPLACE FUNCTION publish_scheduled_documents()
RETURNS TABLE(document_id uuid, published_count int) AS $$
BEGIN
  -- Update documents that should be published
  WITH to_publish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.publish_at <= now()
      AND NOT dps.published
  )
  UPDATE documents d
  SET 
    is_published = true,
    published_at = now(),
    status = 'published'
  FROM to_publish tp
  WHERE d.id = tp.document_id;
  
  -- Mark schedule entries as published
  UPDATE document_publishing_schedule
  SET published = true
  WHERE publish_at <= now()
    AND NOT published;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.published_at >= now() - interval '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Function to unpublish expired documents (called by cron job)
CREATE OR REPLACE FUNCTION unpublish_expired_documents()
RETURNS TABLE(document_id uuid, unpublished_count int) AS $$
BEGIN
  -- Update documents that should be unpublished
  WITH to_unpublish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.unpublish_at IS NOT NULL
      AND dps.unpublish_at <= now()
      AND dps.published
  )
  UPDATE documents d
  SET 
    is_published = false,
    status = 'archived'
  FROM to_unpublish tu
  WHERE d.id = tu.document_id;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.status = 'archived'
    AND d.updated_at >= now() - interval '1 minute';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE document_folders IS 'Hierarchical folder structure for organizing documents by vehicle and category';
COMMENT ON TABLE document_versions IS 'Version history for documents with change tracking';
COMMENT ON TABLE document_approvals IS 'Approval workflow for document publishing';
COMMENT ON TABLE document_publishing_schedule IS 'Scheduled publishing and unpublishing of documents';

COMMENT ON COLUMN document_folders.folder_type IS 'Type: vehicle_root (top-level), category (Agreements/KYC/etc), custom (user-created)';
COMMENT ON COLUMN document_folders.path IS 'Full path from root, e.g. /VERSO Fund I/Reports';
COMMENT ON COLUMN documents.status IS 'Workflow status: draft → pending_approval → approved → published → archived';
COMMENT ON COLUMN documents.is_published IS 'Whether document is visible to investors';
COMMENT ON COLUMN documents.current_version IS 'Current version number for display';

-- ============================================================================
-- 9) INITIAL DATA MIGRATION
-- ============================================================================

-- Set default values for existing documents
UPDATE documents
SET 
  status = 'published',
  is_published = true,
  published_at = created_at,
  current_version = 1,
  name = COALESCE(
    substring(file_key from '[^/]+$'),
    'Untitled Document'
  )
WHERE status IS NULL;

-- Create initial version records for existing documents
INSERT INTO document_versions (document_id, version_number, file_key, file_size_bytes, mime_type, created_by, created_at)
SELECT 
  id,
  1,
  file_key,
  file_size_bytes,
  mime_type,
  created_by,
  created_at
FROM documents
WHERE id NOT IN (SELECT DISTINCT document_id FROM document_versions);


