-- Phase 4: VC130 Updates
-- 9 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 3: Julien MACHOT
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 4: Tuygan GOKER
-- shares: 12502.0, price: 11.998, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 12502.0, price_per_share = 11.998, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 5: Scott LIVINGSTONE
-- shares: 833.0, price: 11.998, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 833.0, price_per_share = 11.998, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'LIVINGSTONE' OR UPPER(i.legal_name) LIKE '%LIVINGSTONE%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 6: Daniel BAUMSLAG
-- shares: 2917.0, price: 11.998, amount: 35000.0
UPDATE subscriptions s
SET num_shares = 2917.0, price_per_share = 11.998, funded_amount = 35000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL') AND (s.commitment = 35000.0 OR s.funded_amount = 35000.0));

-- Position updates for VC130 (aggregated by investor)
-- Julien MACHOT: total ownership = 483748.0
UPDATE positions p
SET units = 483748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Tuygan GOKER: total ownership = 12502.0
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Scott LIVINGSTONE: total ownership = 833.0
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'LIVINGSTONE' OR UPPER(i.legal_name) LIKE '%LIVINGSTONE%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Daniel BAUMSLAG: total ownership = 2917.0
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL'));
