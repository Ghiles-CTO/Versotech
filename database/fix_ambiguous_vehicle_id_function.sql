-- Fix for ambiguous column reference in get_investor_vehicle_breakdown function
-- This addresses the PostgreSQL error: column reference "vehicle_id" is ambiguous

-- Drop and recreate the function with explicit column aliases
DROP FUNCTION IF EXISTS get_investor_vehicle_breakdown(uuid[]);

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
    INNER JOIN positions p ON v.id = p.vehicle_id AND p.investor_id = ANY(investor_ids)
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
    WHERE p.units > 0
    ORDER BY current_value DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_investor_vehicle_breakdown TO authenticated;

COMMENT ON FUNCTION get_investor_vehicle_breakdown IS 'Get detailed breakdown of investor holdings by vehicle with explicit column aliases to avoid ambiguity';
