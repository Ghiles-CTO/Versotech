-- Phase 4: VC112 Updates
-- 38 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 629405.0, price: 0.3972, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 629405.0, price_per_share = 0.3972, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 3: Julien MACHOT
-- shares: 100704.0, price: 0.4965, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 100704.0, price_per_share = 0.4965, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 4: Gershon KOH
-- shares: 201409.0, price: 0.4965, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 201409.0, price_per_share = 0.4965, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 5: Dan BAUMSLAG
-- shares: 50352.0, price: 0.4965, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 50352.0, price_per_share = 0.4965, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 6: Julien MACHOT
-- shares: 151057.0, price: 0.4965, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 151057.0, price_per_share = 0.4965, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 7: Julien MACHOT
-- shares: 503524.0, price: 0.4965, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 503524.0, price_per_share = 0.4965, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 8: Julien MACHOT
-- shares: 44444.0, price: 0.00010012600126, amount: 4.45
UPDATE subscriptions s
SET num_shares = 44444.0, price_per_share = 0.00010012600126, funded_amount = 4.45
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 4.45 OR s.funded_amount = 4.45));

-- Row 9: Dan BAUMSLAG
-- shares: 16370.0, price: 1.5271, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 16370.0, price_per_share = 1.5271, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 10: Julien MACHOT
-- shares: 32741.0, price: 1.5271, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 32741.0, price_per_share = 1.5271, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 11: IQEQ (Switzerland) Ltd ATO Raycat Investment Trust
-- shares: 16370.0, price: 1.5271, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 16370.0, price_per_share = 1.5271, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 12: Julien MACHOT
-- shares: 85128.0, price: 1.5271, amount: 130000.0
UPDATE subscriptions s
SET num_shares = 85128.0, price_per_share = 1.5271, funded_amount = 130000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 130000.0 OR s.funded_amount = 130000.0));

-- Row 13: Robert DETTMEIJER
-- shares: 13096.0, price: 1.5271, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 13096.0, price_per_share = 1.5271, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 14: IQEQ (Switzerland) Ltd ATO Raycat Investment Trust
-- shares: 12038.0, price: 1.0, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 12038.0, price_per_share = 1.0, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 15: REVERY Capital Limited
-- shares: 32741.0, price: 1.5271, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 32741.0, price_per_share = 1.5271, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: Beatrice and Marcel KNOPF
-- shares: 8186.0, price: 12.2154, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 8186.0, price_per_share = 12.2154, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 17: Liudmila and Alexey ROMANOV
-- shares: 40931.0, price: 12.2154, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 40931.0, price_per_share = 12.2154, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 18: Tom ROAD
-- shares: 1227.0, price: 12.2154, amount: 15000.0
UPDATE subscriptions s
SET num_shares = 1227.0, price_per_share = 12.2154, funded_amount = 15000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROAD' OR UPPER(i.legal_name) LIKE '%ROAD%') AND (s.commitment = 15000.0 OR s.funded_amount = 15000.0));

-- Row 19: Sheikh Yousef AL SABAH
-- shares: 4093.0, price: 12.2154, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 4093.0, price_per_share = 12.2154, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 20: Giovanni ALBERTINI
-- shares: 4093.0, price: 12.2154, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 4093.0, price_per_share = 12.2154, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ALBERTINI' OR UPPER(i.legal_name) LIKE '%ALBERTINI%' OR UPPER(i.legal_name) LIKE '%GIOVANNI%' OR UPPER(i.first_name) = 'GIOVANNI') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 21: Julien MACHOT
-- shares: 43797.0, price: 12.2154, amount: 535000.0
UPDATE subscriptions s
SET num_shares = 43797.0, price_per_share = 12.2154, funded_amount = 535000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 535000.0 OR s.funded_amount = 535000.0));

-- Row 22: VERSO X
-- shares: 236185.0, price: 1.57126, amount: 371109.0
UPDATE subscriptions s
SET num_shares = 236185.0, price_per_share = 1.57126, funded_amount = 371109.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%VERSO X%') AND (s.commitment = 371109.0 OR s.funded_amount = 371109.0));

-- Row 23: Julien MACHOT
-- shares: 61.0, price: 0.3972, amount: 24.5
UPDATE subscriptions s
SET num_shares = 61.0, price_per_share = 0.3972, funded_amount = 24.5
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 24.5 OR s.funded_amount = 24.5));

-- Row 24: Julien MACHOT
-- shares: 100.0, price: 0.4965, amount: 50.0
UPDATE subscriptions s
SET num_shares = 100.0, price_per_share = 0.4965, funded_amount = 50.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50.0 OR s.funded_amount = 50.0));

-- Row 25: Julien MACHOT
-- shares: 3.0, price: 1.5271, amount: 6.0
UPDATE subscriptions s
SET num_shares = 3.0, price_per_share = 1.5271, funded_amount = 6.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 6.0 OR s.funded_amount = 6.0));

-- Row 26: OEP Ltd
-- shares: 21972.0, price: 0.00010012600126, amount: 2.2
UPDATE subscriptions s
SET num_shares = 21972.0, price_per_share = 0.00010012600126, funded_amount = 2.2
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 2.2 OR s.funded_amount = 2.2));

-- Position updates for VC112 (aggregated by investor)
-- Julien MACHOT: total ownership = 1300066.0
UPDATE positions p
SET units = 1300066.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Gershon KOH: total ownership = 201409.0
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON'));

-- Dan BAUMSLAG: total ownership = 66722.0
UPDATE positions p
SET units = 66722.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: total ownership = 28408.0
UPDATE positions p
SET units = 28408.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%'));

-- Robert DETTMEIJER: total ownership = 13096.0
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT'));

-- REVERY Capital Limited: total ownership = 32741.0
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%'));

-- Beatrice and Marcel KNOPF: total ownership = 8186.0
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL'));

-- Liudmila and Alexey ROMANOV: total ownership = 40931.0
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY'));

-- Tom ROAD: total ownership = 1227.0
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROAD' OR UPPER(i.legal_name) LIKE '%ROAD%'));

-- Sheikh Yousef AL SABAH: total ownership = 4093.0
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF'));

-- Giovanni ALBERTINI: total ownership = 4093.0
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ALBERTINI' OR UPPER(i.legal_name) LIKE '%ALBERTINI%' OR UPPER(i.legal_name) LIKE '%GIOVANNI%' OR UPPER(i.first_name) = 'GIOVANNI'));

-- VERSO X: total ownership = 236185.0
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%VERSO X%'));

-- OEP Ltd: total ownership = 21972.0
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));
