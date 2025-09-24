-- Database Migration 003: Fees, Documents & Financial Schema
-- Description: Creates fee plans, term sheets, document automation, invoices, and payments
-- Dependencies: Migration 001 (deals), Migration 002 (allocations)
-- Date: 2025-01-22

-- ============================================================================
-- 1) PRICING PLANS, TERM SHEETS & DOCUMENT AUTOMATION
-- ============================================================================

-- Fee plans per deal (All-in 5% vs 3% + 10% carry)
CREATE TABLE fee_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fee components within each plan
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
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Per-investor terms (selected fee plan + overrides)
CREATE TABLE investor_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  selected_fee_plan_id uuid REFERENCES fee_plans(id),
  overrides jsonb,
  status text CHECK (status IN ('active','superseded')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint: one active investor_terms per deal per investor
CREATE UNIQUE INDEX uniq_investor_terms_active
  ON investor_terms (deal_id, investor_id)
  WHERE status='active';

-- Generated term sheets with versioning
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document templates for automation
CREATE TABLE doc_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,   -- e.g., 'term_sheet_v1','subscription_pack_equity_v1'
  name text NOT NULL,
  provider text CHECK (provider IN ('dropbox_sign','docusign','server_pdf')) NOT NULL,
  file_key text,
  schema jsonb,               -- required merge fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document packages for multi-doc workflows
CREATE TABLE doc_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id),
  investor_id uuid REFERENCES investors(id),
  kind text CHECK (kind IN ('term_sheet','subscription_pack','nda')) NOT NULL,
  status text CHECK (status IN ('draft','sent','signed','cancelled')) DEFAULT 'draft',
  esign_envelope_id text,
  final_doc_id uuid REFERENCES documents(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items within document packages
CREATE TABLE doc_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES doc_packages(id) ON DELETE CASCADE,
  template_id uuid REFERENCES doc_templates(id),
  merge_data jsonb,
  sort_order int,
  created_at timestamptz DEFAULT now()
);

-- E-signature envelope tracking
CREATE TABLE esign_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text,
  envelope_id text UNIQUE,
  status text,
  recipient_email text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2) FEES, INVOICES, PAYMENTS & BANK RECONCILIATION (+ Spread)
-- ============================================================================

-- Fee events (accruals) based on allocations and time
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generated invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  deal_id uuid REFERENCES deals(id),
  invoice_number text UNIQUE,
  due_date date,
  currency text DEFAULT 'USD',
  subtotal numeric(18,2),
  tax numeric(18,2),
  total numeric(18,2),
  status text CHECK (status IN ('draft','sent','paid','partial','cancelled')) DEFAULT 'draft',
  generated_from text,             -- 'fee_events','introducer_commissions','manual'
  doc_id uuid REFERENCES documents(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice line items
CREATE TABLE invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('fee','spread','commission','other')),
  description text,
  quantity numeric(28,8),
  unit_price numeric(18,6),
  amount numeric(18,2) NOT NULL,
  fee_event_id uuid REFERENCES fee_events(id),
  created_at timestamptz DEFAULT now()
);

-- Recorded payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  invoice_id uuid REFERENCES invoices(id),
  amount numeric(18,2),
  currency text DEFAULT 'USD',
  paid_at timestamptz,
  method text,
  reference text,
  bank_txn_id uuid,
  status text CHECK (status IN ('received','applied','refunded')) DEFAULT 'received',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bank transactions for reconciliation
CREATE TABLE bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_ref text,
  amount numeric(18,2),
  currency text DEFAULT 'USD',
  value_date date,
  memo text,
  counterparty text,
  import_batch_id uuid,
  reconciled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reconciliation matches
CREATE TABLE reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id),
  bank_transaction_id uuid REFERENCES bank_transactions(id),
  matched_amount numeric(18,2),
  matched_at timestamptz DEFAULT now(),
  matched_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3) EXISTING TABLE ALTERATIONS
-- ============================================================================

-- Add deal scoping to existing documents table
ALTER TABLE documents ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX idx_documents_deal_id ON documents (deal_id, type);

-- Add deal scoping to existing conversations table
ALTER TABLE conversations ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX idx_conversations_deal_id ON conversations (deal_id, type);

-- Add deal scoping to existing request_tickets table
ALTER TABLE request_tickets ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX idx_request_tickets_deal_id ON request_tickets (deal_id, status);

-- Update deal_commitments to reference fee plans and term sheets
ALTER TABLE deal_commitments ADD CONSTRAINT fk_selected_fee_plan
  FOREIGN KEY (selected_fee_plan_id) REFERENCES fee_plans(id);

ALTER TABLE deal_commitments ADD CONSTRAINT fk_term_sheet
  FOREIGN KEY (term_sheet_id) REFERENCES term_sheets(id);

-- ============================================================================
-- 4) INDEXES FOR PERFORMANCE
-- ============================================================================

-- Fee plans indexes
CREATE INDEX idx_fee_plans_deal_id ON fee_plans (deal_id);
CREATE INDEX idx_fee_plans_default ON fee_plans (deal_id, is_default);

-- Fee components indexes
CREATE INDEX idx_fee_components_plan_id ON fee_components (fee_plan_id);
CREATE INDEX idx_fee_components_kind ON fee_components (kind);

-- Investor terms indexes
CREATE INDEX idx_investor_terms_deal_investor ON investor_terms (deal_id, investor_id);
CREATE INDEX idx_investor_terms_fee_plan ON investor_terms (selected_fee_plan_id);

-- Term sheets indexes
CREATE INDEX idx_term_sheets_deal_investor ON term_sheets (deal_id, investor_id);
CREATE INDEX idx_term_sheets_status ON term_sheets (status);
CREATE INDEX idx_term_sheets_valid_until ON term_sheets (valid_until);

-- Document templates indexes
CREATE INDEX idx_doc_templates_provider ON doc_templates (provider);

-- Document packages indexes
CREATE INDEX idx_doc_packages_deal_investor ON doc_packages (deal_id, investor_id);
CREATE INDEX idx_doc_packages_status ON doc_packages (status);

-- Fee events indexes
CREATE INDEX idx_fee_events_deal_investor ON fee_events (deal_id, investor_id);
CREATE INDEX idx_fee_events_status_date ON fee_events (status, event_date);
CREATE INDEX idx_fee_events_component_id ON fee_events (fee_component_id);

-- Invoices indexes
CREATE INDEX idx_invoices_investor_deal ON invoices (investor_id, deal_id);
CREATE INDEX idx_invoices_status ON invoices (status);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);

-- Payments indexes
CREATE INDEX idx_payments_investor_id ON payments (investor_id);
CREATE INDEX idx_payments_invoice_id ON payments (invoice_id);
CREATE INDEX idx_payments_paid_at ON payments (paid_at);

-- Bank transactions indexes
CREATE INDEX idx_bank_transactions_value_date ON bank_transactions (value_date);
CREATE INDEX idx_bank_transactions_reconciled ON bank_transactions (reconciled);
CREATE INDEX idx_bank_transactions_amount ON bank_transactions (amount);

-- Reconciliations indexes
CREATE INDEX idx_reconciliations_invoice_id ON reconciliations (invoice_id);
CREATE INDEX idx_reconciliations_bank_txn_id ON reconciliations (bank_transaction_id);

-- ============================================================================
-- 5) CONSTRAINTS & VALIDATION
-- ============================================================================

-- Fee components constraints
ALTER TABLE fee_components ADD CONSTRAINT chk_fee_rate_or_amount
  CHECK ((rate_bps IS NOT NULL) OR (flat_amount IS NOT NULL));

ALTER TABLE fee_components ADD CONSTRAINT chk_fee_rate_reasonable
  CHECK (rate_bps IS NULL OR (rate_bps >= 0 AND rate_bps <= 10000)); -- Max 100%

-- Fee events constraints
ALTER TABLE fee_events ADD CONSTRAINT chk_fee_computed_amount_positive
  CHECK (computed_amount >= 0);

-- Invoices constraints
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_totals
  CHECK (total >= 0 AND subtotal >= 0 AND tax >= 0);

-- Payments constraints
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount_positive
  CHECK (amount > 0);

-- Bank transactions constraints
ALTER TABLE bank_transactions ADD CONSTRAINT chk_bank_amount_nonzero
  CHECK (amount != 0);

-- Reconciliations constraints
ALTER TABLE reconciliations ADD CONSTRAINT chk_reconciliation_amount_positive
  CHECK (matched_amount > 0);

-- ============================================================================
-- 6) TRIGGERS FOR UPDATED_AT AND BUSINESS LOGIC
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER update_fee_plans_updated_at BEFORE UPDATE ON fee_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_components_updated_at BEFORE UPDATE ON fee_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_terms_updated_at BEFORE UPDATE ON investor_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_term_sheets_updated_at BEFORE UPDATE ON term_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doc_templates_updated_at BEFORE UPDATE ON doc_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doc_packages_updated_at BEFORE UPDATE ON doc_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esign_envelopes_updated_at BEFORE UPDATE ON esign_envelopes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_events_updated_at BEFORE UPDATE ON fee_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON bank_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'INV-' || TO_CHAR(NEW.created_at, 'YYYY') || '-' ||
                        LPAD(nextval('invoice_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- 7) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE fee_plans IS 'Fee structures per deal (All-in 5% vs 3% + 10% carry)';
COMMENT ON TABLE fee_components IS 'Individual fee components within each plan (subscription, management, performance)';
COMMENT ON TABLE investor_terms IS 'Selected fee plan per investor per deal with optional overrides';
COMMENT ON TABLE term_sheets IS 'Generated term sheets with versioning and merge data';
COMMENT ON TABLE doc_templates IS 'Reusable document templates for automation (Dropbox Sign, DocuSign, PDF)';
COMMENT ON TABLE doc_packages IS 'Multi-document workflows (term sheet + subscription pack)';
COMMENT ON TABLE fee_events IS 'Fee accruals based on allocations, time, and valuations';
COMMENT ON TABLE invoices IS 'Generated invoices from fee events and commissions';
COMMENT ON TABLE payments IS 'Recorded payments against invoices';
COMMENT ON TABLE bank_transactions IS 'Imported bank transactions for reconciliation';
COMMENT ON TABLE reconciliations IS 'Manual/automatic matches between payments and bank transactions';

COMMENT ON COLUMN fee_components.rate_bps IS 'Fee rate in basis points (100 bps = 1%)';
COMMENT ON COLUMN fee_events.source_ref IS 'Reference to allocation_id, valuation_id, or other source event';
COMMENT ON COLUMN invoices.generated_from IS 'Source of invoice generation (fee_events, commissions, manual)';
COMMENT ON COLUMN term_sheets.terms_data IS 'Frozen snapshot of all inputs used to generate the document';