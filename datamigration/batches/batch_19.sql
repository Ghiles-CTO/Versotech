-- Batch 19: Statements 361 to 380

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

