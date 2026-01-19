-- Phase 4: VC121 Updates
-- 3 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 43103.0, price: 0.58, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 43103.0, price_per_share = 0.58, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 3: Julien MACHOT
-- shares: 129310.0, price: 0.58, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 129310.0, price_per_share = 0.58, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Position updates for VC121 (aggregated by investor)
-- Julien MACHOT: total ownership = 172413.0
UPDATE positions p
SET units = 172413.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));
