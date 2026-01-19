-- Batch 22: VC119
-- 2 position updates

UPDATE positions p
SET units = 7343.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');