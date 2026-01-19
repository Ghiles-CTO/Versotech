-- Phase 4: Per-Investor Subscription & Position Updates
-- This migration updates subscription and position data based on VERSO Dashboard
-- Generated from vehicle_summary_migration.py

BEGIN;

-- VC102 Subscription Updates
UPDATE subscriptions s
SET num_shares = 3000.0, price_per_share = 0.001, funded_amount = 3.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 3.0 OR s.funded_amount = 3.0));

UPDATE subscriptions s
SET num_shares = 500.0, price_per_share = 300.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 1.0, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%ELYSIUM VENTURE CAPITAL%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- VC102 Position Updates (aggregated by investor)
UPDATE positions p
SET units = 29000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%LF GROUP SARL%'));

UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND ((UPPER(i.legal_name) LIKE '%ELYSIUM VENTURE CAPITAL%'));

COMMIT;
