-- VERSO Holdings Portal - Deal Extension Database Functions
-- Based on changes.md specification section 4
-- Run this AFTER all schema and RLS files

-- ==========================================================================
-- 4) Server-side DB Functions & Concurrency (must implement)
-- All functions must run on the server with Supabase service-role and
-- serializable (or repeatable read + explicit row locks) transactions.
-- ==========================================================================

-- ==========================================================================
-- 4.1 fn_reserve_inventory(deal_id, investor_id, requested_units, proposed_unit_price, hold_minutes) → reservation_id
-- ==========================================================================

CREATE OR REPLACE FUNCTION fn_reserve_inventory(
  p_deal_id uuid,
  p_investor_id uuid,
  p_requested_units numeric(28,8),
  p_proposed_unit_price numeric(18,6),
  p_hold_minutes integer DEFAULT 30
) RETURNS uuid AS $$
DECLARE
  v_reservation_id uuid;
  v_deal_status text;
  v_remaining_units numeric(28,8);
  v_lot_record RECORD;
  v_allocated_units numeric(28,8) := 0;
  v_units_to_take numeric(28,8);
BEGIN
  -- Set transaction isolation level for consistency
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- 1. Validate deal status
  SELECT status INTO v_deal_status
  FROM deals 
  WHERE id = p_deal_id;
  
  IF v_deal_status IS NULL THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;
  
  IF v_deal_status NOT IN ('open', 'allocation_pending') THEN
    RAISE EXCEPTION 'Deal is not available for reservations. Status: %', v_deal_status;
  END IF;
  
  -- 2. Create reservation record first
  v_reservation_id := gen_random_uuid();
  INSERT INTO reservations (
    id,
    deal_id,
    investor_id,
    requested_units,
    proposed_unit_price,
    expires_at,
    status,
    created_by
  ) VALUES (
    v_reservation_id,
    p_deal_id,
    p_investor_id,
    p_requested_units,
    p_proposed_unit_price,
    now() + (p_hold_minutes || ' minutes')::interval,
    'pending',
    p_investor_id  -- Assuming investor creates their own reservation
  );
  
  -- 3. Select share_lots for the deal_id FOR UPDATE SKIP LOCKED, ordered by acquired_at (FIFO)
  FOR v_lot_record IN
    SELECT id, units_remaining, unit_cost
    FROM share_lots 
    WHERE deal_id = p_deal_id 
      AND status = 'available'
      AND units_remaining > 0
    ORDER BY acquired_at ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Calculate how many units to take from this lot
    v_units_to_take := LEAST(
      v_lot_record.units_remaining, 
      p_requested_units - v_allocated_units
    );
    
    -- 4. Insert reservation_lot_items
    INSERT INTO reservation_lot_items (
      reservation_id,
      lot_id,
      units
    ) VALUES (
      v_reservation_id,
      v_lot_record.id,
      v_units_to_take
    );
    
    -- 5. Decrement share_lots.units_remaining
    UPDATE share_lots 
    SET units_remaining = units_remaining - v_units_to_take,
        status = CASE 
          WHEN units_remaining - v_units_to_take = 0 THEN 'exhausted'
          ELSE status
        END
    WHERE id = v_lot_record.id;
    
    v_allocated_units := v_allocated_units + v_units_to_take;
    
    -- Break if we've allocated enough
    EXIT WHEN v_allocated_units >= p_requested_units;
  END LOOP;
  
  -- Check if we were able to reserve enough units
  IF v_allocated_units < p_requested_units THEN
    RAISE EXCEPTION 'Insufficient inventory available. Requested: %, Available: %', 
      p_requested_units, v_allocated_units;
  END IF;
  
  -- 6. Return reservation_id
  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- 4.2 fn_expire_reservations() (cron via n8n)
-- ==========================================================================

CREATE OR REPLACE FUNCTION fn_expire_reservations()
RETURNS integer AS $$
DECLARE
  v_expired_count integer := 0;
  v_reservation_record RECORD;
  v_lot_item_record RECORD;
BEGIN
  -- Find reservations that are pending and expired
  FOR v_reservation_record IN
    SELECT id, deal_id
    FROM reservations 
    WHERE status = 'pending' 
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED  -- Work lock per reservation
  LOOP
    -- Restore units_remaining for all lots in this reservation
    FOR v_lot_item_record IN
      SELECT lot_id, units
      FROM reservation_lot_items 
      WHERE reservation_id = v_reservation_record.id
    LOOP
      UPDATE share_lots 
      SET units_remaining = units_remaining + v_lot_item_record.units,
          status = CASE 
            WHEN status = 'exhausted' AND units_remaining + v_lot_item_record.units > 0 THEN 'available'
            ELSE status
          END
      WHERE id = v_lot_item_record.lot_id;
    END LOOP;
    
    -- Mark reservation as expired
    UPDATE reservations 
    SET status = 'expired'
    WHERE id = v_reservation_record.id
      AND status = 'pending';  -- Double-check status hasn't changed
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- 4.3 fn_finalize_allocation(reservation_id, approver_id) → allocation_id
-- ==========================================================================

CREATE OR REPLACE FUNCTION fn_finalize_allocation(
  p_reservation_id uuid,
  p_approver_id uuid
) RETURNS uuid AS $$
DECLARE
  v_allocation_id uuid;
  v_reservation_record RECORD;
  v_total_units numeric(28,8);
  v_weighted_cost numeric(18,6);
  v_spread_amount numeric(18,2);
  v_vehicle_id uuid;
BEGIN
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- Get reservation details
  SELECT 
    r.deal_id,
    r.investor_id, 
    r.proposed_unit_price,
    r.status,
    d.vehicle_id
  INTO v_reservation_record
  FROM reservations r
  JOIN deals d ON d.id = r.deal_id
  WHERE r.id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found: %', p_reservation_id;
  END IF;
  
  IF v_reservation_record.status != 'pending' THEN
    RAISE EXCEPTION 'Reservation is not pending. Status: %', v_reservation_record.status;
  END IF;
  
  -- TODO: Check for approval existence (implement when approvals system is ready)
  -- This would check the approvals table for approved status
  
  -- Calculate total units and weighted average cost
  SELECT 
    SUM(rli.units) as total_units,
    SUM(rli.units * sl.unit_cost) / SUM(rli.units) as weighted_cost
  INTO v_total_units, v_weighted_cost
  FROM reservation_lot_items rli
  JOIN share_lots sl ON sl.id = rli.lot_id
  WHERE rli.reservation_id = p_reservation_id;
  
  -- Create allocation
  v_allocation_id := gen_random_uuid();
  INSERT INTO allocations (
    id,
    deal_id,
    investor_id,
    unit_price,
    units,
    status,
    approved_by,
    approved_at
  ) VALUES (
    v_allocation_id,
    v_reservation_record.deal_id,
    v_reservation_record.investor_id,
    v_reservation_record.proposed_unit_price,
    v_total_units,
    'approved',
    p_approver_id,
    now()
  );
  
  -- Copy reservation_lot_items to allocation_lot_items
  INSERT INTO allocation_lot_items (allocation_id, lot_id, units)
  SELECT v_allocation_id, lot_id, units
  FROM reservation_lot_items
  WHERE reservation_id = p_reservation_id;
  
  -- Mark reservation as approved
  UPDATE reservations 
  SET status = 'approved'
  WHERE id = p_reservation_id;
  
  -- Update positions (upsert)
  IF v_reservation_record.vehicle_id IS NOT NULL THEN
    INSERT INTO positions (
      investor_id,
      vehicle_id,
      units,
      cost_basis,
      as_of_date
    ) VALUES (
      v_reservation_record.investor_id,
      v_reservation_record.vehicle_id,
      v_total_units,
      v_total_units * v_reservation_record.proposed_unit_price,
      current_date
    )
    ON CONFLICT (investor_id, vehicle_id) 
    DO UPDATE SET
      units = positions.units + EXCLUDED.units,
      cost_basis = positions.cost_basis + EXCLUDED.cost_basis,
      as_of_date = EXCLUDED.as_of_date;
  END IF;
  
  -- Calculate and record spread
  v_spread_amount := (v_reservation_record.proposed_unit_price - v_weighted_cost) * v_total_units;
  
  IF v_spread_amount > 0 THEN
    -- Create spread invoice line (will be attached to invoice later)
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount
    ) VALUES (
      NULL,  -- Will be linked when invoice is created
      'spread',
      'Trading spread on allocation ' || v_allocation_id,
      v_total_units,
      v_reservation_record.proposed_unit_price - v_weighted_cost,
      v_spread_amount
    );
  END IF;
  
  RETURN v_allocation_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- 4.4 Fee Functions
-- ==========================================================================

-- fn_compute_fee_events(deal_id, as_of_date)
CREATE OR REPLACE FUNCTION fn_compute_fee_events(
  p_deal_id uuid,
  p_as_of_date date DEFAULT current_date
) RETURNS integer AS $$
DECLARE
  v_events_created integer := 0;
  v_term_record RECORD;
  v_component_record RECORD;
  v_invested_amount numeric(18,2);
  v_fee_amount numeric(18,2);
BEGIN
  -- For each active investor_terms in this deal
  FOR v_term_record IN
    SELECT 
      it.investor_id,
      it.selected_fee_plan_id,
      it.overrides
    FROM investor_terms it
    WHERE it.deal_id = p_deal_id
      AND it.status = 'active'
  LOOP
    -- Get invested amount from approved allocations
    SELECT COALESCE(SUM(units * unit_price), 0)
    INTO v_invested_amount
    FROM allocations
    WHERE deal_id = p_deal_id
      AND investor_id = v_term_record.investor_id
      AND status IN ('approved', 'settled');
    
    -- For each fee component in their plan
    FOR v_component_record IN
      SELECT *
      FROM fee_components fc
      WHERE fc.fee_plan_id = v_term_record.selected_fee_plan_id
    LOOP
      -- Calculate fee based on component type
      v_fee_amount := 0;
      
      CASE v_component_record.calc_method
        WHEN 'percent_of_investment' THEN
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0);
          
        WHEN 'fixed' THEN
          v_fee_amount := v_component_record.flat_amount;
          
        WHEN 'percent_per_annum' THEN
          -- For management fees - calculate based on time period and NAV
          -- This is a simplified version - in practice you'd need current NAV
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0) * 
            EXTRACT(DAYS FROM (p_as_of_date - current_date + interval '1 year')) / 365.0;
          
        -- Add other calculation methods as needed
        ELSE
          CONTINUE;  -- Skip unsupported calculation methods
      END CASE;
      
      -- Only create fee event if amount > 0 and not already exists
      IF v_fee_amount > 0 THEN
        INSERT INTO fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          event_date,
          period_start,
          period_end,
          base_amount,
          computed_amount,
          currency,
          source_ref,
          status
        ) 
        SELECT 
          p_deal_id,
          v_term_record.investor_id,
          v_component_record.id,
          p_as_of_date,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN date_trunc('year', p_as_of_date)::date
            WHEN v_component_record.frequency = 'quarterly' THEN date_trunc('quarter', p_as_of_date)::date
            ELSE p_as_of_date
          END,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN (date_trunc('year', p_as_of_date) + interval '1 year' - interval '1 day')::date
            WHEN v_component_record.frequency = 'quarterly' THEN (date_trunc('quarter', p_as_of_date) + interval '3 months' - interval '1 day')::date
            ELSE p_as_of_date
          END,
          v_invested_amount,
          v_fee_amount,
          'USD',
          'allocation',
          'accrued'
        WHERE NOT EXISTS (
          -- Avoid duplicates
          SELECT 1 FROM fee_events fe
          WHERE fe.deal_id = p_deal_id
            AND fe.investor_id = v_term_record.investor_id
            AND fe.fee_component_id = v_component_record.id
            AND fe.event_date = p_as_of_date
            AND fe.status != 'voided'
        );
        
        IF FOUND THEN
          v_events_created := v_events_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN v_events_created;
END;
$$ LANGUAGE plpgsql;

-- fn_invoice_fees(deal_id, investor_id, up_to_date)
CREATE OR REPLACE FUNCTION fn_invoice_fees(
  p_deal_id uuid,
  p_investor_id uuid DEFAULT NULL,
  p_up_to_date date DEFAULT current_date
) RETURNS uuid AS $$
DECLARE
  v_invoice_id uuid;
  v_subtotal numeric(18,2) := 0;
  v_event_record RECORD;
  v_investor_filter uuid;
BEGIN
  -- If investor_id provided, filter to that investor, otherwise process all
  v_investor_filter := p_investor_id;
  
  -- Create invoice
  v_invoice_id := gen_random_uuid();
  
  -- Group uninvoiced fee_events and create invoice
  FOR v_event_record IN
    SELECT 
      fe.investor_id,
      SUM(fe.computed_amount) as total_amount,
      fe.currency
    FROM fee_events fe
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter)
    GROUP BY fe.investor_id, fe.currency
    HAVING SUM(fe.computed_amount) > 0
  LOOP
    INSERT INTO invoices (
      id,
      investor_id,
      deal_id,
      due_date,
      currency,
      subtotal,
      tax,
      total,
      status,
      generated_from
    ) VALUES (
      v_invoice_id,
      v_event_record.investor_id,
      p_deal_id,
      current_date + interval '30 days',
      v_event_record.currency,
      v_event_record.total_amount,
      0,  -- No tax calculation in MVP
      v_event_record.total_amount,
      'draft',
      'fee_events'
    );
    
    -- Create invoice lines for each fee event
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount,
      fee_event_id
    )
    SELECT 
      v_invoice_id,
      'fee',
      CONCAT(fc.kind, ' fee - ', fe.event_date),
      1,
      fe.computed_amount,
      fe.computed_amount,
      fe.id
    FROM fee_events fe
    JOIN fee_components fc ON fc.id = fe.fee_component_id
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND fe.investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter);
    
    -- Mark fee events as invoiced
    UPDATE fee_events 
    SET status = 'invoiced'
    WHERE deal_id = p_deal_id
      AND status = 'accrued'
      AND event_date <= p_up_to_date
      AND investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR investor_id = v_investor_filter);
      
    EXIT; -- Only create one invoice per call
  END LOOP;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- UTILITY FUNCTIONS
-- ==========================================================================

-- Function to check deal inventory summary
CREATE OR REPLACE FUNCTION fn_deal_inventory_summary(p_deal_id uuid)
RETURNS TABLE (
  total_units numeric(28,8),
  available_units numeric(28,8),
  reserved_units numeric(28,8),
  allocated_units numeric(28,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(sl.units_total), 0) as total_units,
    COALESCE(SUM(sl.units_remaining), 0) as available_units,
    COALESCE((
      SELECT SUM(r.requested_units) 
      FROM reservations r 
      WHERE r.deal_id = p_deal_id AND r.status = 'pending'
    ), 0) as reserved_units,
    COALESCE((
      SELECT SUM(a.units)
      FROM allocations a
      WHERE a.deal_id = p_deal_id AND a.status IN ('approved', 'settled')
    ), 0) as allocated_units
  FROM share_lots sl
  WHERE sl.deal_id = p_deal_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users (will be controlled by RLS)
GRANT EXECUTE ON FUNCTION fn_reserve_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION fn_expire_reservations TO authenticated;
GRANT EXECUTE ON FUNCTION fn_finalize_allocation TO authenticated;
GRANT EXECUTE ON FUNCTION fn_compute_fee_events TO authenticated;
GRANT EXECUTE ON FUNCTION fn_invoice_fees TO authenticated;
GRANT EXECUTE ON FUNCTION fn_deal_inventory_summary TO authenticated;

