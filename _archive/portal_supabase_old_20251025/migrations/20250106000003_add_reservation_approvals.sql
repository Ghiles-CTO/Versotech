-- Migration: Add Reservation Approval Workflow
-- Date: 2025-01-06
-- Description: Creates trigger to automatically create approval records when reservations are created
-- Priority: CRITICAL - Extends approval workflow to reservations
-- Issue: Reservations created by investors never appear in approval queue

-- =============================================================================
-- Auto-create approval for reservation requests
-- =============================================================================

CREATE OR REPLACE FUNCTION create_reservation_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text;
  v_reservation_value numeric;
BEGIN
  -- Only create approval for pending reservations
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Calculate reservation value
  v_reservation_value := NEW.requested_units * COALESCE(NEW.proposed_unit_price, 0);

  -- Calculate priority based on reservation value
  v_priority := CASE
    WHEN v_reservation_value > 1000000 THEN 'critical'  -- >$1M
    WHEN v_reservation_value > 500000 THEN 'high'       -- >$500K
    WHEN v_reservation_value > 100000 THEN 'medium'     -- >$100K
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
    'reservation',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_units', NEW.requested_units,
      'proposed_unit_price', NEW.proposed_unit_price,
      'reservation_value', v_reservation_value,
      'expires_at', NEW.expires_at,
      'reservation_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$;
-- Create trigger
DROP TRIGGER IF EXISTS on_reservation_create_approval ON reservations;
CREATE TRIGGER on_reservation_create_approval
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_reservation_approval();
-- Comment for documentation
COMMENT ON FUNCTION create_reservation_approval IS
  'Automatically creates approval record when reservation is created. Priority is calculated based on reservation value: >$1M=critical, >$500K=high, >$100K=medium, else low.';
COMMENT ON TRIGGER on_reservation_create_approval ON reservations IS
  'CRITICAL: Creates approval record for staff review when reservation is created with pending status';
