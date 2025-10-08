-- Database Migration 023: Document-Level Investor Access
-- Description: Allow staff to grant investors access to individual documents
-- Dependencies: Migration 022 (folder access)
-- Date: 2025-01-22

-- ============================================================================
-- 1) DOCUMENT ACCESS GRANTS TABLE
-- ============================================================================

CREATE TABLE document_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, investor_id)
);

CREATE INDEX idx_document_access_document ON document_access_grants(document_id);
CREATE INDEX idx_document_access_investor ON document_access_grants(investor_id);

COMMENT ON TABLE document_access_grants IS 'Grants specific investors access to individual documents';

-- ============================================================================
-- 2) UPDATE DOCUMENTS RLS POLICY FOR DOCUMENT-LEVEL ACCESS
-- ============================================================================

DROP POLICY IF EXISTS documents_investor_published ON documents;

CREATE POLICY documents_investor_published ON documents FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND (
      -- Vehicle-scoped documents
      (vehicle_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN investor_users iu ON iu.investor_id = s.investor_id
        WHERE s.vehicle_id = documents.vehicle_id 
        AND iu.user_id = auth.uid()
      ))
      -- Investor-owned documents
      OR (owner_investor_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM investor_users iu
        WHERE iu.investor_id = documents.owner_investor_id 
        AND iu.user_id = auth.uid()
      ))
      -- User-owned documents
      OR owner_user_id = auth.uid()
      -- Deal-scoped documents
      OR (deal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM deal_memberships dm
        WHERE dm.deal_id = documents.deal_id 
        AND dm.user_id = auth.uid()
      ))
      -- Folder-based access
      OR (folder_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM folder_access_grants fag
        JOIN investor_users iu ON iu.investor_id = fag.investor_id
        WHERE fag.folder_id = documents.folder_id
        AND iu.user_id = auth.uid()
      ))
      -- Document-level access (NEW)
      OR EXISTS (
        SELECT 1 FROM document_access_grants dag
        JOIN investor_users iu ON iu.investor_id = dag.investor_id
        WHERE dag.document_id = documents.id
        AND iu.user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 3) RLS FOR DOCUMENT ACCESS GRANTS TABLE
-- ============================================================================

ALTER TABLE document_access_grants ENABLE ROW LEVEL SECURITY;

-- Staff can manage all grants
CREATE POLICY document_grants_staff_all ON document_access_grants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Investors can view their own grants
CREATE POLICY document_grants_investor_read ON document_access_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investor_users iu
      WHERE iu.investor_id = document_access_grants.investor_id
      AND iu.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4) HELPER FUNCTION TO GET DOCUMENT INVESTOR ACCESS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_document_investor_access(p_document_id uuid)
RETURNS TABLE(
  investor_id uuid,
  investor_legal_name text,
  granted_at timestamptz,
  granted_by_name text,
  access_type text
) AS $$
BEGIN
  RETURN QUERY
  -- Direct document access
  SELECT 
    i.id,
    i.legal_name,
    dag.granted_at,
    p.display_name,
    'direct'::text as access_type
  FROM document_access_grants dag
  JOIN investors i ON i.id = dag.investor_id
  LEFT JOIN profiles p ON p.id = dag.granted_by
  WHERE dag.document_id = p_document_id
  
  UNION
  
  -- Folder-based access
  SELECT DISTINCT
    i.id,
    i.legal_name,
    fag.granted_at,
    p.display_name,
    'folder'::text as access_type
  FROM documents d
  JOIN folder_access_grants fag ON fag.folder_id = d.folder_id
  JOIN investors i ON i.id = fag.investor_id
  LEFT JOIN profiles p ON p.id = fag.granted_by
  WHERE d.id = p_document_id
  
  ORDER BY granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_document_investor_access IS 'Get all investors with access to a document (direct or via folder)';

