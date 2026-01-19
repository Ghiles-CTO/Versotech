-- Batch 35: VC134
-- 5 position updates

UPDATE positions p
SET units = 1900000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';
UPDATE positions p
SET units = 501101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%PROGETTO UNO SPA%';
UPDATE positions p
SET units = 100220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Stefano%' AND i.last_name ILIKE '%CAPRA%');
UPDATE positions p
SET units = 5011.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';