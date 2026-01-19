-- Phase 4: VC114 Updates
-- 8 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 530000.0, price: 1.0, amount: 530000.0
UPDATE subscriptions s
SET num_shares = 530000.0, price_per_share = 1.0, funded_amount = 530000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 530000.0 OR s.funded_amount = 530000.0));

-- Row 3: Revery Capital Limited
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Prometheus Capital Finance Ltd
-- shares: 30000.0, price: 1.0, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 30000.0, price_per_share = 1.0, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%PROMETHEUS CAPITAL FINANCE LTD%') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 5: Manraj SEKHON
-- shares: 200000.0, price: 1.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 200000.0, price_per_share = 1.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Position updates for VC114 (aggregated by investor)
-- Julien MACHOT: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Revery Capital Limited: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%'));

-- Prometheus Capital Finance Ltd: total ownership = 30000.0
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%PROMETHEUS CAPITAL FINANCE LTD%'));

-- Manraj SEKHON: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ'));
