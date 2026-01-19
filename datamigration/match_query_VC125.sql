
-- VC125 matching query (1 investors)
WITH dashboard_names AS (
    SELECT unnest(ARRAY['VC25']) as dashboard_name
),
matches AS (
    SELECT 
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name,
        inv.type
    FROM dashboard_names d
    JOIN vehicles v ON v.entity_code = 'VC125'
    JOIN subscriptions s ON s.vehicle_id = v.id
    JOIN investors inv ON inv.id = s.investor_id
        AND (
            UPPER(inv.last_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) = UPPER(d.dashboard_name)
            OR UPPER(inv.legal_name) ILIKE '%' || d.dashboard_name || '%'
        )
    GROUP BY d.dashboard_name, inv.id, inv.legal_name, inv.type
)
SELECT 
    'VC125' as vehicle,
    d.dashboard_name,
    COALESCE(m.investor_id::text, 'NO_MATCH') as investor_id,
    COALESCE(m.legal_name, 'NO_MATCH') as db_legal_name,
    COUNT(m.investor_id) OVER (PARTITION BY d.dashboard_name) as match_count
FROM dashboard_names d
LEFT JOIN matches m ON m.dashboard_name = d.dashboard_name
ORDER BY d.dashboard_name;
