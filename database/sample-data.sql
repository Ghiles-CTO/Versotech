-- Sample Data for VERSO Holdings Portal
-- Run this AFTER the schema and RLS policies

-- Insert sample workflows (the 6 key processes from PRD)
INSERT INTO workflows (key, n8n_webhook_url, schema, allowed_titles) VALUES
('inbox_manager', 'https://your-n8n-url.com/webhook/inbox-manager', 
 '{"properties": {"email_category": {"type": "string", "enum": ["support", "investment", "compliance"]}, "priority": {"type": "string", "enum": ["low", "normal", "high"]}}}',
 ARRAY['admin', 'ops', 'bizops']),

('shared_drive_notification', 'https://your-n8n-url.com/webhook/shared-drive', 
 '{"properties": {"folder_path": {"type": "string"}, "notification_type": {"type": "string", "enum": ["new_file", "update", "delete"]}}}',
 ARRAY['admin', 'ops']),

('linkedin_leads_scraper', 'https://your-n8n-url.com/webhook/linkedin-scraper', 
 '{"properties": {"search_query": {"type": "string"}, "max_results": {"type": "integer", "minimum": 1, "maximum": 100}}}',
 ARRAY['admin', 'rm', 'bizops']),

('positions_statement', 'https://your-n8n-url.com/webhook/positions-statement', 
 '{"properties": {"investor_id": {"type": "string"}, "as_of_date": {"type": "string", "format": "date"}, "currency": {"type": "string", "enum": ["USD", "EUR", "GBP"]}, "format": {"type": "string", "enum": ["PDF", "CSV"]}}}',
 ARRAY['admin', 'ops', 'rm']),

('nda_agent', 'https://your-n8n-url.com/webhook/nda-agent', 
 '{"properties": {"investor_id": {"type": "string"}, "template_type": {"type": "string", "enum": ["standard", "mutual", "enhanced"]}}}',
 ARRAY['admin', 'ops', 'compliance']),

('reporting_agent', 'https://your-n8n-url.com/webhook/reporting-agent', 
 '{"properties": {"report_type": {"type": "string", "enum": ["quarterly", "annual", "custom"]}, "vehicle_id": {"type": "string"}, "parameters": {"type": "object"}}}',
 ARRAY['admin', 'ops', 'rm', 'pm']);

-- Insert sample vehicles (the 3 from PRD: VERSO FUND, REAL Empire, SPV Delta)
INSERT INTO vehicles (id, name, type, domicile, currency) VALUES
('11111111-1111-1111-1111-111111111111', 'VERSO FUND', 'fund', 'BVI', 'USD'),
('22222222-2222-2222-2222-222222222222', 'REAL Empire', 'securitization', 'Luxembourg', 'USD'),
('33333333-3333-3333-3333-333333333333', 'SPV Delta', 'spv', 'Delaware', 'USD');

-- Insert sample valuations (current NAV data)
INSERT INTO valuations (vehicle_id, as_of_date, nav_total, nav_per_unit) VALUES
('11111111-1111-1111-1111-111111111111', '2024-12-31', 45000000.00, 1.125),
('22222222-2222-2222-2222-222222222222', '2024-12-31', 28000000.00, 1.087),
('33333333-3333-3333-3333-333333333333', '2024-12-31', 12500000.00, 1.000);

-- Insert sample capital calls
INSERT INTO capital_calls (vehicle_id, name, call_pct, due_date, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Capital Call #4', 0.15, '2025-02-15', 'active'),
('33333333-3333-3333-3333-333333333333', 'Initial Capital Call', 0.25, '2025-01-30', 'active');

-- Insert sample distributions
INSERT INTO distributions (vehicle_id, name, amount, date, classification) VALUES
('11111111-1111-1111-1111-111111111111', 'Q4 2024 Distribution', 1250000.00, '2024-12-30', 'income'),
('22222222-2222-2222-2222-222222222222', 'Annual Distribution 2024', 750000.00, '2024-12-15', 'capital_gains');

-- Note: You'll need to create actual user accounts via the auth system
-- Then you can insert investors and link them to users
-- For now, this provides the basic vehicle and workflow structure

-- Create sample investor (you'll link this to actual users after they sign up)
INSERT INTO investors (id, legal_name, type, kyc_status, country) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John Smith', 'individual', 'approved', 'United States'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Acme Investment Fund LP', 'entity', 'approved', 'United States');

-- Sample subscriptions (linking investors to vehicles)
INSERT INTO subscriptions (investor_id, vehicle_id, commitment, currency, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1000000.00, 'USD', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 500000.00, 'USD', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 250000.00, 'USD', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 2000000.00, 'USD', 'active');

-- Sample positions (current holdings)
INSERT INTO positions (investor_id, vehicle_id, units, cost_basis, last_nav, as_of_date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 666666.67, 750000.00, 1.125, '2024-12-31'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 321637.43, 350000.00, 1.087, '2024-12-31'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 150000.00, 150000.00, 1.000, '2024-12-31'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1333333.33, 1500000.00, 1.125, '2024-12-31');

-- Sample cashflows
INSERT INTO cashflows (investor_id, vehicle_id, type, amount, date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'call', 750000.00, '2023-06-15'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'distribution', 25000.00, '2024-12-30'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'call', 350000.00, '2023-08-01'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'call', 150000.00, '2024-09-01');

