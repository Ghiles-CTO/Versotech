-- Create test deals and relationships
-- This should be run in the Supabase SQL editor

-- First, let's see what vehicles we have
-- INSERT some test deals
INSERT INTO deals (id, vehicle_id, name, deal_type, status, currency, open_at, close_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM vehicles LIMIT 1), 'VERSO Secondary Opportunity I', 'equity_secondary', 'open', 'USD', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days'),
  (gen_random_uuid(), (SELECT id FROM vehicles OFFSET 1 LIMIT 1), 'Real Empire Growth Deal', 'equity_primary', 'allocation_pending', 'USD', NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days'),
  (gen_random_uuid(), (SELECT id FROM vehicles OFFSET 2 LIMIT 1), 'Luxembourg Bridge Financing', 'credit_trade_finance', 'open', 'EUR', NOW() - INTERVAL '7 days', NOW() + INTERVAL '90 days'),
  (gen_random_uuid(), (SELECT id FROM vehicles OFFSET 3 LIMIT 1), 'VERSO Strategic Holdings', 'equity_secondary', 'closed', 'USD', NOW() - INTERVAL '180 days', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Create deal memberships for test investors
-- Connect the first 3 investors to various deals
INSERT INTO deal_memberships (deal_id, user_id, investor_id, role)
SELECT
  d.id as deal_id,
  p.id as user_id,
  iu.investor_id,
  'investor' as role
FROM deals d
CROSS JOIN (
  SELECT p.id, iu.investor_id
  FROM profiles p
  JOIN investor_users iu ON p.id = iu.user_id
  LIMIT 3
) p
WHERE d.name IN ('VERSO Secondary Opportunity I', 'Real Empire Growth Deal', 'Luxembourg Bridge Financing')
ON CONFLICT (deal_id, user_id) DO NOTHING;

-- Create some deal commitments
INSERT INTO deal_commitments (deal_id, investor_id, requested_units, requested_amount, status)
SELECT
  d.id as deal_id,
  dm.investor_id,
  100000 as requested_units,
  100000 as requested_amount,
  'approved' as status
FROM deals d
JOIN deal_memberships dm ON d.id = dm.deal_id
WHERE d.status IN ('open', 'allocation_pending')
ON CONFLICT (id) DO NOTHING;

-- Check what we created
SELECT
  d.name as deal_name,
  d.deal_type,
  d.status,
  v.name as vehicle_name,
  COUNT(dm.user_id) as member_count
FROM deals d
LEFT JOIN vehicles v ON d.vehicle_id = v.id
LEFT JOIN deal_memberships dm ON d.id = dm.deal_id
GROUP BY d.id, d.name, d.deal_type, d.status, v.name
ORDER BY d.created_at DESC;