-- IN-series position updates

-- batch_04_IN104.sql
-- Batch 4: IN104
-- 1 position updates

UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN104'
  AND i.legal_name ILIKE '%VERSO HOLDINGS SARL%';

-- batch_05_IN105.sql
-- Batch 5: IN105
-- 6 position updates

UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%GATZ%');
UPDATE positions p
SET units = 25.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%VERSO Holdings S.à r.l.%';
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Improvitae B.V.%';
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%François-Xavier%' AND i.last_name ILIKE '%GIRAUD%');
UPDATE positions p
SET units = 15.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Star of the Sea Limited%';
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Nicolas%' AND i.last_name ILIKE '%WYDLER%');

-- batch_06_IN106.sql
-- Batch 6: IN106
-- 2 position updates

UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';
UPDATE positions p
SET units = 2004.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN106'
  AND (i.first_name ILIKE '%Neville%' AND i.last_name ILIKE '%TATA%');

-- batch_07_IN108.sql
-- Batch 7: IN108
-- 4 position updates

UPDATE positions p
SET units = 750000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');
UPDATE positions p
SET units = -25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');
UPDATE positions p
SET units = -225000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');
UPDATE positions p
SET units = -500000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN108'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%SETHIA%');

-- batch_08_IN109.sql
-- Batch 8: IN109
-- 1 position updates

UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN109'
  AND i.legal_name ILIKE '%L1 SC Invest 6%';

-- batch_09_IN110.sql
-- Batch 9: IN110
-- 6 position updates

UPDATE positions p
SET units = 15000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%William%' AND i.last_name ILIKE '%TOYE%');
UPDATE positions p
SET units = 36000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Eddie%' AND i.last_name ILIKE '%BEARNOT%');
UPDATE positions p
SET units = 44000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Naweed%' AND i.last_name ILIKE '%AHMED%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');
UPDATE positions p
SET units = 60000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%Sarah%' AND i.last_name ILIKE '%DAVIES%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN110'
  AND (i.first_name ILIKE '%William%' AND i.last_name ILIKE '%TOYE%');

-- batch_10_IN111.sql
-- Batch 10: IN111
-- 3 position updates

UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');
UPDATE positions p
SET units = 103.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');
UPDATE positions p
SET units = 2344.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN111'
  AND (i.first_name ILIKE '%Boris%' AND i.last_name ILIKE '%IPPOLITOV%');

