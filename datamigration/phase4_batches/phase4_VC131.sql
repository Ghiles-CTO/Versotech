-- Phase 4: VC131 Updates
-- 5 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 20000.0, price: 1.25, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 20000.0, price_per_share = 1.25, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 3: Julien MACHOT
-- shares: 20000.0, price: 1.25, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 20000.0, price_per_share = 1.25, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 4: Julien MACHOT
-- shares: 12500.0, price: 1.0, amount: 12500.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 1.0, funded_amount = 12500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 12500.0 OR s.funded_amount = 12500.0));

-- Row 5: Julien MACHOT
-- shares: 12500.0, price: 1.0, amount: 12500.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 1.0, funded_amount = 12500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 12500.0 OR s.funded_amount = 12500.0));

-- Position updates for VC131 (aggregated by investor)
-- Julien MACHOT: total ownership = 65000.0
UPDATE positions p
SET units = 65000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));
