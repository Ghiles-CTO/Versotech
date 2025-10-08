-- Database Migration 022: Folder Investor Access Control
-- Description: Allow staff to grant specific investors access to folders
-- Dependencies: Migration 019 (document folders)
-- Date: 2025-01-22

-- ============================================================================
-- 1) FOLDER ACCESS GRANTS TABLE
-- ============================================================================

CREATE TABLE folder_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES document_folders(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(folder_id, investor_id)
);

CREATE INDEX idx_folder_access_folder ON folder_access_grants(folder_id);
CREATE INDEX idx_folder_access_investor ON folder_access_grants(investor_id);

COMMENT ON TABLE folder_access_grants IS 'Grants specific investors access to folders and all documents within';

-- ============================================================================
-- 2) UPDATE RLS POLICIES FOR FOLDER ACCESS
-- ============================================================================

-- Drop and recreate folders investor read policy to include access grants
DROP POLICY IF EXISTS folders_investor_read ON document_folders;

CREATE POLICY folders_investor_read ON document_folders FOR SELECT
  TO authenticated
  USING (
    -- Vehicle-based access (existing)
    (vehicle_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN investor_users iu ON iu.investor_id = s.investor_id
      WHERE s.vehicle_id = document_folders.vehicle_id 
      AND iu.user_id = auth.uid()
    ))
    -- OR explicit folder access grant (new)
    OR EXISTS (
      SELECT 1 FROM folder_access_grants fag
      JOIN investor_users iu ON iu.investor_id = fag.investor_id
      WHERE fag.folder_id = document_folders.id
      AND iu.user_id = auth.uid()
    )
  );

-- Update documents investor policy to include folder-based access
DROP POLICY IF EXISTS documents_investor_published ON documents;

CREATE POLICY documents_investor_published ON documents FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND (
      -- Vehicle-scoped documents (existing)
      (vehicle_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN investor_users iu ON iu.investor_id = s.investor_id
        WHERE s.vehicle_id = documents.vehicle_id 
        AND iu.user_id = auth.uid()
      ))
      -- Investor-owned documents (existing)
      OR (owner_investor_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM investor_users iu
        WHERE iu.investor_id = documents.owner_investor_id 
        AND iu.user_id = auth.uid()
      ))
      -- User-owned documents (existing)
      OR owner_user_id = auth.uid()
      -- Deal-scoped documents (existing)
      OR (deal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM deal_memberships dm
        WHERE dm.deal_id = documents.deal_id 
        AND dm.user_id = auth.uid()
      ))
      -- Folder-based access (new)
      OR (folder_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM folder_access_grants fag
        JOIN investor_users iu ON iu.investor_id = fag.investor_id
        WHERE fag.folder_id = documents.folder_id
        AND iu.user_id = auth.uid()
      ))
    )
  );

-- ============================================================================
-- 3) RLS FOR FOLDER ACCESS GRANTS TABLE
-- ============================================================================

ALTER TABLE folder_access_grants ENABLE ROW LEVEL SECURITY;

-- Staff can manage all grants
CREATE POLICY folder_grants_staff_all ON folder_access_grants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Investors can view their own grants
CREATE POLICY folder_grants_investor_read ON folder_access_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_users iu
      WHERE iu.investor_id = folder_access_grants.investor_id
      AND iu.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4) HELPER FUNCTION TO GET FOLDER DOCUMENTS COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION get_folder_document_count(p_folder_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM documents
    WHERE folder_id = p_folder_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5) HELPER FUNCTION TO GET INVESTOR ACCESS TO FOLDER
-- ============================================================================

CREATE OR REPLACE FUNCTION get_folder_investor_access(p_folder_id uuid)
RETURNS TABLE(
  investor_id uuid,
  investor_legal_name text,
  granted_at timestamptz,
  granted_by_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.legal_name,
    fag.granted_at,
    p.display_name
  FROM folder_access_grants fag
  JOIN investors i ON i.id = fag.investor_id
  LEFT JOIN profiles p ON p.id = fag.granted_by
  WHERE fag.folder_id = p_folder_id
  ORDER BY fag.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_folder_document_count IS 'Get count of documents in a folder';
COMMENT ON FUNCTION get_folder_investor_access IS 'Get list of investors with access to a folder';

