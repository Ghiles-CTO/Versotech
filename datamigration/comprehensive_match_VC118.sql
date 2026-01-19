
-- VC118 comprehensive matching (1 investors)
WITH dashboard_investors AS (
    SELECT * FROM (VALUES
        ('VC18', NULL, UPPER('VC18'))
    ) AS t(identifier, match_lastname, match_entity)
),
matches AS (
    SELECT 
        d.identifier,
        inv.id as investor_id,
        inv.legal_name,
        inv.last_name as db_last_name,
        inv.type,
        CASE 
            WHEN d.match_lastname IS NOT NULL AND UPPER(inv.last_name) = d.match_lastname THEN 'EXACT_LASTNAME'
            WHEN d.match_entity IS NOT NULL AND UPPER(inv.legal_name) = d.match_entity THEN 'EXACT_ENTITY'
            WHEN UPPER(inv.legal_name) ILIKE '%' || d.identifier || '%' THEN 'PARTIAL'
            ELSE 'NO_MATCH'
        END as match_quality
    FROM dashboard_investors d
    LEFT JOIN vehicles v ON v.entity_code = 'VC118'
    LEFT JOIN subscriptions s ON s.vehicle_id = v.id
    LEFT JOIN investors inv ON inv.id = s.investor_id
        AND (
            (d.match_lastname IS NOT NULL AND UPPER(inv.last_name) = d.match_lastname)
            OR (d.match_entity IS NOT NULL AND UPPER(inv.legal_name) = d.match_entity)
            OR UPPER(inv.legal_name) ILIKE '%' || d.identifier || '%'
        )
)
SELECT 
    identifier,
    investor_id,
    legal_name,
    match_quality,
    COUNT(*) OVER (PARTITION BY identifier) as total_matches
FROM matches
WHERE investor_id IS NOT NULL
ORDER BY identifier;
