-- Batch 25: VC122
-- 10 position updates

UPDATE positions p
SET units = 113598.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 95949.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%VERSO CAPITAL ESTABLISHMENT%';
UPDATE positions p
SET units = 39978.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 159915.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%LF GROUP SARL%';