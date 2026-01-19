-- Batch 18: Statements 341 to 360

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

