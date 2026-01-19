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