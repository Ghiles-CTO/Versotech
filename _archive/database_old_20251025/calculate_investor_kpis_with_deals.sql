-- VERSO Holdings Portal - Enhanced KPI calculation including deals
-- Extended version of calculate_investor_kpis that includes deal allocations

-- =========================
-- Enhanced KPI calculation function that includes deals and allocations
-- =========================
CREATE OR REPLACE FUNCTION calculate_investor_kpis_with_deals(
    investor_ids uuid[],
    as_of_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    current_nav numeric(18,2),
    total_contributed numeric(18,2),
    total_distributions numeric(18,2),
    unfunded_commitment numeric(18,2),
    total_commitment numeric(18,2),
    total_cost_basis numeric(18,2),
    unrealized_gain numeric(18,2),
    unrealized_gain_pct numeric(5,2),
    dpi numeric(10,4),
    tvpi numeric(10,4),
    irr_estimate numeric(5,2),
    total_positions int,
    total_vehicles int,
    total_deals int,
    total_deal_value numeric(18,2),
    pending_allocations int
) AS $$
DECLARE
    calc_current_nav numeric(18,2) := 0;
    calc_total_contributed numeric(18,2) := 0;
    calc_total_distributions numeric(18,2) := 0;
    calc_total_commitment numeric(18,2) := 0;
    calc_total_cost_basis numeric(18,2) := 0;
    calc_unfunded_commitment numeric(18,2) := 0;
    calc_unrealized_gain numeric(18,2) := 0;
    calc_unrealized_gain_pct numeric(5,2) := 0;
    calc_dpi numeric(10,4) := 0;
    calc_tvpi numeric(10,4) := 0;
    calc_irr_estimate numeric(5,2) := 0;
    calc_total_positions int := 0;
    calc_total_vehicles int := 0;
    calc_total_deals int := 0;
    calc_total_deal_value numeric(18,2) := 0;
    calc_pending_allocations int := 0;
BEGIN
    -- Calculate current NAV from positions with latest valuations
    SELECT COALESCE(SUM(
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END
    ), 0)
    INTO calc_current_nav
    FROM positions p
    LEFT JOIN get_latest_valuations() lv ON p.vehicle_id = lv.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Add deal allocations to current NAV (approved/settled allocations)
    SELECT COALESCE(SUM(a.units * a.unit_price), 0)
    INTO calc_total_deal_value
    FROM allocations a
    WHERE a.investor_id = ANY(investor_ids)
    AND a.status IN ('approved', 'settled');

    calc_current_nav := calc_current_nav + calc_total_deal_value;

    -- Calculate total cost basis from positions
    SELECT COALESCE(SUM(p.cost_basis), 0)
    INTO calc_total_cost_basis
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids);

    -- Add deal allocation cost basis
    calc_total_cost_basis := calc_total_cost_basis + calc_total_deal_value;

    -- Calculate total contributed capital from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_contributed
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'call'
    AND cf.date <= as_of_date;

    -- Calculate total distributions from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_distributions
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'distribution'
    AND cf.date <= as_of_date;

    -- Calculate total commitments from active subscriptions
    SELECT COALESCE(SUM(s.commitment), 0)
    INTO calc_total_commitment
    FROM subscriptions s
    WHERE s.investor_id = ANY(investor_ids)
    AND s.status IN ('active', 'pending');

    -- Count deals and pending allocations
    SELECT 
        COUNT(DISTINCT a.deal_id),
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END)
    INTO calc_total_deals, calc_pending_allocations
    FROM allocations a
    WHERE a.investor_id = ANY(investor_ids);

    -- Calculate derived metrics
    calc_unfunded_commitment := GREATEST(calc_total_commitment - calc_total_contributed, 0);
    calc_unrealized_gain := calc_current_nav - calc_total_cost_basis;

    -- Calculate unrealized gain percentage (avoid division by zero)
    IF calc_total_cost_basis > 0 THEN
        calc_unrealized_gain_pct := (calc_unrealized_gain / calc_total_cost_basis) * 100;
    ELSE
        calc_unrealized_gain_pct := 0;
    END IF;

    -- Calculate DPI (Distributions to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_dpi := calc_total_distributions / calc_total_contributed;
    ELSE
        calc_dpi := 0;
    END IF;

    -- Calculate TVPI (Total Value to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_tvpi := (calc_current_nav + calc_total_distributions) / calc_total_contributed;
    ELSE
        calc_tvpi := 0;
    END IF;

    -- Simple IRR estimation (placeholder - complex calculation)
    IF calc_total_contributed > 0 AND calc_tvpi > 1 THEN
        calc_irr_estimate := LEAST(GREATEST((calc_tvpi - 1) * 10, 0), 100);
    ELSE
        calc_irr_estimate := 0;
    END IF;

    -- Count positions and vehicles
    SELECT COUNT(*), COUNT(DISTINCT vehicle_id)
    INTO calc_total_positions, calc_total_vehicles
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Return all calculated values
    RETURN QUERY SELECT
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles,
        calc_total_deals,
        calc_total_deal_value,
        calc_pending_allocations;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_investor_kpis_with_deals TO authenticated;

COMMENT ON FUNCTION calculate_investor_kpis_with_deals IS 'Enhanced KPI calculation that includes deal allocations and comprehensive portfolio metrics';

