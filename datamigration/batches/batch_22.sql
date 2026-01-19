-- Batch 22: Statements 421 to 434

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

