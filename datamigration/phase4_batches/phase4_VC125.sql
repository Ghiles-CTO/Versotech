-- Phase 4: VC125 Updates
-- 61 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 1075.0, price: 27.9, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 1075.0, price_per_share = 27.9, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 3: Patrick BIECHELER
-- shares: 169.0, price: 177.26, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 169.0, price_per_share = 177.26, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BIECHELER' OR UPPER(i.legal_name) LIKE '%BIECHELER%' OR UPPER(i.legal_name) LIKE '%PATRICK%' OR UPPER(i.first_name) = 'PATRICK') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 4: SC STONEA
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%SC STONEA%' OR UPPER(i.legal_name) LIKE '%FRANCK%' OR UPPER(i.first_name) = 'FRANCK') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 5: Christophe SORAIS
-- shares: 225.0, price: 177.26, amount: 40000.0
UPDATE subscriptions s
SET num_shares = 225.0, price_per_share = 177.26, funded_amount = 40000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'SORAIS' OR UPPER(i.legal_name) LIKE '%SORAIS%' OR UPPER(i.legal_name) LIKE '%CHRISTOPHE%' OR UPPER(i.first_name) = 'CHRISTOPHE') AND (s.commitment = 40000.0 OR s.funded_amount = 40000.0));

-- Row 6: Alain DECOMBE
-- shares: 451.0, price: 177.26, amount: 80000.0
UPDATE subscriptions s
SET num_shares = 451.0, price_per_share = 177.26, funded_amount = 80000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'DECOMBE' OR UPPER(i.legal_name) LIKE '%DECOMBE%' OR UPPER(i.legal_name) LIKE '%ALAIN%' OR UPPER(i.first_name) = 'ALAIN') AND (s.commitment = 80000.0 OR s.funded_amount = 80000.0));

-- Row 7: Luis GUTIERREZ ROY
-- shares: 2398.0, price: 177.26, amount: 425069.48
UPDATE subscriptions s
SET num_shares = 2398.0, price_per_share = 177.26, funded_amount = 425069.48
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GUTIERREZ ROY' OR UPPER(i.legal_name) LIKE '%GUTIERREZ ROY%' OR UPPER(i.legal_name) LIKE '%TELEGRAPH HILL CAPITAL%' OR UPPER(i.legal_name) LIKE '%LUIS%' OR UPPER(i.first_name) = 'LUIS') AND (s.commitment = 425069.48 OR s.funded_amount = 425069.48));

-- Row 8: Eric SARASIN
-- shares: 1410.0, price: 177.26, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 1410.0, price_per_share = 177.26, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'SARASIN' OR UPPER(i.legal_name) LIKE '%SARASIN%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 9: Nathalie BESLAY
-- shares: 112.0, price: 177.26, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 112.0, price_per_share = 177.26, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BESLAY' OR UPPER(i.legal_name) LIKE '%BESLAY%' OR UPPER(i.legal_name) LIKE '%ZEBRA HOLDING%' OR UPPER(i.legal_name) LIKE '%NATHALIE%' OR UPPER(i.first_name) = 'NATHALIE') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 10: Sylvain GARIEL
-- shares: 112.0, price: 177.26, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 112.0, price_per_share = 177.26, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GARIEL' OR UPPER(i.legal_name) LIKE '%GARIEL%' OR UPPER(i.legal_name) LIKE '%SYLVAIN%' OR UPPER(i.first_name) = 'SYLVAIN') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 11: Benjamin PRESSET
-- shares: 112.0, price: 177.26, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 112.0, price_per_share = 177.26, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'PRESSET' OR UPPER(i.legal_name) LIKE '%PRESSET%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 12: Filippo MONTELEONE
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MONTELEONE' OR UPPER(i.legal_name) LIKE '%MONTELEONE%' OR UPPER(i.legal_name) LIKE '%CAREITAS%' OR UPPER(i.legal_name) LIKE '%FILIPPO%' OR UPPER(i.first_name) = 'FILIPPO') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 13: OEP LTD
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%ALAIN%' OR UPPER(i.first_name) = 'ALAIN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 14: AS ADVISORY
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY%' OR UPPER(i.legal_name) LIKE '%AMMAR%' OR UPPER(i.first_name) = 'AMMAR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 15: Laurent CREHANGE
-- shares: 56.0, price: 177.26, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 56.0, price_per_share = 177.26, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'CREHANGE' OR UPPER(i.legal_name) LIKE '%CREHANGE%' OR UPPER(i.legal_name) LIKE '%LAURENT%' OR UPPER(i.first_name) = 'LAURENT') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 16: Pierre LECOMTE
-- shares: 203.0, price: 177.26, amount: 36000.0
UPDATE subscriptions s
SET num_shares = 203.0, price_per_share = 177.26, funded_amount = 36000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'LECOMTE' OR UPPER(i.legal_name) LIKE '%LECOMTE%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE') AND (s.commitment = 36000.0 OR s.funded_amount = 36000.0));

-- Row 17: Emmanuel CASSIMATIS
-- shares: 28.0, price: 177.26, amount: 5000.0
UPDATE subscriptions s
SET num_shares = 28.0, price_per_share = 177.26, funded_amount = 5000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'CASSIMATIS' OR UPPER(i.legal_name) LIKE '%CASSIMATIS%' OR UPPER(i.legal_name) LIKE '%ALPHA OMEGA SAS%' OR UPPER(i.legal_name) LIKE '%EMMANUEL%' OR UPPER(i.first_name) = 'EMMANUEL') AND (s.commitment = 5000.0 OR s.funded_amount = 5000.0));

-- Row 18: GOOD PROTEIN FUND VCC
-- shares: 1410.0, price: 177.26, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 1410.0, price_per_share = 177.26, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%GOOD PROTEIN FUND VCC%' OR UPPER(i.legal_name) LIKE '%GAUTAM%' OR UPPER(i.first_name) = 'GAUTAM') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 19: DALINGA HOLDING AG
-- shares: 141.0, price: 177.26, amount: 24993.66
UPDATE subscriptions s
SET num_shares = 141.0, price_per_share = 177.26, funded_amount = 24993.66
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%') AND (s.commitment = 24993.66 OR s.funded_amount = 24993.66));

-- Row 20: DALINGA HOLDING AG
-- shares: 28.0, price: 177.26, amount: 4963.28
UPDATE subscriptions s
SET num_shares = 28.0, price_per_share = 177.26, funded_amount = 4963.28
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%') AND (s.commitment = 4963.28 OR s.funded_amount = 4963.28));

-- Row 21: MA GROUP AG
-- shares: 100.0, price: 177.26, amount: 17900.0
UPDATE subscriptions s
SET num_shares = 100.0, price_per_share = 177.26, funded_amount = 17900.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%MA GROUP AG%' OR UPPER(i.legal_name) LIKE '%MATTHIAS%' OR UPPER(i.first_name) = 'MATTHIAS') AND (s.commitment = 17900.0 OR s.funded_amount = 17900.0));

-- Row 22: Andrew MEYER
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 23: Thomas YBERT
-- shares: 141.0, price: 177.26, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 141.0, price_per_share = 177.26, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'YBERT' OR UPPER(i.legal_name) LIKE '%YBERT%' OR UPPER(i.legal_name) LIKE '%THOMAS%' OR UPPER(i.first_name) = 'THOMAS') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 24: Xavier GODRON
-- shares: 112.0, price: 177.26, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 112.0, price_per_share = 177.26, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GODRON' OR UPPER(i.legal_name) LIKE '%GODRON%' OR UPPER(i.legal_name) LIKE '%XAVIER%' OR UPPER(i.first_name) = 'XAVIER') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 25: Anand RATHI
-- shares: 564.0, price: 177.26, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.26, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'RATHI' OR UPPER(i.legal_name) LIKE '%RATHI%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 26: Dan BAUMSLAG
-- shares: 141.0, price: 177.26, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 141.0, price_per_share = 177.26, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 27: Serge AURIER
-- shares: 282.0, price: 177.26, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 282.0, price_per_share = 177.26, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 28: Julien MACHOT
-- shares: 1543.0, price: 177.26, amount: 273512.18
UPDATE subscriptions s
SET num_shares = 1543.0, price_per_share = 177.26, funded_amount = 273512.18
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 273512.18 OR s.funded_amount = 273512.18));

-- Row 29: Robin DOBLE
-- shares: 141.0, price: 177.26, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 141.0, price_per_share = 177.26, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 30: GOOD PROTEIN FUND VCC
-- shares: 1415.0, price: 176.64, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 1415.0, price_per_share = 176.64, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%GOOD PROTEIN FUND VCC%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 31: Eric SARASIN
-- shares: 502.0, price: 177.17, amount: 89072.75
UPDATE subscriptions s
SET num_shares = 502.0, price_per_share = 177.17, funded_amount = 89072.75
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'SARASIN' OR UPPER(i.legal_name) LIKE '%SARASIN%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC') AND (s.commitment = 89072.75 OR s.funded_amount = 89072.75));

-- Row 32: Alain DECOMBE
-- shares: 152.0, price: 177.17, amount: 27000.0
UPDATE subscriptions s
SET num_shares = 152.0, price_per_share = 177.17, funded_amount = 27000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'DECOMBE' OR UPPER(i.legal_name) LIKE '%DECOMBE%' OR UPPER(i.legal_name) LIKE '%ALAIN%' OR UPPER(i.first_name) = 'ALAIN') AND (s.commitment = 27000.0 OR s.funded_amount = 27000.0));

-- Row 33: SC STONEA
-- shares: 197.0, price: 177.17, amount: 35000.0
UPDATE subscriptions s
SET num_shares = 197.0, price_per_share = 177.17, funded_amount = 35000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%SC STONEA%' OR UPPER(i.legal_name) LIKE '%FRANCK%' OR UPPER(i.first_name) = 'FRANCK') AND (s.commitment = 35000.0 OR s.funded_amount = 35000.0));

-- Row 34: Julien MACHOT
-- shares: 48.0, price: 177.17, amount: 8600.0
UPDATE subscriptions s
SET num_shares = 48.0, price_per_share = 177.17, funded_amount = 8600.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 8600.0 OR s.funded_amount = 8600.0));

-- Row 35: LF GROUP SARL
-- shares: 564.0, price: 177.17, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 564.0, price_per_share = 177.17, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Position updates for VC125 (aggregated by investor)
-- Julien MACHOT: total ownership = 2102.0
UPDATE positions p
SET units = 2102.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Patrick BIECHELER: total ownership = 169.0
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BIECHELER' OR UPPER(i.legal_name) LIKE '%BIECHELER%' OR UPPER(i.legal_name) LIKE '%PATRICK%' OR UPPER(i.first_name) = 'PATRICK'));

-- SC STONEA: total ownership = 761.0
UPDATE positions p
SET units = 761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%SC STONEA%' OR UPPER(i.legal_name) LIKE '%FRANCK%' OR UPPER(i.first_name) = 'FRANCK'));

-- Christophe SORAIS: total ownership = 225.0
UPDATE positions p
SET units = 225.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'SORAIS' OR UPPER(i.legal_name) LIKE '%SORAIS%' OR UPPER(i.legal_name) LIKE '%CHRISTOPHE%' OR UPPER(i.first_name) = 'CHRISTOPHE'));

-- Alain DECOMBE: total ownership = 603.0
UPDATE positions p
SET units = 603.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'DECOMBE' OR UPPER(i.legal_name) LIKE '%DECOMBE%' OR UPPER(i.legal_name) LIKE '%ALAIN%' OR UPPER(i.first_name) = 'ALAIN'));

-- Luis GUTIERREZ ROY: total ownership = 2398.0
UPDATE positions p
SET units = 2398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GUTIERREZ ROY' OR UPPER(i.legal_name) LIKE '%GUTIERREZ ROY%' OR UPPER(i.legal_name) LIKE '%TELEGRAPH HILL CAPITAL%' OR UPPER(i.legal_name) LIKE '%LUIS%' OR UPPER(i.first_name) = 'LUIS'));

-- Eric SARASIN: total ownership = 1912.0
UPDATE positions p
SET units = 1912.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'SARASIN' OR UPPER(i.legal_name) LIKE '%SARASIN%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC'));

-- Nathalie BESLAY: total ownership = 112.0
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BESLAY' OR UPPER(i.legal_name) LIKE '%BESLAY%' OR UPPER(i.legal_name) LIKE '%ZEBRA HOLDING%' OR UPPER(i.legal_name) LIKE '%NATHALIE%' OR UPPER(i.first_name) = 'NATHALIE'));

-- Sylvain GARIEL: total ownership = 112.0
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GARIEL' OR UPPER(i.legal_name) LIKE '%GARIEL%' OR UPPER(i.legal_name) LIKE '%SYLVAIN%' OR UPPER(i.first_name) = 'SYLVAIN'));

-- Benjamin PRESSET: total ownership = 112.0
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'PRESSET' OR UPPER(i.legal_name) LIKE '%PRESSET%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN'));

-- Filippo MONTELEONE: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MONTELEONE' OR UPPER(i.legal_name) LIKE '%MONTELEONE%' OR UPPER(i.legal_name) LIKE '%CAREITAS%' OR UPPER(i.legal_name) LIKE '%FILIPPO%' OR UPPER(i.first_name) = 'FILIPPO'));

-- OEP LTD: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%ALAIN%' OR UPPER(i.first_name) = 'ALAIN'));

-- AS ADVISORY: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY%' OR UPPER(i.legal_name) LIKE '%AMMAR%' OR UPPER(i.first_name) = 'AMMAR'));

-- Laurent CREHANGE: total ownership = 56.0
UPDATE positions p
SET units = 56.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'CREHANGE' OR UPPER(i.legal_name) LIKE '%CREHANGE%' OR UPPER(i.legal_name) LIKE '%LAURENT%' OR UPPER(i.first_name) = 'LAURENT'));

-- Pierre LECOMTE: total ownership = 203.0
UPDATE positions p
SET units = 203.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'LECOMTE' OR UPPER(i.legal_name) LIKE '%LECOMTE%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE'));

-- Emmanuel CASSIMATIS: total ownership = 28.0
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'CASSIMATIS' OR UPPER(i.legal_name) LIKE '%CASSIMATIS%' OR UPPER(i.legal_name) LIKE '%ALPHA OMEGA SAS%' OR UPPER(i.legal_name) LIKE '%EMMANUEL%' OR UPPER(i.first_name) = 'EMMANUEL'));

-- GOOD PROTEIN FUND VCC: total ownership = 2825.0
UPDATE positions p
SET units = 2825.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%GOOD PROTEIN FUND VCC%' OR UPPER(i.legal_name) LIKE '%GAUTAM%' OR UPPER(i.first_name) = 'GAUTAM'));

-- DALINGA HOLDING AG: total ownership = 169.0
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'));

-- MA GROUP AG: total ownership = 100.0
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%MA GROUP AG%' OR UPPER(i.legal_name) LIKE '%MATTHIAS%' OR UPPER(i.first_name) = 'MATTHIAS'));

-- Andrew MEYER: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW'));

-- Thomas YBERT: total ownership = 141.0
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'YBERT' OR UPPER(i.legal_name) LIKE '%YBERT%' OR UPPER(i.legal_name) LIKE '%THOMAS%' OR UPPER(i.first_name) = 'THOMAS'));

-- Xavier GODRON: total ownership = 112.0
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'GODRON' OR UPPER(i.legal_name) LIKE '%GODRON%' OR UPPER(i.legal_name) LIKE '%XAVIER%' OR UPPER(i.first_name) = 'XAVIER'));

-- Anand RATHI: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'RATHI' OR UPPER(i.legal_name) LIKE '%RATHI%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND'));

-- Dan BAUMSLAG: total ownership = 141.0
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- Serge AURIER: total ownership = 282.0
UPDATE positions p
SET units = 282.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- Robin DOBLE: total ownership = 141.0
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN'));

-- LF GROUP SARL: total ownership = 564.0
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));
