-- Phase 4: VC102 Updates
-- 11 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 3000.0, price: 0.001, amount: 3.0
UPDATE subscriptions s
SET num_shares = 3000.0, price_per_share = 0.001, funded_amount = 3.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 3.0 OR s.funded_amount = 3.0));

-- Row 3: Julien MACHOT
-- shares: 500.0, price: 300.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 500.0, price_per_share = 300.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 4: Julien MACHOT
-- shares: 500.0, price: 300.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 500.0, price_per_share = 300.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 5: Julien MACHOT
-- shares: 150000.0, price: 1.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 150000.0, price_per_share = 1.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 6: LF GROUP SARL
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 7: Pierre PAUMIER
-- shares: 25000.0, price: 1.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 1.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'PAUMIER' OR UPPER(i.legal_name) LIKE '%PAUMIER%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 8: KRISTINA & CHENG-LIN SUTKAITYTE & HSU
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'SUTKAITYTE & HSU' OR UPPER(i.legal_name) LIKE '%SUTKAITYTE & HSU%' OR UPPER(i.legal_name) LIKE '%KRISTINA & CHENG-LIN%' OR UPPER(i.first_name) = 'KRISTINA & CHENG-LIN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC102 (aggregated by investor)
-- Julien MACHOT: total ownership = 29000.0
UPDATE positions p
SET units = 29000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- LF GROUP SARL: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

-- Pierre PAUMIER: total ownership = 25000.0
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'PAUMIER' OR UPPER(i.legal_name) LIKE '%PAUMIER%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE'));

-- KRISTINA & CHENG-LIN SUTKAITYTE & HSU: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'SUTKAITYTE & HSU' OR UPPER(i.legal_name) LIKE '%SUTKAITYTE & HSU%' OR UPPER(i.legal_name) LIKE '%KRISTINA & CHENG-LIN%' OR UPPER(i.first_name) = 'KRISTINA & CHENG-LIN'));
