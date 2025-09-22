-- VERSO Holdings Portal - Deal Extension RLS Policies
-- Based on changes.md specification section 3
-- Run this AFTER deals-extension-schema.sql and existing-table-alterations.sql

-- ==========================================================================
-- 3) Row-Level Security (RLS) – Additions
-- Keep all existing PRD policies. Extend them to include deal membership as an entitlement path.
-- ==========================================================================

-- Enable RLS on all new tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE introducers ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE introducer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_lot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_lot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- DEALS & MEMBERSHIPS
-- ==========================================================================

-- Users can read a deal if they are members; staff read all
CREATE POLICY deal_read ON deals FOR SELECT
USING (
  EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = deals.id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Staff can create deals
CREATE POLICY deal_create ON deals FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Staff can update deals
CREATE POLICY deal_update ON deals FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Members can read their membership; staff read all
CREATE POLICY dm_read ON deal_memberships FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Staff can manage memberships
CREATE POLICY dm_manage ON deal_memberships FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Invite links - staff only
CREATE POLICY invite_links_staff ON invite_links FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- INTRODUCERS & ATTRIBUTION
-- ==========================================================================

-- Staff can manage introducers
CREATE POLICY introducers_staff ON introducers FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Introducers can read their own data
CREATE POLICY introducers_self ON introducers FOR SELECT
USING (user_id = auth.uid());

-- Staff manage introductions
CREATE POLICY introductions_staff ON introductions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Staff manage commissions
CREATE POLICY commissions_staff ON introducer_commissions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- INVENTORY & ALLOCATION
-- ==========================================================================

-- Staff manage share sources
CREATE POLICY share_sources_staff ON share_sources FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Deal members can view lots; staff manage
CREATE POLICY share_lots_read ON share_lots FOR SELECT
USING (
  EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = share_lots.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY share_lots_staff_manage ON share_lots FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Reservations: investors see their own via investor_id; deal members can view; staff all
CREATE POLICY reservations_read ON reservations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = reservations.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = reservations.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Investors can create reservations for themselves
CREATE POLICY reservations_create ON reservations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = reservations.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Staff can manage reservations
CREATE POLICY reservations_staff_manage ON reservations FOR UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Reservation lot items follow reservations policy
CREATE POLICY reservation_lot_items_read ON reservation_lot_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reservations r
    JOIN investor_users iu ON iu.investor_id = r.investor_id
    WHERE r.id = reservation_lot_items.reservation_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM reservations r
    JOIN deal_memberships dm ON dm.deal_id = r.deal_id
    WHERE r.id = reservation_lot_items.reservation_id AND dm.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Allocations: similar to reservations
CREATE POLICY allocations_read ON allocations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = allocations.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = allocations.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY allocations_staff_manage ON allocations FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Allocation lot items follow allocations
CREATE POLICY allocation_lot_items_read ON allocation_lot_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM allocations a
    JOIN investor_users iu ON iu.investor_id = a.investor_id
    WHERE a.id = allocation_lot_items.allocation_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM allocations a
    JOIN deal_memberships dm ON dm.deal_id = a.deal_id
    WHERE a.id = allocation_lot_items.allocation_id AND dm.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- ==========================================================================
-- APPROVALS & COMMITMENTS
-- ==========================================================================

-- Deal commitments: investor can create/view their own; deal members can view; staff manage
CREATE POLICY deal_commitments_read ON deal_commitments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = deal_commitments.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = deal_commitments.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY deal_commitments_create ON deal_commitments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = deal_commitments.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY deal_commitments_staff_manage ON deal_commitments FOR UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Approvals: staff only
CREATE POLICY approvals_staff ON approvals FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- FEES & TERMS
-- ==========================================================================

-- Fee plans: deal members can read; staff manage
CREATE POLICY fee_plans_read ON fee_plans FOR SELECT
USING (
  EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = fee_plans.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY fee_plans_staff_manage ON fee_plans FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Fee components follow fee plans
CREATE POLICY fee_components_read ON fee_components FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM fee_plans fp
    JOIN deal_memberships dm ON dm.deal_id = fp.deal_id
    WHERE fp.id = fee_components.fee_plan_id AND dm.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY fee_components_staff_manage ON fee_components FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Investor terms: investor can read their own; staff manage
CREATE POLICY investor_terms_read ON investor_terms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = investor_terms.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = investor_terms.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY investor_terms_staff_manage ON investor_terms FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Term sheets: investor can read their own; staff manage
CREATE POLICY term_sheets_read ON term_sheets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = term_sheets.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = term_sheets.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY term_sheets_staff_manage ON term_sheets FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- DOCUMENTS & PACKAGES
-- ==========================================================================

-- Doc templates: staff only
CREATE POLICY doc_templates_staff ON doc_templates FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Doc packages: investor can read their own; staff manage
CREATE POLICY doc_packages_read ON doc_packages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = doc_packages.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM deal_memberships dm WHERE dm.deal_id = doc_packages.deal_id AND dm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY doc_packages_staff_manage ON doc_packages FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Package items follow packages
CREATE POLICY doc_package_items_read ON doc_package_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doc_packages dp
    JOIN investor_users iu ON iu.investor_id = dp.investor_id
    WHERE dp.id = doc_package_items.package_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM doc_packages dp
    JOIN deal_memberships dm ON dm.deal_id = dp.deal_id
    WHERE dp.id = doc_package_items.package_id AND dm.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- E-sign envelopes: staff only
CREATE POLICY esign_envelopes_staff ON esign_envelopes FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- FINANCIAL DATA
-- ==========================================================================

-- Fee events: investor sees their own; staff see all
CREATE POLICY fee_events_read ON fee_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = fee_events.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY fee_events_staff_manage ON fee_events FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Invoices: investor sees their own; staff see all
CREATE POLICY invoices_read ON invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = invoices.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY invoices_staff_manage ON invoices FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Invoice lines follow invoices
CREATE POLICY invoice_lines_read ON invoice_lines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM invoices i
    JOIN investor_users iu ON iu.investor_id = i.investor_id
    WHERE i.id = invoice_lines.invoice_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Payments: similar to invoices
CREATE POLICY payments_read ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = payments.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

CREATE POLICY payments_staff_manage ON payments FOR INSERT, UPDATE, DELETE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Bank transactions: staff only
CREATE POLICY bank_transactions_staff ON bank_transactions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- Reconciliations: staff only
CREATE POLICY reconciliations_staff ON reconciliations FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- ==========================================================================
-- EXTEND EXISTING POLICIES for DEAL-SCOPED ACCESS
-- ==========================================================================

-- Update documents policy to include deal participation entitlement
-- This adds to the existing documents_read_entitled policy
CREATE POLICY "documents_deal_participants" ON documents FOR SELECT
USING (
  documents.deal_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = documents.deal_id AND dm.user_id = auth.uid()
  )
);

-- Update conversations policy to include deal participation
CREATE POLICY "conversations_deal_participants" ON conversations FOR SELECT
USING (
  conversations.deal_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = conversations.deal_id AND dm.user_id = auth.uid()
  )
);

-- Update request tickets to include deal participation
CREATE POLICY "request_tickets_deal_participants" ON request_tickets FOR SELECT
USING (
  request_tickets.deal_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = request_tickets.deal_id AND dm.user_id = auth.uid()
  )
);
