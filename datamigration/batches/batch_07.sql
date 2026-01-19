-- Batch 7: Statements 121 to 140

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

