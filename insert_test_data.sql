-- Insert Test Data for Investor Dashboard Debug
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Create user profile (using the exact UUID from simple-auth)
INSERT INTO profiles (id, role, display_name, email, title, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'investor',
  'John Investor',
  'investor@demo.com',
  'Individual Investor',
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  title = EXCLUDED.title;

-- 2. Create an investor entity
INSERT INTO investors (id, legal_name, type, kyc_status, country, created_at)
VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  'John Investor',
  'individual',
  'approved',
  'US',
  now()
) ON CONFLICT (id) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  type = EXCLUDED.type,
  kyc_status = EXCLUDED.kyc_status,
  country = EXCLUDED.country;

-- 3. Link the user to the investor
INSERT INTO investor_users (investor_id, user_id)
VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (investor_id, user_id) DO NOTHING;

-- 4. Create a vehicle
INSERT INTO vehicles (id, name, type, domicile, currency, created_at)
VALUES (
  '880e8400-e29b-41d4-a716-446655440001',
  'VERSO Tech Opportunities Fund',
  'fund',
  'Cayman Islands',
  'USD',
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  domicile = EXCLUDED.domicile,
  currency = EXCLUDED.currency;

-- 5. Create some deals
INSERT INTO deals (id, vehicle_id, name, deal_type, status, currency, offer_unit_price, open_at, close_at, terms_schema, created_by, created_at)
VALUES
(
  '990e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440001',
  'Revolut Secondary - 2025',
  'equity_secondary',
  'open',
  'USD',
  28.50,
  '2025-01-15 09:00:00+00',
  '2025-03-15 17:00:00+00',
  '{"sector": "fintech", "stage": "secondary", "minimum_investment": 10000}',
  '550e8400-e29b-41d4-a716-446655440001',
  now()
),
(
  '990e8400-e29b-41d4-a716-446655440002',
  '880e8400-e29b-41d4-a716-446655440001',
  'Luxembourg RE Fund III',
  'equity_primary',
  'open',
  'EUR',
  125.00,
  '2025-01-20 09:00:00+00',
  '2025-02-28 17:00:00+00',
  '{"sector": "real_estate", "stage": "primary", "minimum_investment": 25000}',
  '550e8400-e29b-41d4-a716-446655440001',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  deal_type = EXCLUDED.deal_type,
  status = EXCLUDED.status,
  currency = EXCLUDED.currency,
  offer_unit_price = EXCLUDED.offer_unit_price,
  open_at = EXCLUDED.open_at,
  close_at = EXCLUDED.close_at,
  terms_schema = EXCLUDED.terms_schema;

-- 6. Create fee plans for the deals
INSERT INTO fee_plans (id, deal_id, name, description, is_default, created_at)
VALUES
(
  'fp_revolut_allin',
  '990e8400-e29b-41d4-a716-446655440001',
  'All-in 5%',
  '5% upfront fee with no ongoing charges',
  true,
  now()
),
(
  'fp_luxembourg_standard',
  '990e8400-e29b-41d4-a716-446655440002',
  'Standard 2% + 20%',
  '2% annual management fee plus 20% performance',
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default;

-- 7. Add deal memberships (this is critical for the dashboard query)
INSERT INTO deal_memberships (deal_id, user_id, investor_id, role, invited_by, invited_at, accepted_at)
VALUES
(
  '990e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  'investor',
  '550e8400-e29b-41d4-a716-446655440001',
  now() - interval '5 days',
  now() - interval '3 days'
),
(
  '990e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  'investor',
  '550e8400-e29b-41d4-a716-446655440001',
  now() - interval '2 days',
  now() - interval '1 day'
)
ON CONFLICT (deal_id, user_id) DO UPDATE SET
  investor_id = EXCLUDED.investor_id,
  role = EXCLUDED.role,
  invited_by = EXCLUDED.invited_by,
  invited_at = EXCLUDED.invited_at,
  accepted_at = EXCLUDED.accepted_at;

-- 8. Create sample commitments
INSERT INTO deal_commitments (id, deal_id, investor_id, requested_units, requested_amount, selected_fee_plan_id, status, created_by, created_at)
VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  1000,
  28500.00,
  'fp_revolut_allin',
  'submitted',
  '550e8400-e29b-41d4-a716-446655440001',
  now()
);

-- 9. Create sample reservations
INSERT INTO reservations (id, deal_id, investor_id, requested_units, proposed_unit_price, expires_at, status, created_by, created_at)
VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  500,
  28.50,
  now() + interval '25 minutes',
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  now()
);

-- 10. Create additional demo users from simple-auth system
INSERT INTO profiles (id, role, display_name, email, title, created_at)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'investor',
  'Sarah Wilson',
  'sarah@investor.com',
  'Investment Manager',
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'investor',
  'Wellington Family Office',
  'family.office@demo.com',
  'Family Office',
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  'staff_admin',
  'Admin User',
  'admin@demo.com',
  'Administrator',
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  'staff_admin',
  'Portfolio Manager',
  'manager@demo.com',
  'Portfolio Manager',
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  'staff_ops',
  'Operations Team',
  'operations@demo.com',
  'Operations',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  title = EXCLUDED.title;

COMMIT;

-- Test the exact dashboard query to verify it works
SELECT
  d.*,
  v.name as vehicle_name,
  v.type as vehicle_type,
  dm.role,
  dm.accepted_at,
  fp.name as fee_plan_name,
  fp.description as fee_plan_description,
  fp.is_default
FROM deals d
LEFT JOIN vehicles v ON v.id = d.vehicle_id
LEFT JOIN deal_memberships dm ON dm.deal_id = d.id AND dm.user_id = '550e8400-e29b-41d4-a716-446655440001'
LEFT JOIN fee_plans fp ON fp.deal_id = d.id
WHERE dm.user_id = '550e8400-e29b-41d4-a716-446655440001'
   OR dm.investor_id = '770e8400-e29b-41d4-a716-446655440001'
ORDER BY d.created_at DESC;

-- Verify the investor linking
SELECT
  p.display_name,
  p.email,
  i.legal_name,
  i.type,
  i.kyc_status
FROM profiles p
JOIN investor_users iu ON iu.user_id = p.id
JOIN investors i ON i.id = iu.investor_id
WHERE p.id = '550e8400-e29b-41d4-a716-446655440001';

-- Check commitments and reservations
SELECT 'commitments' as type, COUNT(*) as count
FROM deal_commitments dc
JOIN investor_users iu ON iu.investor_id = dc.investor_id
WHERE iu.user_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 'reservations' as type, COUNT(*) as count
FROM reservations r
JOIN investor_users iu ON iu.investor_id = r.investor_id
WHERE iu.user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Show the summary that the dashboard will display
SELECT
  'Available Deals' as metric,
  COUNT(DISTINCT d.id) as value
FROM deals d
JOIN deal_memberships dm ON dm.deal_id = d.id
WHERE dm.user_id = '550e8400-e29b-41d4-a716-446655440001'
   OR dm.investor_id = '770e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT
  'Active Deals' as metric,
  COUNT(DISTINCT d.id) as value
FROM deals d
JOIN deal_memberships dm ON dm.deal_id = d.id
WHERE (dm.user_id = '550e8400-e29b-41d4-a716-446655440001'
   OR dm.investor_id = '770e8400-e29b-41d4-a716-446655440001')
  AND d.status = 'open'
UNION ALL
SELECT
  'Pending Commitments' as metric,
  COUNT(*) as value
FROM deal_commitments dc
WHERE dc.investor_id = '770e8400-e29b-41d4-a716-446655440001'
  AND dc.status = 'submitted'
UNION ALL
SELECT
  'Active Reservations' as metric,
  COUNT(*) as value
FROM reservations r
WHERE r.investor_id = '770e8400-e29b-41d4-a716-446655440001'
  AND r.status = 'pending';