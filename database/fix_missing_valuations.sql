-- Script to identify and fix positions with units but no valuation
-- This ensures all holdings contribute to KPI calculations

-- STEP 1: Identify problematic positions
-- These are positions with units > 0 but no NAV (neither from valuations table nor position.last_nav)
WITH latest_vals AS (
  SELECT DISTINCT ON (vehicle_id)
    vehicle_id,
    nav_per_unit,
    as_of_date
  FROM valuations
  WHERE nav_per_unit IS NOT NULL
  ORDER BY vehicle_id, as_of_date DESC
),
problem_positions AS (
  SELECT
    p.id as position_id,
    p.investor_id,
    p.vehicle_id,
    v.name as vehicle_name,
    v.type as vehicle_type,
    p.units,
    p.cost_basis,
    p.last_nav,
    lv.nav_per_unit as latest_valuation_nav,
    CASE
      WHEN lv.nav_per_unit IS NULL AND p.last_nav IS NULL THEN 'NO_VALUATION'
      ELSE 'OK'
    END as status
  FROM positions p
  JOIN vehicles v ON p.vehicle_id = v.id
  LEFT JOIN latest_vals lv ON p.vehicle_id = lv.vehicle_id
  WHERE p.units > 0
)
SELECT
  vehicle_name,
  vehicle_type,
  units,
  cost_basis,
  last_nav,
  latest_valuation_nav,
  status,
  -- Calculated NAV per unit based on cost basis as fallback
  CASE
    WHEN units > 0 AND cost_basis > 0 THEN ROUND(cost_basis / units, 6)
    ELSE NULL
  END as suggested_nav_per_unit
FROM problem_positions
WHERE status = 'NO_VALUATION'
ORDER BY vehicle_name;

-- STEP 2: Fix Option A - Add valuation records for vehicles without valuations
-- This adds a valuation at cost (nav_per_unit = cost_basis / units)
-- Uncomment to execute:

/*
INSERT INTO valuations (vehicle_id, nav_per_unit, nav_total, as_of_date)
SELECT DISTINCT
  p.vehicle_id,
  CASE
    WHEN p.units > 0 THEN p.cost_basis / p.units
    ELSE 1.0
  END as nav_per_unit,
  p.cost_basis as nav_total,
  CURRENT_DATE as as_of_date
FROM positions p
LEFT JOIN (
  SELECT DISTINCT ON (vehicle_id)
    vehicle_id,
    nav_per_unit
  FROM valuations
  WHERE nav_per_unit IS NOT NULL
  ORDER BY vehicle_id, as_of_date DESC
) lv ON p.vehicle_id = lv.vehicle_id
WHERE p.units > 0
  AND p.cost_basis > 0
  AND lv.nav_per_unit IS NULL
  AND p.last_nav IS NULL;
*/

-- STEP 3: Fix Option B - Update position.last_nav for positions without valuations
-- This is a quicker fix that doesn't require adding valuation records
-- Uncomment to execute:

/*
UPDATE positions p
SET last_nav = CASE
  WHEN p.units > 0 AND p.cost_basis > 0 THEN p.cost_basis / p.units
  ELSE 1.0
END,
as_of_date = CURRENT_DATE
FROM (
  SELECT DISTINCT ON (vehicle_id)
    vehicle_id,
    nav_per_unit
  FROM valuations
  WHERE nav_per_unit IS NOT NULL
  ORDER BY vehicle_id, as_of_date DESC
) lv
WHERE p.units > 0
  AND p.cost_basis > 0
  AND lv.vehicle_id = p.vehicle_id
  AND lv.nav_per_unit IS NULL
  AND p.last_nav IS NULL;
*/

-- STEP 4: Verify the fix
-- Re-run the diagnostic query to confirm all positions now have valuations
WITH latest_vals AS (
  SELECT DISTINCT ON (vehicle_id)
    vehicle_id,
    nav_per_unit,
    as_of_date
  FROM valuations
  WHERE nav_per_unit IS NOT NULL
  ORDER BY vehicle_id, as_of_date DESC
)
SELECT
  v.name as vehicle_name,
  v.type as vehicle_type,
  p.units,
  p.cost_basis,
  p.last_nav,
  lv.nav_per_unit as latest_valuation_nav,
  CASE
    WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
    WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
    ELSE 0
  END as calculated_current_value,
  CASE
    WHEN (lv.nav_per_unit IS NOT NULL OR p.last_nav IS NOT NULL) THEN '✅ Will contribute to KPIs'
    ELSE '❌ Missing valuation'
  END as kpi_contribution_status
FROM positions p
JOIN vehicles v ON p.vehicle_id = v.id
LEFT JOIN latest_vals lv ON p.vehicle_id = lv.vehicle_id
WHERE p.units > 0
ORDER BY calculated_current_value DESC;