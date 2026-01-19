-- Batch 1: Statements 1 to 20

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

