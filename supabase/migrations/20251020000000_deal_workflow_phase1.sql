-- Migration: Deal Workflow Phase 1 - Schema & Automation Foundations
-- Date: 2025-10-20
-- Description: Introduces term sheet storage, investor interest tracking, data room access, and subscription submission tables with baseline RLS.

-- ============================================================================
-- 1) TERM SHEET STRUCTURE (deal_fee_structures)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deal_fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  term_sheet_date date,
  transaction_type text,
  opportunity_summary text,
  issuer text,
  vehicle text,
  exclusive_arranger text,
  purchaser text,
  seller text,
  structure text,
  allocation_up_to numeric(18,2),
  price_per_share_text text,
  minimum_ticket numeric(18,2),
  maximum_ticket numeric(18,2),
  subscription_fee_percent numeric(7,4),
  management_fee_percent numeric(7,4),
  carried_interest_percent numeric(7,4),
  legal_counsel text,
  interest_confirmation_deadline timestamptz,
  capital_call_timeline text,
  completion_date_text text,
  in_principle_approval_text text,
  subscription_pack_note text,
  share_certificates_note text,
  subject_to_change_note text,
  validity_date timestamptz,
  term_sheet_html text,
  term_sheet_attachment_key text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  effective_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_deal_fee_structures_deal_status ON deal_fee_structures(deal_id, status);
CREATE INDEX IF NOT EXISTS idx_deal_fee_structures_effective ON deal_fee_structures(deal_id, effective_at DESC);
ALTER TABLE deal_fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_fee_structures_staff_select ON deal_fee_structures;
CREATE POLICY deal_fee_structures_staff_select ON deal_fee_structures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
  OR (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM deal_memberships dm
      WHERE dm.deal_id = deal_fee_structures.deal_id
        AND dm.user_id = auth.uid()
    )
  )
);
DROP POLICY IF EXISTS deal_fee_structures_staff_modify ON deal_fee_structures;
CREATE POLICY deal_fee_structures_staff_modify ON deal_fee_structures
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- ============================================================================
-- 2) INVESTOR INTEREST PIPELINE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_deal_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),
  indicative_amount numeric(18,2),
  indicative_currency text,
  notes text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'withdrawn')),
  approval_id uuid REFERENCES approvals(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_investor_deal_interest_deal ON investor_deal_interest(deal_id);
CREATE INDEX IF NOT EXISTS idx_investor_deal_interest_investor ON investor_deal_interest(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_deal_interest_status ON investor_deal_interest(status);
ALTER TABLE investor_deal_interest ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investor_deal_interest_select ON investor_deal_interest;
CREATE POLICY investor_deal_interest_select ON investor_deal_interest
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = investor_deal_interest.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS investor_deal_interest_insert_investor ON investor_deal_interest;
CREATE POLICY investor_deal_interest_insert_investor ON investor_deal_interest
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = investor_deal_interest.investor_id
      AND iu.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS investor_deal_interest_staff_all ON investor_deal_interest;
CREATE POLICY investor_deal_interest_staff_all ON investor_deal_interest
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
CREATE TABLE IF NOT EXISTS investor_interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interest_signals_investor ON investor_interest_signals(investor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interest_signals_deal ON investor_interest_signals(deal_id, created_at DESC);
ALTER TABLE investor_interest_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investor_interest_signals_select ON investor_interest_signals;
CREATE POLICY investor_interest_signals_select ON investor_interest_signals
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = investor_interest_signals.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS investor_interest_signals_insert ON investor_interest_signals;
CREATE POLICY investor_interest_signals_insert ON investor_interest_signals
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = investor_interest_signals.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS investor_interest_signals_staff_update ON investor_interest_signals;
CREATE POLICY investor_interest_signals_staff_update ON investor_interest_signals
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- ============================================================================
-- 3) DATA ROOM ACCESS & DOCUMENT VISIBILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS deal_data_room_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES profiles(id),
  auto_granted boolean NOT NULL DEFAULT false,
  notes text
);
CREATE INDEX IF NOT EXISTS idx_deal_data_room_access_deal_investor ON deal_data_room_access(deal_id, investor_id);
CREATE INDEX IF NOT EXISTS idx_deal_data_room_access_expires ON deal_data_room_access(expires_at);
ALTER TABLE deal_data_room_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_data_room_access_select ON deal_data_room_access;
CREATE POLICY deal_data_room_access_select ON deal_data_room_access
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = deal_data_room_access.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS deal_data_room_access_staff_modify ON deal_data_room_access;
CREATE POLICY deal_data_room_access_staff_modify ON deal_data_room_access
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
CREATE TABLE IF NOT EXISTS deal_data_room_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  folder text,
  file_key text NOT NULL,
  file_name text,
  visible_to_investors boolean NOT NULL DEFAULT false,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deal_data_room_documents_deal ON deal_data_room_documents(deal_id, folder);
CREATE INDEX IF NOT EXISTS idx_deal_data_room_documents_visibility ON deal_data_room_documents(visible_to_investors);
ALTER TABLE deal_data_room_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_data_room_documents_investor_select ON deal_data_room_documents;
CREATE POLICY deal_data_room_documents_investor_select ON deal_data_room_documents
FOR SELECT USING (
  visible_to_investors
  AND EXISTS (
    SELECT 1
    FROM investor_users iu
    JOIN deal_data_room_access access
      ON access.investor_id = iu.investor_id
     AND access.deal_id = deal_data_room_documents.deal_id
    WHERE iu.user_id = auth.uid()
      AND (access.revoked_at IS NULL)
      AND (access.expires_at IS NULL OR access.expires_at > now())
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS deal_data_room_documents_staff_modify ON deal_data_room_documents;
CREATE POLICY deal_data_room_documents_staff_modify ON deal_data_room_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- ============================================================================
-- 4) SUBSCRIPTION SUBMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS deal_subscription_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'cancelled')),
  approval_id uuid REFERENCES approvals(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_deal_subscription_submissions_deal ON deal_subscription_submissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_subscription_submissions_investor ON deal_subscription_submissions(investor_id);
CREATE INDEX IF NOT EXISTS idx_deal_subscription_submissions_status ON deal_subscription_submissions(status);
ALTER TABLE deal_subscription_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_subscription_submissions_select ON deal_subscription_submissions;
CREATE POLICY deal_subscription_submissions_select ON deal_subscription_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = deal_subscription_submissions.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS deal_subscription_submissions_insert_investor ON deal_subscription_submissions;
CREATE POLICY deal_subscription_submissions_insert_investor ON deal_subscription_submissions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = deal_subscription_submissions.investor_id
      AND iu.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS deal_subscription_submissions_staff_modify ON deal_subscription_submissions;
CREATE POLICY deal_subscription_submissions_staff_modify ON deal_subscription_submissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- ============================================================================
-- 5) AUTOMATION CALLBACK PLACEHOLDER (for future webhook audit if needed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  related_deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  related_investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_automation_webhook_events_type ON automation_webhook_events(event_type, received_at DESC);
ALTER TABLE automation_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS automation_webhook_events_staff ON automation_webhook_events;
CREATE POLICY automation_webhook_events_staff ON automation_webhook_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- ============================================================================
-- 6) HOUSEKEEPING
-- ============================================================================

COMMENT ON TABLE deal_fee_structures IS 'Structured term sheet data for each deal version (draft/published/archived).';
COMMENT ON TABLE investor_deal_interest IS 'Investor expressions of interest captured prior to formal commitments.';
COMMENT ON TABLE investor_interest_signals IS 'Signals captured when investors express general interest in closed deals.';
COMMENT ON TABLE deal_data_room_access IS 'Controls which investors can see data room documents and for how long.';
COMMENT ON TABLE deal_data_room_documents IS 'Documents made available in the investor data room with visibility flags.';
COMMENT ON TABLE deal_subscription_submissions IS 'Post-NDA subscription submissions awaiting staff approval.';
COMMENT ON TABLE automation_webhook_events IS 'Audit log of inbound automation webhooks (n8n).';
