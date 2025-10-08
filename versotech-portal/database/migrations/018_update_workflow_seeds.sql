-- Update Process Center workflows with new schema definitions
-- This migration updates existing workflows with the new field types and configurations

-- Step 1: Add trigger_type column to workflows table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE workflows 
      ADD COLUMN trigger_type text DEFAULT 'manual'
      CHECK (trigger_type IN ('manual', 'scheduled', 'both'));
    
    -- Create index for scheduled workflows
    CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type 
      ON workflows(trigger_type) 
      WHERE trigger_type IN ('scheduled', 'both');
  END IF;
END $$;

-- Step 2: Clear existing workflows to reseed with new schema
DELETE FROM workflows WHERE key IN (
  'generate-position-statement',
  'process-nda',
  'shared-drive-notification',
  'inbox-manager',
  'linkedin-leads-scraper',
  'reporting-agent',
  'kyc-aml-processing',
  'capital-call-processing',
  'investor-onboarding'
);

-- Step 3: Insert updated workflow definitions
INSERT INTO workflows (key, name, description, category, n8n_webhook_url, input_schema, required_role, required_title, is_active, trigger_type)
VALUES
  -- Position Statement
  (
    'generate-position-statement',
    'Position Statement',
    'Generate investor position statements with current NAV, distributions, and performance metrics',
    'documents',
    'https://n8n.example.com/webhook/generate-position-statement',
    jsonb_build_object(
      'investor_id', jsonb_build_object(
        'label', 'Investor',
        'type', 'investor_select',
        'placeholder', 'Select investor',
        'required', true,
        'helperText', 'Choose the investor to generate the position statement for'
      ),
      'vehicle_id', jsonb_build_object(
        'label', 'Vehicle (Optional)',
        'type', 'vehicle_select',
        'placeholder', 'All vehicles or select specific vehicle',
        'helperText', 'Leave empty for all vehicles or select a specific fund'
      ),
      'as_of_date', jsonb_build_object(
        'label', 'As of Date',
        'type', 'date',
        'required', true,
        'helperText', 'The date for which to generate the position statement'
      )
    ),
    'staff_ops',
    NULL,
    true,
    'manual'
  ),

  -- NDA Agent
  (
    'process-nda',
    'NDA Agent',
    'Automated NDA generation, DocuSign processing, and professional investor qualification',
    'compliance',
    'https://n8n.example.com/webhook/process-nda',
    jsonb_build_object(
      'investor_email', jsonb_build_object(
        'label', 'Investor Email',
        'type', 'email',
        'placeholder', 'investor@example.com',
        'required', true,
        'helperText', 'Email address where the NDA will be sent'
      ),
      'investment_type', jsonb_build_object(
        'label', 'Investment Type',
        'type', 'text',
        'placeholder', 'VERSO FUND, REAL Empire, etc.',
        'required', true,
        'helperText', 'Specify the investment vehicle or opportunity'
      ),
      'nda_template', jsonb_build_object(
        'label', 'NDA Template',
        'type', 'select',
        'options', jsonb_build_array('standard', 'institutional', 'high-net-worth'),
        'required', true,
        'helperText', 'Choose the appropriate NDA template'
      )
    ),
    'staff_rm',
    NULL,
    true,
    'manual'
  ),

  -- Shared Drive Notification
  (
    'shared-drive-notification',
    'Shared-Drive Notification',
    'Automatically notify investors when documents in shared drives are updated',
    'communications',
    'https://n8n.example.com/webhook/shared-drive-notification',
    jsonb_build_object(
      'document_category', jsonb_build_object(
        'label', 'Document Category',
        'type', 'select',
        'options', jsonb_build_array('legal', 'financial', 'marketing', 'compliance', 'reports'),
        'required', true,
        'helperText', 'Type of documents to monitor'
      ),
      'notification_group', jsonb_build_object(
        'label', 'Notification Group',
        'type', 'select',
        'options', jsonb_build_array('investors', 'staff', 'compliance', 'all'),
        'required', true,
        'helperText', 'Who should be notified of changes'
      )
    ),
    'staff_ops',
    NULL,
    true,
    'scheduled'
  ),

  -- Inbox Manager
  (
    'inbox-manager',
    'Inbox Manager',
    'Intelligently process and route investor communications to appropriate teams',
    'communications',
    'https://n8n.example.com/webhook/inbox-manager',
    jsonb_build_object(
      'inbox_type', jsonb_build_object(
        'label', 'Inbox Type',
        'type', 'select',
        'options', jsonb_build_array('email', 'versotech_messaging'),
        'required', true,
        'helperText', 'Choose the type of inbox to process'
      ),
      'command', jsonb_build_object(
        'label', 'Command/Action',
        'type', 'text',
        'placeholder', 'e.g., "route to compliance", "create task"',
        'required', true,
        'helperText', 'Specify the action to perform on matched messages'
      ),
      'email_subject', jsonb_build_object(
        'label', 'Email Subject Filter',
        'type', 'text',
        'placeholder', 'Subject keywords to match',
        'dependsOn', 'inbox_type',
        'showWhen', 'email',
        'helperText', 'Filter emails by subject line'
      ),
      'conversation_id', jsonb_build_object(
        'label', 'Conversation',
        'type', 'conversation_select',
        'placeholder', 'Select conversation',
        'dependsOn', 'inbox_type',
        'showWhen', 'versotech_messaging',
        'helperText', 'Choose the conversation to apply the command to'
      )
    ),
    'staff_ops',
    NULL,
    true,
    'both'
  ),

  -- LinkedIn Leads Scraper
  (
    'linkedin-leads-scraper',
    'LinkedIn Leads Scraper',
    'Identify and qualify potential high-net-worth investors and institutional clients',
    'data_processing',
    'https://n8n.example.com/webhook/linkedin-leads-scraper',
    jsonb_build_object(
      'search_url', jsonb_build_object(
        'label', 'LinkedIn Search URL',
        'type', 'text',
        'placeholder', 'https://www.linkedin.com/search/results/people/?...',
        'required', true,
        'helperText', 'Paste the full LinkedIn search URL with filters applied'
      ),
      'purpose', jsonb_build_object(
        'label', 'Campaign Purpose',
        'type', 'select',
        'options', jsonb_build_array('linkedin_outreach', 'cold_email_campaign'),
        'required', true,
        'helperText', 'Select the intended use for the scraped leads'
      )
    ),
    'staff_rm',
    NULL,
    true,
    'manual'
  ),

  -- Reporting Agent
  (
    'reporting-agent',
    'Reporting Agent',
    'Generate comprehensive investor reports, compliance filings, and performance analytics',
    'documents',
    'https://n8n.example.com/webhook/reporting-agent',
    jsonb_build_object(
      'report_category', jsonb_build_object(
        'label', 'Report Category',
        'type', 'select',
        'options', jsonb_build_array('public', 'corporate', 'both'),
        'required', true,
        'helperText', 'Type of report to generate'
      ),
      'investor_id', jsonb_build_object(
        'label', 'Investor',
        'type', 'investor_select',
        'placeholder', 'Select investor',
        'required', true,
        'helperText', 'Choose the investor to generate the report for'
      ),
      'vehicle_id', jsonb_build_object(
        'label', 'Vehicle',
        'type', 'vehicle_select',
        'placeholder', 'Select vehicle',
        'required', true,
        'helperText', 'Choose the fund or vehicle for the report'
      ),
      'frequency', jsonb_build_object(
        'label', 'Report Frequency',
        'type', 'select',
        'options', jsonb_build_array('one-time', 'monthly', 'quarterly', 'annual'),
        'required', true,
        'helperText', 'How often the report should be generated'
      ),
      'include_charts', jsonb_build_object(
        'label', 'Include Charts',
        'type', 'checkbox',
        'defaultValue', true,
        'helperText', 'Add visual charts and graphs to the report'
      )
    ),
    'staff_rm',
    NULL,
    true,
    'both'
  ),

  -- KYC/AML Processing
  (
    'kyc-aml-processing',
    'KYC/AML Processing',
    'Enhanced due diligence for professional investor qualification and BVI FSC compliance',
    'compliance',
    'https://n8n.example.com/webhook/kyc-aml-processing',
    jsonb_build_object(
      'investor_id', jsonb_build_object(
        'label', 'Investor',
        'type', 'investor_select',
        'placeholder', 'Select investor',
        'required', true,
        'helperText', 'Choose the investor to perform KYC/AML checks on'
      ),
      'investor_type', jsonb_build_object(
        'label', 'Investor Type',
        'type', 'select',
        'options', jsonb_build_array('individual', 'institution', 'corporate'),
        'required', true,
        'helperText', 'Classification of the investor'
      ),
      'jurisdiction', jsonb_build_object(
        'label', 'Jurisdiction',
        'type', 'text',
        'placeholder', 'e.g., United Kingdom, Cayman Islands',
        'required', true,
        'helperText', 'Legal jurisdiction of the investor'
      ),
      'enhanced_dd', jsonb_build_object(
        'label', 'Enhanced Due Diligence',
        'type', 'checkbox',
        'helperText', 'Perform additional enhanced due diligence checks'
      )
    ),
    'staff_admin',
    NULL,
    true,
    'manual'
  ),

  -- Capital Call Processing
  (
    'capital-call-processing',
    'Capital Call Processing',
    'Generate capital call notices, wire instructions, and investor notifications',
    'communications',
    'https://n8n.example.com/webhook/capital-call-processing',
    jsonb_build_object(
      'vehicle_id', jsonb_build_object(
        'label', 'Vehicle',
        'type', 'vehicle_select',
        'placeholder', 'Select vehicle',
        'required', true,
        'helperText', 'Choose the fund or vehicle for the capital call'
      ),
      'call_percentage', jsonb_build_object(
        'label', 'Call Percentage',
        'type', 'number',
        'placeholder', '30.00',
        'required', true,
        'helperText', 'Percentage of committed capital to call (e.g., 30 for 30%)'
      ),
      'due_date', jsonb_build_object(
        'label', 'Due Date',
        'type', 'date',
        'required', true,
        'helperText', 'Date by which capital must be received'
      ),
      'wire_deadline', jsonb_build_object(
        'label', 'Wire Deadline',
        'type', 'datetime',
        'required', true,
        'helperText', 'Specific date and time for wire transfer deadline'
      )
    ),
    'staff_admin',
    ARRAY['bizops'],
    true,
    'manual'
  ),

  -- Investor Onboarding
  (
    'investor-onboarding',
    'Investor Onboarding',
    'Complete investor onboarding flow: KYC → NDA → Subscription → First Funding',
    'multi_step',
    'https://n8n.example.com/webhook/investor-onboarding',
    jsonb_build_object(
      'investor_email', jsonb_build_object(
        'label', 'Investor Email',
        'type', 'email',
        'placeholder', 'investor@example.com',
        'required', true,
        'helperText', 'Primary email address for the new investor'
      ),
      'investment_amount', jsonb_build_object(
        'label', 'Initial Investment',
        'type', 'number',
        'placeholder', '1000000',
        'required', true,
        'helperText', 'Target investment amount in USD'
      ),
      'target_vehicle', jsonb_build_object(
        'label', 'Target Vehicle',
        'type', 'vehicle_select',
        'placeholder', 'Select vehicle',
        'required', true,
        'helperText', 'Fund or vehicle the investor will participate in'
      ),
      'investor_type', jsonb_build_object(
        'label', 'Investor Type',
        'type', 'select',
        'options', jsonb_build_array('individual', 'institution', 'corporate'),
        'required', true,
        'helperText', 'Classification for KYC processing'
      )
    ),
    'staff_ops',
    NULL,
    true,
    'manual'
  );

