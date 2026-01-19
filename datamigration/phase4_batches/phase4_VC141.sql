-- Phase 4: VC141 Updates
-- 4 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 3: Serge AURIER
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Position updates for VC141 (aggregated by investor)
-- Julien MACHOT: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Serge AURIER: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));
