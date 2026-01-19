-- Batch 2: IN102
-- 8 position updates

UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND i.legal_name ILIKE '%1982772 Ontario Ltd%';
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Albert%' AND i.last_name ILIKE '%NOCCIOLINO%');
UPDATE positions p
SET units = 120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Christopher%' AND i.last_name ILIKE '%PAULSEN%');
UPDATE positions p
SET units = 48.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Gary%' AND i.last_name ILIKE '%HALL%');
UPDATE positions p
SET units = 1.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 3.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 71.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN102'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%JONES%');