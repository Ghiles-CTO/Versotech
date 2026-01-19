-- Batch 5: IN105
-- 6 position updates

UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%GATZ%');
UPDATE positions p
SET units = 25.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%VERSO Holdings S.à r.l.%';
UPDATE positions p
SET units = 10.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Improvitae B.V.%';
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%François-Xavier%' AND i.last_name ILIKE '%GIRAUD%');
UPDATE positions p
SET units = 15.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND i.legal_name ILIKE '%Star of the Sea Limited%';
UPDATE positions p
SET units = 5.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN105'
  AND (i.first_name ILIKE '%Nicolas%' AND i.last_name ILIKE '%WYDLER%');