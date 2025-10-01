-- Diagnostic query to investigate why a holding might not appear in KPI calculations
-- This helps identify data integrity issues or missing valuations

-- First, let's see all positions with their vehicle info
WITH investor_positions AS (
  SELECT
    p.id as position_id,
    p.investor_id,
    p.vehicle_id,
    p.units,
    p.cost_basis,
    p.last_nav,
    v.name as vehicle_name,
    v.type as vehicle_type,
    i.name as investor_name
  FROM positions p
  JOIN vehicles v ON p.vehicle_id = v.id
  JOIN investors i ON p.investor_id = i.id
  WHERE p.units > 0
),
latest_vals AS (
  SELECT DISTINCT ON (vehicle_id)
    vehicle_id,
    nav_per_unit,
    nav_total,
    as_of_date
  FROM valuations
  WHERE nav_per_unit IS NOT NULL
  ORDER BY vehicle_id, as_of_date DESC
),
kpi_calc AS (
  SELECT
    ip.*,
    lv.nav_per_unit as latest_nav_per_unit,
    lv.as_of_date as latest_valuation_date,
    CASE
      WHEN lv.nav_per_unit IS NOT NULL THEN ip.units * lv.nav_per_unit
      WHEN ip.last_nav IS NOT NULL THEN ip.units * ip.last_nav
      ELSE 0
    END as calculated_current_value,
    CASE
      WHEN lv.nav_per_unit IS NULL AND ip.last_nav IS NULL THEN 'MISSING_VALUATION'
      WHEN lv.nav_per_unit IS NOT NULL THEN 'HAS_LATEST_VALUATION'
      ELSE 'HAS_POSITION_NAV'
    END as valuation_status
  FROM investor_positions ip
  LEFT JOIN latest_vals lv ON ip.vehicle_id = lv.vehicle_id
)
SELECT
  investor_name,
  vehicle_name,
  vehicle_type,
  units,
  cost_basis,
  last_nav as position_last_nav,
  latest_nav_per_unit,
  latest_valuation_date,
  calculated_current_value,
  valuation_status,
  CASE
    WHEN calculated_current_value = 0 THEN '❌ NOT CONTRIBUTING TO KPIS'
    ELSE '✅ Contributing to KPIs'
  END as kpi_status
FROM kpi_calc
ORDER BY investor_name, calculated_current_value DESC;

-- Additional query to check if there are vehicles without any valuations
SELECT
  v.id as vehicle_id,
  v.name as vehicle_name,
  v.type as vehicle_type,
  COUNT(DISTINCT val.id) as valuation_count,
  MAX(val.as_of_date) as last_valuation_date,
  COUNT(DISTINCT p.id) as position_count,
  SUM(p.units) as total_units
FROM vehicles v
LEFT JOIN valuations val ON v.id = val.vehicle_id
LEFT JOIN positions p ON v.id = p.vehicle_id AND p.units > 0
GROUP BY v.id, v.name, v.type
HAVING COUNT(DISTINCT p.id) > 0  -- Only show vehicles with positions
ORDER BY valuation_count ASC, vehicle_name;