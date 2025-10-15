-- 021_introducers_enhancements.sql
-- Description: Extend introducer schema to support contact info, commission controls, and richer tracking.

-- ================================
-- Introducers table extensions
-- ================================

ALTER TABLE introducers
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS commission_cap_amount numeric(18,2),
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS agreement_expiry_date date,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);

ALTER TABLE introducers
  ALTER COLUMN default_commission_bps SET DEFAULT 0;

ALTER TABLE introducers
  DROP CONSTRAINT IF EXISTS introducers_default_commission_bps_check;
ALTER TABLE introducers
  ADD CONSTRAINT introducers_default_commission_bps_check
  CHECK (default_commission_bps IS NULL OR (default_commission_bps >= 0 AND default_commission_bps <= 300));

ALTER TABLE introducers
  DROP CONSTRAINT IF EXISTS introducers_status_check;

ALTER TABLE introducers
  ADD CONSTRAINT introducers_status_check
  CHECK (status IN ('active','inactive','suspended'));

CREATE INDEX IF NOT EXISTS idx_introducers_created_by ON introducers (created_by);

-- ================================
-- Introductions table extensions
-- ================================

ALTER TABLE introductions
  ADD COLUMN IF NOT EXISTS introduced_at date DEFAULT current_date,
  ADD COLUMN IF NOT EXISTS commission_rate_override_bps int,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);

ALTER TABLE introductions
  DROP CONSTRAINT IF EXISTS introductions_status_check;

ALTER TABLE introductions
  ADD CONSTRAINT introductions_status_check
  CHECK (status IN ('invited','joined','allocated','lost','inactive'));

ALTER TABLE introductions
  DROP CONSTRAINT IF EXISTS introductions_prospect_email_deal_id_key;

ALTER TABLE introductions
  DROP CONSTRAINT IF EXISTS introductions_unique_prospect_deal;
ALTER TABLE introductions
  ADD CONSTRAINT introductions_unique_prospect_deal UNIQUE (prospect_email, deal_id);

UPDATE introductions
SET introduced_at = COALESCE(introduced_at, created_at::date);

CREATE INDEX IF NOT EXISTS idx_introductions_introduced_at ON introductions (introduced_at DESC);

-- ================================
-- Introducer commissions extensions
-- ================================

ALTER TABLE introducer_commissions
  ADD COLUMN IF NOT EXISTS introduction_id uuid REFERENCES introductions(id),
  ADD COLUMN IF NOT EXISTS base_amount numeric(18,2),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_due_date date,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE introducer_commissions
  DROP CONSTRAINT IF EXISTS introducer_commissions_base_amount_check;
ALTER TABLE introducer_commissions
  ADD CONSTRAINT introducer_commissions_base_amount_check
  CHECK (base_amount IS NULL OR base_amount >= 0);

CREATE INDEX IF NOT EXISTS idx_introducer_commissions_introduction ON introducer_commissions (introduction_id);

-- ================================
-- Data hygiene
-- ================================

UPDATE introducers
SET default_commission_bps = 0
WHERE default_commission_bps IS NULL;
;
