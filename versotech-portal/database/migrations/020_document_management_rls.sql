-- Database Migration 020: Document Management RLS Policies
-- Description: Row Level Security policies for document management system
-- Dependencies: Migration 019 (document management tables)
-- Date: 2025-01-22

-- ============================================================================
-- 1) ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_publishing_schedule ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2) DOCUMENT FOLDERS POLICIES
-- ============================================================================

-- Staff can do everything with folders
CREATE POLICY folders_staff_all ON document_folders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Investors can view folders for vehicles they have access to
CREATE POLICY folders_investor_read ON document_folders FOR SELECT
  TO authenticated
  USING (
    vehicle_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN investor_users iu ON iu.investor_id = s.investor_id
      WHERE s.vehicle_id = document_folders.vehicle_id 
      AND iu.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3) DOCUMENT VERSIONS POLICIES
-- ============================================================================

-- Staff can manage all versions
CREATE POLICY versions_staff_all ON document_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Investors can view versions of documents they can access
CREATE POLICY versions_investor_read ON document_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND d.is_published = true
      AND (
        -- Vehicle-scoped documents
        (d.vehicle_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM subscriptions s
          JOIN investor_users iu ON iu.investor_id = s.investor_id
          WHERE s.vehicle_id = d.vehicle_id 
          AND iu.user_id = auth.uid()
        ))
        -- Investor-owned documents
        OR (d.owner_investor_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM investor_users iu
          WHERE iu.investor_id = d.owner_investor_id 
          AND iu.user_id = auth.uid()
        ))
        -- User-owned documents
        OR d.owner_user_id = auth.uid()
        -- Deal-scoped documents
        OR (d.deal_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM deal_memberships dm
          WHERE dm.deal_id = d.deal_id 
          AND dm.user_id = auth.uid()
        ))
      )
    )
  );

-- ============================================================================
-- 4) DOCUMENT APPROVALS POLICIES
-- ============================================================================

-- Staff can manage all approvals
CREATE POLICY approvals_staff_all ON document_approvals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Users can view approvals they requested
CREATE POLICY approvals_requester_read ON document_approvals FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

-- ============================================================================
-- 5) DOCUMENT PUBLISHING SCHEDULE POLICIES
-- ============================================================================

-- Staff can manage all schedules
CREATE POLICY schedule_staff_all ON document_publishing_schedule FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- ============================================================================
-- 6) UPDATE DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS documents_read_entitled ON documents;
DROP POLICY IF EXISTS documents_investor_published ON documents;

-- Staff can do everything with documents
CREATE POLICY documents_staff_all ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role::text LIKE 'staff_%'
    )
  );

-- Investors can only view published documents they have access to
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
    )
  );

-- ============================================================================
-- 7) HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if user is staff
CREATE OR REPLACE FUNCTION is_staff_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role::text LIKE 'staff_%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to vehicle
CREATE OR REPLACE FUNCTION has_vehicle_access(p_vehicle_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Check investor access
  RETURN EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = p_vehicle_id 
    AND iu.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to document
CREATE OR REPLACE FUNCTION has_document_access(p_document_id uuid)
RETURNS boolean AS $$
DECLARE
  v_doc documents%ROWTYPE;
BEGIN
  SELECT * INTO v_doc FROM documents WHERE id = p_document_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Document must be published for investors
  IF NOT v_doc.is_published THEN
    RETURN false;
  END IF;
  
  -- Check vehicle access
  IF v_doc.vehicle_id IS NOT NULL THEN
    RETURN has_vehicle_access(v_doc.vehicle_id);
  END IF;
  
  -- Check investor ownership
  IF v_doc.owner_investor_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM investor_users 
      WHERE investor_id = v_doc.owner_investor_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  -- Check user ownership
  IF v_doc.owner_user_id IS NOT NULL THEN
    RETURN v_doc.owner_user_id = auth.uid();
  END IF;
  
  -- Check deal membership
  IF v_doc.deal_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM deal_memberships 
      WHERE deal_id = v_doc.deal_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8) COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_staff_user() IS 'Check if current user is staff member';
COMMENT ON FUNCTION has_vehicle_access(uuid) IS 'Check if current user has access to vehicle';
COMMENT ON FUNCTION has_document_access(uuid) IS 'Check if current user has access to document';

