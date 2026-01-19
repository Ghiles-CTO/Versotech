-- Phase 4: VC111 Updates
-- 73 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 150000.0, price: 1.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 150000.0, price_per_share = 1.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 3: Dan BAUMSLAG
-- shares: 150000.0, price: 1.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 150000.0, price_per_share = 1.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 4: ROSEN INVEST HOLDINGS INC
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 5: STRUCTURED ISSUANCE Ltd
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 6: DALINGA HOLDING AG
-- shares: 115000.0, price: 1.0, amount: 115000.0
UPDATE subscriptions s
SET num_shares = 115000.0, price_per_share = 1.0, funded_amount = 115000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%') AND (s.commitment = 115000.0 OR s.funded_amount = 115000.0));

-- Row 7: Tartrifuge SA
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 8: OEP LIMITED
(Transfer from AS ADVISORY DWC LLC)
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%OEP LIMITED
(TRANSFER FROM AS ADVISORY DWC LLC)%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 9: David HOLDEN
-- shares: 200000.0, price: 1.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 200000.0, price_per_share = 1.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%HOLDEN%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 10: TERRA Financial & Management Services SA
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 11: Dan
Jean BAUMSLAG
DUTIL
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BAUMSLAG
DUTIL' OR UPPER(i.legal_name) LIKE '%BAUMSLAG
DUTIL%' OR UPPER(i.legal_name) LIKE '%DAN
JEAN%' OR UPPER(i.first_name) = 'DAN
JEAN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 12: Stephane DAHAN
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%DAHAN%' OR UPPER(i.legal_name) LIKE '%STEPHANE%' OR UPPER(i.first_name) = 'STEPHANE') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 13: Bruce HAWKINS
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HAWKINS' OR UPPER(i.legal_name) LIKE '%HAWKINS%' OR UPPER(i.legal_name) LIKE '%BRUCE%' OR UPPER(i.first_name) = 'BRUCE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 14: VOLF Trust
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 15: James BURCH
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BURCH' OR UPPER(i.legal_name) LIKE '%BURCH%' OR UPPER(i.legal_name) LIKE '%JAMES%' OR UPPER(i.first_name) = 'JAMES') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: Mark MATTHEWS
-- shares: 200000.0, price: 1.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 200000.0, price_per_share = 1.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 17: Sandra KOHLER CABIAN
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 18: Johann AKERMANN
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%JOHANN%' OR UPPER(i.first_name) = 'JOHANN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 19: Erich GRAF
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 20: Alberto RAVANO
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'RAVANO' OR UPPER(i.legal_name) LIKE '%RAVANO%' OR UPPER(i.legal_name) LIKE '%ALBERTO%' OR UPPER(i.first_name) = 'ALBERTO') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 21: FINALMA SUISSE SA
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 22: MONFIN LTD
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%MONFIN LTD%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 23: Bright Phoenix Holdings LTD
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 24: Antonio PERONACE
-- shares: 70000.0, price: 1.0, amount: 70000.0
UPDATE subscriptions s
SET num_shares = 70000.0, price_per_share = 1.0, funded_amount = 70000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'PERONACE' OR UPPER(i.legal_name) LIKE '%PERONACE%' OR UPPER(i.legal_name) LIKE '%ANTONIO%' OR UPPER(i.first_name) = 'ANTONIO') AND (s.commitment = 70000.0 OR s.funded_amount = 70000.0));

-- Row 25: Julien MACHOT
-- shares: 760000.0, price: 1.0, amount: 760000.0
UPDATE subscriptions s
SET num_shares = 760000.0, price_per_share = 1.0, funded_amount = 760000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 760000.0 OR s.funded_amount = 760000.0));

-- Row 26: BRAHMA FINANCE
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BRAHMA FINANCE%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 27: GTV Partners SA
-- shares: 600000.0, price: 1.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 600000.0, price_per_share = 1.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Row 28: Denis MATTHEY
-- shares: 1000000.0, price: 1.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 1000000.0, price_per_share = 1.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 29: Beatrice and Marcel KNOPF
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 30: BenSkyla AG
-- shares: 200000.0, price: 1.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 200000.0, price_per_share = 1.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BENSKYLA AG%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 31: Peter HOGLAND
-- shares: 150000.0, price: 1.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 150000.0, price_per_share = 1.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HOGLAND' OR UPPER(i.legal_name) LIKE '%HOGLAND%' OR UPPER(i.legal_name) LIKE '%PETER%' OR UPPER(i.first_name) = 'PETER') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 32: Wymo Finance Limited
-- shares: 500000.0, price: 1.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 500000.0, price_per_share = 1.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%WYMO FINANCE LIMITED%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 33: HASSBRO Investments Limited
-- shares: 500000.0, price: 1.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 500000.0, price_per_share = 1.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%HASSBRO INVESTMENTS LIMITED%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 34: Vladimir GUSEV
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'GUSEV' OR UPPER(i.legal_name) LIKE '%GUSEV%' OR UPPER(i.legal_name) LIKE '%VLADIMIR%' OR UPPER(i.first_name) = 'VLADIMIR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 35: Vladimir GUSEV
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'GUSEV' OR UPPER(i.legal_name) LIKE '%GUSEV%' OR UPPER(i.legal_name) LIKE '%VLADIMIR%' OR UPPER(i.first_name) = 'VLADIMIR') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 36: Zandera (Finco) Limited
-- shares: 100000.0, price: 10.0, amount: 571428.57
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 10.0, funded_amount = 571428.57
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%') AND (s.commitment = 571428.57 OR s.funded_amount = 571428.57));

-- Row 37: TERRA Financial & Management Services SA
-- shares: 30000.0, price: 1.0, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 30000.0, price_per_share = 1.0, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 38: LPP Investment Holdings Ltd
-- shares: 1000000.0, price: 1.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 1000000.0, price_per_share = 1.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%LPP INVESTMENT HOLDINGS LTD%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 39: Mickael RYAN
-- shares: 100000.0, price: 10.0, amount: 571428.57
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 10.0, funded_amount = 571428.57
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 571428.57 OR s.funded_amount = 571428.57));

-- Position updates for VC111 (aggregated by investor)
-- Julien MACHOT: total ownership = 410000.0
UPDATE positions p
SET units = 410000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Dan BAUMSLAG: total ownership = 150000.0
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- ROSEN INVEST HOLDINGS INC: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'));

-- STRUCTURED ISSUANCE Ltd: total ownership = 250000.0
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%STRUCTURED ISSUANCE LTD%'));

-- DALINGA HOLDING AG: total ownership = 115000.0
UPDATE positions p
SET units = 115000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'));

-- Tartrifuge SA: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%TARTRIFUGE SA%'));

-- OEP LIMITED
(Transfer from AS ADVISORY DWC LLC): total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%OEP LIMITED
(TRANSFER FROM AS ADVISORY DWC LLC)%'));

-- David HOLDEN: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%HOLDEN%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID'));

-- TERRA Financial & Management Services SA: total ownership = 80000.0
UPDATE positions p
SET units = 80000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%'));

-- Dan
Jean BAUMSLAG
DUTIL: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BAUMSLAG
DUTIL' OR UPPER(i.legal_name) LIKE '%BAUMSLAG
DUTIL%' OR UPPER(i.legal_name) LIKE '%DAN
JEAN%' OR UPPER(i.first_name) = 'DAN
JEAN'));

-- Stephane DAHAN: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%DAHAN%' OR UPPER(i.legal_name) LIKE '%STEPHANE%' OR UPPER(i.first_name) = 'STEPHANE'));

-- Bruce HAWKINS: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HAWKINS' OR UPPER(i.legal_name) LIKE '%HAWKINS%' OR UPPER(i.legal_name) LIKE '%BRUCE%' OR UPPER(i.first_name) = 'BRUCE'));

-- VOLF Trust: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%'));

-- James BURCH: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'BURCH' OR UPPER(i.legal_name) LIKE '%BURCH%' OR UPPER(i.legal_name) LIKE '%JAMES%' OR UPPER(i.first_name) = 'JAMES'));

-- Mark MATTHEWS: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Sandra KOHLER CABIAN: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA'));

-- Johann AKERMANN: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%JOHANN%' OR UPPER(i.first_name) = 'JOHANN'));

-- Erich GRAF: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH'));

-- Alberto RAVANO: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'RAVANO' OR UPPER(i.legal_name) LIKE '%RAVANO%' OR UPPER(i.legal_name) LIKE '%ALBERTO%' OR UPPER(i.first_name) = 'ALBERTO'));

-- FINALMA SUISSE SA: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%FINALMA SUISSE SA%'));

-- MONFIN LTD: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%MONFIN LTD%'));

-- Bright Phoenix Holdings LTD: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'));

-- Antonio PERONACE: total ownership = 70000.0
UPDATE positions p
SET units = 70000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'PERONACE' OR UPPER(i.legal_name) LIKE '%PERONACE%' OR UPPER(i.legal_name) LIKE '%ANTONIO%' OR UPPER(i.first_name) = 'ANTONIO'));

-- BRAHMA FINANCE: total ownership = 250000.0
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BRAHMA FINANCE%'));

-- GTV Partners SA: total ownership = 600000.0
UPDATE positions p
SET units = 600000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%'));

-- Denis MATTHEY: total ownership = 1000000.0
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS'));

-- Beatrice and Marcel KNOPF: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL'));

-- BenSkyla AG: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%BENSKYLA AG%'));

-- Peter HOGLAND: total ownership = 150000.0
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'HOGLAND' OR UPPER(i.legal_name) LIKE '%HOGLAND%' OR UPPER(i.legal_name) LIKE '%PETER%' OR UPPER(i.first_name) = 'PETER'));

-- Wymo Finance Limited: total ownership = 250000.0
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%WYMO FINANCE LIMITED%'));

-- HASSBRO Investments Limited: total ownership = 250000.0
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%HASSBRO INVESTMENTS LIMITED%'));

-- Vladimir GUSEV: total ownership = 150000.0
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'GUSEV' OR UPPER(i.legal_name) LIKE '%GUSEV%' OR UPPER(i.legal_name) LIKE '%VLADIMIR%' OR UPPER(i.first_name) = 'VLADIMIR'));

-- Zandera (Finco) Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'));

-- LPP Investment Holdings Ltd: total ownership = 1000000.0
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.legal_name) LIKE '%LPP INVESTMENT HOLDINGS LTD%'));

-- Mickael RYAN: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL'));
