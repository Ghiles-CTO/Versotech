-- Batch 3: IN103
-- 10 position updates

UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';
UPDATE positions p
SET units = 120892.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';
UPDATE positions p
SET units = 24178.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%N SQUARE PATEL LLC%';
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Elizabeth%' AND i.last_name ILIKE '%GRACE%');
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Sherri Lipton Grace 2020 Irrevocable Family Trust%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';
UPDATE positions p
SET units = 12089.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');
UPDATE positions p
SET units = 60446.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Michael%' AND i.last_name ILIKE '%RYAN%');
UPDATE positions p
SET units = 60446.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN103'
  AND (i.first_name ILIKE '%Michael%' AND i.last_name ILIKE '%RYAN%');