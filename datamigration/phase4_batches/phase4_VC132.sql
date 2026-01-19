-- Phase 4: VC132 Updates
-- 3 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 11505.0, price: 18.643, amount: 214505.6
UPDATE subscriptions s
SET num_shares = 11505.0, price_per_share = 18.643, funded_amount = 214505.6
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 214505.6 OR s.funded_amount = 214505.6));

-- Row 3: Julien MACHOT
-- shares: 16041.0, price: 1.0, amount: 16041.99
UPDATE subscriptions s
SET num_shares = 16041.0, price_per_share = 1.0, funded_amount = 16041.99
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 16041.99 OR s.funded_amount = 16041.99));

-- Position updates for VC132 (aggregated by investor)
-- Julien MACHOT: total ownership = 27546.0
UPDATE positions p
SET units = 27546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));
