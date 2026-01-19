-- Phase 4: VC133 Updates
-- 31 UPDATE statements


-- Row 2: Charles DE BAVIER
-- shares: 66.0, price: 1495.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 66.0, price_per_share = 1495.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 3: JASSQ HOLDING LIMITED
-- shares: 200.0, price: 1395.0, amount: 279000.0
UPDATE subscriptions s
SET num_shares = 200.0, price_per_share = 1395.0, funded_amount = 279000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%') AND (s.commitment = 279000.0 OR s.funded_amount = 279000.0));

-- Row 4: CARTA INVESTMENTS LLC
-- shares: 66.0, price: 1495.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 66.0, price_per_share = 1495.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%CARTA INVESTMENTS LLC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 5: Sahejman KAHLON
-- shares: 33.0, price: 1495.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 33.0, price_per_share = 1495.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'KAHLON' OR UPPER(i.legal_name) LIKE '%KAHLON%' OR UPPER(i.legal_name) LIKE '%SAHEJMAN%' OR UPPER(i.first_name) = 'SAHEJMAN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 6: 777 WALNUT LLC
-- shares: 33.0, price: 1495.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 33.0, price_per_share = 1495.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%777 WALNUT LLC%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 7: Keir BENBOW
-- shares: 35.0, price: 1395.0, amount: 48825.0
UPDATE subscriptions s
SET num_shares = 35.0, price_per_share = 1395.0, funded_amount = 48825.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR') AND (s.commitment = 48825.0 OR s.funded_amount = 48825.0));

-- Row 8: Marco JERRENTRUP
-- shares: 35.0, price: 1395.0, amount: 49000.0
UPDATE subscriptions s
SET num_shares = 35.0, price_per_share = 1395.0, funded_amount = 49000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO') AND (s.commitment = 49000.0 OR s.funded_amount = 49000.0));

-- Row 9: ZANDERA (Holdco) Ltd
-- shares: 645.0, price: 1550.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 645.0, price_per_share = 1550.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 10: Band Capital Limited
-- shares: 358.0, price: 1395.0, amount: 499410.0
UPDATE subscriptions s
SET num_shares = 358.0, price_per_share = 1395.0, funded_amount = 499410.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%BAND CAPITAL LIMITED%') AND (s.commitment = 499410.0 OR s.funded_amount = 499410.0));

-- Row 11: Jeremy LOWY
-- shares: 33.0, price: 1495.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 33.0, price_per_share = 1495.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'LOWY' OR UPPER(i.legal_name) LIKE '%LOWY%' OR UPPER(i.legal_name) LIKE '%JEREMY%' OR UPPER(i.first_name) = 'JEREMY') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 12: Tuygan GOKER
-- shares: 369.0, price: 1395.0, amount: 514755.0
UPDATE subscriptions s
SET num_shares = 369.0, price_per_share = 1395.0, funded_amount = 514755.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 514755.0 OR s.funded_amount = 514755.0));

-- Row 13: Tuygan GOKER
-- shares: 347.0, price: 1395.0, amount: 484065.0
UPDATE subscriptions s
SET num_shares = 347.0, price_per_share = 1395.0, funded_amount = 484065.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 484065.0 OR s.funded_amount = 484065.0));

-- Row 14: Julien MACHOT
-- shares: 4.0, price: 800.0, amount: 3200.0
UPDATE subscriptions s
SET num_shares = 4.0, price_per_share = 800.0, funded_amount = 3200.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%VERSO HOLDINGS%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 3200.0 OR s.funded_amount = 3200.0));

-- Row 15: Tobias JOERN
-- shares: 6.0, price: 1495.0, amount: 8970.0
UPDATE subscriptions s
SET num_shares = 6.0, price_per_share = 1495.0, funded_amount = 8970.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'JOERN' OR UPPER(i.legal_name) LIKE '%JOERN%' OR UPPER(i.legal_name) LIKE '%TOBIAS%' OR UPPER(i.first_name) = 'TOBIAS') AND (s.commitment = 8970.0 OR s.funded_amount = 8970.0));

-- Row 16: René ROSSDEUTSCHER
-- shares: 13.0, price: 1495.0, amount: 19435.0
UPDATE subscriptions s
SET num_shares = 13.0, price_per_share = 1495.0, funded_amount = 19435.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'ROSSDEUTSCHER' OR UPPER(i.legal_name) LIKE '%ROSSDEUTSCHER%' OR UPPER(i.legal_name) LIKE '%RENÉ%' OR UPPER(i.first_name) = 'RENÉ') AND (s.commitment = 19435.0 OR s.funded_amount = 19435.0));

-- Row 17: Ellen STAUDENMAYER
-- shares: 6.0, price: 1495.0, amount: 8970.0
UPDATE subscriptions s
SET num_shares = 6.0, price_per_share = 1495.0, funded_amount = 8970.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'STAUDENMAYER' OR UPPER(i.legal_name) LIKE '%STAUDENMAYER%' OR UPPER(i.legal_name) LIKE '%ELLEN%' OR UPPER(i.first_name) = 'ELLEN') AND (s.commitment = 8970.0 OR s.funded_amount = 8970.0));

-- Position updates for VC133 (aggregated by investor)
-- Charles DE BAVIER: total ownership = 66.0
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES'));

-- JASSQ HOLDING LIMITED: total ownership = 200.0
UPDATE positions p
SET units = 200.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%'));

-- CARTA INVESTMENTS LLC: total ownership = 66.0
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%CARTA INVESTMENTS LLC%'));

-- Sahejman KAHLON: total ownership = 33.0
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'KAHLON' OR UPPER(i.legal_name) LIKE '%KAHLON%' OR UPPER(i.legal_name) LIKE '%SAHEJMAN%' OR UPPER(i.first_name) = 'SAHEJMAN'));

-- 777 WALNUT LLC: total ownership = 33.0
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%777 WALNUT LLC%'));

-- Keir BENBOW: total ownership = 35.0
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR'));

-- Marco JERRENTRUP: total ownership = 35.0
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO'));

-- ZANDERA (Holdco) Ltd: total ownership = 645.0
UPDATE positions p
SET units = 645.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LTD%'));

-- Band Capital Limited: total ownership = 358.0
UPDATE positions p
SET units = 358.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.legal_name) LIKE '%BAND CAPITAL LIMITED%'));

-- Jeremy LOWY: total ownership = 33.0
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'LOWY' OR UPPER(i.legal_name) LIKE '%LOWY%' OR UPPER(i.legal_name) LIKE '%JEREMY%' OR UPPER(i.first_name) = 'JEREMY'));

-- Tuygan GOKER: total ownership = 716.0
UPDATE positions p
SET units = 716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Julien MACHOT: total ownership = 4.0
UPDATE positions p
SET units = 4.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%VERSO HOLDINGS%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Tobias JOERN: total ownership = 6.0
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'JOERN' OR UPPER(i.legal_name) LIKE '%JOERN%' OR UPPER(i.legal_name) LIKE '%TOBIAS%' OR UPPER(i.first_name) = 'TOBIAS'));

-- René ROSSDEUTSCHER: total ownership = 13.0
UPDATE positions p
SET units = 13.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'ROSSDEUTSCHER' OR UPPER(i.legal_name) LIKE '%ROSSDEUTSCHER%' OR UPPER(i.legal_name) LIKE '%RENÉ%' OR UPPER(i.first_name) = 'RENÉ'));

-- Ellen STAUDENMAYER: total ownership = 6.0
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND ((UPPER(i.last_name) = 'STAUDENMAYER' OR UPPER(i.legal_name) LIKE '%STAUDENMAYER%' OR UPPER(i.legal_name) LIKE '%ELLEN%' OR UPPER(i.first_name) = 'ELLEN'));
