-- Batch 15: Statements 281 to 300

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

