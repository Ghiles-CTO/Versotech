-- Batch 11: VC102
-- 7 position updates

UPDATE positions p
SET units = 3000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND i.legal_name ILIKE '%LF GROUP SARL%';
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%PAUMIER%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%KRISTINA & CHENG-LIN%' AND i.last_name ILIKE '%SUTKAITYTE & HSU%');