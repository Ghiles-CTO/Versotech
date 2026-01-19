
-- VC113 matching query (36 investors)
WITH dashboard_names AS (
    SELECT unnest(ARRAY['WINZ', 'AKERMANN', 'Dalinga AG', 'ROMANOV', 'GORYAINOV', 'ZINKEVICH', 'MADHVANI', 'Rosen Invest Holdings Inc', 'Zandera (Finco) Limited', 'HAYWARD', 'KNOPF', 'TOMMEY', 'Signet Logistics Ltd', 'GRAF', 'DE', 'Bright Phoenix Holdings Ltd', 'TEKAPO Group Limited', 'ALGAR', 'MERIDA', 'MAHESWARI & SUBRAMANIAN', 'HIQUIANA-TANEJA & TANEJA', 'FRALIS SPF', 'NEWBRIDGE FINANCE SPF', 'ULDRY', 'COMEL', 'EL MOGHAZI', 'MOHAMMED', 'OEP Ltd', 'PETRATECH', 'Zandera (Holdco) Limited', 'MEYER', 'SHAH', 'KOHLER CABIAN', 'SAFE', 'JOGANI', 'TAROUILLY']) as dashboard_name
),
matches AS (
    SELECT 
        d.dashboard_name,
        inv.id as investor_id,
        inv.legal_name,
        inv.type
    FROM dashboard_names d
    JOIN vehicles v ON v.entity_code = 'VC113'
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
    'VC113' as vehicle,
    d.dashboard_name,
    COALESCE(m.investor_id::text, 'NO_MATCH') as investor_id,
    COALESCE(m.legal_name, 'NO_MATCH') as db_legal_name,
    COUNT(m.investor_id) OVER (PARTITION BY d.dashboard_name) as match_count
FROM dashboard_names d
LEFT JOIN matches m ON m.dashboard_name = d.dashboard_name
ORDER BY d.dashboard_name;
