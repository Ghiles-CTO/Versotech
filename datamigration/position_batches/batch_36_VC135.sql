-- Batch 36: VC135
-- 3 position updates

UPDATE positions p
SET units = 400000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');