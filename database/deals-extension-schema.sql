-- VERSO Holdings Portal - Deal Extension Schema
-- Based on changes.md specification
-- Run this AFTER the base schema.sql

-- ==========================================================================
-- 1.1 Deals & Membership (deal-scoped access & invites)
-- ==========================================================================

CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),         -- nullable for direct positions
  name text NOT NULL,
  deal_type text CHECK (deal_type IN ('equity_secondary','equity_primary','credit_trade_finance','other')) DEFAULT 'equity_secondary',
  status text CHECK (status IN ('draft','open','allocation_pending','closed','cancelled')) DEFAULT 'open',
  currency text DEFAULT 'USD',
  open_at timestamptz,
  close_at timestamptz,
  terms_schema jsonb,                              -- typed parameters by deal_type
  offer_unit_price numeric(18,6),                  -- optional default price shown in UI
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE deal_memberships (
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),       -- null = external participant (lawyer/banker)
  role text CHECK (role IN ('investor','co_investor','spouse','advisor','lawyer','banker','introducer','viewer','verso_staff')) NOT NULL,
  invited_by uuid REFERENCES profiles(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  PRIMARY KEY (deal_id, user_id)
);

CREATE TABLE invite_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  role text NOT NULL,
  token_hash text UNIQUE NOT NULL,                 -- store only hash; raw token is emailed
  expires_at timestamptz,
  max_uses int DEFAULT 1,
  used_count int DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ==========================================================================
-- 1.2 Introducers & Attribution (commissions later invoiced)
-- ==========================================================================

CREATE TABLE introducers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),  -- optional if introducer has a portal login
  legal_name text,
  agreement_doc_id uuid REFERENCES documents(id),
  default_commission_bps int,
  status text CHECK (status IN ('active','inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id uuid REFERENCES introducers(id) ON DELETE CASCADE,
  prospect_email text,
  prospect_investor_id uuid REFERENCES investors(id),
  deal_id uuid REFERENCES deals(id),
  status text CHECK (status IN ('invited','joined','allocated','lost')) DEFAULT 'invited',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE introducer_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id uuid REFERENCES introducers(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id),
  investor_id uuid REFERENCES investors(id),
  basis_type text CHECK (basis_type IN ('invested_amount','spread','management_fee','performance_fee')),
  rate_bps int NOT NULL,
  accrual_amount numeric(18,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('accrued','invoiced','paid','cancelled')) DEFAULT 'accrued',
  invoice_id uuid,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ==========================================================================
-- 1.3 Inventory & Allocation (no oversell; first-come-first-served)
-- ==========================================================================

CREATE TABLE share_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text CHECK (kind IN ('company','fund','colleague','other')) NOT NULL,
  counterparty_name text,
  contract_doc_id uuid REFERENCES documents(id),
  notes text
);

CREATE TABLE share_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  source_id uuid REFERENCES share_sources(id),
  units_total numeric(28,8) NOT NULL,
  unit_cost numeric(18,6) NOT NULL,
  currency text DEFAULT 'USD',
  acquired_at date,
  lockup_until date,
  units_remaining numeric(28,8) NOT NULL,         -- decreases on reservation; restored on expiry
  status text CHECK (status IN ('available','held','exhausted')) DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chk_units_remaining_nonneg CHECK (units_remaining >= 0)
);

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  requested_units numeric(28,8) NOT NULL,
  proposed_unit_price numeric(18,6) NOT NULL,
  expires_at timestamptz NOT NULL,
  status text CHECK (status IN ('pending','approved','expired','cancelled')) DEFAULT 'pending',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- map reserved quantities to specific lots (for later exact allocation)
CREATE TABLE reservation_lot_items (
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES share_lots(id),
  units numeric(28,8) NOT NULL CHECK (units > 0),
  PRIMARY KEY (reservation_id, lot_id)
);

CREATE TABLE allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  unit_price numeric(18,6) NOT NULL,
  units numeric(28,8) NOT NULL,
  status text CHECK (status IN ('pending_review','approved','rejected','settled')) DEFAULT 'pending_review',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE allocation_lot_items (
  allocation_id uuid REFERENCES allocations(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES share_lots(id),
  units numeric(28,8) NOT NULL CHECK (units > 0),
  PRIMARY KEY (allocation_id, lot_id)
);

-- ==========================================================================
-- 1.4 Commit → Review → Allocate (approvals & compliance)
-- ==========================================================================

CREATE TABLE deal_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  selected_fee_plan_id uuid,          -- see fee_plans
  term_sheet_id uuid,                  -- see term_sheets/doc packages
  status text CHECK (status IN ('submitted','under_review','approved','rejected','cancelled')) DEFAULT 'submitted',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text,                    -- 'deal_commitment','allocation','document'
  entity_id uuid,
  action text,                         -- 'approve','reject','revise'
  status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  requested_by uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  decided_by uuid REFERENCES profiles(id),
  decided_at timestamptz,
  notes text,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

-- ==========================================================================
-- 1.5 Pricing Plans, Term Sheets & Document Automation
-- ==========================================================================

CREATE TABLE fee_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE fee_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_plan_id uuid REFERENCES fee_plans(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('subscription','management','performance','spread_markup','flat','other')) NOT NULL,
  calc_method text CHECK (calc_method IN ('percent_of_investment','percent_per_annum','percent_of_profit','per_unit_spread','fixed')),
  rate_bps int,
  flat_amount numeric(18,2),
  frequency text CHECK (frequency IN ('one_time','annual','quarterly','monthly','on_exit')) DEFAULT 'one_time',
  hurdle_rate_bps int,
  high_watermark boolean,
  notes text
);

CREATE TABLE investor_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  selected_fee_plan_id uuid REFERENCES fee_plans(id),
  overrides jsonb,
  status text CHECK (status IN ('active','superseded')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX uniq_investor_terms_active ON investor_terms (deal_id, investor_id) WHERE status='active';

CREATE TABLE term_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  fee_plan_id uuid REFERENCES fee_plans(id),
  price_per_unit numeric(18,6),
  currency text DEFAULT 'USD',
  valid_until timestamptz,
  status text CHECK (status IN ('draft','sent','accepted','rejected','expired')) DEFAULT 'draft',
  version int DEFAULT 1,
  supersedes_id uuid REFERENCES term_sheets(id),
  doc_id uuid REFERENCES documents(id),
  terms_data jsonb,    -- frozen inputs used to render the doc
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE doc_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,   -- e.g., 'term_sheet_v1','subscription_pack_equity_v1'
  name text NOT NULL,
  provider text CHECK (provider IN ('dropbox_sign','docusign','server_pdf')) NOT NULL,
  file_key text,
  schema jsonb               -- required merge fields
);

CREATE TABLE doc_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id),
  investor_id uuid REFERENCES investors(id),
  kind text CHECK (kind IN ('term_sheet','subscription_pack','nda')) NOT NULL,
  status text CHECK (status IN ('draft','sent','signed','cancelled')) DEFAULT 'draft',
  esign_envelope_id text,
  final_doc_id uuid REFERENCES documents(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE doc_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES doc_packages(id) ON DELETE CASCADE,
  template_id uuid REFERENCES doc_templates(id),
  merge_data jsonb,
  sort_order int
);

CREATE TABLE esign_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text,
  envelope_id text UNIQUE,
  status text,
  recipient_email text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ==========================================================================
-- 1.6 Fees, Invoices, Payments & Bank Reconciliation (+ Spread)
-- ==========================================================================

CREATE TABLE fee_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  fee_component_id uuid REFERENCES fee_components(id),
  event_date date NOT NULL,
  period_start date,
  period_end date,
  base_amount numeric(18,2),
  computed_amount numeric(18,2) NOT NULL,
  currency text DEFAULT 'USD',
  source_ref text,                 -- e.g. allocation id or valuation id
  status text CHECK (status IN ('accrued','invoiced','voided')) DEFAULT 'accrued',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  deal_id uuid REFERENCES deals(id),
  due_date date,
  currency text DEFAULT 'USD',
  subtotal numeric(18,2),
  tax numeric(18,2),
  total numeric(18,2),
  status text CHECK (status IN ('draft','sent','paid','partial','cancelled')) DEFAULT 'draft',
  generated_from text,             -- 'fee_events','introducer_commissions','manual'
  doc_id uuid REFERENCES documents(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('fee','spread','other')),
  description text,
  quantity numeric(28,8),
  unit_price numeric(18,6),
  amount numeric(18,2) NOT NULL,
  fee_event_id uuid REFERENCES fee_events(id)
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  invoice_id uuid REFERENCES invoices(id),
  amount numeric(18,2),
  currency text DEFAULT 'USD',
  paid_at timestamptz,
  method text,
  bank_txn_id uuid,
  status text CHECK (status IN ('received','applied','refunded')) DEFAULT 'received',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_ref text,
  amount numeric(18,2),
  currency text DEFAULT 'USD',
  value_date date,
  memo text,
  counterparty text,
  import_batch_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id),
  bank_transaction_id uuid REFERENCES bank_transactions(id),
  matched_amount numeric(18,2),
  matched_at timestamptz DEFAULT now(),
  matched_by uuid REFERENCES profiles(id)
);

-- ==========================================================================
-- INDEXES (performance optimization)
-- ==========================================================================

-- Deals
CREATE INDEX ON deals (status, deal_type);
CREATE INDEX ON deals (vehicle_id);
CREATE INDEX ON deals (created_by);

-- Deal memberships
CREATE INDEX ON deal_memberships (user_id);
CREATE INDEX ON deal_memberships (investor_id);

-- Share lots
CREATE INDEX ON share_lots (deal_id, status);
CREATE INDEX ON share_lots (status, units_remaining);

-- Reservations
CREATE INDEX ON reservations (deal_id, status, expires_at);
CREATE INDEX ON reservations (investor_id);

-- Allocations
CREATE INDEX ON allocations (deal_id, investor_id, status);

-- Fee events
CREATE INDEX ON fee_events (deal_id, investor_id, status, event_date);

-- Invoices
CREATE INDEX ON invoices (investor_id, deal_id, status);

-- Introductions/commissions
CREATE INDEX ON introductions (introducer_id);
CREATE INDEX ON introductions (deal_id, investor_id);
CREATE INDEX ON introducer_commissions (introducer_id);
CREATE INDEX ON introducer_commissions (deal_id, investor_id);

-- Approvals
CREATE INDEX ON approvals (entity_type, entity_id);
CREATE INDEX ON approvals (assigned_to, status);

-- Term sheets
CREATE INDEX ON term_sheets (deal_id, investor_id);
CREATE INDEX ON term_sheets (status);

-- Comments for context
COMMENT ON TABLE deals IS 'Central entity for deal-scoped collaboration and access';
COMMENT ON TABLE deal_memberships IS 'Maps users to deals with specific roles (investor, lawyer, etc.)';
COMMENT ON TABLE share_lots IS 'Inventory tracking with units_remaining for concurrency control';
COMMENT ON TABLE reservations IS 'Time-bounded holds on inventory before allocation';
COMMENT ON TABLE fee_plans IS 'Configurable fee structures per deal (all-in vs components)';
COMMENT ON TABLE investor_terms IS 'Per-investor fee plan selection and overrides';
COMMENT ON TABLE fee_events IS 'Accrued fees ready for invoicing';
