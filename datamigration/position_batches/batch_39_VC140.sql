-- Batch 39: VC140
-- 3 position updates

UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Beatrice and Mr Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Liubov and Mr Igor%' AND i.last_name ILIKE '%ZINKEVICH%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');