-- Database Migration 001: Core Deals Schema
-- Description: Creates deals, deal memberships, invite links, and introducers tables
-- Dependencies: Requires existing profiles, investors, vehicles, documents tables
-- Date: 2025-01-22

-- ============================================================================
-- 1) DEALS & MEMBERSHIP (deal-scoped access & invites)
-- ============================================================================

-- Core deals table
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deal memberships for scoped access
CREATE TABLE deal_memberships (
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),       -- null = external participant (lawyer/banker)
  role text CHECK (role IN ('investor','co_investor','spouse','advisor','lawyer','banker','introducer','viewer','verso_staff')) NOT NULL,
  invited_by uuid REFERENCES profiles(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (deal_id, user_id)
);

-- Invite links for external users
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

-- ============================================================================
-- 2) INTRODUCERS & ATTRIBUTION (commissions later invoiced)
-- ============================================================================

CREATE TABLE introducers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),  -- optional if introducer has a portal login
  legal_name text,
  agreement_doc_id uuid REFERENCES documents(id),
  default_commission_bps int,
  status text CHECK (status IN ('active','inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id uuid REFERENCES introducers(id) ON DELETE CASCADE,
  prospect_email text,
  prospect_investor_id uuid REFERENCES investors(id),
  deal_id uuid REFERENCES deals(id),
  status text CHECK (status IN ('invited','joined','allocated','lost')) DEFAULT 'invited',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3) INDEXES FOR PERFORMANCE
-- ============================================================================

-- Deals indexes
CREATE INDEX idx_deals_status_type ON deals (status, deal_type);
CREATE INDEX idx_deals_created_by ON deals (created_by);
CREATE INDEX idx_deals_vehicle_id ON deals (vehicle_id);
CREATE INDEX idx_deals_open_close ON deals (open_at, close_at);

-- Deal memberships indexes
CREATE INDEX idx_deal_memberships_user_id ON deal_memberships (user_id);
CREATE INDEX idx_deal_memberships_investor_id ON deal_memberships (investor_id);
CREATE INDEX idx_deal_memberships_role ON deal_memberships (role);

-- Invite links indexes
CREATE INDEX idx_invite_links_deal_id ON invite_links (deal_id);
CREATE INDEX idx_invite_links_expires_at ON invite_links (expires_at);

-- Introducers indexes
CREATE INDEX idx_introducers_user_id ON introducers (user_id);
CREATE INDEX idx_introducers_status ON introducers (status);

-- Introductions indexes
CREATE INDEX idx_introductions_introducer_id ON introductions (introducer_id);
CREATE INDEX idx_introductions_deal_investor ON introductions (deal_id, prospect_investor_id);

-- Introducer commissions indexes
CREATE INDEX idx_introducer_commissions_introducer ON introducer_commissions (introducer_id);
CREATE INDEX idx_introducer_commissions_deal_investor ON introducer_commissions (deal_id, investor_id);
CREATE INDEX idx_introducer_commissions_status ON introducer_commissions (status);

-- ============================================================================
-- 4) CONSTRAINTS & VALIDATION
-- ============================================================================

-- Ensure deal dates are logical
ALTER TABLE deals ADD CONSTRAINT chk_deal_dates
  CHECK (open_at IS NULL OR close_at IS NULL OR open_at <= close_at);

-- Ensure commission rate is reasonable
ALTER TABLE introducer_commissions ADD CONSTRAINT chk_commission_rate
  CHECK (rate_bps >= 0 AND rate_bps <= 5000); -- Max 50%

-- Ensure accrual amount is positive
ALTER TABLE introducer_commissions ADD CONSTRAINT chk_accrual_amount
  CHECK (accrual_amount >= 0);

-- Ensure invite link usage
ALTER TABLE invite_links ADD CONSTRAINT chk_invite_usage
  CHECK (used_count >= 0 AND used_count <= max_uses);

-- ============================================================================
-- 5) TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_introducers_updated_at BEFORE UPDATE ON introducers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_introductions_updated_at BEFORE UPDATE ON introductions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_introducer_commissions_updated_at BEFORE UPDATE ON introducer_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE deals IS 'Core deal/opportunity table with deal-specific access control';
COMMENT ON TABLE deal_memberships IS 'Users invited to specific deals with roles (investor, lawyer, etc.)';
COMMENT ON TABLE invite_links IS 'Time-limited invite tokens for external deal participants';
COMMENT ON TABLE introducers IS 'Third-party introducers who bring investors to deals';
COMMENT ON TABLE introductions IS 'Track which introducer brought which investor to which deal';
COMMENT ON TABLE introducer_commissions IS 'Commission accruals for introducers based on investor activity';

COMMENT ON COLUMN deals.terms_schema IS 'JSON schema parameters specific to deal_type (equity terms, credit terms, etc.)';
COMMENT ON COLUMN deals.offer_unit_price IS 'Default/suggested price per unit shown in UI';
COMMENT ON COLUMN deal_memberships.investor_id IS 'NULL for external participants (lawyers, bankers) who are not investors';
COMMENT ON COLUMN invite_links.token_hash IS 'Hashed version of the actual invite token sent via email';
COMMENT ON COLUMN introducer_commissions.basis_type IS 'What the commission is calculated on (invested amount, fees, spread, etc.)';