-- Part 2: Insert introducer commissions
-- Generated from dashboard data

-- VC102 LF GROUP SARL: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC102 - Pierre Paumier'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC102' AND (UPPER(i.last_name) = 'LF GROUP SARL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 ROLLINS: Spread $20000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 20000.00,
    'Dashboard migration: VC106 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ROLLINS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CHANG: Spread $15000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 15000.00,
    'Dashboard migration: VC106 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CHANG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 NGAN: Spread $5040.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 5040.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'NGAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 MADHVANI: Spread $40000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 400, 40000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MADHVANI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 KOHI: Spread $10000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 10000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KOHI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CHIH-HENG: Spread $4999.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 4999.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CHIH-HENG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 AGARWALA: Spread $5000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration: VC106 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'AGARWALA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CHANDRA: Sub fee $23542.20
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', NULL, 23542.20,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CHANDRA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 YONGJIE: Spread $8250.30
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 8250.30,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'YONGJIE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SAE-JEE: Spread $1249.20
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 1249.20,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SAE-JEE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 GEOK: Spread $4003.20
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 4003.20,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GEOK') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 MARTINI: Spread $7537.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 7537.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MARTINI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SAHLI: Spread $35712.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 300, 35712.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SAHLI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 AKERMANN: Spread $15000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 15000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'AKERMANN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CABIAN: Spread $3768.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 3768.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CABIAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SCIMONE: Spread $5980.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 250, 5980.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCIMONE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SCIMONE: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCIMONE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 SCIMONE: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCIMONE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 KNOPF: Spread $3330.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'spread', 150, 3330.00,
    'Dashboard migration: VC106 - TERRA Financial'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KNOPF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 KARKUN: Spread $9088.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 400, 9088.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KARKUN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 BROWN: Spread $5000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BROWN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SUBRAMANIAN: Spread $10321.69
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 10321.69,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SUBRAMANIAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 RIKHYE: Spread $8716.60
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 8716.60,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RIKHYE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HARIA: Spread $4354.20
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 4354.20,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HARIA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SHAH: Spread $2177.10
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 2177.10,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SHAH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 AL ABBASI: Spread $31750.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 250, 31750.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'AL ABBASI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CORR: Spread $13179.96
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 13179.96,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CORR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 CORR: Sub fee $5000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 5000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CORR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 CORR: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CORR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 JORDAN: Spread $4217.24
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 4217.24,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JORDAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 JORDAN: Sub fee $3200.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 3200.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JORDAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 JORDAN: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JORDAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 WRIGHT: Spread $1317.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'WRIGHT') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 WRIGHT: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'WRIGHT') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 WRIGHT: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'WRIGHT') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 VAN DEN BOL: Spread $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'VAN DEN BOL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 VAN DEN BOL: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'VAN DEN BOL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 VAN DEN BOL: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'VAN DEN BOL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 MATTHEWS: Spread $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MATTHEWS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 MATTHEWS: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MATTHEWS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 MATTHEWS: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MATTHEWS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 HAYCOX: Spread $1976.56
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1976.56,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAYCOX') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HAYCOX: Sub fee $1500.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1500.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAYCOX') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HAYCOX: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAYCOX') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 ACKERLEY: Spread $1317.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ACKERLEY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 ACKERLEY: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ACKERLEY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 ACKERLEY: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ACKERLEY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 MANNING: Spread $1317.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MANNING') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 MANNING: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MANNING') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 MANNING: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MANNING') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 BROOKS: Spread $1317.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BROOKS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 BROOKS: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BROOKS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 BROOKS: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BROOKS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 DAHAN: Spread $5271.86
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 5271.86,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DAHAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 DAHAN: Sub fee $4000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DAHAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 DAHAN: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DAHAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 DUTIL: Spread $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DUTIL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 DUTIL: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DUTIL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 DUTIL: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DUTIL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SCHUTTE: Spread $1317.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCHUTTE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SCHUTTE: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCHUTTE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 SCHUTTE: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SCHUTTE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SEKHON: Spread $29930.56
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 176, 29930.56,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SEKHON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 GRAF: Spread $1360.32
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 32, 1360.32,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GRAF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 NUSSBERGER: Spread $9106.02
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 9106.02,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'NUSSBERGER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 EVANS: Spread $13179.96
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 13179.96,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'EVANS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 EVANS: Sub fee $10000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'EVANS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 EVANS: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'EVANS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 HOLDEN: Spread $1976.87
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1976.87,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HOLDEN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HOLDEN: Sub fee $3000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HOLDEN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HOLDEN: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HOLDEN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 HAYAT: Spread $25200.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 25200.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAYAT') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HAYAT: Sub fee $4904.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4904.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAYAT') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 KOTHARI: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KOTHARI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 KOTHARI: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KOTHARI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 MUKHTAR: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MUKHTAR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 MUKHTAR: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'MUKHTAR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 PATRASCU: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'PATRASCU') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 PATRASCU: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'PATRASCU') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 PATRASCU: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'PATRASCU') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 JOGANI: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JOGANI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 JOGANI: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JOGANI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 RUSHTON: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RUSHTON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 RUSHTON: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RUSHTON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 RUSHTON: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RUSHTON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 WILLETTS: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'WILLETTS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SOMMERVILLE: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SOMMERVILLE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SOMMERVILLE: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SOMMERVILLE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 LAI: Spread $5356.26
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 5356.26,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LAI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 LAI: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LAI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 LUND: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LUND') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 LUND: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LUND') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 LUND: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LUND') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 BELGA: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BELGA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 BELGA: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BELGA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 BELGA: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BELGA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 JOMAA: Sub fee $6000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 6000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JOMAA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 JAYARAMAN: Sub fee $8000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JAYARAMAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HAKIM: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAKIM') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HAKIM: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAKIM') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HAKIM: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HAKIM') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 KHAWAJA: Sub fee $2500.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2500.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KHAWAJA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 KHAWAJA: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KHAWAJA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 JATANIA: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JATANIA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 JATANIA: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JATANIA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 JATANIA: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JATANIA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 QUNASH: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'QUNASH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 QUNASH: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'QUNASH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 GUERIN: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GUERIN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 GUERIN: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GUERIN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 LE SEIGNEUR: Sub fee $3000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LE SEIGNEUR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 LE SEIGNEUR: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'LE SEIGNEUR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 PATEL: Spread $53570.16
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 53570.16,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'PATEL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 PATEL: Sub fee $20000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'PATEL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HASSAN: Spread $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HASSAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HASSAN: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HASSAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HASSAN: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HASSAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 GOKER: Spread $53570.16
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 53570.16,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GOKER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 GOKER: Sub fee $20000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GOKER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 ALAMOUTI: Spread $16068.78
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 16068.78,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ALAMOUTI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 ALAMOUTI: Sub fee $6000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 6000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ALAMOUTI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 (ANTON): Spread $26785.08
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 26785.08,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = '(ANTON)') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 (ANTON): Sub fee $10000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = '(ANTON)') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 KRAUSER: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'KRAUSER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 FLETCHER: Sub fee $10000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'FLETCHER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 STEIMES: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'STEIMES') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 STEIMES: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'STEIMES') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SERRA: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SERRA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 SERRA: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SERRA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SAMAMA: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SAMAMA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 SAMAMA: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SAMAMA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 CUDRE-MAUROUX: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CUDRE-MAUROUX') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 CUDRE-MAUROUX: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CUDRE-MAUROUX') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 CYTRON: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CYTRON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 CYTRON: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'CYTRON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 RIENZO: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RIENZO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 RIENZO: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'RIENZO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 GHESQUIERES: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GHESQUIERES') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 GHESQUIERES: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'GHESQUIERES') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 ROSSIER: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ROSSIER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 ROSSIER: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'ROSSIER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 DUFAURE: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DUFAURE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 DUFAURE: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'DUFAURE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC106 SUKHOTIN: Sub fee $6000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 6000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SUKHOTIN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 JAVID: Spread $4015.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 4015.62,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JAVID') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 JAVID: Sub fee $1499.16
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1499.16,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'JAVID') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 BADII: Spread $1071.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 1071.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BADII') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 BADII: Sub fee $399.84
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 399.84,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'BADII') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 SOLOUKI: Spread $2677.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 2677.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SOLOUKI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 SOLOUKI: Sub fee $999.60
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 999.60,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'SOLOUKI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 HUSSAIN: Spread $2677.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 2677.50,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HUSSAIN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 HUSSAIN: Sub fee $999.60
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 999.60,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'HUSSAIN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 TONELLI BANFI: Spread $13392.54
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 13392.54,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'TONELLI BANFI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC106 TONELLI BANFI: Sub fee $5000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 5000.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'TONELLI BANFI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC106 FONTES WILLIAMS: Spread $4078.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 100, 4078.00,
    'Dashboard migration: VC106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106' AND (UPPER(i.last_name) = 'FONTES WILLIAMS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC111 ROSEN INVEST HOLDINGS INC: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ROSEN INVEST HOLDINGS INC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 ROSEN INVEST HOLDINGS INC: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ROSEN INVEST HOLDINGS INC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 STRUCTURED ISSUANCE LTD: Sub fee $7500.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'invested_amount', 300, 7500.00,
    'Dashboard migration: VC111 - Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'STRUCTURED ISSUANCE LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 STRUCTURED ISSUANCE LTD: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC111 - Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'STRUCTURED ISSUANCE LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 DALINGA HOLDING AG: Sub fee $2300.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2300.00,
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'DALINGA HOLDING AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 DALINGA HOLDING AG: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'DALINGA HOLDING AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 TARTRIFUGE SA: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'TARTRIFUGE SA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 TARTRIFUGE SA: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'TARTRIFUGE SA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 VOLF TRUST: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'VOLF TRUST') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 VOLF TRUST: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'VOLF TRUST') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 MARKUS: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'MARKUS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 MARKUS: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'MARKUS') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 ATTILIO: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ATTILIO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 ATTILIO: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ATTILIO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 FINALMA SUISSE SA: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'FINALMA SUISSE SA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 FINALMA SUISSE SA: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'FINALMA SUISSE SA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 MONFIN LTD: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'MONFIN LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 MONFIN LTD: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'MONFIN LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 BRIGHT PHOENIX HOLDINGS LTD: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC111 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BRIGHT PHOENIX HOLDINGS LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 BRIGHT PHOENIX HOLDINGS LTD: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BRIGHT PHOENIX HOLDINGS LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 BRUNO: Sub fee $2100.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 300, 2100.00,
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BRUNO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 BRUNO: Perf fee 2.5%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 250, '0x',
    'Dashboard migration: VC111 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BRUNO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 BENSKYLA AG: Sub fee $4000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration: VC111 - Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BENSKYLA AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC111 BENSKYLA AG: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC111 - Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'BENSKYLA AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 WYMO FINANCE LIMITED: Perf fee 7.5%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, '0x',
    'Dashboard migration: VC111 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'WYMO FINANCE LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 HASSBRO INVESTMENTS LIMITED: Perf fee 7.5%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, '0x',
    'Dashboard migration: VC111 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'HASSBRO INVESTMENTS LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC111 ZANDERA (FINCO) LIMITED: Spread $330114.29
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'spread', 285, 330114.29,
    'Dashboard migration: VC111 - Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ZANDERA (FINCO) LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC111 ZANDERA (FINCO) LIMITED: Sub fee $20000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.00,
    'Dashboard migration: VC111 - Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111' AND (UPPER(i.last_name) = 'ZANDERA (FINCO) LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC112 ANTONIO ALBERTO: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'invested_amount', 400, 2000.00,
    'Dashboard migration: VC112 - FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112' AND (UPPER(i.last_name) = 'ANTONIO ALBERTO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC112 ANTONIO ALBERTO: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC112 - FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112' AND (UPPER(i.last_name) = 'ANTONIO ALBERTO') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 WINZ: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'WINZ') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 WINZ: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'WINZ') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 AKERMANN: Sub fee $750.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 100, 750.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'AKERMANN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 AKERMANN: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'AKERMANN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 ROMANOV: Sub fee $8000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ROMANOV') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 ROMANOV: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ROMANOV') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 GORYAINOV: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'GORYAINOV') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 GORYAINOV: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'GORYAINOV') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 ZINKEVICH: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ZINKEVICH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 ZINKEVICH: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ZINKEVICH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 MADHVANI: Spread $35000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 35000.00,
    'Dashboard migration: VC113 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MADHVANI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC113 HAYWARD: Spread $22750.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 22750.00,
    'Dashboard migration: VC113 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'HAYWARD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC113 HAYWARD: Sub fee $3200.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 3200.00,
    'Dashboard migration: VC113 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'HAYWARD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 KNOPF: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'KNOPF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 KNOPF: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'KNOPF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 TOMMEY: Spread $26250.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 26250.00,
    'Dashboard migration: VC113 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'TOMMEY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC113 GRAF: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'GRAF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 GRAF: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'GRAF') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 DE: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'DE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 DE: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'DE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 ALGAR: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ALGAR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 ALGAR: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC113 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ALGAR') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 MERIDA: Sub fee $600.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 600.00,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MERIDA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 MERIDA: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MERIDA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 MAHESWARI & SUBRAMANIAN: Sub fee $2100.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2100.00,
    'Dashboard migration: VC113 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 MAHESWARI & SUBRAMANIAN: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, NULL,
    'Dashboard migration: VC113 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 HIQUIANA-TANEJA & TANEJA: Sub fee $2200.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2200.00,
    'Dashboard migration: VC113 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 HIQUIANA-TANEJA & TANEJA: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 ULDRY: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ULDRY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 ULDRY: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, NULL,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'ULDRY') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 COMEL: Sub fee $400.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 400.00,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'COMEL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 COMEL: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, NULL,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'COMEL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 EL MOGHAZI: Sub fee $520.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 520.00,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'EL MOGHAZI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 EL MOGHAZI: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, NULL,
    'Dashboard migration: VC113 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'EL MOGHAZI') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 MOHAMMED: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'ae4d8764-3c68-4d34-beca-9f4fec4c71a9', s.investor_id, s.deal_id, 'performance_fee', 500, NULL,
    'Dashboard migration: VC113 - Omar'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MOHAMMED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 MEYER: Sub fee $4000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration: VC113 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MEYER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 MEYER: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'MEYER') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC113 SHAH: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC113 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'SHAH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC113 SHAH: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC113 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113' AND (UPPER(i.last_name) = 'SHAH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC118 VOLF TRUST: Spread $17307.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'spread', 225, 17307.00,
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'VOLF TRUST') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC118 VOLF TRUST: Sub fee $7500.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 7500.00,
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'VOLF TRUST') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC118 VOLF TRUST: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'VOLF TRUST') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC118 SIGNET LOGISTICS LTD: Spread $6921.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'spread', 225, 6921.00,
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'SIGNET LOGISTICS LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC118 SIGNET LOGISTICS LTD: Sub fee $3000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.00,
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'SIGNET LOGISTICS LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC118 SIGNET LOGISTICS LTD: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC118 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118' AND (UPPER(i.last_name) = 'SIGNET LOGISTICS LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC125 DALINGA HOLDING AG: Sub fee $1198.28
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1198.28,
    'Dashboard migration: VC125 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125' AND (UPPER(i.last_name) = 'DALINGA HOLDING AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC125 DALINGA HOLDING AG: Perf fee 2.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, '0x',
    'Dashboard migration: VC125 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125' AND (UPPER(i.last_name) = 'DALINGA HOLDING AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC125 MA GROUP AG: Sub fee $716.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 716.00,
    'Dashboard migration: VC125 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125' AND (UPPER(i.last_name) = 'MA GROUP AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC125 MA GROUP AG: Perf fee 5.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, '0x',
    'Dashboard migration: VC125 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125' AND (UPPER(i.last_name) = 'MA GROUP AG') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC126 CLOUDSAFE HOLDINGS LIMITED: Spread $21117.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'spread', 2375, 21117.50,
    'Dashboard migration: VC126 - John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'CLOUDSAFE HOLDINGS LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 CLOUDSAFE HOLDINGS LIMITED: Sub fee $6000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 100, 6000.00,
    'Dashboard migration: VC126 - John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'CLOUDSAFE HOLDINGS LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC126 CLOUDSAFE HOLDINGS LIMITED: Perf fee 3.5000000000000004%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 350, '0.03',
    'Dashboard migration: VC126 - John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'CLOUDSAFE HOLDINGS LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC126 SC TBC INVEST 3: Spread $200345.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 3300, 200345.00,
    'Dashboard migration: VC126 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'SC TBC INVEST 3') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 ODIN (ANIM X II LP): Spread $55108.40
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 944, 55108.40,
    'Dashboard migration: VC126 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'ODIN (ANIM X II LP)') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 DRUSSELL GOMAN RD LLC: Spread $2.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', NULL, 2.00,
    'Dashboard migration: VC126 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'DRUSSELL GOMAN RD LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 BRANDON: Spread $2.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', NULL, 2.00,
    'Dashboard migration: VC126 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'BRANDON') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 ALPHA GAIA CAPITAL FZE: Perf fee 1.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, '0.1',
    'Dashboard migration: VC126 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'ALPHA GAIA CAPITAL FZE') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC126 ABOU: Sub fee $3000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'invested_amount', 300, 3000.00,
    'Dashboard migration: VC126 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'ABOU') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC126 ABOU: Perf fee 1.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, '0.1',
    'Dashboard migration: VC126 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'ABOU') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC126 LF GROUP SARL: Sub fee $4000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration: VC126 - Pierre Paumier'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'LF GROUP SARL') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC126 AS ADVISORY DWC-LLC: Spread $760.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 760.00,
    'Dashboard migration: VC126 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'AS ADVISORY DWC-LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 OEP LTD: Spread $770.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 770.00,
    'Dashboard migration: VC126 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'OEP LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC126 GESTIO CAPITAL LTD: Spread $25200.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 583, 25200.00,
    'Dashboard migration: VC126 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126' AND (UPPER(i.last_name) = 'GESTIO CAPITAL LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 JASSQ HOLDING LIMITED: Spread $12000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 12000.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'JASSQ HOLDING LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 CARTA INVESTMENTS LLC: Spread $7260.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 7260.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'CARTA INVESTMENTS LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 CARTA INVESTMENTS LLC: Sub fee $2000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'CARTA INVESTMENTS LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC133 SINGH: Spread $3630.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 3630.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'SINGH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 SINGH: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'SINGH') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC133 777 WALNUT LLC: Spread $3630.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 3630.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = '777 WALNUT LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 777 WALNUT LLC: Sub fee $1000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = '777 WALNUT LLC') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC133 RICHARD: Spread $1750.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 5000, 1750.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'RICHARD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 ZANDERA (HOLDCO) LTD: Spread $137062.50
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72', s.investor_id, s.deal_id, 'spread', 17500, 137062.50,
    'Dashboard migration: VC133 - Elevation+Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'ZANDERA (HOLDCO) LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;

-- VC133 ZANDERA (HOLDCO) LTD: Sub fee $50000.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72', s.investor_id, s.deal_id, 'invested_amount', 500, 50000.00,
    'Dashboard migration: VC133 - Elevation+Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'ZANDERA (HOLDCO) LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'invested_amount')
LIMIT 1;

-- VC133 ZANDERA (HOLDCO) LTD: Perf fee 10.0%
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72', s.investor_id, s.deal_id, 'performance_fee', 1000, '0x',
    'Dashboard migration: VC133 - Elevation+Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'ZANDERA (HOLDCO) LTD') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'performance_fee')
LIMIT 1;

-- VC133 BAND CAPITAL LIMITED: Spread $21480.00
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 21480.00,
    'Dashboard migration: VC133 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133' AND (UPPER(i.last_name) = 'BAND CAPITAL LIMITED') AND s.deal_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM introducer_commissions ic WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01' AND ic.investor_id = s.investor_id AND ic.deal_id = s.deal_id AND ic.basis_type = 'spread')
LIMIT 1;
