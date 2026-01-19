-- Batch 4: IN104
-- 1 position updates

UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN104'
  AND i.legal_name ILIKE '%VERSO HOLDINGS SARL%';