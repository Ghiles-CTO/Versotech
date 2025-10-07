-- Seed or update Process Center workflows

INSERT INTO workflows (key, name, description, category, n8n_webhook_url, input_schema, required_role, required_title, is_active)
VALUES
  (
    'generate-position-statement',
    'Position Statement',
    'Generate investor position statements with current NAV, distributions, and performance metrics',
    'documents',
    'https://n8n.example.com/webhook/generate-position-statement',
    jsonb_build_object(
      'investor_id', jsonb_build_object('label', 'Investor ID', 'type', 'text', 'required', true),
      'vehicle_id', jsonb_build_object('label', 'Vehicle ID (Optional)', 'type', 'text'),
      'as_of_date', jsonb_build_object('label', 'As of Date', 'type', 'date', 'required', true)
    ),
    'staff_ops',
    NULL,
    true
  ),
  (
    'process-nda',
    'NDA Agent',
    'Automated NDA generation, DocuSign processing, and professional investor qualification',
    'compliance',
    'https://n8n.example.com/webhook/process-nda',
    jsonb_build_object(
      'investor_email', jsonb_build_object('label', 'Investor Email', 'type', 'email', 'required', true),
      'investment_type', jsonb_build_object('label', 'Investment Type', 'type', 'text', 'required', true),
      'nda_template', jsonb_build_object('label', 'NDA Template', 'type', 'select', 'options', jsonb_build_array('standard', 'institutional', 'high-net-worth'), 'required', true)
    ),
    'staff_rm',
    NULL,
    true
  ),
  (
    'shared-drive-notification',
    'Shared-Drive Notification',
    'Sync shared drive uploads and notify stakeholders of updates',
    'communications',
    'https://n8n.example.com/webhook/shared-drive-notification',
    jsonb_build_object(
      'document_category', jsonb_build_object('label', 'Document Category', 'type', 'select', 'options', jsonb_build_array('legal', 'financial', 'marketing'), 'required', true),
      'notification_group', jsonb_build_object('label', 'Notification Group', 'type', 'select', 'options', jsonb_build_array('investors', 'staff', 'compliance'), 'required', true)
    ),
    'staff_ops',
    NULL,
    true
  ),
  (
    'inbox-manager',
    'Inbox Manager',
    'Process investor communications and route requests to appropriate teams',
    'communications',
    'https://n8n.example.com/webhook/inbox-manager',
    jsonb_build_object(
      'email_source', jsonb_build_object('label', 'Email Source', 'type', 'text', 'required', true),
      'priority_level', jsonb_build_object('label', 'Priority Level', 'type', 'select', 'options', jsonb_build_array('normal', 'high', 'urgent'), 'required', true)
    ),
    'staff_ops',
    NULL,
    true
  ),
  (
    'linkedin-leads-scraper',
    'LinkedIn Leads Scraper',
    'Identify and qualify potential investors from LinkedIn search criteria',
    'data_processing',
    'https://n8n.example.com/webhook/linkedin-leads-scraper',
    jsonb_build_object(
      'search_criteria', jsonb_build_object('label', 'Search Criteria', 'type', 'text', 'required', true),
      'lead_qualification', jsonb_build_object('label', 'Lead Qualification', 'type', 'select', 'options', jsonb_build_array('high-net-worth', 'institutional', 'qualified'), 'required', true)
    ),
    'staff_rm',
    NULL,
    true
  ),
  (
    'reporting-agent',
    'Reporting Agent',
    'Generate quarterly investor reports, compliance filings, and board presentations',
    'documents',
    'https://n8n.example.com/webhook/reporting-agent',
    jsonb_build_object(
      'report_type', jsonb_build_object('label', 'Report Type', 'type', 'select', 'options', jsonb_build_array('quarterly', 'annual', 'compliance', 'ad-hoc'), 'required', true),
      'recipients', jsonb_build_object('label', 'Recipients', 'type', 'select', 'options', jsonb_build_array('investors', 'regulators', 'board'), 'required', true),
      'include_charts', jsonb_build_object('label', 'Include Charts', 'type', 'checkbox')
    ),
    'staff_rm',
    NULL,
    true
  ),
  (
    'kyc-aml-processing',
    'KYC/AML Processing',
    'Perform compliance screening and store results in compliance logs',
    'compliance',
    'https://n8n.example.com/webhook/kyc-aml-processing',
    jsonb_build_object(
      'investor_type', jsonb_build_object('label', 'Investor Type', 'type', 'select', 'options', jsonb_build_array('individual', 'institution', 'corporate'), 'required', true),
      'jurisdiction', jsonb_build_object('label', 'Jurisdiction', 'type', 'text', 'required', true),
      'enhanced_dd', jsonb_build_object('label', 'Enhanced Due Diligence', 'type', 'checkbox')
    ),
    'staff_admin',
    NULL,
    true
  ),
  (
    'capital-call-processing',
    'Capital Call Processing',
    'Generate capital call notices, wire instructions, and investor notifications',
    'documents',
    'https://n8n.example.com/webhook/capital-call-processing',
    jsonb_build_object(
      'vehicle_id', jsonb_build_object('label', 'Vehicle ID', 'type', 'text', 'required', true),
      'call_percentage', jsonb_build_object('label', 'Call Percentage', 'type', 'number', 'required', true),
      'due_date', jsonb_build_object('label', 'Due Date', 'type', 'date', 'required', true),
      'wire_deadline', jsonb_build_object('label', 'Wire Deadline', 'type', 'datetime', 'required', true)
    ),
    'staff_admin',
    ARRAY['bizops'],
    true
  ),
  (
    'investor-onboarding',
    'Investor Onboarding',
    'Complete investor onboarding flow across KYC, NDA, and subscription steps',
    'multi_step',
    'https://n8n.example.com/webhook/investor-onboarding',
    jsonb_build_object(
      'investor_email', jsonb_build_object('label', 'Investor Email', 'type', 'email', 'required', true),
      'investment_amount', jsonb_build_object('label', 'Investment Amount', 'type', 'number', 'required', true),
      'target_vehicle', jsonb_build_object('label', 'Target Vehicle', 'type', 'text', 'required', true)
    ),
    'staff_ops',
    NULL,
    true
  )
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  n8n_webhook_url = EXCLUDED.n8n_webhook_url,
  input_schema = EXCLUDED.input_schema,
  required_role = EXCLUDED.required_role,
  required_title = EXCLUDED.required_title,
  is_active = EXCLUDED.is_active,
  updated_at = now();


