-- ============================================
-- Vehicle Summary Data Migration
-- Generated: 2026-01-16T18:59:35.333689
-- ============================================

-- PHASE 1: BACKUP QUERIES (run these first to verify)
-- Copy results before running updates!
-- 
-- SELECT v.entity_code, s.id, s.num_shares, s.price_per_share, s.funded_amount
-- FROM subscriptions s JOIN vehicles v ON v.id = s.vehicle_id
-- WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141');
-- 
-- SELECT v.entity_code, p.id, p.investor_id, p.units
-- FROM positions p JOIN vehicles v ON v.id = p.vehicle_id
-- WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141');

-- ============================================
-- PHASE 2: Vehicle Currency and Status Updates
-- ============================================

-- IN110: Set currency to ETH
UPDATE vehicles SET currency = 'ETH' WHERE entity_code = 'IN110';

-- VC121: Set currency to CHF
UPDATE vehicles SET currency = 'CHF' WHERE entity_code = 'VC121';

-- VC125: Set currency to EUR
UPDATE vehicles SET currency = 'EUR' WHERE entity_code = 'VC125';

-- VC128: Set currency to GBP
UPDATE vehicles SET currency = 'GBP' WHERE entity_code = 'VC128';

-- VC141: Set currency to EUR
UPDATE vehicles SET currency = 'EUR' WHERE entity_code = 'VC141';

-- VC109: Mark as CLOSED (excluded per client comment)
UPDATE vehicles SET status = 'CLOSED' WHERE entity_code = 'VC109';

-- ============================================
-- PHASE 3: Global Custody Position Update (VC106)
-- They fully exited - OWNERSHIP POSITION = 0
-- ============================================

-- Update Global Custody's position to 0 (they sold all shares)
UPDATE positions
SET units = 0
WHERE investor_id = '35af0245-05fb-4d6c-b17e-64d0d6b180f0'  -- Global Custody & Clearing Limited
  AND vehicle_id = (SELECT id FROM vehicles WHERE entity_code = 'VC106');

-- ============================================
-- PHASE 4: Per-Investor Subscription & Position Updates
-- ============================================

-- ----------------------------------------
-- VC102: 7 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 3000.0, price: 0.001, amount: 3.0
UPDATE subscriptions s
SET num_shares = 3000.0, price_per_share = 0.001, funded_amount = 3.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 3.0 OR s.funded_amount = 3.0));

-- Row 3: Julien MACHOT
-- shares: 500.0, price: 300.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 500.0, price_per_share = 300.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 4: Julien MACHOT
-- shares: 500.0, price: 300.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 500.0, price_per_share = 300.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 5: Julien MACHOT
-- shares: 150000.0, price: 1.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 150000.0, price_per_share = 1.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 6: LF GROUP SARL
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 7: Pierre PAUMIER
-- shares: 25000.0, price: 1.0, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 1.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'PAUMIER' OR UPPER(i.legal_name) LIKE '%PAUMIER%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 8: KRISTINA & CHENG-LIN SUTKAITYTE & HSU
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'SUTKAITYTE & HSU' OR UPPER(i.legal_name) LIKE '%SUTKAITYTE & HSU%' OR UPPER(i.legal_name) LIKE '%KRISTINA & CHENG-LIN%' OR UPPER(i.first_name) = 'KRISTINA & CHENG-LIN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC102 (aggregated by investor)
-- Julien MACHOT: total ownership = 29000.0
UPDATE positions p
SET units = 29000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- LF GROUP SARL: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

-- Pierre PAUMIER: total ownership = 25000.0
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'PAUMIER' OR UPPER(i.legal_name) LIKE '%PAUMIER%' OR UPPER(i.legal_name) LIKE '%PIERRE%' OR UPPER(i.first_name) = 'PIERRE'));

-- KRISTINA & CHENG-LIN SUTKAITYTE & HSU: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'SUTKAITYTE & HSU' OR UPPER(i.legal_name) LIKE '%SUTKAITYTE & HSU%' OR UPPER(i.legal_name) LIKE '%KRISTINA & CHENG-LIN%' OR UPPER(i.first_name) = 'KRISTINA & CHENG-LIN'));

-- ----------------------------------------
-- VC106: 217 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC111: 38 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC112: 25 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 629405.0, price: 0.3972, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 629405.0, price_per_share = 0.3972, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 3: Julien MACHOT
-- shares: 100704.0, price: 0.4965, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 100704.0, price_per_share = 0.4965, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 4: Gershon KOH
-- shares: 201409.0, price: 0.4965, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 201409.0, price_per_share = 0.4965, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 5: Dan BAUMSLAG
-- shares: 50352.0, price: 0.4965, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 50352.0, price_per_share = 0.4965, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 6: Julien MACHOT
-- shares: 151057.0, price: 0.4965, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 151057.0, price_per_share = 0.4965, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 7: Julien MACHOT
-- shares: 503524.0, price: 0.4965, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 503524.0, price_per_share = 0.4965, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 8: Julien MACHOT
-- shares: 44444.0, price: 0.00010012600126, amount: 4.45
UPDATE subscriptions s
SET num_shares = 44444.0, price_per_share = 0.00010012600126, funded_amount = 4.45
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 4.45 OR s.funded_amount = 4.45));

-- Row 9: Dan BAUMSLAG
-- shares: 16370.0, price: 1.5271, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 16370.0, price_per_share = 1.5271, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 10: Julien MACHOT
-- shares: 32741.0, price: 1.5271, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 32741.0, price_per_share = 1.5271, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%OEP LTD%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 11: IQEQ (Switzerland) Ltd ATO Raycat Investment Trust
-- shares: 16370.0, price: 1.5271, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 16370.0, price_per_share = 1.5271, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 12: Julien MACHOT
-- shares: 85128.0, price: 1.5271, amount: 130000.0
UPDATE subscriptions s
SET num_shares = 85128.0, price_per_share = 1.5271, funded_amount = 130000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 130000.0 OR s.funded_amount = 130000.0));

-- Row 13: Robert DETTMEIJER
-- shares: 13096.0, price: 1.5271, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 13096.0, price_per_share = 1.5271, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 14: IQEQ (Switzerland) Ltd ATO Raycat Investment Trust
-- shares: 12038.0, price: 1.0, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 12038.0, price_per_share = 1.0, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 15: REVERY Capital Limited
-- shares: 32741.0, price: 1.5271, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 32741.0, price_per_share = 1.5271, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: Beatrice and Marcel KNOPF
-- shares: 8186.0, price: 12.2154, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 8186.0, price_per_share = 12.2154, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 17: Liudmila and Alexey ROMANOV
-- shares: 40931.0, price: 12.2154, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 40931.0, price_per_share = 12.2154, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 18: Tom ROAD
-- shares: 1227.0, price: 12.2154, amount: 15000.0
UPDATE subscriptions s
SET num_shares = 1227.0, price_per_share = 12.2154, funded_amount = 15000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROAD' OR UPPER(i.legal_name) LIKE '%ROAD%') AND (s.commitment = 15000.0 OR s.funded_amount = 15000.0));

-- Row 19: Sheikh Yousef AL SABAH
-- shares: 4093.0, price: 12.2154, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 4093.0, price_per_share = 12.2154, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 20: Giovanni ALBERTINI
-- shares: 4093.0, price: 12.2154, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 4093.0, price_per_share = 12.2154, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ALBERTINI' OR UPPER(i.legal_name) LIKE '%ALBERTINI%' OR UPPER(i.legal_name) LIKE '%GIOVANNI%' OR UPPER(i.first_name) = 'GIOVANNI') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 21: Julien MACHOT
-- shares: 43797.0, price: 12.2154, amount: 535000.0
UPDATE subscriptions s
SET num_shares = 43797.0, price_per_share = 12.2154, funded_amount = 535000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 535000.0 OR s.funded_amount = 535000.0));

-- Row 22: VERSO X
-- shares: 236185.0, price: 1.57126, amount: 371109.0
UPDATE subscriptions s
SET num_shares = 236185.0, price_per_share = 1.57126, funded_amount = 371109.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%VERSO X%') AND (s.commitment = 371109.0 OR s.funded_amount = 371109.0));

-- Row 23: Julien MACHOT
-- shares: 61.0, price: 0.3972, amount: 24.5
UPDATE subscriptions s
SET num_shares = 61.0, price_per_share = 0.3972, funded_amount = 24.5
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 24.5 OR s.funded_amount = 24.5));

-- Row 24: Julien MACHOT
-- shares: 100.0, price: 0.4965, amount: 50.0
UPDATE subscriptions s
SET num_shares = 100.0, price_per_share = 0.4965, funded_amount = 50.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50.0 OR s.funded_amount = 50.0));

-- Row 25: Julien MACHOT
-- shares: 3.0, price: 1.5271, amount: 6.0
UPDATE subscriptions s
SET num_shares = 3.0, price_per_share = 1.5271, funded_amount = 6.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 6.0 OR s.funded_amount = 6.0));

-- Row 26: OEP Ltd
-- shares: 21972.0, price: 0.00010012600126, amount: 2.2
UPDATE subscriptions s
SET num_shares = 21972.0, price_per_share = 0.00010012600126, funded_amount = 2.2
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 2.2 OR s.funded_amount = 2.2));

-- Position updates for VC112 (aggregated by investor)
-- Julien MACHOT: total ownership = 1300066.0
UPDATE positions p
SET units = 1300066.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Gershon KOH: total ownership = 201409.0
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON'));

-- Dan BAUMSLAG: total ownership = 66722.0
UPDATE positions p
SET units = 66722.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: total ownership = 28408.0
UPDATE positions p
SET units = 28408.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LTD ATO RAYCAT INVESTMENT TRUST%'));

-- Robert DETTMEIJER: total ownership = 13096.0
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT'));

-- REVERY Capital Limited: total ownership = 32741.0
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%'));

-- Beatrice and Marcel KNOPF: total ownership = 8186.0
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL'));

-- Liudmila and Alexey ROMANOV: total ownership = 40931.0
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY'));

-- Tom ROAD: total ownership = 1227.0
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ROAD' OR UPPER(i.legal_name) LIKE '%ROAD%'));

-- Sheikh Yousef AL SABAH: total ownership = 4093.0
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF'));

-- Giovanni ALBERTINI: total ownership = 4093.0
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.last_name) = 'ALBERTINI' OR UPPER(i.legal_name) LIKE '%ALBERTINI%' OR UPPER(i.legal_name) LIKE '%GIOVANNI%' OR UPPER(i.first_name) = 'GIOVANNI'));

-- VERSO X: total ownership = 236185.0
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%VERSO X%'));

-- OEP Ltd: total ownership = 21972.0
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- ----------------------------------------
-- VC113: 80 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 75485.0, price: 26.495, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 75485.0, price_per_share = 26.495, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 3: Barbara and Heinz WINZ
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%' OR UPPER(i.first_name) = 'BARBARA AND HEINZ') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Sandra KOHLER CABIAN
-- shares: 2795.0, price: 26.8314, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 2795.0, price_per_share = 26.8314, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 5: Markus AKERMANN
-- shares: 2795.0, price: 26.8314, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 2795.0, price_per_share = 26.8314, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 6: Dalinga AG
-- shares: 5590.0, price: 26.8314, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 5590.0, price_per_share = 26.8314, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 7: Dalinga AG
-- shares: 559.0, price: 26.8314, amount: 15000.0
UPDATE subscriptions s
SET num_shares = 559.0, price_per_share = 26.8314, funded_amount = 15000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%') AND (s.commitment = 15000.0 OR s.funded_amount = 15000.0));

-- Row 8: Liudmila Romanova and Alexey ROMANOV
-- shares: 14907.0, price: 26.8314, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 14907.0, price_per_share = 26.8314, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA ROMANOVA AND ALEXEY') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 9: IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST
-- shares: 14907.0, price: 26.8314, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 14907.0, price_per_share = 26.8314, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 10: Andrey GORYAINOV
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%GORYAINOV%' OR UPPER(i.legal_name) LIKE '%ANDREY%' OR UPPER(i.first_name) = 'ANDREY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 11: Liubov and Igor ZINKEVICH
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%' OR UPPER(i.first_name) = 'LIUBOV AND IGOR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 12: Sheila and Kamlesh MADHVANI
-- shares: 2500.0, price: 40.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 40.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 13: Rosen Invest Holdings Inc
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 14: Zandera (Finco) Limited
-- shares: 25000.0, price: 40.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 40.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 15: Mark HAYWARD
-- shares: 1250.0, price: 40.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1250.0, price_per_share = 40.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: Beatrice and Marcel KNOPF
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 17: Scott TOMMEY
-- shares: 3750.0, price: 40.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 3750.0, price_per_share = 40.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.legal_name) LIKE '%TOMMEY%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 18: Gershon KOH
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 19: Signet Logistics Ltd
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 20: Erich GRAF
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 21: Shrai and Aparna MADHVANI
-- shares: 2500.0, price: 40.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 40.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHRAI AND APARNA%' OR UPPER(i.first_name) = 'SHRAI AND APARNA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 22: Ivan DE
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%DE%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 23: Bright Phoenix Holdings Ltd
-- shares: 3773.0, price: 26.501, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3773.0, price_per_share = 26.501, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 24: TEKAPO Group Limited
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 25: Philip ALGAR
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%ALGAR%' OR UPPER(i.legal_name) LIKE '%PHILIP%' OR UPPER(i.first_name) = 'PHILIP') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 26: Sebastian MERIDA
-- shares: 1118.0, price: 26.8314, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 1118.0, price_per_share = 26.8314, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%MERIDA%' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%' OR UPPER(i.first_name) = 'SEBASTIAN') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 27: EMPIRE GROUP Limited
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%EMPIRE GROUP LIMITED%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 28: Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN
-- shares: 3913.0, price: 26.8314, amount: 105000.0
UPDATE subscriptions s
SET num_shares = 3913.0, price_per_share = 26.8314, funded_amount = 105000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MAHESWARI & SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS NILAKANTAN & MR SUBBIAH') AND (s.commitment = 105000.0 OR s.funded_amount = 105000.0));

-- Row 29: Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA
-- shares: 4099.0, price: 26.8314, amount: 110000.0
UPDATE subscriptions s
SET num_shares = 4099.0, price_per_share = 26.8314, funded_amount = 110000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%HIQUIANA-TANEJA & TANEJA%' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%' OR UPPER(i.first_name) = 'MRS ROSARIO TERESA & MR DEEPAK') AND (s.commitment = 110000.0 OR s.funded_amount = 110000.0));

-- Row 30: SAFE
-- shares: 9317.0, price: 26.8314, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 9317.0, price_per_share = 26.8314, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SAFE%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 31: FRALIS SPF
-- shares: 18634.0, price: 26.8314, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18634.0, price_per_share = 26.8314, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 32: SUMMIT INVESTMENT HOLDINGS LLC
-- shares: 11180.0, price: 26.8314, amount: 300000.0
UPDATE subscriptions s
SET num_shares = 11180.0, price_per_share = 26.8314, funded_amount = 300000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%') AND (s.commitment = 300000.0 OR s.funded_amount = 300000.0));

-- Row 33: NEWBRIDGE FINANCE SPF
-- shares: 104355.0, price: 26.8314, amount: 2800000.0
UPDATE subscriptions s
SET num_shares = 104355.0, price_per_share = 26.8314, funded_amount = 2800000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%') AND (s.commitment = 2800000.0 OR s.funded_amount = 2800000.0));

-- Row 34: Mayuriben JOGANI
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 35: Charles DE BAVIER
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 36: Erwan TAROUILLY
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TAROUILLY' OR UPPER(i.legal_name) LIKE '%TAROUILLY%' OR UPPER(i.legal_name) LIKE '%ERWAN%' OR UPPER(i.first_name) = 'ERWAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 37: Thierry ULDRY
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%ULDRY%' OR UPPER(i.legal_name) LIKE '%THIERRY%' OR UPPER(i.first_name) = 'THIERRY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 38: Scott FLETCHER
-- shares: 18634.0, price: 26.8314, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18634.0, price_per_share = 26.8314, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 39: Jeremie COMEL
-- shares: 745.0, price: 26.8314, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 745.0, price_per_share = 26.8314, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%COMEL%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 40: Nineteen77 Global Multi-Strategy Alpha Master Limited
-- shares: 226406.0, price: 26.501, amount: 5999985.41
UPDATE subscriptions s
SET num_shares = 226406.0, price_per_share = 26.501, funded_amount = 5999985.41
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NINETEEN77 GLOBAL MULTI-STRATEGY ALPHA MASTER LIMITED%') AND (s.commitment = 5999985.41 OR s.funded_amount = 5999985.41));

-- Row 41: Gielke BURGMANS
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BURGMANS' OR UPPER(i.legal_name) LIKE '%BURGMANS%' OR UPPER(i.legal_name) LIKE '%GIELKE%' OR UPPER(i.first_name) = 'GIELKE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 42: Halim EL MOGHAZI
-- shares: 969.0, price: 26.8314, amount: 26000.0
UPDATE subscriptions s
SET num_shares = 969.0, price_per_share = 26.8314, funded_amount = 26000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%EL MOGHAZI%' OR UPPER(i.legal_name) LIKE '%HALIM%' OR UPPER(i.first_name) = 'HALIM') AND (s.commitment = 26000.0 OR s.funded_amount = 26000.0));

-- Row 43: John BARROWMAN
-- shares: 633.0, price: 26.8314, amount: 17000.0
UPDATE subscriptions s
SET num_shares = 633.0, price_per_share = 26.8314, funded_amount = 17000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN') AND (s.commitment = 17000.0 OR s.funded_amount = 17000.0));

-- Row 44: Robin DOBLE
-- shares: 931.0, price: 26.8314, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 931.0, price_per_share = 26.8314, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 45: Tuygan GOKER
-- shares: 18871.0, price: 26.495, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18871.0, price_per_share = 26.495, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 46: Hong NGOC LE
-- shares: 372.0, price: 26.8314, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 372.0, price_per_share = 26.8314, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'NGOC LE' OR UPPER(i.legal_name) LIKE '%NGOC LE%' OR UPPER(i.legal_name) LIKE '%HONG%' OR UPPER(i.first_name) = 'HONG') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 47: Marco JERRENTRUP
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 48: Zandera (Finco) Limited
-- shares: 23809.0, price: 42.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 23809.0, price_per_share = 42.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 49: Julien MACHOT
-- shares: 150937.0, price: 27.5612, amount: 4160000.0
UPDATE subscriptions s
SET num_shares = 150937.0, price_per_share = 27.5612, funded_amount = 4160000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 4160000.0 OR s.funded_amount = 4160000.0));

-- Row 50: Deyan MIHOV
-- shares: 2236.0, price: 26.8314, amount: 60000.0
UPDATE subscriptions s
SET num_shares = 2236.0, price_per_share = 26.8314, funded_amount = 60000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 60000.0 OR s.funded_amount = 60000.0));

-- Row 51: Julien MACHOT
-- shares: 80166.0, price: 26.495, amount: 2124000.0
UPDATE subscriptions s
SET num_shares = 80166.0, price_per_share = 26.495, funded_amount = 2124000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2124000.0 OR s.funded_amount = 2124000.0));

-- Row 52: Julien MACHOT
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 53: Denis MATTHEY
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 54: Robert DETTMEIJER
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 55: Daniel BAUMSLAG
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 56: SMR3T Capital Pte Ltd
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SMR3T CAPITAL PTE LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 57: CLOUD IN HEAVEN SAS
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%CLOUD IN HEAVEN SAS%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 58: Majid MOHAMMED
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MOHAMMED' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.legal_name) LIKE '%MAJID%' OR UPPER(i.first_name) = 'MAJID') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 59: Julien MACHOT
-- shares: 3661.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3661.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 60: AS ADVISORY DWC LLC
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC LLC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 61: OEP Ltd
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 62: PETRATECH
-- shares: 7307.0, price: 6.842, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 7307.0, price_per_share = 6.842, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%PETRATECH%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 63: FRALIS SPF
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 64: Benjamin POURRAT
-- shares: 481.0, price: 26.495, amount: 12755.1
UPDATE subscriptions s
SET num_shares = 481.0, price_per_share = 26.495, funded_amount = 12755.1
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'POURRAT' OR UPPER(i.legal_name) LIKE '%POURRAT%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN') AND (s.commitment = 12755.1 OR s.funded_amount = 12755.1));

-- Row 65: Mark MATTHEWS
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 66: Scott FLETCHER
-- shares: 74539.0, price: 26.8314, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 74539.0, price_per_share = 26.8314, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 67: Julien MACHOT
-- shares: 74539.0, price: 26.8314, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 74539.0, price_per_share = 26.8314, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 68: Mark HAYWARD
-- shares: 2000.0, price: 40.0, amount: 80000.0
UPDATE subscriptions s
SET num_shares = 2000.0, price_per_share = 40.0, funded_amount = 80000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 80000.0 OR s.funded_amount = 80000.0));

-- Row 69: Zandera (Holdco) Limited
-- shares: 12500.0, price: 40.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 40.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 70: Majid (VOIDED) KADDOUMI (VOIDED)
-- shares: 0.0, price: 26.8314, amount: 0.0
UPDATE subscriptions s
SET num_shares = 0.0, price_per_share = 26.8314, funded_amount = 0.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KADDOUMI (VOIDED)' OR UPPER(i.legal_name) LIKE '%KADDOUMI (VOIDED)%' OR UPPER(i.legal_name) LIKE '%MAJID (VOIDED)%' OR UPPER(i.first_name) = 'MAJID (VOIDED)'));

-- Row 71: Sheikh Yousef AL SABAH
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 72: Andrew MEYER
-- shares: 6779.0, price: 29.5, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 6779.0, price_per_share = 29.5, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 73: Abhie SHAH
-- shares: 3389.0, price: 29.5, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3389.0, price_per_share = 29.5, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%ABHIE%' OR UPPER(i.first_name) = 'ABHIE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 74: Deyan MIHOV
-- shares: 3354.0, price: 26.8314, amount: 90000.0
UPDATE subscriptions s
SET num_shares = 3354.0, price_per_share = 26.8314, funded_amount = 90000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 90000.0 OR s.funded_amount = 90000.0));

-- Row 75: Zandera (Holdco) Limited
-- shares: 14634.0, price: 41.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 14634.0, price_per_share = 41.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Row 76: Julien MACHOT
-- shares: 7307.0, price: 6.842, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 7307.0, price_per_share = 6.842, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 77: Keir BENBOW
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 78: Mickael RYAN
-- shares: 25000.0, price: 40.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 40.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 79: Mickael RYAN
-- shares: 23809.0, price: 42.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 23809.0, price_per_share = 42.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 80: Mickael RYAN
-- shares: 12500.0, price: 40.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 40.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 81: Mickael RYAN
-- shares: 14634.0, price: 41.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 14634.0, price_per_share = 41.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Position updates for VC113 (aggregated by investor)
-- Julien MACHOT: total ownership = 283952.0
UPDATE positions p
SET units = 283952.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Barbara and Heinz WINZ: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%' OR UPPER(i.first_name) = 'BARBARA AND HEINZ'));

-- Sandra KOHLER CABIAN: total ownership = 2795.0
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA'));

-- Markus AKERMANN: total ownership = 2795.0
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS'));

-- Dalinga AG: total ownership = 6149.0
UPDATE positions p
SET units = 6149.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%'));

-- Liudmila Romanova and Alexey ROMANOV: total ownership = 14907.0
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA ROMANOVA AND ALEXEY'));

-- IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST: total ownership = 14907.0
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%'));

-- Andrey GORYAINOV: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%GORYAINOV%' OR UPPER(i.legal_name) LIKE '%ANDREY%' OR UPPER(i.first_name) = 'ANDREY'));

-- Liubov and Igor ZINKEVICH: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%' OR UPPER(i.first_name) = 'LIUBOV AND IGOR'));

-- Shrai and Aparna MADHVANI: total ownership = 5000.0
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH'));

-- Rosen Invest Holdings Inc: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'));

-- Zandera (Finco) Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'));

-- Mark HAYWARD: total ownership = 3250.0
UPDATE positions p
SET units = 3250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Beatrice and Marcel KNOPF: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL'));

-- Scott TOMMEY: total ownership = 3750.0
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.legal_name) LIKE '%TOMMEY%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Gershon KOH: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON'));

-- Signet Logistics Ltd: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'));

-- Erich GRAF: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH'));

-- Ivan DE: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%DE%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN'));

-- Bright Phoenix Holdings Ltd: total ownership = 3773.0
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'));

-- TEKAPO Group Limited: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%'));

-- Philip ALGAR: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%ALGAR%' OR UPPER(i.legal_name) LIKE '%PHILIP%' OR UPPER(i.first_name) = 'PHILIP'));

-- Sebastian MERIDA: total ownership = 1118.0
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%MERIDA%' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%' OR UPPER(i.first_name) = 'SEBASTIAN'));

-- EMPIRE GROUP Limited: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%EMPIRE GROUP LIMITED%'));

-- Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN: total ownership = 3913.0
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MAHESWARI & SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS NILAKANTAN & MR SUBBIAH'));

-- Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA: total ownership = 4099.0
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%HIQUIANA-TANEJA & TANEJA%' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%' OR UPPER(i.first_name) = 'MRS ROSARIO TERESA & MR DEEPAK'));

-- SAFE: total ownership = 9317.0
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SAFE%'));

-- FRALIS SPF: total ownership = 33249.0
UPDATE positions p
SET units = 33249.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%'));

-- SUMMIT INVESTMENT HOLDINGS LLC: total ownership = 11180.0
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%'));

-- NEWBRIDGE FINANCE SPF: total ownership = 104355.0
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%'));

-- Mayuriben JOGANI: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN'));

-- Charles DE BAVIER: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES'));

-- Erwan TAROUILLY: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TAROUILLY' OR UPPER(i.legal_name) LIKE '%TAROUILLY%' OR UPPER(i.legal_name) LIKE '%ERWAN%' OR UPPER(i.first_name) = 'ERWAN'));

-- Thierry ULDRY: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%ULDRY%' OR UPPER(i.legal_name) LIKE '%THIERRY%' OR UPPER(i.first_name) = 'THIERRY'));

-- Scott FLETCHER: total ownership = 18634.0
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Jeremie COMEL: total ownership = 745.0
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%COMEL%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE'));

-- Nineteen77 Global Multi-Strategy Alpha Master Limited: total ownership = 75469.0
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NINETEEN77 GLOBAL MULTI-STRATEGY ALPHA MASTER LIMITED%'));

-- Gielke BURGMANS: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BURGMANS' OR UPPER(i.legal_name) LIKE '%BURGMANS%' OR UPPER(i.legal_name) LIKE '%GIELKE%' OR UPPER(i.first_name) = 'GIELKE'));

-- Halim EL MOGHAZI: total ownership = 969.0
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%EL MOGHAZI%' OR UPPER(i.legal_name) LIKE '%HALIM%' OR UPPER(i.first_name) = 'HALIM'));

-- John BARROWMAN: total ownership = 633.0
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN'));

-- Robin DOBLE: total ownership = 931.0
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN'));

-- Tuygan GOKER: total ownership = 18871.0
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Hong NGOC LE: total ownership = 372.0
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'NGOC LE' OR UPPER(i.legal_name) LIKE '%NGOC LE%' OR UPPER(i.legal_name) LIKE '%HONG%' OR UPPER(i.first_name) = 'HONG'));

-- Marco JERRENTRUP: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO'));

-- Deyan MIHOV: total ownership = 5590.0
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN'));

-- Denis MATTHEY: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS'));

-- Robert DETTMEIJER: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT'));

-- Daniel BAUMSLAG: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL'));

-- SMR3T Capital Pte Ltd: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SMR3T CAPITAL PTE LTD%'));

-- CLOUD IN HEAVEN SAS: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%CLOUD IN HEAVEN SAS%'));

-- Majid MOHAMMED: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MOHAMMED' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.legal_name) LIKE '%MAJID%' OR UPPER(i.first_name) = 'MAJID'));

-- AS ADVISORY DWC LLC: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC LLC%'));

-- OEP Ltd: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- PETRATECH: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%PETRATECH%'));

-- Benjamin POURRAT: total ownership = 481.0
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'POURRAT' OR UPPER(i.legal_name) LIKE '%POURRAT%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN'));

-- Mark MATTHEWS: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Zandera (Holdco) Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'));

-- Majid (VOIDED) KADDOUMI (VOIDED): total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KADDOUMI (VOIDED)' OR UPPER(i.legal_name) LIKE '%KADDOUMI (VOIDED)%' OR UPPER(i.legal_name) LIKE '%MAJID (VOIDED)%' OR UPPER(i.first_name) = 'MAJID (VOIDED)'));

-- Sheikh Yousef AL SABAH: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF'));

-- Andrew MEYER: total ownership = 6779.0
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW'));

-- Abhie SHAH: total ownership = 3389.0
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%ABHIE%' OR UPPER(i.first_name) = 'ABHIE'));

-- Keir BENBOW: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR'));

-- Mickael RYAN: total ownership = 75943.0
UPDATE positions p
SET units = 75943.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL'));

-- ----------------------------------------
-- VC114: 4 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 530000.0, price: 1.0, amount: 530000.0
UPDATE subscriptions s
SET num_shares = 530000.0, price_per_share = 1.0, funded_amount = 530000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 530000.0 OR s.funded_amount = 530000.0));

-- Row 3: Revery Capital Limited
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Prometheus Capital Finance Ltd
-- shares: 30000.0, price: 1.0, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 30000.0, price_per_share = 1.0, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%PROMETHEUS CAPITAL FINANCE LTD%') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 5: Manraj SEKHON
-- shares: 200000.0, price: 1.0, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 200000.0, price_per_share = 1.0, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Position updates for VC114 (aggregated by investor)
-- Julien MACHOT: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Revery Capital Limited: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%REVERY CAPITAL LIMITED%'));

-- Prometheus Capital Finance Ltd: total ownership = 30000.0
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.legal_name) LIKE '%PROMETHEUS CAPITAL FINANCE LTD%'));

-- Manraj SEKHON: total ownership = 200000.0
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND ((UPPER(i.last_name) = 'SEKHON' OR UPPER(i.legal_name) LIKE '%SEKHON%' OR UPPER(i.legal_name) LIKE '%MANRAJ%' OR UPPER(i.first_name) = 'MANRAJ'));

-- ----------------------------------------
-- VC118: 7 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 119233.0, price: 3.42283, amount: 408115.01
UPDATE subscriptions s
SET num_shares = 119233.0, price_per_share = 3.42283, funded_amount = 408115.01
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 408115.01 OR s.funded_amount = 408115.01));

-- Row 3: VOLF TRUST
-- shares: 7692.0, price: 32.5, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 7692.0, price_per_share = 32.5, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 4: Liudmila and Alexey ROMANOVA & ROMANOV
-- shares: 15384.0, price: 32.5, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 15384.0, price_per_share = 32.5, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'ROMANOVA & ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOVA & ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 5: SIGNET LOGISTICS Ltd
-- shares: 3076.0, price: 32.5, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3076.0, price_per_share = 32.5, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 6: Markus AKERMANN
-- shares: 4615.0, price: 32.5, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 4615.0, price_per_share = 32.5, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 7: Talal CHAMSI PASHA
-- shares: 39000.0, price: 6.62717, amount: 258460.0
UPDATE subscriptions s
SET num_shares = 39000.0, price_per_share = 6.62717, funded_amount = 258460.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL') AND (s.commitment = 258460.0 OR s.funded_amount = 258460.0));

-- Row 8: Talal CHAMSI PASHA
-- shares: 79324.0, price: 6.62717, amount: 525695.0
UPDATE subscriptions s
SET num_shares = 79324.0, price_per_share = 6.62717, funded_amount = 525695.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL') AND (s.commitment = 525695.0 OR s.funded_amount = 525695.0));

-- Position updates for VC118 (aggregated by investor)
-- Julien MACHOT: total ownership = 909.0
UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- VOLF TRUST: total ownership = 7692.0
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%VOLF TRUST%'));

-- Liudmila and Alexey ROMANOVA & ROMANOV: total ownership = 15384.0
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'ROMANOVA & ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOVA & ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA AND ALEXEY'));

-- SIGNET LOGISTICS Ltd: total ownership = 3076.0
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'));

-- Markus AKERMANN: total ownership = 4615.0
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS'));

-- Talal CHAMSI PASHA: total ownership = 118324.0
UPDATE positions p
SET units = 118324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND ((UPPER(i.last_name) = 'CHAMSI PASHA' OR UPPER(i.legal_name) LIKE '%CHAMSI PASHA%' OR UPPER(i.legal_name) LIKE '%TALAL%' OR UPPER(i.first_name) = 'TALAL'));

-- ----------------------------------------
-- VC121: 2 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC122: 10 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC123: 1 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Position updates for VC123 (aggregated by investor)
-- Julien MACHOT: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- ----------------------------------------
-- VC124: 12 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC125: 34 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC126: 44 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC128: 4 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 178571.0, price: 0.7, amount: 125000.0
UPDATE subscriptions s
SET num_shares = 178571.0, price_per_share = 0.7, funded_amount = 125000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 125000.0 OR s.funded_amount = 125000.0));

-- Row 3: OEP Ltd
-- shares: 142857.0, price: 0.7, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 142857.0, price_per_share = 0.7, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Dan BAUMSLAG
-- shares: 35714.0, price: 0.7, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 35714.0, price_per_share = 0.7, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 5: Julien MACHOT
-- shares: 71428.0, price: 0.7, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 71428.0, price_per_share = 0.7, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC128 (aggregated by investor)
-- Julien MACHOT: total ownership = 249999.0
UPDATE positions p
SET units = 249999.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- OEP Ltd: total ownership = 71429.0
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- Dan BAUMSLAG: total ownership = 35714.0
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%'));

-- ----------------------------------------
-- VC130: 5 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 3: Julien MACHOT
-- shares: 250000.0, price: 1.0, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 250000.0, price_per_share = 1.0, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 4: Tuygan GOKER
-- shares: 12502.0, price: 11.998, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 12502.0, price_per_share = 11.998, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 5: Scott LIVINGSTONE
-- shares: 833.0, price: 11.998, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 833.0, price_per_share = 11.998, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'LIVINGSTONE' OR UPPER(i.legal_name) LIKE '%LIVINGSTONE%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 6: Daniel BAUMSLAG
-- shares: 2917.0, price: 11.998, amount: 35000.0
UPDATE subscriptions s
SET num_shares = 2917.0, price_per_share = 11.998, funded_amount = 35000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL') AND (s.commitment = 35000.0 OR s.funded_amount = 35000.0));

-- Position updates for VC130 (aggregated by investor)
-- Julien MACHOT: total ownership = 483748.0
UPDATE positions p
SET units = 483748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Tuygan GOKER: total ownership = 12502.0
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Scott LIVINGSTONE: total ownership = 833.0
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'LIVINGSTONE' OR UPPER(i.legal_name) LIKE '%LIVINGSTONE%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Daniel BAUMSLAG: total ownership = 2917.0
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL'));

-- ----------------------------------------
-- VC131: 4 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 20000.0, price: 1.25, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 20000.0, price_per_share = 1.25, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 3: Julien MACHOT
-- shares: 20000.0, price: 1.25, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 20000.0, price_per_share = 1.25, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 4: Julien MACHOT
-- shares: 12500.0, price: 1.0, amount: 12500.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 1.0, funded_amount = 12500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 12500.0 OR s.funded_amount = 12500.0));

-- Row 5: Julien MACHOT
-- shares: 12500.0, price: 1.0, amount: 12500.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 1.0, funded_amount = 12500.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 12500.0 OR s.funded_amount = 12500.0));

-- Position updates for VC131 (aggregated by investor)
-- Julien MACHOT: total ownership = 65000.0
UPDATE positions p
SET units = 65000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- ----------------------------------------
-- VC132: 2 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC133: 16 investors
-- ----------------------------------------

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

-- ----------------------------------------
-- VC138: 1 investors
-- ----------------------------------------

-- Row 2: Scott FLETCHER
-- shares: 20.0, price: 100000.0, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 20.0, price_per_share = 100000.0, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Position updates for VC138 (aggregated by investor)
-- Scott FLETCHER: total ownership = 20.0
UPDATE positions p
SET units = 20.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- ----------------------------------------
-- VC140: 3 investors
-- ----------------------------------------

-- Row 2: Mrs Beatrice and Mr Marcel KNOPF
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS BEATRICE AND MR MARCEL%' OR UPPER(i.first_name) = 'MRS BEATRICE AND MR MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 3: Mrs Liubov and Mr Igor ZINKEVICH
-- shares: 96000.0, price: 1.0, amount: 96000.0
UPDATE subscriptions s
SET num_shares = 96000.0, price_per_share = 1.0, funded_amount = 96000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%MRS LIUBOV AND MR IGOR%' OR UPPER(i.first_name) = 'MRS LIUBOV AND MR IGOR') AND (s.commitment = 96000.0 OR s.funded_amount = 96000.0));

-- Row 4: Julien MACHOT
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC140 (aggregated by investor)
-- Mrs Beatrice and Mr Marcel KNOPF: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS BEATRICE AND MR MARCEL%' OR UPPER(i.first_name) = 'MRS BEATRICE AND MR MARCEL'));

-- Mrs Liubov and Mr Igor ZINKEVICH: total ownership = 96000.0
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%MRS LIUBOV AND MR IGOR%' OR UPPER(i.first_name) = 'MRS LIUBOV AND MR IGOR'));

-- Julien MACHOT: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- ----------------------------------------
-- VC141: 2 investors
-- ----------------------------------------

-- Row 2: Julien MACHOT
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 3: Serge AURIER
-- shares: 75000.0, price: 1.0, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 75000.0, price_per_share = 1.0, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Position updates for VC141 (aggregated by investor)
-- Julien MACHOT: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Serge AURIER: total ownership = 75000.0
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND ((UPPER(i.last_name) = 'AURIER' OR UPPER(i.legal_name) LIKE '%AURIER%' OR UPPER(i.legal_name) LIKE '%SERGE%' OR UPPER(i.first_name) = 'SERGE'));

-- ----------------------------------------
-- VC143: 3 investors
-- ----------------------------------------

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
-- PHASE 5: Verification Queries
-- ============================================

-- Compare DB totals vs expected after migration
SELECT
  v.entity_code,
  v.currency,
  v.status,
  COUNT(DISTINCT s.id) as subscription_count,
  SUM(s.num_shares) as total_shares,
  SUM(p.units) as total_position_units
FROM vehicles v
LEFT JOIN subscriptions s ON s.vehicle_id = v.id
LEFT JOIN positions p ON p.vehicle_id = v.id
WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141')
GROUP BY v.entity_code, v.currency, v.status
ORDER BY v.entity_code;

-- ============================================
-- Migration Summary
-- ============================================
-- Total records processed: 521
-- Subscription UPDATE statements: 521
-- Position UPDATE statements: 405
-- Currency corrections: 5
-- Status updates: 1 (VC109 -> CLOSED)
-- Special updates: 1 (Global Custody position -> 0)