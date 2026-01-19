-- IN101
 1 investors, total ownership: 38,881
-- ============================================================

-- Innovatech 1: total ownership = 38,881
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN101'
  AND i.legal_name ILIKE '%Innovatech 1%';



-- IN102
 8 investors, total ownership: 603
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



-- IN103
 8 investors, total ownership: 302,229
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



-- IN104
 1 investors, total ownership: 150,000
-- ============================================================

-- VERSO HOLDINGS SARL: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN104'
  AND i.legal_name ILIKE '%VERSO HOLDINGS SARL%';



-- IN105
 6 investors, total ownership: 70
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



-- IN106
 2 investors, total ownership: 2,004
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



-- IN108
 1 investors, total ownership: 0
-- ============================================================

-- Anand SETHIA: total ownership = 0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');



-- IN109
 1 investors, total ownership: 6,071
-- ============================================================

-- L1 SC Invest 6: total ownership = 6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN109'
  AND i.legal_name ILIKE '%L1 SC Invest 6%';



-- IN110
 5 investors, total ownership: 255,000
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



-- IN111
 1 investors, total ownership: 77,447
-- ============================================================

-- Boris IPPOLITOV: total ownership = 77,447
UPDATE positions p
SET units = 77447.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');



-- VC102
 4 investors, total ownership: 154,000
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


