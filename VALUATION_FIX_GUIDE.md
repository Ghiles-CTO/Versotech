# Holdings Valuation Fix Guide

## Issue

Some holdings have positions (units > 0) but are not contributing to KPI calculations because they lack valuation data. A position needs either:
1. A valuation record in the `valuations` table, OR
2. A `last_nav` value on the position record

Without either, the position's current value is calculated as $0, even though it has units.

## Diagnosis

### Option 1: Use the Diagnostic API (Recommended)

With the dev server running:

```bash
# Check which positions are missing valuations
curl -X GET http://localhost:3000/api/diagnostics/valuations \
  -H "Cookie: your-session-cookie"

# Or simply visit in browser while logged in:
# http://localhost:3000/api/diagnostics/valuations
```

This will return a detailed report showing:
- Which positions have valuations
- Which are missing valuations
- Suggested NAV per unit values (based on cost_basis)
- Whether each position contributes to KPIs

### Option 2: Run SQL Diagnostic

Execute the diagnostic query in `database/fix_missing_valuations.sql` (STEP 1) to see problematic positions.

## Fix Options

### Automatic Fix (Staff Only)

If you have staff_admin or staff_ops access:

```bash
curl -X POST http://localhost:3000/api/diagnostics/valuations
```

This will automatically set `last_nav = cost_basis / units` for all positions missing valuations.

### Manual Fix Option A: Add Valuation Records

This creates proper valuation records in the `valuations` table:

```sql
-- From database/fix_missing_valuations.sql (STEP 2)
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
```

### Manual Fix Option B: Update Position last_nav

This is a quicker fix that updates the position records directly:

```sql
-- From database/fix_missing_valuations.sql (STEP 3)
UPDATE positions p
SET
  last_nav = CASE
    WHEN p.units > 0 AND p.cost_basis > 0 THEN p.cost_basis / p.units
    ELSE 1.0
  END,
  as_of_date = CURRENT_DATE
WHERE p.units > 0
  AND p.cost_basis > 0
  AND p.last_nav IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM valuations v
    WHERE v.vehicle_id = p.vehicle_id
    AND v.nav_per_unit IS NOT NULL
  );
```

## Verification

After applying the fix:

```bash
# Via API
curl -X GET http://localhost:3000/api/diagnostics/valuations

# Or run SQL STEP 4 from database/fix_missing_valuations.sql
```

All positions should now show:
- `will_contribute_to_kpis: true`
- `calculated_current_value > 0` (if they have units and cost_basis)

## Understanding the KPI Calculation

The KPI calculation follows this logic:

```sql
CASE
  WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
  WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
  ELSE 0
END as current_value
```

**Priority:**
1. Latest valuation from `valuations` table (preferred)
2. Position's `last_nav` field (fallback)
3. Zero (if neither exists)

## Files Created

- `database/fix_missing_valuations.sql` - SQL diagnostic and fix scripts
- `src/app/api/diagnostics/valuations/route.ts` - Diagnostic API endpoint
- `VALUATION_FIX_GUIDE.md` - This guide

## Next Steps

1. Run the diagnostic to identify missing valuations
2. Choose a fix option (automatic or manual)
3. Verify all holdings now contribute to KPIs
4. Refresh the holdings page to see updated KPIs