-- Batch 16: Statements 301 to 320

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

