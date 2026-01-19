-- Position Migration SQL
-- Updates positions.units based on dashboard OWNERSHIP POSITION values
-- Generated from VERSO DASHBOARD and INNOVATECH DASHBOARD

BEGIN;

-- ============================================================
-- IN101: 1 investors, total ownership: 38,881
-- ============================================================

-- Innovatech 1: shares=38,881, ownership=38,881
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

-- David HOLDEN: shares=120, ownership=120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- 1982772 Ontario Ltd: shares=120, ownership=120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND i.legal_name ILIKE '%1982772 Ontario Ltd%';

-- Albert NOCCIOLINO: shares=120, ownership=120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Albert%' AND i.last_name ILIKE '%NOCCIOLINO%');

-- Christopher Alan PAULSEN: shares=120, ownership=120
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Christopher%' AND i.last_name ILIKE '%PAULSEN%');

-- Gary David HALL: shares=48, ownership=48
UPDATE positions p
SET units = 48.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Gary%' AND i.last_name ILIKE '%HALL%');

-- Dan BAUMSLAG: shares=1, ownership=1
UPDATE positions p
SET units = 1.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: shares=3, ownership=3
UPDATE positions p
SET units = 3.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Benjamin Lee JONES: shares=71, ownership=71
UPDATE positions p
SET units = 71.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%JONES%');


-- ============================================================
-- IN103: 10 investors, total ownership: 302,229
-- ============================================================

-- Zandera (Holdco) Limited: shares=60,446, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Wymo Finance Limited: shares=120,892, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- HASSBRO Investments Limited: shares=120,892, ownership=120,892
UPDATE positions p
SET units = 120892.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';

-- N SQUARE PATEL LLC: shares=24,178, ownership=24,178
UPDATE positions p
SET units = 24178.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%N SQUARE PATEL LLC%';

-- Elizabeth GRACE: shares=12,089, ownership=12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Elizabeth%' AND i.last_name ILIKE '%GRACE%');

-- Sherri Lipton Grace 2020 Irrevocable Family Trust: shares=12,089, ownership=12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Sherri Lipton Grace 2020 Irrevocable Family Trust%';

-- Zandera (Holdco) Limited: shares=60,446, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Jeremy LOWY: shares=12,089, ownership=12,089
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');

-- Michael RYAN: shares=60,446, ownership=60,446
UPDATE positions p
SET units = 60446.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Michael%' AND i.last_name ILIKE '%RYAN%');

-- Michael RYAN: shares=60,446, ownership=60,446
UPDATE positions p
SET units = 60446.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Michael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- IN104: 1 investors, total ownership: 150,000
-- ============================================================

-- VERSO HOLDINGS SARL: shares=150,000, ownership=150,000
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

-- Tom GATZ: shares=10, ownership=10
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%GATZ%');

-- VERSO Holdings S.à r.l.: shares=25, ownership=25
UPDATE positions p
SET units = 25.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%VERSO Holdings S.à r.l.%';

-- Improvitae B.V.: shares=10, ownership=10
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Improvitae B.V.%';

-- François-Xavier GIRAUD: shares=5, ownership=5
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%François-Xavier%' AND i.last_name ILIKE '%GIRAUD%');

-- Star of the Sea Limited: shares=15, ownership=15
UPDATE positions p
SET units = 15.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Star of the Sea Limited%';

-- Nicolas WYDLER: shares=5, ownership=5
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

-- Wymo Finance Limited: shares=66,160, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- Neville TATA: shares=2,004, ownership=2,004
UPDATE positions p
SET units = 2004.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND (i.first_name ILIKE '%Neville%' AND i.last_name ILIKE '%TATA%');


-- ============================================================
-- IN108: 4 investors, total ownership: 0
-- ============================================================

-- Anand SETHIA: shares=750,000, ownership=750,000
UPDATE positions p
SET units = 750000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');

-- Anand SETHIA: shares=-25,000, ownership=-25,000
UPDATE positions p
SET units = -25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');

-- Anand SETHIA: shares=-225,000, ownership=-225,000
UPDATE positions p
SET units = -225000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');

-- Anand SETHIA: shares=-500,000, ownership=-500,000
UPDATE positions p
SET units = -500000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');


-- ============================================================
-- IN109: 1 investors, total ownership: 6,071
-- ============================================================

-- L1 SC Invest 6: shares=6,071, ownership=6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN109'
  AND i.legal_name ILIKE '%L1 SC Invest 6%';


-- ============================================================
-- IN110: 6 investors, total ownership: 255,000
-- ============================================================

-- William TOYE: shares=60,000, ownership=15,000
UPDATE positions p
SET units = 15000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%William%' AND i.last_name ILIKE '%TOYE%');

-- Eddie BEARNOT: shares=36,000, ownership=36,000
UPDATE positions p
SET units = 36000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Eddie%' AND i.last_name ILIKE '%BEARNOT%');

-- Naweed AHMED: shares=44,000, ownership=44,000
UPDATE positions p
SET units = 44000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Naweed%' AND i.last_name ILIKE '%AHMED%');

-- Robin DOBLE: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Sarah DAVIES: shares=60,000, ownership=60,000
UPDATE positions p
SET units = 60000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Sarah%' AND i.last_name ILIKE '%DAVIES%');

-- William TOYE: shares=-45,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%William%' AND i.last_name ILIKE '%TOYE%');


-- ============================================================
-- IN111: 3 investors, total ownership: 77,447
-- ============================================================

-- Boris IPPOLITOV: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');

-- Boris IPPOLITOV: shares=103, ownership=103
UPDATE positions p
SET units = 103.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');

-- Boris IPPOLITOV: shares=2,344, ownership=2,344
UPDATE positions p
SET units = 2344.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');


-- ============================================================
-- VC102: 7 investors, total ownership: 154,000
-- ============================================================

-- Julien MACHOT: shares=3,000, ownership=3,000
UPDATE positions p
SET units = 3000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=500, ownership=500
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=500, ownership=500
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=150,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- LF GROUP SARL: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- Pierre PAUMIER: shares=25,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%PAUMIER%');

-- KRISTINA & CHENG-LIN SUTKAITYTE & HSU: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%KRISTINA & CHENG-LIN%' AND i.last_name ILIKE '%SUTKAITYTE & HSU%');


-- ============================================================
-- VC103: 33 investors, total ownership: 60,001,270
-- ============================================================

-- Medtronic Office: shares=2,727,272, ownership=2,727,272
UPDATE positions p
SET units = 2727272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%Medtronic Office%';

-- Denis MATTHEY: shares=2,272,727, ownership=2,272,727
UPDATE positions p
SET units = 2272727.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- MONTEREY HOLDING Co Inc: shares=2,325,581, ownership=2,325,581
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';

-- Ryan KUANG: shares=2,325,581, ownership=2,325,581
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');

-- Gershon KOH: shares=1,136,363, ownership=1,136,363
UPDATE positions p
SET units = 1136363.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Mohammed Saddik ATTAR: shares=909,090, ownership=909,090
UPDATE positions p
SET units = 909090.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%ATTAR%');

-- Serge AURIER: shares=1,162,790, ownership=1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Sheikh Yousef AL SABAH: shares=1,162,790, ownership=1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Julien MACHOT: shares=772,500, ownership=772,500
UPDATE positions p
SET units = 772500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel BAUMSLAG: shares=1,162,790, ownership=1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- AS ADVISORY DWC-LLC: shares=1,162,791, ownership=1,162,791
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- OEP Ltd: shares=1,162,790, ownership=1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Daryl PAK YONGJIE: shares=681,818, ownership=681,818
UPDATE positions p
SET units = 681818.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Chang Yong NGAN: shares=570,000, ownership=570,000
UPDATE positions p
SET units = 570000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- VEGINVEST: shares=11,627,906, ownership=11,627,906
UPDATE positions p
SET units = 11627906.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';

-- Julien MACHOT: shares=1,894,417, ownership=1,894,417
UPDATE positions p
SET units = 1894417.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=252,589, ownership=252,589
UPDATE positions p
SET units = 252589.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=757,767, ownership=757,767
UPDATE positions p
SET units = 757767.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=1,515,534, ownership=1,515,534
UPDATE positions p
SET units = 1515534.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=1,894,419, ownership=1,894,419
UPDATE positions p
SET units = 1894419.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=2,474,418, ownership=2,474,418
UPDATE positions p
SET units = 2474418.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=627,907, ownership=627,907
UPDATE positions p
SET units = 627907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=1,162,791, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=626,000, ownership=626,000
UPDATE positions p
SET units = 626000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: shares=1,162,791, ownership=1,162,791
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Julien MACHOT: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=928,571, ownership=928,571
UPDATE positions p
SET units = 928571.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Serge AURIER: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- MONTEREY HOLDING Co Inc: shares=2,325,581, ownership=2,325,581
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';

-- Ryan KUANG: shares=2,325,581, ownership=2,325,581
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');

-- VEGINVEST: shares=11,627,906, ownership=11,627,906
UPDATE positions p
SET units = 11627906.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';


-- ============================================================
-- VC104: 33 investors, total ownership: 231,876
-- ============================================================

-- Gershon KOH: shares=139,126, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Denis MATTEY: shares=69,563, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTEY%');

-- Julien MACHOT: shares=23,187, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel Aufore: shares=4,250, ownership=4,250
UPDATE positions p
SET units = 4250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%Aufore%');

-- NextGen: shares=42,285, ownership=42,285
UPDATE positions p
SET units = 42285.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%NextGen%';

-- Cité Gestion: shares=44,423, ownership=44,423
UPDATE positions p
SET units = 44423.00004
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Cité Gestion%';

-- Arboris: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Arboris%';

-- APM: shares=25,505, ownership=25,505
UPDATE positions p
SET units = 25505.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%APM%';

-- Erwan Tarouilly: shares=8,500, ownership=8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%Tarouilly%');

-- Theo Costa: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Theo%' AND i.last_name ILIKE '%Costa%');

-- Divya Bagrecha: shares=10,628, ownership=10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Divya%' AND i.last_name ILIKE '%Bagrecha%');

-- Sebastian Reis: shares=10,628, ownership=10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%Reis%');

-- Ramez Mecataff: shares=2,975, ownership=2,975
UPDATE positions p
SET units = 2975.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Ramez%' AND i.last_name ILIKE '%Mecataff%');

-- Pierre Roy: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%Roy%');

-- Pierre-Henri Froidevaux: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre-Henri%' AND i.last_name ILIKE '%Froidevaux%');

-- Sofiane Zaiem: shares=5,315, ownership=5,315
UPDATE positions p
SET units = 5315.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sofiane%' AND i.last_name ILIKE '%Zaiem%');

-- Jean-Pierre Bettin: shares=2,000, ownership=2,000
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jean-Pierre%' AND i.last_name ILIKE '%Bettin%');

-- Arnaud Wattiez: shares=6,377, ownership=6,377
UPDATE positions p
SET units = 6376.999957
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Arnaud%' AND i.last_name ILIKE '%Wattiez%');

-- Damien Krauser: shares=5,325, ownership=5,325
UPDATE positions p
SET units = 5325.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%Krauser%');

-- SFRD0: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%SFRD0%';

-- Lombard Odier (HOF): shares=1,700, ownership=1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Lombard Odier (HOF)%';

-- Banque Gonet (BAR): shares=1,700, ownership=1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (BAR)%';

-- Banque Gonet (FIR): shares=2,126, ownership=2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (FIR)%';

-- Banque Gonet (HOF): shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (HOF)%';

-- Rainer Buchecker: shares=8,500, ownership=8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Rainer%' AND i.last_name ILIKE '%Buchecker%');

-- Marwan Al Abedin: shares=12,753, ownership=12,753
UPDATE positions p
SET units = 12753.47532
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marwan%' AND i.last_name ILIKE '%Al Abedin%');

-- Jonathan Menoud: shares=2,126, ownership=2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jonathan%' AND i.last_name ILIKE '%Menoud%');

-- Marc Zafrany: shares=7,129, ownership=7,129
UPDATE positions p
SET units = 7129.000128
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marc%' AND i.last_name ILIKE '%Zafrany%');

-- Philippe Houman: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Philippe%' AND i.last_name ILIKE '%Houman%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC106: 206 investors, total ownership: 1,953,065
-- ============================================================

-- Blaine ROLLINS: shares=7,500, ownership=7,500
UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');

-- Blaine ROLLINS: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');

-- Laurence CHANG: shares=5,000, ownership=5,000
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');

-- Laurence CHANG: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');

-- Chang Yong NGAN: shares=5,600, ownership=5,600
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- SHEILA and KAMLESH MADHVANI: shares=10,000, ownership=10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SHEILA and KAMLESH%' AND i.last_name ILIKE '%MADHVANI%');

-- SAMIR KOHI: shares=5,000, ownership=5,000
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SAMIR%' AND i.last_name ILIKE '%KOHI%');

-- Sheikh Yousef AL SABAH: shares=2,631, ownership=2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Han CHIH-HENG: shares=5,555, ownership=5,555
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Han%' AND i.last_name ILIKE '%CHIH-HENG%');

-- Rajiv AGARWALA: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rajiv%' AND i.last_name ILIKE '%AGARWALA%');

-- Daphne Marie CHANDRA: shares=1,756, ownership=1,756
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daphne%' AND i.last_name ILIKE '%CHANDRA%');

-- Daryl PAK YONGJIE: shares=9,167, ownership=9,167
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Ekkawat SAE-JEE: shares=1,388, ownership=1,388
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ekkawat%' AND i.last_name ILIKE '%SAE-JEE%');

-- Tan Sor GEOK: shares=4,448, ownership=4,448
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Tan%' AND i.last_name ILIKE '%GEOK%');

-- DALINGA HOLDING AG: shares=2,512, ownership=2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Matteo Massimo MARTINI: shares=5,025, ownership=5,025
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matteo%' AND i.last_name ILIKE '%MARTINI%');

-- AS ADVISORY DWC-LLC: shares=11,904, ownership=11,904
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- MA GROUP AG: shares=1,507, ownership=1,507
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- KRANA INVESTMENTS PTE. LTD.: shares=13,698, ownership=13,698
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%';

-- Johann Markus AKERMANN: shares=10,000, ownership=10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Sandra KOHLER CABIAN: shares=2,512, ownership=2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%CABIAN%');

-- Dario SCIMONE: shares=2,392, ownership=2,392
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dario%' AND i.last_name ILIKE '%SCIMONE%');

-- OFBR Trust: shares=8,880, ownership=8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OFBR Trust%';

-- Elidon Estate Inc: shares=9,132, ownership=9,132
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Elidon Estate Inc%';

-- Adam Smith Singapore Pte Ltd: shares=1,141, ownership=1,141
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%';

-- Julien MACHOT: shares=6,142, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=160, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Mrs and Mr Beatrice & Marcel KNOPF: shares=2,220, ownership=2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr Beatrice & Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- VOLF Trust: shares=11,101, ownership=11,101
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- Bahama Global Towers Limited: shares=6,500, ownership=6,500
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bahama Global Towers Limited%';

-- CAUSE FIRST Holdings Ltd: shares=4,440, ownership=4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%';

-- Heinz & Barbara WINZ: shares=4,440, ownership=4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Heinz & Barbara%' AND i.last_name ILIKE '%WINZ%');

-- Sabrina WINZ: shares=2,220, ownership=2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sabrina%' AND i.last_name ILIKE '%WINZ%');

-- Mrs and Mr KARKUN: shares=2,272, ownership=2,272
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr%' AND i.last_name ILIKE '%KARKUN%');

-- Craig BROWN: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Craig%' AND i.last_name ILIKE '%BROWN%');

-- TRUE INVESTMENTS 4 LLC: shares=32,631, ownership=32,631
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%';

-- ROSEN INVEST HOLDINGS Inc: shares=4,440, ownership=4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%';

-- Mrs & Mr Subbiah SUBRAMANIAN: shares=6,733, ownership=6,733
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs & Mr Subbiah%' AND i.last_name ILIKE '%SUBRAMANIAN%');

-- JIMENEZ TRADING INC: shares=212,600, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JIMENEZ TRADING INC%';

-- LEE RAND GROUP: shares=2,631, ownership=2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: shares=1,315, ownership=1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: shares=10,526, ownership=10,526
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: shares=1,842, ownership=1,842
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- PANT Investments Inc: shares=5,263, ownership=5,263
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%PANT Investments Inc%';

-- LEE RAND GROUP: shares=2,631, ownership=2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: shares=2,631, ownership=2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: shares=1,315, ownership=1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- Julien MACHOT: shares=21,834, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Hedgebay Securities LLC: shares=4,252, ownership=4,252
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: shares=1,062, ownership=1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: shares=1,062, ownership=1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: shares=1,062, ownership=1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- ONC Limited: shares=212,585, ownership=212,585
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ONC Limited%';

-- Mohammed Abdulaziz AL ABBASI: shares=12,700, ownership=12,700
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%AL ABBASI%');

-- Patrick CORR: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%CORR%');

-- Stephen JORDAN: shares=6,802, ownership=6,802
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephen%' AND i.last_name ILIKE '%JORDAN%');

-- FigTree Family Office Ltd: shares=15,306, ownership=15,306
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%FigTree Family Office Ltd%';

-- Oliver WRIGHT: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Oliver%' AND i.last_name ILIKE '%WRIGHT%');

-- Emile VAN DEN BOL: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emile%' AND i.last_name ILIKE '%VAN DEN BOL%');

-- Mark MATTHEWS: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Matthew HAYCOX: shares=3,188, ownership=3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matthew%' AND i.last_name ILIKE '%HAYCOX%');

-- John ACKERLEY: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%ACKERLEY%');

-- Steve J MANNING: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Steve%' AND i.last_name ILIKE '%MANNING%');

-- Global Custody & Clearing Limited: shares=60,150, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Global Custody & Clearing Limited%';

-- Gregory BROOKS: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Gregory%' AND i.last_name ILIKE '%BROOKS%');

-- Innovatech 1: shares=38,881, ownership=38,881
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Innovatech 1%';

-- Stephane DAHAN: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Jean DUTIL: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jean%' AND i.last_name ILIKE '%DUTIL%');

-- Barnaby John MOORE: shares=6,550, ownership=6,550
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Barnaby%' AND i.last_name ILIKE '%MOORE%');

-- Julien MACHOT: shares=2,125, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Sudon Carlop Holdings Limited: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Sudon Carlop Holdings Limited%';

-- Lesli Ann SCHUTTE: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lesli%' AND i.last_name ILIKE '%SCHUTTE%');

-- Manraj Singh SEKHON: shares=17,006, ownership=17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');

-- IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust: shares=17,006, ownership=17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust%';

-- Serge RICHARD: shares=425, ownership=425
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%RICHARD%');

-- Erich GRAF: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- TERRA Financial & Management Services SA: shares=1,332, ownership=1,332
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Shana NUSSBERGER: shares=7,227, ownership=7,227
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shana%' AND i.last_name ILIKE '%NUSSBERGER%');

-- JASSQ HOLDING LIMITED: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- INNOSIGHT VENTURES Pte Ltd: shares=25,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';

-- INNOSIGHT VENTURES Pte Ltd: shares=7,000, ownership=7,000
UPDATE positions p
SET units = 7000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';

-- GORILLA PE Inc: shares=637,755, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GORILLA PE Inc%';

-- CLOUDSAFE HOLDINGS LTD: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%';

-- David HOLDEN: shares=6,377, ownership=6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- Julien MACHOT: shares=68,000, ownership=32,195
UPDATE positions p
SET units = 32195.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Imrat HAYAT: shares=10,000, ownership=10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imrat%' AND i.last_name ILIKE '%HAYAT%');

-- David BACHELIER: shares=5,314, ownership=5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%BACHELIER%');

-- Talal Chamsi PASHA: shares=452, ownership=452
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%PASHA%');

-- Ashish KOTHARI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ashish%' AND i.last_name ILIKE '%KOTHARI%');

-- Fabien ROTH: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fabien%' AND i.last_name ILIKE '%ROTH%');

-- Fawad MUKHTAR: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fawad%' AND i.last_name ILIKE '%MUKHTAR%');

-- KABELLA LTD: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KABELLA LTD%';

-- SOUTH SOUND LTD: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SOUTH SOUND LTD%';

-- Constantin-Octavian PATRASCU: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Constantin-Octavian%' AND i.last_name ILIKE '%PATRASCU%');

-- Mayuriben Chetan Kumar JOGANI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- CINCORIA LIMITED: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CINCORIA LIMITED%';

-- Hayden RUSHTON: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hayden%' AND i.last_name ILIKE '%RUSHTON%');

-- Mrs Nalini Yoga & Mr Aran James WILLETTS: shares=5,314, ownership=5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%' AND i.last_name ILIKE '%WILLETTS%');

-- Emma Graham-Taylor & Gregory SOMMERVILLE: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emma Graham-Taylor & Gregory%' AND i.last_name ILIKE '%SOMMERVILLE%');

-- Rabin D. and Dolly LAI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rabin D. and Dolly%' AND i.last_name ILIKE '%LAI%');

-- Kim LUND: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kim%' AND i.last_name ILIKE '%LUND%');

-- Ivan BELGA: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%BELGA%');

-- Ayman JOMAA: shares=12,755, ownership=12,755
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ayman%' AND i.last_name ILIKE '%JOMAA%');

-- Karthic JAYARAMAN: shares=17,006, ownership=17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Karthic%' AND i.last_name ILIKE '%JAYARAMAN%');

-- Imran HAKIM: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imran%' AND i.last_name ILIKE '%HAKIM%');

-- Kenilworth Ltd: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Kenilworth Ltd%';

-- Adil Arshed KHAWAJA: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Adil%' AND i.last_name ILIKE '%KHAWAJA%');

-- Bharat Kumar JATANIA: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bharat%' AND i.last_name ILIKE '%JATANIA%');

-- Lubna M. A. QUNASH: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lubna%' AND i.last_name ILIKE '%QUNASH%');

-- Bank SYZ AG: shares=198,193, ownership=198,193
UPDATE positions p
SET units = 198193.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=2,674, ownership=2,674
UPDATE positions p
SET units = 2674.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=1,546, ownership=1,546
UPDATE positions p
SET units = 1546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=1,980, ownership=1,980
UPDATE positions p
SET units = 1980.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=5,291, ownership=5,291
UPDATE positions p
SET units = 5291.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=160, ownership=160
UPDATE positions p
SET units = 160.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=5,502, ownership=5,502
UPDATE positions p
SET units = 5502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Bank SYZ AG: shares=640, ownership=640
UPDATE positions p
SET units = 640.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Damien KRAUSER: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');

-- Bright Phoenix Holdings Limited: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Limited%';

-- Michel Louis GUERIN: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Michel%' AND i.last_name ILIKE '%GUERIN%');

-- Eric Pascal LE SEIGNEUR: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');

-- Swip Holdings Ltd: shares=6,377, ownership=6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Swip Holdings Ltd%';

-- Phaena Advisory Ltd: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Phaena Advisory Ltd%';

-- Bhikhu C. K. PATEL: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bhikhu%' AND i.last_name ILIKE '%PATEL%');

-- Vijaykumar C. K. PATEL: shares=31,887, ownership=31,887
UPDATE positions p
SET units = 31887.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vijaykumar%' AND i.last_name ILIKE '%PATEL%');

-- POTASSIUM Capital: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%POTASSIUM Capital%';

-- Aatif N. HASSAN: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Aatif%' AND i.last_name ILIKE '%HASSAN%');

-- Kevin FOSTER WILTSHIRE: shares=3,188, ownership=3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kevin%' AND i.last_name ILIKE '%WILTSHIRE%');

-- GTV Partners SA: shares=20,391, ownership=20,391
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- LENN Participations SARL: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LENN Participations SARL%';

-- WEALTH TRAIN LIMITED: shares=19,132, ownership=19,132
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%WEALTH TRAIN LIMITED%';

-- Anke Skoludek RICE: shares=3,863, ownership=3,863
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- TERSANE INTERNATIONAL LTD: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%';

-- Brahma Finance (BVI) Ltd: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Brahma Finance (BVI) Ltd%';

-- James A. HARTSHORN: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%HARTSHORN%');

-- Murat Cem and Mehmet Can GOKER: shares=14,880, ownership=14,880
UPDATE positions p
SET units = 14880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');

-- Cyrus ALAMOUTI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Cyrus%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Darius ALAMOUTI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Darius%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Kaveh ALAMOUTI: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kaveh%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Caspian Enterprises Limited: shares=42,517, ownership=42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Caspian Enterprises Limited%';

-- Rensburg Client Nominees Limited A/c CLT: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%';

-- DCMS Holdings Limited: shares=17,006, ownership=17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DCMS Holdings Limited%';

-- GELIGA LIMITED: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GELIGA LIMITED%';

-- Eric SARASIN: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- Damien KRAUSER: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');

-- Eric Pascal LE SEIGNEUR: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');

-- Scott FLETCHER: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- REVERY CAPITAL Limited: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%REVERY CAPITAL Limited%';

-- Sandra KOHLER CABIAN: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Maria Christina CHANDRIS: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Maria Christina%' AND i.last_name ILIKE '%CHANDRIS%');

-- Dimitri CHANDRIS: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dimitri%' AND i.last_name ILIKE '%CHANDRIS%');

-- Nicki ASQUITH: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Nicki%' AND i.last_name ILIKE '%ASQUITH%');

-- Isabella CHANDRIS: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Isabella%' AND i.last_name ILIKE '%CHANDRIS%');

-- Martin AVETISYAN: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Martin%' AND i.last_name ILIKE '%AVETISYAN%');

-- Herve STEIMES: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Herve%' AND i.last_name ILIKE '%STEIMES%');

-- Julien SERRA: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%SERRA%');

-- Frederic SAMAMA: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Frederic%' AND i.last_name ILIKE '%SAMAMA%');

-- Denis MATTHEY: shares=23,870, ownership=23,870
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%';

-- Laurent CUDRE-MAUROUX: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CUDRE-MAUROUX%');

-- Georges Sylvain CYTRON: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Georges%' AND i.last_name ILIKE '%CYTRON%');

-- Rosario RIENZO: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rosario%' AND i.last_name ILIKE '%RIENZO%');

-- Raphael GHESQUIERES: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Raphael%' AND i.last_name ILIKE '%GHESQUIERES%');

-- Guillaume SAMAMA: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Guillaume%' AND i.last_name ILIKE '%SAMAMA%');

-- David Jean ROSSIER: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%ROSSIER%');

-- MARSAULT INTERNATIONAL LTD: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%';

-- Bernard Henri DUFAURE: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bernard%' AND i.last_name ILIKE '%DUFAURE%');

-- Murat Cem and Mehmet Can GOKER: shares=27,636, ownership=27,636
UPDATE positions p
SET units = 27636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');

-- Scott FLETCHER: shares=21,258, ownership=21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Vasily SUKHOTIN: shares=25,510, ownership=25,510
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vasily%' AND i.last_name ILIKE '%SUKHOTIN%');

-- Charles DE BAVIER: shares=8,503, ownership=8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Charles RIVA: shares=21,258, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%RIVA%');

-- Jeremie CYROT: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%CYROT%');

-- Hossien Hakimi JAVID: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hossien%' AND i.last_name ILIKE '%JAVID%');

-- Kamyar BADII: shares=850, ownership=850
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kamyar%' AND i.last_name ILIKE '%BADII%');

-- Shaham SOLOUKI: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shaham%' AND i.last_name ILIKE '%SOLOUKI%');

-- Kian Mohammad Hakimi JAVID: shares=1,062, ownership=1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kian%' AND i.last_name ILIKE '%JAVID%');

-- Salman Raza HUSSAIN: shares=2,125, ownership=2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Salman%' AND i.last_name ILIKE '%HUSSAIN%');

-- Juan TONELLI BANFI: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Juan%' AND i.last_name ILIKE '%TONELLI BANFI%');

-- GREENLEAF: shares=65,865, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GREENLEAF%';

-- Banco BTG Pactual S.A. Client 12279: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%';

-- Banco BTG Pactual S.A. Client 34658: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%';

-- Banco BTG Pactual S.A. Client 34924: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%';

-- Banco BTG Pactual S.A. Client 36003: shares=10,629, ownership=10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%';

-- Banco BTG Pactual S.A. Client 36749: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%';

-- Banco BTG Pactual S.A. Client 36957: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%';

-- Banco BTG Pactual S.A. Client 80738: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%';

-- Banco BTG Pactual S.A. Client 80772: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%';

-- Banco BTG Pactual S.A. Client 80775: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%';

-- Banco BTG Pactual S.A. Client 80776: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%';

-- Banco BTG Pactual S.A. Client 80840: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%';

-- Banco BTG Pactual S.A. Client 80862: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%';

-- Banco BTG Pactual S.A. Client 80873: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%';

-- Banco BTG Pactual S.A. Client 80890: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%';

-- Banco BTG Pactual S.A. Client 80910: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%';

-- Banco BTG Pactual S.A. Client 81022: shares=4,251, ownership=4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%';

-- Banco BTG Pactual S.A. Client 515: shares=42,517, ownership=42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%';

-- RLABS HOLDINGS LTD: shares=23,384, ownership=23,384
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%RLABS HOLDINGS LTD%';

-- OLD HILL INVESTMENT GROUP LLC: shares=29,761, ownership=29,761
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%';

-- Samuel GRANDCHAMP: shares=3,188, ownership=3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Samuel%' AND i.last_name ILIKE '%GRANDCHAMP%');

-- Luiz Eduardo FONTES WILLIAMS: shares=4,078, ownership=4,078
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Luiz%' AND i.last_name ILIKE '%FONTES WILLIAMS%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=38,827, ownership=38,827
UPDATE positions p
SET units = 38827.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=20,947, ownership=20,947
UPDATE positions p
SET units = 20947.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- STABLETON (ALTERNATIVE ISSUANCE): shares=169,781, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%STABLETON (ALTERNATIVE ISSUANCE)%';

-- Julien MACHOT: shares=3,636, ownership=3,636
UPDATE positions p
SET units = 3636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC111: 38 investors, total ownership: 6,750,000
-- ============================================================

-- Julien MACHOT: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- ROSEN INVEST HOLDINGS INC: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%';

-- STRUCTURED ISSUANCE Ltd: shares=250,000, ownership=250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%';

-- DALINGA HOLDING AG: shares=115,000, ownership=115,000
UPDATE positions p
SET units = 115000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Tartrifuge SA: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Tartrifuge SA%';

-- OEP LIMITED
(Transfer from AS ADVISORY DWC LLC): shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%OEP LIMITED
(Transfer from AS ADVISORY DWC LLC)%';

-- David HOLDEN: shares=200,000, ownership=200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- TERRA Financial & Management Services SA: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Dan
Jean BAUMSLAG
DUTIL: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan
Jean%' AND i.last_name ILIKE '%BAUMSLAG
DUTIL%');

-- Stephane DAHAN: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Bruce HAWKINS: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Bruce%' AND i.last_name ILIKE '%HAWKINS%');

-- VOLF Trust: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- James BURCH: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%BURCH%');

-- Mark MATTHEWS: shares=200,000, ownership=200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Sandra KOHLER CABIAN: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Johann Markus AKERMANN: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Erich GRAF: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Alberto Attilio RAVANO: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Alberto%' AND i.last_name ILIKE '%RAVANO%');

-- FINALMA SUISSE SA: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%FINALMA SUISSE SA%';

-- MONFIN LTD: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%MONFIN LTD%';

-- Bright Phoenix Holdings LTD: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings LTD%';

-- Antonio Bruno PERONACE: shares=70,000, ownership=70,000
UPDATE positions p
SET units = 70000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Antonio%' AND i.last_name ILIKE '%PERONACE%');

-- Julien MACHOT: shares=760,000, ownership=260,000
UPDATE positions p
SET units = 260000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- BRAHMA FINANCE: shares=250,000, ownership=250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BRAHMA FINANCE%';

-- GTV Partners SA: shares=600,000, ownership=600,000
UPDATE positions p
SET units = 600000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- Denis MATTHEY: shares=1,000,000, ownership=1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Beatrice and Marcel KNOPF: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- BenSkyla AG: shares=200,000, ownership=200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BenSkyla AG%';

-- Peter HOGLAND: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Peter%' AND i.last_name ILIKE '%HOGLAND%');

-- Wymo Finance Limited: shares=500,000, ownership=250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- HASSBRO Investments Limited: shares=500,000, ownership=250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';

-- Vladimir GUSEV: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');

-- Vladimir GUSEV: shares=50,000, ownership=50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');

-- Zandera (Finco) Limited: shares=100,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- TERRA Financial & Management Services SA: shares=30,000, ownership=30,000
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- LPP Investment Holdings Ltd: shares=1,000,000, ownership=1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%LPP Investment Holdings Ltd%';

-- Mickael RYAN: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- VC112: 25 investors, total ownership: 1,959,129
-- ============================================================

-- Julien MACHOT: shares=629,405, ownership=393,220
UPDATE positions p
SET units = 393220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: shares=100,704, ownership=100,704
UPDATE positions p
SET units = 100704.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Gershon KOH: shares=201,409, ownership=201,409
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Dan BAUMSLAG: shares=50,352, ownership=50,352
UPDATE positions p
SET units = 50352.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: shares=151,057, ownership=151,057
UPDATE positions p
SET units = 151057.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=503,524, ownership=470,783
UPDATE positions p
SET units = 470783.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=44,444, ownership=22,472
UPDATE positions p
SET units = 22472.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: shares=16,370, ownership=16,370
UPDATE positions p
SET units = 16370.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- OEP Ltd: shares=32,741, ownership=32,741
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: shares=16,370, ownership=16,370
UPDATE positions p
SET units = 16370.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';

-- Julien MACHOT: shares=85,128, ownership=85,128
UPDATE positions p
SET units = 85128.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Robert Jan DETTMEIJER: shares=13,096, ownership=13,096
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: shares=12,038, ownership=12,038
UPDATE positions p
SET units = 12038.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';

-- REVERY Capital Limited: shares=32,741, ownership=32,741
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%REVERY Capital Limited%';

-- Beatrice and Marcel KNOPF: shares=8,186, ownership=8,186
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Liudmila and Alexey ROMANOV: shares=40,931, ownership=40,931
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- Tom ROAD: shares=1,227, ownership=1,227
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%ROAD%');

-- Sheikh Yousef AL SABAH: shares=4,093, ownership=4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Giovanni Antonio Alberto ALBERTINI: shares=4,093, ownership=4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Giovanni%' AND i.last_name ILIKE '%ALBERTINI%');

-- Julien MACHOT: shares=43,797, ownership=43,797
UPDATE positions p
SET units = 43797.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO X: shares=236,185, ownership=236,185
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%VERSO X%';

-- Julien MACHOT: shares=61, ownership=61
UPDATE positions p
SET units = 61.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=100, ownership=100
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=3, ownership=3
UPDATE positions p
SET units = 3.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: shares=21,972, ownership=21,972
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';


-- ============================================================
-- VC113: 80 investors, total ownership: 879,091
-- ============================================================

-- Julien MACHOT: shares=75,485, ownership=72,131
UPDATE positions p
SET units = 72131.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Barbara and Heinz WINZ: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Barbara and Heinz%' AND i.last_name ILIKE '%WINZ%');

-- Sandra KOHLER CABIAN: shares=2,795, ownership=2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: shares=2,795, ownership=2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Dalinga AG: shares=5,590, ownership=5,590
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';

-- Dalinga AG: shares=559, ownership=559
UPDATE positions p
SET units = 559.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';

-- Liudmila Romanova and Alexey ROMANOV: shares=14,907, ownership=14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liudmila Romanova and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST: shares=14,907, ownership=14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%';

-- Andrey GORYAINOV: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrey%' AND i.last_name ILIKE '%GORYAINOV%');

-- Liubov and Igor ZINKEVICH: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liubov and Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Sheila and Kamlesh MADHVANI: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheila and Kamlesh%' AND i.last_name ILIKE '%MADHVANI%');

-- Rosen Invest Holdings Inc: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Rosen Invest Holdings Inc%';

-- Zandera (Finco) Limited: shares=25,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- Mark HAYWARD: shares=1,250, ownership=1,250
UPDATE positions p
SET units = 1250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');

-- Beatrice and Marcel KNOPF: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Scott Ikott TOMMEY: shares=3,750, ownership=3,750
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%TOMMEY%');

-- Gershon KOH: shares=7,453, ownership=7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Signet Logistics Ltd: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Signet Logistics Ltd%';

-- Erich GRAF: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Shrai and Aparna MADHVANI: shares=2,500, ownership=2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Shrai and Aparna%' AND i.last_name ILIKE '%MADHVANI%');

-- Ivan DE: shares=1,863, ownership=1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%DE%');

-- Bright Phoenix Holdings Ltd: shares=3,773, ownership=3,773
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%';

-- TEKAPO Group Limited: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%TEKAPO Group Limited%';

-- Philip ALGAR: shares=1,863, ownership=1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Philip%' AND i.last_name ILIKE '%ALGAR%');

-- Sebastian MERIDA: shares=1,118, ownership=1,118
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%MERIDA%');

-- EMPIRE GROUP Limited: shares=7,453, ownership=7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%EMPIRE GROUP Limited%';

-- Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN: shares=3,913, ownership=3,913
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Nilakantan & Mr Subbiah%' AND i.last_name ILIKE '%MAHESWARI & SUBRAMANIAN%');

-- Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA: shares=4,099, ownership=4,099
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%' AND i.last_name ILIKE '%HIQUIANA-TANEJA & TANEJA%');

-- SAFE: shares=9,317, ownership=9,317
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SAFE%';

-- FRALIS SPF: shares=18,634, ownership=18,634
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';

-- SUMMIT INVESTMENT HOLDINGS LLC: shares=11,180, ownership=11,180
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SUMMIT INVESTMENT HOLDINGS LLC%';

-- NEWBRIDGE FINANCE SPF: shares=104,355, ownership=104,355
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%';

-- Mayuriben Chetan K. JOGANI: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- Charles DE BAVIER: shares=7,453, ownership=7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Erwan TAROUILLY: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%TAROUILLY%');

-- Thierry ULDRY: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Thierry%' AND i.last_name ILIKE '%ULDRY%');

-- Scott FLETCHER: shares=18,634, ownership=18,634
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Jeremie COMEL: shares=745, ownership=745
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%COMEL%');

-- Nineteen77 Global Multi-Strategy Alpha Master Limited: shares=226,406, ownership=75,469
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%';

-- Gielke Jan BURGMANS: shares=3,726, ownership=3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gielke%' AND i.last_name ILIKE '%BURGMANS%');

-- Halim EL MOGHAZI: shares=969, ownership=969
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Halim%' AND i.last_name ILIKE '%EL MOGHAZI%');

-- John BARROWMAN: shares=633, ownership=633
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- Robin DOBLE: shares=931, ownership=931
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Tuygan GOKER: shares=18,871, ownership=18,871
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Hong Bao NGOC LE: shares=372, ownership=372
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Hong%' AND i.last_name ILIKE '%NGOC LE%');

-- Marco JERRENTRUP: shares=1,863, ownership=1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- Zandera (Finco) Limited: shares=23,809, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- Julien MACHOT: shares=150,937, ownership=76,398
UPDATE positions p
SET units = 76398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Deyan D MIHOV: shares=2,236, ownership=2,236
UPDATE positions p
SET units = 2236.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Julien MACHOT: shares=80,166, ownership=35,301
UPDATE positions p
SET units = 35301.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Denis MATTHEY: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Robert Jan DETTMEIJER: shares=3,653, ownership=3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- Daniel BAUMSLAG: shares=3,653, ownership=3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- SMR3T Capital Pte Ltd: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SMR3T Capital Pte Ltd%';

-- CLOUD IN HEAVEN SAS: shares=3,653, ownership=3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%CLOUD IN HEAVEN SAS%';

-- Majid MOHAMMED: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid%' AND i.last_name ILIKE '%MOHAMMED%');

-- Julien MACHOT: shares=3,661, ownership=3,661
UPDATE positions p
SET units = 3661.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- AS ADVISORY DWC LLC: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- OEP Ltd: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- PETRATECH: shares=7,307, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%PETRATECH%';

-- FRALIS SPF: shares=14,615, ownership=14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';

-- Benjamin POURRAT: shares=481, ownership=481
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%POURRAT%');

-- Mark MATTHEWS: shares=1,694, ownership=1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Scott FLETCHER: shares=74,539, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Julien MACHOT: shares=74,539, ownership=74,539
UPDATE positions p
SET units = 74539.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Mark HAYWARD: shares=2,000, ownership=2,000
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');

-- Zandera (Holdco) Limited: shares=12,500, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Majid (VOIDED) KADDOUMI (VOIDED): shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid (VOIDED)%' AND i.last_name ILIKE '%KADDOUMI (VOIDED)%');

-- Sheikh Yousef AL SABAH: shares=1,694, ownership=1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Andrew MEYER: shares=6,779, ownership=6,779
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Abhie Shreyas SHAH: shares=3,389, ownership=3,389
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Abhie%' AND i.last_name ILIKE '%SHAH%');

-- Deyan D MIHOV: shares=3,354, ownership=3,354
UPDATE positions p
SET units = 3354.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Zandera (Holdco) Limited: shares=14,634, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Julien MACHOT: shares=7,307, ownership=7,307
UPDATE positions p
SET units = 7307.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Keir BENBOW: shares=1,694, ownership=1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Mickael RYAN: shares=25,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');

-- Mickael RYAN: shares=23,809, ownership=23,809
UPDATE positions p
SET units = 23809.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');

-- Mickael RYAN: shares=12,500, ownership=12,500
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');

-- Mickael RYAN: shares=14,634, ownership=14,634
UPDATE positions p
SET units = 14634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');


-- ============================================================
-- VC114: 4 investors, total ownership: 530,000
-- ============================================================

-- Julien MACHOT: shares=530,000, ownership=200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Revery Capital Limited: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Revery Capital Limited%';

-- Prometheus Capital Finance Ltd: shares=30,000, ownership=30,000
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Prometheus Capital Finance Ltd%';

-- Manraj Singh SEKHON: shares=200,000, ownership=200,000
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

-- Julien MACHOT: shares=715, ownership=715
UPDATE positions p
SET units = 715.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC115'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC116: 6 investors, total ownership: 132,825
-- ============================================================

-- Julien MACHOT: shares=270,562, ownership=10,562
UPDATE positions p
SET units = 10562.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=33,820, ownership=33,820
UPDATE positions p
SET units = 33820.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Robin DOBLE: shares=21,619, ownership=21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Dan BAUMSLAG: shares=21,619, ownership=21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: shares=88,443, ownership=45,205
UPDATE positions p
SET units = 45205.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO X: shares=-260,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND i.legal_name ILIKE '%VERSO X%';


-- ============================================================
-- VC118: 7 investors, total ownership: 150,000
-- ============================================================

-- Julien MACHOT: shares=119,233, ownership=909
UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VOLF TRUST: shares=7,692, ownership=7,692
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%VOLF TRUST%';

-- Liudmila and Alexey ROMANOVA & ROMANOV: shares=15,384, ownership=15,384
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOVA & ROMANOV%');

-- SIGNET LOGISTICS Ltd: shares=3,076, ownership=3,076
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%';

-- Markus AKERMANN: shares=4,615, ownership=4,615
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Talal CHAMSI PASHA: shares=39,000, ownership=39,000
UPDATE positions p
SET units = 39000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');

-- Talal CHAMSI PASHA: shares=79,324, ownership=79,324
UPDATE positions p
SET units = 79324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');


-- ============================================================
-- VC119: 2 investors, total ownership: 7,343
-- ============================================================

-- Julien MACHOT: shares=7,343, ownership=7,343
UPDATE positions p
SET units = 7343.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC120: 4 investors, total ownership: 500,000
-- ============================================================

-- FRALIS SA SPF: shares=150,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND i.legal_name ILIKE '%FRALIS SA SPF%';

-- Gershon KOH: shares=200,000, ownership=200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Sandra KOHLER CABIAN: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');


-- ============================================================
-- VC121: 2 investors, total ownership: 172,413
-- ============================================================

-- Julien MACHOT: shares=43,103, ownership=43,103
UPDATE positions p
SET units = 43103.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=129,310, ownership=129,310
UPDATE positions p
SET units = 129310.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC122: 10 investors, total ownership: 409,440
-- ============================================================

-- Julien MACHOT: shares=249,525, ownership=113,598
UPDATE positions p
SET units = 113598.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- AS ADVISORY DWC LLC: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- Deyan D MIHOV: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Sheikh Yousef AL SABAH: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Anke Skoludek RICE: shares=95,949, ownership=95,949
UPDATE positions p
SET units = 95949.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- VERSO CAPITAL ESTABLISHMENT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%VERSO CAPITAL ESTABLISHMENT%';

-- INNOVATECH COMPARTMENT 8: shares=39,978, ownership=39,978
UPDATE positions p
SET units = 39978.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%';

-- Julien MACHOT: shares=159,915, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Erich GRAF: shares=159,915, ownership=159,915
UPDATE positions p
SET units = 159915.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- LF GROUP SARL: shares=0, ownership=0
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

-- Julien MACHOT: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC124: 12 investors, total ownership: 2,809,648
-- ============================================================

-- JASSQ Holding Limited: shares=15,000, ownership=15,000
UPDATE positions p
SET units = 15000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%JASSQ Holding Limited%';

-- OEP Ltd: shares=4,125, ownership=4,125
UPDATE positions p
SET units = 4125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Scott FLETCHER: shares=20,627, ownership=20,627
UPDATE positions p
SET units = 20627.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Julien MACHOT: shares=0, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: shares=822, ownership=822
UPDATE positions p
SET units = 822.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Christine MASCORT SULLENGER: shares=3,300, ownership=3,300
UPDATE positions p
SET units = 3300.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Christine%' AND i.last_name ILIKE '%MASCORT SULLENGER%');

-- JASSQ Holding Limited: shares=259,636, ownership=259,636
UPDATE positions p
SET units = 259636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%JASSQ Holding Limited%';

-- OEP Ltd: shares=86,430, ownership=86,430
UPDATE positions p
SET units = 86430.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Scott FLETCHER: shares=1,728,608, ownership=1,728,608
UPDATE positions p
SET units = 1728608.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Julien MACHOT: shares=288,716, ownership=288,716
UPDATE positions p
SET units = 288716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO Capital Establishment: shares=345,721, ownership=345,721
UPDATE positions p
SET units = 345721.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%VERSO Capital Establishment%';

-- Christine MASCORT SULLENGER: shares=56,663, ownership=56,663
UPDATE positions p
SET units = 56663.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Christine%' AND i.last_name ILIKE '%MASCORT SULLENGER%');


-- ============================================================
-- VC125: 34 investors, total ownership: 16,088
-- ============================================================

-- Julien MACHOT: shares=1,075, ownership=1,075
UPDATE positions p
SET units = 1075.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Patrick BIECHELER: shares=169, ownership=169
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%BIECHELER%');

-- SC STONEA: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';

-- Christophe SORAIS: shares=225, ownership=225
UPDATE positions p
SET units = 225.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Christophe%' AND i.last_name ILIKE '%SORAIS%');

-- Alain DECOMBE: shares=451, ownership=451
UPDATE positions p
SET units = 451.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');

-- TELEGRAPH HILL CAPITAL: shares=2,398, ownership=2,398
UPDATE positions p
SET units = 2398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%TELEGRAPH HILL CAPITAL%';

-- Eric SARASIN: shares=1,410, ownership=1,410
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- ZEBRA HOLDING: shares=112, ownership=112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ZEBRA HOLDING%';

-- Sylvain GARIEL: shares=112, ownership=112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Sylvain%' AND i.last_name ILIKE '%GARIEL%');

-- Benjamin PRESSET: shares=112, ownership=112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%PRESSET%');

-- CAREITAS: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%CAREITAS%';

-- OEP LTD: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%OEP LTD%';

-- AS ADVISORY: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%AS ADVISORY%';

-- Laurent CREHANGE: shares=56, ownership=56
UPDATE positions p
SET units = 56.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CREHANGE%');

-- Pierre LECOMTE: shares=203, ownership=203
UPDATE positions p
SET units = 203.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%LECOMTE%');

-- ALPHA OMEGA SAS: shares=28, ownership=28
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ALPHA OMEGA SAS%';

-- GOOD PROTEIN FUND VCC: shares=1,410, ownership=1,410
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- DALINGA HOLDING AG: shares=141, ownership=141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- DALINGA HOLDING AG: shares=28, ownership=28
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- MA GROUP AG: shares=100, ownership=100
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- Andrew MEYER: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Thomas YBERT: shares=141, ownership=141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Thomas%' AND i.last_name ILIKE '%YBERT%');

-- Xavier GODRON: shares=112, ownership=112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Xavier%' AND i.last_name ILIKE '%GODRON%');

-- Anand RATHI: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Dan BAUMSLAG: shares=141, ownership=141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Serge AURIER: shares=282, ownership=282
UPDATE positions p
SET units = 282.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Julien MACHOT: shares=1,543, ownership=979
UPDATE positions p
SET units = 979.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Robin DOBLE: shares=141, ownership=141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- GOOD PROTEIN FUND VCC: shares=1,415, ownership=1,415
UPDATE positions p
SET units = 1415.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- Eric SARASIN: shares=502, ownership=502
UPDATE positions p
SET units = 502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- Alain DECOMBE: shares=152, ownership=152
UPDATE positions p
SET units = 152.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');

-- SC STONEA: shares=197, ownership=197
UPDATE positions p
SET units = 197.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';

-- Julien MACHOT: shares=48, ownership=48
UPDATE positions p
SET units = 48.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- LF GROUP SARL: shares=564, ownership=564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- VC126: 44 investors, total ownership: 66,254
-- ============================================================

-- CLOUDSAFE HOLDINGS LIMITED: shares=888, ownership=8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%';

-- AS Advisory DWC-LLC: shares=76, ownership=760
UPDATE positions p
SET units = 760.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%AS Advisory DWC-LLC%';

-- Scott FLETCHER: shares=2,016, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Scott FLETCHER: shares=403, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Anand RATHI: shares=403, ownership=4,030
UPDATE positions p
SET units = 4030.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Tuygan GOKER: shares=1,612, ownership=16,120
UPDATE positions p
SET units = 16120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Julien MACHOT: shares=89, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO MANAGEMENT LTD.: shares=315, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%VERSO MANAGEMENT LTD.%';

-- BBQ Opportunity Ventures: shares=315, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BBQ Opportunity Ventures%';

-- OEP Ltd: shares=77, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- FITAIHI Holdings SARL: shares=89, ownership=890
UPDATE positions p
SET units = 890.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%FITAIHI Holdings SARL%';

-- SC TBC INVEST 3: shares=6,071, ownership=6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%SC TBC INVEST 3%';

-- ODIN (ANIM X II LP): shares=4,935, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN (ANIM X II LP)%';

-- Serge AURIER: shares=649, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- John BARROWMAN: shares=735, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- Anand RATHI: shares=3,676, ownership=3,676
UPDATE positions p
SET units = 3676.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- DRussell Goman RD LLC: shares=367, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- Garson Brandon LEVY: shares=367, ownership=367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Garson%' AND i.last_name ILIKE '%LEVY%');

-- Mrs Anisha Bansal and Mr Rahul KARKUN: shares=367, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mrs Anisha Bansal and Mr Rahul%' AND i.last_name ILIKE '%KARKUN%');

-- Mathieu MARIOTTI: shares=1,838, ownership=1,838
UPDATE positions p
SET units = 1838.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mathieu%' AND i.last_name ILIKE '%MARIOTTI%');

-- Alexandre BARBARANELLI: shares=441, ownership=441
UPDATE positions p
SET units = 441.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Alexandre%' AND i.last_name ILIKE '%BARBARANELLI%');

-- Keir BENBOW: shares=1,470, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Amanda RYZOWY: shares=367, ownership=367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Amanda%' AND i.last_name ILIKE '%RYZOWY%');

-- ALPHA GAIA CAPITAL FZE: shares=1,111, ownership=1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%';

-- Desmond CARBERY: shares=1,111, ownership=1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Desmond%' AND i.last_name ILIKE '%CARBERY%');

-- Odile and Georges Abou MRAD and FENERGI: shares=1,111, ownership=1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Odile and Georges%' AND i.last_name ILIKE '%MRAD and FENERGI%');

-- Georgi GEORGIEV: shares=2,469, ownership=2,469
UPDATE positions p
SET units = 2469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Georgi%' AND i.last_name ILIKE '%GEORGIEV%');

-- Anatoliy KOGAN: shares=1,111, ownership=1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anatoliy%' AND i.last_name ILIKE '%KOGAN%');

-- GESTIO CAPITAL LTD: shares=4,320, ownership=4,320
UPDATE positions p
SET units = 4320.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%GESTIO CAPITAL LTD%';

-- Danielle BURNS: shares=111, ownership=111
UPDATE positions p
SET units = 111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Danielle%' AND i.last_name ILIKE '%BURNS%');

-- LF GROUP SARL: shares=2,272, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- BSV SPV III LLC: shares=10,700, ownership=10,700
UPDATE positions p
SET units = 10700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BSV SPV III LLC%';

-- ODIN (ANIM X II LP): shares=2,840, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN (ANIM X II LP)%';

-- Julien MACHOT: shares=77, ownership=770
UPDATE positions p
SET units = 770.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: shares=-226, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- DRussell Goman RD LLC: shares=-367, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- Serge AURIER: shares=-423, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Mrs Anisha Bansal and Mr Rahul KARKUN: shares=-367, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mrs Anisha Bansal and Mr Rahul%' AND i.last_name ILIKE '%KARKUN%');

-- LF GROUP SARL: shares=-2,272, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- John BARROWMAN: shares=-735, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- Keir BENBOW: shares=-1,470, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Scott FLETCHER: shares=-24,190, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- ANIM X II LP: shares=-4,935, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ANIM X II LP%';

-- ODIN: shares=-2,840, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN%';


-- ============================================================
-- VC128: 4 investors, total ownership: 357,142
-- ============================================================

-- Julien MACHOT: shares=178,571, ownership=178,571
UPDATE positions p
SET units = 178571.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: shares=142,857, ownership=71,429
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Dan BAUMSLAG: shares=35,714, ownership=35,714
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: shares=71,428, ownership=71,428
UPDATE positions p
SET units = 71428.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC130: 5 investors, total ownership: 500,000
-- ============================================================

-- Julien MACHOT: shares=250,000, ownership=250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=250,000, ownership=233,748
UPDATE positions p
SET units = 233748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Tuygan GOKER: shares=12,502, ownership=12,502
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Scott LIVINGSTONE: shares=833, ownership=833
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%LIVINGSTONE%');

-- Daniel BAUMSLAG: shares=2,917, ownership=2,917
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');


-- ============================================================
-- VC131: 4 investors, total ownership: 65,000
-- ============================================================

-- Julien MACHOT: shares=20,000, ownership=20,000
UPDATE positions p
SET units = 20000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=20,000, ownership=20,000
UPDATE positions p
SET units = 20000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=12,500, ownership=12,500
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=12,500, ownership=12,500
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC132: 2 investors, total ownership: 27,546
-- ============================================================

-- Julien MACHOT: shares=11,505, ownership=11,505
UPDATE positions p
SET units = 11505.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=16,041, ownership=16,041
UPDATE positions p
SET units = 16041.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC133: 16 investors, total ownership: 2,249
-- ============================================================

-- Charles DE BAVIER: shares=66, ownership=66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- JASSQ HOLDING LIMITED: shares=200, ownership=200
UPDATE positions p
SET units = 200.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- CARTA INVESTMENTS LLC: shares=66, ownership=66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%CARTA INVESTMENTS LLC%';

-- Sahejman Singh KAHLON: shares=33, ownership=33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Sahejman%' AND i.last_name ILIKE '%KAHLON%');

-- 777 WALNUT LLC: shares=33, ownership=33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%777 WALNUT LLC%';

-- Keir Richard BENBOW: shares=35, ownership=35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Marco JERRENTRUP: shares=35, ownership=35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- ZANDERA (Holdco) Ltd: shares=645, ownership=645
UPDATE positions p
SET units = 645.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%';

-- Band Capital Limited: shares=358, ownership=358
UPDATE positions p
SET units = 358.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%Band Capital Limited%';

-- Jeremy LOWY: shares=33, ownership=33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');

-- Tuygan GOKER: shares=369, ownership=369
UPDATE positions p
SET units = 369.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Tuygan GOKER: shares=347, ownership=347
UPDATE positions p
SET units = 347.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- VERSO HOLDINGS: shares=4, ownership=4
UPDATE positions p
SET units = 4.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%VERSO HOLDINGS%';

-- Tobias JOERN: shares=6, ownership=6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tobias%' AND i.last_name ILIKE '%JOERN%');

-- René ROSSDEUTSCHER: shares=13, ownership=13
UPDATE positions p
SET units = 13.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%René%' AND i.last_name ILIKE '%ROSSDEUTSCHER%');

-- Ellen STAUDENMAYER: shares=6, ownership=6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Ellen%' AND i.last_name ILIKE '%STAUDENMAYER%');


-- ============================================================
-- VC134: 5 investors, total ownership: 2,536,332
-- ============================================================

-- ISP CH1149139870: shares=1,900,000, ownership=1,900,000
UPDATE positions p
SET units = 1900000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';

-- PROGETTO UNO SPA: shares=501,101, ownership=501,101
UPDATE positions p
SET units = 501101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%PROGETTO UNO SPA%';

-- Stefano CAPRA: shares=100,220, ownership=100,220
UPDATE positions p
SET units = 100220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Stefano%' AND i.last_name ILIKE '%CAPRA%');

-- Julien MACHOT: shares=5,011, ownership=5,011
UPDATE positions p
SET units = 5011.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- ISP CH1149139870: shares=30,000, ownership=30,000
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';


-- ============================================================
-- VC135: 3 investors, total ownership: 550,000
-- ============================================================

-- Dan BAUMSLAG: shares=400,000, ownership=400,000
UPDATE positions p
SET units = 400000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: shares=400,000, ownership=150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=-250,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC137: 2 investors, total ownership: 50,000
-- ============================================================

-- Julien MACHOT: shares=25,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Julien MACHOT: shares=25,000, ownership=25,000
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


-- ============================================================
-- VC138: 1 investors, total ownership: 20
-- ============================================================

-- Scott FLETCHER: shares=20, ownership=20
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

-- Mrs Beatrice and Mr Marcel KNOPF: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Beatrice and Mr Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Mrs Liubov and Mr Igor ZINKEVICH: shares=96,000, ownership=96,000
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Liubov and Mr Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Julien MACHOT: shares=50,000, ownership=50,000
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

-- Julien MACHOT: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: shares=75,000, ownership=75,000
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

-- Julien MACHOT: shares=100,000, ownership=0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Deyan D. MIHOV: shares=75,000, ownership=75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- LF GROUP SARL: shares=100,000, ownership=100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- SUMMARY: 41 vehicles, 641 position updates
-- ============================================================

COMMIT;