-- VERSO Holdings Portal - KPI Calculation Functions
-- Comprehensive financial KPI calculations for investor portfolios
-- Handles DPI, TVPI, IRR, and other performance metrics

-- =========================
-- Helper function to get latest valuations per vehicle
-- =========================
CREATE OR REPLACE FUNCTION get_latest_valuations()
RETURNS TABLE (
    vehicle_id uuid,
    nav_per_unit numeric(18,6),
    as_of_date date
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (v.vehicle_id)
        v.vehicle_id,
        v.nav_per_unit,
        v.as_of_date
    FROM valuations v
    WHERE v.nav_per_unit IS NOT NULL
    ORDER BY v.vehicle_id, v.as_of_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================
-- Main KPI calculation function for investor portfolios
-- =========================
CREATE OR REPLACE FUNCTION calculate_investor_kpis(
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
    total_vehicles int
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

    -- Calculate total cost basis from positions
    SELECT COALESCE(SUM(p.cost_basis), 0)
    INTO calc_total_cost_basis
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids);

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
    -- For MVP, we'll use a simplified approach based on total return and time
    IF calc_total_contributed > 0 AND calc_tvpi > 1 THEN
        -- Estimate based on compound annual growth
        -- This is a simplified calculation - real IRR requires cashflow timing
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
        calc_total_vehicles;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================
-- Function to get portfolio performance trends
-- =========================
CREATE OR REPLACE FUNCTION get_portfolio_trends(
    investor_ids uuid[],
    days_back int DEFAULT 30
)
RETURNS TABLE (
    nav_change numeric(18,2),
    nav_change_pct numeric(5,2),
    performance_change numeric(5,2),
    period_days int
) AS $$
DECLARE
    current_kpis record;
    previous_kpis record;
    calc_nav_change numeric(18,2) := 0;
    calc_nav_change_pct numeric(5,2) := 0;
    calc_performance_change numeric(5,2) := 0;
BEGIN
    -- Get current KPIs
    SELECT * INTO current_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE);

    -- Get KPIs from days_back ago (simplified - uses current positions with older valuations)
    SELECT * INTO previous_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE - days_back);

    -- Calculate changes
    calc_nav_change := current_kpis.current_nav - previous_kpis.current_nav;

    IF previous_kpis.current_nav > 0 THEN
        calc_nav_change_pct := (calc_nav_change / previous_kpis.current_nav) * 100;
    END IF;

    calc_performance_change := current_kpis.unrealized_gain_pct - previous_kpis.unrealized_gain_pct;

    RETURN QUERY SELECT
        calc_nav_change,
        calc_nav_change_pct,
        calc_performance_change,
        days_back;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================
-- Function to get detailed vehicle breakdown for investor
-- =========================
CREATE OR REPLACE FUNCTION get_investor_vehicle_breakdown(
    investor_ids uuid[]
)
RETURNS TABLE (
    vehicle_id uuid,
    vehicle_name text,
    vehicle_type text,
    current_value numeric(18,2),
    cost_basis numeric(18,2),
    units numeric(28,8),
    unrealized_gain numeric(18,2),
    unrealized_gain_pct numeric(5,2),
    commitment numeric(18,2),
    contributed numeric(18,2),
    distributed numeric(18,2),
    nav_per_unit numeric(18,6),
    last_valuation_date date
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id AS vehicle_id,
        v.name AS vehicle_name,
        v.type::text AS vehicle_type,
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END::numeric(18,2) as current_value,
        COALESCE(p.cost_basis, 0) AS cost_basis,
        COALESCE(p.units, 0) AS units,
        (CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END - COALESCE(p.cost_basis, 0))::numeric(18,2) as unrealized_gain,
        CASE
            WHEN p.cost_basis > 0 THEN
                ((CASE
                    WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
                    WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
                    ELSE 0
                END - p.cost_basis) / p.cost_basis * 100)::numeric(5,2)
            ELSE 0
        END as unrealized_gain_pct,
        COALESCE(s.commitment, 0) AS commitment,
        COALESCE(contrib.total, 0) as contributed,
        COALESCE(distrib.total, 0) as distributed,
        COALESCE(lv.nav_per_unit, p.last_nav) AS nav_per_unit,
        lv.as_of_date AS last_valuation_date
    FROM vehicles v
    LEFT JOIN positions p ON v.id = p.vehicle_id AND p.investor_id = ANY(investor_ids)
    LEFT JOIN subscriptions s ON v.id = s.vehicle_id AND s.investor_id = ANY(investor_ids)
    LEFT JOIN get_latest_valuations() lv ON v.id = lv.vehicle_id
    LEFT JOIN (
        SELECT cf.vehicle_id, SUM(cf.amount) as total
        FROM cashflows cf
        WHERE cf.investor_id = ANY(investor_ids) AND cf.type = 'call'
        GROUP BY cf.vehicle_id
    ) contrib ON v.id = contrib.vehicle_id
    LEFT JOIN (
        SELECT cf.vehicle_id, SUM(cf.amount) as total
        FROM cashflows cf
        WHERE cf.investor_id = ANY(investor_ids) AND cf.type = 'distribution'
        GROUP BY cf.vehicle_id
    ) distrib ON v.id = distrib.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0
    ORDER BY current_value DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================
-- Create indexes for performance
-- =========================
CREATE INDEX IF NOT EXISTS idx_positions_investor_vehicle ON positions (investor_id, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_cashflows_investor_type_date ON cashflows (investor_id, type, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_investor_status ON subscriptions (investor_id, status);
CREATE INDEX IF NOT EXISTS idx_valuations_vehicle_date ON valuations (vehicle_id, as_of_date DESC);

-- =========================
-- Grant permissions
-- =========================
GRANT EXECUTE ON FUNCTION calculate_investor_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION get_portfolio_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_investor_vehicle_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_valuations TO authenticated;

COMMENT ON FUNCTION calculate_investor_kpis IS 'Calculate comprehensive KPIs for investor portfolios including DPI, TVPI, NAV, and performance metrics';
COMMENT ON FUNCTION get_portfolio_trends IS 'Calculate portfolio performance trends over specified time periods';
COMMENT ON FUNCTION get_investor_vehicle_breakdown IS 'Get detailed breakdown of investor holdings by vehicle';