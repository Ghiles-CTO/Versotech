-- Migration: Extend Approvals Schema for SLA Management and Enhanced Workflow
-- Date: 2025-01-05
-- Description: Extends the approvals table with SLA tracking, secondary approval,
--              entity metadata caching, and creates approval_history table

-- =============================================================================
-- 1. Extend approvals table
-- =============================================================================

-- Add new status values
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_status_check;
ALTER TABLE approvals ADD CONSTRAINT approvals_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'awaiting_info', 'escalated', 'cancelled'));
-- Add new columns for enhanced functionality
ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS entity_metadata jsonb,
  ADD COLUMN IF NOT EXISTS request_reason text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,

  -- SLA management
  ADD COLUMN IF NOT EXISTS sla_breach_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_resumed_at timestamptz,
  ADD COLUMN IF NOT EXISTS actual_processing_time_hours numeric(10,2),

  -- Secondary approval workflow
  ADD COLUMN IF NOT EXISTS requires_secondary_approval boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS secondary_approver_role text,
  ADD COLUMN IF NOT EXISTS secondary_approved_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS secondary_approved_at timestamptz,

  -- Related entities for efficient filtering
  ADD COLUMN IF NOT EXISTS related_deal_id uuid REFERENCES deals(id),
  ADD COLUMN IF NOT EXISTS related_investor_id uuid REFERENCES investors(id),

  -- Lifecycle timestamps
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
-- Rename decided_by to approved_by for clarity (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'approvals' AND column_name = 'decided_by'
  ) THEN
    ALTER TABLE approvals RENAME COLUMN decided_by TO approved_by;
    ALTER TABLE approvals RENAME COLUMN decided_at TO approved_at;
  ELSE
    ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id);
    ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approved_at timestamptz;
  END IF;
END $$;
-- =============================================================================
-- 2. Create approval_history table for audit trail
-- =============================================================================

CREATE TABLE IF NOT EXISTS approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id uuid REFERENCES approvals(id) ON DELETE CASCADE NOT NULL,
  action text CHECK (action IN (
    'created', 'assigned', 'reassigned', 'approved',
    'rejected', 'escalated', 'info_requested', 'cancelled',
    'secondary_approved'
  )) NOT NULL,
  actor_id uuid REFERENCES profiles(id) NOT NULL,
  notes text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_approval_history_approval
  ON approval_history(approval_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_history_actor
  ON approval_history(actor_id, created_at DESC);
-- =============================================================================
-- 3. Add indexes for performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_approvals_status_sla
  ON approvals(status, sla_breach_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_approvals_assigned
  ON approvals(assigned_to, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_entity
  ON approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requester
  ON approvals(requested_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_related_deal
  ON approvals(related_deal_id)
  WHERE related_deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_approvals_related_investor
  ON approvals(related_investor_id)
  WHERE related_investor_id IS NOT NULL;
-- =============================================================================
-- 4. Create trigger function for auto-calculating SLA deadline
-- =============================================================================

CREATE OR REPLACE FUNCTION set_approval_sla_deadline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_sla_hours int;
BEGIN
  -- Only set SLA on insert if not already set
  IF TG_OP = 'INSERT' AND NEW.sla_breach_at IS NULL THEN
    -- Calculate SLA hours based on priority
    v_sla_hours := CASE NEW.priority
      WHEN 'critical' THEN 2
      WHEN 'high' THEN 4
      WHEN 'medium' THEN 24
      WHEN 'low' THEN 72
      ELSE 24
    END;

    NEW.sla_breach_at := now() + (v_sla_hours || ' hours')::interval;
  END IF;

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS approvals_set_sla ON approvals;
CREATE TRIGGER approvals_set_sla
  BEFORE INSERT ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION set_approval_sla_deadline();
-- =============================================================================
-- 5. Create trigger function for auto-assignment
-- =============================================================================

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

    -- Route based on entity type
    IF NEW.entity_type IN ('commitment', 'deal_commitment', 'reservation', 'allocation') THEN
      -- Try to get investor's primary RM from related_investor_id
      IF NEW.related_investor_id IS NOT NULL THEN
        -- For now, assign to first available RM
        -- TODO: Add primary_rm field to investors table
        SELECT id INTO v_assigned_to
        FROM profiles
        WHERE role = 'staff_rm'
        ORDER BY random()
        LIMIT 1;
      END IF;

    ELSIF NEW.entity_type IN ('kyc_change', 'profile_update') THEN
      -- Assign to compliance team (round-robin by random for now)
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_admin' AND title = 'compliance'
      ORDER BY random()
      LIMIT 1;

    ELSIF NEW.entity_type = 'withdrawal' THEN
      -- Assign to bizops team
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE title = 'bizops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- Fallback: assign to any available ops staff
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
DROP TRIGGER IF EXISTS approvals_auto_assign ON approvals;
CREATE TRIGGER approvals_auto_assign
  BEFORE INSERT ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_approval();
-- =============================================================================
-- 6. Create trigger function for logging approval changes
-- =============================================================================

CREATE OR REPLACE FUNCTION log_approval_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_action text;
  v_actor_id uuid;
BEGIN
  -- Determine action type and actor
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_actor_id := NEW.requested_by;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := CASE NEW.status
        WHEN 'approved' THEN 'approved'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'escalated' THEN 'escalated'
        WHEN 'awaiting_info' THEN 'info_requested'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'updated'
      END;
      v_actor_id := NEW.approved_by;

      -- Calculate processing time when resolved
      IF NEW.status IN ('approved', 'rejected') THEN
        NEW.resolved_at := now();

        -- Calculate actual time excluding paused periods
        IF NEW.sla_paused_at IS NOT NULL AND NEW.sla_resumed_at IS NOT NULL THEN
          -- Subtract paused duration
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (
              (now() - NEW.created_at) -
              (NEW.sla_resumed_at - NEW.sla_paused_at)
            )) / 3600;
        ELSE
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 3600;
        END IF;
      END IF;

    -- Assignment changes
    ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      v_action := 'reassigned';
      v_actor_id := NEW.assigned_to;

    -- Secondary approval
    ELSIF OLD.secondary_approved_at IS NULL AND NEW.secondary_approved_at IS NOT NULL THEN
      v_action := 'secondary_approved';
      v_actor_id := NEW.secondary_approved_by;
    ELSE
      -- Skip logging for minor updates
      RETURN NEW;
    END IF;

    -- Update the updated_at timestamp
    NEW.updated_at := now();
  END IF;

  -- Insert history record
  INSERT INTO approval_history (
    approval_id,
    action,
    actor_id,
    notes,
    metadata
  ) VALUES (
    NEW.id,
    v_action,
    COALESCE(v_actor_id, NEW.approved_by, NEW.assigned_to),
    NEW.notes,
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_assigned_to', OLD.assigned_to,
      'new_assigned_to', NEW.assigned_to
    )
  );

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS approvals_log_changes ON approvals;
CREATE TRIGGER approvals_log_changes
  AFTER INSERT OR UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION log_approval_change();
-- =============================================================================
-- 7. Create RPC function for approval statistics
-- =============================================================================

CREATE OR REPLACE FUNCTION get_approval_stats(p_staff_id uuid DEFAULT NULL)
RETURNS TABLE (
  total_pending int,
  overdue_count int,
  avg_processing_time_hours numeric,
  approval_rate_24h numeric,
  total_approved_30d int,
  total_rejected_30d int,
  total_awaiting_info int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH approval_data AS (
    SELECT
      a.status,
      a.sla_breach_at,
      a.actual_processing_time_hours,
      a.created_at,
      a.resolved_at
    FROM approvals a
    WHERE (p_staff_id IS NULL OR a.assigned_to = p_staff_id)
      AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::int,
    COUNT(*) FILTER (WHERE status = 'pending' AND sla_breach_at < now())::int,
    COALESCE(AVG(actual_processing_time_hours) FILTER (
      WHERE status IN ('approved', 'rejected') AND actual_processing_time_hours IS NOT NULL
    ), 0)::numeric(10,2),
    COALESCE(
      (COUNT(*) FILTER (WHERE status = 'approved' AND actual_processing_time_hours <= 24)::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status = 'approved'), 0) * 100
      ), 0
    )::numeric(5,2),
    COUNT(*) FILTER (WHERE status = 'approved')::int,
    COUNT(*) FILTER (WHERE status = 'rejected')::int,
    COUNT(*) FILTER (WHERE status = 'awaiting_info')::int
  FROM approval_data;
END;
$$;
-- =============================================================================
-- 8. Create RPC function for auto-approval criteria check
-- =============================================================================

CREATE OR REPLACE FUNCTION check_auto_approval_criteria(p_approval_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_approval record;
  v_investor record;
  v_previous_approvals int;
  v_recent_rejections int;
  v_commitment_amount numeric;
BEGIN
  -- Get approval details
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;

  -- Only auto-approve commitments
  IF v_approval.entity_type NOT IN ('commitment', 'deal_commitment') THEN
    RETURN false;
  END IF;

  -- Extract commitment amount from metadata
  IF v_approval.entity_metadata ? 'requested_amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'requested_amount')::numeric;
  ELSIF v_approval.entity_metadata ? 'amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'amount')::numeric;
  ELSE
    RETURN false; -- No amount data
  END IF;

  -- Check commitment amount threshold
  IF v_commitment_amount > 5000 THEN
    RETURN false;
  END IF;

  -- Get investor details if available
  IF v_approval.related_investor_id IS NOT NULL THEN
    SELECT * INTO v_investor FROM investors WHERE id = v_approval.related_investor_id;

    -- Check KYC status
    IF v_investor.kyc_status != 'completed' THEN
      RETURN false;
    END IF;

    -- Check previous successful approvals
    SELECT COUNT(*) INTO v_previous_approvals
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND entity_type IN ('commitment', 'deal_commitment')
      AND status = 'approved';

    IF v_previous_approvals < 3 THEN
      RETURN false;
    END IF;

    -- Check recent rejections
    SELECT COUNT(*) INTO v_recent_rejections
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND status = 'rejected'
      AND created_at >= CURRENT_DATE - INTERVAL '90 days';

    IF v_recent_rejections > 0 THEN
      RETURN false;
    END IF;
  ELSE
    -- No investor data, cannot auto-approve
    RETURN false;
  END IF;

  -- All criteria met
  RETURN true;
END;
$$;
-- =============================================================================
-- 9. Comments for documentation
-- =============================================================================

COMMENT ON TABLE approval_history IS 'Audit trail for all approval state changes';
COMMENT ON COLUMN approvals.entity_metadata IS 'Cached snapshot of entity data at time of approval request';
COMMENT ON COLUMN approvals.sla_breach_at IS 'Deadline for approval decision based on priority';
COMMENT ON COLUMN approvals.actual_processing_time_hours IS 'Actual time taken to approve/reject (excludes paused time)';
COMMENT ON COLUMN approvals.requires_secondary_approval IS 'Flag for dual-approval workflow (e.g., >$1M commitments)';
COMMENT ON FUNCTION get_approval_stats IS 'Returns approval queue statistics for dashboard KPIs';
COMMENT ON FUNCTION check_auto_approval_criteria IS 'Evaluates if approval request meets auto-approval criteria';
