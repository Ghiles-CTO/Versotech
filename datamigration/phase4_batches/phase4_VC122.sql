-- Phase 4: VC122 Updates
-- 14 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 249525.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 249525.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 3: AS ADVISORY DWC LLC
-- shares: None, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC LLC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Deyan MIHOV
-- shares: None, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 5: Sheikh AL SABAH
-- shares: None, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH%' OR UPPER(i.first_name) = 'SHEIKH') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 6: Anke RICE
-- shares: 95949.0, price: 1.0, amount: 60000.0
UPDATE subscriptions s
SET num_shares = 95949.0, price_per_share = 1.0, funded_amount = 60000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'RICE' OR UPPER(i.legal_name) LIKE '%RICE%' OR UPPER(i.legal_name) LIKE '%ANKE%' OR UPPER(i.first_name) = 'ANKE') AND (s.commitment = 60000.0 OR s.funded_amount = 60000.0));

-- Row 7: VERSO CAPITAL ESTABLISHMENT
-- shares: None, price: 1.0, amount: 25000.0
UPDATE subscriptions s
SET price_per_share = 1.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.legal_name) LIKE '%VERSO CAPITAL ESTABLISHMENT%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 8: Anand SETHIA
-- shares: 39978.0, price: 1.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 39978.0, price_per_share = 1.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'SETHIA' OR UPPER(i.legal_name) LIKE '%SETHIA%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 9: Julien MACHOT
-- shares: 159915.0, price: 1.0, amount: 99999.65
UPDATE subscriptions s
SET num_shares = 159915.0, price_per_share = 1.0, funded_amount = 99999.65
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 99999.65 OR s.funded_amount = 99999.65));

-- Row 10: Erich GRAF
-- shares: 159915.0, price: 0.62533, amount: 99999.65
UPDATE subscriptions s
SET num_shares = 159915.0, price_per_share = 0.62533, funded_amount = 99999.65
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH') AND (s.commitment = 99999.65 OR s.funded_amount = 99999.65));

-- Row 11: LF GROUP SARL
-- shares: None, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Position updates for VC122 (aggregated by investor)
-- Julien MACHOT: total ownership = 113598.0
UPDATE positions p
SET units = 113598.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Anke RICE: total ownership = 95949.0
UPDATE positions p
SET units = 95949.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'RICE' OR UPPER(i.legal_name) LIKE '%RICE%' OR UPPER(i.legal_name) LIKE '%ANKE%' OR UPPER(i.first_name) = 'ANKE'));

-- Anand SETHIA: total ownership = 39978.0
UPDATE positions p
SET units = 39978.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'SETHIA' OR UPPER(i.legal_name) LIKE '%SETHIA%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND'));

-- Erich GRAF: total ownership = 159915.0
UPDATE positions p
SET units = 159915.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH'));
