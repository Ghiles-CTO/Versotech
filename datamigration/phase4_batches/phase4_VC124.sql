-- Phase 4: VC124 Updates
-- 19 UPDATE statements


-- Row 2: JASSQ Holding Limited
-- shares: 15000.0, price: 12.12, amount: 181800.0
UPDATE subscriptions s
SET num_shares = 15000.0, price_per_share = 12.12, funded_amount = 181800.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%') AND (s.commitment = 181800.0 OR s.funded_amount = 181800.0));

-- Row 3: Julien MACHOT
-- shares: 4125.0, price: 12.12, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 4125.0, price_per_share = 12.12, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 4: Scott FLETCHER
-- shares: 20627.0, price: 12.12, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 20627.0, price_per_share = 12.12, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 5: Julien MACHOT
-- shares: 0.0, price: 12.12, amount: 0.0
UPDATE subscriptions s
SET num_shares = 0.0, price_per_share = 12.12, funded_amount = 0.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Row 6: Dan BAUMSLAG
-- shares: 822.0, price: 12.12, amount: 9971.2
UPDATE subscriptions s
SET num_shares = 822.0, price_per_share = 12.12, funded_amount = 9971.2
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 9971.2 OR s.funded_amount = 9971.2));

-- Row 7: Christine MASCORT SULLENGER
-- shares: 3300.0, price: 12.12, amount: 40000.0
UPDATE subscriptions s
SET num_shares = 3300.0, price_per_share = 12.12, funded_amount = 40000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MASCORT SULLENGER' OR UPPER(i.legal_name) LIKE '%MASCORT SULLENGER%' OR UPPER(i.legal_name) LIKE '%CHRISTINE%' OR UPPER(i.first_name) = 'CHRISTINE') AND (s.commitment = 40000.0 OR s.funded_amount = 40000.0));

-- Row 8: JASSQ Holding Limited
-- shares: 259636.0, price: 0.02893, amount: 7510.0
UPDATE subscriptions s
SET num_shares = 259636.0, price_per_share = 0.02893, funded_amount = 7510.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%') AND (s.commitment = 7510.0 OR s.funded_amount = 7510.0));

-- Row 9: OEP Ltd
-- shares: 86430.0, price: 0.02893, amount: 2500.0
UPDATE subscriptions s
SET num_shares = 86430.0, price_per_share = 0.02893, funded_amount = 2500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 2500.0 OR s.funded_amount = 2500.0));

-- Row 10: Scott FLETCHER
-- shares: 1728608.0, price: 0.02893, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1728608.0, price_per_share = 0.02893, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 11: Julien MACHOT
-- shares: 288716.0, price: 0.02893, amount: 8352.5
UPDATE subscriptions s
SET num_shares = 288716.0, price_per_share = 0.02893, funded_amount = 8352.5
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 8352.5 OR s.funded_amount = 8352.5));

-- Row 12: VERSO Capital Establishment
-- shares: 345721.0, price: 0.02893, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 345721.0, price_per_share = 0.02893, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%VERSO CAPITAL ESTABLISHMENT%') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 13: Christine MASCORT SULLENGER
-- shares: 56663.0, price: 0.02893, amount: 1639.0
UPDATE subscriptions s
SET num_shares = 56663.0, price_per_share = 0.02893, funded_amount = 1639.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MASCORT SULLENGER' OR UPPER(i.legal_name) LIKE '%MASCORT SULLENGER%' OR UPPER(i.legal_name) LIKE '%CHRISTINE%' OR UPPER(i.first_name) = 'CHRISTINE') AND (s.commitment = 1639.0 OR s.funded_amount = 1639.0));

-- Position updates for VC124 (aggregated by investor)
-- JASSQ Holding Limited: total ownership = 274636.0
UPDATE positions p
SET units = 274636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%'));

-- Julien MACHOT: total ownership = 292841.0
UPDATE positions p
SET units = 292841.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Scott FLETCHER: total ownership = 1749235.0
UPDATE positions p
SET units = 1749235.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Dan BAUMSLAG: total ownership = 822.0
UPDATE positions p
SET units = 822.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- Christine MASCORT SULLENGER: total ownership = 59963.0
UPDATE positions p
SET units = 59963.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.last_name) = 'MASCORT SULLENGER' OR UPPER(i.legal_name) LIKE '%MASCORT SULLENGER%' OR UPPER(i.legal_name) LIKE '%CHRISTINE%' OR UPPER(i.first_name) = 'CHRISTINE'));

-- OEP Ltd: total ownership = 86430.0
UPDATE positions p
SET units = 86430.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- VERSO Capital Establishment: total ownership = 345721.0
UPDATE positions p
SET units = 345721.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND ((UPPER(i.legal_name) LIKE '%VERSO CAPITAL ESTABLISHMENT%'));
