-- Fix missing valuations by setting last_nav on positions
-- This ensures all holdings with units > 0 contribute to KPI calculations

-- First, let's see which positions are missing valuations
DO $$
DECLARE
    pos_record RECORD;
    nav_value NUMERIC;
BEGIN
    -- Loop through positions that have units but no valuation
    FOR pos_record IN
        SELECT
            p.id,
            p.vehicle_id,
            v.name as vehicle_name,
            p.units,
            p.cost_basis,
            p.last_nav
        FROM positions p
        JOIN vehicles v ON p.vehicle_id = v.id
        WHERE p.units > 0
          AND p.cost_basis > 0
          AND p.last_nav IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM valuations val
              WHERE val.vehicle_id = p.vehicle_id
                AND val.nav_per_unit IS NOT NULL
          )
    LOOP
        -- Calculate NAV per unit from cost basis
        nav_value := pos_record.cost_basis / pos_record.units;

        -- Update the position with calculated NAV
        UPDATE positions
        SET
            last_nav = nav_value,
            as_of_date = CURRENT_DATE
        WHERE id = pos_record.id;

        RAISE NOTICE 'Fixed position for vehicle: % - Set last_nav to %',
            pos_record.vehicle_name, nav_value;
    END LOOP;

    -- If no positions were updated, check if all positions already have valuations
    IF NOT FOUND THEN
        RAISE NOTICE 'All positions already have valuations!';
    END IF;
END $$;

-- Verify the fix
SELECT
    v.name as vehicle_name,
    v.type,
    p.units,
    p.cost_basis,
    p.last_nav,
    COALESCE(
        (SELECT nav_per_unit
         FROM valuations
         WHERE vehicle_id = v.id
           AND nav_per_unit IS NOT NULL
         ORDER BY as_of_date DESC
         LIMIT 1),
        p.last_nav
    ) as effective_nav,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM valuations
            WHERE vehicle_id = v.id AND nav_per_unit IS NOT NULL
        ) OR p.last_nav IS NOT NULL
        THEN '✓ Contributing to KPIs'
        ELSE '✗ NOT contributing'
    END as status
FROM positions p
JOIN vehicles v ON p.vehicle_id = v.id
WHERE p.units > 0
ORDER BY v.name;