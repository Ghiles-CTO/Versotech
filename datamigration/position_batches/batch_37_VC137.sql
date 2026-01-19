-- Batch 37: VC137
-- 2 position updates

UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');