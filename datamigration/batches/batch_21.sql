-- Batch 21: Statements 401 to 420

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

