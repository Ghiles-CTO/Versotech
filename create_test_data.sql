-- VERSO Holdings Portal - Test Data Creation
-- Run this in your Supabase SQL Editor to create comprehensive test data

BEGIN;

-- 1. PROFILES (matching your demo auth system)
INSERT INTO profiles (id, role, display_name, email, title) VALUES
  ('inv-001', 'investor', 'John Investor', 'investor@demo.com', NULL),
  ('inv-002', 'investor', 'Sarah Wilson', 'sarah@investor.com', NULL),
  ('inv-003', 'investor', 'Wellington Family Office', 'family.office@demo.com', NULL),
  ('staff-001', 'staff_admin', 'Admin User', 'admin@demo.com', 'Administration'),
  ('staff-002', 'staff_ops', 'Portfolio Manager', 'manager@demo.com', 'Portfolio Management'),
  ('staff-003', 'staff_ops', 'Operations Team', 'operations@demo.com', 'Operations')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 2. INVESTORS
INSERT INTO investors (id, legal_name, type, kyc_status, country) VALUES
  ('investor-john', 'John Investor Holdings Ltd', 'entity', 'approved', 'GB'),
  ('investor-sarah', 'Sarah Wilson', 'individual', 'approved', 'US'),
  ('investor-wellington', 'Wellington Family Office SA', 'entity', 'approved', 'CH')
ON CONFLICT (id) DO UPDATE SET legal_name = EXCLUDED.legal_name;

-- 3. LINK USERS TO INVESTORS
INSERT INTO investor_users (investor_id, user_id) VALUES
  ('investor-john', 'inv-001'),
  ('investor-sarah', 'inv-002'),
  ('investor-wellington', 'inv-003')
ON CONFLICT DO NOTHING;

-- 4. VEHICLES
INSERT INTO vehicles (id, name, type, domicile, currency) VALUES
  ('vehicle-verso-fund', 'VERSO FUND I', 'fund', 'LU', 'EUR'),
  ('vehicle-real-empire', 'REAL Empire Fund', 'fund', 'LU', 'EUR'),
  ('vehicle-spv-delta', 'SPV Delta Holdings', 'spv', 'BVI', 'USD')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. SUBSCRIPTIONS
INSERT INTO subscriptions (investor_id, vehicle_id, commitment, currency, status) VALUES
  ('investor-john', 'vehicle-verso-fund', 500000.00, 'EUR', 'active'),
  ('investor-sarah', 'vehicle-real-empire', 250000.00, 'EUR', 'active'),
  ('investor-wellington', 'vehicle-spv-delta', 1000000.00, 'USD', 'active')
ON CONFLICT DO NOTHING;

-- 6. POSITIONS
INSERT INTO positions (investor_id, vehicle_id, units, cost_basis, last_nav, as_of_date) VALUES
  ('investor-john', 'vehicle-verso-fund', 5000.0, 450000.00, 95.50, '2025-01-20'),
  ('investor-sarah', 'vehicle-real-empire', 2500.0, 225000.00, 102.30, '2025-01-20'),
  ('investor-wellington', 'vehicle-spv-delta', 10000.0, 950000.00, 105.75, '2025-01-20')
ON CONFLICT DO NOTHING;

-- 7. CASH FLOWS
INSERT INTO cashflows (investor_id, vehicle_id, type, amount, date) VALUES
  ('investor-john', 'vehicle-verso-fund', 'call', 450000.00, '2024-06-15'),
  ('investor-sarah', 'vehicle-real-empire', 'call', 225000.00, '2024-07-20'),
  ('investor-wellington', 'vehicle-spv-delta', 'call', 950000.00, '2024-05-10'),
  ('investor-john', 'vehicle-verso-fund', 'distribution', 25000.00, '2024-12-20')
ON CONFLICT DO NOTHING;

-- 8. DEALS
INSERT INTO deals (id, name, deal_type, status, currency, offer_unit_price, created_by) VALUES
  ('deal-revolut-2025', 'Revolut Secondary - Series E', 'equity_secondary', 'open', 'USD', 28.50, 'staff-001'),
  ('deal-ai-startup', 'AI Startup Primary Round', 'equity_primary', 'open', 'USD', 15.00, 'staff-001')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

COMMIT;

-- Verification queries
SELECT 'Profiles created:' as info, COUNT(*) as count FROM profiles;
SELECT 'Investors created:' as info, COUNT(*) as count FROM investors;
SELECT 'Vehicles created:' as info, COUNT(*) as count FROM vehicles;
SELECT 'Deals created:' as info, COUNT(*) as count FROM deals;
