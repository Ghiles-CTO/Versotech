-- VERSO Holdings Portal - Sample Deals and Opportunities Data
-- Run this script in Supabase SQL Editor to populate sample data
-- This will create realistic deal opportunities visible in the investor portal

BEGIN;

-- First, let's create some sample users and investors
INSERT INTO profiles (id, role, display_name, email, title) VALUES
  ('11111111-1111-1111-1111-111111111111', 'investor', 'Marcus Goldman', 'marcus@gs-wealth.com', NULL),
  ('22222222-2222-2222-2222-222222222222', 'investor', 'Sarah Chen', 'sarah@meridian.com', NULL),
  ('33333333-3333-3333-3333-333333333333', 'investor', 'James Morrison', 'james@familyoffice.org', NULL),
  ('44444444-4444-4444-4444-444444444444', 'staff_admin', 'Emma Wilson', 'emma@versotech.com', 'admin'),
  ('55555555-5555-5555-5555-555555555555', 'staff_ops', 'David Park', 'david@versotech.com', 'operations')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;

-- Create sample investors
INSERT INTO investors (id, legal_name, type, kyc_status, country) VALUES
  ('inv-111', 'Goldman Sachs Private Wealth Management', 'entity', 'approved', 'USA'),
  ('inv-222', 'Meridian Capital Partners LLC', 'entity', 'approved', 'USA'),
  ('inv-333', 'European Family Office Network', 'entity', 'approved', 'Luxembourg'),
  ('inv-444', 'Tech Ventures Investment Fund', 'entity', 'pending', 'Singapore'),
  ('inv-555', 'Real Estate Opportunities Ltd', 'entity', 'approved', 'BVI')
ON CONFLICT (id) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  kyc_status = EXCLUDED.kyc_status;

-- Link investors to users
INSERT INTO investor_users (investor_id, user_id) VALUES
  ('inv-111', '11111111-1111-1111-1111-111111111111'),
  ('inv-222', '22222222-2222-2222-2222-222222222222'),
  ('inv-333', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Create sample vehicles
INSERT INTO vehicles (id, name, type, domicile, currency) VALUES
  ('veh-001', 'VERSO Growth Fund I', 'fund', 'BVI', 'USD'),
  ('veh-002', 'REAL Empire Securitization', 'securitization', 'Luxembourg', 'EUR'),
  ('veh-003', 'Tech Opportunities SPV', 'spv', 'Delaware', 'USD'),
  ('veh-004', 'Credit Trade Finance Vehicle', 'note', 'BVI', 'USD')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- Create sample deals (opportunities)
INSERT INTO deals (id, vehicle_id, name, deal_type, status, currency, open_at, close_at, offer_unit_price, created_by, terms_schema) VALUES
  (
    'deal-001',
    'veh-001',
    'Tech Growth Opportunity',
    'equity_secondary',
    'open',
    'USD',
    '2024-03-01 00:00:00+00'::timestamptz,
    '2024-04-15 23:59:59+00'::timestamptz,
    125.50,
    '44444444-4444-4444-4444-444444444444',
    '{"minimum_investment": 50000, "maximum_investment": 500000, "target_irr": 25, "investment_period": "36 months"}'::jsonb
  ),
  (
    'deal-002',
    'veh-002',
    'Real Estate Secondary Market',
    'equity_secondary',
    'open',
    'EUR',
    '2024-02-15 00:00:00+00'::timestamptz,
    '2024-05-30 23:59:59+00'::timestamptz,
    89.75,
    '44444444-4444-4444-4444-444444444444',
    '{"minimum_investment": 100000, "maximum_investment": 1000000, "target_yield": 12, "investment_period": "60 months"}'::jsonb
  ),
  (
    'deal-003',
    'veh-004',
    'Credit Trade Finance Opportunity',
    'credit_trade_finance',
    'open',
    'USD',
    '2024-03-10 00:00:00+00'::timestamptz,
    '2024-06-10 23:59:59+00'::timestamptz,
    100.00,
    '55555555-5555-5555-5555-555555555555',
    '{"minimum_investment": 25000, "maximum_investment": 250000, "target_yield": 15, "investment_period": "12 months"}'::jsonb
  ),
  (
    'deal-004',
    'veh-003',
    'Emerging Markets Infrastructure',
    'equity_primary',
    'allocation_pending',
    'USD',
    '2024-01-15 00:00:00+00'::timestamptz,
    '2024-03-15 23:59:59+00'::timestamptz,
    200.00,
    '44444444-4444-4444-4444-444444444444',
    '{"minimum_investment": 100000, "maximum_investment": 2000000, "target_irr": 30, "investment_period": "84 months"}'::jsonb
  ),
  (
    'deal-005',
    'veh-001',
    'AI & Machine Learning Fund',
    'equity_primary',
    'closed',
    'USD',
    '2023-11-01 00:00:00+00'::timestamptz,
    '2024-01-31 23:59:59+00'::timestamptz,
    150.00,
    '44444444-4444-4444-4444-444444444444',
    '{"minimum_investment": 75000, "maximum_investment": 750000, "target_irr": 35, "investment_period": "48 months"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  offer_unit_price = EXCLUDED.offer_unit_price;

-- Create deal memberships (who can access which deals)
INSERT INTO deal_memberships (deal_id, user_id, investor_id, role, invited_by, invited_at, accepted_at) VALUES
  ('deal-001', '11111111-1111-1111-1111-111111111111', 'inv-111', 'investor', '44444444-4444-4444-4444-444444444444', '2024-03-01 10:00:00+00', '2024-03-01 14:30:00+00'),
  ('deal-001', '22222222-2222-2222-2222-222222222222', 'inv-222', 'co_investor', '44444444-4444-4444-4444-444444444444', '2024-03-02 09:00:00+00', '2024-03-02 16:45:00+00'),
  ('deal-002', '11111111-1111-1111-1111-111111111111', 'inv-111', 'investor', '44444444-4444-4444-4444-444444444444', '2024-02-15 11:00:00+00', '2024-02-16 09:15:00+00'),
  ('deal-002', '33333333-3333-3333-3333-333333333333', 'inv-333', 'investor', '44444444-4444-4444-4444-444444444444', '2024-02-20 08:30:00+00', '2024-02-21 13:20:00+00'),
  ('deal-003', '22222222-2222-2222-2222-222222222222', 'inv-222', 'investor', '55555555-5555-5555-5555-555555555555', '2024-03-10 12:00:00+00', '2024-03-11 10:00:00+00'),
  ('deal-003', '33333333-3333-3333-3333-333333333333', 'inv-333', 'co_investor', '55555555-5555-5555-5555-555555555555', '2024-03-12 15:00:00+00', '2024-03-13 11:30:00+00'),
  ('deal-004', '11111111-1111-1111-1111-111111111111', 'inv-111', 'investor', '44444444-4444-4444-4444-444444444444', '2024-01-15 09:00:00+00', '2024-01-16 14:00:00+00'),
  ('deal-005', '22222222-2222-2222-2222-222222222222', 'inv-222', 'investor', '44444444-4444-4444-4444-444444444444', '2023-11-01 10:00:00+00', '2023-11-02 12:00:00+00')
ON CONFLICT DO NOTHING;

-- Create share sources for inventory
INSERT INTO share_sources (id, kind, counterparty_name, notes) VALUES
  ('src-001', 'company', 'TechCorp Secondary Sale', 'Pre-IPO shares from employee stock option exercise'),
  ('src-002', 'fund', 'Venture Capital Fund III', 'Secondary market purchase from existing LP'),
  ('src-003', 'colleague', 'Private Investor Network', 'Direct acquisition from high-net-worth individual'),
  ('src-004', 'company', 'Real Estate Development Co', 'Direct stake purchase in development project'),
  ('src-005', 'fund', 'Credit Opportunities Fund', 'Trade finance portfolio acquisition')
ON CONFLICT (id) DO UPDATE SET
  counterparty_name = EXCLUDED.counterparty_name;

-- Create share lots (inventory)
INSERT INTO share_lots (id, deal_id, source_id, units_total, unit_cost, currency, acquired_at, units_remaining, status) VALUES
  ('lot-001', 'deal-001', 'src-001', 10000.00000000, 120.00, 'USD', '2024-02-15', 7500.00000000, 'available'),
  ('lot-002', 'deal-001', 'src-002', 5000.00000000, 118.50, 'USD', '2024-02-20', 5000.00000000, 'available'),
  ('lot-003', 'deal-002', 'src-004', 25000.00000000, 85.00, 'EUR', '2024-01-30', 20000.00000000, 'available'),
  ('lot-004', 'deal-002', 'src-003', 15000.00000000, 87.25, 'EUR', '2024-02-05', 12000.00000000, 'available'),
  ('lot-005', 'deal-003', 'src-005', 50000.00000000, 100.00, 'USD', '2024-03-01', 45000.00000000, 'available'),
  ('lot-006', 'deal-004', 'src-001', 8000.00000000, 195.00, 'USD', '2024-01-10', 3000.00000000, 'available'),
  ('lot-007', 'deal-005', 'src-002', 6000.00000000, 145.00, 'USD', '2023-10-15', 0.00000000, 'exhausted')
ON CONFLICT (id) DO UPDATE SET
  units_remaining = EXCLUDED.units_remaining,
  status = EXCLUDED.status;

-- Create fee plans for deals
INSERT INTO fee_plans (id, deal_id, name, description, is_default) VALUES
  ('fp-001', 'deal-001', 'Standard Tech Growth Plan', 'Standard fee structure for tech growth investments', true),
  ('fp-002', 'deal-001', 'Institutional Premium', 'Reduced fees for large institutional commitments', false),
  ('fp-003', 'deal-002', 'Real Estate Standard', 'Standard real estate investment fees', true),
  ('fp-004', 'deal-003', 'Credit Trade Finance', 'Specialized fees for trade finance deals', true),
  ('fp-005', 'deal-004', 'Infrastructure Premium', 'Long-term infrastructure investment fees', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_default = EXCLUDED.is_default;

-- Create fee components
INSERT INTO fee_components (id, fee_plan_id, kind, calc_method, rate_bps, frequency, hurdle_rate_bps) VALUES
  -- Tech Growth Standard Plan
  ('fc-001', 'fp-001', 'subscription', 'percent_of_investment', 200, 'one_time', NULL),
  ('fc-002', 'fp-001', 'management', 'percent_per_annum', 200, 'annual', NULL),
  ('fc-003', 'fp-001', 'performance', 'percent_of_profit', 2000, 'on_exit', 800),

  -- Tech Growth Institutional Plan
  ('fc-004', 'fp-002', 'subscription', 'percent_of_investment', 150, 'one_time', NULL),
  ('fc-005', 'fp-002', 'management', 'percent_per_annum', 150, 'annual', NULL),
  ('fc-006', 'fp-002', 'performance', 'percent_of_profit', 1500, 'on_exit', 600),

  -- Real Estate Standard
  ('fc-007', 'fp-003', 'subscription', 'percent_of_investment', 250, 'one_time', NULL),
  ('fc-008', 'fp-003', 'management', 'percent_per_annum', 150, 'quarterly', NULL),
  ('fc-009', 'fp-003', 'performance', 'percent_of_profit', 1200, 'on_exit', 600),

  -- Credit Trade Finance
  ('fc-010', 'fp-004', 'subscription', 'percent_of_investment', 100, 'one_time', NULL),
  ('fc-011', 'fp-004', 'spread_markup', 'per_unit_spread', 300, 'one_time', NULL),

  -- Infrastructure Premium
  ('fc-012', 'fp-005', 'subscription', 'percent_of_investment', 300, 'one_time', NULL),
  ('fc-013', 'fp-005', 'management', 'percent_per_annum', 250, 'quarterly', NULL),
  ('fc-014', 'fp-005', 'performance', 'percent_of_profit', 2500, 'on_exit', 1000)
ON CONFLICT (id) DO UPDATE SET
  rate_bps = EXCLUDED.rate_bps,
  calc_method = EXCLUDED.calc_method;

-- Create some subscriptions (investor commitments to vehicles)
INSERT INTO subscriptions (id, investor_id, vehicle_id, commitment, currency, status) VALUES
  ('sub-001', 'inv-111', 'veh-001', 1000000.00, 'USD', 'approved'),
  ('sub-002', 'inv-222', 'veh-001', 500000.00, 'USD', 'approved'),
  ('sub-003', 'inv-111', 'veh-002', 750000.00, 'EUR', 'approved'),
  ('sub-004', 'inv-333', 'veh-002', 1250000.00, 'EUR', 'approved'),
  ('sub-005', 'inv-222', 'veh-004', 300000.00, 'USD', 'pending')
ON CONFLICT (id) DO UPDATE SET
  commitment = EXCLUDED.commitment,
  status = EXCLUDED.status;

-- Create some sample positions
INSERT INTO positions (id, investor_id, vehicle_id, units, cost_basis, last_nav, as_of_date) VALUES
  ('pos-001', 'inv-111', 'veh-001', 8000.00000000, 960000.00, 125.50, '2024-03-15'),
  ('pos-002', 'inv-222', 'veh-001', 4000.00000000, 480000.00, 125.50, '2024-03-15'),
  ('pos-003', 'inv-111', 'veh-002', 8500.00000000, 722500.00, 89.75, '2024-03-15'),
  ('pos-004', 'inv-333', 'veh-002', 14000.00000000, 1190000.00, 89.75, '2024-03-15'),
  ('pos-005', 'inv-222', 'veh-004', 2500.00000000, 250000.00, 100.00, '2024-03-15')
ON CONFLICT (id) DO UPDATE SET
  units = EXCLUDED.units,
  cost_basis = EXCLUDED.cost_basis,
  last_nav = EXCLUDED.last_nav;

-- Create some reservations (active interest in deals)
INSERT INTO reservations (id, deal_id, investor_id, requested_units, proposed_unit_price, expires_at, status, created_by) VALUES
  ('res-001', 'deal-001', 'inv-111', 2000.00000000, 125.50, '2024-03-20 23:59:59+00'::timestamptz, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('res-002', 'deal-002', 'inv-333', 3000.00000000, 89.75, '2024-03-25 23:59:59+00'::timestamptz, 'pending', '33333333-3333-3333-3333-333333333333'),
  ('res-003', 'deal-003', 'inv-222', 5000.00000000, 100.00, '2024-03-22 23:59:59+00'::timestamptz, 'pending', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  expires_at = EXCLUDED.expires_at;

-- Create some allocations (completed investments)
INSERT INTO allocations (id, deal_id, investor_id, unit_price, units, status, approved_by, approved_at) VALUES
  ('alloc-001', 'deal-005', 'inv-222', 150.00, 3000.00000000, 'settled', '44444444-4444-4444-4444-444444444444', '2024-01-15 16:00:00+00'),
  ('alloc-002', 'deal-004', 'inv-111', 200.00, 2500.00000000, 'approved', '44444444-4444-4444-4444-444444444444', '2024-03-10 11:30:00+00')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  approved_at = EXCLUDED.approved_at;

-- Create some recent valuations
INSERT INTO valuations (id, vehicle_id, as_of_date, nav_total, nav_per_unit) VALUES
  ('val-001', 'veh-001', '2024-03-15', 15000000.00, 125.50),
  ('val-002', 'veh-002', '2024-03-15', 28500000.00, 89.75),
  ('val-003', 'veh-003', '2024-03-15', 8000000.00, 160.00),
  ('val-004', 'veh-004', '2024-03-15', 5000000.00, 100.00),
  -- Historical valuations
  ('val-005', 'veh-001', '2024-02-15', 14200000.00, 118.75),
  ('val-006', 'veh-002', '2024-02-15', 26800000.00, 84.20)
ON CONFLICT (id) DO UPDATE SET
  nav_total = EXCLUDED.nav_total,
  nav_per_unit = EXCLUDED.nav_per_unit;

-- Create some cashflow events
INSERT INTO cashflows (id, investor_id, vehicle_id, type, amount, date) VALUES
  ('cf-001', 'inv-111', 'veh-001', 'call', 200000.00, '2024-02-01'),
  ('cf-002', 'inv-222', 'veh-001', 'call', 100000.00, '2024-02-01'),
  ('cf-003', 'inv-111', 'veh-002', 'call', 150000.00, '2024-01-15'),
  ('cf-004', 'inv-333', 'veh-002', 'call', 250000.00, '2024-01-15'),
  ('cf-005', 'inv-222', 'veh-001', 'distribution', 15000.00, '2024-03-01'),
  ('cf-006', 'inv-111', 'veh-001', 'distribution', 30000.00, '2024-03-01')
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  date = EXCLUDED.date;

-- Create some sample documents
INSERT INTO documents (id, owner_investor_id, vehicle_id, deal_id, type, file_key, created_by) VALUES
  ('doc-001', 'inv-111', 'veh-001', 'deal-001', 'Subscription', 'documents/sub-001-tech-growth.pdf', '44444444-4444-4444-4444-444444444444'),
  ('doc-002', 'inv-222', 'veh-001', 'deal-001', 'NDA', 'documents/nda-002-tech-growth.pdf', '44444444-4444-4444-4444-444444444444'),
  ('doc-003', 'inv-111', 'veh-002', 'deal-002', 'Term Sheet', 'documents/ts-003-real-estate.pdf', '44444444-4444-4444-4444-444444444444'),
  ('doc-004', 'inv-333', 'veh-002', 'deal-002', 'Subscription', 'documents/sub-004-real-estate.pdf', '44444444-4444-4444-4444-444444444444'),
  ('doc-005', 'inv-222', 'veh-004', 'deal-003', 'NDA', 'documents/nda-005-credit-trade.pdf', '55555555-5555-5555-5555-555555555555')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  file_key = EXCLUDED.file_key;

-- Create some conversations
INSERT INTO conversations (id, subject, created_by, type, deal_id) VALUES
  ('conv-001', 'Tech Growth Opportunity Discussion', '44444444-4444-4444-4444-444444444444', 'group', 'deal-001'),
  ('conv-002', 'Real Estate Investment Questions', '44444444-4444-4444-4444-444444444444', 'group', 'deal-002'),
  ('conv-003', 'Credit Trade Finance Inquiry', '55555555-5555-5555-5555-555555555555', 'group', 'deal-003')
ON CONFLICT (id) DO UPDATE SET
  subject = EXCLUDED.subject,
  deal_id = EXCLUDED.deal_id;

-- Add conversation participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('conv-001', '11111111-1111-1111-1111-111111111111'),
  ('conv-001', '22222222-2222-2222-2222-222222222222'),
  ('conv-001', '44444444-4444-4444-4444-444444444444'),
  ('conv-002', '11111111-1111-1111-1111-111111111111'),
  ('conv-002', '33333333-3333-3333-3333-333333333333'),
  ('conv-002', '44444444-4444-4444-4444-444444444444'),
  ('conv-003', '22222222-2222-2222-2222-222222222222'),
  ('conv-003', '33333333-3333-3333-3333-333333333333'),
  ('conv-003', '55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;

-- Create some sample messages
INSERT INTO messages (id, conversation_id, sender_id, body) VALUES
  ('msg-001', 'conv-001', '11111111-1111-1111-1111-111111111111', 'I''m very interested in this tech growth opportunity. What are the key risk factors we should consider?'),
  ('msg-002', 'conv-001', '44444444-4444-4444-4444-444444444444', 'Great question! The main risks include market volatility and regulatory changes in the tech sector. We have detailed risk analysis in the investment memorandum.'),
  ('msg-003', 'conv-001', '22222222-2222-2222-2222-222222222222', 'When is the expected first capital call for this deal?'),
  ('msg-004', 'conv-002', '33333333-3333-3333-3333-333333333333', 'The real estate fundamentals look strong. What''s the expected holding period?'),
  ('msg-005', 'conv-002', '44444444-4444-4444-4444-444444444444', 'We''re targeting a 5-year hold period with potential early exit opportunities after year 3.'),
  ('msg-006', 'conv-003', '22222222-2222-2222-2222-222222222222', 'Can you provide more details on the trade finance structure?')
ON CONFLICT (id) DO UPDATE SET
  body = EXCLUDED.body;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully created sample deals and opportunities data!';
    RAISE NOTICE '- 5 investment deals created (3 open, 1 allocation pending, 1 closed)';
    RAISE NOTICE '- 5 investors with portfolio positions';
    RAISE NOTICE '- Active reservations and allocations';
    RAISE NOTICE '- Sample conversations and documents';
    RAISE NOTICE '- Fee plans and inventory lots';
    RAISE NOTICE 'Investors can now see active opportunities in their portal!';
END $$;