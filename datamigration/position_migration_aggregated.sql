-- Aggregated Position Migration SQL
-- Updates positions.units based on dashboard OWNERSHIP POSITION values
-- Investors with multiple tranches have been summed

BEGIN;

-- ============================================================
-- IN101: 1 investors, total ownership: 38,881
-- ============================================================

-- Innovatech 1: total ownership = 38,881
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN101'
  AND i.legal_name ILIKE '%Innovatech 1%';


-- ============================================================
-- IN102: 8 investors, total ownership: 603
-- ============================================================

-- David HOLDEN: total ownership = 120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- 1982772 Ontario Ltd: total ownership = 120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND i.legal_name ILIKE '%1982772 Ontario Ltd%';

-- Albert NOCCIOLINO: total ownership = 120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Albert%' AND i.last_name ILIKE '%NOCCIOLINO%');

-- Christopher Alan PAULSEN: total ownership = 120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Christopher%' AND i.last_name ILIKE '%PAULSEN%');

-- Gary David HALL: total ownership = 48
UPDATE positions p
SET units = 48.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Gary%' AND i.last_name ILIKE '%HALL%');

-- Dan BAUMSLAG: total ownership = 1
UPDATE positions p
SET units = 1.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: total ownership = 3
UPDATE positions p
SET units = 3.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Benjamin Lee JONES: total ownership = 71
UPDATE positions p
SET units = 71.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%JONES%');


-- ============================================================
-- IN103: 8 investors, total ownership: 302,229
-- ============================================================

-- Zandera (Holdco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Wymo Finance Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- HASSBRO Investments Limited: total ownership = 120,892
UPDATE positions p
SET units = 120892.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';

-- N SQUARE PATEL LLC: total ownership = 24,178
UPDATE positions p
SET units = 24178.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%N SQUARE PATEL LLC%';

-- Elizabeth GRACE: total ownership = 12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Elizabeth%' AND i.last_name ILIKE '%GRACE%');

-- Sherri Lipton Grace 2020 Irrevocable Family Trust: total ownership = 12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Sherri Lipton Grace 2020 Irrevocable Family Trust%';

-- Jeremy LOWY: total ownership = 12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');

-- Michael RYAN: total ownership = 120,892
UPDATE positions p
SET units = 120892.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Michael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- IN104: 1 investors, total ownership: 150,000
-- ============================================================

-- VERSO HOLDINGS SARL: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN104'
  AND i.legal_name ILIKE '%VERSO HOLDINGS SARL%';


-- ============================================================
-- IN105: 6 investors, total ownership: 70
-- ============================================================

-- Tom GATZ: total ownership = 10
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%GATZ%');

-- VERSO Holdings S.à r.l.: total ownership = 25
UPDATE positions p
SET units = 25.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%VERSO Holdings S.à r.l.%';

-- Improvitae B.V.: total ownership = 10
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Improvitae B.V.%';

-- François-Xavier GIRAUD: total ownership = 5
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%François-Xavier%' AND i.last_name ILIKE '%GIRAUD%');

-- Star of the Sea Limited: total ownership = 15
UPDATE positions p
SET units = 15.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Star of the Sea Limited%';

-- Nicolas WYDLER: total ownership = 5
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Nicolas%' AND i.last_name ILIKE '%WYDLER%');


-- ============================================================
-- IN106: 2 investors, total ownership: 2,004
-- ============================================================

-- Wymo Finance Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- Neville TATA: total ownership = 2,004
UPDATE positions p
SET units = 2004.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND (i.first_name ILIKE '%Neville%' AND i.last_name ILIKE '%TATA%');


-- ============================================================
-- IN108: 1 investors, total ownership: 0
-- ============================================================

-- Anand SETHIA: total ownership = 0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');


-- ============================================================
-- IN109: 1 investors, total ownership: 6,071
-- ============================================================

-- L1 SC Invest 6: total ownership = 6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN109'
  AND i.legal_name ILIKE '%L1 SC Invest 6%';


-- ============================================================
-- IN110: 5 investors, total ownership: 255,000
-- ============================================================

-- William TOYE: total ownership = 15,000
UPDATE positions p
SET units = 15000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%William%' AND i.last_name ILIKE '%TOYE%');

-- Eddie BEARNOT: total ownership = 36,000
UPDATE positions p
SET units = 36000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Eddie%' AND i.last_name ILIKE '%BEARNOT%');

-- Naweed AHMED: total ownership = 44,000
UPDATE positions p
SET units = 44000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Naweed%' AND i.last_name ILIKE '%AHMED%');

-- Robin DOBLE: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Sarah DAVIES: total ownership = 60,000
UPDATE positions p
SET units = 60000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Sarah%' AND i.last_name ILIKE '%DAVIES%');


-- ============================================================
-- IN111: 1 investors, total ownership: 77,447
-- ============================================================

-- Boris IPPOLITOV: total ownership = 77,447
UPDATE positions p
SET units = 77447.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');


-- ============================================================
-- VC102: 4 investors, total ownership: 154,000
-- ============================================================

-- Julien MACHOT: total ownership = 29,000
UPDATE positions p
SET units = 29000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- LF GROUP SARL: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- Pierre PAUMIER: total ownership = 25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%PAUMIER%');

-- KRISTINA & CHENG-LIN SUTKAITYTE & HSU: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%KRISTINA & CHENG-LIN%' AND i.last_name ILIKE '%SUTKAITYTE & HSU%');


-- ============================================================
-- VC103: 15 investors, total ownership: 60,001,270
-- ============================================================

-- Medtronic Office: total ownership = 2,727,272
UPDATE positions p
SET units = 2727272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%Medtronic Office%';

-- Denis MATTHEY: total ownership = 2,272,727
UPDATE positions p
SET units = 2272727.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- MONTEREY HOLDING Co Inc: total ownership = 4,651,162
UPDATE positions p
SET units = 4651162.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';

-- Ryan KUANG: total ownership = 4,651,162
UPDATE positions p
SET units = 4651162.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');

-- Gershon KOH: total ownership = 1,136,363
UPDATE positions p
SET units = 1136363.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Mohammed Saddik ATTAR: total ownership = 909,090
UPDATE positions p
SET units = 909090.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%ATTAR%');

-- Serge AURIER: total ownership = 2,450,581
UPDATE positions p
SET units = 2450581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Sheikh Yousef AL SABAH: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Julien MACHOT: total ownership = 12,044,122
UPDATE positions p
SET units = 12044122.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel BAUMSLAG: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- AS ADVISORY DWC-LLC: total ownership = 1,162,791
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- OEP Ltd: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Daryl PAK YONGJIE: total ownership = 681,818
UPDATE positions p
SET units = 681818.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Chang Yong NGAN: total ownership = 570,000
UPDATE positions p
SET units = 570000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- VEGINVEST: total ownership = 23,255,812
UPDATE positions p
SET units = 23255812.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';


-- ============================================================
-- VC104: 29 investors, total ownership: 231,876
-- ============================================================

-- Gershon KOH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Denis MATTEY: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTEY%');

-- Julien MACHOT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel Aufore: total ownership = 4,250
UPDATE positions p
SET units = 4250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%Aufore%');

-- NextGen: total ownership = 42,285
UPDATE positions p
SET units = 42285.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%NextGen%';

-- Cité Gestion: total ownership = 44,423
UPDATE positions p
SET units = 44423.00004
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Cité Gestion%';

-- Arboris: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Arboris%';

-- APM: total ownership = 25,505
UPDATE positions p
SET units = 25505.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%APM%';

-- Erwan Tarouilly: total ownership = 8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%Tarouilly%');

-- Theo Costa: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Theo%' AND i.last_name ILIKE '%Costa%');

-- Divya Bagrecha: total ownership = 10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Divya%' AND i.last_name ILIKE '%Bagrecha%');

-- Sebastian Reis: total ownership = 10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%Reis%');

-- Ramez Mecataff: total ownership = 2,975
UPDATE positions p
SET units = 2975.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Ramez%' AND i.last_name ILIKE '%Mecataff%');

-- Pierre Roy: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%Roy%');

-- Pierre-Henri Froidevaux: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre-Henri%' AND i.last_name ILIKE '%Froidevaux%');

-- Sofiane Zaiem: total ownership = 5,315
UPDATE positions p
SET units = 5315.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sofiane%' AND i.last_name ILIKE '%Zaiem%');

-- Jean-Pierre Bettin: total ownership = 2,000
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jean-Pierre%' AND i.last_name ILIKE '%Bettin%');

-- Arnaud Wattiez: total ownership = 6,377
UPDATE positions p
SET units = 6376.999957
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Arnaud%' AND i.last_name ILIKE '%Wattiez%');

-- Damien Krauser: total ownership = 5,325
UPDATE positions p
SET units = 5325.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%Krauser%');

-- SFRD0: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%SFRD0%';

-- Lombard Odier (HOF): total ownership = 1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Lombard Odier (HOF)%';

-- Banque Gonet (BAR): total ownership = 1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (BAR)%';

-- Banque Gonet (FIR): total ownership = 2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (FIR)%';

-- Banque Gonet (HOF): total ownership = 2,125
UPDATE positions p
SET units = 2125.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (HOF)%';

-- Rainer Buchecker: total ownership = 8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Rainer%' AND i.last_name ILIKE '%Buchecker%');

-- Marwan Al Abedin: total ownership = 12,753
UPDATE positions p
SET units = 12753.47532
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marwan%' AND i.last_name ILIKE '%Al Abedin%');

-- Jonathan Menoud: total ownership = 2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jonathan%' AND i.last_name ILIKE '%Menoud%');

-- Marc Zafrany: total ownership = 7,129
UPDATE positions p
SET units = 7129.000128
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marc%' AND i.last_name ILIKE '%Zafrany%');

-- Philippe Houman: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Philippe%' AND i.last_name ILIKE '%Houman%');


-- ============================================================
-- VC106: 184 investors, total ownership: 1,953,065
-- ============================================================

-- Blaine ROLLINS: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');

-- Laurence CHANG: total ownership = 7,500
UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');

-- Chang Yong NGAN: total ownership = 5,600
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- SHEILA and KAMLESH MADHVANI: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SHEILA and KAMLESH%' AND i.last_name ILIKE '%MADHVANI%');

-- SAMIR KOHI: total ownership = 5,000
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SAMIR%' AND i.last_name ILIKE '%KOHI%');

-- Sheikh Yousef AL SABAH: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Han CHIH-HENG: total ownership = 5,555
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Han%' AND i.last_name ILIKE '%CHIH-HENG%');

-- Rajiv AGARWALA: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rajiv%' AND i.last_name ILIKE '%AGARWALA%');

-- Daphne Marie CHANDRA: total ownership = 1,756
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daphne%' AND i.last_name ILIKE '%CHANDRA%');

-- Daryl PAK YONGJIE: total ownership = 9,167
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Ekkawat SAE-JEE: total ownership = 1,388
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ekkawat%' AND i.last_name ILIKE '%SAE-JEE%');

-- Tan Sor GEOK: total ownership = 4,448
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Tan%' AND i.last_name ILIKE '%GEOK%');

-- DALINGA HOLDING AG: total ownership = 2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Matteo Massimo MARTINI: total ownership = 5,025
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matteo%' AND i.last_name ILIKE '%MARTINI%');

-- AS ADVISORY DWC-LLC: total ownership = 11,904
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- MA GROUP AG: total ownership = 1,507
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- KRANA INVESTMENTS PTE. LTD.: total ownership = 13,698
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%';

-- Johann Markus AKERMANN: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Sandra KOHLER CABIAN: total ownership = 2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%CABIAN%');

-- Dario SCIMONE: total ownership = 2,392
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dario%' AND i.last_name ILIKE '%SCIMONE%');

-- OFBR Trust: total ownership = 8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OFBR Trust%';

-- Elidon Estate Inc: total ownership = 9,132
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Elidon Estate Inc%';

-- Adam Smith Singapore Pte Ltd: total ownership = 1,141
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%';

-- Julien MACHOT: total ownership = 95,605
UPDATE positions p
SET units = 95605.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Mrs and Mr Beatrice & Marcel KNOPF: total ownership = 2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr Beatrice & Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- VOLF Trust: total ownership = 11,101
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- Bahama Global Towers Limited: total ownership = 6,500
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bahama Global Towers Limited%';

-- CAUSE FIRST Holdings Ltd: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%';

-- Heinz & Barbara WINZ: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Heinz & Barbara%' AND i.last_name ILIKE '%WINZ%');

-- Sabrina WINZ: total ownership = 2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sabrina%' AND i.last_name ILIKE '%WINZ%');

-- Mrs and Mr KARKUN: total ownership = 2,272
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr%' AND i.last_name ILIKE '%KARKUN%');

-- Craig BROWN: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Craig%' AND i.last_name ILIKE '%BROWN%');

-- TRUE INVESTMENTS 4 LLC: total ownership = 32,631
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%';

-- ROSEN INVEST HOLDINGS Inc: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%';

-- Mrs & Mr Subbiah SUBRAMANIAN: total ownership = 6,733
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs & Mr Subbiah%' AND i.last_name ILIKE '%SUBRAMANIAN%');

-- JIMENEZ TRADING INC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JIMENEZ TRADING INC%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 10,526
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,842
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- PANT Investments Inc: total ownership = 5,263
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%PANT Investments Inc%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- Hedgebay Securities LLC: total ownership = 4,252
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- ONC Limited: total ownership = 212,585
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ONC Limited%';

-- Mohammed Abdulaziz AL ABBASI: total ownership = 12,700
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%AL ABBASI%');

-- Patrick CORR: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%CORR%');

-- Stephen JORDAN: total ownership = 6,802
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephen%' AND i.last_name ILIKE '%JORDAN%');

-- FigTree Family Office Ltd: total ownership = 15,306
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%FigTree Family Office Ltd%';

-- Oliver WRIGHT: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Oliver%' AND i.last_name ILIKE '%WRIGHT%');

-- Emile VAN DEN BOL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emile%' AND i.last_name ILIKE '%VAN DEN BOL%');

-- Mark MATTHEWS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Matthew HAYCOX: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matthew%' AND i.last_name ILIKE '%HAYCOX%');

-- John ACKERLEY: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%ACKERLEY%');

-- Steve J MANNING: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Steve%' AND i.last_name ILIKE '%MANNING%');

-- Global Custody & Clearing Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Global Custody & Clearing Limited%';

-- Gregory BROOKS: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Gregory%' AND i.last_name ILIKE '%BROOKS%');

-- Innovatech 1: total ownership = 38,881
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Innovatech 1%';

-- Stephane DAHAN: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Jean DUTIL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jean%' AND i.last_name ILIKE '%DUTIL%');

-- Barnaby John MOORE: total ownership = 6,550
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Barnaby%' AND i.last_name ILIKE '%MOORE%');

-- Sudon Carlop Holdings Limited: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Sudon Carlop Holdings Limited%';

-- Lesli Ann SCHUTTE: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lesli%' AND i.last_name ILIKE '%SCHUTTE%');

-- Manraj Singh SEKHON: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');

-- IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust%';

-- Serge RICHARD: total ownership = 425
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%RICHARD%');

-- Erich GRAF: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- TERRA Financial & Management Services SA: total ownership = 1,332
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Shana NUSSBERGER: total ownership = 7,227
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shana%' AND i.last_name ILIKE '%NUSSBERGER%');

-- JASSQ HOLDING LIMITED: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- INNOSIGHT VENTURES Pte Ltd: total ownership = 32,000
UPDATE positions p
SET units = 32000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';

-- GORILLA PE Inc: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GORILLA PE Inc%';

-- CLOUDSAFE HOLDINGS LTD: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%';

-- David HOLDEN: total ownership = 6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- Imrat HAYAT: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imrat%' AND i.last_name ILIKE '%HAYAT%');

-- David BACHELIER: total ownership = 5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%BACHELIER%');

-- Talal Chamsi PASHA: total ownership = 452
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%PASHA%');

-- Ashish KOTHARI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ashish%' AND i.last_name ILIKE '%KOTHARI%');

-- Fabien ROTH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fabien%' AND i.last_name ILIKE '%ROTH%');

-- Fawad MUKHTAR: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fawad%' AND i.last_name ILIKE '%MUKHTAR%');

-- KABELLA LTD: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KABELLA LTD%';

-- SOUTH SOUND LTD: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SOUTH SOUND LTD%';

-- Constantin-Octavian PATRASCU: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Constantin-Octavian%' AND i.last_name ILIKE '%PATRASCU%');

-- Mayuriben Chetan Kumar JOGANI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- CINCORIA LIMITED: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CINCORIA LIMITED%';

-- Hayden RUSHTON: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hayden%' AND i.last_name ILIKE '%RUSHTON%');

-- Mrs Nalini Yoga & Mr Aran James WILLETTS: total ownership = 5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%' AND i.last_name ILIKE '%WILLETTS%');

-- Emma Graham-Taylor & Gregory SOMMERVILLE: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emma Graham-Taylor & Gregory%' AND i.last_name ILIKE '%SOMMERVILLE%');

-- Rabin D. and Dolly LAI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rabin D. and Dolly%' AND i.last_name ILIKE '%LAI%');

-- Kim LUND: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kim%' AND i.last_name ILIKE '%LUND%');

-- Ivan BELGA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%BELGA%');

-- Ayman JOMAA: total ownership = 12,755
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ayman%' AND i.last_name ILIKE '%JOMAA%');

-- Karthic JAYARAMAN: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Karthic%' AND i.last_name ILIKE '%JAYARAMAN%');

-- Imran HAKIM: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imran%' AND i.last_name ILIKE '%HAKIM%');

-- Kenilworth Ltd: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Kenilworth Ltd%';

-- Adil Arshed KHAWAJA: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Adil%' AND i.last_name ILIKE '%KHAWAJA%');

-- Bharat Kumar JATANIA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bharat%' AND i.last_name ILIKE '%JATANIA%');

-- Lubna M. A. QUNASH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lubna%' AND i.last_name ILIKE '%QUNASH%');

-- Bank SYZ AG: total ownership = 215,986
UPDATE positions p
SET units = 215986.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Damien KRAUSER: total ownership = 6,376
UPDATE positions p
SET units = 6376.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');

-- Bright Phoenix Holdings Limited: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Limited%';

-- Michel Louis GUERIN: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Michel%' AND i.last_name ILIKE '%GUERIN%');

-- Eric Pascal LE SEIGNEUR: total ownership = 8,502
UPDATE positions p
SET units = 8502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');

-- Swip Holdings Ltd: total ownership = 6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Swip Holdings Ltd%';

-- Phaena Advisory Ltd: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Phaena Advisory Ltd%';

-- Bhikhu C. K. PATEL: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bhikhu%' AND i.last_name ILIKE '%PATEL%');

-- Vijaykumar C. K. PATEL: total ownership = 31,887
UPDATE positions p
SET units = 31887.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vijaykumar%' AND i.last_name ILIKE '%PATEL%');

-- POTASSIUM Capital: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%POTASSIUM Capital%';

-- Aatif N. HASSAN: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Aatif%' AND i.last_name ILIKE '%HASSAN%');

-- Kevin FOSTER WILTSHIRE: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kevin%' AND i.last_name ILIKE '%WILTSHIRE%');

-- GTV Partners SA: total ownership = 20,391
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- LENN Participations SARL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LENN Participations SARL%';

-- WEALTH TRAIN LIMITED: total ownership = 19,132
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%WEALTH TRAIN LIMITED%';

-- Anke Skoludek RICE: total ownership = 3,863
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- TERSANE INTERNATIONAL LTD: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%';

-- Brahma Finance (BVI) Ltd: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Brahma Finance (BVI) Ltd%';

-- James A. HARTSHORN: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%HARTSHORN%');

-- Murat Cem and Mehmet Can GOKER: total ownership = 42,516
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');

-- Cyrus ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Cyrus%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Darius ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Darius%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Kaveh ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kaveh%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Caspian Enterprises Limited: total ownership = 42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Caspian Enterprises Limited%';

-- Rensburg Client Nominees Limited A/c CLT: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%';

-- DCMS Holdings Limited: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DCMS Holdings Limited%';

-- GELIGA LIMITED: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GELIGA LIMITED%';

-- Eric SARASIN: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- Scott FLETCHER: total ownership = 42,516
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- REVERY CAPITAL Limited: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%REVERY CAPITAL Limited%';

-- Sandra KOHLER CABIAN: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Maria Christina CHANDRIS: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Maria Christina%' AND i.last_name ILIKE '%CHANDRIS%');

-- Dimitri CHANDRIS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dimitri%' AND i.last_name ILIKE '%CHANDRIS%');

-- Nicki ASQUITH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Nicki%' AND i.last_name ILIKE '%ASQUITH%');

-- Isabella CHANDRIS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Isabella%' AND i.last_name ILIKE '%CHANDRIS%');

-- Martin AVETISYAN: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Martin%' AND i.last_name ILIKE '%AVETISYAN%');

-- Herve STEIMES: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Herve%' AND i.last_name ILIKE '%STEIMES%');

-- Julien SERRA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%SERRA%');

-- Frederic SAMAMA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Frederic%' AND i.last_name ILIKE '%SAMAMA%');

-- Denis MATTHEY: total ownership = 23,870
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%';

-- Laurent CUDRE-MAUROUX: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CUDRE-MAUROUX%');

-- Georges Sylvain CYTRON: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Georges%' AND i.last_name ILIKE '%CYTRON%');

-- Rosario RIENZO: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rosario%' AND i.last_name ILIKE '%RIENZO%');

-- Raphael GHESQUIERES: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Raphael%' AND i.last_name ILIKE '%GHESQUIERES%');

-- Guillaume SAMAMA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Guillaume%' AND i.last_name ILIKE '%SAMAMA%');

-- David Jean ROSSIER: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%ROSSIER%');

-- MARSAULT INTERNATIONAL LTD: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%';

-- Bernard Henri DUFAURE: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bernard%' AND i.last_name ILIKE '%DUFAURE%');

-- Vasily SUKHOTIN: total ownership = 25,510
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vasily%' AND i.last_name ILIKE '%SUKHOTIN%');

-- Charles DE BAVIER: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Charles RIVA: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%RIVA%');

-- Jeremie CYROT: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%CYROT%');

-- Hossien Hakimi JAVID: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hossien%' AND i.last_name ILIKE '%JAVID%');

-- Kamyar BADII: total ownership = 850
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kamyar%' AND i.last_name ILIKE '%BADII%');

-- Shaham SOLOUKI: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shaham%' AND i.last_name ILIKE '%SOLOUKI%');

-- Kian Mohammad Hakimi JAVID: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kian%' AND i.last_name ILIKE '%JAVID%');

-- Salman Raza HUSSAIN: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Salman%' AND i.last_name ILIKE '%HUSSAIN%');

-- Juan TONELLI BANFI: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Juan%' AND i.last_name ILIKE '%TONELLI BANFI%');

-- GREENLEAF: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GREENLEAF%';

-- Banco BTG Pactual S.A. Client 12279: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%';

-- Banco BTG Pactual S.A. Client 34658: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%';

-- Banco BTG Pactual S.A. Client 34924: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%';

-- Banco BTG Pactual S.A. Client 36003: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%';

-- Banco BTG Pactual S.A. Client 36749: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%';

-- Banco BTG Pactual S.A. Client 36957: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%';

-- Banco BTG Pactual S.A. Client 80738: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%';

-- Banco BTG Pactual S.A. Client 80772: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%';

-- Banco BTG Pactual S.A. Client 80775: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%';

-- Banco BTG Pactual S.A. Client 80776: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%';

-- Banco BTG Pactual S.A. Client 80840: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%';

-- Banco BTG Pactual S.A. Client 80862: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%';

-- Banco BTG Pactual S.A. Client 80873: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%';

-- Banco BTG Pactual S.A. Client 80890: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%';

-- Banco BTG Pactual S.A. Client 80910: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%';

-- Banco BTG Pactual S.A. Client 81022: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%';

-- Banco BTG Pactual S.A. Client 515: total ownership = 42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%';

-- RLABS HOLDINGS LTD: total ownership = 23,384
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%RLABS HOLDINGS LTD%';

-- OLD HILL INVESTMENT GROUP LLC: total ownership = 29,761
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%';

-- Samuel GRANDCHAMP: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Samuel%' AND i.last_name ILIKE '%GRANDCHAMP%');

-- Luiz Eduardo FONTES WILLIAMS: total ownership = 4,078
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Luiz%' AND i.last_name ILIKE '%FONTES WILLIAMS%');

-- STABLETON (ALTERNATIVE ISSUANCE): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%STABLETON (ALTERNATIVE ISSUANCE)%';


-- ============================================================
-- VC111: 35 investors, total ownership: 6,750,000
-- ============================================================

-- Julien MACHOT: total ownership = 410,000
UPDATE positions p
SET units = 410000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- ROSEN INVEST HOLDINGS INC: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%';

-- STRUCTURED ISSUANCE Ltd: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%';

-- DALINGA HOLDING AG: total ownership = 115,000
UPDATE positions p
SET units = 115000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Tartrifuge SA: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Tartrifuge SA%';

-- OEP LIMITED
(Transfer from AS ADVISORY DWC LLC): total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%OEP LIMITED
(Transfer from AS ADVISORY DWC LLC)%';

-- David HOLDEN: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- TERRA Financial & Management Services SA: total ownership = 80,000
UPDATE positions p
SET units = 80000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Dan
Jean BAUMSLAG
DUTIL: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan
Jean%' AND i.last_name ILIKE '%BAUMSLAG
DUTIL%');

-- Stephane DAHAN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Bruce HAWKINS: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Bruce%' AND i.last_name ILIKE '%HAWKINS%');

-- VOLF Trust: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- James BURCH: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%BURCH%');

-- Mark MATTHEWS: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Sandra KOHLER CABIAN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Johann Markus AKERMANN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Erich GRAF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Alberto Attilio RAVANO: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Alberto%' AND i.last_name ILIKE '%RAVANO%');

-- FINALMA SUISSE SA: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%FINALMA SUISSE SA%';

-- MONFIN LTD: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%MONFIN LTD%';

-- Bright Phoenix Holdings LTD: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings LTD%';

-- Antonio Bruno PERONACE: total ownership = 70,000
UPDATE positions p
SET units = 70000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Antonio%' AND i.last_name ILIKE '%PERONACE%');

-- BRAHMA FINANCE: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BRAHMA FINANCE%';

-- GTV Partners SA: total ownership = 600,000
UPDATE positions p
SET units = 600000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- Denis MATTHEY: total ownership = 1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Beatrice and Marcel KNOPF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- BenSkyla AG: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BenSkyla AG%';

-- Peter HOGLAND: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Peter%' AND i.last_name ILIKE '%HOGLAND%');

-- Wymo Finance Limited: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- HASSBRO Investments Limited: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';

-- Vladimir GUSEV: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');

-- Zandera (Finco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- LPP Investment Holdings Ltd: total ownership = 1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%LPP Investment Holdings Ltd%';

-- Mickael RYAN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- VC112: 14 investors, total ownership: 1,959,129
-- ============================================================

-- Julien MACHOT: total ownership = 1,166,621
UPDATE positions p
SET units = 1166621.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: total ownership = 133,445
UPDATE positions p
SET units = 133445.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Gershon KOH: total ownership = 201,409
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Dan BAUMSLAG: total ownership = 66,722
UPDATE positions p
SET units = 66722.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: total ownership = 28,408
UPDATE positions p
SET units = 28408.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';

-- Robert Jan DETTMEIJER: total ownership = 13,096
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- REVERY Capital Limited: total ownership = 32,741
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%REVERY Capital Limited%';

-- Beatrice and Marcel KNOPF: total ownership = 8,186
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Liudmila and Alexey ROMANOV: total ownership = 40,931
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- Tom ROAD: total ownership = 1,227
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%ROAD%');

-- Sheikh Yousef AL SABAH: total ownership = 4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Giovanni Antonio Alberto ALBERTINI: total ownership = 4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Giovanni%' AND i.last_name ILIKE '%ALBERTINI%');

-- VERSO X: total ownership = 236,185
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%VERSO X%';

-- OEP Ltd: total ownership = 21,972
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';


-- ============================================================
-- VC113: 64 investors, total ownership: 879,091
-- ============================================================

-- Julien MACHOT: total ownership = 283,952
UPDATE positions p
SET units = 283952.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Barbara and Heinz WINZ: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Barbara and Heinz%' AND i.last_name ILIKE '%WINZ%');

-- Sandra KOHLER CABIAN: total ownership = 2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: total ownership = 2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Dalinga AG: total ownership = 6,149
UPDATE positions p
SET units = 6149.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';

-- Liudmila Romanova and Alexey ROMANOV: total ownership = 14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liudmila Romanova and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST: total ownership = 14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%';

-- Andrey GORYAINOV: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrey%' AND i.last_name ILIKE '%GORYAINOV%');

-- Liubov and Igor ZINKEVICH: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liubov and Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Sheila and Kamlesh MADHVANI: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheila and Kamlesh%' AND i.last_name ILIKE '%MADHVANI%');

-- Rosen Invest Holdings Inc: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Rosen Invest Holdings Inc%';

-- Zandera (Finco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- Mark HAYWARD: total ownership = 3,250
UPDATE positions p
SET units = 3250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');

-- Beatrice and Marcel KNOPF: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Scott Ikott TOMMEY: total ownership = 3,750
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%TOMMEY%');

-- Gershon KOH: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Signet Logistics Ltd: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Signet Logistics Ltd%';

-- Erich GRAF: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Shrai and Aparna MADHVANI: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Shrai and Aparna%' AND i.last_name ILIKE '%MADHVANI%');

-- Ivan DE: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%DE%');

-- Bright Phoenix Holdings Ltd: total ownership = 3,773
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%';

-- TEKAPO Group Limited: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%TEKAPO Group Limited%';

-- Philip ALGAR: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Philip%' AND i.last_name ILIKE '%ALGAR%');

-- Sebastian MERIDA: total ownership = 1,118
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%MERIDA%');

-- EMPIRE GROUP Limited: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%EMPIRE GROUP Limited%';

-- Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN: total ownership = 3,913
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Nilakantan & Mr Subbiah%' AND i.last_name ILIKE '%MAHESWARI & SUBRAMANIAN%');

-- Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA: total ownership = 4,099
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%' AND i.last_name ILIKE '%HIQUIANA-TANEJA & TANEJA%');

-- SAFE: total ownership = 9,317
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SAFE%';

-- FRALIS SPF: total ownership = 33,249
UPDATE positions p
SET units = 33249.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';

-- SUMMIT INVESTMENT HOLDINGS LLC: total ownership = 11,180
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SUMMIT INVESTMENT HOLDINGS LLC%';

-- NEWBRIDGE FINANCE SPF: total ownership = 104,355
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%';

-- Mayuriben Chetan K. JOGANI: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- Charles DE BAVIER: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Erwan TAROUILLY: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%TAROUILLY%');

-- Thierry ULDRY: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Thierry%' AND i.last_name ILIKE '%ULDRY%');

-- Scott FLETCHER: total ownership = 18,634
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Jeremie COMEL: total ownership = 745
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%COMEL%');

-- Nineteen77 Global Multi-Strategy Alpha Master Limited: total ownership = 75,469
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%';

-- Gielke Jan BURGMANS: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gielke%' AND i.last_name ILIKE '%BURGMANS%');

-- Halim EL MOGHAZI: total ownership = 969
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Halim%' AND i.last_name ILIKE '%EL MOGHAZI%');

-- John BARROWMAN: total ownership = 633
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- Robin DOBLE: total ownership = 931
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Tuygan GOKER: total ownership = 18,871
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Hong Bao NGOC LE: total ownership = 372
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Hong%' AND i.last_name ILIKE '%NGOC LE%');

-- Marco JERRENTRUP: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- Deyan D MIHOV: total ownership = 5,590
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Denis MATTHEY: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Robert Jan DETTMEIJER: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- Daniel BAUMSLAG: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- SMR3T Capital Pte Ltd: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SMR3T Capital Pte Ltd%';

-- CLOUD IN HEAVEN SAS: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%CLOUD IN HEAVEN SAS%';

-- Majid MOHAMMED: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid%' AND i.last_name ILIKE '%MOHAMMED%');

-- AS ADVISORY DWC LLC: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- OEP Ltd: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- PETRATECH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%PETRATECH%';

-- Benjamin POURRAT: total ownership = 481
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%POURRAT%');

-- Mark MATTHEWS: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Zandera (Holdco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Majid (VOIDED) KADDOUMI (VOIDED): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid (VOIDED)%' AND i.last_name ILIKE '%KADDOUMI (VOIDED)%');

-- Sheikh Yousef AL SABAH: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Andrew MEYER: total ownership = 6,779
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Abhie Shreyas SHAH: total ownership = 3,389
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Abhie%' AND i.last_name ILIKE '%SHAH%');

-- Keir BENBOW: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Mickael RYAN: total ownership = 75,943
UPDATE positions p
SET units = 75943.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- VC114: 4 investors, total ownership: 530,000
-- ============================================================

-- Julien MACHOT: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Revery Capital Limited: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Revery Capital Limited%';

-- Prometheus Capital Finance Ltd: total ownership = 30,000
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Prometheus Capital Finance Ltd%';

-- Manraj Singh SEKHON: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');


-- ============================================================
-- VC115: 1 investors, total ownership: 715
-- ============================================================

-- Julien MACHOT: total ownership = 715
UPDATE positions p
SET units = 715.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC115'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC116: 4 investors, total ownership: 132,825
-- ============================================================

-- Julien MACHOT: total ownership = 89,587
UPDATE positions p
SET units = 89587.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Robin DOBLE: total ownership = 21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Dan BAUMSLAG: total ownership = 21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- VERSO X: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND i.legal_name ILIKE '%VERSO X%';


-- ============================================================
-- VC118: 6 investors, total ownership: 150,000
-- ============================================================

-- Julien MACHOT: total ownership = 909
UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VOLF TRUST: total ownership = 7,692
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%VOLF TRUST%';

-- Liudmila and Alexey ROMANOVA & ROMANOV: total ownership = 15,384
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOVA & ROMANOV%');

-- SIGNET LOGISTICS Ltd: total ownership = 3,076
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%';

-- Markus AKERMANN: total ownership = 4,615
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Talal CHAMSI PASHA: total ownership = 118,324
UPDATE positions p
SET units = 118324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');


-- ============================================================
-- VC119: 1 investors, total ownership: 7,343
-- ============================================================

-- Julien MACHOT: total ownership = 7,343
UPDATE positions p
SET units = 7343.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC120: 4 investors, total ownership: 500,000
-- ============================================================

-- FRALIS SA SPF: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND i.legal_name ILIKE '%FRALIS SA SPF%';

-- Gershon KOH: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Sandra KOHLER CABIAN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');


-- ============================================================
-- VC121: 1 investors, total ownership: 172,413
-- ============================================================

-- Julien MACHOT: total ownership = 172,413
UPDATE positions p
SET units = 172413.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC122: 9 investors, total ownership: 409,440
-- ============================================================

-- Julien MACHOT: total ownership = 113,598
UPDATE positions p
SET units = 113598.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- AS ADVISORY DWC LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- Deyan D MIHOV: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Sheikh Yousef AL SABAH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Anke Skoludek RICE: total ownership = 95,949
UPDATE positions p
SET units = 95949.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- VERSO CAPITAL ESTABLISHMENT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%VERSO CAPITAL ESTABLISHMENT%';

-- INNOVATECH COMPARTMENT 8: total ownership = 39,978
UPDATE positions p
SET units = 39978.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%';

-- Erich GRAF: total ownership = 159,915
UPDATE positions p
SET units = 159915.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- LF GROUP SARL: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- VC123: 1 investors, total ownership: 100,000
-- ============================================================

-- Julien MACHOT: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC124: 8 investors, total ownership: 2,809,648
-- ============================================================

-- JASSQ Holding Limited: total ownership = 274,636
UPDATE positions p
SET units = 274636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%JASSQ Holding Limited%';

-- OEP Ltd: total ownership = 4,125
UPDATE positions p
SET units = 4125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Scott FLETCHER: total ownership = 1,749,235
UPDATE positions p
SET units = 1749235.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Julien MACHOT: total ownership = 288,716
UPDATE positions p
SET units = 288716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: total ownership = 822
UPDATE positions p
SET units = 822.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Christine MASCORT SULLENGER: total ownership = 59,963
UPDATE positions p
SET units = 59963.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Christine%' AND i.last_name ILIKE '%MASCORT SULLENGER%');

-- OEP Ltd: total ownership = 86,430
UPDATE positions p
SET units = 86430.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- VERSO Capital Establishment: total ownership = 345,721
UPDATE positions p
SET units = 345721.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%VERSO Capital Establishment%';


-- ============================================================
-- VC125: 28 investors, total ownership: 16,088
-- ============================================================

-- Julien MACHOT: total ownership = 2,102
UPDATE positions p
SET units = 2102.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Patrick BIECHELER: total ownership = 169
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%BIECHELER%');

-- SC STONEA: total ownership = 761
UPDATE positions p
SET units = 761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';

-- Christophe SORAIS: total ownership = 225
UPDATE positions p
SET units = 225.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Christophe%' AND i.last_name ILIKE '%SORAIS%');

-- Alain DECOMBE: total ownership = 603
UPDATE positions p
SET units = 603.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');

-- TELEGRAPH HILL CAPITAL: total ownership = 2,398
UPDATE positions p
SET units = 2398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%TELEGRAPH HILL CAPITAL%';

-- Eric SARASIN: total ownership = 1,912
UPDATE positions p
SET units = 1912.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- ZEBRA HOLDING: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ZEBRA HOLDING%';

-- Sylvain GARIEL: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Sylvain%' AND i.last_name ILIKE '%GARIEL%');

-- Benjamin PRESSET: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%PRESSET%');

-- CAREITAS: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%CAREITAS%';

-- OEP LTD: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%OEP LTD%';

-- AS ADVISORY: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%AS ADVISORY%';

-- Laurent CREHANGE: total ownership = 56
UPDATE positions p
SET units = 56.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CREHANGE%');

-- Pierre LECOMTE: total ownership = 203
UPDATE positions p
SET units = 203.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%LECOMTE%');

-- ALPHA OMEGA SAS: total ownership = 28
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ALPHA OMEGA SAS%';

-- GOOD PROTEIN FUND VCC: total ownership = 1,410
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- DALINGA HOLDING AG: total ownership = 169
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- MA GROUP AG: total ownership = 100
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- Andrew MEYER: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Thomas YBERT: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Thomas%' AND i.last_name ILIKE '%YBERT%');

-- Xavier GODRON: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Xavier%' AND i.last_name ILIKE '%GODRON%');

-- Anand RATHI: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Dan BAUMSLAG: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Serge AURIER: total ownership = 282
UPDATE positions p
SET units = 282.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Robin DOBLE: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- GOOD PROTEIN FUND VCC: total ownership = 1,415
UPDATE positions p
SET units = 1415.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- LF GROUP SARL: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- VC126: 33 investors, total ownership: 66,254
-- ============================================================

-- CLOUDSAFE HOLDINGS LIMITED: total ownership = 8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%';

-- AS Advisory DWC-LLC: total ownership = 760
UPDATE positions p
SET units = 760.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%AS Advisory DWC-LLC%';

-- Scott FLETCHER: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Anand RATHI: total ownership = 7,706
UPDATE positions p
SET units = 7706.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Tuygan GOKER: total ownership = 16,120
UPDATE positions p
SET units = 16120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Julien MACHOT: total ownership = 770
UPDATE positions p
SET units = 770.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO MANAGEMENT LTD.: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%VERSO MANAGEMENT LTD.%';

-- BBQ Opportunity Ventures: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BBQ Opportunity Ventures%';

-- OEP Ltd: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- FITAIHI Holdings SARL: total ownership = 890
UPDATE positions p
SET units = 890.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%FITAIHI Holdings SARL%';

-- SC TBC INVEST 3: total ownership = 6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%SC TBC INVEST 3%';

-- ODIN (ANIM X II LP): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN (ANIM X II LP)%';

-- Serge AURIER: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- John BARROWMAN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- DRussell Goman RD LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- Garson Brandon LEVY: total ownership = 367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Garson%' AND i.last_name ILIKE '%LEVY%');

-- Mrs Anisha Bansal and Mr Rahul KARKUN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mrs Anisha Bansal and Mr Rahul%' AND i.last_name ILIKE '%KARKUN%');

-- Mathieu MARIOTTI: total ownership = 1,838
UPDATE positions p
SET units = 1838.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mathieu%' AND i.last_name ILIKE '%MARIOTTI%');

-- Alexandre BARBARANELLI: total ownership = 441
UPDATE positions p
SET units = 441.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Alexandre%' AND i.last_name ILIKE '%BARBARANELLI%');

-- Keir BENBOW: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Amanda RYZOWY: total ownership = 367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Amanda%' AND i.last_name ILIKE '%RYZOWY%');

-- ALPHA GAIA CAPITAL FZE: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%';

-- Desmond CARBERY: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Desmond%' AND i.last_name ILIKE '%CARBERY%');

-- Odile and Georges Abou MRAD and FENERGI: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Odile and Georges%' AND i.last_name ILIKE '%MRAD and FENERGI%');

-- Georgi GEORGIEV: total ownership = 2,469
UPDATE positions p
SET units = 2469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Georgi%' AND i.last_name ILIKE '%GEORGIEV%');

-- Anatoliy KOGAN: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anatoliy%' AND i.last_name ILIKE '%KOGAN%');

-- GESTIO CAPITAL LTD: total ownership = 4,320
UPDATE positions p
SET units = 4320.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%GESTIO CAPITAL LTD%';

-- Danielle BURNS: total ownership = 111
UPDATE positions p
SET units = 111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Danielle%' AND i.last_name ILIKE '%BURNS%');

-- LF GROUP SARL: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- BSV SPV III LLC: total ownership = 10,700
UPDATE positions p
SET units = 10700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BSV SPV III LLC%';

-- DRussell Goman RD LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- ANIM X II LP: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ANIM X II LP%';

-- ODIN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN%';


-- ============================================================
-- VC128: 3 investors, total ownership: 357,142
-- ============================================================

-- Julien MACHOT: total ownership = 249,999
UPDATE positions p
SET units = 249999.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: total ownership = 71,429
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Dan BAUMSLAG: total ownership = 35,714
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');


-- ============================================================
-- VC130: 4 investors, total ownership: 500,000
-- ============================================================

-- Julien MACHOT: total ownership = 483,748
UPDATE positions p
SET units = 483748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Tuygan GOKER: total ownership = 12,502
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Scott LIVINGSTONE: total ownership = 833
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%LIVINGSTONE%');

-- Daniel BAUMSLAG: total ownership = 2,917
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');


-- ============================================================
-- VC131: 1 investors, total ownership: 65,000
-- ============================================================

-- Julien MACHOT: total ownership = 65,000
UPDATE positions p
SET units = 65000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC132: 1 investors, total ownership: 27,546
-- ============================================================

-- Julien MACHOT: total ownership = 27,546
UPDATE positions p
SET units = 27546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC133: 15 investors, total ownership: 2,249
-- ============================================================

-- Charles DE BAVIER: total ownership = 66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- JASSQ HOLDING LIMITED: total ownership = 200
UPDATE positions p
SET units = 200.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- CARTA INVESTMENTS LLC: total ownership = 66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%CARTA INVESTMENTS LLC%';

-- Sahejman Singh KAHLON: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Sahejman%' AND i.last_name ILIKE '%KAHLON%');

-- 777 WALNUT LLC: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%777 WALNUT LLC%';

-- Keir Richard BENBOW: total ownership = 35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Marco JERRENTRUP: total ownership = 35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- ZANDERA (Holdco) Ltd: total ownership = 645
UPDATE positions p
SET units = 645.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%';

-- Band Capital Limited: total ownership = 358
UPDATE positions p
SET units = 358.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%Band Capital Limited%';

-- Jeremy LOWY: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');

-- Tuygan GOKER: total ownership = 716
UPDATE positions p
SET units = 716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- VERSO HOLDINGS: total ownership = 4
UPDATE positions p
SET units = 4.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%VERSO HOLDINGS%';

-- Tobias JOERN: total ownership = 6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tobias%' AND i.last_name ILIKE '%JOERN%');

-- René ROSSDEUTSCHER: total ownership = 13
UPDATE positions p
SET units = 13.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%René%' AND i.last_name ILIKE '%ROSSDEUTSCHER%');

-- Ellen STAUDENMAYER: total ownership = 6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Ellen%' AND i.last_name ILIKE '%STAUDENMAYER%');


-- ============================================================
-- VC134: 4 investors, total ownership: 2,536,332
-- ============================================================

-- ISP CH1149139870: total ownership = 1,930,000
UPDATE positions p
SET units = 1930000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';

-- PROGETTO UNO SPA: total ownership = 501,101
UPDATE positions p
SET units = 501101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%PROGETTO UNO SPA%';

-- Stefano CAPRA: total ownership = 100,220
UPDATE positions p
SET units = 100220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Stefano%' AND i.last_name ILIKE '%CAPRA%');

-- Julien MACHOT: total ownership = 5,011
UPDATE positions p
SET units = 5011.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC135: 2 investors, total ownership: 550,000
-- ============================================================

-- Dan BAUMSLAG: total ownership = 400,000
UPDATE positions p
SET units = 400000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC137: 1 investors, total ownership: 50,000
-- ============================================================

-- Julien MACHOT: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC138: 1 investors, total ownership: 20
-- ============================================================

-- Scott FLETCHER: total ownership = 20
UPDATE positions p
SET units = 20.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');


-- ============================================================
-- VC140: 3 investors, total ownership: 246,000
-- ============================================================

-- Mrs Beatrice and Mr Marcel KNOPF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Beatrice and Mr Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Mrs Liubov and Mr Igor ZINKEVICH: total ownership = 96,000
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Liubov and Mr Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Julien MACHOT: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC141: 2 investors, total ownership: 150,000
-- ============================================================

-- Julien MACHOT: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');


-- ============================================================
-- VC143: 3 investors, total ownership: 175,000
-- ============================================================

-- Julien MACHOT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Deyan D. MIHOV: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- LF GROUP SARL: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- SUMMARY: 519 position updates
-- ============================================================

COMMIT;