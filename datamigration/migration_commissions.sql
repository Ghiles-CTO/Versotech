-- VERSO Introducer Commission Migration
-- Generated from extracted dashboard data
-- Total records: 280

BEGIN;

-- === VC102 (1 records) ===

-- Row 6: Pierre Paumier -> VC2
UPDATE subscriptions s
SET introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.legal_name ILIKE '%VC2%' OR i.legal_name ILIKE '%LF GROUP SARL%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC102 - VC2'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC102'
  AND (i.legal_name ILIKE '%VC2%' OR i.legal_name ILIKE '%LF GROUP SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- === VC106 (146 records) ===

-- Row 3: Manna Capital -> ROLLINS
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROLLINS') OR i.legal_name ILIKE '%Blaine%')
  AND s.introducer_id IS NULL;

-- Spread commission: $15000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    15000.0,
    'Dashboard migration: VC106 - ROLLINS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROLLINS') OR i.legal_name ILIKE '%Blaine%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 4: Manna Capital -> ROLLINS
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROLLINS') OR i.legal_name ILIKE '%Blaine%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    5000.0,
    'Dashboard migration: VC106 - ROLLINS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROLLINS') OR i.legal_name ILIKE '%Blaine%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 5: Manna Capital -> CHANG
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANG') OR i.legal_name ILIKE '%Laurence%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    10000.0,
    'Dashboard migration: VC106 - CHANG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANG') OR i.legal_name ILIKE '%Laurence%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 6: Manna Capital -> CHANG
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANG') OR i.legal_name ILIKE '%Laurence%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    5000.0,
    'Dashboard migration: VC106 - CHANG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANG') OR i.legal_name ILIKE '%Laurence%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 7: VERSO BI -> NGAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('NGAN') OR i.legal_name ILIKE '%Chang%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5040.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    90,
    5040.0,
    'Dashboard migration: VC106 - NGAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('NGAN') OR i.legal_name ILIKE '%Chang%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 8: VERSO BI -> MADHVANI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%SHEILA and KAMLESH%')
  AND s.introducer_id IS NULL;

-- Spread commission: $40000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    400,
    40000.0,
    'Dashboard migration: VC106 - MADHVANI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%SHEILA and KAMLESH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 9: VERSO BI -> KOHI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KOHI') OR i.legal_name ILIKE '%SAMIR%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    10000.0,
    'Dashboard migration: VC106 - KOHI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KOHI') OR i.legal_name ILIKE '%SAMIR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 11: VERSO BI -> CHIH-HENG
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHIH-HENG'))
  AND s.introducer_id IS NULL;

-- Spread commission: $4999.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    90,
    4999.5,
    'Dashboard migration: VC106 - CHIH-HENG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHIH-HENG'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 12: Manna Capital -> AGARWALA
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AGARWALA') OR i.legal_name ILIKE '%Rajiv%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    5000.0,
    'Dashboard migration: VC106 - AGARWALA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AGARWALA') OR i.legal_name ILIKE '%Rajiv%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 13: VERSO BI -> CHANDRA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANDRA') OR i.legal_name ILIKE '%Daphne%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $23542.2
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    NULL,
    23542.2,
    'Dashboard migration: VC106 - CHANDRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CHANDRA') OR i.legal_name ILIKE '%Daphne%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 14: VERSO BI -> YONGJIE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('YONGJIE') OR i.legal_name ILIKE '%Daryl%')
  AND s.introducer_id IS NULL;

-- Spread commission: $8250.3
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    90,
    8250.3,
    'Dashboard migration: VC106 - YONGJIE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('YONGJIE') OR i.legal_name ILIKE '%Daryl%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 15: VERSO BI -> SAE-JEE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAE-JEE') OR i.legal_name ILIKE '%Ekkawat%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1249.2
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    90,
    1249.2,
    'Dashboard migration: VC106 - SAE-JEE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAE-JEE') OR i.legal_name ILIKE '%Ekkawat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 16: VERSO BI -> GEOK
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GEOK'))
  AND s.introducer_id IS NULL;

-- Spread commission: $4003.2
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    90,
    4003.2,
    'Dashboard migration: VC106 - GEOK'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GEOK'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 17: VERSO BI -> DALINGA HOLDING AG
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Spread commission: $3768.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    3768.0,
    'Dashboard migration: VC106 - DALINGA HOLDING AG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 18: VERSO BI -> MARTINI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MARTINI') OR i.legal_name ILIKE '%Matteo%')
  AND s.introducer_id IS NULL;

-- Spread commission: $7537.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    7537.5,
    'Dashboard migration: VC106 - MARTINI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MARTINI') OR i.legal_name ILIKE '%Matteo%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 19: VERSO BI -> SAHLI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAHLI') OR i.legal_name ILIKE '%AS ADVISORY DWC-LLC%' OR i.legal_name ILIKE '%Ammar%')
  AND s.introducer_id IS NULL;

-- Spread commission: $35712.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    300,
    35712.0,
    'Dashboard migration: VC106 - SAHLI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAHLI') OR i.legal_name ILIKE '%AS ADVISORY DWC-LLC%' OR i.legal_name ILIKE '%Ammar%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 20: VERSO BI -> OEP Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $35715.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    300,
    35715.0,
    'Dashboard migration: VC106 - OEP Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 22: VERSO BI -> KRANA INVESTMENTS PTE. LTD.
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%')
  AND s.introducer_id IS NULL;

-- Spread commission: $20999.034
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    20999.034,
    'Dashboard migration: VC106 - KRANA INVESTMENTS PTE. LTD.'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 23: VERSO BI -> AKERMANN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AKERMANN') OR i.legal_name ILIKE '%Johann%')
  AND s.introducer_id IS NULL;

-- Spread commission: $15000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    15000.0,
    'Dashboard migration: VC106 - AKERMANN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AKERMANN') OR i.legal_name ILIKE '%Johann%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 24: VERSO BI -> CABIAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CABIAN') OR i.legal_name ILIKE '%Sandra%')
  AND s.introducer_id IS NULL;

-- Spread commission: $3768.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    3768.0,
    'Dashboard migration: VC106 - CABIAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CABIAN') OR i.legal_name ILIKE '%Sandra%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 25: VERSO BI -> SCIMONE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCIMONE') OR i.legal_name ILIKE '%Dario%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5980.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    250,
    5980.0,
    'Dashboard migration: VC106 - SCIMONE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCIMONE') OR i.legal_name ILIKE '%Dario%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - SCIMONE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCIMONE') OR i.legal_name ILIKE '%Dario%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - SCIMONE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCIMONE') OR i.legal_name ILIKE '%Dario%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 26: VERSO BI -> OFBR Trust
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OFBR Trust%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13941.6
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    157,
    13941.6,
    'Dashboard migration: VC106 - OFBR Trust'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OFBR Trust%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 27: VERSO BI -> Elidon Estate Inc
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Elidon Estate Inc%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13999.356
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    13999.356,
    'Dashboard migration: VC106 - Elidon Estate Inc'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Elidon Estate Inc%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 28: VERSO BI -> Adam Smith Singapore Pte Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1749.153
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    1749.153,
    'Dashboard migration: VC106 - Adam Smith Singapore Pte Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 33: TERRA Financial -> KNOPF
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KNOPF') OR i.legal_name ILIKE '%Mrs and Mr Beatrice & Marcel%')
  AND s.introducer_id IS NULL;

-- Spread commission: $3330.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    3330.0,
    'Dashboard migration: VC106 - KNOPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KNOPF') OR i.legal_name ILIKE '%Mrs and Mr Beatrice & Marcel%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 34: TERRA Financial -> VOLF Trust
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%VOLF Trust%')
  AND s.introducer_id IS NULL;

-- Spread commission: $16651.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'spread',
    150,
    16651.5,
    'Dashboard migration: VC106 - VOLF Trust'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%VOLF Trust%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 35: Anand Sethia -> Bahama Global Towers Limited
UPDATE subscriptions s
SET introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Bahama Global Towers Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $18687.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01',
    s.investor_id,
    s.deal_id,
    'spread',
    287,
    18687.5,
    'Dashboard migration: VC106 - Bahama Global Towers Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Bahama Global Towers Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 36: VERSO BI -> CAUSE FIRST Holdings Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $6806.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    6806.52,
    'Dashboard migration: VC106 - CAUSE FIRST Holdings Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 39: VERSO BI -> KARKUN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KARKUN') OR i.legal_name ILIKE '%Mrs and Mr%')
  AND s.introducer_id IS NULL;

-- Spread commission: $9088.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    400,
    9088.0,
    'Dashboard migration: VC106 - KARKUN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KARKUN') OR i.legal_name ILIKE '%Mrs and Mr%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 40: VERSO BI -> BROWN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROWN') OR i.legal_name ILIKE '%Craig%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    5000.0,
    'Dashboard migration: VC106 - BROWN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROWN') OR i.legal_name ILIKE '%Craig%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 41: VERSO BI -> TRUE INVESTMENTS 4 LLC
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $57104.25
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    175,
    57104.25,
    'Dashboard migration: VC106 - TRUE INVESTMENTS 4 LLC'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 42: VERSO BI -> ROSEN INVEST HOLDINGS Inc
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%')
  AND s.introducer_id IS NULL;

-- Spread commission: $6806.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    6806.52,
    'Dashboard migration: VC106 - ROSEN INVEST HOLDINGS Inc'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 43: VERSO BI -> SUBRAMANIAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SUBRAMANIAN') OR i.legal_name ILIKE '%Mrs & Mr Subbiah%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10321.689
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    153,
    10321.689,
    'Dashboard migration: VC106 - SUBRAMANIAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SUBRAMANIAN') OR i.legal_name ILIKE '%Mrs & Mr Subbiah%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 44: Anand Sethia -> JIMENEZ TRADING INC
UPDATE subscriptions s
SET introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%JIMENEZ TRADING INC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $994968.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01',
    s.investor_id,
    s.deal_id,
    'spread',
    468,
    994968.0,
    'Dashboard migration: VC106 - JIMENEZ TRADING INC'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%JIMENEZ TRADING INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 55: VERSO BI -> RIKHYE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RIKHYE') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Aaron%')
  AND s.introducer_id IS NULL;

-- Spread commission: $8716.6
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    204,
    8716.6,
    'Dashboard migration: VC106 - RIKHYE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RIKHYE') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Aaron%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 56: VERSO BI -> HARIA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HARIA') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Lakin%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2177.1
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    204,
    2177.1,
    'Dashboard migration: VC106 - HARIA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HARIA') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Lakin%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 57: VERSO BI -> HARIA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HARIA') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Sheetal%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2177.1
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    204,
    2177.1,
    'Dashboard migration: VC106 - HARIA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HARIA') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Sheetal%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 58: VERSO BI -> SHAH
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SHAH') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Tapan%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2177.1
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    204,
    2177.1,
    'Dashboard migration: VC106 - SHAH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SHAH') OR i.legal_name ILIKE '%Hedgebay Securities LLC%' OR i.legal_name ILIKE '%Tapan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 59: VERSO BI -> ONC Limited
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ONC Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $65901.35
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    65901.35,
    'Dashboard migration: VC106 - ONC Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ONC Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 1.25% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    125,
    '0x',
    'Dashboard migration: VC106 - ONC Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ONC Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $99999.984
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    99999.984,
    'Dashboard migration: VC106 - ONC Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%ONC Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 60: VERSO BI -> AL ABBASI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AL ABBASI') OR i.legal_name ILIKE '%Mohammed%')
  AND s.introducer_id IS NULL;

-- Spread commission: $31750.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    250,
    31750.0,
    'Dashboard migration: VC106 - AL ABBASI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('AL ABBASI') OR i.legal_name ILIKE '%Mohammed%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 61: VERSO BI -> CORR
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CORR') OR i.legal_name ILIKE '%Patrick%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13179.96
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    13179.96,
    'Dashboard migration: VC106 - CORR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CORR') OR i.legal_name ILIKE '%Patrick%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - CORR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CORR') OR i.legal_name ILIKE '%Patrick%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    5000.0,
    'Dashboard migration: VC106 - CORR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CORR') OR i.legal_name ILIKE '%Patrick%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 62: VERSO BI -> JORDAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JORDAN') OR i.legal_name ILIKE '%Stephen%')
  AND s.introducer_id IS NULL;

-- Spread commission: $4217.24
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    4217.24,
    'Dashboard migration: VC106 - JORDAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JORDAN') OR i.legal_name ILIKE '%Stephen%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - JORDAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JORDAN') OR i.legal_name ILIKE '%Stephen%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $3200.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    3200.0,
    'Dashboard migration: VC106 - JORDAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JORDAN') OR i.legal_name ILIKE '%Stephen%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 63: VERSO BI -> FigTree Family Office Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%FigTree Family Office Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $9489.72
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    9489.72,
    'Dashboard migration: VC106 - FigTree Family Office Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%FigTree Family Office Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - FigTree Family Office Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%FigTree Family Office Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $7200.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    7200.0,
    'Dashboard migration: VC106 - FigTree Family Office Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%FigTree Family Office Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 64: VERSO BI -> WRIGHT
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WRIGHT') OR i.legal_name ILIKE '%Oliver%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1317.5,
    'Dashboard migration: VC106 - WRIGHT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WRIGHT') OR i.legal_name ILIKE '%Oliver%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - WRIGHT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WRIGHT') OR i.legal_name ILIKE '%Oliver%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - WRIGHT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WRIGHT') OR i.legal_name ILIKE '%Oliver%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 65: VERSO BI -> VAN DEN BOL
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('VAN DEN BOL') OR i.legal_name ILIKE '%Emile%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    2635.62,
    'Dashboard migration: VC106 - VAN DEN BOL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('VAN DEN BOL') OR i.legal_name ILIKE '%Emile%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - VAN DEN BOL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('VAN DEN BOL') OR i.legal_name ILIKE '%Emile%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - VAN DEN BOL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('VAN DEN BOL') OR i.legal_name ILIKE '%Emile%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 66: VERSO BI -> MATTHEWS
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MATTHEWS') OR i.legal_name ILIKE '%Mark%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    2635.62,
    'Dashboard migration: VC106 - MATTHEWS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MATTHEWS') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - MATTHEWS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MATTHEWS') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - MATTHEWS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MATTHEWS') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 67: VERSO BI -> HAYCOX
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYCOX') OR i.legal_name ILIKE '%Matthew%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1976.56
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1976.56,
    'Dashboard migration: VC106 - HAYCOX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYCOX') OR i.legal_name ILIKE '%Matthew%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - HAYCOX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYCOX') OR i.legal_name ILIKE '%Matthew%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1500.0,
    'Dashboard migration: VC106 - HAYCOX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYCOX') OR i.legal_name ILIKE '%Matthew%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 68: VERSO BI -> ACKERLEY
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ACKERLEY') OR i.legal_name ILIKE '%John%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1317.5,
    'Dashboard migration: VC106 - ACKERLEY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ACKERLEY') OR i.legal_name ILIKE '%John%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - ACKERLEY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ACKERLEY') OR i.legal_name ILIKE '%John%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - ACKERLEY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ACKERLEY') OR i.legal_name ILIKE '%John%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 69: VERSO BI -> MANNING
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MANNING') OR i.legal_name ILIKE '%Steve%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1317.5,
    'Dashboard migration: VC106 - MANNING'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MANNING') OR i.legal_name ILIKE '%Steve%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - MANNING'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MANNING') OR i.legal_name ILIKE '%Steve%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - MANNING'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MANNING') OR i.legal_name ILIKE '%Steve%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 70: VERSO BI -> Global Custody & Clearing Limited
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Global Custody & Clearing Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $37293.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    37293.0,
    'Dashboard migration: VC106 - Global Custody & Clearing Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Global Custody & Clearing Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Global Custody & Clearing Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Global Custody & Clearing Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $28294.56
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    28294.56,
    'Dashboard migration: VC106 - Global Custody & Clearing Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Global Custody & Clearing Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 71: VERSO BI -> BROOKS
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROOKS') OR i.legal_name ILIKE '%Gregory%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1317.5,
    'Dashboard migration: VC106 - BROOKS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROOKS') OR i.legal_name ILIKE '%Gregory%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - BROOKS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROOKS') OR i.legal_name ILIKE '%Gregory%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - BROOKS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BROOKS') OR i.legal_name ILIKE '%Gregory%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 73: VERSO BI -> DAHAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DAHAN') OR i.legal_name ILIKE '%Stephane%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5271.86
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    5271.86,
    'Dashboard migration: VC106 - DAHAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DAHAN') OR i.legal_name ILIKE '%Stephane%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - DAHAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DAHAN') OR i.legal_name ILIKE '%Stephane%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $4000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4000.0,
    'Dashboard migration: VC106 - DAHAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DAHAN') OR i.legal_name ILIKE '%Stephane%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 74: VERSO BI -> DUTIL
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUTIL') OR i.legal_name ILIKE '%Jean%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    2635.62,
    'Dashboard migration: VC106 - DUTIL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUTIL') OR i.legal_name ILIKE '%Jean%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - DUTIL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUTIL') OR i.legal_name ILIKE '%Jean%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - DUTIL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUTIL') OR i.legal_name ILIKE '%Jean%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 77: VERSO BI -> Sudon Carlop Holdings Limited
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Sudon Carlop Holdings Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2635.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    2635.62,
    'Dashboard migration: VC106 - Sudon Carlop Holdings Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Sudon Carlop Holdings Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Sudon Carlop Holdings Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Sudon Carlop Holdings Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - Sudon Carlop Holdings Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Sudon Carlop Holdings Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 78: VERSO BI -> SCHUTTE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCHUTTE') OR i.legal_name ILIKE '%Lesli%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    1317.5,
    'Dashboard migration: VC106 - SCHUTTE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCHUTTE') OR i.legal_name ILIKE '%Lesli%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - SCHUTTE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCHUTTE') OR i.legal_name ILIKE '%Lesli%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC106 - SCHUTTE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SCHUTTE') OR i.legal_name ILIKE '%Lesli%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 79: VERSO BI -> SEKHON
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SEKHON') OR i.legal_name ILIKE '%Manraj%')
  AND s.introducer_id IS NULL;

-- Spread commission: $29930.56
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    176,
    29930.56,
    'Dashboard migration: VC106 - SEKHON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SEKHON') OR i.legal_name ILIKE '%Manraj%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 82: VERSO BI -> GRAF
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GRAF') OR i.legal_name ILIKE '%Erich%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1360.32
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    32,
    1360.32,
    'Dashboard migration: VC106 - GRAF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GRAF') OR i.legal_name ILIKE '%Erich%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 83: VERSO BI -> TERRA Financial & Management Services SA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TERRA Financial & Management Services SA%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    250,
    '0x',
    'Dashboard migration: VC106 - TERRA Financial & Management Services SA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TERRA Financial & Management Services SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 84: VERSO BI -> NUSSBERGER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('NUSSBERGER') OR i.legal_name ILIKE '%Shana%')
  AND s.introducer_id IS NULL;

-- Spread commission: $9106.02
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    9106.02,
    'Dashboard migration: VC106 - NUSSBERGER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('NUSSBERGER') OR i.legal_name ILIKE '%Shana%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 85: VERSO BI -> JASSQ HOLDING LIMITED
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2550.9
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    30,
    2550.9,
    'Dashboard migration: VC106 - JASSQ HOLDING LIMITED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 86: VERSO BI -> INNOSIGHT VENTURES Pte Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $20000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    80,
    20000.0,
    'Dashboard migration: VC106 - INNOSIGHT VENTURES Pte Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 87: VERSO BI -> INNOSIGHT VENTURES Pte Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5600.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    80,
    5600.0,
    'Dashboard migration: VC106 - INNOSIGHT VENTURES Pte Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 88: VERSO BI -> GORILLA PE Inc
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GORILLA PE Inc%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1760203.8
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    276,
    1760203.8,
    'Dashboard migration: VC106 - GORILLA PE Inc'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GORILLA PE Inc%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 89: VERSO BI -> EVANS
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('EVANS') OR i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%' OR i.legal_name ILIKE '%Mark%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13179.96
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    62,
    13179.96,
    'Dashboard migration: VC106 - EVANS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('EVANS') OR i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%' OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - EVANS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('EVANS') OR i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%' OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    10000.0,
    'Dashboard migration: VC106 - EVANS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('EVANS') OR i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%' OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 90: VERSO BI -> HOLDEN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HOLDEN') OR i.legal_name ILIKE '%David%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1976.87
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1976.87,
    'Dashboard migration: VC106 - HOLDEN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HOLDEN') OR i.legal_name ILIKE '%David%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - HOLDEN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HOLDEN') OR i.legal_name ILIKE '%David%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $3000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    3000.0,
    'Dashboard migration: VC106 - HOLDEN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HOLDEN') OR i.legal_name ILIKE '%David%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 93: VERSO BI -> HAYAT
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYAT') OR i.legal_name ILIKE '%Imrat%')
  AND s.introducer_id IS NULL;

-- Spread commission: $25200.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    25200.0,
    'Dashboard migration: VC106 - HAYAT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYAT') OR i.legal_name ILIKE '%Imrat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $4904.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4904.0,
    'Dashboard migration: VC106 - HAYAT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAYAT') OR i.legal_name ILIKE '%Imrat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 102: VERSO BI -> KOTHARI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KOTHARI') OR i.legal_name ILIKE '%Ashish%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - KOTHARI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KOTHARI') OR i.legal_name ILIKE '%Ashish%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - KOTHARI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KOTHARI') OR i.legal_name ILIKE '%Ashish%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 104: VERSO BI -> MUKHTAR
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MUKHTAR') OR i.legal_name ILIKE '%Fawad%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - MUKHTAR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MUKHTAR') OR i.legal_name ILIKE '%Fawad%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2000.0,
    'Dashboard migration: VC106 - MUKHTAR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('MUKHTAR') OR i.legal_name ILIKE '%Fawad%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 106: VERSO BI -> SOUTH SOUND LTD
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SOUTH SOUND LTD%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2635.93
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    2635.93,
    'Dashboard migration: VC106 - SOUTH SOUND LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - SOUTH SOUND LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $4000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4000.0,
    'Dashboard migration: VC106 - SOUTH SOUND LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 107: VERSO BI -> PATRASCU
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATRASCU') OR i.legal_name ILIKE '%Constantin-Octavian%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - PATRASCU'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATRASCU') OR i.legal_name ILIKE '%Constantin-Octavian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - PATRASCU'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATRASCU') OR i.legal_name ILIKE '%Constantin-Octavian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - PATRASCU'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATRASCU') OR i.legal_name ILIKE '%Constantin-Octavian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 108: VERSO BI -> JOGANI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JOGANI') OR i.legal_name ILIKE '%Mayuriben%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - JOGANI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JOGANI') OR i.legal_name ILIKE '%Mayuriben%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - JOGANI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JOGANI') OR i.legal_name ILIKE '%Mayuriben%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 110: VERSO BI -> RUSHTON
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RUSHTON') OR i.legal_name ILIKE '%Hayden%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - RUSHTON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RUSHTON') OR i.legal_name ILIKE '%Hayden%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - RUSHTON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RUSHTON') OR i.legal_name ILIKE '%Hayden%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - RUSHTON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RUSHTON') OR i.legal_name ILIKE '%Hayden%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 111: VERSO BI -> WILLETTS
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WILLETTS') OR i.legal_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - WILLETTS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('WILLETTS') OR i.legal_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 112: VERSO BI -> SOMMERVILLE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOMMERVILLE') OR i.legal_name ILIKE '%Emma Graham-Taylor & Gregory%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - SOMMERVILLE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOMMERVILLE') OR i.legal_name ILIKE '%Emma Graham-Taylor & Gregory%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - SOMMERVILLE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOMMERVILLE') OR i.legal_name ILIKE '%Emma Graham-Taylor & Gregory%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 113: VERSO BI -> LAI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LAI') OR i.legal_name ILIKE '%Rabin D. and Dolly%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5356.26
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    5356.26,
    'Dashboard migration: VC106 - LAI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LAI') OR i.legal_name ILIKE '%Rabin D. and Dolly%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - LAI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LAI') OR i.legal_name ILIKE '%Rabin D. and Dolly%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 114: VERSO BI -> LUND
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LUND'))
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - LUND'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LUND'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - LUND'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LUND'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - LUND'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LUND'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 115: VERSO BI -> BELGA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BELGA') OR i.legal_name ILIKE '%Ivan%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - BELGA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BELGA') OR i.legal_name ILIKE '%Ivan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - BELGA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BELGA') OR i.legal_name ILIKE '%Ivan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - BELGA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BELGA') OR i.legal_name ILIKE '%Ivan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 116: VERSO BI -> JOMAA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JOMAA') OR i.legal_name ILIKE '%Ayman%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $6000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    6000.0,
    'Dashboard migration: VC106 - JOMAA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JOMAA') OR i.legal_name ILIKE '%Ayman%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 117: VERSO BI -> JAYARAMAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAYARAMAN') OR i.legal_name ILIKE '%Karthic%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $8000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    8000.0,
    'Dashboard migration: VC106 - JAYARAMAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAYARAMAN') OR i.legal_name ILIKE '%Karthic%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 118: VERSO BI -> HAKIM
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAKIM') OR i.legal_name ILIKE '%Imran%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - HAKIM'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAKIM') OR i.legal_name ILIKE '%Imran%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - HAKIM'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAKIM') OR i.legal_name ILIKE '%Imran%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - HAKIM'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HAKIM') OR i.legal_name ILIKE '%Imran%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 119: VERSO BI -> Kenilworth Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Kenilworth Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - Kenilworth Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Kenilworth Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Kenilworth Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Kenilworth Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - Kenilworth Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Kenilworth Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 120: VERSO BI -> KHAWAJA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KHAWAJA') OR i.legal_name ILIKE '%Adil%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - KHAWAJA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KHAWAJA') OR i.legal_name ILIKE '%Adil%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2500.0,
    'Dashboard migration: VC106 - KHAWAJA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KHAWAJA') OR i.legal_name ILIKE '%Adil%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 121: VERSO BI -> JATANIA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JATANIA') OR i.legal_name ILIKE '%Bharat%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - JATANIA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JATANIA') OR i.legal_name ILIKE '%Bharat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - JATANIA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JATANIA') OR i.legal_name ILIKE '%Bharat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - JATANIA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JATANIA') OR i.legal_name ILIKE '%Bharat%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 122: VERSO BI -> QUNASH
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('QUNASH') OR i.legal_name ILIKE '%Lubna%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - QUNASH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('QUNASH') OR i.legal_name ILIKE '%Lubna%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - QUNASH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('QUNASH') OR i.legal_name ILIKE '%Lubna%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 133: VERSO BI -> GUERIN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GUERIN') OR i.legal_name ILIKE '%Michel%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - GUERIN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GUERIN') OR i.legal_name ILIKE '%Michel%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2000.0,
    'Dashboard migration: VC106 - GUERIN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GUERIN') OR i.legal_name ILIKE '%Michel%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 134: VERSO BI -> LE SEIGNEUR
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - LE SEIGNEUR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - LE SEIGNEUR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 136: VERSO BI -> Phaena Advisory Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Phaena Advisory Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - Phaena Advisory Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Phaena Advisory Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 137: VERSO BI -> PATEL
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Bhikhu%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13392.54
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    13392.54,
    'Dashboard migration: VC106 - PATEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Bhikhu%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    5000.0,
    'Dashboard migration: VC106 - PATEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Bhikhu%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 138: VERSO BI -> PATEL
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Vijaykumar%')
  AND s.introducer_id IS NULL;

-- Spread commission: $40177.62
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    40177.62,
    'Dashboard migration: VC106 - PATEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Vijaykumar%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $15000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    15000.0,
    'Dashboard migration: VC106 - PATEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('PATEL') OR i.legal_name ILIKE '%Vijaykumar%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 139: VERSO BI -> POTASSIUM Capital
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%POTASSIUM Capital%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - POTASSIUM Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%POTASSIUM Capital%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - POTASSIUM Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%POTASSIUM Capital%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - POTASSIUM Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%POTASSIUM Capital%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 140: VERSO BI -> HASSAN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HASSAN') OR i.legal_name ILIKE '%Aatif%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1317.81
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    1317.81,
    'Dashboard migration: VC106 - HASSAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HASSAN') OR i.legal_name ILIKE '%Aatif%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - HASSAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HASSAN') OR i.legal_name ILIKE '%Aatif%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - HASSAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HASSAN') OR i.legal_name ILIKE '%Aatif%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 142: VERSO BI -> GTV Partners SA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GTV Partners SA%')
  AND s.introducer_id IS NULL;

-- Spread commission: $33033.42
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    162,
    33033.42,
    'Dashboard migration: VC106 - GTV Partners SA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GTV Partners SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - GTV Partners SA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GTV Partners SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    10000.0,
    'Dashboard migration: VC106 - GTV Partners SA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GTV Partners SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 143: VERSO BI -> LENN Participations SARL
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%LENN Participations SARL%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - LENN Participations SARL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%LENN Participations SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - LENN Participations SARL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%LENN Participations SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 144: VERSO BI -> WEALTH TRAIN LIMITED
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%WEALTH TRAIN LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5930.92
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    31,
    5930.92,
    'Dashboard migration: VC106 - WEALTH TRAIN LIMITED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%WEALTH TRAIN LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - WEALTH TRAIN LIMITED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%WEALTH TRAIN LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 146: VERSO BI -> TERSANE INTERNATIONAL LTD
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - TERSANE INTERNATIONAL LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 149: VERSO BI -> GOKER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.introducer_id IS NULL;

-- Spread commission: $18748.8
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    18748.8,
    'Dashboard migration: VC106 - GOKER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $7000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    7000.0,
    'Dashboard migration: VC106 - GOKER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 150: VERSO BI -> ALAMOUTI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Cyrus%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5356.26
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    5356.26,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Cyrus%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Cyrus%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 151: VERSO BI -> ALAMOUTI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Darius%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5356.26
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    5356.26,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Darius%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Darius%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 152: VERSO BI -> ALAMOUTI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Kaveh%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5356.26
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    5356.26,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Kaveh%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - ALAMOUTI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ALAMOUTI') OR i.legal_name ILIKE '%Kaveh%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 153: VERSO BI -> Caspian Enterprises Limited
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Caspian Enterprises Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $53571.42
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    53571.42,
    'Dashboard migration: VC106 - Caspian Enterprises Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Caspian Enterprises Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $20000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    20000.0,
    'Dashboard migration: VC106 - Caspian Enterprises Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Caspian Enterprises Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 154: VERSO BI -> Rensburg Client Nominees Limited A/c CLT
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC106 - Rensburg Client Nominees Limited A/c CLT'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 155: VERSO BI -> DCMS Holdings Limited
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%DCMS Holdings Limited%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $8000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    8000.0,
    'Dashboard migration: VC106 - DCMS Holdings Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%DCMS Holdings Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 156: VERSO BI -> GELIGA LIMITED
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GELIGA LIMITED%' OR i.legal_name ILIKE '%(Anton)%')
  AND s.introducer_id IS NULL;

-- Spread commission: $26785.08
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    26785.08,
    'Dashboard migration: VC106 - GELIGA LIMITED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GELIGA LIMITED%' OR i.legal_name ILIKE '%(Anton)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    10000.0,
    'Dashboard migration: VC106 - GELIGA LIMITED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GELIGA LIMITED%' OR i.legal_name ILIKE '%(Anton)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 158: VERSO BI -> KRAUSER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KRAUSER') OR i.legal_name ILIKE '%Damien%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - KRAUSER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('KRAUSER') OR i.legal_name ILIKE '%Damien%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 159: VERSO BI -> LE SEIGNEUR
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - LE SEIGNEUR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - LE SEIGNEUR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('LE SEIGNEUR') OR i.legal_name ILIKE '%Eric%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 160: VERSO BI -> FLETCHER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('FLETCHER') OR i.legal_name ILIKE '%Scott%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    10000.0,
    'Dashboard migration: VC106 - FLETCHER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('FLETCHER') OR i.legal_name ILIKE '%Scott%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 168: VERSO BI -> STEIMES
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('STEIMES') OR i.legal_name ILIKE '%Herve%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - STEIMES'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('STEIMES') OR i.legal_name ILIKE '%Herve%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - STEIMES'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('STEIMES') OR i.legal_name ILIKE '%Herve%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 169: VERSO BI -> SERRA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SERRA') OR i.legal_name ILIKE '%Julien%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - SERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SERRA') OR i.legal_name ILIKE '%Julien%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - SERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SERRA') OR i.legal_name ILIKE '%Julien%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 170: VERSO BI -> SAMAMA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Frederic%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - SAMAMA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Frederic%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - SAMAMA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Frederic%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 172: VERSO BI -> SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    5000.0,
    'Dashboard migration: VC106 - SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 173: VERSO BI -> CUDRE-MAUROUX
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CUDRE-MAUROUX') OR i.legal_name ILIKE '%Laurent%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - CUDRE-MAUROUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CUDRE-MAUROUX') OR i.legal_name ILIKE '%Laurent%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - CUDRE-MAUROUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CUDRE-MAUROUX') OR i.legal_name ILIKE '%Laurent%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 174: VERSO BI -> CYTRON
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CYTRON') OR i.legal_name ILIKE '%Georges%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - CYTRON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CYTRON') OR i.legal_name ILIKE '%Georges%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - CYTRON'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('CYTRON') OR i.legal_name ILIKE '%Georges%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 175: VERSO BI -> RIENZO
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RIENZO') OR i.legal_name ILIKE '%Rosario%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - RIENZO'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RIENZO') OR i.legal_name ILIKE '%Rosario%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2000.0,
    'Dashboard migration: VC106 - RIENZO'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('RIENZO') OR i.legal_name ILIKE '%Rosario%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 176: VERSO BI -> GHESQUIERES
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GHESQUIERES') OR i.legal_name ILIKE '%Raphael%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - GHESQUIERES'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GHESQUIERES') OR i.legal_name ILIKE '%Raphael%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - GHESQUIERES'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GHESQUIERES') OR i.legal_name ILIKE '%Raphael%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 177: VERSO BI -> SAMAMA
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Guillaume%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - SAMAMA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Guillaume%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - SAMAMA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SAMAMA') OR i.legal_name ILIKE '%Guillaume%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 178: VERSO BI -> ROSSIER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROSSIER') OR i.legal_name ILIKE '%David%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - ROSSIER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROSSIER') OR i.legal_name ILIKE '%David%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2000.0,
    'Dashboard migration: VC106 - ROSSIER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('ROSSIER') OR i.legal_name ILIKE '%David%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 179: VERSO BI -> MARSAULT INTERNATIONAL LTD
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - MARSAULT INTERNATIONAL LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2000.0,
    'Dashboard migration: VC106 - MARSAULT INTERNATIONAL LTD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 180: VERSO BI -> DUFAURE
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUFAURE') OR i.legal_name ILIKE '%Bernard%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC106 - DUFAURE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUFAURE') OR i.legal_name ILIKE '%Bernard%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC106 - DUFAURE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('DUFAURE') OR i.legal_name ILIKE '%Bernard%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 181: VERSO BI -> GOKER
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.introducer_id IS NULL;

-- Spread commission: $34821.36
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    34821.36,
    'Dashboard migration: VC106 - GOKER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $13000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    13000.0,
    'Dashboard migration: VC106 - GOKER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('GOKER') OR i.legal_name ILIKE '%Murat Cem and Mehmet Can%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 183: VERSO BI -> SUKHOTIN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SUKHOTIN') OR i.legal_name ILIKE '%Vasily%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $6000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    6000.0,
    'Dashboard migration: VC106 - SUKHOTIN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SUKHOTIN') OR i.legal_name ILIKE '%Vasily%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 187: VERSO BI -> JAVID
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Hossien%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2677.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    2677.5,
    'Dashboard migration: VC106 - JAVID'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Hossien%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $999.6
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    999.6,
    'Dashboard migration: VC106 - JAVID'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Hossien%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 188: VERSO BI -> BADII
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BADII') OR i.legal_name ILIKE '%Kamyar%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1071.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    1071.0,
    'Dashboard migration: VC106 - BADII'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BADII') OR i.legal_name ILIKE '%Kamyar%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $399.84
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    399.84,
    'Dashboard migration: VC106 - BADII'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('BADII') OR i.legal_name ILIKE '%Kamyar%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 189: VERSO BI -> SOLOUKI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOLOUKI') OR i.legal_name ILIKE '%Shaham%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2677.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    2677.5,
    'Dashboard migration: VC106 - SOLOUKI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOLOUKI') OR i.legal_name ILIKE '%Shaham%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $999.6
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    999.6,
    'Dashboard migration: VC106 - SOLOUKI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('SOLOUKI') OR i.legal_name ILIKE '%Shaham%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 190: VERSO BI -> JAVID
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Kian%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1338.12
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    1338.12,
    'Dashboard migration: VC106 - JAVID'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Kian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $499.5648
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    499.5648,
    'Dashboard migration: VC106 - JAVID'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('JAVID') OR i.legal_name ILIKE '%Kian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 191: VERSO BI -> HUSSAIN
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HUSSAIN') OR i.legal_name ILIKE '%Salman%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2677.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    2677.5,
    'Dashboard migration: VC106 - HUSSAIN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HUSSAIN') OR i.legal_name ILIKE '%Salman%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $999.6
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    999.6,
    'Dashboard migration: VC106 - HUSSAIN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('HUSSAIN') OR i.legal_name ILIKE '%Salman%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 192: VERSO BI -> TONELLI BANFI
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('TONELLI BANFI') OR i.legal_name ILIKE '%Juan%')
  AND s.introducer_id IS NULL;

-- Spread commission: $13392.54
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    126,
    13392.54,
    'Dashboard migration: VC106 - TONELLI BANFI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('TONELLI BANFI') OR i.legal_name ILIKE '%Juan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    5000.0,
    'Dashboard migration: VC106 - TONELLI BANFI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('TONELLI BANFI') OR i.legal_name ILIKE '%Juan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 193: VERSO BI -> GREENLEAF
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GREENLEAF%')
  AND s.introducer_id IS NULL;

-- Spread commission: $132388.65
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    132388.65,
    'Dashboard migration: VC106 - GREENLEAF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%GREENLEAF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 194: VERSO BI -> Banco BTG Pactual S.A. Client 12279
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 12279'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 12279'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 12279'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 195: VERSO BI -> Banco BTG Pactual S.A. Client 34658
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34658'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34658'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34658'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 196: VERSO BI -> Banco BTG Pactual S.A. Client 34924
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34924'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34924'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 34924'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 197: VERSO BI -> Banco BTG Pactual S.A. Client 36003
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%')
  AND s.introducer_id IS NULL;

-- Spread commission: $26785.08
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    26785.08,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36003'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36003'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1250.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    1250.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36003'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 198: VERSO BI -> Banco BTG Pactual S.A. Client 36749
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36749'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36749'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36749'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 199: VERSO BI -> Banco BTG Pactual S.A. Client 36957
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36957'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36957'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 36957'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 200: VERSO BI -> Banco BTG Pactual S.A. Client 80738
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80738'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80738'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80738'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 201: VERSO BI -> Banco BTG Pactual S.A. Client 80772
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80772'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80772'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80772'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 202: VERSO BI -> Banco BTG Pactual S.A. Client 80775
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80775'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80775'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80775'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 203: VERSO BI -> Banco BTG Pactual S.A. Client 80776
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80776'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80776'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80776'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 204: VERSO BI -> Banco BTG Pactual S.A. Client 80840
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80840'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80840'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80840'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 205: VERSO BI -> Banco BTG Pactual S.A. Client 80862
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80862'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80862'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80862'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 206: VERSO BI -> Banco BTG Pactual S.A. Client 80873
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80873'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80873'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80873'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 207: VERSO BI -> Banco BTG Pactual S.A. Client 80890
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80890'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80890'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80890'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 208: VERSO BI -> Banco BTG Pactual S.A. Client 80910
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80910'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80910'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 80910'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 209: VERSO BI -> Banco BTG Pactual S.A. Client 81022
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%')
  AND s.introducer_id IS NULL;

-- Spread commission: $10712.52
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    10712.52,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 81022'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 81022'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    500.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 81022'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 210: VERSO BI -> Banco BTG Pactual S.A. Client 515
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%')
  AND s.introducer_id IS NULL;

-- Spread commission: $107142.84
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    252,
    107142.84,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 515'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 515'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    5000.0,
    'Dashboard migration: VC106 - Banco BTG Pactual S.A. Client 515'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 212: VERSO BI -> OLD HILL INVESTMENT GROUP LLC
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $59819.61
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    200,
    59819.61,
    'Dashboard migration: VC106 - OLD HILL INVESTMENT GROUP LLC'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 214: VERSO BI -> FONTES WILLIAMS
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('FONTES WILLIAMS') OR i.legal_name ILIKE '%Luiz%')
  AND s.introducer_id IS NULL;

-- Spread commission: $4078.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'spread',
    100,
    4078.0,
    'Dashboard migration: VC106 - FONTES WILLIAMS'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = UPPER('FONTES WILLIAMS') OR i.legal_name ILIKE '%Luiz%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- === VC111 (25 records) ===

-- Row 4: Gemera -> VC11
UPDATE subscriptions s
SET introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 5: Stableton+Terra -> VC11
UPDATE subscriptions s
SET introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $7500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    300,
    7500.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 6: Terra -> VC11
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2300.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2300.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 7: Terra -> VC11
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Tartrifuge SA%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Tartrifuge SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Tartrifuge SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 9
-- SKIP: No investor identifier for row 12
-- SKIP: No investor identifier for row 13
-- Row 14: Terra -> VC11
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%VOLF Trust%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%VOLF Trust%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%VOLF Trust%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 15
-- SKIP: No investor identifier for row 16
-- Row 18: Terra -> Markus
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Markus'))
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - Markus'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Markus'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - Markus'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Markus'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 19
-- Row 20: AUX -> Attilio
UPDATE subscriptions s
SET introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Attilio'))
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - Attilio'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Attilio'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - Attilio'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Attilio'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 21: AUX -> VC11
UPDATE subscriptions s
SET introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%FINALMA SUISSE SA%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%FINALMA SUISSE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%FINALMA SUISSE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 22: AUX -> VC11
UPDATE subscriptions s
SET introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%MONFIN LTD%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%MONFIN LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%MONFIN LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 23: Gemera -> VC11
UPDATE subscriptions s
SET introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings LTD%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 24: AUX -> Bruno
UPDATE subscriptions s
SET introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Bruno'))
  AND s.introducer_id IS NULL;

-- Performance fee: 2.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    250,
    '0x',
    'Dashboard migration: VC111 - Bruno'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Bruno'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2100.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    300,
    2100.0,
    'Dashboard migration: VC111 - Bruno'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = UPPER('Bruno'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 29
-- Row 30: Julien -> VC11
UPDATE subscriptions s
SET introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%BenSkyla AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%BenSkyla AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $4000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%BenSkyla AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 31
-- Row 32: Anand Sethia -> VC11
UPDATE subscriptions s
SET introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Wymo Finance Limited%')
  AND s.introducer_id IS NULL;

-- Performance fee: 7.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    750,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Wymo Finance Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 33: Anand Sethia -> VC11
UPDATE subscriptions s
SET introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%HASSBRO Investments Limited%')
  AND s.introducer_id IS NULL;

-- Performance fee: 7.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    750,
    '0x',
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%HASSBRO Investments Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 34
-- SKIP: No investor identifier for row 35
-- Row 36: Rick + Andrew -> VC11
UPDATE subscriptions s
SET introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $330114.29
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56',
    s.investor_id,
    s.deal_id,
    'spread',
    285,
    330114.29,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $20000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    20000.0,
    'Dashboard migration: VC111 - VC11'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- === VC112 (3 records) ===

-- SKIP: No investor identifier for row 16
-- SKIP: No investor identifier for row 17
-- Row 20: FINSA -> Antonio Alberto
UPDATE subscriptions s
SET introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = UPPER('Antonio Alberto'))
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC112 - Antonio Alberto'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = UPPER('Antonio Alberto'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    400,
    2000.0,
    'Dashboard migration: VC112 - Antonio Alberto'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = UPPER('Antonio Alberto'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- === VC113 (38 records) ===

-- Row 3: Terra -> WINZ
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('WINZ') OR i.legal_name ILIKE '%Barbara and Heinz%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - WINZ'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('WINZ') OR i.legal_name ILIKE '%Barbara and Heinz%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - WINZ'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('WINZ') OR i.legal_name ILIKE '%Barbara and Heinz%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 5: Terra -> AKERMANN
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('AKERMANN') OR i.legal_name ILIKE '%Markus%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - AKERMANN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('AKERMANN') OR i.legal_name ILIKE '%Markus%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $750.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    750.0,
    'Dashboard migration: VC113 - AKERMANN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('AKERMANN') OR i.legal_name ILIKE '%Markus%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 6: Terra -> Dalinga AG
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - Dalinga AG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $3000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    3000.0,
    'Dashboard migration: VC113 - Dalinga AG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 7: Terra -> Dalinga AG
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - Dalinga AG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $300.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    300.0,
    'Dashboard migration: VC113 - Dalinga AG'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Dalinga AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 8: Terra -> ROMANOV
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ROMANOV') OR i.legal_name ILIKE '%Liudmila Romanova and Alexey%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - ROMANOV'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ROMANOV') OR i.legal_name ILIKE '%Liudmila Romanova and Alexey%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $8000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    8000.0,
    'Dashboard migration: VC113 - ROMANOV'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ROMANOV') OR i.legal_name ILIKE '%Liudmila Romanova and Alexey%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 10: Terra -> GORYAINOV
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GORYAINOV') OR i.legal_name ILIKE '%Andrey%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - GORYAINOV'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GORYAINOV') OR i.legal_name ILIKE '%Andrey%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - GORYAINOV'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GORYAINOV') OR i.legal_name ILIKE '%Andrey%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 11: Terra -> ZINKEVICH
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ZINKEVICH') OR i.legal_name ILIKE '%Liubov and Igor%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - ZINKEVICH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ZINKEVICH') OR i.legal_name ILIKE '%Liubov and Igor%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - ZINKEVICH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ZINKEVICH') OR i.legal_name ILIKE '%Liubov and Igor%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 12: Rick -> MADHVANI
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%Sheila and Kamlesh%')
  AND s.introducer_id IS NULL;

-- Spread commission: $17500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    17500.0,
    'Dashboard migration: VC113 - MADHVANI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%Sheila and Kamlesh%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 13: Gemera -> Rosen Invest Holdings Inc
UPDATE subscriptions s
SET introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Rosen Invest Holdings Inc%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - Rosen Invest Holdings Inc'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Rosen Invest Holdings Inc%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - Rosen Invest Holdings Inc'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Rosen Invest Holdings Inc%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 14: Rick -> Zandera (Finco) Limited
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $175000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    175000.0,
    'Dashboard migration: VC113 - Zandera (Finco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 15: Rick -> HAYWARD
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HAYWARD') OR i.legal_name ILIKE '%Mark%')
  AND s.introducer_id IS NULL;

-- Spread commission: $8750.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    8750.0,
    'Dashboard migration: VC113 - HAYWARD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HAYWARD') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 16: Terra -> KNOPF
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('KNOPF') OR i.legal_name ILIKE '%Beatrice and Marcel%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - KNOPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('KNOPF') OR i.legal_name ILIKE '%Beatrice and Marcel%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - KNOPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('KNOPF') OR i.legal_name ILIKE '%Beatrice and Marcel%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 17: Rick -> TOMMEY
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('TOMMEY') OR i.legal_name ILIKE '%Scott%')
  AND s.introducer_id IS NULL;

-- Spread commission: $26250.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    26250.0,
    'Dashboard migration: VC113 - TOMMEY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('TOMMEY') OR i.legal_name ILIKE '%Scott%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 19: Terra -> Signet Logistics Ltd
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Signet Logistics Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - Signet Logistics Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Signet Logistics Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - Signet Logistics Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Signet Logistics Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 20: Terra -> GRAF
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GRAF') OR i.legal_name ILIKE '%Erich%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - GRAF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GRAF') OR i.legal_name ILIKE '%Erich%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - GRAF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('GRAF') OR i.legal_name ILIKE '%Erich%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 21: Rick -> MADHVANI
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%Shrai and Aparna%')
  AND s.introducer_id IS NULL;

-- Spread commission: $17500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    17500.0,
    'Dashboard migration: VC113 - MADHVANI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MADHVANI') OR i.legal_name ILIKE '%Shrai and Aparna%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 22: Terra -> DE
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('DE') OR i.legal_name ILIKE '%Ivan%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - DE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('DE') OR i.legal_name ILIKE '%Ivan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC113 - DE'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('DE') OR i.legal_name ILIKE '%Ivan%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 23: Sandro -> Bright Phoenix Holdings Ltd
UPDATE subscriptions s
SET introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - Bright Phoenix Holdings Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - Bright Phoenix Holdings Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 24: Sandro -> TEKAPO Group Limited
UPDATE subscriptions s
SET introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%TEKAPO Group Limited%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - TEKAPO Group Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%TEKAPO Group Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - TEKAPO Group Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%TEKAPO Group Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 25: Terra -> ALGAR
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ALGAR') OR i.legal_name ILIKE '%Philip%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC113 - ALGAR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ALGAR') OR i.legal_name ILIKE '%Philip%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC113 - ALGAR'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ALGAR') OR i.legal_name ILIKE '%Philip%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 26: Enguerrand -> MERIDA
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MERIDA') OR i.legal_name ILIKE '%Sebastian%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - MERIDA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MERIDA') OR i.legal_name ILIKE '%Sebastian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $600.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    600.0,
    'Dashboard migration: VC113 - MERIDA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MERIDA') OR i.legal_name ILIKE '%Sebastian%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 28: Sandro -> MAHESWARI & SUBRAMANIAN
UPDATE subscriptions s
SET introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MAHESWARI & SUBRAMANIAN') OR i.legal_name ILIKE '%Mrs Nilakantan & Mr Subbiah%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - MAHESWARI & SUBRAMANIAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MAHESWARI & SUBRAMANIAN') OR i.legal_name ILIKE '%Mrs Nilakantan & Mr Subbiah%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2100.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2100.0,
    'Dashboard migration: VC113 - MAHESWARI & SUBRAMANIAN'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MAHESWARI & SUBRAMANIAN') OR i.legal_name ILIKE '%Mrs Nilakantan & Mr Subbiah%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 29: Sandro -> HIQUIANA-TANEJA & TANEJA
UPDATE subscriptions s
SET introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HIQUIANA-TANEJA & TANEJA') OR i.legal_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - HIQUIANA-TANEJA & TANEJA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HIQUIANA-TANEJA & TANEJA') OR i.legal_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2200.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2200.0,
    'Dashboard migration: VC113 - HIQUIANA-TANEJA & TANEJA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HIQUIANA-TANEJA & TANEJA') OR i.legal_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 31: Enguerrand -> FRALIS SPF
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%FRALIS SPF%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - FRALIS SPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $10000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    10000.0,
    'Dashboard migration: VC113 - FRALIS SPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 33: Enguerrand -> NEWBRIDGE FINANCE SPF
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - NEWBRIDGE FINANCE SPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $14000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    50,
    14000.0,
    'Dashboard migration: VC113 - NEWBRIDGE FINANCE SPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 37: Enguerrand -> ULDRY
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ULDRY') OR i.legal_name ILIKE '%Thierry%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - ULDRY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ULDRY') OR i.legal_name ILIKE '%Thierry%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - ULDRY'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('ULDRY') OR i.legal_name ILIKE '%Thierry%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 39: Enguerrand -> COMEL
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('COMEL') OR i.legal_name ILIKE '%Jeremie%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - COMEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('COMEL') OR i.legal_name ILIKE '%Jeremie%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $400.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    400.0,
    'Dashboard migration: VC113 - COMEL'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('COMEL') OR i.legal_name ILIKE '%Jeremie%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 42: Enguerrand -> EL MOGHAZI
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('EL MOGHAZI') OR i.legal_name ILIKE '%Halim%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - EL MOGHAZI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('EL MOGHAZI') OR i.legal_name ILIKE '%Halim%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $520.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    520.0,
    'Dashboard migration: VC113 - EL MOGHAZI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('EL MOGHAZI') OR i.legal_name ILIKE '%Halim%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 48: Rick -> Zandera (Finco) Limited
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $214281.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    900,
    214281.0,
    'Dashboard migration: VC113 - Zandera (Finco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Finco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 58: Omar -> MOHAMMED
UPDATE subscriptions s
SET introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MOHAMMED') OR i.legal_name ILIKE '%Majid%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'ae4d8764-3c68-4d34-beca-9f4fec4c71a9',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - MOHAMMED'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MOHAMMED') OR i.legal_name ILIKE '%Majid%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 61: VERSO BI -> OEP Ltd
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - OEP Ltd'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 62: Aboud -> PETRATECH
UPDATE subscriptions s
SET introducer_id = '3cc51575-6b04-4d46-a1ac-e66630a50e7b'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%PETRATECH%')
  AND s.introducer_id IS NULL;

-- Performance fee: 10.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '3cc51575-6b04-4d46-a1ac-e66630a50e7b',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    NULL,
    'Dashboard migration: VC113 - PETRATECH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%PETRATECH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '3cc51575-6b04-4d46-a1ac-e66630a50e7b'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 63: Enguerrand -> FRALIS SPF
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%FRALIS SPF%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ None
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    NULL,
    'Dashboard migration: VC113 - FRALIS SPF'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 68: Rick -> HAYWARD
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HAYWARD') OR i.legal_name ILIKE '%Mark%')
  AND s.introducer_id IS NULL;

-- Spread commission: $14000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    14000.0,
    'Dashboard migration: VC113 - HAYWARD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HAYWARD') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $3200.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    400,
    3200.0,
    'Dashboard migration: VC113 - HAYWARD'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('HAYWARD') OR i.legal_name ILIKE '%Mark%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 69: Rick -> Zandera (Holdco) Limited
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $87500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    700,
    87500.0,
    'Dashboard migration: VC113 - Zandera (Holdco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $20000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    400,
    20000.0,
    'Dashboard migration: VC113 - Zandera (Holdco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 72: Robin -> MEYER
UPDATE subscriptions s
SET introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MEYER') OR i.legal_name ILIKE '%Andrew%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - MEYER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MEYER') OR i.legal_name ILIKE '%Andrew%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $4000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4000.0,
    'Dashboard migration: VC113 - MEYER'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('MEYER') OR i.legal_name ILIKE '%Andrew%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 73: Robin -> SHAH
UPDATE subscriptions s
SET introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('SHAH') OR i.legal_name ILIKE '%Abhie%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC113 - SHAH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('SHAH') OR i.legal_name ILIKE '%Abhie%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC113 - SHAH'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = UPPER('SHAH') OR i.legal_name ILIKE '%Abhie%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 75: Rick -> Zandera (Holdco) Limited
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $117072.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'spread',
    800,
    117072.0,
    'Dashboard migration: VC113 - Zandera (Holdco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $24000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    400,
    24000.0,
    'Dashboard migration: VC113 - Zandera (Holdco) Limited'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (i.legal_name ILIKE '%Zandera (Holdco) Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- === VC118 (8 records) ===

-- Row 3: TERRA -> VC18
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    5000.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 4
-- Row 5: TERRA -> VC18
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 6
-- Row 3: Dan -> VC18
UPDATE subscriptions s
SET introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.introducer_id IS NULL;

-- Spread commission: $17307.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'spread',
    225,
    17307.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 7.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    750,
    '0x',
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $2500.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    2500.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 4
-- Row 5: Dan -> VC18
UPDATE subscriptions s
SET introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $6921.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'spread',
    225,
    6921.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 7.5% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    750,
    '0x',
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    1000.0,
    'Dashboard migration: VC118 - VC18'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 6
-- === VC125 (7 records) ===

-- Row 19: TERRA -> VC25
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $499.8732
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    499.8732,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 20: TERRA -> VC25
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 2.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    200,
    '0x',
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $99.2656
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    99.2656,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 21: TERRA -> VC25
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%MA GROUP AG%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $358.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    358.0,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 8
-- Row 19: Dan -> VC25
UPDATE subscriptions s
SET introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $499.8732
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    499.8732,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 20: Dan -> VC25
UPDATE subscriptions s
SET introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $99.2656
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    99.2656,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 21: Dan -> VC25
UPDATE subscriptions s
SET introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%MA GROUP AG%')
  AND s.introducer_id IS NULL;

-- Performance fee: 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    500,
    '0x',
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $358.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    358.0,
    'Dashboard migration: VC125 - VC25'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (i.legal_name ILIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- === VC126 (31 records) ===

-- Row 2: John -> VC26
UPDATE subscriptions s
SET introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $27.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2',
    s.investor_id,
    s.deal_id,
    'spread',
    NULL,
    27.5,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $6000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    100,
    6000.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 4
-- SKIP: No investor identifier for row 5
-- SKIP: No investor identifier for row 7
-- Row 13: Simone -> VC26
UPDATE subscriptions s
SET introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%SC TBC INVEST 3%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64',
    s.investor_id,
    s.deal_id,
    'spread',
    NULL,
    2.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%SC TBC INVEST 3%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 14: Simone -> VC26
UPDATE subscriptions s
SET introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64',
    s.investor_id,
    s.deal_id,
    'spread',
    NULL,
    2.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 15
-- SKIP: No investor identifier for row 16
-- SKIP: No investor identifier for row 17
-- Row 18: Simone -> VC26
UPDATE subscriptions s
SET introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%DRussell Goman RD LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64',
    s.investor_id,
    s.deal_id,
    'spread',
    NULL,
    2.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%DRussell Goman RD LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 19: Simone -> Brandon
UPDATE subscriptions s
SET introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = UPPER('Brandon'))
  AND s.introducer_id IS NULL;

-- Spread commission: $2.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64',
    s.investor_id,
    s.deal_id,
    'spread',
    NULL,
    2.0,
    'Dashboard migration: VC126 - Brandon'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = UPPER('Brandon'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 20
-- SKIP: No investor identifier for row 21
-- SKIP: No investor identifier for row 22
-- Row 25: Alpha Gaia -> VC26
UPDATE subscriptions s
SET introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%')
  AND s.introducer_id IS NULL;

-- Performance fee: 1.0% @ 0.1
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    100,
    '0.1',
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 26
-- Row 27: Alpha Gaia -> Abou
UPDATE subscriptions s
SET introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = UPPER('Abou'))
  AND s.introducer_id IS NULL;

-- Performance fee: 1.0% @ 0.1
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    100,
    '0.1',
    'Dashboard migration: VC126 - Abou'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = UPPER('Abou'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Subscription fee: $3000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    300,
    3000.0,
    'Dashboard migration: VC126 - Abou'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = UPPER('Abou'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 29
-- Row 32: Pierre Paumier -> VC26
UPDATE subscriptions s
SET introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%LF GROUP SARL%')
  AND s.introducer_id IS NULL;

-- Subscription fee: $4000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    4000.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%LF GROUP SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 2: Anand+Dan -> VC26
UPDATE subscriptions s
SET introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $21090.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'ade750b8-011a-4fd2-a32c-30ba609b5643',
    s.investor_id,
    s.deal_id,
    'spread',
    2375,
    21090.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 3.5000000000000004% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'ade750b8-011a-4fd2-a32c-30ba609b5643',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    350,
    '0x',
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 3: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%AS Advisory DWC-LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $760.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    1000,
    760.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%AS Advisory DWC-LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 4
-- SKIP: No investor identifier for row 5
-- SKIP: No investor identifier for row 6
-- SKIP: No investor identifier for row 7
-- SKIP: No investor identifier for row 8
-- Row 11: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $770.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    1000,
    770.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%OEP Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 13: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%SC TBC INVEST 3%')
  AND s.introducer_id IS NULL;

-- Spread commission: $200343.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    3300,
    200343.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%SC TBC INVEST 3%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 14: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.introducer_id IS NULL;

-- Spread commission: $46586.4
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    944,
    46586.4,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 30: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%GESTIO CAPITAL LTD%')
  AND s.introducer_id IS NULL;

-- Spread commission: $25199.99856
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    583,
    25199.99856,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%GESTIO CAPITAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 34: Anand -> VC26
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.introducer_id IS NULL;

-- Spread commission: $8520.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    300,
    8520.0,
    'Dashboard migration: VC126 - VC26'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (i.legal_name ILIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- === VC133 (21 records) ===

-- SKIP: No investor identifier for row 2
-- Row 3: Elevation -> VC33
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    2500,
    5000.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 4: Elevation -> VC33
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $1650.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    2500,
    1650.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 5: Elevation -> Singh
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Singh'))
  AND s.introducer_id IS NULL;

-- Spread commission: $825.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    2500,
    825.0,
    'Dashboard migration: VC133 - Singh'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Singh'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 6: Elevation -> VC33
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%777 WALNUT LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $825.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    2500,
    825.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 7: Elevation -> Richard
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Richard'))
  AND s.introducer_id IS NULL;

-- Spread commission: $1750.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    5000,
    1750.0,
    'Dashboard migration: VC133 - Richard'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Richard'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 8
-- Row 9: Elevation+Rick -> VC33
UPDATE subscriptions s
SET introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $112875.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72',
    s.investor_id,
    s.deal_id,
    'spread',
    17500,
    112875.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $50000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    500,
    50000.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 10: Elevation -> VC33
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%Band Capital Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $8950.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01',
    s.investor_id,
    s.deal_id,
    'spread',
    2500,
    8950.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%Band Capital Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 11
-- SKIP: No investor identifier for row 12
-- SKIP: No investor identifier for row 13
-- SKIP: No investor identifier for row 2
-- Row 3: Anand -> VC33
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.introducer_id IS NULL;

-- Spread commission: $7000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    3500,
    7000.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Row 4: Anand -> VC33
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $5610.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    8500,
    5610.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $2000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    2000.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 5: Anand -> Singh
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Singh'))
  AND s.introducer_id IS NULL;

-- Spread commission: $2805.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    8500,
    2805.0,
    'Dashboard migration: VC133 - Singh'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Singh'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC133 - Singh'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = UPPER('Singh'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 6: Anand -> VC33
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%777 WALNUT LLC%')
  AND s.introducer_id IS NULL;

-- Spread commission: $2805.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    8500,
    2805.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Subscription fee: $1000.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'invested_amount',
    200,
    1000.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Row 9: Anand -> VC33
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.introducer_id IS NULL;

-- Spread commission: $24187.5
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    3750,
    24187.5,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Performance fee: 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'performance_fee',
    1000,
    '0x',
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 10: Anand -> VC33
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%Band Capital Limited%')
  AND s.introducer_id IS NULL;

-- Spread commission: $12530.0
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a',
    s.investor_id,
    s.deal_id,
    'spread',
    3500,
    12530.0,
    'Dashboard migration: VC133 - VC33'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (i.legal_name ILIKE '%Band Capital Limited%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM introducer_commissions ic
    WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
      AND ic.investor_id = s.investor_id
      AND ic.deal_id = s.deal_id
      AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- SKIP: No investor identifier for row 11
-- SKIP: No investor identifier for row 12
COMMIT;