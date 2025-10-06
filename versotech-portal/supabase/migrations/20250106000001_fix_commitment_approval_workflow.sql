-- Migration: Fix Commitment Approval Workflow
-- Date: 2025-01-06
-- Description: Creates trigger to automatically create approval records when investors submit commitments
-- Priority: CRITICAL - Fixes broken investor → staff workflow
-- Issue: Commitments submitted by investors never appear in approval queue

-- =============================================================================
-- CRITICAL FIX: Auto-create approval when commitment is submitted
-- =============================================================================

CREATE OR REPLACE FUNCTION create_commitment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text;
BEGIN
  -- Only create approval for submitted commitments
  IF NEW.status != 'submitted' THEN
    RETURN NEW;
  END IF;

  -- Calculate priority based on commitment amount
  v_priority := CASE
    WHEN NEW.requested_amount > 1000000 THEN 'critical'  -- >$1M
    WHEN NEW.requested_amount > 100000 THEN 'high'       -- >$100K
    WHEN NEW.requested_amount > 50000 THEN 'medium'      -- >$50K
    ELSE 'low'
  END;

  -- Create approval record
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
  ) VALUES (
    'deal_commitment',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_amount', NEW.requested_amount,
      'requested_units', NEW.requested_units,
      'fee_plan_id', NEW.selected_fee_plan_id,
      'commitment_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_commitment_create_approval ON deal_commitments;
CREATE TRIGGER on_commitment_create_approval
  AFTER INSERT ON deal_commitments
  FOR EACH ROW
  WHEN (NEW.status = 'submitted')
  EXECUTE FUNCTION create_commitment_approval();

-- Comment for documentation
COMMENT ON FUNCTION create_commitment_approval IS
  'Automatically creates approval record when investor submits commitment. Priority is calculated based on commitment amount: >$1M=critical, >$100K=high, >$50K=medium, else low.';

COMMENT ON TRIGGER on_commitment_create_approval ON deal_commitments IS
  'CRITICAL: Creates approval record for staff review when investor submits commitment';
