-- Batch 21: VC118
-- 7 position updates

UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%VOLF TRUST%';
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOVA & ROMANOV%');
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%';
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');
UPDATE positions p
SET units = 39000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');
UPDATE positions p
SET units = 79324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');