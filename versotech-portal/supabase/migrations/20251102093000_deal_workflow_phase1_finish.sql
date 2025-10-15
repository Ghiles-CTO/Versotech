-- Migration: Deal Workflow Phase 1 Completion
-- Date: 2025-11-02 09:30
-- Description:
--   1. Extend approvals workflow to cover investor deal interests and subscription submissions.
--      Adds default priority/SLA handling and backfills existing records.
--   2. Archive legacy reservations and deal commitments to dedicated tables for historical reporting.

-- ============================================================================
-- 1. Approvals workflow additions for deal interests & subscriptions
-- ============================================================================

-- 1.1 Recreate auto_assign_approval to route new entity types
CREATE OR REPLACE FUNCTION auto_assign_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_assigned_to uuid;
  v_investor_id uuid;
BEGIN
  -- Only auto-assign on insert if not manually assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_to IS NULL THEN

    -- Extract investor_id from entity_metadata if available
    IF NEW.entity_metadata ? 'investor_id' THEN
      v_investor_id := (NEW.entity_metadata->>'investor_id')::uuid;
    END IF;

    -- Relationship-driven items route to the relationship management pod
    IF NEW.entity_type IN (
      'commitment',
      'deal_commitment',
      'deal_interest',
      'deal_subscription',
      'reservation',
      'allocation'
    ) THEN
      -- Try to get an RM (round-robin via random until account ownership lands)
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_rm'
      ORDER BY random()
      LIMIT 1;

    -- Compliance profile/KYC changes
    ELSIF NEW.entity_type IN ('kyc_change', 'profile_update') THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_admin' AND title = 'compliance'
      ORDER BY random()
      LIMIT 1;

    -- Liquidity / cash flow events
    ELSIF NEW.entity_type = 'withdrawal' THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE title = 'bizops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- Fallback: assign to ops pool
    IF v_assigned_to IS NULL THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_ops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    NEW.assigned_to := v_assigned_to;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_assign_approval() IS
  'Determines the default owner for new approvals. Updated to route deal_interest and deal_subscription items to the RM pod.';

-- 1.2 Helper function to derive indicative amount from JSON payloads
CREATE OR REPLACE FUNCTION get_subscription_amount(p_payload jsonb)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_amount numeric;
BEGIN
  IF p_payload ? 'amount' AND jsonb_typeof(p_payload->'amount') = 'number' THEN
    v_amount := (p_payload->>'amount')::numeric;
  ELSIF p_payload ? 'subscription_amount' AND jsonb_typeof(p_payload->'subscription_amount') = 'number' THEN
    v_amount := (p_payload->>'subscription_amount')::numeric;
  ELSIF p_payload ? 'commitment_amount' AND jsonb_typeof(p_payload->'commitment_amount') = 'number' THEN
    v_amount := (p_payload->>'commitment_amount')::numeric;
  ELSIF p_payload ? 'investment_amount' AND jsonb_typeof(p_payload->'investment_amount') = 'number' THEN
    v_amount := (p_payload->>'investment_amount')::numeric;
  END IF;

  RETURN v_amount;
END;
$$;

COMMENT ON FUNCTION get_subscription_amount(jsonb) IS
  'Best-effort parser that extracts a numeric amount from subscription payload JSON.';

-- 1.3 Create approval for investor deal interests
CREATE OR REPLACE FUNCTION create_deal_interest_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text := 'high';
  v_amount numeric;
  v_approval_id uuid;
BEGIN
  IF NEW.status <> 'pending_review' THEN
    RETURN NEW;
  END IF;

  v_amount := NEW.indicative_amount;
  IF v_amount IS NOT NULL THEN
    v_priority := CASE
      WHEN v_amount >= 1000000 THEN 'critical'
      WHEN v_amount >= 250000 THEN 'high'
      WHEN v_amount >= 50000 THEN 'medium'
      ELSE 'low'
    END;
  END IF;

  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  VALUES (
    'deal_interest',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'indicative_amount', NEW.indicative_amount,
      'indicative_currency', NEW.indicative_currency,
      'notes', NEW.notes,
      'submitted_at', NEW.submitted_at,
      'investor_id', NEW.investor_id,
      'deal_id', NEW.deal_id
    )
  )
  RETURNING id INTO v_approval_id;

  UPDATE investor_deal_interest
  SET approval_id = v_approval_id,
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_deal_interest_approval() IS
  'Auto-creates an approval when an investor submits interest in a deal. Priority scales with indicative amount.';

DROP TRIGGER IF EXISTS on_deal_interest_create_approval ON investor_deal_interest;
CREATE TRIGGER on_deal_interest_create_approval
  AFTER INSERT ON investor_deal_interest
  FOR EACH ROW
  WHEN (NEW.status = 'pending_review')
  EXECUTE FUNCTION create_deal_interest_approval();

-- 1.4 Create approval for subscription submissions
CREATE OR REPLACE FUNCTION create_deal_subscription_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text := 'high';
  v_amount numeric;
  v_approval_id uuid;
BEGIN
  IF NEW.status <> 'pending_review' THEN
    RETURN NEW;
  END IF;

  v_amount := get_subscription_amount(NEW.payload_json);

  IF v_amount IS NOT NULL THEN
    v_priority := CASE
      WHEN v_amount >= 5000000 THEN 'critical'
      WHEN v_amount >= 1000000 THEN 'high'
      WHEN v_amount >= 250000 THEN 'medium'
      ELSE 'low'
    END;
  END IF;

  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  VALUES (
    'deal_subscription',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'payload', NEW.payload_json,
      'submitted_at', NEW.submitted_at,
      'investor_id', NEW.investor_id,
      'deal_id', NEW.deal_id,
      'derived_amount', v_amount
    )
  )
  RETURNING id INTO v_approval_id;

  UPDATE deal_subscription_submissions
  SET approval_id = v_approval_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_deal_subscription_approval() IS
  'Auto-creates an approval when an investor submits a subscription pack. Priority scales with derived subscription amount.';

DROP TRIGGER IF EXISTS on_deal_subscription_create_approval ON deal_subscription_submissions;
CREATE TRIGGER on_deal_subscription_create_approval
  AFTER INSERT ON deal_subscription_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'pending_review')
  EXECUTE FUNCTION create_deal_subscription_approval();

-- 1.5 Backfill approvals for existing interest & subscription records
WITH interest_source AS (
  SELECT
    idi.*,
    COALESCE(
      CASE
        WHEN idi.indicative_amount IS NULL THEN NULL
        WHEN idi.indicative_amount >= 1000000 THEN 'critical'
        WHEN idi.indicative_amount >= 250000 THEN 'high'
        WHEN idi.indicative_amount >= 50000 THEN 'medium'
        ELSE 'low'
      END,
      'high'
    ) AS derived_priority
  FROM investor_deal_interest idi
  WHERE idi.status = 'pending_review'
    AND idi.approval_id IS NULL
),
interest_insert AS (
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  SELECT
    'deal_interest',
    src.id,
    'pending',
    'approve',
    src.derived_priority,
    src.created_by,
    src.deal_id,
    src.investor_id,
    jsonb_build_object(
      'indicative_amount', src.indicative_amount,
      'indicative_currency', src.indicative_currency,
      'notes', src.notes,
      'submitted_at', src.submitted_at,
      'investor_id', src.investor_id,
      'deal_id', src.deal_id
    )
  FROM interest_source src
  RETURNING id, entity_id
)
UPDATE investor_deal_interest idi
SET approval_id = interest_insert.id,
    updated_at = now()
FROM interest_insert
WHERE idi.id = interest_insert.entity_id;

WITH subscription_source AS (
  SELECT
    dss.*,
    get_subscription_amount(dss.payload_json) AS derived_amount
  FROM deal_subscription_submissions dss
  WHERE dss.status = 'pending_review'
    AND dss.approval_id IS NULL
),
subscription_insert AS (
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  SELECT
    'deal_subscription',
    src.id,
    'pending',
    'approve',
    CASE
      WHEN src.derived_amount IS NULL THEN 'high'
      WHEN src.derived_amount >= 5000000 THEN 'critical'
      WHEN src.derived_amount >= 1000000 THEN 'high'
      WHEN src.derived_amount >= 250000 THEN 'medium'
      ELSE 'low'
    END,
    src.created_by,
    src.deal_id,
    src.investor_id,
    jsonb_build_object(
      'payload', src.payload_json,
      'submitted_at', src.submitted_at,
      'investor_id', src.investor_id,
      'deal_id', src.deal_id,
      'derived_amount', src.derived_amount
    )
  FROM subscription_source src
  RETURNING id, entity_id
)
UPDATE deal_subscription_submissions dss
SET approval_id = subscription_insert.id
FROM subscription_insert
WHERE dss.id = subscription_insert.entity_id;

-- ============================================================================
-- 2. Archive legacy reservations and deal commitments
-- ============================================================================

-- 2.1 Create archive tables (structure copied + archived_at column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'reservations_archive'
  ) THEN
    CREATE TABLE reservations_archive (
      LIKE reservations INCLUDING DEFAULTS INCLUDING GENERATED INCLUDING IDENTITY INCLUDING COMMENTS,
      archived_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE reservations_archive ADD PRIMARY KEY (id);
  END IF;
END $$;

COMMENT ON TABLE reservations_archive IS
  'Read-only archive of legacy reservation requests captured prior to the interest-based workflow.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'deal_commitments_archive'
  ) THEN
    CREATE TABLE deal_commitments_archive (
      LIKE deal_commitments INCLUDING DEFAULTS INCLUDING GENERATED INCLUDING IDENTITY INCLUDING COMMENTS,
      archived_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE deal_commitments_archive ADD PRIMARY KEY (id);
  END IF;
END $$;

COMMENT ON TABLE deal_commitments_archive IS
  'Read-only archive of legacy deal commitments captured prior to the subscription workflow.';

-- 2.2 Copy existing rows that have not yet been archived
INSERT INTO reservations_archive
SELECT r.*, now()
FROM reservations r
LEFT JOIN reservations_archive ra ON ra.id = r.id
WHERE ra.id IS NULL;

INSERT INTO deal_commitments_archive
SELECT dc.*, now()
FROM deal_commitments dc
LEFT JOIN deal_commitments_archive dca ON dca.id = dc.id
WHERE dca.id IS NULL;

-- 2.3 Flag source tables as deprecated for documentation purposes
COMMENT ON TABLE reservations IS
  'DEPRECATED: reservation flow replaced by investor deal interests. Historical data mirrored in reservations_archive.';

COMMENT ON TABLE deal_commitments IS
  'DEPRECATED: legacy commitments replaced by subscription submissions. Historical data mirrored in deal_commitments_archive.';
