-- Batch 1: IN101
-- 1 position updates

UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN101'
  AND i.legal_name ILIKE '%Innovatech 1%';