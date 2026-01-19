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