-- Database Migration 004: Row Level Security Policies
-- Description: Creates RLS policies for deal-scoped access control
-- Dependencies: Migrations 001-003 (all tables), existing RLS infrastructure
-- Date: 2025-01-22

-- ============================================================================
-- 1) ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

-- Deal tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;

-- Introducer tables
ALTER TABLE introducers ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE introducer_commissions ENABLE ROW LEVEL SECURITY;

-- Inventory tables
ALTER TABLE share_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_lot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_lot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Fee and document tables
ALTER TABLE fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_envelopes ENABLE ROW LEVEL SECURITY;

-- Financial tables
ALTER TABLE fee_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2) CORE ACCESS CONTROL FUNCTIONS
-- ============================================================================

-- Check if user has access to a deal (via membership or investor link)
CREATE OR REPLACE FUNCTION user_has_deal_access(target_deal_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check direct deal membership
  IF EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = target_deal_id
    AND dm.user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Check via investor relationship
  IF EXISTS (
    SELECT 1 FROM deal_memberships dm
    JOIN investor_users iu ON iu.investor_id = dm.investor_id
    WHERE dm.deal_id = target_deal_id
    AND iu.user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Staff access to all deals
  IF EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role LIKE 'staff_%'
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is linked to an investor
CREATE OR REPLACE FUNCTION user_linked_to_investor(target_investor_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = target_investor_id
    AND iu.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is staff
CREATE OR REPLACE FUNCTION user_is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role LIKE 'staff_%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3) DEAL ACCESS POLICIES
-- ============================================================================

-- Deals: Users can read deals they have access to
CREATE POLICY deal_read ON deals FOR SELECT
USING (user_has_deal_access(id));

-- Deal memberships: Users can read their own memberships and staff can read all
CREATE POLICY deal_membership_read ON deal_memberships FOR SELECT
USING (
  user_id = auth.uid()
  OR user_linked_to_investor(investor_id)
  OR user_is_staff()
);

-- Invite links: Only staff can manage, but invited users can read their own
CREATE POLICY invite_links_read ON invite_links FOR SELECT
USING (user_is_staff());

-- ============================================================================
-- 4) INVENTORY ACCESS POLICIES
-- ============================================================================

-- Share sources: Staff only
CREATE POLICY share_sources_read ON share_sources FOR SELECT
USING (user_is_staff());

-- Share lots: Deal participants and staff
CREATE POLICY share_lots_read ON share_lots FOR SELECT
USING (
  user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Reservations: Own reservations + deal participants + staff
CREATE POLICY reservations_read ON reservations FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Reservation lot items: Via reservation access
CREATE POLICY reservation_lot_items_read ON reservation_lot_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_id
    AND (user_linked_to_investor(r.investor_id) OR user_has_deal_access(r.deal_id) OR user_is_staff())
  )
);

-- Allocations: Own allocations + deal participants + staff
CREATE POLICY allocations_read ON allocations FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Allocation lot items: Via allocation access
CREATE POLICY allocation_lot_items_read ON allocation_lot_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM allocations a
    WHERE a.id = allocation_id
    AND (user_linked_to_investor(a.investor_id) OR user_has_deal_access(a.deal_id) OR user_is_staff())
  )
);

-- Deal commitments: Own commitments + deal participants + staff
CREATE POLICY deal_commitments_read ON deal_commitments FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Approvals: Assigned staff + requesters + staff
CREATE POLICY approvals_read ON approvals FOR SELECT
USING (
  assigned_to = auth.uid()
  OR requested_by = auth.uid()
  OR user_is_staff()
);

-- ============================================================================
-- 5) FEE AND DOCUMENT POLICIES
-- ============================================================================

-- Fee plans: Deal participants
CREATE POLICY fee_plans_read ON fee_plans FOR SELECT
USING (user_has_deal_access(deal_id));

-- Fee components: Via fee plan access
CREATE POLICY fee_components_read ON fee_components FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM fee_plans fp
    WHERE fp.id = fee_plan_id
    AND user_has_deal_access(fp.deal_id)
  )
);

-- Investor terms: Own terms + deal participants + staff
CREATE POLICY investor_terms_read ON investor_terms FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Term sheets: Own term sheets + deal participants + staff
CREATE POLICY term_sheets_read ON term_sheets FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Document templates: Staff only (sensitive business logic)
CREATE POLICY doc_templates_read ON doc_templates FOR SELECT
USING (user_is_staff());

-- Document packages: Own packages + deal participants + staff
CREATE POLICY doc_packages_read ON doc_packages FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Document package items: Via package access
CREATE POLICY doc_package_items_read ON doc_package_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doc_packages dp
    WHERE dp.id = package_id
    AND (user_linked_to_investor(dp.investor_id) OR user_has_deal_access(dp.deal_id) OR user_is_staff())
  )
);

-- E-sign envelopes: Staff only (contains external IDs)
CREATE POLICY esign_envelopes_read ON esign_envelopes FOR SELECT
USING (user_is_staff());

-- ============================================================================
-- 6) FINANCIAL DATA POLICIES
-- ============================================================================

-- Fee events: Own events + deal participants + staff
CREATE POLICY fee_events_read ON fee_events FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_has_deal_access(deal_id)
  OR user_is_staff()
);

-- Invoices: Own invoices + staff
CREATE POLICY invoices_read ON invoices FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_is_staff()
);

-- Invoice lines: Via invoice access
CREATE POLICY invoice_lines_read ON invoice_lines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_id
    AND (user_linked_to_investor(i.investor_id) OR user_is_staff())
  )
);

-- Payments: Own payments + staff
CREATE POLICY payments_read ON payments FOR SELECT
USING (
  user_linked_to_investor(investor_id)
  OR user_is_staff()
);

-- Bank transactions: Staff only (sensitive financial data)
CREATE POLICY bank_transactions_read ON bank_transactions FOR SELECT
USING (user_is_staff());

-- Reconciliations: Staff only
CREATE POLICY reconciliations_read ON reconciliations FOR SELECT
USING (user_is_staff());

-- ============================================================================
-- 7) INTRODUCER POLICIES
-- ============================================================================

-- Introducers: Own introducer profile + staff
CREATE POLICY introducers_read ON introducers FOR SELECT
USING (
  user_id = auth.uid()
  OR user_is_staff()
);

-- Introductions: Own introductions + staff
CREATE POLICY introductions_read ON introductions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM introducers i
    WHERE i.id = introducer_id
    AND i.user_id = auth.uid()
  )
  OR user_is_staff()
);

-- Introducer commissions: Own commissions + staff
CREATE POLICY introducer_commissions_read ON introducer_commissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM introducers i
    WHERE i.id = introducer_id
    AND i.user_id = auth.uid()
  )
  OR user_is_staff()
);

-- ============================================================================
-- 8) EXTEND EXISTING TABLE POLICIES
-- ============================================================================

-- Update documents policy to include deal-scoped access
DROP POLICY IF EXISTS documents_policy ON documents;
CREATE POLICY documents_read ON documents FOR SELECT
USING (
  -- Existing vehicle/investor access
  (vehicle_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM positions p
    JOIN investor_users iu ON iu.investor_id = p.investor_id
    WHERE p.vehicle_id = documents.vehicle_id
    AND iu.user_id = auth.uid()
  ))
  -- New deal-scoped access
  OR (deal_id IS NOT NULL AND user_has_deal_access(deal_id))
  -- Staff access
  OR user_is_staff()
);

-- Update conversations policy to include deal-scoped access
DROP POLICY IF EXISTS conversations_policy ON conversations;
CREATE POLICY conversations_read ON conversations FOR SELECT
USING (
  -- Existing investor access
  (investor_id IS NOT NULL AND user_linked_to_investor(investor_id))
  -- New deal-scoped access
  OR (deal_id IS NOT NULL AND user_has_deal_access(deal_id))
  -- Staff access
  OR user_is_staff()
);

-- Update request_tickets policy to include deal-scoped access
DROP POLICY IF EXISTS request_tickets_policy ON request_tickets;
CREATE POLICY request_tickets_read ON request_tickets FOR SELECT
USING (
  -- Existing investor access
  (investor_id IS NOT NULL AND user_linked_to_investor(investor_id))
  -- New deal-scoped access
  OR (deal_id IS NOT NULL AND user_has_deal_access(deal_id))
  -- Staff access
  OR user_is_staff()
);

-- ============================================================================
-- 9) INSERT/UPDATE/DELETE POLICIES (BASIC FRAMEWORK)
-- ============================================================================

-- Staff can insert/update most tables (detailed policies can be added later)
CREATE POLICY deals_staff_write ON deals FOR ALL
USING (user_is_staff())
WITH CHECK (user_is_staff());

CREATE POLICY deal_memberships_staff_write ON deal_memberships FOR ALL
USING (user_is_staff())
WITH CHECK (user_is_staff());

-- Investors can create their own reservations and commitments
CREATE POLICY reservations_investor_insert ON reservations FOR INSERT
WITH CHECK (user_linked_to_investor(investor_id));

CREATE POLICY deal_commitments_investor_insert ON deal_commitments FOR INSERT
WITH CHECK (user_linked_to_investor(investor_id));

-- Staff can approve/manage all workflow items
CREATE POLICY approvals_staff_write ON approvals FOR ALL
USING (user_is_staff())
WITH CHECK (user_is_staff());

CREATE POLICY allocations_staff_write ON allocations FOR ALL
USING (user_is_staff())
WITH CHECK (user_is_staff());

-- ============================================================================
-- 10) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION user_has_deal_access(uuid) IS 'Check if user has access to deal via membership or investor relationship';
COMMENT ON FUNCTION user_linked_to_investor(uuid) IS 'Check if user is linked to specific investor via investor_users';
COMMENT ON FUNCTION user_is_staff() IS 'Check if user has staff role for administrative access';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION user_has_deal_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_linked_to_investor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_staff() TO authenticated;