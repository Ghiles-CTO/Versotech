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