-- Database Migration 005: Server-side Functions for Inventory Management
-- Description: Critical functions for no-oversell inventory, reservations, and fee calculations
-- Dependencies: Migrations 001-004 (all schema and RLS)
-- Date: 2025-01-22

-- ============================================================================
-- 1) INVENTORY RESERVATION FUNCTION (CRITICAL - NO OVERSELL)
-- ============================================================================

-- Reserve inventory atomically with FIFO allocation and expiry
CREATE OR REPLACE FUNCTION fn_reserve_inventory(
  p_deal_id uuid,
  p_investor_id uuid,
  p_requested_units numeric(28,8),
  p_proposed_unit_price numeric(18,6),
  p_hold_minutes int DEFAULT 30,
  p_created_by uuid DEFAULT auth.uid()
) RETURNS jsonb AS $$
DECLARE
  v_reservation_id uuid;
  v_expires_at timestamptz;
  v_remaining_to_allocate numeric(28,8);
  v_lot_record record;
  v_allocated_units numeric(28,8);
  v_result jsonb;
BEGIN
  -- Validate inputs
  IF p_requested_units <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested units must be positive');
  END IF;

  IF p_proposed_unit_price <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Proposed unit price must be positive');
  END IF;

  -- Check deal status
  IF NOT EXISTS (
    SELECT 1 FROM deals
    WHERE id = p_deal_id
    AND status IN ('open', 'allocation_pending')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deal is not open for reservations');
  END IF;

  -- Check available inventory
  IF (
    SELECT COALESCE(SUM(units_remaining), 0)
    FROM share_lots
    WHERE deal_id = p_deal_id
    AND status = 'available'
  ) < p_requested_units THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient inventory available');
  END IF;

  -- Calculate expiry time
  v_expires_at := now() + (p_hold_minutes || ' minutes')::interval;

  -- Create reservation record
  INSERT INTO reservations (
    deal_id,
    investor_id,
    requested_units,
    proposed_unit_price,
    expires_at,
    created_by
  ) VALUES (
    p_deal_id,
    p_investor_id,
    p_requested_units,
    p_proposed_unit_price,
    v_expires_at,
    p_created_by
  ) RETURNING id INTO v_reservation_id;

  -- Allocate from lots using FIFO (FOR UPDATE SKIP LOCKED for concurrency)
  v_remaining_to_allocate := p_requested_units;

  FOR v_lot_record IN
    SELECT id, units_remaining
    FROM share_lots
    WHERE deal_id = p_deal_id
    AND status = 'available'
    AND units_remaining > 0
    ORDER BY acquired_at ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Calculate how many units to allocate from this lot
    v_allocated_units := LEAST(v_lot_record.units_remaining, v_remaining_to_allocate);

    -- Create reservation lot item
    INSERT INTO reservation_lot_items (
      reservation_id,
      lot_id,
      units
    ) VALUES (
      v_reservation_id,
      v_lot_record.id,
      v_allocated_units
    );

    -- Decrement lot's remaining units
    UPDATE share_lots
    SET units_remaining = units_remaining - v_allocated_units
    WHERE id = v_lot_record.id;

    -- Reduce remaining allocation needed
    v_remaining_to_allocate := v_remaining_to_allocate - v_allocated_units;

    -- Exit when fully allocated
    IF v_remaining_to_allocate <= 0 THEN
      EXIT;
    END IF;
  END LOOP;

  -- Verify full allocation (should not happen due to earlier check, but safety net)
  IF v_remaining_to_allocate > 0 THEN
    RAISE EXCEPTION 'Failed to fully allocate % units, % remaining', p_requested_units, v_remaining_to_allocate;
  END IF;

  -- Build success response
  v_result := jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at,
    'units_reserved', p_requested_units,
    'lots_used', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'lot_id', lot_id,
          'units', units
        )
      )
      FROM reservation_lot_items
      WHERE reservation_id = v_reservation_id
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Reservation failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2) RESERVATION EXPIRY FUNCTION (CRON JOB)
-- ============================================================================

-- Expire reservations and restore inventory
CREATE OR REPLACE FUNCTION fn_expire_reservations(
  p_reservation_id uuid DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_expired_count int := 0;
  v_reservation_record record;
  v_restored_units numeric(28,8);
BEGIN
  -- Process specific reservation or all expired ones
  FOR v_reservation_record IN
    SELECT id, deal_id, investor_id, requested_units
    FROM reservations
    WHERE status = 'pending'
    AND expires_at < now()
    AND (p_reservation_id IS NULL OR id = p_reservation_id)
  LOOP
    -- Restore units to share lots
    UPDATE share_lots
    SET units_remaining = units_remaining + rli.units
    FROM reservation_lot_items rli
    WHERE share_lots.id = rli.lot_id
    AND rli.reservation_id = v_reservation_record.id;

    -- Mark reservation as expired
    UPDATE reservations
    SET status = 'expired'
    WHERE id = v_reservation_record.id
    AND status = 'pending'; -- Double-check to prevent race conditions

    -- Count if actually updated
    IF FOUND THEN
      v_expired_count := v_expired_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expired_count', v_expired_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Expiry failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3) ALLOCATION FINALIZATION FUNCTION
-- ============================================================================

-- Convert approved reservation to final allocation
CREATE OR REPLACE FUNCTION fn_finalize_allocation(
  p_reservation_id uuid,
  p_approver_id uuid DEFAULT auth.uid()
) RETURNS jsonb AS $$
DECLARE
  v_reservation_record record;
  v_allocation_id uuid;
  v_weighted_cost numeric(18,6);
  v_spread_amount numeric(18,2);
BEGIN
  -- Get reservation details
  SELECT * INTO v_reservation_record
  FROM reservations
  WHERE id = p_reservation_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found or not pending');
  END IF;

  -- Check if reservation has expired
  IF v_reservation_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation has expired');
  END IF;

  -- Create allocation
  INSERT INTO allocations (
    deal_id,
    investor_id,
    unit_price,
    units,
    status,
    approved_by,
    approved_at
  ) VALUES (
    v_reservation_record.deal_id,
    v_reservation_record.investor_id,
    v_reservation_record.proposed_unit_price,
    v_reservation_record.requested_units,
    'approved',
    p_approver_id,
    now()
  ) RETURNING id INTO v_allocation_id;

  -- Copy reservation lot items to allocation lot items
  INSERT INTO allocation_lot_items (allocation_id, lot_id, units)
  SELECT v_allocation_id, lot_id, units
  FROM reservation_lot_items
  WHERE reservation_id = p_reservation_id;

  -- Mark reservation as approved
  UPDATE reservations
  SET status = 'approved'
  WHERE id = p_reservation_id;

  -- Calculate weighted average cost for spread computation
  SELECT
    SUM(rli.units * sl.unit_cost) / SUM(rli.units) INTO v_weighted_cost
  FROM reservation_lot_items rli
  JOIN share_lots sl ON sl.id = rli.lot_id
  WHERE rli.reservation_id = p_reservation_id;

  -- Calculate spread (allocation price - weighted cost) * units
  v_spread_amount := (v_reservation_record.proposed_unit_price - v_weighted_cost) * v_reservation_record.requested_units;

  -- Update investor positions (upsert)
  INSERT INTO positions (
    investor_id,
    vehicle_id,
    units,
    cost_basis,
    last_nav,
    as_of_date
  )
  SELECT
    v_reservation_record.investor_id,
    d.vehicle_id,
    v_reservation_record.requested_units,
    v_weighted_cost * v_reservation_record.requested_units,
    v_reservation_record.proposed_unit_price,
    current_date
  FROM deals d
  WHERE d.id = v_reservation_record.deal_id
  AND d.vehicle_id IS NOT NULL
  ON CONFLICT (investor_id, vehicle_id)
  DO UPDATE SET
    units = positions.units + EXCLUDED.units,
    cost_basis = positions.cost_basis + EXCLUDED.cost_basis,
    last_nav = EXCLUDED.last_nav,
    as_of_date = EXCLUDED.as_of_date;

  RETURN jsonb_build_object(
    'success', true,
    'allocation_id', v_allocation_id,
    'spread_amount', v_spread_amount,
    'weighted_cost', v_weighted_cost
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Allocation failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4) FEE CALCULATION FUNCTIONS
-- ============================================================================

-- Compute fee events for a deal and investor
CREATE OR REPLACE FUNCTION fn_compute_fee_events(
  p_deal_id uuid,
  p_investor_id uuid DEFAULT NULL,
  p_as_of_date date DEFAULT current_date
) RETURNS jsonb AS $$
DECLARE
  v_events_created int := 0;
  v_fee_record record;
  v_base_amount numeric(18,2);
  v_computed_amount numeric(18,2);
BEGIN
  -- Loop through active investor terms and fee components
  FOR v_fee_record IN
    SELECT
      it.deal_id,
      it.investor_id,
      fc.id as fee_component_id,
      fc.kind,
      fc.calc_method,
      fc.rate_bps,
      fc.flat_amount,
      fc.frequency
    FROM investor_terms it
    JOIN fee_plans fp ON fp.id = it.selected_fee_plan_id
    JOIN fee_components fc ON fc.fee_plan_id = fp.id
    WHERE it.deal_id = p_deal_id
    AND it.status = 'active'
    AND (p_investor_id IS NULL OR it.investor_id = p_investor_id)
  LOOP
    v_base_amount := 0;
    v_computed_amount := 0;

    -- Calculate base amount based on fee type
    CASE v_fee_record.calc_method
      WHEN 'percent_of_investment' THEN
        -- Base on approved allocations
        SELECT COALESCE(SUM(unit_price * units), 0) INTO v_base_amount
        FROM allocations
        WHERE deal_id = v_fee_record.deal_id
        AND investor_id = v_fee_record.investor_id
        AND status = 'approved';

      WHEN 'fixed' THEN
        -- Flat fee
        v_base_amount := COALESCE(v_fee_record.flat_amount, 0);

      -- Add other calculation methods as needed
      ELSE
        v_base_amount := 0;
    END CASE;

    -- Calculate computed amount
    IF v_fee_record.rate_bps IS NOT NULL THEN
      v_computed_amount := v_base_amount * v_fee_record.rate_bps / 10000.0;
    ELSE
      v_computed_amount := v_base_amount;
    END IF;

    -- Only create fee event if amount > 0 and not already exists
    IF v_computed_amount > 0 AND NOT EXISTS (
      SELECT 1 FROM fee_events
      WHERE deal_id = v_fee_record.deal_id
      AND investor_id = v_fee_record.investor_id
      AND fee_component_id = v_fee_record.fee_component_id
      AND event_date = p_as_of_date
    ) THEN
      INSERT INTO fee_events (
        deal_id,
        investor_id,
        fee_component_id,
        event_date,
        base_amount,
        computed_amount
      ) VALUES (
        v_fee_record.deal_id,
        v_fee_record.investor_id,
        v_fee_record.fee_component_id,
        p_as_of_date,
        v_base_amount,
        v_computed_amount
      );

      v_events_created := v_events_created + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'events_created', v_events_created
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Fee calculation failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5) INVOICE GENERATION FUNCTION
-- ============================================================================

-- Generate invoice from accrued fee events
CREATE OR REPLACE FUNCTION fn_invoice_fees(
  p_deal_id uuid,
  p_investor_id uuid,
  p_up_to_date date DEFAULT current_date
) RETURNS jsonb AS $$
DECLARE
  v_invoice_id uuid;
  v_subtotal numeric(18,2) := 0;
  v_fee_event_record record;
  v_line_count int := 0;
BEGIN
  -- Check if there are unbilled fee events
  IF NOT EXISTS (
    SELECT 1 FROM fee_events
    WHERE deal_id = p_deal_id
    AND investor_id = p_investor_id
    AND status = 'accrued'
    AND event_date <= p_up_to_date
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'No unbilled fee events found');
  END IF;

  -- Create invoice
  INSERT INTO invoices (
    investor_id,
    deal_id,
    due_date,
    generated_from
  ) VALUES (
    p_investor_id,
    p_deal_id,
    current_date + interval '30 days',
    'fee_events'
  ) RETURNING id INTO v_invoice_id;

  -- Add fee event line items
  FOR v_fee_event_record IN
    SELECT
      fe.id,
      fe.computed_amount,
      fc.kind,
      fc.name as fee_name
    FROM fee_events fe
    JOIN fee_components fc ON fc.id = fe.fee_component_id
    WHERE fe.deal_id = p_deal_id
    AND fe.investor_id = p_investor_id
    AND fe.status = 'accrued'
    AND fe.event_date <= p_up_to_date
  LOOP
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount,
      fee_event_id
    ) VALUES (
      v_invoice_id,
      'fee',
      v_fee_event_record.fee_name || ' Fee',
      1,
      v_fee_event_record.computed_amount,
      v_fee_event_record.computed_amount,
      v_fee_event_record.id
    );

    v_subtotal := v_subtotal + v_fee_event_record.computed_amount;
    v_line_count := v_line_count + 1;

    -- Mark fee event as invoiced
    UPDATE fee_events
    SET status = 'invoiced'
    WHERE id = v_fee_event_record.id;
  END LOOP;

  -- Update invoice totals
  UPDATE invoices
  SET
    subtotal = v_subtotal,
    tax = 0, -- Add tax calculation logic if needed
    total = v_subtotal
  WHERE id = v_invoice_id;

  RETURN jsonb_build_object(
    'success', true,
    'invoice_id', v_invoice_id,
    'line_count', v_line_count,
    'total_amount', v_subtotal
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invoice generation failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6) UTILITY FUNCTIONS
-- ============================================================================

-- Get deal inventory summary
CREATE OR REPLACE FUNCTION fn_get_deal_inventory(
  p_deal_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_units', COALESCE(SUM(units_total), 0),
    'units_remaining', COALESCE(SUM(units_remaining), 0),
    'units_reserved', COALESCE(SUM(units_total - units_remaining), 0),
    'utilization_percent', CASE
      WHEN SUM(units_total) > 0 THEN
        ROUND((SUM(units_total - units_remaining) / SUM(units_total) * 100)::numeric, 2)
      ELSE 0
    END,
    'lots_count', COUNT(*),
    'lots_available', COUNT(*) FILTER (WHERE status = 'available'),
    'lots_exhausted', COUNT(*) FILTER (WHERE status = 'exhausted')
  ) INTO v_result
  FROM share_lots
  WHERE deal_id = p_deal_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7) GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION fn_reserve_inventory(uuid, uuid, numeric, numeric, int, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_expire_reservations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_finalize_allocation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_compute_fee_events(uuid, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_invoice_fees(uuid, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_deal_inventory(uuid) TO authenticated;

-- Grant service role for cron jobs
GRANT EXECUTE ON FUNCTION fn_expire_reservations(uuid) TO service_role;

-- ============================================================================
-- 8) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION fn_reserve_inventory(uuid, uuid, numeric, numeric, int, uuid) IS 'Atomically reserve units from share lots using FIFO allocation with concurrency protection';
COMMENT ON FUNCTION fn_expire_reservations(uuid) IS 'Expire reservations and restore units to inventory - designed for cron execution';
COMMENT ON FUNCTION fn_finalize_allocation(uuid, uuid) IS 'Convert approved reservation to final allocation and update positions';
COMMENT ON FUNCTION fn_compute_fee_events(uuid, uuid, date) IS 'Calculate and create fee events based on investor terms and allocations';
COMMENT ON FUNCTION fn_invoice_fees(uuid, uuid, date) IS 'Generate invoice from accrued fee events';
COMMENT ON FUNCTION fn_get_deal_inventory(uuid) IS 'Get real-time inventory summary for a deal';