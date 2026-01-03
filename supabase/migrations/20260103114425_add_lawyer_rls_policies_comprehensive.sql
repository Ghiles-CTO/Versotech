-- Migration: add_lawyer_rls_policies_comprehensive
-- Date: 2026-01-03
-- Description: Comprehensive RLS policies for lawyer persona access
-- Applied via MCP, recreated for local sync

-- ============================================
-- Issue #2: Lawyer admin UPDATE on lawyers table
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lawyers' AND policyname = 'lawyers_admin_update'
  ) THEN
    CREATE POLICY "lawyers_admin_update" ON lawyers FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM lawyer_users lu
        WHERE lu.lawyer_id = lawyers.id
        AND lu.user_id = auth.uid()
        AND lu.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM lawyer_users lu
        WHERE lu.lawyer_id = lawyers.id
        AND lu.user_id = auth.uid()
        AND lu.role = 'admin'
      )
    );
  END IF;
END $$;

-- ============================================
-- Issue #3: Self-update signature policy
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lawyer_users' AND policyname = 'lawyer_users_self_update_signature'
  ) THEN
    CREATE POLICY "lawyer_users_self_update_signature" ON lawyer_users FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- Issue #4: Commission table policies
-- ============================================

-- Introducer commissions SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'introducer_commissions' AND policyname = 'lawyers_view_introducer_commissions'
  ) THEN
    CREATE POLICY "lawyers_view_introducer_commissions" ON introducer_commissions FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = introducer_commissions.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Introducer commissions UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'introducer_commissions' AND policyname = 'lawyers_update_introducer_commissions'
  ) THEN
    CREATE POLICY "lawyers_update_introducer_commissions" ON introducer_commissions FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = introducer_commissions.deal_id
        AND lu.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = introducer_commissions.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Partner commissions SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'partner_commissions' AND policyname = 'lawyers_view_partner_commissions'
  ) THEN
    CREATE POLICY "lawyers_view_partner_commissions" ON partner_commissions FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = partner_commissions.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Commercial partner commissions SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'commercial_partner_commissions' AND policyname = 'lawyers_view_cp_commissions'
  ) THEN
    CREATE POLICY "lawyers_view_cp_commissions" ON commercial_partner_commissions FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = commercial_partner_commissions.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- ============================================
-- Issue #5: Document/financial table policies
-- ============================================

-- Allocations SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'allocations' AND policyname = 'lawyers_view_allocations'
  ) THEN
    CREATE POLICY "lawyers_view_allocations" ON allocations FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = allocations.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Invoices SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invoices' AND policyname = 'lawyers_view_invoices'
  ) THEN
    CREATE POLICY "lawyers_view_invoices" ON invoices FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = invoices.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Signature requests SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'signature_requests' AND policyname = 'lawyers_view_signature_requests'
  ) THEN
    CREATE POLICY "lawyers_view_signature_requests" ON signature_requests FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = signature_requests.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Documents SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'documents' AND policyname = 'lawyers_view_documents'
  ) THEN
    CREATE POLICY "lawyers_view_documents" ON documents FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM deal_lawyer_assignments dla
        JOIN lawyer_users lu ON lu.lawyer_id = dla.lawyer_id
        WHERE dla.deal_id = documents.deal_id
        AND lu.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- ============================================
-- End of lawyer comprehensive RLS policies
-- ============================================
