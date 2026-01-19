-- Batch 33: VC132
-- 2 position updates

UPDATE positions p
SET units = 11505.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 16041.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');