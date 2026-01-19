-- Phase 4: VC106 Updates
-- 392 UPDATE statements


-- Row 3: Blaine ROLLINS
-- shares: 7500.0, price: 20.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 7500.0, price_per_share = 20.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.legal_name) LIKE '%ROLLINS%' OR UPPER(i.legal_name) LIKE '%BLAINE%' OR UPPER(i.first_name) = 'BLAINE') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 4: Blaine ROLLINS
-- shares: 2500.0, price: 20.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 20.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.legal_name) LIKE '%ROLLINS%' OR UPPER(i.legal_name) LIKE '%BLAINE%' OR UPPER(i.first_name) = 'BLAINE') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 5: Laurence CHANG
-- shares: 5000.0, price: 20.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 5000.0, price_per_share = 20.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANG' OR UPPER(i.legal_name) LIKE '%CHANG%' OR UPPER(i.legal_name) LIKE '%LAURENCE%' OR UPPER(i.first_name) = 'LAURENCE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 6: Laurence CHANG
-- shares: 2500.0, price: 20.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 20.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANG' OR UPPER(i.legal_name) LIKE '%CHANG%' OR UPPER(i.legal_name) LIKE '%LAURENCE%' OR UPPER(i.first_name) = 'LAURENCE') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 7: Chang NGAN
-- shares: 5600.0, price: 18.0, amount: 100800.0
UPDATE subscriptions s
SET num_shares = 5600.0, price_per_share = 18.0, funded_amount = 100800.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'NGAN' OR UPPER(i.legal_name) LIKE '%NGAN%' OR UPPER(i.legal_name) LIKE '%CHANG%' OR UPPER(i.first_name) = 'CHANG') AND (s.commitment = 100800.0 OR s.funded_amount = 100800.0));

-- Row 8: SHEILA and KAMLESH MADHVANI
-- shares: 10000.0, price: 22.0, amount: 220000.0
UPDATE subscriptions s
SET num_shares = 10000.0, price_per_share = 22.0, funded_amount = 220000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH') AND (s.commitment = 220000.0 OR s.funded_amount = 220000.0));

-- Row 9: SAMIR KOHI
-- shares: 5000.0, price: 20.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 5000.0, price_per_share = 20.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOHI' OR UPPER(i.legal_name) LIKE '%KOHI%' OR UPPER(i.legal_name) LIKE '%SAMIR%' OR UPPER(i.first_name) = 'SAMIR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 10: Sheikh AL SABAH
-- shares: 2631.0, price: 19.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2631.0, price_per_share = 19.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH%' OR UPPER(i.first_name) = 'SHEIKH') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 11: Han CHIH-HENG
-- shares: 5555.0, price: 18.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 5555.0, price_per_share = 18.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHIH-HENG' OR UPPER(i.legal_name) LIKE '%CHIH-HENG%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 12: Rajiv AGARWALA
-- shares: 2500.0, price: 20.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 20.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AGARWALA' OR UPPER(i.legal_name) LIKE '%AGARWALA%' OR UPPER(i.legal_name) LIKE '%RAJIV%' OR UPPER(i.first_name) = 'RAJIV') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 13: Daphne CHANDRA
-- shares: 1756.0, price: 17.1, amount: 30040.0
UPDATE subscriptions s
SET num_shares = 1756.0, price_per_share = 17.1, funded_amount = 30040.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRA' OR UPPER(i.legal_name) LIKE '%CHANDRA%' OR UPPER(i.legal_name) LIKE '%DAPHNE%' OR UPPER(i.first_name) = 'DAPHNE') AND (s.commitment = 30040.0 OR s.funded_amount = 30040.0));

-- Row 14: Daryl YONGJIE
-- shares: 9167.0, price: 18.0, amount: 165006.0
UPDATE subscriptions s
SET num_shares = 9167.0, price_per_share = 18.0, funded_amount = 165006.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'YONGJIE' OR UPPER(i.legal_name) LIKE '%YONGJIE%' OR UPPER(i.legal_name) LIKE '%DARYL%' OR UPPER(i.first_name) = 'DARYL') AND (s.commitment = 165006.0 OR s.funded_amount = 165006.0));

-- Row 15: Ekkawat SAE-JEE
-- shares: 1388.0, price: 18.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 1388.0, price_per_share = 18.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAE-JEE' OR UPPER(i.legal_name) LIKE '%SAE-JEE%' OR UPPER(i.legal_name) LIKE '%EKKAWAT%' OR UPPER(i.first_name) = 'EKKAWAT') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 16: Tan GEOK
-- shares: 4448.0, price: 18.0, amount: 80064.0
UPDATE subscriptions s
SET num_shares = 4448.0, price_per_share = 18.0, funded_amount = 80064.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GEOK' OR UPPER(i.legal_name) LIKE '%GEOK%') AND (s.commitment = 80064.0 OR s.funded_amount = 80064.0));

-- Row 17: DALINGA HOLDING AG
-- shares: 2512.0, price: 19.9, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2512.0, price_per_share = 19.9, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 18: Matteo MARTINI
-- shares: 5025.0, price: 19.9, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 5025.0, price_per_share = 19.9, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MARTINI' OR UPPER(i.legal_name) LIKE '%MARTINI%' OR UPPER(i.legal_name) LIKE '%MATTEO%' OR UPPER(i.first_name) = 'MATTEO') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 19: Ammar SAHLI
-- shares: 11904.0, price: 21.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 11904.0, price_per_share = 21.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAHLI' OR UPPER(i.legal_name) LIKE '%SAHLI%' OR UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%' OR UPPER(i.legal_name) LIKE '%AMMAR%' OR UPPER(i.first_name) = 'AMMAR') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 20: OEP Ltd
-- shares: 11905.0, price: 21.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 11905.0, price_per_share = 21.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 21: MA GROUP AG
-- shares: 1507.0, price: 19.9, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 1507.0, price_per_share = 19.9, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%MA GROUP AG%') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 22: KRANA INVESTMENTS PTE. LTD.
-- shares: 13698.0, price: 21.9, amount: 300000.0
UPDATE subscriptions s
SET num_shares = 13698.0, price_per_share = 21.9, funded_amount = 300000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KRANA INVESTMENTS PTE. LTD.%') AND (s.commitment = 300000.0 OR s.funded_amount = 300000.0));

-- Row 23: Johann AKERMANN
-- shares: 10000.0, price: 22.52, amount: 225200.0
UPDATE subscriptions s
SET num_shares = 10000.0, price_per_share = 22.52, funded_amount = 225200.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%JOHANN%' OR UPPER(i.first_name) = 'JOHANN') AND (s.commitment = 225200.0 OR s.funded_amount = 225200.0));

-- Row 24: Sandra CABIAN
-- shares: 2512.0, price: 19.9, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2512.0, price_per_share = 19.9, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CABIAN' OR UPPER(i.legal_name) LIKE '%CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 25: Dario SCIMONE
-- shares: 2392.0, price: 20.9, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2392.0, price_per_share = 20.9, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.legal_name) LIKE '%SCIMONE%' OR UPPER(i.legal_name) LIKE '%DARIO%' OR UPPER(i.first_name) = 'DARIO') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 26: OFBR Trust
-- shares: 8880.0, price: 22.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8880.0, price_per_share = 22.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OFBR TRUST%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 27: Elidon Estate Inc
-- shares: 9132.0, price: 21.9, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 9132.0, price_per_share = 21.9, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ELIDON ESTATE INC%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 28: Adam Smith Singapore Pte Ltd
-- shares: 1141.0, price: 21.9, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 1141.0, price_per_share = 21.9, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ADAM SMITH SINGAPORE PTE LTD%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 29: Julien MACHOT
-- shares: 6142.0, price: 13.5, amount: 82917.0
UPDATE subscriptions s
SET num_shares = 6142.0, price_per_share = 13.5, funded_amount = 82917.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 82917.0 OR s.funded_amount = 82917.0));

-- Row 30: VERSO GROUP
-- shares: 6142.0, price: 13.5, amount: 82917.0
UPDATE subscriptions s
SET num_shares = 6142.0, price_per_share = 13.5, funded_amount = 82917.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 82917.0 OR s.funded_amount = 82917.0));

-- Row 31: Julien MACHOT
-- shares: 160.0, price: 14.0, amount: 2240.0
UPDATE subscriptions s
SET num_shares = 160.0, price_per_share = 14.0, funded_amount = 2240.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2240.0 OR s.funded_amount = 2240.0));

-- Row 32: VERSO GROUP
-- shares: 160.0, price: 14.0, amount: 2240.0
UPDATE subscriptions s
SET num_shares = 160.0, price_per_share = 14.0, funded_amount = 2240.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 2240.0 OR s.funded_amount = 2240.0));

-- Row 33: Mrs and Mr Beatrice & Marcel KNOPF
-- shares: 2220.0, price: 22.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2220.0, price_per_share = 22.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS AND MR BEATRICE & MARCEL%' OR UPPER(i.first_name) = 'MRS AND MR BEATRICE & MARCEL') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 34: VOLF Trust
-- shares: 11101.0, price: 22.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 11101.0, price_per_share = 22.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 35: Bahama Global Towers Limited
-- shares: 6500.0, price: 23.0, amount: 149500.0
UPDATE subscriptions s
SET num_shares = 6500.0, price_per_share = 23.0, funded_amount = 149500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BAHAMA GLOBAL TOWERS LIMITED%') AND (s.commitment = 149500.0 OR s.funded_amount = 149500.0));

-- Row 36: CAUSE FIRST Holdings Ltd
-- shares: 4440.0, price: 22.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4440.0, price_per_share = 22.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CAUSE FIRST HOLDINGS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 37: Heinz & Barbara WINZ
-- shares: 4440.0, price: 22.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4440.0, price_per_share = 22.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%HEINZ & BARBARA%' OR UPPER(i.first_name) = 'HEINZ & BARBARA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 38: Sabrina WINZ
-- shares: 2220.0, price: 22.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2220.0, price_per_share = 22.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%SABRINA%' OR UPPER(i.first_name) = 'SABRINA') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 39: Mrs and Mr KARKUN
-- shares: 2272.0, price: 22.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2272.0, price_per_share = 22.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%KARKUN%' OR UPPER(i.legal_name) LIKE '%MRS AND MR%' OR UPPER(i.first_name) = 'MRS AND MR') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 40: Craig BROWN
-- shares: 2500.0, price: 20.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 20.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROWN' OR UPPER(i.legal_name) LIKE '%BROWN%' OR UPPER(i.legal_name) LIKE '%CRAIG%' OR UPPER(i.first_name) = 'CRAIG') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 41: TRUE INVESTMENTS 4 LLC
-- shares: 32631.0, price: 19.0, amount: 619989.0
UPDATE subscriptions s
SET num_shares = 32631.0, price_per_share = 19.0, funded_amount = 619989.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TRUE INVESTMENTS 4 LLC%') AND (s.commitment = 619989.0 OR s.funded_amount = 619989.0));

-- Row 42: ROSEN INVEST HOLDINGS Inc
-- shares: 4440.0, price: 22.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4440.0, price_per_share = 22.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 43: Mrs & Mr Subbiah SUBRAMANIAN
-- shares: 6733.0, price: 23.02, amount: 155000.0
UPDATE subscriptions s
SET num_shares = 6733.0, price_per_share = 23.02, funded_amount = 155000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS & MR SUBBIAH') AND (s.commitment = 155000.0 OR s.funded_amount = 155000.0));

-- Row 44: JIMENEZ TRADING INC
-- shares: 212600.0, price: 23.52, amount: 5000352.0
UPDATE subscriptions s
SET num_shares = 212600.0, price_per_share = 23.52, funded_amount = 5000352.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%JIMENEZ TRADING INC%') AND (s.commitment = 5000352.0 OR s.funded_amount = 5000352.0));

-- Row 45: Atima HARALALKA
-- shares: 2631.0, price: 19.0, amount: 49989.0
UPDATE subscriptions s
SET num_shares = 2631.0, price_per_share = 19.0, funded_amount = 49989.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARALALKA' OR UPPER(i.legal_name) LIKE '%HARALALKA%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%ATIMA%' OR UPPER(i.first_name) = 'ATIMA') AND (s.commitment = 49989.0 OR s.funded_amount = 49989.0));

-- Row 46: Ekta DATT
-- shares: 1315.0, price: 19.0, amount: 24985.0
UPDATE subscriptions s
SET num_shares = 1315.0, price_per_share = 19.0, funded_amount = 24985.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DATT' OR UPPER(i.legal_name) LIKE '%DATT%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%EKTA%' OR UPPER(i.first_name) = 'EKTA') AND (s.commitment = 24985.0 OR s.funded_amount = 24985.0));

-- Row 47: Mohamad BIN MOHAMED
-- shares: 10526.0, price: 19.0, amount: 199994.0
UPDATE subscriptions s
SET num_shares = 10526.0, price_per_share = 19.0, funded_amount = 199994.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BIN MOHAMED' OR UPPER(i.legal_name) LIKE '%BIN MOHAMED%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%MOHAMAD%' OR UPPER(i.first_name) = 'MOHAMAD') AND (s.commitment = 199994.0 OR s.funded_amount = 199994.0));

-- Row 48: Nidhi GANERIWALA
-- shares: 1842.0, price: 19.0, amount: 34998.0
UPDATE subscriptions s
SET num_shares = 1842.0, price_per_share = 19.0, funded_amount = 34998.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GANERIWALA' OR UPPER(i.legal_name) LIKE '%GANERIWALA%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%NIDHI%' OR UPPER(i.first_name) = 'NIDHI') AND (s.commitment = 34998.0 OR s.funded_amount = 34998.0));

-- Row 49: PANT Investments Inc
-- shares: 5263.0, price: 19.0, amount: 99997.0
UPDATE subscriptions s
SET num_shares = 5263.0, price_per_share = 19.0, funded_amount = 99997.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%PANT INVESTMENTS INC%') AND (s.commitment = 99997.0 OR s.funded_amount = 99997.0));

-- Row 50: Rajesh SUD
-- shares: 2631.0, price: 19.0, amount: 49989.0
UPDATE subscriptions s
SET num_shares = 2631.0, price_per_share = 19.0, funded_amount = 49989.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUD' OR UPPER(i.legal_name) LIKE '%SUD%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RAJESH%' OR UPPER(i.first_name) = 'RAJESH') AND (s.commitment = 49989.0 OR s.funded_amount = 49989.0));

-- Row 51: Rajiv KAPOOR
-- shares: 2631.0, price: 19.0, amount: 49989.0
UPDATE subscriptions s
SET num_shares = 2631.0, price_per_share = 19.0, funded_amount = 49989.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KAPOOR' OR UPPER(i.legal_name) LIKE '%KAPOOR%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RAJIV%' OR UPPER(i.first_name) = 'RAJIV') AND (s.commitment = 49989.0 OR s.funded_amount = 49989.0));

-- Row 52: Rasika KULKARNI
-- shares: 1315.0, price: 19.0, amount: 24985.0
UPDATE subscriptions s
SET num_shares = 1315.0, price_per_share = 19.0, funded_amount = 24985.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KULKARNI' OR UPPER(i.legal_name) LIKE '%KULKARNI%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RASIKA%' OR UPPER(i.first_name) = 'RASIKA') AND (s.commitment = 24985.0 OR s.funded_amount = 24985.0));

-- Row 53: Julien MACHOT
-- shares: 21834.0, price: 16.0, amount: 349344.0
UPDATE subscriptions s
SET num_shares = 21834.0, price_per_share = 16.0, funded_amount = 349344.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 349344.0 OR s.funded_amount = 349344.0));

-- Row 54: VERSO GROUP
-- shares: 21834.0, price: 16.0, amount: 349344.0
UPDATE subscriptions s
SET num_shares = 21834.0, price_per_share = 16.0, funded_amount = 349344.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 349344.0 OR s.funded_amount = 349344.0));

-- Row 55: Aaron RIKHYE
-- shares: 4252.0, price: 23.52, amount: 100007.04
UPDATE subscriptions s
SET num_shares = 4252.0, price_per_share = 23.52, funded_amount = 100007.04
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIKHYE' OR UPPER(i.legal_name) LIKE '%RIKHYE%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%AARON%' OR UPPER(i.first_name) = 'AARON') AND (s.commitment = 100007.04 OR s.funded_amount = 100007.04));

-- Row 56: Lakin HARIA
-- shares: 1062.0, price: 23.52, amount: 24978.24
UPDATE subscriptions s
SET num_shares = 1062.0, price_per_share = 23.52, funded_amount = 24978.24
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARIA' OR UPPER(i.legal_name) LIKE '%HARIA%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%LAKIN%' OR UPPER(i.first_name) = 'LAKIN') AND (s.commitment = 24978.24 OR s.funded_amount = 24978.24));

-- Row 57: Sheetal HARIA
-- shares: 1062.0, price: 23.52, amount: 24978.24
UPDATE subscriptions s
SET num_shares = 1062.0, price_per_share = 23.52, funded_amount = 24978.24
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARIA' OR UPPER(i.legal_name) LIKE '%HARIA%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%SHEETAL%' OR UPPER(i.first_name) = 'SHEETAL') AND (s.commitment = 24978.24 OR s.funded_amount = 24978.24));

-- Row 58: Tapan SHAH
-- shares: 1062.0, price: 23.52, amount: 24978.24
UPDATE subscriptions s
SET num_shares = 1062.0, price_per_share = 23.52, funded_amount = 24978.24
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%TAPAN%' OR UPPER(i.first_name) = 'TAPAN') AND (s.commitment = 24978.24 OR s.funded_amount = 24978.24));

-- Row 59: ONC Limited
-- shares: 212585.0, price: 23.52, amount: 4999999.2
UPDATE subscriptions s
SET num_shares = 212585.0, price_per_share = 23.52, funded_amount = 4999999.2
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ONC LIMITED%') AND (s.commitment = 4999999.2 OR s.funded_amount = 4999999.2));

-- Row 60: Mohammed AL ABBASI
-- shares: 12700.0, price: 19.0, amount: 241300.0
UPDATE subscriptions s
SET num_shares = 12700.0, price_per_share = 19.0, funded_amount = 241300.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AL ABBASI' OR UPPER(i.legal_name) LIKE '%AL ABBASI%' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.first_name) = 'MOHAMMED') AND (s.commitment = 241300.0 OR s.funded_amount = 241300.0));

-- Row 61: Patrick CORR
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CORR' OR UPPER(i.legal_name) LIKE '%CORR%' OR UPPER(i.legal_name) LIKE '%PATRICK%' OR UPPER(i.first_name) = 'PATRICK') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 62: Stephen JORDAN
-- shares: 6802.0, price: 23.52, amount: 160000.0
UPDATE subscriptions s
SET num_shares = 6802.0, price_per_share = 23.52, funded_amount = 160000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JORDAN' OR UPPER(i.legal_name) LIKE '%JORDAN%' OR UPPER(i.legal_name) LIKE '%STEPHEN%' OR UPPER(i.first_name) = 'STEPHEN') AND (s.commitment = 160000.0 OR s.funded_amount = 160000.0));

-- Row 63: FigTree Family Office Ltd
-- shares: 15306.0, price: 23.52, amount: 360000.0
UPDATE subscriptions s
SET num_shares = 15306.0, price_per_share = 23.52, funded_amount = 360000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%') AND (s.commitment = 360000.0 OR s.funded_amount = 360000.0));

-- Row 64: Oliver WRIGHT
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.legal_name) LIKE '%WRIGHT%' OR UPPER(i.legal_name) LIKE '%OLIVER%' OR UPPER(i.first_name) = 'OLIVER') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 65: Emile VAN DEN BOL
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.legal_name) LIKE '%VAN DEN BOL%' OR UPPER(i.legal_name) LIKE '%EMILE%' OR UPPER(i.first_name) = 'EMILE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 66: Mark MATTHEWS
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 67: Matthew HAYCOX
-- shares: 3188.0, price: 23.52, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 3188.0, price_per_share = 23.52, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.legal_name) LIKE '%HAYCOX%' OR UPPER(i.legal_name) LIKE '%MATTHEW%' OR UPPER(i.first_name) = 'MATTHEW') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 68: John ACKERLEY
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.legal_name) LIKE '%ACKERLEY%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 69: Steve MANNING
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MANNING' OR UPPER(i.legal_name) LIKE '%MANNING%' OR UPPER(i.legal_name) LIKE '%STEVE%' OR UPPER(i.first_name) = 'STEVE') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 70: Global Custody & Clearing Limited
-- shares: 60150.0, price: 23.52, amount: 1414728.0
UPDATE subscriptions s
SET num_shares = 60150.0, price_per_share = 23.52, funded_amount = 1414728.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%') AND (s.commitment = 1414728.0 OR s.funded_amount = 1414728.0));

-- Row 71: Gregory BROOKS
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROOKS' OR UPPER(i.legal_name) LIKE '%BROOKS%' OR UPPER(i.legal_name) LIKE '%GREGORY%' OR UPPER(i.first_name) = 'GREGORY') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 72: Innovatech 1
-- shares: 38881.0, price: 23.52, amount: 914481.12
UPDATE subscriptions s
SET num_shares = 38881.0, price_per_share = 23.52, funded_amount = 914481.12
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%INNOVATECH 1%') AND (s.commitment = 914481.12 OR s.funded_amount = 914481.12));

-- Row 73: Stephane DAHAN
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%DAHAN%' OR UPPER(i.legal_name) LIKE '%STEPHANE%' OR UPPER(i.first_name) = 'STEPHANE') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 74: Jean DUTIL
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUTIL' OR UPPER(i.legal_name) LIKE '%DUTIL%' OR UPPER(i.legal_name) LIKE '%JEAN%' OR UPPER(i.first_name) = 'JEAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 75: Barnaby MOORE
-- shares: 6550.0, price: 22.9, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 6550.0, price_per_share = 22.9, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MOORE' OR UPPER(i.legal_name) LIKE '%MOORE%' OR UPPER(i.legal_name) LIKE '%BARNABY%' OR UPPER(i.first_name) = 'BARNABY') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 76: Julien MACHOT
-- shares: 2125.0, price: 16.0, amount: 34000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 16.0, funded_amount = 34000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 34000.0 OR s.funded_amount = 34000.0));

-- Row 77: Sudon Carlop Holdings Limited
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 78: Lesli SCHUTTE
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.legal_name) LIKE '%SCHUTTE%' OR UPPER(i.legal_name) LIKE '%LESLI%' OR UPPER(i.first_name) = 'LESLI') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 79: Manraj SEKHON
-- shares: 17006.0, price: 23.52, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 17006.0, price_per_share = 23.52, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 80: IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust
-- shares: 17006.0, price: 23.52, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 17006.0, price_per_share = 23.52, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED AS TRUSTEE OF THE RAYCAT INVESTMENT TRUST%') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 81: Serge RICHARD
-- shares: 425.0, price: 23.52, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 425.0, price_per_share = 23.52, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RICHARD' OR UPPER(i.legal_name) LIKE '%RICHARD%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 82: Erich GRAF
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 83: TERRA Financial & Management Services SA
-- shares: 1332.0, price: 22.52, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 1332.0, price_per_share = 22.52, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 84: Shana NUSSBERGER
-- shares: 7227.0, price: 23.52, amount: 170000.0
UPDATE subscriptions s
SET num_shares = 7227.0, price_per_share = 23.52, funded_amount = 170000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'NUSSBERGER' OR UPPER(i.legal_name) LIKE '%NUSSBERGER%' OR UPPER(i.legal_name) LIKE '%SHANA%' OR UPPER(i.first_name) = 'SHANA') AND (s.commitment = 170000.0 OR s.funded_amount = 170000.0));

-- Row 85: JASSQ HOLDING LIMITED
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 86: INNOSIGHT VENTURES Pte Ltd
-- shares: 25000.0, price: 23.52, amount: 588000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 23.52, funded_amount = 588000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (1=0);

-- Row 87: INNOSIGHT VENTURES Pte Ltd
-- shares: 7000.0, price: 23.52, amount: 164640.0
UPDATE subscriptions s
SET num_shares = 7000.0, price_per_share = 23.52, funded_amount = 164640.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (1=0);

-- Row 88: GORILLA PE Inc
-- shares: 637755.0, price: 23.52, amount: 14999997.6
UPDATE subscriptions s
SET num_shares = 637755.0, price_per_share = 23.52, funded_amount = 14999997.6
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GORILLA PE INC%') AND (s.commitment = 14999997.6 OR s.funded_amount = 14999997.6));

-- Row 89: Mark EVANS
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'EVANS' OR UPPER(i.legal_name) LIKE '%EVANS%' OR UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LTD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 90: David HOLDEN
-- shares: 6377.0, price: 23.52, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 6377.0, price_per_share = 23.52, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%HOLDEN%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 91: Julien MACHOT
-- shares: 68000.0, price: 20.0, amount: 1360000.0
UPDATE subscriptions s
SET num_shares = 68000.0, price_per_share = 20.0, funded_amount = 1360000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 1360000.0 OR s.funded_amount = 1360000.0));

-- Row 92: VERSO GROUP
-- shares: 4547.0, price: 20.0, amount: 90940.0
UPDATE subscriptions s
SET num_shares = 4547.0, price_per_share = 20.0, funded_amount = 90940.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 90940.0 OR s.funded_amount = 90940.0));

-- Row 93: Imrat HAYAT
-- shares: 10000.0, price: 24.52, amount: 245200.0
UPDATE subscriptions s
SET num_shares = 10000.0, price_per_share = 24.52, funded_amount = 245200.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYAT' OR UPPER(i.legal_name) LIKE '%HAYAT%' OR UPPER(i.legal_name) LIKE '%IMRAT%' OR UPPER(i.first_name) = 'IMRAT') AND (s.commitment = 245200.0 OR s.funded_amount = 245200.0));

-- Row 94: Julien MACHOT
-- shares: 1546.0, price: 16.0, amount: 24736.0
UPDATE subscriptions s
SET num_shares = 1546.0, price_per_share = 16.0, funded_amount = 24736.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 24736.0 OR s.funded_amount = 24736.0));

-- Row 95: VERSO GROUP
-- shares: 1546.0, price: 16.0, amount: 24736.0
UPDATE subscriptions s
SET num_shares = 1546.0, price_per_share = 16.0, funded_amount = 24736.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 24736.0 OR s.funded_amount = 24736.0));

-- Row 96: Julien MACHOT
-- shares: 1980.0, price: 16.0, amount: 31680.0
UPDATE subscriptions s
SET num_shares = 1980.0, price_per_share = 16.0, funded_amount = 31680.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 31680.0 OR s.funded_amount = 31680.0));

-- Row 97: VERSO GROUP
-- shares: 1980.0, price: 16.0, amount: 31680.0
UPDATE subscriptions s
SET num_shares = 1980.0, price_per_share = 16.0, funded_amount = 31680.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 31680.0 OR s.funded_amount = 31680.0));

-- Row 98: Julien MACHOT
-- shares: 5291.0, price: 14.0, amount: 74074.0
UPDATE subscriptions s
SET num_shares = 5291.0, price_per_share = 14.0, funded_amount = 74074.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 74074.0 OR s.funded_amount = 74074.0));

-- Row 99: VERSO GROUP
-- shares: 5291.0, price: 14.0, amount: 74074.0
UPDATE subscriptions s
SET num_shares = 5291.0, price_per_share = 14.0, funded_amount = 74074.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%') AND (s.commitment = 74074.0 OR s.funded_amount = 74074.0));

-- Row 100: David BACHELIER
-- shares: 5314.0, price: 23.52, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 5314.0, price_per_share = 23.52, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BACHELIER' OR UPPER(i.legal_name) LIKE '%BACHELIER%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 101: Talal PASHA
-- shares: 452.0, price: 16.0, amount: 7236.0
UPDATE subscriptions s
SET num_shares = 452.0, price_per_share = 16.0, funded_amount = 7236.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PASHA' OR UPPER(i.legal_name) LIKE '%PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL') AND (s.commitment = 7236.0 OR s.funded_amount = 7236.0));

-- Row 102: Ashish KOTHARI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOTHARI' OR UPPER(i.legal_name) LIKE '%KOTHARI%' OR UPPER(i.legal_name) LIKE '%ASHISH%' OR UPPER(i.first_name) = 'ASHISH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 103: Fabien ROTH
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROTH' OR UPPER(i.legal_name) LIKE '%ROTH%' OR UPPER(i.legal_name) LIKE '%FABIEN%' OR UPPER(i.first_name) = 'FABIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 104: Fawad MUKHTAR
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MUKHTAR' OR UPPER(i.legal_name) LIKE '%MUKHTAR%' OR UPPER(i.legal_name) LIKE '%FAWAD%' OR UPPER(i.first_name) = 'FAWAD') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 105: KABELLA LTD
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KABELLA LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 106: SOUTH SOUND LTD
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 107: Constantin-Octavian PATRASCU
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.legal_name) LIKE '%PATRASCU%' OR UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%' OR UPPER(i.first_name) = 'CONSTANTIN-OCTAVIAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 108: Mayuriben JOGANI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 109: CINCORIA LIMITED
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CINCORIA LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 110: Hayden RUSHTON
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.legal_name) LIKE '%RUSHTON%' OR UPPER(i.legal_name) LIKE '%HAYDEN%' OR UPPER(i.first_name) = 'HAYDEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 111: Mrs Nalini Yoga & Mr Aran James WILLETTS
-- shares: 5314.0, price: 23.52, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 5314.0, price_per_share = 23.52, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WILLETTS' OR UPPER(i.legal_name) LIKE '%WILLETTS%' OR UPPER(i.legal_name) LIKE '%MRS NALINI YOGA & MR ARAN JAMES%' OR UPPER(i.first_name) = 'MRS NALINI YOGA & MR ARAN JAMES') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 112: Emma Graham-Taylor & Gregory SOMMERVILLE
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SOMMERVILLE' OR UPPER(i.legal_name) LIKE '%SOMMERVILLE%' OR UPPER(i.legal_name) LIKE '%EMMA GRAHAM-TAYLOR & GREGORY%' OR UPPER(i.first_name) = 'EMMA GRAHAM-TAYLOR & GREGORY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 113: Rabin D. and Dolly LAI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LAI' OR UPPER(i.legal_name) LIKE '%LAI%' OR UPPER(i.legal_name) LIKE '%RABIN D. AND DOLLY%' OR UPPER(i.first_name) = 'RABIN D. AND DOLLY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 114: Kim LUND
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LUND' OR UPPER(i.legal_name) LIKE '%LUND%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 115: Ivan BELGA
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BELGA' OR UPPER(i.legal_name) LIKE '%BELGA%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 116: Ayman JOMAA
-- shares: 12755.0, price: 23.52, amount: 300000.0
UPDATE subscriptions s
SET num_shares = 12755.0, price_per_share = 23.52, funded_amount = 300000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOMAA' OR UPPER(i.legal_name) LIKE '%JOMAA%' OR UPPER(i.legal_name) LIKE '%AYMAN%' OR UPPER(i.first_name) = 'AYMAN') AND (s.commitment = 300000.0 OR s.funded_amount = 300000.0));

-- Row 117: Karthic JAYARAMAN
-- shares: 17006.0, price: 23.52, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 17006.0, price_per_share = 23.52, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAYARAMAN' OR UPPER(i.legal_name) LIKE '%JAYARAMAN%' OR UPPER(i.legal_name) LIKE '%KARTHIC%' OR UPPER(i.first_name) = 'KARTHIC') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 118: Imran HAKIM
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAKIM' OR UPPER(i.legal_name) LIKE '%HAKIM%' OR UPPER(i.legal_name) LIKE '%IMRAN%' OR UPPER(i.first_name) = 'IMRAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 119: Kenilworth Ltd
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KENILWORTH LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 120: Adil KHAWAJA
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KHAWAJA' OR UPPER(i.legal_name) LIKE '%KHAWAJA%' OR UPPER(i.legal_name) LIKE '%ADIL%' OR UPPER(i.first_name) = 'ADIL') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 121: Bharat JATANIA
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JATANIA' OR UPPER(i.legal_name) LIKE '%JATANIA%' OR UPPER(i.legal_name) LIKE '%BHARAT%' OR UPPER(i.first_name) = 'BHARAT') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 122: Lubna QUNASH
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'QUNASH' OR UPPER(i.legal_name) LIKE '%QUNASH%' OR UPPER(i.legal_name) LIKE '%LUBNA%' OR UPPER(i.first_name) = 'LUBNA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 123: Bank SYZ AG
-- shares: 198193.0, price: 23.52, amount: 4661508.64
UPDATE subscriptions s
SET num_shares = 198193.0, price_per_share = 23.52, funded_amount = 4661508.64
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 4661508.64 OR s.funded_amount = 4661508.64));

-- Row 124: Bank SYZ AG
-- shares: 2674.0, price: 23.52, amount: 62892.48
UPDATE subscriptions s
SET num_shares = 2674.0, price_per_share = 23.52, funded_amount = 62892.48
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 62892.48 OR s.funded_amount = 62892.48));

-- Row 125: Bank SYZ AG
-- shares: 1546.0, price: 23.52, amount: 36361.92
UPDATE subscriptions s
SET num_shares = 1546.0, price_per_share = 23.52, funded_amount = 36361.92
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 36361.92 OR s.funded_amount = 36361.92));

-- Row 126: Bank SYZ AG
-- shares: 1980.0, price: 23.52, amount: 46569.6
UPDATE subscriptions s
SET num_shares = 1980.0, price_per_share = 23.52, funded_amount = 46569.6
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 46569.6 OR s.funded_amount = 46569.6));

-- Row 127: Bank SYZ AG
-- shares: 5291.0, price: 23.52, amount: 124444.32
UPDATE subscriptions s
SET num_shares = 5291.0, price_per_share = 23.52, funded_amount = 124444.32
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 124444.32 OR s.funded_amount = 124444.32));

-- Row 128: Bank SYZ AG
-- shares: 160.0, price: 23.52, amount: 3763.2
UPDATE subscriptions s
SET num_shares = 160.0, price_per_share = 23.52, funded_amount = 3763.2
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 3763.2 OR s.funded_amount = 3763.2));

-- Row 129: Bank SYZ AG
-- shares: 5502.0, price: 23.52, amount: 129407.04
UPDATE subscriptions s
SET num_shares = 5502.0, price_per_share = 23.52, funded_amount = 129407.04
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 129407.04 OR s.funded_amount = 129407.04));

-- Row 130: Bank SYZ AG
-- shares: 640.0, price: 23.52, amount: 15052.8
UPDATE subscriptions s
SET num_shares = 640.0, price_per_share = 23.52, funded_amount = 15052.8
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%') AND (s.commitment = 15052.8 OR s.funded_amount = 15052.8));

-- Row 131: Damien KRAUSER
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KRAUSER' OR UPPER(i.legal_name) LIKE '%KRAUSER%' OR UPPER(i.legal_name) LIKE '%DAMIEN%' OR UPPER(i.first_name) = 'DAMIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 132: Bright Phoenix Holdings Limited
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 133: Michel GUERIN
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GUERIN' OR UPPER(i.legal_name) LIKE '%GUERIN%' OR UPPER(i.legal_name) LIKE '%MICHEL%' OR UPPER(i.first_name) = 'MICHEL') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 134: Eric LE SEIGNEUR
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%LE SEIGNEUR%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 135: Swip Holdings Ltd
-- shares: 6377.0, price: 23.52, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 6377.0, price_per_share = 23.52, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SWIP HOLDINGS LTD%') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 136: Phaena Advisory Ltd
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%PHAENA ADVISORY LTD%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 137: Bhikhu PATEL
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%PATEL%' OR UPPER(i.legal_name) LIKE '%BHIKHU%' OR UPPER(i.first_name) = 'BHIKHU') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 138: Vijaykumar PATEL
-- shares: 31887.0, price: 23.52, amount: 750000.0
UPDATE subscriptions s
SET num_shares = 31887.0, price_per_share = 23.52, funded_amount = 750000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%PATEL%' OR UPPER(i.legal_name) LIKE '%VIJAYKUMAR%' OR UPPER(i.first_name) = 'VIJAYKUMAR') AND (s.commitment = 750000.0 OR s.funded_amount = 750000.0));

-- Row 139: POTASSIUM Capital
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 140: Aatif HASSAN
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HASSAN' OR UPPER(i.legal_name) LIKE '%HASSAN%' OR UPPER(i.legal_name) LIKE '%AATIF%' OR UPPER(i.first_name) = 'AATIF') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 141: Kevin WILTSHIRE
-- shares: 3188.0, price: 23.52, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 3188.0, price_per_share = 23.52, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WILTSHIRE' OR UPPER(i.legal_name) LIKE '%WILTSHIRE%' OR UPPER(i.legal_name) LIKE '%KEVIN%' OR UPPER(i.first_name) = 'KEVIN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 142: GTV Partners SA
-- shares: 20391.0, price: 24.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 20391.0, price_per_share = 24.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 143: LENN Participations SARL
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 144: WEALTH TRAIN LIMITED
-- shares: 19132.0, price: 23.52, amount: 450000.0
UPDATE subscriptions s
SET num_shares = 19132.0, price_per_share = 23.52, funded_amount = 450000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%') AND (s.commitment = 450000.0 OR s.funded_amount = 450000.0));

-- Row 145: Anke RICE
-- shares: 3863.0, price: 22.0, amount: 85000.0
UPDATE subscriptions s
SET num_shares = 3863.0, price_per_share = 22.0, funded_amount = 85000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RICE' OR UPPER(i.legal_name) LIKE '%RICE%' OR UPPER(i.legal_name) LIKE '%ANKE%' OR UPPER(i.first_name) = 'ANKE') AND (s.commitment = 85000.0 OR s.funded_amount = 85000.0));

-- Row 146: TERSANE INTERNATIONAL LTD
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TERSANE INTERNATIONAL LTD%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 147: Brahma Finance (BVI) Ltd
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BRAHMA FINANCE (BVI) LTD%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 148: James HARTSHORN
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARTSHORN' OR UPPER(i.legal_name) LIKE '%HARTSHORN%' OR UPPER(i.legal_name) LIKE '%JAMES%' OR UPPER(i.first_name) = 'JAMES') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 149: Murat Cem and Mehmet Can GOKER
-- shares: 14880.0, price: 23.52, amount: 350000.0
UPDATE subscriptions s
SET num_shares = 14880.0, price_per_share = 23.52, funded_amount = 350000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%' OR UPPER(i.first_name) = 'MURAT CEM AND MEHMET CAN') AND (s.commitment = 350000.0 OR s.funded_amount = 350000.0));

-- Row 150: Cyrus ALAMOUTI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%ALAMOUTI%' OR UPPER(i.legal_name) LIKE '%CYRUS%' OR UPPER(i.first_name) = 'CYRUS') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 151: Darius ALAMOUTI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%ALAMOUTI%' OR UPPER(i.legal_name) LIKE '%DARIUS%' OR UPPER(i.first_name) = 'DARIUS') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 152: Kaveh ALAMOUTI
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%ALAMOUTI%' OR UPPER(i.legal_name) LIKE '%KAVEH%' OR UPPER(i.first_name) = 'KAVEH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 153: Caspian Enterprises Limited
-- shares: 42517.0, price: 23.52, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 42517.0, price_per_share = 23.52, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 154: Rensburg Client Nominees Limited A/c CLT
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%RENSBURG CLIENT NOMINEES LIMITED A/C CLT%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 155: DCMS Holdings Limited
-- shares: 17006.0, price: 23.52, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 17006.0, price_per_share = 23.52, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%DCMS HOLDINGS LIMITED%') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 156: GELIGA LIMITED
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GELIGA LIMITED%' OR UPPER(i.legal_name) LIKE '%(ANTON)%' OR UPPER(i.first_name) = '(ANTON)') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 157: Eric SARASIN
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SARASIN' OR UPPER(i.legal_name) LIKE '%SARASIN%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 158: Damien KRAUSER
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KRAUSER' OR UPPER(i.legal_name) LIKE '%KRAUSER%' OR UPPER(i.legal_name) LIKE '%DAMIEN%' OR UPPER(i.first_name) = 'DAMIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 159: Eric LE SEIGNEUR
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%LE SEIGNEUR%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 160: Scott FLETCHER
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 161: REVERY CAPITAL Limited
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 162: Sandra KOHLER CABIAN
-- shares: 2125.0, price: 23.52, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 163: Maria Christina CHANDRIS
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRIS' OR UPPER(i.legal_name) LIKE '%CHANDRIS%' OR UPPER(i.legal_name) LIKE '%MARIA CHRISTINA%' OR UPPER(i.first_name) = 'MARIA CHRISTINA') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 164: Dimitri CHANDRIS
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRIS' OR UPPER(i.legal_name) LIKE '%CHANDRIS%' OR UPPER(i.legal_name) LIKE '%DIMITRI%' OR UPPER(i.first_name) = 'DIMITRI') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 165: Nicki ASQUITH
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ASQUITH' OR UPPER(i.legal_name) LIKE '%ASQUITH%' OR UPPER(i.legal_name) LIKE '%NICKI%' OR UPPER(i.first_name) = 'NICKI') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 166: Isabella CHANDRIS
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRIS' OR UPPER(i.legal_name) LIKE '%CHANDRIS%' OR UPPER(i.legal_name) LIKE '%ISABELLA%' OR UPPER(i.first_name) = 'ISABELLA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 167: Martin AVETISYAN
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AVETISYAN' OR UPPER(i.legal_name) LIKE '%AVETISYAN%' OR UPPER(i.legal_name) LIKE '%MARTIN%' OR UPPER(i.first_name) = 'MARTIN') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 168: Herve STEIMES
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'STEIMES' OR UPPER(i.legal_name) LIKE '%STEIMES%' OR UPPER(i.legal_name) LIKE '%HERVE%' OR UPPER(i.first_name) = 'HERVE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 169: Julien SERRA
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SERRA' OR UPPER(i.legal_name) LIKE '%SERRA%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 170: Frederic SAMAMA
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%SAMAMA%' OR UPPER(i.legal_name) LIKE '%FREDERIC%' OR UPPER(i.first_name) = 'FREDERIC') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 171: Denis MATTHEY
-- shares: 23870.0, price: 23.52, amount: 561423.0
UPDATE subscriptions s
SET num_shares = 23870.0, price_per_share = 23.52, funded_amount = 561423.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS') AND (s.commitment = 561423.0 OR s.funded_amount = 561423.0));

-- Row 172: SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 173: Laurent CUDRE-MAUROUX
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CUDRE-MAUROUX' OR UPPER(i.legal_name) LIKE '%CUDRE-MAUROUX%' OR UPPER(i.legal_name) LIKE '%LAURENT%' OR UPPER(i.first_name) = 'LAURENT') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 174: Georges CYTRON
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYTRON' OR UPPER(i.legal_name) LIKE '%CYTRON%' OR UPPER(i.legal_name) LIKE '%GEORGES%' OR UPPER(i.first_name) = 'GEORGES') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 175: Rosario RIENZO
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIENZO' OR UPPER(i.legal_name) LIKE '%RIENZO%' OR UPPER(i.legal_name) LIKE '%ROSARIO%' OR UPPER(i.first_name) = 'ROSARIO') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 176: Raphael GHESQUIERES
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GHESQUIERES' OR UPPER(i.legal_name) LIKE '%GHESQUIERES%' OR UPPER(i.legal_name) LIKE '%RAPHAEL%' OR UPPER(i.first_name) = 'RAPHAEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 177: Guillaume SAMAMA
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%SAMAMA%' OR UPPER(i.legal_name) LIKE '%GUILLAUME%' OR UPPER(i.first_name) = 'GUILLAUME') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 178: David ROSSIER
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROSSIER' OR UPPER(i.legal_name) LIKE '%ROSSIER%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 179: MARSAULT INTERNATIONAL LTD
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%MARSAULT INTERNATIONAL LTD%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 180: Bernard DUFAURE
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUFAURE' OR UPPER(i.legal_name) LIKE '%DUFAURE%' OR UPPER(i.legal_name) LIKE '%BERNARD%' OR UPPER(i.first_name) = 'BERNARD') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 181: Murat Cem and Mehmet Can GOKER
-- shares: 27636.0, price: 23.52, amount: 650000.0
UPDATE subscriptions s
SET num_shares = 27636.0, price_per_share = 23.52, funded_amount = 650000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%' OR UPPER(i.first_name) = 'MURAT CEM AND MEHMET CAN') AND (s.commitment = 650000.0 OR s.funded_amount = 650000.0));

-- Row 182: Scott FLETCHER
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 183: Vasily SUKHOTIN
-- shares: 25510.0, price: 23.52, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 25510.0, price_per_share = 23.52, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUKHOTIN' OR UPPER(i.legal_name) LIKE '%SUKHOTIN%' OR UPPER(i.legal_name) LIKE '%VASILY%' OR UPPER(i.first_name) = 'VASILY') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Row 184: Charles DE BAVIER
-- shares: 8503.0, price: 23.52, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 8503.0, price_per_share = 23.52, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 185: Charles RIVA
-- shares: 21258.0, price: 23.52, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 21258.0, price_per_share = 23.52, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIVA' OR UPPER(i.legal_name) LIKE '%RIVA%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 186: Jeremie CYROT
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYROT' OR UPPER(i.legal_name) LIKE '%CYROT%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 187: Hossien JAVID
-- shares: 2125.0, price: 23.52, amount: 49980.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 49980.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%JAVID%' OR UPPER(i.legal_name) LIKE '%HOSSIEN%' OR UPPER(i.first_name) = 'HOSSIEN') AND (s.commitment = 49980.0 OR s.funded_amount = 49980.0));

-- Row 188: Kamyar BADII
-- shares: 850.0, price: 23.52, amount: 19992.0
UPDATE subscriptions s
SET num_shares = 850.0, price_per_share = 23.52, funded_amount = 19992.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BADII' OR UPPER(i.legal_name) LIKE '%BADII%' OR UPPER(i.legal_name) LIKE '%KAMYAR%' OR UPPER(i.first_name) = 'KAMYAR') AND (s.commitment = 19992.0 OR s.funded_amount = 19992.0));

-- Row 189: Shaham SOLOUKI
-- shares: 2125.0, price: 23.52, amount: 49980.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 49980.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SOLOUKI' OR UPPER(i.legal_name) LIKE '%SOLOUKI%' OR UPPER(i.legal_name) LIKE '%SHAHAM%' OR UPPER(i.first_name) = 'SHAHAM') AND (s.commitment = 49980.0 OR s.funded_amount = 49980.0));

-- Row 190: Kian JAVID
-- shares: 1062.0, price: 23.52, amount: 24978.24
UPDATE subscriptions s
SET num_shares = 1062.0, price_per_share = 23.52, funded_amount = 24978.24
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%JAVID%' OR UPPER(i.legal_name) LIKE '%KIAN%' OR UPPER(i.first_name) = 'KIAN') AND (s.commitment = 24978.24 OR s.funded_amount = 24978.24));

-- Row 191: Salman HUSSAIN
-- shares: 2125.0, price: 23.52, amount: 49980.0
UPDATE subscriptions s
SET num_shares = 2125.0, price_per_share = 23.52, funded_amount = 49980.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HUSSAIN' OR UPPER(i.legal_name) LIKE '%HUSSAIN%' OR UPPER(i.legal_name) LIKE '%SALMAN%' OR UPPER(i.first_name) = 'SALMAN') AND (s.commitment = 49980.0 OR s.funded_amount = 49980.0));

-- Row 192: Juan TONELLI BANFI
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'TONELLI BANFI' OR UPPER(i.legal_name) LIKE '%TONELLI BANFI%' OR UPPER(i.legal_name) LIKE '%JUAN%' OR UPPER(i.first_name) = 'JUAN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 193: GREENLEAF
-- shares: 65865.0, price: 23.52, amount: 1549144.8
UPDATE subscriptions s
SET num_shares = 65865.0, price_per_share = 23.52, funded_amount = 1549144.8
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GREENLEAF%') AND (s.commitment = 1549144.8 OR s.funded_amount = 1549144.8));

-- Row 194: Banco BTG Pactual S.A. Client 12279
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 12279%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 195: Banco BTG Pactual S.A. Client 34658
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34658%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 196: Banco BTG Pactual S.A. Client 34924
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34924%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 197: Banco BTG Pactual S.A. Client 36003
-- shares: 10629.0, price: 23.52, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 10629.0, price_per_share = 23.52, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36003%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 198: Banco BTG Pactual S.A. Client 36749
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36749%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 199: Banco BTG Pactual S.A. Client 36957
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36957%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 200: Banco BTG Pactual S.A. Client 80738
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80738%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 201: Banco BTG Pactual S.A. Client 80772
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80772%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 202: Banco BTG Pactual S.A. Client 80775
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80775%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 203: Banco BTG Pactual S.A. Client 80776
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80776%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 204: Banco BTG Pactual S.A. Client 80840
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80840%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 205: Banco BTG Pactual S.A. Client 80862
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80862%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 206: Banco BTG Pactual S.A. Client 80873
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80873%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 207: Banco BTG Pactual S.A. Client 80890
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80890%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 208: Banco BTG Pactual S.A. Client 80910
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80910%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 209: Banco BTG Pactual S.A. Client 81022
-- shares: 4251.0, price: 23.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4251.0, price_per_share = 23.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 81022%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 210: Banco BTG Pactual S.A. Client 515
-- shares: 42517.0, price: 23.52, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 42517.0, price_per_share = 23.52, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 515%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 211: RLABS HOLDINGS LTD
-- shares: 23384.0, price: 23.52, amount: 550000.0
UPDATE subscriptions s
SET num_shares = 23384.0, price_per_share = 23.52, funded_amount = 550000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%RLABS HOLDINGS LTD%') AND (s.commitment = 550000.0 OR s.funded_amount = 550000.0));

-- Row 212: OLD HILL INVESTMENT GROUP LLC
-- shares: 29761.0, price: 23.52, amount: 700000.0
UPDATE subscriptions s
SET num_shares = 29761.0, price_per_share = 23.52, funded_amount = 700000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OLD HILL INVESTMENT GROUP LLC%') AND (s.commitment = 700000.0 OR s.funded_amount = 700000.0));

-- Row 213: Samuel GRANDCHAMP
-- shares: 3188.0, price: 23.52, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 3188.0, price_per_share = 23.52, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GRANDCHAMP' OR UPPER(i.legal_name) LIKE '%GRANDCHAMP%' OR UPPER(i.legal_name) LIKE '%SAMUEL%' OR UPPER(i.first_name) = 'SAMUEL') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 214: Luiz FONTES WILLIAMS
-- shares: 4078.0, price: 24.52, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 4078.0, price_per_share = 24.52, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FONTES WILLIAMS' OR UPPER(i.legal_name) LIKE '%FONTES WILLIAMS%' OR UPPER(i.legal_name) LIKE '%LUIZ%' OR UPPER(i.first_name) = 'LUIZ') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 215: Julien MACHOT
-- shares: 0.0, price: 11.2, amount: 0.0
UPDATE subscriptions s
SET num_shares = 0.0, price_per_share = 11.2, funded_amount = 0.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Row 216: Julien MACHOT
-- shares: 38827.0, price: 11.2, amount: 434863.0
UPDATE subscriptions s
SET num_shares = 38827.0, price_per_share = 11.2, funded_amount = 434863.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 434863.0 OR s.funded_amount = 434863.0));

-- Row 217: Julien MACHOT
-- shares: 20947.0, price: 11.2, amount: 234607.0
UPDATE subscriptions s
SET num_shares = 20947.0, price_per_share = 11.2, funded_amount = 234607.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 234607.0 OR s.funded_amount = 234607.0));

-- Row 218: STABLETON (ALTERNATIVE ISSUANCE)
-- shares: 169781.0, price: 24.52, amount: 4163030.12
UPDATE subscriptions s
SET num_shares = 169781.0, price_per_share = 24.52, funded_amount = 4163030.12
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%STABLETON (ALTERNATIVE ISSUANCE)%') AND (s.commitment = 4163030.12 OR s.funded_amount = 4163030.12));

-- Row 219: Julien MACHOT
-- shares: 3636.0, price: 19.5, amount: 70902.0
UPDATE subscriptions s
SET num_shares = 3636.0, price_per_share = 19.5, funded_amount = 70902.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 70902.0 OR s.funded_amount = 70902.0));

-- Position updates for VC106 (aggregated by investor)
-- Blaine ROLLINS: total ownership = 10000.0
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.legal_name) LIKE '%ROLLINS%' OR UPPER(i.legal_name) LIKE '%BLAINE%' OR UPPER(i.first_name) = 'BLAINE'));

-- Laurence CHANG: total ownership = 7500.0
UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANG' OR UPPER(i.legal_name) LIKE '%CHANG%' OR UPPER(i.legal_name) LIKE '%LAURENCE%' OR UPPER(i.first_name) = 'LAURENCE'));

-- Chang NGAN: total ownership = 5600.0
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'NGAN' OR UPPER(i.legal_name) LIKE '%NGAN%' OR UPPER(i.legal_name) LIKE '%CHANG%' OR UPPER(i.first_name) = 'CHANG'));

-- SHEILA and KAMLESH MADHVANI: total ownership = 10000.0
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH'));

-- SAMIR KOHI: total ownership = 5000.0
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOHI' OR UPPER(i.legal_name) LIKE '%KOHI%' OR UPPER(i.legal_name) LIKE '%SAMIR%' OR UPPER(i.first_name) = 'SAMIR'));

-- Sheikh AL SABAH: total ownership = 2631.0
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH%' OR UPPER(i.first_name) = 'SHEIKH'));

-- Han CHIH-HENG: total ownership = 5555.0
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHIH-HENG' OR UPPER(i.legal_name) LIKE '%CHIH-HENG%'));

-- Rajiv AGARWALA: total ownership = 2500.0
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AGARWALA' OR UPPER(i.legal_name) LIKE '%AGARWALA%' OR UPPER(i.legal_name) LIKE '%RAJIV%' OR UPPER(i.first_name) = 'RAJIV'));

-- Daphne CHANDRA: total ownership = 1756.0
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRA' OR UPPER(i.legal_name) LIKE '%CHANDRA%' OR UPPER(i.legal_name) LIKE '%DAPHNE%' OR UPPER(i.first_name) = 'DAPHNE'));

-- Daryl YONGJIE: total ownership = 9167.0
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'YONGJIE' OR UPPER(i.legal_name) LIKE '%YONGJIE%' OR UPPER(i.legal_name) LIKE '%DARYL%' OR UPPER(i.first_name) = 'DARYL'));

-- Ekkawat SAE-JEE: total ownership = 1388.0
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAE-JEE' OR UPPER(i.legal_name) LIKE '%SAE-JEE%' OR UPPER(i.legal_name) LIKE '%EKKAWAT%' OR UPPER(i.first_name) = 'EKKAWAT'));

-- Tan GEOK: total ownership = 4448.0
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GEOK' OR UPPER(i.legal_name) LIKE '%GEOK%'));

-- DALINGA HOLDING AG: total ownership = 2512.0
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA HOLDING AG%'));

-- Matteo MARTINI: total ownership = 5025.0
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MARTINI' OR UPPER(i.legal_name) LIKE '%MARTINI%' OR UPPER(i.legal_name) LIKE '%MATTEO%' OR UPPER(i.first_name) = 'MATTEO'));

-- Ammar SAHLI: total ownership = 11904.0
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAHLI' OR UPPER(i.legal_name) LIKE '%SAHLI%' OR UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%' OR UPPER(i.legal_name) LIKE '%AMMAR%' OR UPPER(i.first_name) = 'AMMAR'));

-- OEP Ltd: total ownership = 11905.0
UPDATE positions p
SET units = 11905.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- MA GROUP AG: total ownership = 1507.0
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%MA GROUP AG%'));

-- KRANA INVESTMENTS PTE. LTD.: total ownership = 13698.0
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KRANA INVESTMENTS PTE. LTD.%'));

-- Johann AKERMANN: total ownership = 10000.0
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%JOHANN%' OR UPPER(i.first_name) = 'JOHANN'));

-- Sandra CABIAN: total ownership = 2512.0
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CABIAN' OR UPPER(i.legal_name) LIKE '%CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA'));

-- Dario SCIMONE: total ownership = 2392.0
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.legal_name) LIKE '%SCIMONE%' OR UPPER(i.legal_name) LIKE '%DARIO%' OR UPPER(i.first_name) = 'DARIO'));

-- OFBR Trust: total ownership = 8880.0
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OFBR TRUST%'));

-- Elidon Estate Inc: total ownership = 9132.0
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ELIDON ESTATE INC%'));

-- Adam Smith Singapore Pte Ltd: total ownership = 1141.0
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ADAM SMITH SINGAPORE PTE LTD%'));

-- Julien MACHOT: total ownership = 95605.0
UPDATE positions p
SET units = 95605.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- VERSO GROUP: total ownership = 4547.0
UPDATE positions p
SET units = 4547.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VERSO GROUP%'));

-- Mrs and Mr Beatrice & Marcel KNOPF: total ownership = 2220.0
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS AND MR BEATRICE & MARCEL%' OR UPPER(i.first_name) = 'MRS AND MR BEATRICE & MARCEL'));

-- VOLF Trust: total ownership = 11101.0
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%'));

-- Bahama Global Towers Limited: total ownership = 6500.0
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BAHAMA GLOBAL TOWERS LIMITED%'));

-- CAUSE FIRST Holdings Ltd: total ownership = 4440.0
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CAUSE FIRST HOLDINGS LTD%'));

-- Sabrina WINZ: total ownership = 6660.0
UPDATE positions p
SET units = 6660.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%HEINZ & BARBARA%' OR UPPER(i.first_name) = 'HEINZ & BARBARA'));

-- Mrs and Mr KARKUN: total ownership = 2272.0
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%KARKUN%' OR UPPER(i.legal_name) LIKE '%MRS AND MR%' OR UPPER(i.first_name) = 'MRS AND MR'));

-- Craig BROWN: total ownership = 2500.0
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROWN' OR UPPER(i.legal_name) LIKE '%BROWN%' OR UPPER(i.legal_name) LIKE '%CRAIG%' OR UPPER(i.first_name) = 'CRAIG'));

-- TRUE INVESTMENTS 4 LLC: total ownership = 32631.0
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TRUE INVESTMENTS 4 LLC%'));

-- ROSEN INVEST HOLDINGS Inc: total ownership = 4440.0
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'));

-- Mrs & Mr Subbiah SUBRAMANIAN: total ownership = 6733.0
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS & MR SUBBIAH'));

-- JIMENEZ TRADING INC: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%JIMENEZ TRADING INC%'));

-- Atima HARALALKA: total ownership = 2631.0
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARALALKA' OR UPPER(i.legal_name) LIKE '%HARALALKA%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%ATIMA%' OR UPPER(i.first_name) = 'ATIMA'));

-- Ekta DATT: total ownership = 1315.0
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DATT' OR UPPER(i.legal_name) LIKE '%DATT%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%EKTA%' OR UPPER(i.first_name) = 'EKTA'));

-- Mohamad BIN MOHAMED: total ownership = 10526.0
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BIN MOHAMED' OR UPPER(i.legal_name) LIKE '%BIN MOHAMED%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%MOHAMAD%' OR UPPER(i.first_name) = 'MOHAMAD'));

-- Nidhi GANERIWALA: total ownership = 1842.0
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GANERIWALA' OR UPPER(i.legal_name) LIKE '%GANERIWALA%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%NIDHI%' OR UPPER(i.first_name) = 'NIDHI'));

-- PANT Investments Inc: total ownership = 5263.0
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%PANT INVESTMENTS INC%'));

-- Rajesh SUD: total ownership = 2631.0
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUD' OR UPPER(i.legal_name) LIKE '%SUD%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RAJESH%' OR UPPER(i.first_name) = 'RAJESH'));

-- Rajiv KAPOOR: total ownership = 2631.0
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KAPOOR' OR UPPER(i.legal_name) LIKE '%KAPOOR%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RAJIV%' OR UPPER(i.first_name) = 'RAJIV'));

-- Rasika KULKARNI: total ownership = 1315.0
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KULKARNI' OR UPPER(i.legal_name) LIKE '%KULKARNI%' OR UPPER(i.legal_name) LIKE '%LEE RAND GROUP%' OR UPPER(i.legal_name) LIKE '%RASIKA%' OR UPPER(i.first_name) = 'RASIKA'));

-- Aaron RIKHYE: total ownership = 4252.0
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIKHYE' OR UPPER(i.legal_name) LIKE '%RIKHYE%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%AARON%' OR UPPER(i.first_name) = 'AARON'));

-- Sheetal HARIA: total ownership = 2124.0
UPDATE positions p
SET units = 2124.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARIA' OR UPPER(i.legal_name) LIKE '%HARIA%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%LAKIN%' OR UPPER(i.first_name) = 'LAKIN'));

-- Tapan SHAH: total ownership = 1062.0
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%HEDGEBAY SECURITIES LLC%' OR UPPER(i.legal_name) LIKE '%TAPAN%' OR UPPER(i.first_name) = 'TAPAN'));

-- ONC Limited: total ownership = 212585.0
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%ONC LIMITED%'));

-- Mohammed AL ABBASI: total ownership = 12700.0
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AL ABBASI' OR UPPER(i.legal_name) LIKE '%AL ABBASI%' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.first_name) = 'MOHAMMED'));

-- Patrick CORR: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CORR' OR UPPER(i.legal_name) LIKE '%CORR%' OR UPPER(i.legal_name) LIKE '%PATRICK%' OR UPPER(i.first_name) = 'PATRICK'));

-- Stephen JORDAN: total ownership = 6802.0
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JORDAN' OR UPPER(i.legal_name) LIKE '%JORDAN%' OR UPPER(i.legal_name) LIKE '%STEPHEN%' OR UPPER(i.first_name) = 'STEPHEN'));

-- FigTree Family Office Ltd: total ownership = 15306.0
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%FIGTREE FAMILY OFFICE LTD%'));

-- Oliver WRIGHT: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.legal_name) LIKE '%WRIGHT%' OR UPPER(i.legal_name) LIKE '%OLIVER%' OR UPPER(i.first_name) = 'OLIVER'));

-- Emile VAN DEN BOL: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.legal_name) LIKE '%VAN DEN BOL%' OR UPPER(i.legal_name) LIKE '%EMILE%' OR UPPER(i.first_name) = 'EMILE'));

-- Mark MATTHEWS: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Matthew HAYCOX: total ownership = 3188.0
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.legal_name) LIKE '%HAYCOX%' OR UPPER(i.legal_name) LIKE '%MATTHEW%' OR UPPER(i.first_name) = 'MATTHEW'));

-- John ACKERLEY: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.legal_name) LIKE '%ACKERLEY%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN'));

-- Steve MANNING: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MANNING' OR UPPER(i.legal_name) LIKE '%MANNING%' OR UPPER(i.legal_name) LIKE '%STEVE%' OR UPPER(i.first_name) = 'STEVE'));

-- Global Custody & Clearing Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GLOBAL CUSTODY & CLEARING LIMITED%'));

-- Gregory BROOKS: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BROOKS' OR UPPER(i.legal_name) LIKE '%BROOKS%' OR UPPER(i.legal_name) LIKE '%GREGORY%' OR UPPER(i.first_name) = 'GREGORY'));

-- Stephane DAHAN: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DAHAN' OR UPPER(i.legal_name) LIKE '%DAHAN%' OR UPPER(i.legal_name) LIKE '%STEPHANE%' OR UPPER(i.first_name) = 'STEPHANE'));

-- Jean DUTIL: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUTIL' OR UPPER(i.legal_name) LIKE '%DUTIL%' OR UPPER(i.legal_name) LIKE '%JEAN%' OR UPPER(i.first_name) = 'JEAN'));

-- Barnaby MOORE: total ownership = 6550.0
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MOORE' OR UPPER(i.legal_name) LIKE '%MOORE%' OR UPPER(i.legal_name) LIKE '%BARNABY%' OR UPPER(i.first_name) = 'BARNABY'));

-- Sudon Carlop Holdings Limited: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SUDON CARLOP HOLDINGS LIMITED%'));

-- Lesli SCHUTTE: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.legal_name) LIKE '%SCHUTTE%' OR UPPER(i.legal_name) LIKE '%LESLI%' OR UPPER(i.first_name) = 'LESLI'));

-- Manraj SEKHON: total ownership = 17006.0
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ'));

-- IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust: total ownership = 17006.0
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED AS TRUSTEE OF THE RAYCAT INVESTMENT TRUST%'));

-- Serge RICHARD: total ownership = 425.0
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RICHARD' OR UPPER(i.legal_name) LIKE '%RICHARD%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- Erich GRAF: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH'));

-- TERRA Financial & Management Services SA: total ownership = 1332.0
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TERRA FINANCIAL & MANAGEMENT SERVICES SA%'));

-- Shana NUSSBERGER: total ownership = 7227.0
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'NUSSBERGER' OR UPPER(i.legal_name) LIKE '%NUSSBERGER%' OR UPPER(i.legal_name) LIKE '%SHANA%' OR UPPER(i.first_name) = 'SHANA'));

-- JASSQ HOLDING LIMITED: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%JASSQ HOLDING LIMITED%'));

-- GORILLA PE Inc: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GORILLA PE INC%'));

-- Mark EVANS: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'EVANS' OR UPPER(i.legal_name) LIKE '%EVANS%' OR UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LTD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- David HOLDEN: total ownership = 6377.0
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.legal_name) LIKE '%HOLDEN%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID'));

-- Imrat HAYAT: total ownership = 10000.0
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAYAT' OR UPPER(i.legal_name) LIKE '%HAYAT%' OR UPPER(i.legal_name) LIKE '%IMRAT%' OR UPPER(i.first_name) = 'IMRAT'));

-- David BACHELIER: total ownership = 5314.0
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BACHELIER' OR UPPER(i.legal_name) LIKE '%BACHELIER%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID'));

-- Talal PASHA: total ownership = 452.0
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PASHA' OR UPPER(i.legal_name) LIKE '%PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL'));

-- Ashish KOTHARI: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOTHARI' OR UPPER(i.legal_name) LIKE '%KOTHARI%' OR UPPER(i.legal_name) LIKE '%ASHISH%' OR UPPER(i.first_name) = 'ASHISH'));

-- Fabien ROTH: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROTH' OR UPPER(i.legal_name) LIKE '%ROTH%' OR UPPER(i.legal_name) LIKE '%FABIEN%' OR UPPER(i.first_name) = 'FABIEN'));

-- Fawad MUKHTAR: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MUKHTAR' OR UPPER(i.legal_name) LIKE '%MUKHTAR%' OR UPPER(i.legal_name) LIKE '%FAWAD%' OR UPPER(i.first_name) = 'FAWAD'));

-- KABELLA LTD: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KABELLA LTD%'));

-- SOUTH SOUND LTD: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SOUTH SOUND LTD%'));

-- Constantin-Octavian PATRASCU: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.legal_name) LIKE '%PATRASCU%' OR UPPER(i.legal_name) LIKE '%CONSTANTIN-OCTAVIAN%' OR UPPER(i.first_name) = 'CONSTANTIN-OCTAVIAN'));

-- Mayuriben JOGANI: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN'));

-- CINCORIA LIMITED: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CINCORIA LIMITED%'));

-- Hayden RUSHTON: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.legal_name) LIKE '%RUSHTON%' OR UPPER(i.legal_name) LIKE '%HAYDEN%' OR UPPER(i.first_name) = 'HAYDEN'));

-- Mrs Nalini Yoga & Mr Aran James WILLETTS: total ownership = 5314.0
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WILLETTS' OR UPPER(i.legal_name) LIKE '%WILLETTS%' OR UPPER(i.legal_name) LIKE '%MRS NALINI YOGA & MR ARAN JAMES%' OR UPPER(i.first_name) = 'MRS NALINI YOGA & MR ARAN JAMES'));

-- Emma Graham-Taylor & Gregory SOMMERVILLE: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SOMMERVILLE' OR UPPER(i.legal_name) LIKE '%SOMMERVILLE%' OR UPPER(i.legal_name) LIKE '%EMMA GRAHAM-TAYLOR & GREGORY%' OR UPPER(i.first_name) = 'EMMA GRAHAM-TAYLOR & GREGORY'));

-- Rabin D. and Dolly LAI: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LAI' OR UPPER(i.legal_name) LIKE '%LAI%' OR UPPER(i.legal_name) LIKE '%RABIN D. AND DOLLY%' OR UPPER(i.first_name) = 'RABIN D. AND DOLLY'));

-- Kim LUND: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LUND' OR UPPER(i.legal_name) LIKE '%LUND%'));

-- Ivan BELGA: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BELGA' OR UPPER(i.legal_name) LIKE '%BELGA%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN'));

-- Ayman JOMAA: total ownership = 12755.0
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JOMAA' OR UPPER(i.legal_name) LIKE '%JOMAA%' OR UPPER(i.legal_name) LIKE '%AYMAN%' OR UPPER(i.first_name) = 'AYMAN'));

-- Karthic JAYARAMAN: total ownership = 17006.0
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAYARAMAN' OR UPPER(i.legal_name) LIKE '%JAYARAMAN%' OR UPPER(i.legal_name) LIKE '%KARTHIC%' OR UPPER(i.first_name) = 'KARTHIC'));

-- Imran HAKIM: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HAKIM' OR UPPER(i.legal_name) LIKE '%HAKIM%' OR UPPER(i.legal_name) LIKE '%IMRAN%' OR UPPER(i.first_name) = 'IMRAN'));

-- Kenilworth Ltd: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%KENILWORTH LTD%'));

-- Adil KHAWAJA: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KHAWAJA' OR UPPER(i.legal_name) LIKE '%KHAWAJA%' OR UPPER(i.legal_name) LIKE '%ADIL%' OR UPPER(i.first_name) = 'ADIL'));

-- Bharat JATANIA: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JATANIA' OR UPPER(i.legal_name) LIKE '%JATANIA%' OR UPPER(i.legal_name) LIKE '%BHARAT%' OR UPPER(i.first_name) = 'BHARAT'));

-- Lubna QUNASH: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'QUNASH' OR UPPER(i.legal_name) LIKE '%QUNASH%' OR UPPER(i.legal_name) LIKE '%LUBNA%' OR UPPER(i.first_name) = 'LUBNA'));

-- Bank SYZ AG: total ownership = 215986.0
UPDATE positions p
SET units = 215986.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANK SYZ AG%'));

-- Damien KRAUSER: total ownership = 6376.0
UPDATE positions p
SET units = 6376.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KRAUSER' OR UPPER(i.legal_name) LIKE '%KRAUSER%' OR UPPER(i.legal_name) LIKE '%DAMIEN%' OR UPPER(i.first_name) = 'DAMIEN'));

-- Bright Phoenix Holdings Limited: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LIMITED%'));

-- Michel GUERIN: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GUERIN' OR UPPER(i.legal_name) LIKE '%GUERIN%' OR UPPER(i.legal_name) LIKE '%MICHEL%' OR UPPER(i.first_name) = 'MICHEL'));

-- Eric LE SEIGNEUR: total ownership = 8502.0
UPDATE positions p
SET units = 8502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.legal_name) LIKE '%LE SEIGNEUR%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC'));

-- Swip Holdings Ltd: total ownership = 6377.0
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SWIP HOLDINGS LTD%'));

-- Phaena Advisory Ltd: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%PHAENA ADVISORY LTD%'));

-- Vijaykumar PATEL: total ownership = 42516.0
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'PATEL' OR UPPER(i.legal_name) LIKE '%PATEL%' OR UPPER(i.legal_name) LIKE '%BHIKHU%' OR UPPER(i.first_name) = 'BHIKHU'));

-- POTASSIUM Capital: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%POTASSIUM CAPITAL%'));

-- Aatif HASSAN: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HASSAN' OR UPPER(i.legal_name) LIKE '%HASSAN%' OR UPPER(i.legal_name) LIKE '%AATIF%' OR UPPER(i.first_name) = 'AATIF'));

-- Kevin WILTSHIRE: total ownership = 3188.0
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'WILTSHIRE' OR UPPER(i.legal_name) LIKE '%WILTSHIRE%' OR UPPER(i.legal_name) LIKE '%KEVIN%' OR UPPER(i.first_name) = 'KEVIN'));

-- GTV Partners SA: total ownership = 20391.0
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GTV PARTNERS SA%'));

-- LENN Participations SARL: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%LENN PARTICIPATIONS SARL%'));

-- WEALTH TRAIN LIMITED: total ownership = 19132.0
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%WEALTH TRAIN LIMITED%'));

-- Anke RICE: total ownership = 3863.0
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RICE' OR UPPER(i.legal_name) LIKE '%RICE%' OR UPPER(i.legal_name) LIKE '%ANKE%' OR UPPER(i.first_name) = 'ANKE'));

-- TERSANE INTERNATIONAL LTD: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%TERSANE INTERNATIONAL LTD%'));

-- Brahma Finance (BVI) Ltd: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BRAHMA FINANCE (BVI) LTD%'));

-- James HARTSHORN: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HARTSHORN' OR UPPER(i.legal_name) LIKE '%HARTSHORN%' OR UPPER(i.legal_name) LIKE '%JAMES%' OR UPPER(i.first_name) = 'JAMES'));

-- Murat Cem and Mehmet Can GOKER: total ownership = 42516.0
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%MURAT CEM AND MEHMET CAN%' OR UPPER(i.first_name) = 'MURAT CEM AND MEHMET CAN'));

-- Kaveh ALAMOUTI: total ownership = 12753.0
UPDATE positions p
SET units = 12753.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.legal_name) LIKE '%ALAMOUTI%' OR UPPER(i.legal_name) LIKE '%CYRUS%' OR UPPER(i.first_name) = 'CYRUS'));

-- Caspian Enterprises Limited: total ownership = 42517.0
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%CASPIAN ENTERPRISES LIMITED%'));

-- Rensburg Client Nominees Limited A/c CLT: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%RENSBURG CLIENT NOMINEES LIMITED A/C CLT%'));

-- DCMS Holdings Limited: total ownership = 17006.0
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%DCMS HOLDINGS LIMITED%'));

-- GELIGA LIMITED: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GELIGA LIMITED%' OR UPPER(i.legal_name) LIKE '%(ANTON)%' OR UPPER(i.first_name) = '(ANTON)'));

-- Eric SARASIN: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SARASIN' OR UPPER(i.legal_name) LIKE '%SARASIN%' OR UPPER(i.legal_name) LIKE '%ERIC%' OR UPPER(i.first_name) = 'ERIC'));

-- Scott FLETCHER: total ownership = 42516.0
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- REVERY CAPITAL Limited: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%'));

-- Sandra KOHLER CABIAN: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA'));

-- Isabella CHANDRIS: total ownership = 19131.0
UPDATE positions p
SET units = 19131.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CHANDRIS' OR UPPER(i.legal_name) LIKE '%CHANDRIS%' OR UPPER(i.legal_name) LIKE '%MARIA CHRISTINA%' OR UPPER(i.first_name) = 'MARIA CHRISTINA'));

-- Nicki ASQUITH: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ASQUITH' OR UPPER(i.legal_name) LIKE '%ASQUITH%' OR UPPER(i.legal_name) LIKE '%NICKI%' OR UPPER(i.first_name) = 'NICKI'));

-- Martin AVETISYAN: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'AVETISYAN' OR UPPER(i.legal_name) LIKE '%AVETISYAN%' OR UPPER(i.legal_name) LIKE '%MARTIN%' OR UPPER(i.first_name) = 'MARTIN'));

-- Herve STEIMES: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'STEIMES' OR UPPER(i.legal_name) LIKE '%STEIMES%' OR UPPER(i.legal_name) LIKE '%HERVE%' OR UPPER(i.first_name) = 'HERVE'));

-- Julien SERRA: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SERRA' OR UPPER(i.legal_name) LIKE '%SERRA%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Guillaume SAMAMA: total ownership = 8502.0
UPDATE positions p
SET units = 8502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.legal_name) LIKE '%SAMAMA%' OR UPPER(i.legal_name) LIKE '%FREDERIC%' OR UPPER(i.first_name) = 'FREDERIC'));

-- Denis MATTHEY: total ownership = 23870.0
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS'));

-- SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST: total ownership = 21258.0
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%SWISS TRUSTEES OF GENEVA SA AS TRUSTEES OF THE LUTEPIN TRUST%'));

-- Laurent CUDRE-MAUROUX: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CUDRE-MAUROUX' OR UPPER(i.legal_name) LIKE '%CUDRE-MAUROUX%' OR UPPER(i.legal_name) LIKE '%LAURENT%' OR UPPER(i.first_name) = 'LAURENT'));

-- Georges CYTRON: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYTRON' OR UPPER(i.legal_name) LIKE '%CYTRON%' OR UPPER(i.legal_name) LIKE '%GEORGES%' OR UPPER(i.first_name) = 'GEORGES'));

-- Rosario RIENZO: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIENZO' OR UPPER(i.legal_name) LIKE '%RIENZO%' OR UPPER(i.legal_name) LIKE '%ROSARIO%' OR UPPER(i.first_name) = 'ROSARIO'));

-- Raphael GHESQUIERES: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GHESQUIERES' OR UPPER(i.legal_name) LIKE '%GHESQUIERES%' OR UPPER(i.legal_name) LIKE '%RAPHAEL%' OR UPPER(i.first_name) = 'RAPHAEL'));

-- David ROSSIER: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'ROSSIER' OR UPPER(i.legal_name) LIKE '%ROSSIER%' OR UPPER(i.legal_name) LIKE '%DAVID%' OR UPPER(i.first_name) = 'DAVID'));

-- MARSAULT INTERNATIONAL LTD: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%MARSAULT INTERNATIONAL LTD%'));

-- Bernard DUFAURE: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DUFAURE' OR UPPER(i.legal_name) LIKE '%DUFAURE%' OR UPPER(i.legal_name) LIKE '%BERNARD%' OR UPPER(i.first_name) = 'BERNARD'));

-- Vasily SUKHOTIN: total ownership = 25510.0
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SUKHOTIN' OR UPPER(i.legal_name) LIKE '%SUKHOTIN%' OR UPPER(i.legal_name) LIKE '%VASILY%' OR UPPER(i.first_name) = 'VASILY'));

-- Charles DE BAVIER: total ownership = 8503.0
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES'));

-- Charles RIVA: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'RIVA' OR UPPER(i.legal_name) LIKE '%RIVA%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES'));

-- Jeremie CYROT: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'CYROT' OR UPPER(i.legal_name) LIKE '%CYROT%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE'));

-- Kian JAVID: total ownership = 3187.0
UPDATE positions p
SET units = 3187.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'JAVID' OR UPPER(i.legal_name) LIKE '%JAVID%' OR UPPER(i.legal_name) LIKE '%HOSSIEN%' OR UPPER(i.first_name) = 'HOSSIEN'));

-- Kamyar BADII: total ownership = 850.0
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'BADII' OR UPPER(i.legal_name) LIKE '%BADII%' OR UPPER(i.legal_name) LIKE '%KAMYAR%' OR UPPER(i.first_name) = 'KAMYAR'));

-- Shaham SOLOUKI: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'SOLOUKI' OR UPPER(i.legal_name) LIKE '%SOLOUKI%' OR UPPER(i.legal_name) LIKE '%SHAHAM%' OR UPPER(i.first_name) = 'SHAHAM'));

-- Salman HUSSAIN: total ownership = 2125.0
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'HUSSAIN' OR UPPER(i.legal_name) LIKE '%HUSSAIN%' OR UPPER(i.legal_name) LIKE '%SALMAN%' OR UPPER(i.first_name) = 'SALMAN'));

-- Juan TONELLI BANFI: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'TONELLI BANFI' OR UPPER(i.legal_name) LIKE '%TONELLI BANFI%' OR UPPER(i.legal_name) LIKE '%JUAN%' OR UPPER(i.first_name) = 'JUAN'));

-- GREENLEAF: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%GREENLEAF%'));

-- Banco BTG Pactual S.A. Client 12279: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 12279%'));

-- Banco BTG Pactual S.A. Client 34658: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34658%'));

-- Banco BTG Pactual S.A. Client 34924: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 34924%'));

-- Banco BTG Pactual S.A. Client 36003: total ownership = 10629.0
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36003%'));

-- Banco BTG Pactual S.A. Client 36749: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36749%'));

-- Banco BTG Pactual S.A. Client 36957: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 36957%'));

-- Banco BTG Pactual S.A. Client 80738: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80738%'));

-- Banco BTG Pactual S.A. Client 80772: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80772%'));

-- Banco BTG Pactual S.A. Client 80775: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80775%'));

-- Banco BTG Pactual S.A. Client 80776: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80776%'));

-- Banco BTG Pactual S.A. Client 80840: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80840%'));

-- Banco BTG Pactual S.A. Client 80862: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80862%'));

-- Banco BTG Pactual S.A. Client 80873: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80873%'));

-- Banco BTG Pactual S.A. Client 80890: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80890%'));

-- Banco BTG Pactual S.A. Client 80910: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 80910%'));

-- Banco BTG Pactual S.A. Client 81022: total ownership = 4251.0
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 81022%'));

-- Banco BTG Pactual S.A. Client 515: total ownership = 42517.0
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%BANCO BTG PACTUAL S.A. CLIENT 515%'));

-- RLABS HOLDINGS LTD: total ownership = 23384.0
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%RLABS HOLDINGS LTD%'));

-- OLD HILL INVESTMENT GROUP LLC: total ownership = 29761.0
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%OLD HILL INVESTMENT GROUP LLC%'));

-- Samuel GRANDCHAMP: total ownership = 3188.0
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'GRANDCHAMP' OR UPPER(i.legal_name) LIKE '%GRANDCHAMP%' OR UPPER(i.legal_name) LIKE '%SAMUEL%' OR UPPER(i.first_name) = 'SAMUEL'));

-- Luiz FONTES WILLIAMS: total ownership = 4078.0
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.last_name) = 'FONTES WILLIAMS' OR UPPER(i.legal_name) LIKE '%FONTES WILLIAMS%' OR UPPER(i.legal_name) LIKE '%LUIZ%' OR UPPER(i.first_name) = 'LUIZ'));

-- STABLETON (ALTERNATIVE ISSUANCE): total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND ((UPPER(i.legal_name) LIKE '%STABLETON (ALTERNATIVE ISSUANCE)%'));
