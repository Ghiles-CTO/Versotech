-- Phase 4: VC118 Updates
-- 13 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 119233.0, price: 3.42283, amount: 408115.01
UPDATE subscriptions s
SET num_shares = 119233.0, price_per_share = 3.42283, funded_amount = 408115.01
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 408115.01 OR s.funded_amount = 408115.01));

-- Row 3: VOLF TRUST
-- shares: 7692.0, price: 32.5, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 7692.0, price_per_share = 32.5, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 4: Liudmila and Alexey ROMANOVA & ROMANOV
-- shares: 15384.0, price: 32.5, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 15384.0, price_per_share = 32.5, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'ROMANOVA & ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOVA & ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 5: SIGNET LOGISTICS Ltd
-- shares: 3076.0, price: 32.5, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3076.0, price_per_share = 32.5, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 6: Markus AKERMANN
-- shares: 4615.0, price: 32.5, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 4615.0, price_per_share = 32.5, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 7: Talal CHAMSI PASHA
-- shares: 39000.0, price: 6.62717, amount: 258460.0
UPDATE subscriptions s
SET num_shares = 39000.0, price_per_share = 6.62717, funded_amount = 258460.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL') AND (s.commitment = 258460.0 OR s.funded_amount = 258460.0));

-- Row 8: Talal CHAMSI PASHA
-- shares: 79324.0, price: 6.62717, amount: 525695.0
UPDATE subscriptions s
SET num_shares = 79324.0, price_per_share = 6.62717, funded_amount = 525695.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL') AND (s.commitment = 525695.0 OR s.funded_amount = 525695.0));

-- Position updates for VC118 (aggregated by investor)
-- Julien MACHOT: total ownership = 909.0
UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- VOLF TRUST: total ownership = 7692.0
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%'));

-- Liudmila and Alexey ROMANOVA & ROMANOV: total ownership = 15384.0
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'ROMANOVA & ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOVA & ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY'));

-- SIGNET LOGISTICS Ltd: total ownership = 3076.0
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'));

-- Markus AKERMANN: total ownership = 4615.0
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS'));

-- Talal CHAMSI PASHA: total ownership = 118324.0
UPDATE positions p
SET units = 118324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL'));
