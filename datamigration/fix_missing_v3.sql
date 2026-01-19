-- Fix Migration v3: 265 missing commission records
-- Generated to fix records that failed in v2 migration

-- Fix: VC106 | VERSO BI | KRANA INVESTMENTS PTE. LTD. | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 20999.034,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'KRANA INVESTMENTS PTE. LTD.') OR (UPPER(i.legal_name) LIKE '%KRANA INVESTMENTS PTE. LTD.%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | ROSEN INVEST HOLDINGS Inc | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 6806.52,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'ROSEN INVEST HOLDINGS INC') OR (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mrs & Mr Subbiah SUBRAMANIAN | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 153, 10321.689,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUBRAMANIAN') OR (UPPER(i.legal_name) LIKE '%MRS & MR SUBBIAH%SUBRAMANIAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | Anand Sethia | JIMENEZ TRADING INC | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'spread', 468, 994968.0,
    'Fix migration v3: VC106 Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'JIMENEZ TRADING INC') OR (UPPER(i.legal_name) LIKE '%JIMENEZ TRADING INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | FigTree Family Office Ltd | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 9489.72,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'FIGTREE FAMILY OFFICE LTD') OR (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | FigTree Family Office Ltd | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 7200.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'FIGTREE FAMILY OFFICE LTD') OR (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | FigTree Family Office Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'FIGTREE FAMILY OFFICE LTD') OR (UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Oliver WRIGHT | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WRIGHT') OR (UPPER(i.legal_name) LIKE '%OLIVER%WRIGHT%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Oliver WRIGHT | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WRIGHT') OR (UPPER(i.legal_name) LIKE '%OLIVER%WRIGHT%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Emile VAN DEN BOL | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'VAN DEN BOL') OR (UPPER(i.legal_name) LIKE '%EMILE%VAN DEN BOL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Emile VAN DEN BOL | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'VAN DEN BOL') OR (UPPER(i.legal_name) LIKE '%EMILE%VAN DEN BOL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mark MATTHEWS | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEWS') OR (UPPER(i.legal_name) LIKE '%MARK%MATTHEWS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mark MATTHEWS | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEWS') OR (UPPER(i.legal_name) LIKE '%MARK%MATTHEWS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Matthew HAYCOX | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1500.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYCOX') OR (UPPER(i.legal_name) LIKE '%MATTHEW%HAYCOX%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Matthew HAYCOX | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYCOX') OR (UPPER(i.legal_name) LIKE '%MATTHEW%HAYCOX%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | John ACKERLEY | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ACKERLEY') OR (UPPER(i.legal_name) LIKE '%JOHN%ACKERLEY%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | John ACKERLEY | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ACKERLEY') OR (UPPER(i.legal_name) LIKE '%JOHN%ACKERLEY%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Steve MANNING | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MANNING') OR (UPPER(i.legal_name) LIKE '%STEVE%MANNING%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Steve MANNING | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MANNING') OR (UPPER(i.legal_name) LIKE '%STEVE%MANNING%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Global Custody & Clearing Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 37293.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GLOBAL CUSTODY & CLEARING LIMITED') OR (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Global Custody & Clearing Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 28294.56,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GLOBAL CUSTODY & CLEARING LIMITED') OR (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Global Custody & Clearing Limited | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GLOBAL CUSTODY & CLEARING LIMITED') OR (UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Gregory BROOKS | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROOKS') OR (UPPER(i.legal_name) LIKE '%GREGORY%BROOKS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Gregory BROOKS | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROOKS') OR (UPPER(i.legal_name) LIKE '%GREGORY%BROOKS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Stephane DAHAN | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DAHAN') OR (UPPER(i.legal_name) LIKE '%STEPHANE%DAHAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Stephane DAHAN | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DAHAN') OR (UPPER(i.legal_name) LIKE '%STEPHANE%DAHAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Jean DUTIL | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUTIL') OR (UPPER(i.legal_name) LIKE '%JEAN%DUTIL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Jean DUTIL | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUTIL') OR (UPPER(i.legal_name) LIKE '%JEAN%DUTIL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Sudon Carlop Holdings Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 62, 2635.62,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SUDON CARLOP HOLDINGS LIMITED') OR (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Sudon Carlop Holdings Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SUDON CARLOP HOLDINGS LIMITED') OR (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Sudon Carlop Holdings Limited | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SUDON CARLOP HOLDINGS LIMITED') OR (UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Lesli SCHUTTE | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCHUTTE') OR (UPPER(i.legal_name) LIKE '%LESLI%SCHUTTE%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Lesli SCHUTTE | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCHUTTE') OR (UPPER(i.legal_name) LIKE '%LESLI%SCHUTTE%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | TERRA Financial & Management Services SA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'TERRA FINANCIAL & MANAGEMENT SERVICES SA') OR (UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | GORILLA PE Inc | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 276, 1760203.8,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GORILLA PE INC') OR (UPPER(i.legal_name) LIKE '%GORILLA PE INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mark EVANS | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'EVANS') OR (UPPER(i.legal_name) LIKE '%MARK%EVANS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mark EVANS | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'EVANS') OR (UPPER(i.legal_name) LIKE '%MARK%EVANS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | David HOLDEN | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HOLDEN') OR (UPPER(i.legal_name) LIKE '%DAVID%HOLDEN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Imrat HAYAT | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4904.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYAT') OR (UPPER(i.legal_name) LIKE '%IMRAT%HAYAT%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Ashish KOTHARI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOTHARI') OR (UPPER(i.legal_name) LIKE '%ASHISH%KOTHARI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Ashish KOTHARI | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOTHARI') OR (UPPER(i.legal_name) LIKE '%ASHISH%KOTHARI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Fawad MUKHTAR | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MUKHTAR') OR (UPPER(i.legal_name) LIKE '%FAWAD%MUKHTAR%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Fawad MUKHTAR | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MUKHTAR') OR (UPPER(i.legal_name) LIKE '%FAWAD%MUKHTAR%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | SOUTH SOUND LTD | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 2635.93,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SOUTH SOUND LTD') OR (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | SOUTH SOUND LTD | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SOUTH SOUND LTD') OR (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | SOUTH SOUND LTD | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SOUTH SOUND LTD') OR (UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Constantin-Octavian PATRASCU | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATRASCU') OR (UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%PATRASCU%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Constantin-Octavian PATRASCU | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATRASCU') OR (UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%PATRASCU%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mayuriben JOGANI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOGANI') OR (UPPER(i.legal_name) LIKE '%MAYURIBEN%JOGANI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mayuriben JOGANI | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOGANI') OR (UPPER(i.legal_name) LIKE '%MAYURIBEN%JOGANI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Hayden RUSHTON | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RUSHTON') OR (UPPER(i.legal_name) LIKE '%HAYDEN%RUSHTON%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Hayden RUSHTON | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RUSHTON') OR (UPPER(i.legal_name) LIKE '%HAYDEN%RUSHTON%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Mrs Nalini Yoga & Mr Aran James WILLETTS | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WILLETTS') OR (UPPER(i.legal_name) LIKE '%MRS NALINI YOGA & MR ARAN JAMES%WILLETTS%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Emma Graham-Taylor & Gregory SOMMERVILLE | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SOMMERVILLE') OR (UPPER(i.legal_name) LIKE '%EMMA GRAHAM-TAYLOR & GREGORY%SOMMERVILLE%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Rabin D. and Dolly LAI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LAI') OR (UPPER(i.legal_name) LIKE '%RABIN D. AND DOLLY%LAI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kim LUND | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LUND') OR (UPPER(i.legal_name) LIKE '%KIM%LUND%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kim LUND | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LUND') OR (UPPER(i.legal_name) LIKE '%KIM%LUND%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Ivan BELGA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BELGA') OR (UPPER(i.legal_name) LIKE '%IVAN%BELGA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Ivan BELGA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BELGA') OR (UPPER(i.legal_name) LIKE '%IVAN%BELGA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Ayman JOMAA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 6000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOMAA') OR (UPPER(i.legal_name) LIKE '%AYMAN%JOMAA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Karthic JAYARAMAN | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAYARAMAN') OR (UPPER(i.legal_name) LIKE '%KARTHIC%JAYARAMAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Imran HAKIM | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAKIM') OR (UPPER(i.legal_name) LIKE '%IMRAN%HAKIM%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Imran HAKIM | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAKIM') OR (UPPER(i.legal_name) LIKE '%IMRAN%HAKIM%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kenilworth Ltd | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'KENILWORTH LTD') OR (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kenilworth Ltd | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'KENILWORTH LTD') OR (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kenilworth Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'KENILWORTH LTD') OR (UPPER(i.legal_name) LIKE '%KENILWORTH LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Adil KHAWAJA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2500.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KHAWAJA') OR (UPPER(i.legal_name) LIKE '%ADIL%KHAWAJA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Adil KHAWAJA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KHAWAJA') OR (UPPER(i.legal_name) LIKE '%ADIL%KHAWAJA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Bharat JATANIA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JATANIA') OR (UPPER(i.legal_name) LIKE '%BHARAT%JATANIA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Bharat JATANIA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JATANIA') OR (UPPER(i.legal_name) LIKE '%BHARAT%JATANIA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Lubna QUNASH | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'QUNASH') OR (UPPER(i.legal_name) LIKE '%LUBNA%QUNASH%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Lubna QUNASH | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'QUNASH') OR (UPPER(i.legal_name) LIKE '%LUBNA%QUNASH%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Michel GUERIN | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GUERIN') OR (UPPER(i.legal_name) LIKE '%MICHEL%GUERIN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Michel GUERIN | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GUERIN') OR (UPPER(i.legal_name) LIKE '%MICHEL%GUERIN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Eric LE SEIGNEUR | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LE SEIGNEUR') OR (UPPER(i.legal_name) LIKE '%ERIC%LE SEIGNEUR%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Phaena Advisory Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'PHAENA ADVISORY LTD') OR (UPPER(i.legal_name) LIKE '%PHAENA ADVISORY LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Bhikhu PATEL | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 5000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATEL') OR (UPPER(i.legal_name) LIKE '%BHIKHU%PATEL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Vijaykumar PATEL | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 15000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATEL') OR (UPPER(i.legal_name) LIKE '%VIJAYKUMAR%PATEL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | POTASSIUM Capital | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 1317.81,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'POTASSIUM CAPITAL') OR (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | POTASSIUM Capital | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'POTASSIUM CAPITAL') OR (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | POTASSIUM Capital | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'POTASSIUM CAPITAL') OR (UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Aatif HASSAN | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HASSAN') OR (UPPER(i.legal_name) LIKE '%AATIF%HASSAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Aatif HASSAN | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HASSAN') OR (UPPER(i.legal_name) LIKE '%AATIF%HASSAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | GTV Partners SA | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 162, 33033.42,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GTV PARTNERS SA') OR (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | GTV Partners SA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GTV PARTNERS SA') OR (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | GTV Partners SA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GTV PARTNERS SA') OR (UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | LENN Participations SARL | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'LENN PARTICIPATIONS SARL') OR (UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | LENN Participations SARL | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'LENN PARTICIPATIONS SARL') OR (UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | WEALTH TRAIN LIMITED | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 31, 5930.92,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'WEALTH TRAIN LIMITED') OR (UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | WEALTH TRAIN LIMITED | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'WEALTH TRAIN LIMITED') OR (UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | TERSANE INTERNATIONAL LTD | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'TERSANE INTERNATIONAL LTD') OR (UPPER(i.legal_name) LIKE '%TERSANE INTERNATIONAL LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Cyrus ALAMOUTI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI') OR (UPPER(i.legal_name) LIKE '%CYRUS%ALAMOUTI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Darius ALAMOUTI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI') OR (UPPER(i.legal_name) LIKE '%DARIUS%ALAMOUTI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kaveh ALAMOUTI | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI') OR (UPPER(i.legal_name) LIKE '%KAVEH%ALAMOUTI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Caspian Enterprises Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 53571.42,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'CASPIAN ENTERPRISES LIMITED') OR (UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Caspian Enterprises Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'CASPIAN ENTERPRISES LIMITED') OR (UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Rensburg Client Nominees Limited A/c CLT | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'RENSBURG CLIENT NOMINEES LIMITED A/C CLT') OR (UPPER(i.legal_name) LIKE '%RENSBURG CLIENT NOMINEES LIMITED A/C CLT%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | DCMS Holdings Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 8000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'DCMS HOLDINGS LIMITED') OR (UPPER(i.legal_name) LIKE '%DCMS HOLDINGS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | (Anton) | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 126, 26785.08,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = '(ANTON)') OR (UPPER(i.legal_name) LIKE '%(ANTON)%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | (Anton) | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = '(ANTON)') OR (UPPER(i.legal_name) LIKE '%(ANTON)%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Damien KRAUSER | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KRAUSER') OR (UPPER(i.legal_name) LIKE '%DAMIEN%KRAUSER%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Eric LE SEIGNEUR | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LE SEIGNEUR') OR (UPPER(i.legal_name) LIKE '%ERIC%LE SEIGNEUR%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Scott FLETCHER | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FLETCHER') OR (UPPER(i.legal_name) LIKE '%SCOTT%FLETCHER%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Herve STEIMES | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'STEIMES') OR (UPPER(i.legal_name) LIKE '%HERVE%STEIMES%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Herve STEIMES | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'STEIMES') OR (UPPER(i.legal_name) LIKE '%HERVE%STEIMES%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Julien SERRA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SERRA') OR (UPPER(i.legal_name) LIKE '%JULIEN%SERRA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Julien SERRA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SERRA') OR (UPPER(i.legal_name) LIKE '%JULIEN%SERRA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Frederic SAMAMA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAMAMA') OR (UPPER(i.legal_name) LIKE '%FREDERIC%SAMAMA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | SWISS TRUSTEES OF GENEVA SA as Trustees  | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 5000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST') OR (UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | SWISS TRUSTEES OF GENEVA SA as Trustees  | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST') OR (UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Laurent CUDRE-MAUROUX | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CUDRE-MAUROUX') OR (UPPER(i.legal_name) LIKE '%LAURENT%CUDRE-MAUROUX%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Laurent CUDRE-MAUROUX | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CUDRE-MAUROUX') OR (UPPER(i.legal_name) LIKE '%LAURENT%CUDRE-MAUROUX%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Georges CYTRON | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 100, 1000.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYTRON') OR (UPPER(i.legal_name) LIKE '%GEORGES%CYTRON%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Georges CYTRON | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYTRON') OR (UPPER(i.legal_name) LIKE '%GEORGES%CYTRON%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Raphael GHESQUIERES | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GHESQUIERES') OR (UPPER(i.legal_name) LIKE '%RAPHAEL%GHESQUIERES%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Guillaume SAMAMA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAMAMA') OR (UPPER(i.legal_name) LIKE '%GUILLAUME%SAMAMA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | David ROSSIER | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROSSIER') OR (UPPER(i.legal_name) LIKE '%DAVID%ROSSIER%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | MARSAULT INTERNATIONAL LTD | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'MARSAULT INTERNATIONAL LTD') OR (UPPER(i.legal_name) LIKE '%MARSAULT INTERNATIONAL LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Bernard DUFAURE | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUFAURE') OR (UPPER(i.legal_name) LIKE '%BERNARD%DUFAURE%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | Kamyar BADII | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'invested_amount', 200, 399.84,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BADII') OR (UPPER(i.legal_name) LIKE '%KAMYAR%BADII%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC106 | VERSO BI | GREENLEAF | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'spread', 200, 132388.65,
    'Fix migration v3: VC106 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) = 'GREENLEAF') OR (UPPER(i.legal_name) LIKE '%GREENLEAF%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC111 | Gemera | ROSEN INVEST HOLDINGS INC | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'ROSEN INVEST HOLDINGS INC') OR (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Gemera | ROSEN INVEST HOLDINGS INC | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'ROSEN INVEST HOLDINGS INC') OR (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Stableton+Terra | STRUCTURED ISSUANCE Ltd | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'invested_amount', 300, 7500.0,
    'Fix migration v3: VC111 Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'STRUCTURED ISSUANCE LTD') OR (UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Stableton+Terra | STRUCTURED ISSUANCE Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'cca3a4b2-5a53-464a-8387-1ad326a168ed', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC111 Stableton+Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'STRUCTURED ISSUANCE LTD') OR (UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | DALINGA HOLDING AG | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2300.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | DALINGA HOLDING AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | Tartrifuge SA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'TARTRIFUGE SA') OR (UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | Tartrifuge SA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'TARTRIFUGE SA') OR (UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 250, 5000.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 250, 1875.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 250, 2500.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VOLF Trust | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VOLF TRUST') OR (UPPER(i.legal_name) LIKE '%VOLF TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VOLF Trust | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VOLF TRUST') OR (UPPER(i.legal_name) LIKE '%VOLF TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 250, 1250.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'invested_amount', 250, 5000.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | John | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '19b4ce66-494a-41e0-8221-14b230d0c5f2', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 John'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | Markus | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MARKUS'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | Markus | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MARKUS'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | AUX | Attilio | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'ATTILIO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | AUX | Attilio | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'ATTILIO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | AUX | FINALMA SUISSE SA | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'FINALMA SUISSE SA') OR (UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | AUX | FINALMA SUISSE SA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'FINALMA SUISSE SA') OR (UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | AUX | MONFIN LTD | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'MONFIN LTD') OR (UPPER(i.legal_name) LIKE '%MONFIN LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | AUX | MONFIN LTD | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'MONFIN LTD') OR (UPPER(i.legal_name) LIKE '%MONFIN LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Gemera | Bright Phoenix Holdings LTD | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'BRIGHT PHOENIX HOLDINGS LTD') OR (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Gemera | Bright Phoenix Holdings LTD | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'BRIGHT PHOENIX HOLDINGS LTD') OR (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | AUX | Bruno | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'invested_amount', 300, 2100.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BRUNO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | AUX | Bruno | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '0aebf77c-47a3-4011-abd4-74ee3772d78e', s.investor_id, s.deal_id, 'performance_fee', 250, 0, 0.0,
    'Fix migration v3: VC111 AUX'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BRUNO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Julien | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Julien | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Julien | BenSkyla AG | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'invested_amount', 200, 4000.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'BENSKYLA AG') OR (UPPER(i.legal_name) LIKE '%BENSKYLA AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Julien | BenSkyla AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'BENSKYLA AG') OR (UPPER(i.legal_name) LIKE '%BENSKYLA AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Julien | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Julien | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '8964a91a-eb92-4f65-aa47-750c417cd499', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Julien'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Anand Sethia | Wymo Finance Limited | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC111 Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'WYMO FINANCE LIMITED') OR (UPPER(i.legal_name) LIKE '%WYMO FINANCE LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Anand Sethia | HASSBRO Investments Limited | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'e0e79380-89ef-457b-a45c-0c9bef2cbf01', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC111 Anand Sethia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'HASSBRO INVESTMENTS LIMITED') OR (UPPER(i.legal_name) LIKE '%HASSBRO INVESTMENTS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 2000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC111 | Terra | VC11 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC111 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'VC11') OR (UPPER(i.legal_name) LIKE '%VC11%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC111 | Rick + Andrew | Zandera (Finco) Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'spread', 285, 330114.29,
    'Fix migration v3: VC111 Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'ZANDERA (FINCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC111 | Rick + Andrew | Zandera (Finco) Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '4d17ec21-5eeb-4957-9a50-992f731ebd56', s.investor_id, s.deal_id, 'invested_amount', 200, 20000.0,
    'Fix migration v3: VC111 Rick + Andrew'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) = 'ZANDERA (FINCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC112 | TERRA | VC12 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 400, 4000.0,
    'Fix migration v3: VC112 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) = 'VC12') OR (UPPER(i.legal_name) LIKE '%VC12%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC112 | TERRA | VC12 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 400, 20000.0,
    'Fix migration v3: VC112 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) = 'VC12') OR (UPPER(i.legal_name) LIKE '%VC12%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC112 | FINSA | Antonio Alberto | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'invested_amount', 400, 2000.0,
    'Fix migration v3: VC112 FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ANTONIO ALBERTO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC112 | FINSA | Antonio Alberto | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '5a765445-bee7-4716-96f6-e2e2ca0329c7', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC112 FINSA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ANTONIO ALBERTO'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Terra | Dalinga AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC113 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'DALINGA AG') OR (UPPER(i.legal_name) LIKE '%DALINGA AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Terra | Dalinga AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC113 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'DALINGA AG') OR (UPPER(i.legal_name) LIKE '%DALINGA AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Sheila and Kamlesh MADHVANI | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 17500.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI') OR (UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%MADHVANI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Gemera | Rosen Invest Holdings Inc | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '61e01a81-0663-4d4a-9626-fc3a6acb4d63', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC113 Gemera'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ROSEN INVEST HOLDINGS INC') OR (UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Finco) Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 175000.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (FINCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Mark HAYWARD | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 8750.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD') OR (UPPER(i.legal_name) LIKE '%MARK%HAYWARD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Scott TOMMEY | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 26250.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TOMMEY') OR (UPPER(i.legal_name) LIKE '%SCOTT%TOMMEY%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Terra | Signet Logistics Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC113 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'SIGNET LOGISTICS LTD') OR (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Shrai and Aparna MADHVANI | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 17500.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI') OR (UPPER(i.legal_name) LIKE '%SHRAI AND APARNA%MADHVANI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Sandro | Bright Phoenix Holdings Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'BRIGHT PHOENIX HOLDINGS LTD') OR (UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Sandro | TEKAPO Group Limited | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'TEKAPO GROUP LIMITED') OR (UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Terra | Philip ALGAR | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC113 Terra'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ALGAR') OR (UPPER(i.legal_name) LIKE '%PHILIP%ALGAR%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | Sebastian MERIDA | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MERIDA') OR (UPPER(i.legal_name) LIKE '%SEBASTIAN%MERIDA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Sandro | Mrs Nilakantan & Mr Subbiah MAHESWARI &  | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN') OR (UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%MAHESWARI & SUBRAMANIAN%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Sandro | Mrs Rosario Teresa & Mr Deepak HIQUIANA- | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '87571ef2-b05d-4d7d-8095-2992d43b9aa8', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Sandro'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA') OR (UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%HIQUIANA-TANEJA & TANEJA%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | FRALIS SPF | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'FRALIS SPF') OR (UPPER(i.legal_name) LIKE '%FRALIS SPF%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | NEWBRIDGE FINANCE SPF | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'NEWBRIDGE FINANCE SPF') OR (UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | Thierry ULDRY | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ULDRY') OR (UPPER(i.legal_name) LIKE '%THIERRY%ULDRY%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | Jeremie COMEL | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'COMEL') OR (UPPER(i.legal_name) LIKE '%JEREMIE%COMEL%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | Halim EL MOGHAZI | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'EL MOGHAZI') OR (UPPER(i.legal_name) LIKE '%HALIM%EL MOGHAZI%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Finco) Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 900, 214281.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (FINCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Omar | Majid MOHAMMED | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'ae4d8764-3c68-4d34-beca-9f4fec4c71a9', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Omar'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MOHAMMED') OR (UPPER(i.legal_name) LIKE '%MAJID%MOHAMMED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | VERSO BI | OEP Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '98fdce26-5a61-486e-a450-8e13dd4cfbf4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 VERSO BI'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'OEP LTD') OR (UPPER(i.legal_name) LIKE '%OEP LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Aboud | PETRATECH | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '3cc51575-6b04-4d46-a1ac-e66630a50e7b', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC113 Aboud'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'PETRATECH') OR (UPPER(i.legal_name) LIKE '%PETRATECH%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '3cc51575-6b04-4d46-a1ac-e66630a50e7b'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Enguerrand | FRALIS SPF | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Enguerrand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'FRALIS SPF') OR (UPPER(i.legal_name) LIKE '%FRALIS SPF%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Mark HAYWARD | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 14000.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD') OR (UPPER(i.legal_name) LIKE '%MARK%HAYWARD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Holdco) Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 700, 87500.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (HOLDCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Holdco) Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 20000.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (HOLDCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC113 | Robin | Andrew MEYER | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MEYER') OR (UPPER(i.legal_name) LIKE '%ANDREW%MEYER%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Robin | Abhie SHAH | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '6147711e-310e-45ec-8892-ac072e25c3b0', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC113 Robin'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'SHAH') OR (UPPER(i.legal_name) LIKE '%ABHIE%SHAH%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Holdco) Limited | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'spread', 800, 117072.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (HOLDCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC113 | Rick | Zandera (Holdco) Limited | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '55b67690-c83d-4406-a2b4-935032d22739', s.investor_id, s.deal_id, 'invested_amount', 400, 24000.0,
    'Fix migration v3: VC113 Rick'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) = 'ZANDERA (HOLDCO) LIMITED') OR (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | VOLF TRUST | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VOLF TRUST') OR (UPPER(i.legal_name) LIKE '%VOLF TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | VC18 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 10000.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | VC18 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | SIGNET LOGISTICS Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'SIGNET LOGISTICS LTD') OR (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | VC18 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'invested_amount', 200, 3000.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC118 | TERRA | VC18 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC118 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VOLF TRUST | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VOLF TRUST') OR (UPPER(i.legal_name) LIKE '%VOLF TRUST%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'spread', 225, 34614.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 100, 5000.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | Dan | SIGNET LOGISTICS Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'SIGNET LOGISTICS LTD') OR (UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'spread', 225, 10383.75,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'invested_amount', 100, 1500.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC118 | Dan | VC18 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 750, 0, 0.0,
    'Fix migration v3: VC118 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) = 'VC18') OR (UPPER(i.legal_name) LIKE '%VC18%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | TERRA | DALINGA HOLDING AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC125 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | TERRA | DALINGA HOLDING AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC125 TERRA'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | Dan | VC25 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC125 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'VC25') OR (UPPER(i.legal_name) LIKE '%VC25%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | Dan | DALINGA HOLDING AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC125 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | Dan | DALINGA HOLDING AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC125 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'DALINGA HOLDING AG') OR (UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC125 | Dan | MA GROUP AG | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    '81e78a56-bed0-45dd-8c52-45566f5895b6', s.investor_id, s.deal_id, 'performance_fee', 500, 0, 0.0,
    'Fix migration v3: VC125 Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) = 'MA GROUP AG') OR (UPPER(i.legal_name) LIKE '%MA GROUP AG%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '81e78a56-bed0-45dd-8c52-45566f5895b6'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Gio | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bcaaab40-eef5-4a3c-92d7-101f498489ac', s.investor_id, s.deal_id, 'spread', 0, 9.364843352,
    'Fix migration v3: VC126 Gio'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bcaaab40-eef5-4a3c-92d7-101f498489ac'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Gio | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bcaaab40-eef5-4a3c-92d7-101f498489ac', s.investor_id, s.deal_id, 'spread', 0, 9.364843352,
    'Fix migration v3: VC126 Gio'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bcaaab40-eef5-4a3c-92d7-101f498489ac'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Gio | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bcaaab40-eef5-4a3c-92d7-101f498489ac', s.investor_id, s.deal_id, 'spread', 0, 9.364843352,
    'Fix migration v3: VC126 Gio'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bcaaab40-eef5-4a3c-92d7-101f498489ac'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | Brandon | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BRANDON'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Simone | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    '6c63f6f1-d916-4275-8ea8-b951e333bc64', s.investor_id, s.deal_id, 'spread', 0, 2.0,
    'Fix migration v3: VC126 Simone'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Alpha Gaia | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, 0, 0.0,
    'Fix migration v3: VC126 Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Alpha Gaia | Abou | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'invested_amount', 300, 3000.0,
    'Fix migration v3: VC126 Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'ABOU'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC126 | Alpha Gaia | Abou | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, 0, 0.0,
    'Fix migration v3: VC126 Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'ABOU'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Alpha Gaia | VC26 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'invested_amount', 300, 3000.0,
    'Fix migration v3: VC126 Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC126 | Alpha Gaia | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'bc23b7c7-4253-40c2-889b-97a5044c23d5', s.investor_id, s.deal_id, 'performance_fee', 100, 0, 0.0,
    'Fix migration v3: VC126 Alpha Gaia'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand+Dan | CLOUDSAFE HOLDINGS LIMITED | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'ade750b8-011a-4fd2-a32c-30ba609b5643', s.investor_id, s.deal_id, 'performance_fee', 350, 0, 0.0,
    'Fix migration v3: VC126 Anand+Dan'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'CLOUDSAFE HOLDINGS LIMITED') OR (UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'ade750b8-011a-4fd2-a32c-30ba609b5643'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3535, 146768.8912,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1936, 7804.03052,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 4030.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 150, 0, 0.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3936, 63456.12748,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 200, 0, 0.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC126 | Anand | VC26 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 890.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'VC26') OR (UPPER(i.legal_name) LIKE '%VC26%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC126 | Anand | OEP Ltd | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 1000, 770.0,
    'Fix migration v3: VC126 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) = 'OEP LTD') OR (UPPER(i.legal_name) LIKE '%OEP LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 1650.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | Singh | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 825.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'SINGH'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | Richard | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 5000, 1750.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'RICHARD'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 5000, 1750.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 825.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 2500, 9225.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Elevation | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'faace30d-09ed-4974-a609-38dba914ce01', s.investor_id, s.deal_id, 'spread', 5000, 1300.0,
    'Fix migration v3: VC133 Elevation'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Anand | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 5610.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Anand | Singh | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 2805.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'SINGH'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Anand | Singh | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'SINGH'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC133 | Anand | ZANDERA (Holdco) Ltd | perf_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'performance_fee', 1000, 0, 0.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'ZANDERA (HOLDCO) LTD') OR (UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'performance_fee'
  )
LIMIT 1;

-- Fix: VC133 | Anand | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 8500, 2805.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

-- Fix: VC133 | Anand | VC33 | sub_fee
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'invested_amount', 200, 1000.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'invested_amount'
  )
LIMIT 1;

-- Fix: VC133 | Anand | VC33 | spread
INSERT INTO introducer_commissions (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, notes)
SELECT
    'b661243f-e6b4-41f1-b239-de4b197a689a', s.investor_id, s.deal_id, 'spread', 3500, 12915.0,
    'Fix migration v3: VC133 Anand'
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) = 'VC33') OR (UPPER(i.legal_name) LIKE '%VC33%'))
  AND s.deal_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM introducer_commissions ic
      WHERE ic.introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
        AND ic.investor_id = s.investor_id
        AND ic.deal_id = s.deal_id
        AND ic.basis_type = 'spread'
  )
LIMIT 1;

