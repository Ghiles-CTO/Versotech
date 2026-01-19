
-- VC113 comprehensive matching (36 investors)
WITH dashboard_investors AS (
    SELECT * FROM (VALUES
        ('WINZ', UPPER('WINZ'), NULL),
        ('AKERMANN', UPPER('AKERMANN'), NULL),
        ('Dalinga AG', NULL, UPPER('Dalinga AG')),
        ('ROMANOV', UPPER('ROMANOV'), NULL),
        ('GORYAINOV', UPPER('GORYAINOV'), NULL),
        ('ZINKEVICH', UPPER('ZINKEVICH'), NULL),
        ('MADHVANI', UPPER('MADHVANI'), NULL),
        ('Rosen Invest Holdings Inc', NULL, UPPER('Rosen Invest Holdings Inc')),
        ('Zandera (Finco) Limited', NULL, UPPER('Zandera (Finco) Limited')),
        ('HAYWARD', UPPER('HAYWARD'), NULL),
        ('KNOPF', UPPER('KNOPF'), NULL),
        ('TOMMEY', UPPER('TOMMEY'), NULL),
        ('Signet Logistics Ltd', NULL, UPPER('Signet Logistics Ltd')),
        ('GRAF', UPPER('GRAF'), NULL),
        ('DE', UPPER('DE'), NULL),
        ('Bright Phoenix Holdings Ltd', NULL, UPPER('Bright Phoenix Holdings Ltd')),
        ('TEKAPO Group Limited', NULL, UPPER('TEKAPO Group Limited')),
        ('ALGAR', UPPER('ALGAR'), NULL),
        ('MERIDA', UPPER('MERIDA'), NULL),
        ('MAHESWARI & SUBRAMANIAN', UPPER('MAHESWARI & SUBRAMANIAN'), NULL),
        ('HIQUIANA-TANEJA & TANEJA', UPPER('HIQUIANA-TANEJA & TANEJA'), NULL),
        ('FRALIS SPF', NULL, UPPER('FRALIS SPF')),
        ('NEWBRIDGE FINANCE SPF', NULL, UPPER('NEWBRIDGE FINANCE SPF')),
        ('ULDRY', UPPER('ULDRY'), NULL),
        ('COMEL', UPPER('COMEL'), NULL),
        ('EL MOGHAZI', UPPER('EL MOGHAZI'), NULL),
        ('MOHAMMED', UPPER('MOHAMMED'), NULL),
        ('OEP Ltd', NULL, UPPER('OEP Ltd')),
        ('PETRATECH', NULL, UPPER('PETRATECH')),
        ('Zandera (Holdco) Limited', NULL, UPPER('Zandera (Holdco) Limited')),
        ('MEYER', UPPER('MEYER'), NULL),
        ('SHAH', UPPER('SHAH'), NULL),
        ('KOHLER CABIAN', UPPER('KOHLER CABIAN'), NULL),
        ('SAFE', NULL, UPPER('SAFE')),
        ('JOGANI', UPPER('JOGANI'), NULL),
        ('TAROUILLY', UPPER('TAROUILLY'), NULL)
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
    LEFT JOIN vehicles v ON v.entity_code = 'VC113'
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
