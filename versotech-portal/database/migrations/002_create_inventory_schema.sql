-- Database Migration 002: Inventory & Allocation Schema
-- Description: Creates share sources, lots, reservations, and allocations for no-oversell inventory
-- Dependencies: Migration 001 (deals table)
-- Date: 2025-01-22

-- ============================================================================
-- 1) INVENTORY & ALLOCATION (no oversell; first-come-first-served)
-- ============================================================================

-- Share sources for tracking where shares come from
CREATE TABLE share_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text CHECK (kind IN ('company','fund','colleague','other')) NOT NULL,
  counterparty_name text,
  contract_doc_id uuid REFERENCES documents(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Share lots with atomic inventory tracking
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
  updated_at timestamptz DEFAULT now()
);

-- Reservations with TTL for preventing oversell
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  requested_units numeric(28,8) NOT NULL,
  proposed_unit_price numeric(18,6) NOT NULL,
  expires_at timestamptz NOT NULL,
  status text CHECK (status IN ('pending','approved','expired','cancelled')) DEFAULT 'pending',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Map reserved quantities to specific lots (for later exact allocation)
CREATE TABLE reservation_lot_items (
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES share_lots(id),
  units numeric(28,8) NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (reservation_id, lot_id)
);

-- Final allocations after approval
CREATE TABLE allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  unit_price numeric(18,6) NOT NULL,
  units numeric(28,8) NOT NULL,
  status text CHECK (status IN ('pending_review','approved','rejected','settled')) DEFAULT 'pending_review',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Track which lots were used for each allocation
CREATE TABLE allocation_lot_items (
  allocation_id uuid REFERENCES allocations(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES share_lots(id),
  units numeric(28,8) NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (allocation_id, lot_id)
);

-- ============================================================================
-- 2) COMMIT → REVIEW → ALLOCATE (approvals & compliance)
-- ============================================================================

-- Deal commitments from investors
CREATE TABLE deal_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  selected_fee_plan_id uuid,          -- see fee_plans in next migration
  term_sheet_id uuid,                  -- see term_sheets in fee migration
  status text CHECK (status IN ('submitted','under_review','approved','rejected','cancelled')) DEFAULT 'submitted',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generic approval system for commitments, allocations, documents
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
  sla_breach_at timestamptz,           -- calculated SLA deadline
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3) INDEXES FOR PERFORMANCE
-- ============================================================================

-- Share sources indexes
CREATE INDEX idx_share_sources_kind ON share_sources (kind);

-- Share lots indexes
CREATE INDEX idx_share_lots_deal_id_status ON share_lots (deal_id, status);
CREATE INDEX idx_share_lots_source_id ON share_lots (source_id);
CREATE INDEX idx_share_lots_acquired_at ON share_lots (acquired_at);

-- Reservations indexes (critical for expiry processing)
CREATE INDEX idx_reservations_deal_id_status ON reservations (deal_id, status);
CREATE INDEX idx_reservations_investor_id ON reservations (investor_id);
CREATE INDEX idx_reservations_expires_at ON reservations (expires_at);
CREATE INDEX idx_reservations_status_expires ON reservations (status, expires_at);

-- Reservation lot items indexes
CREATE INDEX idx_reservation_lot_items_lot_id ON reservation_lot_items (lot_id);

-- Allocations indexes
CREATE INDEX idx_allocations_deal_id_investor_id ON allocations (deal_id, investor_id);
CREATE INDEX idx_allocations_status ON allocations (status);
CREATE INDEX idx_allocations_approved_by ON allocations (approved_by);

-- Allocation lot items indexes
CREATE INDEX idx_allocation_lot_items_lot_id ON allocation_lot_items (lot_id);

-- Deal commitments indexes
CREATE INDEX idx_deal_commitments_deal_id ON deal_commitments (deal_id);
CREATE INDEX idx_deal_commitments_investor_id ON deal_commitments (investor_id);
CREATE INDEX idx_deal_commitments_status ON deal_commitments (status);

-- Approvals indexes (critical for SLA monitoring)
CREATE INDEX idx_approvals_entity_type_id ON approvals (entity_type, entity_id);
CREATE INDEX idx_approvals_status ON approvals (status);
CREATE INDEX idx_approvals_assigned_to ON approvals (assigned_to);
CREATE INDEX idx_approvals_sla_breach_at ON approvals (sla_breach_at);
CREATE INDEX idx_approvals_priority_status ON approvals (priority, status);

-- ============================================================================
-- 4) CONSTRAINTS & VALIDATION
-- ============================================================================

-- Share lots constraints
ALTER TABLE share_lots ADD CONSTRAINT chk_units_total_positive
  CHECK (units_total > 0);

ALTER TABLE share_lots ADD CONSTRAINT chk_units_remaining_valid
  CHECK (units_remaining >= 0 AND units_remaining <= units_total);

ALTER TABLE share_lots ADD CONSTRAINT chk_unit_cost_positive
  CHECK (unit_cost > 0);

-- Reservations constraints
ALTER TABLE reservations ADD CONSTRAINT chk_requested_units_positive
  CHECK (requested_units > 0);

ALTER TABLE reservations ADD CONSTRAINT chk_proposed_price_positive
  CHECK (proposed_unit_price > 0);

ALTER TABLE reservations ADD CONSTRAINT chk_expires_at_future
  CHECK (expires_at > created_at);

-- Reservation lot items constraints
ALTER TABLE reservation_lot_items ADD CONSTRAINT chk_reservation_units_positive
  CHECK (units > 0);

-- Allocations constraints
ALTER TABLE allocations ADD CONSTRAINT chk_allocation_units_positive
  CHECK (units > 0);

ALTER TABLE allocations ADD CONSTRAINT chk_allocation_price_positive
  CHECK (unit_price > 0);

-- Allocation lot items constraints
ALTER TABLE allocation_lot_items ADD CONSTRAINT chk_allocation_lot_units_positive
  CHECK (units > 0);

-- Deal commitments constraints
ALTER TABLE deal_commitments ADD CONSTRAINT chk_commitment_amounts
  CHECK (
    (requested_units IS NOT NULL AND requested_units > 0) OR
    (requested_amount IS NOT NULL AND requested_amount > 0)
  );

-- ============================================================================
-- 5) TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER update_share_sources_updated_at BEFORE UPDATE ON share_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_share_lots_updated_at BEFORE UPDATE ON share_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_commitments_updated_at BEFORE UPDATE ON deal_commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6) TRIGGERS FOR BUSINESS LOGIC
-- ============================================================================

-- Auto-update share lot status based on remaining units
CREATE OR REPLACE FUNCTION update_share_lot_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.units_remaining = 0 THEN
    NEW.status = 'exhausted';
  ELSIF NEW.units_remaining < NEW.units_total THEN
    NEW.status = 'held';
  ELSE
    NEW.status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_share_lot_status_trigger
  BEFORE UPDATE ON share_lots
  FOR EACH ROW
  EXECUTE FUNCTION update_share_lot_status();

-- Auto-calculate SLA breach time for approvals
CREATE OR REPLACE FUNCTION calculate_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
  -- Default SLA: 24 hours for normal priority, 12 hours for high priority
  IF NEW.priority = 'high' THEN
    NEW.sla_breach_at = NEW.created_at + INTERVAL '12 hours';
  ELSE
    NEW.sla_breach_at = NEW.created_at + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_sla_breach_trigger
  BEFORE INSERT ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sla_breach();

-- ============================================================================
-- 7) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE share_sources IS 'Sources of shares (company, fund, colleague) for tracking provenance';
COMMENT ON TABLE share_lots IS 'Specific lots of shares with atomic units_remaining for no-oversell guarantee';
COMMENT ON TABLE reservations IS 'Time-limited reservations (30min default) that decrement units_remaining';
COMMENT ON TABLE reservation_lot_items IS 'Maps reserved units to specific share lots for FIFO allocation';
COMMENT ON TABLE allocations IS 'Final approved allocations that update investor positions';
COMMENT ON TABLE allocation_lot_items IS 'Maps allocated units to specific share lots for cost basis tracking';
COMMENT ON TABLE deal_commitments IS 'Investor commitments awaiting approval before allocation';
COMMENT ON TABLE approvals IS 'Generic approval workflow for commitments, allocations, documents with SLA tracking';

COMMENT ON COLUMN share_lots.units_remaining IS 'Decremented atomically on reservation creation, restored on expiry';
COMMENT ON COLUMN reservations.expires_at IS 'Automatic expiry time (typically created_at + 30 minutes)';
COMMENT ON COLUMN approvals.sla_breach_at IS 'Calculated deadline for approval action based on priority';