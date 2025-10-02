# Process Center PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Process Center is VERSO's workflow automation command center, where operations staff trigger and monitor n8n-powered processes that drive investor operations, compliance, and reporting. Instead of manually generating position statements, processing NDAs, or routing investor emails, staff members click a button, fill in parameters, and let automated workflows handle the heavy lifting.

Each workflow is purpose-built for a specific VERSO operational need—from investor onboarding sequences that orchestrate KYC → NDA → Subscription flows, to capital call processing that generates notices, calculates wire instructions, and notifies investors. The Process Center democratizes automation: any authorized staff member can execute sophisticated multi-step processes without writing code or accessing back-end systems.

Behind the scenes, workflows integrate with Supabase (for data retrieval and updates), DocuSign (for e-signatures), external compliance APIs (for KYC/AML screening), and communication channels (for email and document delivery). Every workflow execution is logged, audited, and tracked with real-time status updates, ensuring full traceability and regulatory compliance.

---

## Part 1: Business Context (Non-Technical)

### What is the Process Center?

The Process Center is the staff-facing interface for launching and monitoring automated n8n workflows. It serves as the operational hub for:

- **Document Generation**: Position statements, subscription agreements, capital call notices
- **Compliance Automation**: KYC/AML screening, professional investor verification, sanctions checks
- **Communication Workflows**: Automated email routing, investor notifications, stakeholder alerts
- **Data Processing**: LinkedIn lead scraping, inbox triaging, shared drive synchronization
- **Multi-Step Sequences**: Complete investor onboarding flows (KYC → NDA → Funding)

Each workflow is represented as a card with:
- **Title & Description**: Clear explanation of what the workflow does
- **Input Schema**: Dynamic form fields for workflow parameters (investor ID, dates, amounts)
- **Trigger Button**: Launch the workflow with validation
- **Recent Runs**: View last 5 executions with status indicators
- **Documentation Link**: Detailed workflow documentation and troubleshooting

### Why Does It Matter?

**For VERSO Operations Team:**
- **Efficiency Gains**: Automate repetitive tasks that previously took hours (e.g., generating position statements)
- **Error Reduction**: Eliminate manual data entry errors with validated forms and database-driven workflows
- **Consistent Quality**: Ensure all investors receive identically formatted, compliant documentation
- **Real-Time Visibility**: Track workflow execution status without asking IT or checking logs
- **Self-Service**: Execute processes independently without developer or admin intervention

**For VERSO Leadership:**
- **Operational Scalability**: Handle 10x investor volume without proportional staff increase
- **Cost Reduction**: Reduce manual processing costs by 70%+ through automation
- **Audit Compliance**: Full execution logs for BVI FSC and GDPR regulatory reviews
- **Performance Metrics**: Track workflow success rates, execution times, and bottlenecks

**For Investors:**
- **Faster Service**: Receive position statements, capital call notices, and reports within minutes (not days)
- **Consistency**: Predictable, error-free documentation every time
- **Transparency**: Automated status updates via portal and email

### How It Connects to Other Modules

- **Investor Management**: Workflows fetch investor data, update KYC status, create portal accounts
- **Deal Management**: Capital call workflows read deal allocations, generate wire instructions
- **Task Management**: Workflows auto-create follow-up tasks (e.g., "Review AML screening results")
- **Documents**: Generated PDFs are stored in Documents module and watermarked
- **Messages**: Workflows send notifications via Messages module and email
- **Audit Log**: Every workflow execution is logged with inputs, outputs, and duration
- **Dashboard**: Recent workflow activity surfaces in Operations Dashboard

### Who Uses It?

**Primary Users:**
- **Operations Staff** (`staff_ops`): Daily workflow execution for investor servicing
- **Relationship Managers** (`staff_rm`): Position statement generation, ad-hoc reporting
- **Compliance Officers** (`staff_admin`): KYC/AML screening, enhanced due diligence
- **Business Operations** (`staff_admin`): Capital call processing, bulk investor communications

**Access Levels:**
- All staff can view Process Center and trigger basic workflows
- Sensitive workflows (capital calls, bulk communications) require `staff_admin` role
- Title-based restrictions (e.g., only `bizops` can trigger capital call processing)

### Core Workflows (Use Cases)

**1. Position Statement Generation**

**Business Need:** Investors frequently request current position statements showing their NAV, contributions, distributions, and performance metrics across all vehicles or a specific fund.

**Manual Process (Before):**
- Ops analyst receives email from investor requesting statement
- Logs into multiple systems to pull NAV data, capital call history, distribution records
- Manually creates Excel spreadsheet, formats data, converts to PDF
- Watermarks PDF with "Confidential" header
- Emails investor with statement attachment
- **Time:** 30-60 minutes per investor

**Automated Process (Now):**
1. Ops analyst opens Process Center, clicks "Position Statement"
2. Enters investor ID (auto-lookup from dropdown)
3. Selects "as of date" (defaults to yesterday)
4. Optionally filters to specific vehicle or shows all
5. Clicks "Trigger Position Statement"
6. Workflow executes in 15-30 seconds:
   - Queries Supabase for latest NAV, contributions, distributions
   - Calculates DPI, TVPI, IRR from performance_snapshots
   - Generates PDF using VERSO template with branding
   - Watermarks PDF with investor name and generation timestamp
   - Stores in Documents module with investor ownership
   - Creates activity feed entry "Position Statement Generated"
   - Emails investor with download link and 7-day expiry
7. Analyst receives success notification with document ID
8. **Time:** 30 seconds

**Parameters:**
- `investor_id` (required): UUID or email lookup
- `vehicle_id` (optional): Filter to specific fund
- `as_of_date` (required): Data snapshot date

**2. NDA Agent (Automated NDA Processing)**

**Business Need:** Before sharing deal materials, VERSO requires all prospective investors to sign NDAs. Manual NDA processing involves document generation, DocuSign routing, and professional investor qualification checks.

**Automated Process:**
1. RM receives request from new investor "Jane Smith" interested in VERSO FUND
2. RM opens Process Center → "NDA Agent"
3. Enters investor email: jane.smith@example.com
4. Selects investment type: "VERSO FUND"
5. Chooses NDA template: "high-net-worth" (vs. institutional)
6. Triggers workflow
7. n8n workflow:
   - Creates investor profile in Supabase (if doesn't exist)
   - Generates NDA PDF with investor name and current date
   - Sends DocuSign envelope to investor email
   - Creates task "Monitor NDA Completion" assigned to RM
   - Sends investor welcome email with timeline and next steps
8. When investor signs NDA via DocuSign:
   - Webhook updates investor record with `nda_signed_at` timestamp
   - Stores signed PDF in Documents module
   - Completes "Monitor NDA Completion" task
   - Sends RM notification "Jane Smith signed NDA"
   - Creates next task "Send Deal Room Invitation"

**Parameters:**
- `investor_email` (required)
- `investment_type` (required): VERSO FUND, REAL Empire, etc.
- `nda_template` (required): standard, institutional, high-net-worth

**3. Capital Call Processing**

**Business Need:** When VERSO FUND closes a new deal, Business Operations must issue capital calls to all committed investors, calculate call amounts per investor, generate wire instructions, and track payments.

**Automated Process:**
1. BizOps lead receives notice: "VERSO FUND closing $2M allocation in Deal XYZ, require $1.5M capital call"
2. Opens Process Center → "Capital Call Processing"
3. Enters parameters:
   - `vehicle_id`: VERSO FUND I
   - `call_percentage`: 30.00 (30% of commitment)
   - `due_date`: 2025-11-15
   - `wire_deadline`: 2025-11-13 17:00 GMT
4. Triggers workflow
5. n8n executes:
   - Queries all investors with VERSO FUND commitments
   - Calculates call amount per investor: `commitment * call_percentage`
   - Generates capital call notice PDFs (one per investor) with:
     - Amount due
     - Wire instructions (VERSO bank account details)
     - Due date and payment reference
   - Creates `capital_calls` records in database (status: pending)
   - Sends email to each investor with PDF attachment
   - Creates tasks "Monitor Capital Call Payments" for ops team
   - Posts summary to #capital-calls Slack channel (if integrated)
6. BizOps receives confirmation: "Capital call issued to 12 investors, total $1.5M"

**Parameters:**
- `vehicle_id` (required)
- `call_percentage` (required): Percentage of unfunded commitment
- `due_date` (required)
- `wire_deadline` (required)

**4. Investor Onboarding (Complete Flow)**

**Business Need:** New investor onboarding involves 5+ manual steps across multiple systems. Automating the sequence reduces onboarding time from weeks to days.

**Automated Process:**
1. Ops analyst receives new investor lead: "David Chen, $1M investment in VERSO FUND"
2. Opens Process Center → "Investor Onboarding"
3. Enters:
   - `investor_email`: david.chen@email.com
   - `investment_amount`: 1000000
   - `target_vehicle`: VERSO FUND I
4. Triggers workflow
5. n8n orchestrates multi-step sequence:
   - **Step 1 - Profile Creation**: Create investor profile in Supabase
   - **Step 2 - KYC Request**: Send automated email requesting KYC documents (passport, proof of address, source of funds)
   - **Step 3 - Task Creation**: Create onboarding tasks assigned to ops team
   - **Step 4 - NDA Generation**: Auto-generate and send NDA via DocuSign
   - **Step 5 - Subscription Agreement**: Once NDA signed, send subscription agreement
   - **Step 6 - Portal Invitation**: After KYC approved, send portal invitation email
   - **Step 7 - RM Assignment**: Assign relationship manager based on investment size
   - **Step 8 - Welcome Communication**: Send welcome email from RM with introduction and timeline
6. Each step triggers on completion of prior step (workflow pauses waiting for investor actions like NDA signature)
7. Ops analyst monitors progress in Task Management module
8. **Timeline:** 5-7 days (vs. 2-3 weeks manual)

**Parameters:**
- `investor_email` (required)
- `investment_amount` (required)
- `target_vehicle` (required)

**5. KYC/AML Processing**

**Business Need:** BVI FSC requires professional investor verification and AML screening for all investors. Manual screening involves checking sanctions lists, PEP databases, and adverse media—time-consuming and error-prone.

**Automated Process:**
1. Compliance officer receives uploaded KYC documents from investor
2. Opens Process Center → "KYC/AML Processing"
3. Enters:
   - `investor_type`: individual
   - `jurisdiction`: BVI
   - `enhanced_dd`: checked (high-net-worth investor)
4. Triggers workflow
5. n8n executes screening sequence:
   - **Address Verification**: Validate proof of address via Google Maps API
   - **Sanctions Screening**: Check investor name against OFAC, EU, UN sanctions lists (via ComplyAdvantage API)
   - **PEP Screening**: Check for politically exposed person status
   - **Adverse Media**: Search news databases for negative mentions
   - **Risk Scoring**: Calculate AML risk rating (low/medium/high) based on results
   - **Compliance Record**: Store screening results in `compliance_checks` table
   - **Task Creation**: If high-risk flagged, create "Enhanced Due Diligence Review" task for compliance officer
6. Compliance officer reviews results in Investor Management module
7. If all clear: Approves KYC status → triggers portal invitation workflow

**Parameters:**
- `investor_type` (required)
- `jurisdiction` (required)
- `enhanced_dd` (optional checkbox)

**6. Reporting Agent**

**Business Need:** Generate quarterly investor reports, compliance filings, and board presentations with consistent formatting and accurate data.

**Automated Process:**
1. RM needs to generate Q3 2025 performance report for all VERSO FUND investors
2. Opens Process Center → "Reporting Agent"
3. Enters:
   - `report_type`: quarterly
   - `recipients`: investors
   - `include_charts`: checked
4. Triggers workflow
5. n8n generates multi-page report:
   - **Cover Page**: VERSO branding, Q3 2025 date range
   - **Portfolio Summary**: NAV, contributions, distributions, IRR
   - **Deal Activity**: Closed deals, pending allocations, pipeline
   - **Performance Charts**: NAV trend, cash flow waterfall, sector allocation
   - **Compliance Certifications**: BVI FSC status, AIFMD compliance
6. PDF generated and stored in Documents module
7. Email sent to all investors with download link

**Parameters:**
- `report_type` (required): quarterly, annual, compliance, ad-hoc
- `recipients` (required): investors, regulators, board
- `include_charts` (checkbox)

**7. Inbox Manager**

**Business Need:** VERSO receives 50+ investor emails daily to info@versoholdings.com. Manually triaging and routing to appropriate teams is inefficient.

**Automated Process:**
1. BizOps sets up daily trigger: Inbox Manager runs every hour
2. Workflow monitors info@versoholdings.com inbox
3. For each new email:
   - Extract sender email and classify sender (investor, prospect, vendor, spam)
   - Analyze email content using OpenAI to classify request type:
     - Capital call inquiry → Route to BizOps, priority: high
     - Position statement request → Route to Ops, trigger position statement workflow
     - General inquiry → Create request ticket, route to RM
     - Spam → Archive
   - Create `request_tickets` record in database
   - Assign to appropriate staff member
   - Send auto-reply to investor: "We've received your request (ID: #12345) and will respond within 24 hours"
4. Staff sees new assigned requests in Request Management module

**Parameters:**
- `email_source` (required): info@versoholdings.com, support@
- `priority_level` (required): normal, high, urgent

**8. Shared-Drive Notification**

**Business Need:** When VERSO uploads new investor reports, legal docs, or marketing materials to shared drives, stakeholders need to be notified.

**Automated Process:**
1. Ops analyst uploads Q3 investor reports to Google Drive folder "/Reports/2025-Q3/"
2. Opens Process Center → "Shared-Drive Notification"
3. Enters:
   - `document_category`: financial
   - `notification_group`: investors
4. Triggers workflow
5. n8n:
   - Scans Google Drive folder for new files (uploaded in last 24 hours)
   - For each file:
     - Store metadata in Documents module
     - Create activity feed entries for relevant investors
     - Send email notification with download link
   - Post summary to #document-updates Slack channel

**Parameters:**
- `document_category` (required): legal, financial, marketing
- `notification_group` (required): investors, staff, compliance

**9. LinkedIn Leads Scraper**

**Business Need:** Identify high-net-worth individuals and family offices for VERSO deal pipeline.

**Automated Process:**
1. RM wants to identify private equity professionals in London for outreach
2. Opens Process Center → "LinkedIn Leads Scraper"
3. Enters:
   - `search_criteria`: "private equity London managing director"
   - `lead_qualification`: high-net-worth
4. Triggers workflow
5. n8n (with Phantombuster or similar):
   - Searches LinkedIn for profiles matching criteria
   - Extracts profile data (name, title, company, LinkedIn URL)
   - Scores lead quality based on title, company size, industry
   - Stores leads in `prospects` table
   - Creates tasks "Outreach to [Name]" assigned to RM
6. RM reviews leads in Prospects module and initiates outreach

**Parameters:**
- `search_criteria` (required)
- `lead_qualification` (required): high-net-worth, institutional, qualified

### Business Rules

**Workflow Execution:**
- All workflows require staff authentication via Supabase Auth
- Sensitive workflows (capital calls, bulk comms) require `staff_admin` role
- Title-based restrictions enforced (e.g., only `bizops` can process capital calls)
- Idempotency: Duplicate triggers within 5 minutes are blocked with warning

**Workflow Status:**
- States: `queued`, `running`, `completed`, `failed`, `cancelled`
- Timeout: Workflows exceeding 10 minutes auto-fail and notify assigned staff
- Retries: Failed workflows can be manually retried from Workflow History page
- Cancellation: Running workflows can be cancelled by staff_admin only

**Audit & Compliance:**
- Every workflow execution logged in `workflow_runs` table
- Input parameters stored as JSONB for full audit trail
- Output documents linked via `result_doc_id`
- Failed workflows trigger alert to #ops-alerts Slack channel
- Monthly compliance report: workflow success rate must exceed 95%

**Data Security:**
- Workflow parameters cannot contain PII in plain text (encrypt at rest)
- HMAC signatures required for all n8n webhook callbacks
- Idempotency tokens prevent replay attacks
- Sensitive outputs (tax docs, KYC) encrypted before storage

**Rate Limits:**
- Maximum 50 workflow executions per staff member per hour
- Capital call workflows limited to 5 executions per day (prevent accidental duplicate calls)
- LinkedIn scraper limited to 100 leads per week (API quota)

### Visual Design Standards

**Layout:**
- Header: "Process Center" title, current user badge, n8n status indicator
- Grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Each workflow card: Icon, title, description, form, trigger button, recent runs

**Workflow Cards:**
- Icon: Semantic icon matching workflow type (BarChart3 for reports, Shield for compliance)
- Form: Dynamic fields based on schema (text, date, number, checkbox, dropdown)
- Trigger button: Blue primary button, disabled during execution, spinner when running
- Recent runs: Last 5 executions with status badges (green=completed, red=failed, blue=running)

**Color Coding:**
- **Workflow Status**:
  - Queued: Blue (`bg-blue-100 text-blue-800`)
  - Running: Blue with spinner
  - Completed: Green (`bg-green-100 text-green-800`)
  - Failed: Red (`bg-red-100 text-red-800`)
- **Workflow Categories** (future):
  - Documents: Purple
  - Compliance: Orange
  - Communications: Blue
  - Data Processing: Gray

**Icons:**
- Position Statement: `BarChart3`
- NDA Agent: `FileText`
- Shared Drive: `Database`
- Inbox Manager: `MessageSquare`
- LinkedIn Scraper: `Target`
- Reporting: `TrendingUp`
- KYC/AML: `Shield`
- Capital Calls: `Calendar`
- Onboarding: `Users`

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/processes/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `requireStaffAuth()`
**Data Flow**: Server component renders static workflow cards, client component handles form submission and execution

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, user badge)
       ├─ Process Grid (3 columns)
       │    └─ ProcessTrigger (Client Component) × 9
       │         ├─ Workflow Icon
       │         ├─ Title & Description
       │         ├─ Dynamic Form (based on schema)
       │         ├─ Trigger Button
       │         └─ Recent Runs (last 5)
       └─ Workflow Status Overview Card
```

### Current Implementation

**Server Component (page.tsx):**
```typescript
import { requireStaffAuth } from '@/lib/auth'
import { ProcessTrigger } from '@/components/staff/process-trigger'

export default async function ProcessesPage() {
  const profile = await requireStaffAuth()

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Process Center</h1>
          <p className="text-lg text-gray-600 mt-1">
            n8n workflow automation for VERSO Holdings operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 9 ProcessTrigger components with schemas */}
          <ProcessTrigger
            workflowKey="generate-position-statement"
            title="Position Statement"
            description="Generate investor position statements with current NAV..."
            iconName="BarChart3"
            schema={{
              investor_id: {
                label: "Investor ID",
                type: "text",
                placeholder: "Enter investor UUID"
              },
              vehicle_id: {
                label: "Vehicle ID (Optional)",
                type: "text",
                placeholder: "Specific vehicle or leave blank for all"
              },
              as_of_date: {
                label: "As of Date",
                type: "date",
                placeholder: new Date().toISOString().split('T')[0]
              }
            }}
          />
          {/* ... 8 more ProcessTrigger components ... */}
        </div>
      </div>
    </AppLayout>
  )
}
```

**Client Component (ProcessTrigger):**
```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ProcessTriggerProps {
  workflowKey: string
  title: string
  description: string
  iconName?: string
  schema?: Record<string, any>
}

export function ProcessTrigger({
  workflowKey,
  title,
  description,
  iconName = 'PlayCircle',
  schema = {}
}: ProcessTriggerProps) {
  const [isTriggering, setIsTriggering] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])

  const handleTrigger = async () => {
    setIsTriggering(true)

    try {
      const response = await fetch(`/api/workflows/${workflowKey}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'process',
          payload: formData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger workflow')
      }

      toast.success(`${title} workflow triggered successfully`, {
        description: `Workflow run ID: ${result.workflow_run_id}`,
        action: {
          label: 'View',
          onClick: () => window.open(`/versotech/staff/workflows/${result.workflow_run_id}`, '_blank')
        }
      })

      // Add to recent runs
      const newRun: WorkflowRun = {
        id: result.workflow_run_id,
        status: 'running',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setRecentRuns(prev => [newRun, ...prev.slice(0, 4)])

    } catch (error) {
      toast.error('Failed to trigger workflow', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dynamic form fields based on schema */}
        {Object.entries(schema).map(([key, config]: [string, any]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{config.label || key}</Label>
            <Input
              id={key}
              type={config.type || 'text'}
              placeholder={config.placeholder}
              value={formData[key] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [key]: e.target.value
              }))}
            />
          </div>
        ))}

        <Button
          onClick={handleTrigger}
          disabled={isTriggering}
          className="w-full"
        >
          {isTriggering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Triggering...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Trigger {title}
            </>
          )}
        </Button>

        {/* Recent workflow runs */}
        {recentRuns.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Recent Runs</h4>
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="font-mono">{run.id.slice(0, 8)}...</span>
                  </div>
                  <Badge className={getStatusColor(run.status)}>
                    {run.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Data Model Requirements

**Core Tables:**

```sql
-- Workflow definitions (static config, may be in code instead of DB)
create table workflows (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, -- 'generate-position-statement', 'process-nda'
  name text not null, -- 'Position Statement', 'NDA Agent'
  description text,
  category text check (category in ('documents', 'compliance', 'communications', 'data_processing', 'multi_step')),
  n8n_webhook_url text not null, -- https://n8n.verso.com/webhook/generate-position-statement
  input_schema jsonb not null, -- { investor_id: { label: "...", type: "text", ... } }
  required_role text, -- 'staff_admin', 'staff_ops', null (all staff)
  required_title text[], -- ['bizops', 'compliance_officer']
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workflow execution history
create table workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) not null,
  workflow_key text not null, -- Denormalized for fast queries

  -- Execution context
  triggered_by uuid references profiles(id) not null,
  entity_type text, -- 'investor', 'deal', 'vehicle', 'process'
  entity_id uuid, -- ID of related entity (investor, deal, etc.)

  -- Input/Output
  input_params jsonb not null, -- { investor_id: "uuid-123", as_of_date: "2025-10-01" }
  output_data jsonb, -- { document_id: "uuid-456", nav_value: 1234567 }
  error_message text,

  -- Status tracking
  status text check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')) default 'queued',

  -- n8n integration
  n8n_execution_id text unique, -- n8n's internal execution ID
  webhook_signature text, -- HMAC signature for callback verification
  idempotency_token text unique, -- Prevent duplicate triggers

  -- Timing
  queued_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms int, -- Execution time in milliseconds

  -- Related records
  result_doc_id uuid references documents(id), -- Generated document if applicable
  created_tasks uuid[], -- Array of task IDs created by this workflow

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_workflow_runs_triggered_by on workflow_runs(triggered_by, created_at desc);
create index idx_workflow_runs_status on workflow_runs(status, created_at desc);
create index idx_workflow_runs_workflow_key on workflow_runs(workflow_key, created_at desc);
create index idx_workflow_runs_entity on workflow_runs(entity_type, entity_id);
create index idx_workflow_runs_idempotency on workflow_runs(idempotency_token) where idempotency_token is not null;

-- Workflow run logs (detailed step-by-step execution logs)
create table workflow_run_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid references workflow_runs(id) on delete cascade not null,
  step_name text not null, -- 'fetch_investor_data', 'generate_pdf', 'send_email'
  step_status text check (step_status in ('started', 'completed', 'failed', 'skipped')),
  log_level text check (log_level in ('debug', 'info', 'warn', 'error')) default 'info',
  message text,
  metadata jsonb, -- { record_count: 5, file_size: 12345, ... }
  created_at timestamptz default now()
);

create index idx_workflow_run_logs_run on workflow_run_logs(workflow_run_id, created_at);
```

**Seed Workflows:**

```sql
-- Insert workflow definitions (or manage in code)
insert into workflows (key, name, description, category, n8n_webhook_url, input_schema, required_role) values
('generate-position-statement', 'Position Statement', 'Generate investor position statements with current NAV, distributions, and performance metrics', 'documents', 'https://n8n.verso.com/webhook/generate-position-statement', '{
  "investor_id": {"label": "Investor ID", "type": "text", "required": true},
  "vehicle_id": {"label": "Vehicle ID (Optional)", "type": "text", "required": false},
  "as_of_date": {"label": "As of Date", "type": "date", "required": true}
}', 'staff_ops'),

('process-nda', 'NDA Agent', 'Automated NDA generation, DocuSign processing, and professional investor qualification', 'compliance', 'https://n8n.verso.com/webhook/process-nda', '{
  "investor_email": {"label": "Investor Email", "type": "email", "required": true},
  "investment_type": {"label": "Investment Type", "type": "text", "required": true},
  "nda_template": {"label": "NDA Template", "type": "select", "options": ["standard", "institutional", "high-net-worth"], "required": true}
}', 'staff_rm'),

('capital-call-processing', 'Capital Call Processing', 'Generate capital call notices, wire instructions, and investor notifications', 'documents', 'https://n8n.verso.com/webhook/capital-call-processing', '{
  "vehicle_id": {"label": "Vehicle ID", "type": "text", "required": true},
  "call_percentage": {"label": "Call Percentage", "type": "number", "required": true},
  "due_date": {"label": "Due Date", "type": "date", "required": true},
  "wire_deadline": {"label": "Wire Deadline", "type": "datetime", "required": true}
}', 'staff_admin')

-- ... more workflow definitions
;
```

### API Routes

**Trigger Workflow:**
```typescript
// app/api/workflows/[workflowKey]/trigger/route.ts
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(
  req: Request,
  { params }: { params: { workflowKey: string } }
) {
  const supabase = await createClient()

  // 1. Authenticate and authorize
  const profile = await requireStaffAuth()

  // 2. Parse request body
  const { entity_type, payload } = await req.json()

  // 3. Fetch workflow definition
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('*')
    .eq('key', params.workflowKey)
    .eq('is_active', true)
    .single()

  if (workflowError || !workflow) {
    return NextResponse.json(
      { error: 'Workflow not found or inactive' },
      { status: 404 }
    )
  }

  // 4. Check role permissions
  if (workflow.required_role && profile.role !== workflow.required_role) {
    return NextResponse.json(
      { error: `Requires ${workflow.required_role} role` },
      { status: 403 }
    )
  }

  // 5. Check title permissions
  if (workflow.required_title && !workflow.required_title.includes(profile.title)) {
    return NextResponse.json(
      { error: `Requires one of: ${workflow.required_title.join(', ')}` },
      { status: 403 }
    )
  }

  // 6. Validate input against schema
  const validationErrors = validateInputSchema(payload, workflow.input_schema)
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: 'Validation failed', details: validationErrors },
      { status: 400 }
    )
  }

  // 7. Generate idempotency token
  const idempotencyToken = crypto
    .createHash('sha256')
    .update(`${workflow.id}-${profile.id}-${JSON.stringify(payload)}-${Date.now()}`)
    .digest('hex')

  // 8. Check for duplicate within 5 minutes
  const { data: recentRun } = await supabase
    .from('workflow_runs')
    .select('id')
    .eq('workflow_id', workflow.id)
    .eq('triggered_by', profile.id)
    .eq('input_params', payload)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .single()

  if (recentRun) {
    return NextResponse.json(
      { error: 'Duplicate workflow triggered within 5 minutes', workflow_run_id: recentRun.id },
      { status: 409 }
    )
  }

  // 9. Create workflow_run record
  const { data: workflowRun, error: runError } = await supabase
    .from('workflow_runs')
    .insert({
      workflow_id: workflow.id,
      workflow_key: workflow.key,
      triggered_by: profile.id,
      entity_type,
      input_params: payload,
      status: 'queued',
      idempotency_token: idempotencyToken,
      webhook_signature: generateHMAC(idempotencyToken)
    })
    .select()
    .single()

  if (runError) {
    return NextResponse.json(
      { error: 'Failed to create workflow run', details: runError.message },
      { status: 500 }
    )
  }

  // 10. Trigger n8n webhook
  try {
    const n8nResponse = await fetch(workflow.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-verso-signature': workflowRun.webhook_signature,
        'x-idempotency-key': idempotencyToken,
        'x-workflow-run-id': workflowRun.id
      },
      body: JSON.stringify({
        workflow_run_id: workflowRun.id,
        workflow_key: workflow.key,
        triggered_by: {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name
        },
        payload
      })
    })

    const n8nResult = await n8nResponse.json()

    // 11. Update workflow_run with n8n execution ID
    await supabase
      .from('workflow_runs')
      .update({
        n8n_execution_id: n8nResult.execution_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', workflowRun.id)

    // 12. Log workflow trigger
    await supabase.from('audit_log').insert({
      table_name: 'workflow_runs',
      record_id: workflowRun.id,
      action_type: 'workflow_triggered',
      actor_id: profile.id,
      new_values: { workflow_key: workflow.key, payload }
    })

    return NextResponse.json({
      workflow_run_id: workflowRun.id,
      status: 'running',
      n8n_execution_id: n8nResult.execution_id
    })

  } catch (n8nError) {
    // Mark workflow as failed
    await supabase
      .from('workflow_runs')
      .update({
        status: 'failed',
        error_message: `Failed to trigger n8n: ${n8nError.message}`,
        completed_at: new Date().toISOString()
      })
      .eq('id', workflowRun.id)

    return NextResponse.json(
      { error: 'Failed to trigger n8n workflow', details: n8nError.message },
      { status: 500 }
    )
  }
}

function validateInputSchema(payload: any, schema: any): string[] {
  const errors: string[] = []

  Object.entries(schema).forEach(([key, config]: [string, any]) => {
    if (config.required && !payload[key]) {
      errors.push(`${config.label || key} is required`)
    }

    if (payload[key]) {
      if (config.type === 'email' && !isValidEmail(payload[key])) {
        errors.push(`${config.label || key} must be a valid email`)
      }
      if (config.type === 'number' && isNaN(Number(payload[key]))) {
        errors.push(`${config.label || key} must be a number`)
      }
    }
  })

  return errors
}

function generateHMAC(data: string): string {
  return crypto
    .createHmac('sha256', process.env.N8N_WEBHOOK_SECRET!)
    .update(data)
    .digest('hex')
}
```

**n8n Callback Webhook (Workflow Completion):**

```typescript
// app/api/webhooks/n8n/workflow-complete/route.ts
export async function POST(req: Request) {
  const supabase = createServiceRoleClient()

  // 1. Verify HMAC signature
  const signature = req.headers.get('x-verso-signature')
  const body = await req.text()
  const expectedSignature = generateHMAC(body)

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body)
  const { workflow_run_id, status, output_data, error_message, result_doc_id, created_task_ids } = payload

  // 2. Update workflow_run
  const { data: run } = await supabase
    .from('workflow_runs')
    .update({
      status: status === 'success' ? 'completed' : 'failed',
      output_data,
      error_message,
      result_doc_id,
      created_tasks: created_task_ids,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - new Date(run.started_at).getTime()
    })
    .eq('id', workflow_run_id)
    .select()
    .single()

  // 3. Create activity feed entry
  if (status === 'success' && run.entity_type === 'investor') {
    await supabase.from('activity_feed').insert({
      investor_id: run.entity_id,
      activity_type: 'workflow',
      title: `${run.workflow_key} completed`,
      description: `Workflow executed successfully`,
      importance: 'medium',
      metadata: { workflow_run_id: run.id }
    })
  }

  // 4. Notify triggered user
  if (status === 'failed') {
    await supabase.from('notifications').insert({
      user_id: run.triggered_by,
      title: 'Workflow Failed',
      message: `${run.workflow_key} failed: ${error_message}`,
      type: 'error',
      link: `/versotech/staff/workflows/${workflow_run_id}`
    })
  }

  return NextResponse.json({ success: true })
}
```

**Get Workflow History:**
```
GET /api/workflows/history?workflow_key=&status=&limit=20
Response: {
  runs: [
    {
      id: uuid,
      workflow_key: string,
      triggered_by: { id, display_name },
      status: string,
      input_params: object,
      output_data: object,
      duration_ms: number,
      created_at: timestamp,
      completed_at: timestamp
    }
  ]
}
```

### Security Considerations

**Authentication:**
- All workflow triggers require staff authentication via Supabase Auth
- Role and title-based permissions enforced server-side
- Webhook callbacks use HMAC signatures to prevent spoofing

**Data Protection:**
- Input parameters logged but PII encrypted at rest
- Sensitive outputs (tax docs, KYC) stored in encrypted documents
- Idempotency tokens prevent replay attacks

**Rate Limiting:**
- Maximum 50 workflow executions per user per hour (application-level rate limit)
- Capital call workflows limited to 5 per day (database constraint)
- Failed login attempts to Process Center trigger account lockout

**Audit Trail:**
- Every workflow execution logged in `audit_log`
- Input/output data retained for 7 years per BVI regulations
- Failed workflows trigger alerts to #ops-alerts Slack channel

### Performance Optimizations

**Database Indexes:**
- Already defined in table creation (workflow_runs indexes)
- Composite index on (workflow_key, status, created_at) for dashboard queries

**Caching:**
- Workflow definitions cached in-memory for 1 hour (rarely change)
- Recent runs fetched from client-side state (no database query)

**Async Processing:**
- Workflow triggers return immediately (don't wait for n8n completion)
- n8n executes asynchronously and calls back when complete

---

## Part 3: Success Metrics

**Operational Efficiency:**
- Average time to complete routine tasks (before vs. after automation): Target >70% reduction
- Workflow execution success rate: Target >95%
- Manual intervention rate: Target <10% of workflow runs

**Adoption:**
- % of eligible staff who trigger workflows monthly: Target >80%
- Workflows per staff member per month: Target >20
- Most-used workflows: Position Statement, NDA Agent, Capital Calls

**Quality:**
- Workflow failure rate: Target <5%
- Average retry rate: Target <3%
- Manual correction rate (errors in generated docs): Target <2%

**Business Impact:**
- Investor satisfaction with report turnaround: Target NPS >70
- Cost per workflow execution: Target <$0.50 (vs. $20+ manual cost)
- Time saved per month (hours): Target >100 hours

---

## Document Version History

- v1.0 (October 2, 2025): Initial Process Center PRD with comprehensive workflow documentation and technical implementation roadmap
