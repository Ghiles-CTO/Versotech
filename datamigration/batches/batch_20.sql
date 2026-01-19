-- Batch 20: Statements 381 to 400

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

