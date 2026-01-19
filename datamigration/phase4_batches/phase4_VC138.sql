-- Phase 4: VC138 Updates
-- 2 UPDATE statements


-- Row 2: Scott FLETCHER
-- shares: 20.0, price: 100000.0, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 20.0, price_per_share = 100000.0, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Position updates for VC138 (aggregated by investor)
-- Scott FLETCHER: total ownership = 20.0
UPDATE positions p
SET units = 20.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));
