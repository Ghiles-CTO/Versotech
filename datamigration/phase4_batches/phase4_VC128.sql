-- Phase 4: VC128 Updates
-- 7 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 178571.0, price: 0.7, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 178571.0, price_per_share = 0.7, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 3: OEP Ltd
-- shares: 142857.0, price: 0.7, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 142857.0, price_per_share = 0.7, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Dan BAUMSLAG
-- shares: 35714.0, price: 0.7, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 35714.0, price_per_share = 0.7, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 5: Julien MACHOT
-- shares: 71428.0, price: 0.7, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 71428.0, price_per_share = 0.7, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC128 (aggregated by investor)
-- Julien MACHOT: total ownership = 249999.0
UPDATE positions p
SET units = 249999.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- OEP Ltd: total ownership = 71429.0
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- Dan BAUMSLAG: total ownership = 35714.0
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));
