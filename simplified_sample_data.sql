-- VERSO Holdings Portal - Simplified Sample Data for Manual Import
-- Copy and paste these queries one by one into your Supabase SQL Editor

-- 1. Create sample investors (run this first)
INSERT INTO investors (legal_name, type, kyc_status, country) VALUES
  ('Goldman Sachs Private Wealth Management', 'entity', 'approved', 'USA'),
  ('Meridian Capital Partners LLC', 'entity', 'approved', 'USA'),
  ('European Family Office Network', 'entity', 'approved', 'Luxembourg'),
  ('Tech Ventures Investment Fund', 'entity', 'pending', 'Singapore'),
  ('Real Estate Opportunities Ltd', 'entity', 'approved', 'BVI');

-- 2. Create sample vehicles (run this second)
INSERT INTO vehicles (name, type, domicile, currency) VALUES
  ('VERSO Growth Fund I', 'fund', 'BVI', 'USD'),
  ('REAL Empire Securitization', 'securitization', 'Luxembourg', 'EUR'),
  ('Tech Opportunities SPV', 'spv', 'Delaware', 'USD'),
  ('Credit Trade Finance Vehicle', 'note', 'BVI', 'USD');

-- 3. Get vehicle IDs for deals (run this to see the IDs you'll need)
SELECT id, name FROM vehicles ORDER BY created_at;

-- 4. Create sample deals using the vehicle IDs from step 3
-- Replace 'VEHICLE_ID_1', 'VEHICLE_ID_2', etc. with actual UUIDs from step 3

INSERT INTO deals (vehicle_id, name, deal_type, status, currency, open_at, close_at, offer_unit_price, terms_schema) VALUES
  ('VEHICLE_ID_1', 'Tech Growth Opportunity', 'equity_secondary', 'open', 'USD',
   '2024-03-01 00:00:00+00', '2024-04-15 23:59:59+00', 125.50,
   '{"minimum_investment": 50000, "maximum_investment": 500000, "target_irr": 25, "investment_period": "36 months"}'),

  ('VEHICLE_ID_2', 'Real Estate Secondary Market', 'equity_secondary', 'open', 'EUR',
   '2024-02-15 00:00:00+00', '2024-05-30 23:59:59+00', 89.75,
   '{"minimum_investment": 100000, "maximum_investment": 1000000, "target_yield": 12, "investment_period": "60 months"}'),

  ('VEHICLE_ID_4', 'Credit Trade Finance Opportunity', 'credit_trade_finance', 'open', 'USD',
   '2024-03-10 00:00:00+00', '2024-06-10 23:59:59+00', 100.00,
   '{"minimum_investment": 25000, "maximum_investment": 250000, "target_yield": 15, "investment_period": "12 months"}'),

  ('VEHICLE_ID_3', 'Emerging Markets Infrastructure', 'equity_primary', 'allocation_pending', 'USD',
   '2024-01-15 00:00:00+00', '2024-03-15 23:59:59+00', 200.00,
   '{"minimum_investment": 100000, "maximum_investment": 2000000, "target_irr": 30, "investment_period": "84 months"}'),

  ('VEHICLE_ID_1', 'AI & Machine Learning Fund', 'equity_primary', 'closed', 'USD',
   '2023-11-01 00:00:00+00', '2024-01-31 23:59:59+00', 150.00,
   '{"minimum_investment": 75000, "maximum_investment": 750000, "target_irr": 35, "investment_period": "48 months"}');

-- 5. Create share sources for inventory
INSERT INTO share_sources (kind, counterparty_name, notes) VALUES
  ('company', 'TechCorp Secondary Sale', 'Pre-IPO shares from employee stock option exercise'),
  ('fund', 'Venture Capital Fund III', 'Secondary market purchase from existing LP'),
  ('colleague', 'Private Investor Network', 'Direct acquisition from high-net-worth individual'),
  ('company', 'Real Estate Development Co', 'Direct stake purchase in development project'),
  ('fund', 'Credit Opportunities Fund', 'Trade finance portfolio acquisition');

-- 6. Get deal and source IDs for inventory (run this to see the IDs)
SELECT 'deals' as table_name, id, name FROM deals
UNION ALL
SELECT 'sources' as table_name, id, counterparty_name as name FROM share_sources
ORDER BY table_name, name;

-- 7. Create share lots (replace DEAL_ID_X and SOURCE_ID_X with actual UUIDs)
INSERT INTO share_lots (deal_id, source_id, units_total, unit_cost, currency, acquired_at, units_remaining, status) VALUES
  ('DEAL_ID_1', 'SOURCE_ID_1', 10000.00, 120.00, 'USD', '2024-02-15', 7500.00, 'available'),
  ('DEAL_ID_1', 'SOURCE_ID_2', 5000.00, 118.50, 'USD', '2024-02-20', 5000.00, 'available'),
  ('DEAL_ID_2', 'SOURCE_ID_4', 25000.00, 85.00, 'EUR', '2024-01-30', 20000.00, 'available'),
  ('DEAL_ID_2', 'SOURCE_ID_3', 15000.00, 87.25, 'EUR', '2024-02-05', 12000.00, 'available'),
  ('DEAL_ID_3', 'SOURCE_ID_5', 50000.00, 100.00, 'USD', '2024-03-01', 45000.00, 'available');

-- 8. Create fee plans (replace DEAL_ID_X with actual UUIDs)
INSERT INTO fee_plans (deal_id, name, description, is_default) VALUES
  ('DEAL_ID_1', 'Standard Tech Growth Plan', 'Standard fee structure for tech growth investments', true),
  ('DEAL_ID_1', 'Institutional Premium', 'Reduced fees for large institutional commitments', false),
  ('DEAL_ID_2', 'Real Estate Standard', 'Standard real estate investment fees', true),
  ('DEAL_ID_3', 'Credit Trade Finance', 'Specialized fees for trade finance deals', true),
  ('DEAL_ID_4', 'Infrastructure Premium', 'Long-term infrastructure investment fees', true);

-- 9. Create recent valuations for vehicles (replace VEHICLE_ID_X with actual UUIDs)
INSERT INTO valuations (vehicle_id, as_of_date, nav_total, nav_per_unit) VALUES
  ('VEHICLE_ID_1', '2024-03-15', 15000000.00, 125.50),
  ('VEHICLE_ID_2', '2024-03-15', 28500000.00, 89.75),
  ('VEHICLE_ID_3', '2024-03-15', 8000000.00, 160.00),
  ('VEHICLE_ID_4', '2024-03-15', 5000000.00, 100.00),
  -- Historical valuations
  ('VEHICLE_ID_1', '2024-02-15', 14200000.00, 118.75),
  ('VEHICLE_ID_2', '2024-02-15', 26800000.00, 84.20);

-- 10. Success confirmation
SELECT
  'Data Import Complete!' as status,
  (SELECT COUNT(*) FROM investors) as investors_created,
  (SELECT COUNT(*) FROM vehicles) as vehicles_created,
  (SELECT COUNT(*) FROM deals) as deals_created,
  (SELECT COUNT(*) FROM share_sources) as sources_created,
  (SELECT COUNT(*) FROM valuations) as valuations_created;