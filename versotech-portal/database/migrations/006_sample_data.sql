-- Database Migration 006: Sample Data for Testing
-- Description: Creates realistic test data for deals, inventory, fees, and users
-- Dependencies: Migrations 001-005 (complete schema)
-- Date: 2025-01-22
-- IMPORTANT: Only run in development/staging environments

-- ============================================================================
-- 1) SAMPLE DEALS
-- ============================================================================

-- Insert sample deals
INSERT INTO deals (id, name, deal_type, status, currency, offer_unit_price, open_at, close_at, terms_schema, created_by)
VALUES
  (
    'deal_revolut_2025',
    'Revolut Secondary - 2025',
    'equity_secondary',
    'open',
    'USD',
    28.50,
    '2025-01-15 09:00:00+00',
    '2025-03-15 17:00:00+00',
    '{"sector": "fintech", "stage": "secondary", "minimum_investment": 10000}',
    (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1)
  ),
  (
    'deal_luxembourg_re',
    'Luxembourg RE Fund III',
    'equity_primary',
    'open',
    'EUR',
    125.00,
    '2025-01-20 09:00:00+00',
    '2025-02-28 17:00:00+00',
    '{"sector": "real_estate", "stage": "primary", "minimum_investment": 25000}',
    (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1)
  ),
  (
    'deal_credit_2025',
    'Private Credit Opportunity',
    'credit_trade_finance',
    'allocation_pending',
    'USD',
    50.00,
    '2025-01-01 09:00:00+00',
    '2025-01-31 17:00:00+00',
    '{"sector": "credit", "yield": "12%", "minimum_investment": 50000}',
    (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1)
  );

-- ============================================================================
-- 2) SHARE SOURCES AND LOTS
-- ============================================================================

-- Create share sources
INSERT INTO share_sources (id, kind, counterparty_name, notes)
VALUES
  ('source_revolut_company', 'company', 'Revolut Group Holdings Ltd', 'Direct secondary purchase from company treasury'),
  ('source_revolut_colleague', 'colleague', 'Former Revolut Executive', 'Personal shares from early employee'),
  ('source_luxembourg_fund', 'fund', 'REAL Empire Management', 'Primary allocation from fund sponsor'),
  ('source_credit_originator', 'other', 'European Credit Partners', 'Trade finance portfolio acquisition');

-- Create share lots for Revolut deal
INSERT INTO share_lots (deal_id, source_id, units_total, unit_cost, currency, acquired_at, units_remaining, status)
VALUES
  ('deal_revolut_2025', 'source_revolut_company', 5000, 25.00, 'USD', '2024-12-15', 5000, 'available'),
  ('deal_revolut_2025', 'source_revolut_colleague', 3000, 22.50, 'USD', '2025-01-10', 3000, 'available'),
  ('deal_revolut_2025', 'source_revolut_company', 2000, 26.00, 'USD', '2025-01-12', 2000, 'available');

-- Create share lots for Luxembourg deal
INSERT INTO share_lots (deal_id, source_id, units_total, unit_cost, currency, acquired_at, units_remaining, status)
VALUES
  ('deal_luxembourg_re', 'source_luxembourg_fund', 3000, 120.00, 'EUR', '2025-01-18', 3000, 'available'),
  ('deal_luxembourg_re', 'source_luxembourg_fund', 2000, 122.50, 'EUR', '2025-01-19', 2000, 'available');

-- Create share lots for credit deal (fully allocated)
INSERT INTO share_lots (deal_id, source_id, units_total, unit_cost, currency, acquired_at, units_remaining, status)
VALUES
  ('deal_credit_2025', 'source_credit_originator', 8000, 48.00, 'USD', '2024-12-20', 0, 'exhausted');

-- ============================================================================
-- 3) INTRODUCERS
-- ============================================================================

-- Create sample introducers
INSERT INTO introducers (id, legal_name, default_commission_bps, status)
VALUES
  ('introducer_amin', 'Amin Canada Advisory Services', 250, 'active'), -- 2.5%
  ('introducer_eu_partner', 'European Investment Partners', 200, 'active'); -- 2.0%

-- ============================================================================
-- 4) FEE PLANS
-- ============================================================================

-- Fee plans for Revolut deal
INSERT INTO fee_plans (id, deal_id, name, description, is_default)
VALUES
  ('fp_revolut_allin', 'deal_revolut_2025', 'All-in 5%', '5% upfront fee with no ongoing charges', true),
  ('fp_revolut_carry', 'deal_revolut_2025', '3% + 10% Carry', '3% upfront plus 10% performance fee on gains', false);

-- Fee components for All-in 5%
INSERT INTO fee_components (fee_plan_id, kind, calc_method, rate_bps, frequency)
VALUES
  ('fp_revolut_allin', 'subscription', 'percent_of_investment', 500, 'one_time');

-- Fee components for 3% + 10% Carry
INSERT INTO fee_components (fee_plan_id, kind, calc_method, rate_bps, frequency)
VALUES
  ('fp_revolut_carry', 'subscription', 'percent_of_investment', 300, 'one_time'),
  ('fp_revolut_carry', 'performance', 'percent_of_profit', 1000, 'on_exit');

-- Fee plans for Luxembourg deal
INSERT INTO fee_plans (id, deal_id, name, description, is_default)
VALUES
  ('fp_luxembourg_standard', 'deal_luxembourg_re', 'Standard 2% + 20%', '2% annual management fee plus 20% performance', true);

-- Fee components for Luxembourg
INSERT INTO fee_components (fee_plan_id, kind, calc_method, rate_bps, frequency)
VALUES
  ('fp_luxembourg_standard', 'management', 'percent_per_annum', 200, 'annual'),
  ('fp_luxembourg_standard', 'performance', 'percent_of_profit', 2000, 'on_exit');

-- ============================================================================
-- 5) SAMPLE DEAL MEMBERSHIPS
-- ============================================================================

-- Add investors to deals (assuming some existing investors)
INSERT INTO deal_memberships (deal_id, user_id, investor_id, role, invited_by, invited_at, accepted_at)
SELECT
  'deal_revolut_2025',
  iu.user_id,
  iu.investor_id,
  'investor',
  (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1),
  now() - interval '5 days',
  now() - interval '3 days'
FROM investor_users iu
LIMIT 3;

INSERT INTO deal_memberships (deal_id, user_id, investor_id, role, invited_by, invited_at, accepted_at)
SELECT
  'deal_luxembourg_re',
  iu.user_id,
  iu.investor_id,
  'investor',
  (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1),
  now() - interval '2 days',
  now() - interval '1 day'
FROM investor_users iu
LIMIT 2;

-- ============================================================================
-- 6) SAMPLE INVESTOR TERMS
-- ============================================================================

-- Set investor terms for Revolut deal
INSERT INTO investor_terms (deal_id, investor_id, selected_fee_plan_id, status)
SELECT
  'deal_revolut_2025',
  dm.investor_id,
  'fp_revolut_allin',
  'active'
FROM deal_memberships dm
WHERE dm.deal_id = 'deal_revolut_2025'
AND dm.investor_id IS NOT NULL;

-- ============================================================================
-- 7) SAMPLE RESERVATIONS AND COMMITMENTS
-- ============================================================================

-- Create sample reservations (some active, some expired)
INSERT INTO reservations (
  deal_id,
  investor_id,
  requested_units,
  proposed_unit_price,
  expires_at,
  status,
  created_by
)
SELECT
  'deal_revolut_2025',
  dm.investor_id,
  500,
  28.50,
  now() + interval '25 minutes', -- Active reservation
  'pending',
  dm.user_id
FROM deal_memberships dm
WHERE dm.deal_id = 'deal_revolut_2025'
AND dm.investor_id IS NOT NULL
LIMIT 1;

-- Create expired reservation
INSERT INTO reservations (
  deal_id,
  investor_id,
  requested_units,
  proposed_unit_price,
  expires_at,
  status,
  created_by
)
SELECT
  'deal_revolut_2025',
  dm.investor_id,
  1000,
  28.50,
  now() - interval '10 minutes', -- Expired
  'pending',
  dm.user_id
FROM deal_memberships dm
WHERE dm.deal_id = 'deal_revolut_2025'
AND dm.investor_id IS NOT NULL
OFFSET 1
LIMIT 1;

-- Create sample commitments
INSERT INTO deal_commitments (
  deal_id,
  investor_id,
  requested_units,
  requested_amount,
  selected_fee_plan_id,
  status,
  created_by
)
SELECT
  'deal_revolut_2025',
  dm.investor_id,
  1000,
  28500.00,
  'fp_revolut_allin',
  'submitted',
  dm.user_id
FROM deal_memberships dm
WHERE dm.deal_id = 'deal_revolut_2025'
AND dm.investor_id IS NOT NULL
LIMIT 1;

-- ============================================================================
-- 8) SAMPLE APPROVALS
-- ============================================================================

-- Create approval for the commitment
INSERT INTO approvals (
  entity_type,
  entity_id,
  action,
  status,
  requested_by,
  assigned_to,
  priority
)
SELECT
  'deal_commitment',
  dc.id,
  'approve',
  'pending',
  dc.created_by,
  (SELECT id FROM profiles WHERE role = 'staff_admin' LIMIT 1),
  'normal'
FROM deal_commitments dc
WHERE dc.status = 'submitted';

-- ============================================================================
-- 9) SAMPLE INTRODUCTIONS
-- ============================================================================

-- Create sample introductions
INSERT INTO introductions (introducer_id, prospect_investor_id, deal_id, status)
SELECT
  'introducer_amin',
  dm.investor_id,
  'deal_revolut_2025',
  'joined'
FROM deal_memberships dm
WHERE dm.deal_id = 'deal_revolut_2025'
AND dm.investor_id IS NOT NULL
LIMIT 1;

-- ============================================================================
-- 10) DOCUMENT TEMPLATES
-- ============================================================================

-- Create sample document templates
INSERT INTO doc_templates (key, name, provider, schema)
VALUES
  (
    'term_sheet_equity_v1',
    'Equity Term Sheet Template v1',
    'server_pdf',
    '{"required_fields": ["deal_name", "investor_name", "units", "unit_price", "total_amount", "fee_structure"]}'
  ),
  (
    'subscription_pack_equity_v1',
    'Equity Subscription Pack v1',
    'dropbox_sign',
    '{"required_fields": ["deal_name", "investor_name", "subscription_amount", "wire_instructions"]}'
  );

-- ============================================================================
-- 11) COMMENTS AND VERIFICATION
-- ============================================================================

-- Add helpful views for testing
CREATE VIEW v_deal_summary AS
SELECT
  d.name as deal_name,
  d.status,
  d.currency,
  d.offer_unit_price,
  COALESCE(SUM(sl.units_total), 0) as total_units,
  COALESCE(SUM(sl.units_remaining), 0) as units_remaining,
  COUNT(DISTINCT dm.user_id) as member_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') as active_reservations,
  COUNT(DISTINCT dc.id) FILTER (WHERE dc.status = 'submitted') as pending_commitments
FROM deals d
LEFT JOIN share_lots sl ON sl.deal_id = d.id
LEFT JOIN deal_memberships dm ON dm.deal_id = d.id
LEFT JOIN reservations r ON r.deal_id = d.id
LEFT JOIN deal_commitments dc ON dc.deal_id = d.id
GROUP BY d.id, d.name, d.status, d.currency, d.offer_unit_price;

-- Verification queries (should be run after data insertion)
COMMENT ON VIEW v_deal_summary IS 'Summary view for testing - shows deal status and key metrics';

-- Sample verification query
/*
SELECT * FROM v_deal_summary;
SELECT fn_get_deal_inventory('deal_revolut_2025');
SELECT * FROM reservations WHERE status = 'pending';
*/