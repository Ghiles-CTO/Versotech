-- Phase 4: VC126 Updates
-- 76 UPDATE statements


-- Row 2: CLOUDSAFE HOLDINGS LIMITED
-- shares: 888.0, price: 675.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 888.0, price_per_share = 675.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Row 3: AS Advisory DWC-LLC
-- shares: 76.0, price: 650.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 76.0, price_per_share = 650.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 4: Scott FLETCHER
-- shares: 2016.0, price: 620.0, amount: 1250000.0
UPDATE subscriptions s
SET num_shares = 2016.0, price_per_share = 620.0, funded_amount = 1250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 1250000.0 OR s.funded_amount = 1250000.0));

-- Row 5: Scott FLETCHER
-- shares: 403.0, price: 620.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 403.0, price_per_share = 620.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 6: Anand RATHI
-- shares: 403.0, price: 620.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 403.0, price_per_share = 620.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'RATHI' OR UPPER(i.legal_name) LIKE '%RATHI%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 7: Tuygan GOKER
-- shares: 1612.0, price: 620.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 1612.0, price_per_share = 620.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 8: Julien MACHOT
-- shares: 89.0, price: 560.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 89.0, price_per_share = 560.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 9: VERSO MANAGEMENT LTD.
-- shares: 315.0, price: 503.0, amount: 158673.88
UPDATE subscriptions s
SET num_shares = 315.0, price_per_share = 503.0, funded_amount = 158673.88
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%VERSO MANAGEMENT LTD.%') AND (s.commitment = 158673.88 OR s.funded_amount = 158673.88));

-- Row 10: BBQ Opportunity Ventures
-- shares: 315.0, price: 503.0, amount: None
UPDATE subscriptions s
SET num_shares = 315.0, price_per_share = 503.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%BBQ OPPORTUNITY VENTURES%'));

-- Row 11: OEP Ltd
-- shares: 77.0, price: 650.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 77.0, price_per_share = 650.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 12: FITAIHI Holdings SARL
-- shares: 89.0, price: 724.71, amount: 64500.0
UPDATE subscriptions s
SET num_shares = 89.0, price_per_share = 724.71, funded_amount = 64500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%FITAIHI HOLDINGS SARL%') AND (s.commitment = 64500.0 OR s.funded_amount = 64500.0));

-- Row 13: SC TBC INVEST 3
-- shares: 6071.0, price: 98.0, amount: 595000.0
UPDATE subscriptions s
SET num_shares = 6071.0, price_per_share = 98.0, funded_amount = 595000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%SC TBC INVEST 3%') AND (s.commitment = 595000.0 OR s.funded_amount = 595000.0));

-- Row 14: ODIN (ANIM X II LP)
-- shares: 4935.0, price: 77.0, amount: 380000.0
UPDATE subscriptions s
SET num_shares = 4935.0, price_per_share = 77.0, funded_amount = 380000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%') AND (s.commitment = 380000.0 OR s.funded_amount = 380000.0));

-- Row 15: Serge AURIER
-- shares: 649.0, price: 77.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 649.0, price_per_share = 77.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: John BARROWMAN
-- shares: 735.0, price: 68.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 735.0, price_per_share = 68.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 17: Anand RATHI
-- shares: 3676.0, price: 68.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 3676.0, price_per_share = 68.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'RATHI' OR UPPER(i.legal_name) LIKE '%RATHI%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 18: (Dacia) (RUSSELL)
-- shares: 367.0, price: 68.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 367.0, price_per_share = 68.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = '(RUSSELL)' OR UPPER(i.legal_name) LIKE '%(RUSSELL)%' OR UPPER(i.legal_name) LIKE '%DRUSSELL GOMAN RD LLC%' OR UPPER(i.legal_name) LIKE '%(DACIA)%' OR UPPER(i.first_name) = '(DACIA)') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 19: Garson LEVY
-- shares: 367.0, price: 68.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 367.0, price_per_share = 68.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'LEVY' OR UPPER(i.legal_name) LIKE '%LEVY%' OR UPPER(i.legal_name) LIKE '%GARSON%' OR UPPER(i.first_name) = 'GARSON') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 20: Mrs Anisha Bansal and Mr Rahul KARKUN
-- shares: 367.0, price: 68.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 367.0, price_per_share = 68.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%KARKUN%' OR UPPER(i.legal_name) LIKE '%MRS ANISHA BANSAL AND MR RAHUL%' OR UPPER(i.first_name) = 'MRS ANISHA BANSAL AND MR RAHUL') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 21: Mathieu MARIOTTI
-- shares: 1838.0, price: 68.0, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 1838.0, price_per_share = 68.0, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MARIOTTI' OR UPPER(i.legal_name) LIKE '%MARIOTTI%' OR UPPER(i.legal_name) LIKE '%MATHIEU%' OR UPPER(i.first_name) = 'MATHIEU') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 22: Alexandre BARBARANELLI
-- shares: 441.0, price: 68.0, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 441.0, price_per_share = 68.0, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BARBARANELLI' OR UPPER(i.legal_name) LIKE '%BARBARANELLI%' OR UPPER(i.legal_name) LIKE '%ALEXANDRE%' OR UPPER(i.first_name) = 'ALEXANDRE') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 23: Keir BENBOW
-- shares: 1470.0, price: 68.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 1470.0, price_per_share = 68.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 24: Amanda RYZOWY
-- shares: 367.0, price: 68.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 367.0, price_per_share = 68.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'RYZOWY' OR UPPER(i.legal_name) LIKE '%RYZOWY%' OR UPPER(i.legal_name) LIKE '%AMANDA%' OR UPPER(i.first_name) = 'AMANDA') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 25: Ann Mary CARBERY
-- shares: 1111.0, price: 90.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 1111.0, price_per_share = 90.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'CARBERY' OR UPPER(i.legal_name) LIKE '%CARBERY%' OR UPPER(i.legal_name) LIKE '%ALPHA GAIA CAPITAL FZE%' OR UPPER(i.legal_name) LIKE '%ANN MARY%' OR UPPER(i.first_name) = 'ANN MARY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 26: Desmond CARBERY
-- shares: 1111.0, price: 90.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 1111.0, price_per_share = 90.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'CARBERY' OR UPPER(i.legal_name) LIKE '%CARBERY%' OR UPPER(i.legal_name) LIKE '%DESMOND%' OR UPPER(i.first_name) = 'DESMOND') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 27: Odile and Georges MRAD and FENERGI
-- shares: 1111.0, price: 90.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 1111.0, price_per_share = 90.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MRAD AND FENERGI' OR UPPER(i.legal_name) LIKE '%MRAD AND FENERGI%' OR UPPER(i.legal_name) LIKE '%ODILE AND GEORGES%' OR UPPER(i.first_name) = 'ODILE AND GEORGES') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 28: Georgi GEORGIEV
-- shares: 2469.0, price: 81.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 2469.0, price_per_share = 81.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'GEORGIEV' OR UPPER(i.legal_name) LIKE '%GEORGIEV%' OR UPPER(i.legal_name) LIKE '%GEORGI%' OR UPPER(i.first_name) = 'GEORGI') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 29: Anatoliy KOGAN
-- shares: 1111.0, price: 90.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 1111.0, price_per_share = 90.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'KOGAN' OR UPPER(i.legal_name) LIKE '%KOGAN%' OR UPPER(i.legal_name) LIKE '%ANATOLIY%' OR UPPER(i.first_name) = 'ANATOLIY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 30: GESTIO CAPITAL LTD
-- shares: 4320.0, price: 81.0, amount: 350000.0
UPDATE subscriptions s
SET num_shares = 4320.0, price_per_share = 81.0, funded_amount = 350000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%GESTIO CAPITAL LTD%') AND (s.commitment = 350000.0 OR s.funded_amount = 350000.0));

-- Row 31: Danielle BURNS
-- shares: 111.0, price: 90.0, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 111.0, price_per_share = 90.0, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BURNS' OR UPPER(i.legal_name) LIKE '%BURNS%' OR UPPER(i.legal_name) LIKE '%DANIELLE%' OR UPPER(i.first_name) = 'DANIELLE') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 32: LF GROUP SARL
-- shares: 2272.0, price: 88.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 2272.0, price_per_share = 88.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 33: BSV SPV III LLC
-- shares: 10700.0, price: 92.0, amount: 984400.0
UPDATE subscriptions s
SET num_shares = 10700.0, price_per_share = 92.0, funded_amount = 984400.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%BSV SPV III LLC%') AND (s.commitment = 984400.0 OR s.funded_amount = 984400.0));

-- Row 34: ODIN (ANIM X II LP)
-- shares: 2840.0, price: 92.0, amount: 261331.0
UPDATE subscriptions s
SET num_shares = 2840.0, price_per_share = 92.0, funded_amount = 261331.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%') AND (s.commitment = 261331.0 OR s.funded_amount = 261331.0));

-- Row 35: Julien MACHOT
-- shares: 77.0, price: 650.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 77.0, price_per_share = 650.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 36: Serge AURIER
-- shares: -226.0, price: 170.0, amount: -38420.0
UPDATE subscriptions s
SET num_shares = -226.0, price_per_share = 170.0, funded_amount = -38420.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- Row 37: DRussell Goman RD LLC
-- shares: -367.0, price: 200.0, amount: -73400.0
UPDATE subscriptions s
SET num_shares = -367.0, price_per_share = 200.0, funded_amount = -73400.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%DRUSSELL GOMAN RD LLC%'));

-- Row 38: Serge AURIER
-- shares: -423.0, price: 85.0, amount: -35955.0
UPDATE subscriptions s
SET num_shares = -423.0, price_per_share = 85.0, funded_amount = -35955.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- Row 39: Mrs Anisha Bansal and Mr Rahul KARKUN
-- shares: -367.0, price: 200.0, amount: -73400.0
UPDATE subscriptions s
SET num_shares = -367.0, price_per_share = 200.0, funded_amount = -73400.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%KARKUN%' OR UPPER(i.legal_name) LIKE '%MRS ANISHA BANSAL AND MR RAHUL%' OR UPPER(i.first_name) = 'MRS ANISHA BANSAL AND MR RAHUL'));

-- Row 40: LF GROUP SARL
-- shares: -2272.0, price: 125.0, amount: -284000.0
UPDATE subscriptions s
SET num_shares = -2272.0, price_per_share = 125.0, funded_amount = -284000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

-- Row 41: John BARROWMAN
-- shares: -735.0, price: 200.0, amount: -147000.0
UPDATE subscriptions s
SET num_shares = -735.0, price_per_share = 200.0, funded_amount = -147000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN'));

-- Row 42: Keir BENBOW
-- shares: -1470.0, price: 200.0, amount: -294000.0
UPDATE subscriptions s
SET num_shares = -1470.0, price_per_share = 200.0, funded_amount = -294000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR'));

-- Row 43: Scott FLETCHER
-- shares: -24190.0, price: 200.0, amount: -4838000.0
UPDATE subscriptions s
SET num_shares = -24190.0, price_per_share = 200.0, funded_amount = -4838000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Row 44: ANIM X II LP
-- shares: -4935.0, price: 195.0, amount: -962325.0
UPDATE subscriptions s
SET num_shares = -4935.0, price_per_share = 195.0, funded_amount = -962325.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ANIM X II LP%'));

-- Row 45: ODIN
-- shares: -2840.0, price: 195.0, amount: -553800.0
UPDATE subscriptions s
SET num_shares = -2840.0, price_per_share = 195.0, funded_amount = -553800.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ODIN%'));

-- Position updates for VC126 (aggregated by investor)
-- CLOUDSAFE HOLDINGS LIMITED: total ownership = 8880.0
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%CLOUDSAFE HOLDINGS LIMITED%'));

-- AS Advisory DWC-LLC: total ownership = 760.0
UPDATE positions p
SET units = 760.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC-LLC%'));

-- Scott FLETCHER: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Anand RATHI: total ownership = 7706.0
UPDATE positions p
SET units = 7706.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'RATHI' OR UPPER(i.legal_name) LIKE '%RATHI%' OR UPPER(i.legal_name) LIKE '%ANAND%' OR UPPER(i.first_name) = 'ANAND'));

-- Tuygan GOKER: total ownership = 16120.0
UPDATE positions p
SET units = 16120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Julien MACHOT: total ownership = 770.0
UPDATE positions p
SET units = 770.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- VERSO MANAGEMENT LTD.: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%VERSO MANAGEMENT LTD.%'));

-- BBQ Opportunity Ventures: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%BBQ OPPORTUNITY VENTURES%'));

-- OEP Ltd: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- FITAIHI Holdings SARL: total ownership = 890.0
UPDATE positions p
SET units = 890.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%FITAIHI HOLDINGS SARL%'));

-- SC TBC INVEST 3: total ownership = 6071.0
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%SC TBC INVEST 3%'));

-- ODIN (ANIM X II LP): total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ODIN (ANIM X II LP)%'));

-- Serge AURIER: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- John BARROWMAN: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN'));

-- (Dacia) (RUSSELL): total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = '(RUSSELL)' OR UPPER(i.legal_name) LIKE '%(RUSSELL)%' OR UPPER(i.legal_name) LIKE '%DRUSSELL GOMAN RD LLC%' OR UPPER(i.legal_name) LIKE '%(DACIA)%' OR UPPER(i.first_name) = '(DACIA)'));

-- Garson LEVY: total ownership = 367.0
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'LEVY' OR UPPER(i.legal_name) LIKE '%LEVY%' OR UPPER(i.legal_name) LIKE '%GARSON%' OR UPPER(i.first_name) = 'GARSON'));

-- Mrs Anisha Bansal and Mr Rahul KARKUN: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'KARKUN' OR UPPER(i.legal_name) LIKE '%KARKUN%' OR UPPER(i.legal_name) LIKE '%MRS ANISHA BANSAL AND MR RAHUL%' OR UPPER(i.first_name) = 'MRS ANISHA BANSAL AND MR RAHUL'));

-- Mathieu MARIOTTI: total ownership = 1838.0
UPDATE positions p
SET units = 1838.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MARIOTTI' OR UPPER(i.legal_name) LIKE '%MARIOTTI%' OR UPPER(i.legal_name) LIKE '%MATHIEU%' OR UPPER(i.first_name) = 'MATHIEU'));

-- Alexandre BARBARANELLI: total ownership = 441.0
UPDATE positions p
SET units = 441.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BARBARANELLI' OR UPPER(i.legal_name) LIKE '%BARBARANELLI%' OR UPPER(i.legal_name) LIKE '%ALEXANDRE%' OR UPPER(i.first_name) = 'ALEXANDRE'));

-- Keir BENBOW: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR'));

-- Amanda RYZOWY: total ownership = 367.0
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'RYZOWY' OR UPPER(i.legal_name) LIKE '%RYZOWY%' OR UPPER(i.legal_name) LIKE '%AMANDA%' OR UPPER(i.first_name) = 'AMANDA'));

-- Desmond CARBERY: total ownership = 2222.0
UPDATE positions p
SET units = 2222.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'CARBERY' OR UPPER(i.legal_name) LIKE '%CARBERY%' OR UPPER(i.legal_name) LIKE '%ALPHA GAIA CAPITAL FZE%' OR UPPER(i.legal_name) LIKE '%ANN MARY%' OR UPPER(i.first_name) = 'ANN MARY'));

-- Odile and Georges MRAD and FENERGI: total ownership = 1111.0
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'MRAD AND FENERGI' OR UPPER(i.legal_name) LIKE '%MRAD AND FENERGI%' OR UPPER(i.legal_name) LIKE '%ODILE AND GEORGES%' OR UPPER(i.first_name) = 'ODILE AND GEORGES'));

-- Georgi GEORGIEV: total ownership = 2469.0
UPDATE positions p
SET units = 2469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'GEORGIEV' OR UPPER(i.legal_name) LIKE '%GEORGIEV%' OR UPPER(i.legal_name) LIKE '%GEORGI%' OR UPPER(i.first_name) = 'GEORGI'));

-- Anatoliy KOGAN: total ownership = 1111.0
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'KOGAN' OR UPPER(i.legal_name) LIKE '%KOGAN%' OR UPPER(i.legal_name) LIKE '%ANATOLIY%' OR UPPER(i.first_name) = 'ANATOLIY'));

-- GESTIO CAPITAL LTD: total ownership = 4320.0
UPDATE positions p
SET units = 4320.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%GESTIO CAPITAL LTD%'));

-- Danielle BURNS: total ownership = 111.0
UPDATE positions p
SET units = 111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.last_name) = 'BURNS' OR UPPER(i.legal_name) LIKE '%BURNS%' OR UPPER(i.legal_name) LIKE '%DANIELLE%' OR UPPER(i.first_name) = 'DANIELLE'));

-- LF GROUP SARL: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

-- BSV SPV III LLC: total ownership = 10700.0
UPDATE positions p
SET units = 10700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%BSV SPV III LLC%'));

-- DRussell Goman RD LLC: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%DRUSSELL GOMAN RD LLC%'));

-- ANIM X II LP: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ANIM X II LP%'));

-- ODIN: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND ((UPPER(i.legal_name) LIKE '%ODIN%'));
