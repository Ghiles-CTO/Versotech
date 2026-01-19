-- Batch 8: IN109
-- 1 position updates

UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'IN109'
  AND i.legal_name ILIKE '%L1 SC Invest 6%';