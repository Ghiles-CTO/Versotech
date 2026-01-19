-- Batch 19: VC115
-- 1 position updates

UPDATE positions p
SET units = 715.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC115'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');