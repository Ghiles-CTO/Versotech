-- VERSO Complete Introducer Commission Migration v2
-- Fixes: Improved investor matching for all 280 records
-- Total records in source: 280
-- 

-- ============================================
-- VC102: 1 records
-- ============================================

-- Row 6: Pierre Paumier -> LF GROUP SARL | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC102 row 6 - Pierre Paumier'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC102'
  AND (UPPER(i.legal_name) LIKE '%LF GROUP SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- ============================================
-- VC106: 146 records
-- ============================================

-- Row 3: Manna Capital -> ROLLINS | Spread $15000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 15000.00,
    'Dashboard migration v2: VC106 row 3 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.legal_name) LIKE '%BLAINE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 15000.00
  )
LIMIT 1;

-- Row 4: Manna Capital -> ROLLINS | Spread $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration v2: VC106 row 4 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.legal_name) LIKE '%BLAINE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 5: Manna Capital -> CHANG | Spread $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 10000.00,
    'Dashboard migration v2: VC106 row 5 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CHANG' OR UPPER(i.legal_name) LIKE '%LAURENCE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 6: Manna Capital -> CHANG | Spread $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration v2: VC106 row 6 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CHANG' OR UPPER(i.legal_name) LIKE '%LAURENCE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 7: VERSO BI -> NGAN | Spread $5040.00 @ 90bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 5040.00,
    'Dashboard migration v2: VC106 row 7 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'NGAN' OR UPPER(i.legal_name) LIKE '%CHANG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5040.00
  )
LIMIT 1;

-- Row 8: VERSO BI -> MADHVANI | Spread $40000.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 400, 40000.00,
    'Dashboard migration v2: VC106 row 8 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 40000.00
  )
LIMIT 1;

-- Row 9: VERSO BI -> KOHI | Spread $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 10000.00,
    'Dashboard migration v2: VC106 row 9 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KOHI' OR UPPER(i.legal_name) LIKE '%SAMIR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 11: VERSO BI -> CHIH-HENG | Spread $4999.50 @ 90bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 4999.50,
    'Dashboard migration v2: VC106 row 11 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CHIH-HENG')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 4999.50
  )
LIMIT 1;

-- Row 12: Manna Capital -> AGARWALA | Spread $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'a2a0b0a1-817a-4039-bcbf-160b84f51567', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration v2: VC106 row 12 - Manna Capital'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'AGARWALA' OR UPPER(i.legal_name) LIKE '%RAJIV%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 13: VERSO BI -> CHANDRA | Sub Fee $23542.20 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 0, 23542.20,
    'Dashboard migration v2: VC106 row 13 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CHANDRA' OR UPPER(i.legal_name) LIKE '%DAPHNE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 23542.20
  )
LIMIT 1;

-- Row 14: VERSO BI -> YONGJIE | Spread $8250.30 @ 90bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 8250.30,
    'Dashboard migration v2: VC106 row 14 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'YONGJIE' OR UPPER(i.legal_name) LIKE '%DARYL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 8250.30
  )
LIMIT 1;

-- Row 15: VERSO BI -> SAE-JEE | Spread $1249.20 @ 90bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 1249.20,
    'Dashboard migration v2: VC106 row 15 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAE-JEE' OR UPPER(i.legal_name) LIKE '%EKKAWAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1249.20
  )
LIMIT 1;

-- Row 16: VERSO BI -> GEOK | Spread $4003.20 @ 90bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 90, 4003.20,
    'Dashboard migration v2: VC106 row 16 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GEOK')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 4003.20
  )
LIMIT 1;

-- Row 17: VERSO BI -> Unknown | Spread $3768.00 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 3768.00,
    'Dashboard migration v2: VC106 row 17 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 3768.00
  )
LIMIT 1;

-- Row 18: VERSO BI -> MARTINI | Spread $7537.50 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 7537.50,
    'Dashboard migration v2: VC106 row 18 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MARTINI' OR UPPER(i.legal_name) LIKE '%MATTEO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 7537.50
  )
LIMIT 1;

-- Row 19: VERSO BI -> SAHLI | Spread $35712.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 300, 35712.00,
    'Dashboard migration v2: VC106 row 19 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAHLI' OR UPPER(i.legal_name) LIKE '%AMMAR%' OR UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 35712.00
  )
LIMIT 1;

-- Row 20: VERSO BI -> Unknown | Spread $35715.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 300, 35715.00,
    'Dashboard migration v2: VC106 row 20 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%OEP LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 35715.00
  )
LIMIT 1;

-- Row 22: VERSO BI -> Unknown | Spread $20999.03 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 20999.03,
    'Dashboard migration v2: VC106 row 22 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%KRANA INVESTMENTS PTE. LTD.%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 20999.03
  )
LIMIT 1;

-- Row 23: VERSO BI -> AKERMANN | Spread $15000.00 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 15000.00,
    'Dashboard migration v2: VC106 row 23 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%JOHANN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 15000.00
  )
LIMIT 1;

-- Row 24: VERSO BI -> CABIAN | Spread $3768.00 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 150, 3768.00,
    'Dashboard migration v2: VC106 row 24 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CABIAN' OR UPPER(i.legal_name) LIKE '%SANDRA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 3768.00
  )
LIMIT 1;

-- Row 25: VERSO BI -> SCIMONE | Spread $5980.00 @ 250bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 250, 5980.00,
    'Dashboard migration v2: VC106 row 25 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.legal_name) LIKE '%DARIO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5980.00
  )
LIMIT 1;

-- Row 25: VERSO BI -> SCIMONE | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 25 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.legal_name) LIKE '%DARIO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 25: VERSO BI -> SCIMONE | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 25 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.legal_name) LIKE '%DARIO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 26: VERSO BI -> Unknown | Spread $13941.60 @ 157bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 157, 13941.60,
    'Dashboard migration v2: VC106 row 26 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%OFBR TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13941.60
  )
LIMIT 1;

-- Row 27: VERSO BI -> Unknown | Spread $13999.36 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 13999.36,
    'Dashboard migration v2: VC106 row 27 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ELIDON ESTATE INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13999.36
  )
LIMIT 1;

-- Row 28: VERSO BI -> Unknown | Spread $1749.15 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 1749.15,
    'Dashboard migration v2: VC106 row 28 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ADAM SMITH SINGAPORE PTE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1749.15
  )
LIMIT 1;

-- Row 33: TERRA Financial -> KNOPF | Spread $3330.00 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'spread', 150, 3330.00,
    'Dashboard migration v2: VC106 row 33 - TERRA Financial'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%MRS AND MR BEATRICE & MARCEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 3330.00
  )
LIMIT 1;

-- Row 34: TERRA Financial -> Unknown | Spread $16651.50 @ 150bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'spread', 150, 16651.50,
    'Dashboard migration v2: VC106 row 34 - TERRA Financial'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 16651.50
  )
LIMIT 1;

-- Row 35: Anand Sethia -> Unknown | Spread $18687.50 @ 287bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'spread', 287, 18687.50,
    'Dashboard migration v2: VC106 row 35 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BAHAMA GLOBAL TOWERS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 18687.50
  )
LIMIT 1;

-- Row 36: VERSO BI -> Unknown | Spread $6806.52 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 6806.52,
    'Dashboard migration v2: VC106 row 36 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%CAUSE FIRST HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 6806.52
  )
LIMIT 1;

-- Row 39: VERSO BI -> KARKUN | Spread $9088.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 400, 9088.00,
    'Dashboard migration v2: VC106 row 39 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%MRS AND MR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 9088.00
  )
LIMIT 1;

-- Row 40: VERSO BI -> BROWN | Spread $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 5000.00,
    'Dashboard migration v2: VC106 row 40 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BROWN' OR UPPER(i.legal_name) LIKE '%CRAIG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 41: VERSO BI -> Unknown | Spread $57104.25 @ 175bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 175, 57104.25,
    'Dashboard migration v2: VC106 row 41 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%TRUE INVESTMENTS 4 LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 57104.25
  )
LIMIT 1;

-- Row 42: VERSO BI -> Unknown | Spread $6806.52 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 6806.52,
    'Dashboard migration v2: VC106 row 42 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 6806.52
  )
LIMIT 1;

-- Row 43: VERSO BI -> SUBRAMANIAN | Spread $10321.69 @ 153bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 10321.69,
    'Dashboard migration v2: VC106 row 43 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MRS & MR SUBBIAH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10321.69
  )
LIMIT 1;

-- Row 44: Anand Sethia -> Unknown | Spread $994968.00 @ 468bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'spread', 468, 994968.00,
    'Dashboard migration v2: VC106 row 44 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%JIMENEZ TRADING INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 994968.00
  )
LIMIT 1;

-- Row 55: VERSO BI -> RIKHYE | Spread $8716.60 @ 204bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 8716.60,
    'Dashboard migration v2: VC106 row 55 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RIKHYE' OR UPPER(i.legal_name) LIKE '%AARON%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 8716.60
  )
LIMIT 1;

-- Row 56: VERSO BI -> HARIA | Spread $2177.10 @ 204bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 2177.10,
    'Dashboard migration v2: VC106 row 56 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HARIA' OR UPPER(i.legal_name) LIKE '%LAKIN%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2177.10
  )
LIMIT 1;

-- Row 57: VERSO BI -> HARIA | Spread $2177.10 @ 204bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 2177.10,
    'Dashboard migration v2: VC106 row 57 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HARIA' OR UPPER(i.legal_name) LIKE '%SHEETAL%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2177.10
  )
LIMIT 1;

-- Row 58: VERSO BI -> SHAH | Spread $2177.10 @ 204bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 204, 2177.10,
    'Dashboard migration v2: VC106 row 58 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%TAPAN%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2177.10
  )
LIMIT 1;

-- Row 59: VERSO BI -> Unknown | Spread $65901.35 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 65901.35,
    'Dashboard migration v2: VC106 row 59 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ONC LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 65901.35
  )
LIMIT 1;

-- Row 59: VERSO BI -> Unknown | Sub Fee $99999.98 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 99999.98,
    'Dashboard migration v2: VC106 row 59 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ONC LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 99999.98
  )
LIMIT 1;

-- Row 59: VERSO BI -> Unknown | Perf Fee 1.2% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 125, 0.0, 0,
    'Dashboard migration v2: VC106 row 59 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%ONC LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 60: VERSO BI -> AL ABBASI | Spread $31750.00 @ 250bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 250, 31750.00,
    'Dashboard migration v2: VC106 row 60 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'AL ABBASI' OR UPPER(i.legal_name) LIKE '%MOHAMMED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 31750.00
  )
LIMIT 1;

-- Row 61: VERSO BI -> CORR | Spread $13179.96 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 13179.96,
    'Dashboard migration v2: VC106 row 61 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CORR' OR UPPER(i.legal_name) LIKE '%PATRICK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13179.96
  )
LIMIT 1;

-- Row 61: VERSO BI -> CORR | Sub Fee $5000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 5000.00,
    'Dashboard migration v2: VC106 row 61 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CORR' OR UPPER(i.legal_name) LIKE '%PATRICK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 61: VERSO BI -> CORR | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 61 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CORR' OR UPPER(i.legal_name) LIKE '%PATRICK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 62: VERSO BI -> JORDAN | Spread $4217.24 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 4217.24,
    'Dashboard migration v2: VC106 row 62 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JORDAN' OR UPPER(i.legal_name) LIKE '%STEPHEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 4217.24
  )
LIMIT 1;

-- Row 62: VERSO BI -> JORDAN | Sub Fee $3200.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 3200.00,
    'Dashboard migration v2: VC106 row 62 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JORDAN' OR UPPER(i.legal_name) LIKE '%STEPHEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 3200.00
  )
LIMIT 1;

-- Row 62: VERSO BI -> JORDAN | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 62 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JORDAN' OR UPPER(i.legal_name) LIKE '%STEPHEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 63: VERSO BI -> Unknown | Spread $9489.72 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 9489.72,
    'Dashboard migration v2: VC106 row 63 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 9489.72
  )
LIMIT 1;

-- Row 63: VERSO BI -> Unknown | Sub Fee $7200.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 7200.00,
    'Dashboard migration v2: VC106 row 63 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 7200.00
  )
LIMIT 1;

-- Row 63: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 63 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 64: VERSO BI -> WRIGHT | Spread $1317.50 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration v2: VC106 row 64 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.legal_name) LIKE '%OLIVER%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.50
  )
LIMIT 1;

-- Row 64: VERSO BI -> WRIGHT | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 64 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.legal_name) LIKE '%OLIVER%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 64: VERSO BI -> WRIGHT | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 64 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.legal_name) LIKE '%OLIVER%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 65: VERSO BI -> VAN DEN BOL | Spread $2635.62 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration v2: VC106 row 65 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.legal_name) LIKE '%EMILE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2635.62
  )
LIMIT 1;

-- Row 65: VERSO BI -> VAN DEN BOL | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 65 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.legal_name) LIKE '%EMILE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 65: VERSO BI -> VAN DEN BOL | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 65 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.legal_name) LIKE '%EMILE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 66: VERSO BI -> MATTHEWS | Spread $2635.62 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration v2: VC106 row 66 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2635.62
  )
LIMIT 1;

-- Row 66: VERSO BI -> MATTHEWS | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 66 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 66: VERSO BI -> MATTHEWS | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 66 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 67: VERSO BI -> HAYCOX | Spread $1976.56 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1976.56,
    'Dashboard migration v2: VC106 row 67 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.legal_name) LIKE '%MATTHEW%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1976.56
  )
LIMIT 1;

-- Row 67: VERSO BI -> HAYCOX | Sub Fee $1500.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1500.00,
    'Dashboard migration v2: VC106 row 67 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.legal_name) LIKE '%MATTHEW%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1500.00
  )
LIMIT 1;

-- Row 67: VERSO BI -> HAYCOX | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 67 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.legal_name) LIKE '%MATTHEW%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 68: VERSO BI -> ACKERLEY | Spread $1317.50 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration v2: VC106 row 68 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.legal_name) LIKE '%JOHN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.50
  )
LIMIT 1;

-- Row 68: VERSO BI -> ACKERLEY | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 68 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.legal_name) LIKE '%JOHN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 68: VERSO BI -> ACKERLEY | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 68 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.legal_name) LIKE '%JOHN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 69: VERSO BI -> MANNING | Spread $1317.50 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration v2: VC106 row 69 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MANNING' OR UPPER(i.legal_name) LIKE '%STEVE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.50
  )
LIMIT 1;

-- Row 69: VERSO BI -> MANNING | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 69 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MANNING' OR UPPER(i.legal_name) LIKE '%STEVE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 69: VERSO BI -> MANNING | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 69 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MANNING' OR UPPER(i.legal_name) LIKE '%STEVE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 70: VERSO BI -> Unknown | Spread $37293.00 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 37293.00,
    'Dashboard migration v2: VC106 row 70 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 37293.00
  )
LIMIT 1;

-- Row 70: VERSO BI -> Unknown | Sub Fee $28294.56 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 28294.56,
    'Dashboard migration v2: VC106 row 70 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 28294.56
  )
LIMIT 1;

-- Row 70: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 70 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 71: VERSO BI -> BROOKS | Spread $1317.50 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration v2: VC106 row 71 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BROOKS' OR UPPER(i.legal_name) LIKE '%GREGORY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.50
  )
LIMIT 1;

-- Row 71: VERSO BI -> BROOKS | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 71 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BROOKS' OR UPPER(i.legal_name) LIKE '%GREGORY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 71: VERSO BI -> BROOKS | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 71 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BROOKS' OR UPPER(i.legal_name) LIKE '%GREGORY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 73: VERSO BI -> DAHAN | Spread $5271.86 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 5271.86,
    'Dashboard migration v2: VC106 row 73 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%STEPHANE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5271.86
  )
LIMIT 1;

-- Row 73: VERSO BI -> DAHAN | Sub Fee $4000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration v2: VC106 row 73 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%STEPHANE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4000.00
  )
LIMIT 1;

-- Row 73: VERSO BI -> DAHAN | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 73 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%STEPHANE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 74: VERSO BI -> DUTIL | Spread $2635.62 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration v2: VC106 row 74 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DUTIL' OR UPPER(i.legal_name) LIKE '%JEAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2635.62
  )
LIMIT 1;

-- Row 74: VERSO BI -> DUTIL | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 74 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DUTIL' OR UPPER(i.legal_name) LIKE '%JEAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 74: VERSO BI -> DUTIL | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 74 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DUTIL' OR UPPER(i.legal_name) LIKE '%JEAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 77: VERSO BI -> Unknown | Spread $2635.62 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Dashboard migration v2: VC106 row 77 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2635.62
  )
LIMIT 1;

-- Row 77: VERSO BI -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 77 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 77: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 77 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 78: VERSO BI -> SCHUTTE | Spread $1317.50 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 1317.50,
    'Dashboard migration v2: VC106 row 78 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.legal_name) LIKE '%LESLI%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.50
  )
LIMIT 1;

-- Row 78: VERSO BI -> SCHUTTE | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC106 row 78 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.legal_name) LIKE '%LESLI%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 78: VERSO BI -> SCHUTTE | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 78 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.legal_name) LIKE '%LESLI%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 79: VERSO BI -> SEKHON | Spread $29930.56 @ 176bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 176, 29930.56,
    'Dashboard migration v2: VC106 row 79 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%MANRAJ%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 29930.56
  )
LIMIT 1;

-- Row 82: VERSO BI -> GRAF | Spread $1360.32 @ 32bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 32, 1360.32,
    'Dashboard migration v2: VC106 row 82 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%ERICH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1360.32
  )
LIMIT 1;

-- Row 83: VERSO BI -> Unknown | Perf Fee 2.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 250, 0.0, 0,
    'Dashboard migration v2: VC106 row 83 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 84: VERSO BI -> NUSSBERGER | Spread $9106.02 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 9106.02,
    'Dashboard migration v2: VC106 row 84 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'NUSSBERGER' OR UPPER(i.legal_name) LIKE '%SHANA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 9106.02
  )
LIMIT 1;

-- Row 85: VERSO BI -> Unknown | Spread $2550.90 @ 30bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 30, 2550.90,
    'Dashboard migration v2: VC106 row 85 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2550.90
  )
LIMIT 1;

-- Row 86: VERSO BI -> Unknown | Spread $20000.00 @ 80bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 80, 20000.00,
    'Dashboard migration v2: VC106 row 86 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%INNOSIGHT VENTURES PTE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 20000.00
  )
LIMIT 1;

-- Row 87: VERSO BI -> Unknown | Spread $5600.00 @ 80bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 80, 5600.00,
    'Dashboard migration v2: VC106 row 87 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%INNOSIGHT VENTURES PTE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5600.00
  )
LIMIT 1;

-- Row 88: VERSO BI -> Unknown | Spread $1760203.80 @ 276bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 276, 1760203.80,
    'Dashboard migration v2: VC106 row 88 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GORILLA PE INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1760203.80
  )
LIMIT 1;

-- Row 89: VERSO BI -> EVANS | Spread $13179.96 @ 62bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 13179.96,
    'Dashboard migration v2: VC106 row 89 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'EVANS' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13179.96
  )
LIMIT 1;

-- Row 89: VERSO BI -> EVANS | Sub Fee $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration v2: VC106 row 89 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'EVANS' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 89: VERSO BI -> EVANS | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 89 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'EVANS' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 90: VERSO BI -> HOLDEN | Spread $1976.87 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1976.87,
    'Dashboard migration v2: VC106 row 90 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%DAVID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1976.87
  )
LIMIT 1;

-- Row 90: VERSO BI -> HOLDEN | Sub Fee $3000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.00,
    'Dashboard migration v2: VC106 row 90 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%DAVID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 3000.00
  )
LIMIT 1;

-- Row 90: VERSO BI -> HOLDEN | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 90 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%DAVID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 93: VERSO BI -> HAYAT | Spread $25200.00 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 25200.00,
    'Dashboard migration v2: VC106 row 93 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAYAT' OR UPPER(i.legal_name) LIKE '%IMRAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 25200.00
  )
LIMIT 1;

-- Row 93: VERSO BI -> HAYAT | Sub Fee $4904.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4904.00,
    'Dashboard migration v2: VC106 row 93 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAYAT' OR UPPER(i.legal_name) LIKE '%IMRAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4904.00
  )
LIMIT 1;

-- Row 102: VERSO BI -> KOTHARI | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 102 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KOTHARI' OR UPPER(i.legal_name) LIKE '%ASHISH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 102: VERSO BI -> KOTHARI | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 102 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KOTHARI' OR UPPER(i.legal_name) LIKE '%ASHISH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 104: VERSO BI -> MUKHTAR | Sub Fee $2000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration v2: VC106 row 104 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MUKHTAR' OR UPPER(i.legal_name) LIKE '%FAWAD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 104: VERSO BI -> MUKHTAR | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 104 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'MUKHTAR' OR UPPER(i.legal_name) LIKE '%FAWAD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 106: VERSO BI -> Unknown | Spread $2635.93 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 2635.93,
    'Dashboard migration v2: VC106 row 106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2635.93
  )
LIMIT 1;

-- Row 106: VERSO BI -> Unknown | Sub Fee $4000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration v2: VC106 row 106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4000.00
  )
LIMIT 1;

-- Row 106: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 106 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 107: VERSO BI -> PATRASCU | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 107 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 107: VERSO BI -> PATRASCU | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 107 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 107: VERSO BI -> PATRASCU | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 107 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 108: VERSO BI -> JOGANI | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 108 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 108: VERSO BI -> JOGANI | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 108 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 110: VERSO BI -> RUSHTON | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 110 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.legal_name) LIKE '%HAYDEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 110: VERSO BI -> RUSHTON | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 110 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.legal_name) LIKE '%HAYDEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 110: VERSO BI -> RUSHTON | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 110 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.legal_name) LIKE '%HAYDEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 111: VERSO BI -> WILLETTS | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 111 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'WILLETTS' OR UPPER(i.legal_name) LIKE '%MRS NALINI YOGA & MR ARAN JAMES%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 112: VERSO BI -> SOMMERVILLE | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 112 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SOMMERVILLE' OR UPPER(i.legal_name) LIKE '%EMMA GRAHAM-TAYLOR & GREGORY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 112: VERSO BI -> SOMMERVILLE | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 112 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SOMMERVILLE' OR UPPER(i.legal_name) LIKE '%EMMA GRAHAM-TAYLOR & GREGORY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 113: VERSO BI -> LAI | Spread $5356.26 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 5356.26,
    'Dashboard migration v2: VC106 row 113 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LAI' OR UPPER(i.legal_name) LIKE '%RABIN D. AND DOLLY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5356.26
  )
LIMIT 1;

-- Row 113: VERSO BI -> LAI | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 113 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LAI' OR UPPER(i.legal_name) LIKE '%RABIN D. AND DOLLY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 114: VERSO BI -> LUND | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 114 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LUND')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 114: VERSO BI -> LUND | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 114 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LUND')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 114: VERSO BI -> LUND | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 114 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LUND')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 115: VERSO BI -> BELGA | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 115 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BELGA' OR UPPER(i.legal_name) LIKE '%IVAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 115: VERSO BI -> BELGA | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 115 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BELGA' OR UPPER(i.legal_name) LIKE '%IVAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 115: VERSO BI -> BELGA | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 115 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BELGA' OR UPPER(i.legal_name) LIKE '%IVAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 116: VERSO BI -> JOMAA | Sub Fee $6000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 6000.00,
    'Dashboard migration v2: VC106 row 116 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JOMAA' OR UPPER(i.legal_name) LIKE '%AYMAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 6000.00
  )
LIMIT 1;

-- Row 117: VERSO BI -> JAYARAMAN | Sub Fee $8000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.00,
    'Dashboard migration v2: VC106 row 117 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JAYARAMAN' OR UPPER(i.legal_name) LIKE '%KARTHIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 8000.00
  )
LIMIT 1;

-- Row 118: VERSO BI -> HAKIM | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 118 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAKIM' OR UPPER(i.legal_name) LIKE '%IMRAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 118: VERSO BI -> HAKIM | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 118 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAKIM' OR UPPER(i.legal_name) LIKE '%IMRAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 118: VERSO BI -> HAKIM | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 118 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HAKIM' OR UPPER(i.legal_name) LIKE '%IMRAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 119: VERSO BI -> Unknown | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 119 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 119: VERSO BI -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 119 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 119: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 119 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 120: VERSO BI -> KHAWAJA | Sub Fee $2500.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2500.00,
    'Dashboard migration v2: VC106 row 120 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KHAWAJA' OR UPPER(i.legal_name) LIKE '%ADIL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2500.00
  )
LIMIT 1;

-- Row 120: VERSO BI -> KHAWAJA | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 120 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KHAWAJA' OR UPPER(i.legal_name) LIKE '%ADIL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 121: VERSO BI -> JATANIA | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 121 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JATANIA' OR UPPER(i.legal_name) LIKE '%BHARAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 121: VERSO BI -> JATANIA | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 121 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JATANIA' OR UPPER(i.legal_name) LIKE '%BHARAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 121: VERSO BI -> JATANIA | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 121 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JATANIA' OR UPPER(i.legal_name) LIKE '%BHARAT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 122: VERSO BI -> QUNASH | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 122 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'QUNASH' OR UPPER(i.legal_name) LIKE '%LUBNA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 122: VERSO BI -> QUNASH | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 122 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'QUNASH' OR UPPER(i.legal_name) LIKE '%LUBNA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 133: VERSO BI -> GUERIN | Sub Fee $2000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration v2: VC106 row 133 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GUERIN' OR UPPER(i.legal_name) LIKE '%MICHEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 133: VERSO BI -> GUERIN | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 133 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GUERIN' OR UPPER(i.legal_name) LIKE '%MICHEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 134: VERSO BI -> LE SEIGNEUR | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 134 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%ERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 134: VERSO BI -> LE SEIGNEUR | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 134 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%ERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 136: VERSO BI -> Unknown | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 136 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%PHAENA ADVISORY LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 137: VERSO BI -> PATEL | Spread $13392.54 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 13392.54,
    'Dashboard migration v2: VC106 row 137 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%BHIKHU%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13392.54
  )
LIMIT 1;

-- Row 137: VERSO BI -> PATEL | Sub Fee $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 5000.00,
    'Dashboard migration v2: VC106 row 137 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%BHIKHU%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 138: VERSO BI -> PATEL | Spread $40177.62 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 40177.62,
    'Dashboard migration v2: VC106 row 138 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%VIJAYKUMAR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 40177.62
  )
LIMIT 1;

-- Row 138: VERSO BI -> PATEL | Sub Fee $15000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 15000.00,
    'Dashboard migration v2: VC106 row 138 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%VIJAYKUMAR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 15000.00
  )
LIMIT 1;

-- Row 139: VERSO BI -> Unknown | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 139 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 139: VERSO BI -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 139 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 139: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 139 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 140: VERSO BI -> HASSAN | Spread $1317.81 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Dashboard migration v2: VC106 row 140 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HASSAN' OR UPPER(i.legal_name) LIKE '%AATIF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1317.81
  )
LIMIT 1;

-- Row 140: VERSO BI -> HASSAN | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 140 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HASSAN' OR UPPER(i.legal_name) LIKE '%AATIF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 140: VERSO BI -> HASSAN | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 140 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HASSAN' OR UPPER(i.legal_name) LIKE '%AATIF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 142: VERSO BI -> Unknown | Spread $33033.42 @ 162bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 162, 33033.42,
    'Dashboard migration v2: VC106 row 142 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 33033.42
  )
LIMIT 1;

-- Row 142: VERSO BI -> Unknown | Sub Fee $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration v2: VC106 row 142 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 142: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 142 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 143: VERSO BI -> Unknown | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 143 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 143: VERSO BI -> Unknown | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 143 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 144: VERSO BI -> Unknown | Spread $5930.92 @ 31bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 5930.92,
    'Dashboard migration v2: VC106 row 144 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5930.92
  )
LIMIT 1;

-- Row 144: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 144 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 146: VERSO BI -> Unknown | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 146 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%TERSANE INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 149: VERSO BI -> GOKER | Spread $18748.80 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 18748.80,
    'Dashboard migration v2: VC106 row 149 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 18748.80
  )
LIMIT 1;

-- Row 149: VERSO BI -> GOKER | Sub Fee $7000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 7000.00,
    'Dashboard migration v2: VC106 row 149 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 7000.00
  )
LIMIT 1;

-- Row 150: VERSO BI -> ALAMOUTI | Spread $5356.26 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 5356.26,
    'Dashboard migration v2: VC106 row 150 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%CYRUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5356.26
  )
LIMIT 1;

-- Row 150: VERSO BI -> ALAMOUTI | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 150 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%CYRUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 151: VERSO BI -> ALAMOUTI | Spread $5356.26 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 5356.26,
    'Dashboard migration v2: VC106 row 151 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%DARIUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5356.26
  )
LIMIT 1;

-- Row 151: VERSO BI -> ALAMOUTI | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 151 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%DARIUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 152: VERSO BI -> ALAMOUTI | Spread $5356.26 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 5356.26,
    'Dashboard migration v2: VC106 row 152 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%KAVEH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5356.26
  )
LIMIT 1;

-- Row 152: VERSO BI -> ALAMOUTI | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 152 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%KAVEH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 153: VERSO BI -> Unknown | Spread $53571.42 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 53571.42,
    'Dashboard migration v2: VC106 row 153 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 53571.42
  )
LIMIT 1;

-- Row 153: VERSO BI -> Unknown | Sub Fee $20000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.00,
    'Dashboard migration v2: VC106 row 153 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 20000.00
  )
LIMIT 1;

-- Row 154: VERSO BI -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC106 row 154 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%RENSBURG CLIENT NOMINEES LIMITED A/C CLT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 155: VERSO BI -> Unknown | Sub Fee $8000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.00,
    'Dashboard migration v2: VC106 row 155 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%DCMS HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 8000.00
  )
LIMIT 1;

-- Row 156: VERSO BI -> (Anton) | Spread $26785.08 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 26785.08,
    'Dashboard migration v2: VC106 row 156 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%(ANTON)%' OR UPPER(i.legal_name) LIKE '%GELIGA LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 26785.08
  )
LIMIT 1;

-- Row 156: VERSO BI -> (Anton) | Sub Fee $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration v2: VC106 row 156 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%(ANTON)%' OR UPPER(i.legal_name) LIKE '%GELIGA LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 158: VERSO BI -> KRAUSER | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 158 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KRAUSER' OR UPPER(i.legal_name) LIKE '%DAMIEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 159: VERSO BI -> LE SEIGNEUR | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 159 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%ERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 159: VERSO BI -> LE SEIGNEUR | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 159 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%ERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 160: VERSO BI -> FLETCHER | Sub Fee $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration v2: VC106 row 160 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%SCOTT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 168: VERSO BI -> STEIMES | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 168 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'STEIMES' OR UPPER(i.legal_name) LIKE '%HERVE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 168: VERSO BI -> STEIMES | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 168 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'STEIMES' OR UPPER(i.legal_name) LIKE '%HERVE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 169: VERSO BI -> SERRA | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 169 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SERRA' OR UPPER(i.legal_name) LIKE '%JULIEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 169: VERSO BI -> SERRA | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 169 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SERRA' OR UPPER(i.legal_name) LIKE '%JULIEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 170: VERSO BI -> SAMAMA | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 170 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%FREDERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 170: VERSO BI -> SAMAMA | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 170 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%FREDERIC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 172: VERSO BI -> Unknown | Sub Fee $5000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 5000.00,
    'Dashboard migration v2: VC106 row 172 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 172: VERSO BI -> Unknown | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 172 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 173: VERSO BI -> CUDRE-MAUROUX | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 173 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CUDRE-MAUROUX' OR UPPER(i.legal_name) LIKE '%LAURENT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 173: VERSO BI -> CUDRE-MAUROUX | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 173 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CUDRE-MAUROUX' OR UPPER(i.legal_name) LIKE '%LAURENT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 174: VERSO BI -> CYTRON | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 174 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CYTRON' OR UPPER(i.legal_name) LIKE '%GEORGES%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 174: VERSO BI -> CYTRON | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 174 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'CYTRON' OR UPPER(i.legal_name) LIKE '%GEORGES%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 175: VERSO BI -> RIENZO | Sub Fee $2000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration v2: VC106 row 175 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RIENZO' OR UPPER(i.legal_name) LIKE '%ROSARIO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 175: VERSO BI -> RIENZO | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 175 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'RIENZO' OR UPPER(i.legal_name) LIKE '%ROSARIO%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 176: VERSO BI -> GHESQUIERES | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 176 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GHESQUIERES' OR UPPER(i.legal_name) LIKE '%RAPHAEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 176: VERSO BI -> GHESQUIERES | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 176 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GHESQUIERES' OR UPPER(i.legal_name) LIKE '%RAPHAEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 177: VERSO BI -> SAMAMA | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 177 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%GUILLAUME%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 177: VERSO BI -> SAMAMA | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 177 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%GUILLAUME%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 178: VERSO BI -> ROSSIER | Sub Fee $2000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration v2: VC106 row 178 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ROSSIER' OR UPPER(i.legal_name) LIKE '%DAVID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 178: VERSO BI -> ROSSIER | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 178 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'ROSSIER' OR UPPER(i.legal_name) LIKE '%DAVID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 179: VERSO BI -> Unknown | Sub Fee $2000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.00,
    'Dashboard migration v2: VC106 row 179 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%MARSAULT INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 179: VERSO BI -> Unknown | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 179 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%MARSAULT INTERNATIONAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 180: VERSO BI -> DUFAURE | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC106 row 180 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DUFAURE' OR UPPER(i.legal_name) LIKE '%BERNARD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 180: VERSO BI -> DUFAURE | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC106 row 180 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'DUFAURE' OR UPPER(i.legal_name) LIKE '%BERNARD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 181: VERSO BI -> GOKER | Spread $34821.36 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 34821.36,
    'Dashboard migration v2: VC106 row 181 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 34821.36
  )
LIMIT 1;

-- Row 181: VERSO BI -> GOKER | Sub Fee $13000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 13000.00,
    'Dashboard migration v2: VC106 row 181 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 13000.00
  )
LIMIT 1;

-- Row 183: VERSO BI -> SUKHOTIN | Sub Fee $6000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 6000.00,
    'Dashboard migration v2: VC106 row 183 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SUKHOTIN' OR UPPER(i.legal_name) LIKE '%VASILY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 6000.00
  )
LIMIT 1;

-- Row 187: VERSO BI -> JAVID | Spread $2677.50 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 2677.50,
    'Dashboard migration v2: VC106 row 187 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%HOSSIEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2677.50
  )
LIMIT 1;

-- Row 187: VERSO BI -> JAVID | Sub Fee $999.60 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 999.60,
    'Dashboard migration v2: VC106 row 187 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%HOSSIEN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 999.60
  )
LIMIT 1;

-- Row 188: VERSO BI -> BADII | Spread $1071.00 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 1071.00,
    'Dashboard migration v2: VC106 row 188 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BADII' OR UPPER(i.legal_name) LIKE '%KAMYAR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1071.00
  )
LIMIT 1;

-- Row 188: VERSO BI -> BADII | Sub Fee $399.84 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 399.84,
    'Dashboard migration v2: VC106 row 188 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'BADII' OR UPPER(i.legal_name) LIKE '%KAMYAR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 399.84
  )
LIMIT 1;

-- Row 189: VERSO BI -> SOLOUKI | Spread $2677.50 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 2677.50,
    'Dashboard migration v2: VC106 row 189 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SOLOUKI' OR UPPER(i.legal_name) LIKE '%SHAHAM%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2677.50
  )
LIMIT 1;

-- Row 189: VERSO BI -> SOLOUKI | Sub Fee $999.60 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 999.60,
    'Dashboard migration v2: VC106 row 189 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'SOLOUKI' OR UPPER(i.legal_name) LIKE '%SHAHAM%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 999.60
  )
LIMIT 1;

-- Row 190: VERSO BI -> JAVID | Spread $1338.12 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 1338.12,
    'Dashboard migration v2: VC106 row 190 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%KIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1338.12
  )
LIMIT 1;

-- Row 190: VERSO BI -> JAVID | Sub Fee $499.56 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 499.56,
    'Dashboard migration v2: VC106 row 190 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%KIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 499.56
  )
LIMIT 1;

-- Row 191: VERSO BI -> HUSSAIN | Spread $2677.50 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 2677.50,
    'Dashboard migration v2: VC106 row 191 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HUSSAIN' OR UPPER(i.legal_name) LIKE '%SALMAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2677.50
  )
LIMIT 1;

-- Row 191: VERSO BI -> HUSSAIN | Sub Fee $999.60 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 999.60,
    'Dashboard migration v2: VC106 row 191 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'HUSSAIN' OR UPPER(i.legal_name) LIKE '%SALMAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 999.60
  )
LIMIT 1;

-- Row 192: VERSO BI -> TONELLI BANFI | Spread $13392.54 @ 126bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 13392.54,
    'Dashboard migration v2: VC106 row 192 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'TONELLI BANFI' OR UPPER(i.legal_name) LIKE '%JUAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 13392.54
  )
LIMIT 1;

-- Row 192: VERSO BI -> TONELLI BANFI | Sub Fee $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 5000.00,
    'Dashboard migration v2: VC106 row 192 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'TONELLI BANFI' OR UPPER(i.legal_name) LIKE '%JUAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 193: VERSO BI -> Unknown | Spread $132388.65 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 132388.65,
    'Dashboard migration v2: VC106 row 193 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%GREENLEAF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 132388.65
  )
LIMIT 1;

-- Row 194: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 194 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 194: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 194 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 194: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 194 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 12279%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 195: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 195 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 195: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 195 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 195: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 195 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34658%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 196: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 196 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 196: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 196 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 196: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 196 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34924%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 197: VERSO BI -> Unknown | Spread $26785.08 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 26785.08,
    'Dashboard migration v2: VC106 row 197 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 26785.08
  )
LIMIT 1;

-- Row 197: VERSO BI -> Unknown | Sub Fee $1250.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 1250.00,
    'Dashboard migration v2: VC106 row 197 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1250.00
  )
LIMIT 1;

-- Row 197: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 197 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36003%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 198: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 198 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 198: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 198 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 198: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 198 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36749%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 199: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 199 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 199: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 199 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 199: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 199 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36957%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 200: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 200 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 200: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 200 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 200: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 200 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80738%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 201: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 201 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 201: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 201 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 201: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 201 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80772%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 202: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 202 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 202: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 202 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 202: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 202 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80775%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 203: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 203 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 203: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 203 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 203: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 203 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80776%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 204: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 204 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 204: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 204 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 204: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 204 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80840%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 205: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 205 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 205: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 205 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 205: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 205 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80862%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 206: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 206 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 206: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 206 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 206: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 206 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80873%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 207: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 207 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 207: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 207 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 207: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 207 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80890%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 208: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 208 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 208: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 208 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 208: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 208 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80910%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 209: VERSO BI -> Unknown | Spread $10712.52 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 10712.52,
    'Dashboard migration v2: VC106 row 209 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 10712.52
  )
LIMIT 1;

-- Row 209: VERSO BI -> Unknown | Sub Fee $500.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 500.00,
    'Dashboard migration v2: VC106 row 209 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 500.00
  )
LIMIT 1;

-- Row 209: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 209 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 81022%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 210: VERSO BI -> Unknown | Spread $107142.84 @ 252bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 252, 107142.84,
    'Dashboard migration v2: VC106 row 210 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 107142.84
  )
LIMIT 1;

-- Row 210: VERSO BI -> Unknown | Sub Fee $5000.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 50, 5000.00,
    'Dashboard migration v2: VC106 row 210 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 210: VERSO BI -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC106 row 210 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 515%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 212: VERSO BI -> Unknown | Spread $59819.61 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 59819.61,
    'Dashboard migration v2: VC106 row 212 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.legal_name) LIKE '%OLD HILL INVESTMENT GROUP LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 59819.61
  )
LIMIT 1;

-- Row 214: VERSO BI -> FONTES WILLIAMS | Spread $4078.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 100, 4078.00,
    'Dashboard migration v2: VC106 row 214 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'FONTES WILLIAMS' OR UPPER(i.legal_name) LIKE '%LUIZ%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 4078.00
  )
LIMIT 1;

-- ============================================
-- VC111: 25 records
-- ============================================

-- Row 4: Gemera -> ROSEN INVEST HOLDINGS INC | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 4 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 4: Gemera -> ROSEN INVEST HOLDINGS INC | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 4 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 5: Stableton+Terra -> STRUCTURED ISSUANCE Ltd | Sub Fee $7500.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'invested_amount', 300, 7500.00,
    'Dashboard migration v2: VC111 row 5 - Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 7500.00
  )
LIMIT 1;

-- Row 5: Stableton+Terra -> STRUCTURED ISSUANCE Ltd | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC111 row 5 - Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 6: Terra -> DALINGA HOLDING AG | Sub Fee $2300.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2300.00,
    'Dashboard migration v2: VC111 row 6 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2300.00
  )
LIMIT 1;

-- Row 6: Terra -> DALINGA HOLDING AG | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 6 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 7: Terra -> Tartrifuge SA | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 7 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 7: Terra -> Tartrifuge SA | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 7 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 9: No investor identifier
-- SKIP Row 12: No investor identifier
-- SKIP Row 13: No investor identifier
-- Row 14: Terra -> VOLF Trust | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 14 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 14: Terra -> VOLF Trust | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 14 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 15: No investor identifier
-- SKIP Row 16: No investor identifier
-- Row 18: Terra -> Markus | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 18 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'MARKUS')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 18: Terra -> Markus | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 18 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'MARKUS')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 19: No investor identifier
-- Row 20: AUX -> Attilio | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 20 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'ATTILIO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 20: AUX -> Attilio | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 20 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'ATTILIO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 21: AUX -> FINALMA SUISSE SA | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC111 row 21 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 21: AUX -> FINALMA SUISSE SA | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 21 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 22: AUX -> MONFIN LTD | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC111 row 22 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%MONFIN LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 22: AUX -> MONFIN LTD | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 22 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%MONFIN LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 23: Gemera -> Bright Phoenix Holdings LTD | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC111 row 23 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 23: Gemera -> Bright Phoenix Holdings LTD | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 23 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 24: AUX -> Bruno | Sub Fee $2100.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 300, 2100.00,
    'Dashboard migration v2: VC111 row 24 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'BRUNO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2100.00
  )
LIMIT 1;

-- Row 24: AUX -> Bruno | Perf Fee 2.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 250, 0.0, 0,
    'Dashboard migration v2: VC111 row 24 - AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'BRUNO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 29: No investor identifier
-- Row 30: Julien -> BenSkyla AG | Sub Fee $4000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration v2: VC111 row 30 - Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%BENSKYLA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4000.00
  )
LIMIT 1;

-- Row 30: Julien -> BenSkyla AG | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC111 row 30 - Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%BENSKYLA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 31: No investor identifier
-- Row 32: Anand Sethia -> Wymo Finance Limited | Perf Fee 7.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, 0.0, 0,
    'Dashboard migration v2: VC111 row 32 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%WYMO FINANCE LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 33: Anand Sethia -> HASSBRO Investments Limited | Perf Fee 7.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, 0.0, 0,
    'Dashboard migration v2: VC111 row 33 - Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%HASSBRO INVESTMENTS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 34: No investor identifier
-- SKIP Row 35: No investor identifier
-- Row 36: Rick + Andrew -> Zandera (Finco) Limited | Spread $330114.29 @ 285bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'spread', 285, 330114.29,
    'Dashboard migration v2: VC111 row 36 - Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 330114.29
  )
LIMIT 1;

-- Row 36: Rick + Andrew -> Zandera (Finco) Limited | Sub Fee $20000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.00,
    'Dashboard migration v2: VC111 row 36 - Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 20000.00
  )
LIMIT 1;

-- ============================================
-- VC112: 3 records
-- ============================================

-- SKIP Row 16: No investor identifier
-- SKIP Row 17: No investor identifier
-- Row 20: FINSA -> Antonio Alberto | Sub Fee $2000.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'invested_amount', 400, 2000.00,
    'Dashboard migration v2: VC112 row 20 - FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = 'ANTONIO ALBERTO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 20: FINSA -> Antonio Alberto | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC112 row 20 - FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = 'ANTONIO ALBERTO')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- ============================================
-- VC113: 38 records
-- ============================================

-- Row 3: Terra -> WINZ | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 3 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 3: Terra -> WINZ | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 3 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 5: Terra -> AKERMANN | Sub Fee $750.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 100, 750.00,
    'Dashboard migration v2: VC113 row 5 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%MARKUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 750.00
  )
LIMIT 1;

-- Row 5: Terra -> AKERMANN | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 5 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%MARKUS%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 6: Terra -> Unknown | Sub Fee $3000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.00,
    'Dashboard migration v2: VC113 row 6 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%DALINGA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 3000.00
  )
LIMIT 1;

-- Row 6: Terra -> Unknown | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 6 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%DALINGA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 7: Terra -> Unknown | Sub Fee $300.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 300.00,
    'Dashboard migration v2: VC113 row 7 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%DALINGA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 300.00
  )
LIMIT 1;

-- Row 7: Terra -> Unknown | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 7 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%DALINGA AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 8: Terra -> ROMANOV | Sub Fee $8000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.00,
    'Dashboard migration v2: VC113 row 8 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 8000.00
  )
LIMIT 1;

-- Row 8: Terra -> ROMANOV | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 8 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 10: Terra -> GORYAINOV | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 10 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%ANDREY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 10: Terra -> GORYAINOV | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 10 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%ANDREY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 11: Terra -> ZINKEVICH | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 11 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 11: Terra -> ZINKEVICH | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 11 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 12: Rick -> MADHVANI | Spread $17500.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 17500.00,
    'Dashboard migration v2: VC113 row 12 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 17500.00
  )
LIMIT 1;

-- Row 13: Gemera -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 13 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 13: Gemera -> Unknown | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 13 - Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 14: Rick -> Unknown | Spread $175000.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 175000.00,
    'Dashboard migration v2: VC113 row 14 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 175000.00
  )
LIMIT 1;

-- Row 15: Rick -> HAYWARD | Spread $8750.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 8750.00,
    'Dashboard migration v2: VC113 row 15 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 8750.00
  )
LIMIT 1;

-- Row 16: Terra -> KNOPF | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 16 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 16: Terra -> KNOPF | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 16 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 17: Rick -> TOMMEY | Spread $26250.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 26250.00,
    'Dashboard migration v2: VC113 row 17 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.legal_name) LIKE '%SCOTT%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 26250.00
  )
LIMIT 1;

-- Row 19: Terra -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 19 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 19: Terra -> Unknown | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 19 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 20: Terra -> GRAF | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 20 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%ERICH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 20: Terra -> GRAF | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 20 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%ERICH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 21: Rick -> MADHVANI | Spread $17500.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 17500.00,
    'Dashboard migration v2: VC113 row 21 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%SHRAI AND APARNA%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 17500.00
  )
LIMIT 1;

-- Row 22: Terra -> DE | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC113 row 22 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%IVAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 22: Terra -> DE | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 22 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%IVAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 23: Sandro -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 23 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 23: Sandro -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 23 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 24: Sandro -> Unknown | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 24 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 24: Sandro -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 24 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 25: Terra -> ALGAR | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC113 row 25 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%PHILIP%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 25: Terra -> ALGAR | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC113 row 25 - Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%PHILIP%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 26: Enguerrand -> MERIDA | Sub Fee $600.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 600.00,
    'Dashboard migration v2: VC113 row 26 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 600.00
  )
LIMIT 1;

-- Row 26: Enguerrand -> MERIDA | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 26 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 28: Sandro -> MAHESWARI & SUBRAMANIAN | Sub Fee $2100.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2100.00,
    'Dashboard migration v2: VC113 row 28 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2100.00
  )
LIMIT 1;

-- Row 28: Sandro -> MAHESWARI & SUBRAMANIAN | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 28 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 29: Sandro -> HIQUIANA-TANEJA & TANEJA | Sub Fee $2200.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'invested_amount', 200, 2200.00,
    'Dashboard migration v2: VC113 row 29 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2200.00
  )
LIMIT 1;

-- Row 29: Sandro -> HIQUIANA-TANEJA & TANEJA | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 29 - Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 31: Enguerrand -> Unknown | Sub Fee $10000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.00,
    'Dashboard migration v2: VC113 row 31 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 10000.00
  )
LIMIT 1;

-- Row 31: Enguerrand -> Unknown | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 31 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 33: Enguerrand -> Unknown | Sub Fee $14000.00 @ 50bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 50, 14000.00,
    'Dashboard migration v2: VC113 row 33 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 14000.00
  )
LIMIT 1;

-- Row 33: Enguerrand -> Unknown | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 33 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 37: Enguerrand -> ULDRY | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 37 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%THIERRY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 37: Enguerrand -> ULDRY | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 37 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%THIERRY%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 39: Enguerrand -> COMEL | Sub Fee $400.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 400.00,
    'Dashboard migration v2: VC113 row 39 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%JEREMIE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 400.00
  )
LIMIT 1;

-- Row 39: Enguerrand -> COMEL | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 39 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%JEREMIE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 42: Enguerrand -> EL MOGHAZI | Sub Fee $520.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'invested_amount', 200, 520.00,
    'Dashboard migration v2: VC113 row 42 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%HALIM%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 520.00
  )
LIMIT 1;

-- Row 42: Enguerrand -> EL MOGHAZI | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 42 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%HALIM%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 48: Rick -> Unknown | Spread $214281.00 @ 900bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 900, 214281.00,
    'Dashboard migration v2: VC113 row 48 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 214281.00
  )
LIMIT 1;

-- Row 58: Omar -> MOHAMMED | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'ae4d8764-3c68-4d34-beca-9f4fec4c71a9', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 58 - Omar'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MOHAMMED' OR UPPER(i.legal_name) LIKE '%MAJID%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 61: VERSO BI -> Unknown | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 61 - VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%OEP LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 62: Aboud -> Unknown | Perf Fee 10.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '3cc51575-6b04-4d46-a1ac-e66630a50e7b', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0,
    'Dashboard migration v2: VC113 row 62 - Aboud'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%PETRATECH%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '3cc51575-6b04-4d46-a1ac-e66630a50e7b'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 63: Enguerrand -> Unknown | Perf Fee 5.0% @ 0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0,
    'Dashboard migration v2: VC113 row 63 - Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%FRALIS SPF%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 68: Rick -> HAYWARD | Spread $14000.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 14000.00,
    'Dashboard migration v2: VC113 row 68 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 14000.00
  )
LIMIT 1;

-- Row 68: Rick -> HAYWARD | Sub Fee $3200.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 3200.00,
    'Dashboard migration v2: VC113 row 68 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%MARK%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 3200.00
  )
LIMIT 1;

-- Row 69: Rick -> Unknown | Spread $87500.00 @ 700bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 87500.00,
    'Dashboard migration v2: VC113 row 69 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 87500.00
  )
LIMIT 1;

-- Row 69: Rick -> Unknown | Sub Fee $20000.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 20000.00,
    'Dashboard migration v2: VC113 row 69 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 20000.00
  )
LIMIT 1;

-- Row 72: Robin -> MEYER | Sub Fee $4000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration v2: VC113 row 72 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%ANDREW%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4000.00
  )
LIMIT 1;

-- Row 72: Robin -> MEYER | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 72 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%ANDREW%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 73: Robin -> SHAH | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC113 row 73 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%ABHIE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 73: Robin -> SHAH | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC113 row 73 - Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%ABHIE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 75: Rick -> Unknown | Spread $117072.00 @ 800bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 800, 117072.00,
    'Dashboard migration v2: VC113 row 75 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 117072.00
  )
LIMIT 1;

-- Row 75: Rick -> Unknown | Sub Fee $24000.00 @ 400bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 24000.00,
    'Dashboard migration v2: VC113 row 75 - Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 24000.00
  )
LIMIT 1;

-- ============================================
-- VC118: 8 records
-- ============================================

-- Row 3: TERRA -> VOLF TRUST | Sub Fee $5000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 5000.00,
    'Dashboard migration v2: VC118 row 3 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 3: TERRA -> VOLF TRUST | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC118 row 3 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 4: No investor identifier
-- Row 5: TERRA -> SIGNET LOGISTICS Ltd | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC118 row 5 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 5: TERRA -> SIGNET LOGISTICS Ltd | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC118 row 5 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 6: No investor identifier
-- Row 3: Dan -> VOLF TRUST | Spread $17307.00 @ 225bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'spread', 225, 17307.00,
    'Dashboard migration v2: VC118 row 3 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 17307.00
  )
LIMIT 1;

-- Row 3: Dan -> VOLF TRUST | Sub Fee $2500.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 100, 2500.00,
    'Dashboard migration v2: VC118 row 3 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2500.00
  )
LIMIT 1;

-- Row 3: Dan -> VOLF TRUST | Perf Fee 7.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0.0, 0,
    'Dashboard migration v2: VC118 row 3 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%VOLF TRUST%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 4: No investor identifier
-- Row 5: Dan -> SIGNET LOGISTICS Ltd | Spread $6921.00 @ 225bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'spread', 225, 6921.00,
    'Dashboard migration v2: VC118 row 5 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 6921.00
  )
LIMIT 1;

-- Row 5: Dan -> SIGNET LOGISTICS Ltd | Sub Fee $1000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.00,
    'Dashboard migration v2: VC118 row 5 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 5: Dan -> SIGNET LOGISTICS Ltd | Perf Fee 7.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0.0, 0,
    'Dashboard migration v2: VC118 row 5 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 6: No investor identifier
-- ============================================
-- VC125: 7 records
-- ============================================

-- Row 19: TERRA -> DALINGA HOLDING AG | Sub Fee $499.87 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 499.87,
    'Dashboard migration v2: VC125 row 19 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 499.87
  )
LIMIT 1;

-- Row 19: TERRA -> DALINGA HOLDING AG | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC125 row 19 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 20: TERRA -> DALINGA HOLDING AG | Sub Fee $99.27 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 99.27,
    'Dashboard migration v2: VC125 row 20 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 99.27
  )
LIMIT 1;

-- Row 20: TERRA -> DALINGA HOLDING AG | Perf Fee 2.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0.0, 0,
    'Dashboard migration v2: VC125 row 20 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 21: TERRA -> MA GROUP AG | Sub Fee $358.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 358.00,
    'Dashboard migration v2: VC125 row 21 - TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 358.00
  )
LIMIT 1;

-- SKIP Row 8: No investor identifier
-- Row 19: Dan -> DALINGA HOLDING AG | Sub Fee $499.87 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 200, 499.87,
    'Dashboard migration v2: VC125 row 19 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 499.87
  )
LIMIT 1;

-- Row 19: Dan -> DALINGA HOLDING AG | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC125 row 19 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 20: Dan -> DALINGA HOLDING AG | Sub Fee $99.27 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 200, 99.27,
    'Dashboard migration v2: VC125 row 20 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 99.27
  )
LIMIT 1;

-- Row 20: Dan -> DALINGA HOLDING AG | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC125 row 20 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 21: Dan -> MA GROUP AG | Sub Fee $358.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 200, 358.00,
    'Dashboard migration v2: VC125 row 21 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 358.00
  )
LIMIT 1;

-- Row 21: Dan -> MA GROUP AG | Perf Fee 5.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0.0, 0,
    'Dashboard migration v2: VC125 row 21 - Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND (UPPER(i.legal_name) LIKE '%MA GROUP AG%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- ============================================
-- VC126: 31 records
-- ============================================

-- Row 2: John -> CLOUDSAFE HOLDINGS LIMITED | Spread $27.50 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'spread', 0, 27.50,
    'Dashboard migration v2: VC126 row 2 - John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 27.50
  )
LIMIT 1;

-- Row 2: John -> CLOUDSAFE HOLDINGS LIMITED | Sub Fee $6000.00 @ 100bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 100, 6000.00,
    'Dashboard migration v2: VC126 row 2 - John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 6000.00
  )
LIMIT 1;

-- SKIP Row 4: No investor identifier
-- SKIP Row 5: No investor identifier
-- SKIP Row 7: No investor identifier
-- Row 13: Simone -> SC TBC INVEST 3 | Spread $2.00 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.00,
    'Dashboard migration v2: VC126 row 13 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%SC TBC INVEST 3%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2.00
  )
LIMIT 1;

-- Row 14: Simone -> ODIN (ANIM X II LP) | Spread $2.00 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.00,
    'Dashboard migration v2: VC126 row 14 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2.00
  )
LIMIT 1;

-- SKIP Row 15: No investor identifier
-- SKIP Row 16: No investor identifier
-- SKIP Row 17: No investor identifier
-- Row 18: Simone -> DRussell Goman RD LLC | Spread $2.00 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.00,
    'Dashboard migration v2: VC126 row 18 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%DRUSSELL GOMAN RD LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2.00
  )
LIMIT 1;

-- Row 19: Simone -> Brandon | Spread $2.00 @ 0bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.00,
    'Dashboard migration v2: VC126 row 19 - Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'BRANDON')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2.00
  )
LIMIT 1;

-- SKIP Row 20: No investor identifier
-- SKIP Row 21: No investor identifier
-- SKIP Row 22: No investor identifier
-- Row 25: Alpha Gaia -> ALPHA GAIA CAPITAL FZE | Perf Fee 1.0% @ 0.1x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, 0.1, 0,
    'Dashboard migration v2: VC126 row 25 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%ALPHA GAIA CAPITAL FZE%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 26: No investor identifier
-- Row 27: Alpha Gaia -> Abou | Sub Fee $3000.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'invested_amount', 300, 3000.00,
    'Dashboard migration v2: VC126 row 27 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'ABOU')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 3000.00
  )
LIMIT 1;

-- Row 27: Alpha Gaia -> Abou | Perf Fee 1.0% @ 0.1x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, 0.1, 0,
    'Dashboard migration v2: VC126 row 27 - Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'ABOU')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- SKIP Row 29: No investor identifier
-- Row 32: Pierre Paumier -> LF GROUP SARL | Sub Fee $4000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '41974010-e41d-40a6-9cbf-725618e7e00c', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.00,
    'Dashboard migration v2: VC126 row 32 - Pierre Paumier'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%LF GROUP SARL%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 4000.00
  )
LIMIT 1;

-- Row 2: Anand+Dan -> CLOUDSAFE HOLDINGS LIMITED | Spread $21090.00 @ 2375bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'ade750b8-011a-4fd2-a32c-30ba609b5643', s.investor_id, s.deal_id, 'spread', 2375, 21090.00,
    'Dashboard migration v2: VC126 row 2 - Anand+Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 21090.00
  )
LIMIT 1;

-- Row 2: Anand+Dan -> CLOUDSAFE HOLDINGS LIMITED | Perf Fee 3.5% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'ade750b8-011a-4fd2-a32c-30ba609b5643', s.investor_id, s.deal_id, 'performance_fee', 350, 0.0, 0,
    'Dashboard migration v2: VC126 row 2 - Anand+Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 3: Anand -> AS Advisory DWC-LLC | Spread $760.00 @ 1000bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 760.00,
    'Dashboard migration v2: VC126 row 3 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 760.00
  )
LIMIT 1;

-- SKIP Row 4: No investor identifier
-- SKIP Row 5: No investor identifier
-- SKIP Row 6: No investor identifier
-- SKIP Row 7: No investor identifier
-- SKIP Row 8: No investor identifier
-- Row 11: Anand -> OEP Ltd | Spread $770.00 @ 1000bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 770.00,
    'Dashboard migration v2: VC126 row 11 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%OEP LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 770.00
  )
LIMIT 1;

-- Row 13: Anand -> SC TBC INVEST 3 | Spread $200343.00 @ 3300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3300, 200343.00,
    'Dashboard migration v2: VC126 row 13 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%SC TBC INVEST 3%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 200343.00
  )
LIMIT 1;

-- Row 14: Anand -> ODIN (ANIM X II LP) | Spread $46586.40 @ 944bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 944, 46586.40,
    'Dashboard migration v2: VC126 row 14 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 46586.40
  )
LIMIT 1;

-- Row 30: Anand -> GESTIO CAPITAL LTD | Spread $25200.00 @ 583bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 583, 25200.00,
    'Dashboard migration v2: VC126 row 30 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%GESTIO CAPITAL LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 25200.00
  )
LIMIT 1;

-- Row 34: Anand -> ODIN (ANIM X II LP) | Spread $8520.00 @ 300bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 300, 8520.00,
    'Dashboard migration v2: VC126 row 34 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND (UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 8520.00
  )
LIMIT 1;

-- ============================================
-- VC133: 21 records
-- ============================================

-- SKIP Row 2: No investor identifier
-- Row 3: Elevation -> JASSQ HOLDING LIMITED | Spread $5000.00 @ 2500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 5000.00,
    'Dashboard migration v2: VC133 row 3 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5000.00
  )
LIMIT 1;

-- Row 4: Elevation -> CARTA INVESTMENTS LLC | Spread $1650.00 @ 2500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 1650.00,
    'Dashboard migration v2: VC133 row 4 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1650.00
  )
LIMIT 1;

-- Row 5: Elevation -> Singh | Spread $825.00 @ 2500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 825.00,
    'Dashboard migration v2: VC133 row 5 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'SINGH')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 825.00
  )
LIMIT 1;

-- Row 6: Elevation -> 777 WALNUT LLC | Spread $825.00 @ 2500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 825.00,
    'Dashboard migration v2: VC133 row 6 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 825.00
  )
LIMIT 1;

-- Row 7: Elevation -> Richard | Spread $1750.00 @ 5000bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 5000, 1750.00,
    'Dashboard migration v2: VC133 row 7 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'RICHARD')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 1750.00
  )
LIMIT 1;

-- SKIP Row 8: No investor identifier
-- Row 9: Elevation+Rick -> ZANDERA (Holdco) Ltd | Spread $112875.00 @ 17500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72', s.investor_id, s.deal_id, 'spread', 17500, 112875.00,
    'Dashboard migration v2: VC133 row 9 - Elevation+Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 112875.00
  )
LIMIT 1;

-- Row 9: Elevation+Rick -> ZANDERA (Holdco) Ltd | Sub Fee $50000.00 @ 500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e77ff44-332a-4939-83f9-acf96c851f72', s.investor_id, s.deal_id, 'invested_amount', 500, 50000.00,
    'Dashboard migration v2: VC133 row 9 - Elevation+Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 50000.00
  )
LIMIT 1;

-- Row 10: Elevation -> Band Capital Limited | Spread $8950.00 @ 2500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 8950.00,
    'Dashboard migration v2: VC133 row 10 - Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%BAND CAPITAL LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 8950.00
  )
LIMIT 1;

-- SKIP Row 11: No investor identifier
-- SKIP Row 12: No investor identifier
-- SKIP Row 13: No investor identifier
-- SKIP Row 2: No investor identifier
-- Row 3: Anand -> JASSQ HOLDING LIMITED | Spread $7000.00 @ 3500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3500, 7000.00,
    'Dashboard migration v2: VC133 row 3 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 7000.00
  )
LIMIT 1;

-- Row 4: Anand -> CARTA INVESTMENTS LLC | Spread $5610.00 @ 8500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 5610.00,
    'Dashboard migration v2: VC133 row 4 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 5610.00
  )
LIMIT 1;

-- Row 4: Anand -> CARTA INVESTMENTS LLC | Sub Fee $2000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.00,
    'Dashboard migration v2: VC133 row 4 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%CARTA INVESTMENTS LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 2000.00
  )
LIMIT 1;

-- Row 5: Anand -> Singh | Spread $2805.00 @ 8500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 2805.00,
    'Dashboard migration v2: VC133 row 5 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'SINGH')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2805.00
  )
LIMIT 1;

-- Row 5: Anand -> Singh | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC133 row 5 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'SINGH')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 6: Anand -> 777 WALNUT LLC | Spread $2805.00 @ 8500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 2805.00,
    'Dashboard migration v2: VC133 row 6 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 2805.00
  )
LIMIT 1;

-- Row 6: Anand -> 777 WALNUT LLC | Sub Fee $1000.00 @ 200bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.00,
    'Dashboard migration v2: VC133 row 6 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%777 WALNUT LLC%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
        AND ic.accrual_amount = 1000.00
  )
LIMIT 1;

-- Row 9: Anand -> ZANDERA (Holdco) Ltd | Spread $24187.50 @ 3750bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3750, 24187.50,
    'Dashboard migration v2: VC133 row 9 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 24187.50
  )
LIMIT 1;

-- Row 9: Anand -> ZANDERA (Holdco) Ltd | Perf Fee 10.0% @ 0.0x
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, threshold_multiplier, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 1000, 0.0, 0,
    'Dashboard migration v2: VC133 row 9 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Row 10: Anand -> Band Capital Limited | Spread $12530.00 @ 3500bps
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3500, 12530.00,
    'Dashboard migration v2: VC133 row 10 - Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND (UPPER(i.legal_name) LIKE '%BAND CAPITAL LIMITED%')
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
        AND ic.accrual_amount = 12530.00
  )
LIMIT 1;

-- SKIP Row 11: No investor identifier
-- SKIP Row 12: No investor identifier

-- ============================================
-- Migration Summary
-- ============================================
-- Total records processed: 280
-- Spread INSERT statements: 150
-- Invested_amount INSERT statements: 153
-- Performance_fee INSERT statements: 131
-- Total INSERT statements: 434
-- Skipped (no introducer): 0
-- Skipped (no investor match): 41
-- Skipped (no fees): 0