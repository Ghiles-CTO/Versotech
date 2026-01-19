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