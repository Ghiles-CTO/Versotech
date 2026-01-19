-- Phase 4: VC143 Updates
-- 6 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 3: Deyan MIHOV
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 4: LF GROUP SARL
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Position updates for VC143 (aggregated by investor)
-- Julien MACHOT: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Deyan MIHOV: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN'));

-- LF GROUP SARL: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

-- ============================================
-- 