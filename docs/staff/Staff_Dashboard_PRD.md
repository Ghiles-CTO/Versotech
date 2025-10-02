# Staff Dashboard PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Staff Dashboard is the command center for VERSO operations team, providing real-time visibility into operational KPIs, workflow execution status, and quick access to critical functions. It consolidates onboarding pipeline metrics, compliance indicators, and process automation controls into a single, actionable interface.

Staff members see at-a-glance the health of investor operations—from pending KYC reviews to active workflow runs—and can immediately launch n8n processes or navigate to specific management areas. The dashboard emphasizes operational efficiency, regulatory compliance (BVI FSC, GDPR), and automation-first workflows.

---

## Part 1: Business Context (Non-Technical)

### What is the Staff Dashboard?

The Staff Dashboard is the landing page for VERSO operations personnel after login. It provides:
- **Operational KPIs**: Active LPs, pending KYC/AML reviews, workflow execution counts, compliance rates
- **Process Center**: Quick-launch buttons for 6 core n8n automation workflows
- **Operations Pipeline**: Visual status of key operational stages (KYC, NDAs, subscriptions, capital calls)
- **Recent Activity**: Real-time feed of workflow executions and system events
- **Navigation Hub**: Direct links to Deal Management, Request Management, Compliance, LP Management

### Why Does It Matter?

**For VERSO Operations Team:**
- **Situational Awareness**: Immediately see what needs attention (pending reviews, overdue tasks)
- **Workflow Efficiency**: Launch automated processes without leaving the dashboard
- **Compliance Monitoring**: Track BVI/GDPR compliance rates in real-time
- **Performance Tracking**: Monitor workflow execution success rates and operational throughput

**For VERSO Leadership:**
- **Operational Health**: Quick assessment of team workload and bottlenecks
- **Automation ROI**: Visibility into workflow usage and automation adoption
- **Risk Management**: Early warning on compliance issues or processing delays

### How It Connects to Other Modules

- **Process Center**: Launches n8n workflows that update investor data, generate documents, and trigger notifications
- **Deal Management**: Shows count of active deals and provides navigation
- **Investor Management**: Displays pending KYC count and links to LP management
- **Request Management**: Shows active request count for triage
- **Audit & Compliance**: Displays compliance rate and links to audit logs

### Who Uses It?

**Primary Users:**
- **Operations Staff** (`staff_ops`): Day-to-day processing, workflow execution, investor communications
- **Relationship Managers** (`staff_rm`): Portfolio oversight, investor requests, deal coordination
- **Administrators** (`staff_admin`): System configuration, compliance review, full access

**Access Levels:**
- All staff roles can view dashboard metrics
- Workflow execution permissions may be title-gated (e.g., only `bizops` can run capital calls)
- Administrative functions require `staff_admin` role

### Core Use Cases

**1. Morning Operations Check-In**
An operations analyst logs in at 9am, sees 8 pending KYC reviews flagged (3 high priority), immediately navigates to Investor Management to begin processing queue.

**2. Workflow Automation**
A relationship manager needs to generate a position statement for an LP. They click "Positions Statement" in the Process Center, enter investor ID and as-of date, trigger the n8n workflow, and receive the PDF within 30 seconds.

**3. Compliance Monitoring**
A compliance officer checks the dashboard daily to ensure the compliance rate stays above 99%. They notice it dropped to 99.5% due to a pending AML review, escalate to operations for immediate processing.

**4. Pipeline Management**
The operations lead reviews the pipeline section, sees 12 subscriptions awaiting review, and assigns team members to clear the backlog before the month-end close.

**5. Activity Tracking**
A team member checks the Recent Operations feed to confirm a workflow executed successfully for a specific investor, sees the green indicator showing "Position Statement Generated" 12 minutes ago.

### Key Features (Business Language)

**Operational KPIs (4 Cards):**
- **Active LPs**: Total count of active limited partners with month-over-month growth
- **Pending KYC/AML**: Count of investors awaiting compliance review with high-priority breakdown
- **Workflow Runs**: Monthly execution count across all n8n workflows
- **Compliance Rate**: Percentage compliance with BVI/GDPR standards (target: >99%)

**Process Center (6 Quick-Launch Workflows):**
- **Positions Statement**: Generate investor NAV reports
- **NDA Agent**: Automated NDA processing with DocuSign
- **Shared-Drive Notification**: Document sync and stakeholder alerts
- **Inbox Manager**: Email routing and request classification
- **LinkedIn Leads Scraper**: Prospect identification and qualification
- **Reporting Agent**: Fund performance reports and compliance filings

**Operations Pipeline (4 Stages):**
- **KYC Processing**: Professional investor verification (count: 8 pending)
- **NDA Execution**: DocuSign/Dropbox Sign processing (count: 5 in progress)
- **Subscription Processing**: VERSO FUND & REAL Empire subscriptions (count: 12 review)
- **Capital Calls**: Upcoming notifications and wire deadlines (next: Feb 15)

**Recent Operations Feed:**
- Real-time stream of workflow executions
- Color-coded status indicators (green: success, blue: processing, amber: review needed)
- Workflow name, investor reference, completion status, timestamp

**Management Actions (4 Cards):**
- **Deal Management**: Active deals count, navigation to deal pipeline
- **Request Management**: Active LP requests, navigation to triage queue
- **Compliance & Audit**: Regulatory compliance status, audit trail access
- **LP Management**: Total active LPs, navigation to investor database

### Business Rules

**Access Control:**
- Must have staff role (`staff_admin`, `staff_ops`, `staff_rm`) to view dashboard
- Non-staff users redirected to appropriate portal (investor portal or login)
- Workflow execution permissions checked against `profiles.title` field

**Real-Time Updates:**
- KPI metrics refresh on page load (server-side)
- Activity feed updates via Supabase Realtime when new workflows complete
- Pipeline counts update when tasks change status

**Workflow Triggers:**
- Each Process Center button routes to `/versotech/staff/processes`
- Process Center page provides schema-driven forms for workflow parameters
- Workflows execute via n8n webhooks with HMAC authentication

**Navigation:**
- All "Management Action" cards link to corresponding portal sections
- Dashboard serves as central hub; users return after completing tasks
- Breadcrumb navigation shows current location relative to dashboard

### Visual Design Standards

**Layout:**
- Header: VERSO Operations title, badges (BVI FSC, GDPR, n8n Active), current date
- KPI row: 4 equal-width cards with large numbers and trend indicators
- 3-column grid: Process Center (1 col), Operations Pipeline (2 cols)
- Recent Operations: Full-width card with activity timeline
- Management Actions: 4-column grid at bottom

**Color Coding:**
- **Green**: Success states, positive trends, completed workflows
- **Blue**: Information, active processing, neutral states
- **Amber**: Warning, pending review, moderate priority
- **Red**: Critical issues, overdue items (not currently shown but reserved)
- **Purple**: Capital calls, scheduled events

**Icons:**
- Each KPI card has a semantic icon (Users, AlertTriangle, Workflow, CheckCircle)
- Process Center uses workflow-specific icons (BarChart3, FileText, Database, etc.)
- Pipeline stages use stage-specific icons (PlayCircle, FileText, Building2, Clock)

---

## Part 2: Technical Implementation (Current State)

### Architecture Overview

**Page Route**: `/versotech/staff/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `AppLayout` + staff role check
**Data Flow**: Static mock data (no server-side fetch yet)

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ VERSO Operations Header (title, badges, date)
       ├─ Operational KPIs (4 Cards)
       ├─ Process Center & Pipeline (Grid)
       │    ├─ Process Center Card (6 workflow buttons)
       │    └─ Operations Pipeline Card (4 status rows)
       ├─ Recent Operations Card (activity feed)
       └─ Management Actions Grid (4 Cards)
```

### Current Implementation (page.tsx)

**Static Dashboard (No Database Queries):**
```typescript
export default async function StaffDashboard() {
  // Currently no auth check or data fetching
  // All metrics are hardcoded

  return (
    <AppLayout brand="versotech">
      {/* Hardcoded KPIs */}
      <Card>
        <CardContent>
          <div className="text-2xl font-bold">127</div> {/* Active LPs */}
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+4</span> this month
          </p>
        </CardContent>
      </Card>

      {/* Similar pattern for other KPIs... */}
    </AppLayout>
  )
}
```

### Required Enhancements (Implementation Roadmap)

**1. Authentication & Authorization:**
```typescript
export default async function StaffDashboard() {
  const supabase = await createClient()

  // 1. Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/versotech/login')
  }

  // 2. Verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, title, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  // Continue with dashboard rendering...
}
```

**2. Real KPI Data Fetching:**
```typescript
// Fetch active LPs count
const { count: activeLPsCount } = await supabase
  .from('investors')
  .select('*', { count: 'only', head: true })

// Fetch pending KYC count
const { count: pendingKYCCount } = await supabase
  .from('investors')
  .select('*', { count: 'only', head: true })
  .in('kyc_status', ['pending', 'review'])

// Fetch workflow runs count (this month)
const startOfMonth = new Date()
startOfMonth.setDate(1)
startOfMonth.setHours(0, 0, 0, 0)

const { count: workflowRunsCount } = await supabase
  .from('workflow_runs')
  .select('*', { count: 'only', head: true })
  .gte('created_at', startOfMonth.toISOString())

// Calculate compliance rate from audit_log or compliance_checks table
const { data: complianceMetrics } = await supabase
  .rpc('get_compliance_rate')

const kpis = {
  activeLPs: activeLPsCount || 0,
  pendingKYC: pendingKYCCount || 0,
  workflowRuns: workflowRunsCount || 0,
  complianceRate: complianceMetrics?.rate || 0
}
```

**3. Operations Pipeline Data:**
```typescript
// Get pipeline counts from tasks or dedicated pipeline table
const { data: pipelineMetrics } = await supabase
  .from('tasks')
  .select('kind, status')

const pipeline = {
  kycProcessing: pipelineMetrics?.filter(t =>
    t.kind.startsWith('kyc_') && t.status === 'pending'
  ).length || 0,

  ndaExecution: pipelineMetrics?.filter(t =>
    t.kind === 'compliance_nda' && t.status === 'in_progress'
  ).length || 0,

  subscriptionProcessing: pipelineMetrics?.filter(t =>
    t.kind === 'compliance_subscription_agreement' && t.status === 'pending'
  ).length || 0,

  upcomingCapitalCall: null // Fetch from capital_calls table
}
```

**4. Recent Activity Feed:**
```typescript
// Fetch recent workflow_runs with related data
const { data: recentActivity } = await supabase
  .from('workflow_runs')
  .select(`
    *,
    workflows (name, key),
    investors (legal_name)
  `)
  .order('created_at', { ascending: false })
  .limit(4)

// Transform to activity feed format
const activityFeed = recentActivity?.map(run => ({
  id: run.id,
  type: run.workflows.name,
  description: `${run.workflows.name} - ${run.investors?.legal_name || 'System'}`,
  status: run.status, // 'success', 'running', 'failed'
  timestamp: run.created_at
}))
```

### Data Model Requirements

**Tables Needed:**
```sql
-- Already exists from main PRD
profiles (id, role, title, display_name)
investors (id, legal_name, kyc_status, status)
workflow_runs (id, workflow_id, status, created_at, completed_at)
tasks (id, kind, status, owner_user_id)

-- May need to add:
operational_metrics (
  id uuid primary key,
  metric_date date not null,
  active_lps_count int,
  pending_kyc_count int,
  workflow_runs_count int,
  compliance_rate numeric(5,2),
  created_at timestamptz default now()
)

create index idx_operational_metrics_date on operational_metrics(metric_date desc);
```

**RPC Functions:**
```sql
-- Calculate compliance rate
create or replace function get_compliance_rate()
returns table (rate numeric)
language plpgsql
as $$
begin
  return query
  select
    case
      when count(*) = 0 then 100.0
      else (count(*) filter (where compliant = true)::numeric / count(*)) * 100
    end as rate
  from compliance_checks
  where check_date >= current_date - interval '30 days';
end;
$$;

-- Get monthly workflow stats
create or replace function get_monthly_workflow_stats()
returns table (
  workflow_count int,
  success_count int,
  success_rate numeric
)
language plpgsql
as $$
begin
  return query
  select
    count(*)::int as workflow_count,
    count(*) filter (where status = 'completed')::int as success_count,
    case
      when count(*) = 0 then 0
      else (count(*) filter (where status = 'completed')::numeric / count(*)) * 100
    end as success_rate
  from workflow_runs
  where created_at >= date_trunc('month', current_date);
end;
$$;
```

### API Routes (Future Enhancement)

**Dashboard Metrics:**
```
GET /api/staff/dashboard/metrics
Response: {
  kpis: {
    activeLPs: number,
    pendingKYC: number,
    workflowRuns: number,
    complianceRate: number
  },
  pipeline: {
    kycProcessing: number,
    ndaExecution: number,
    subscriptionProcessing: number,
    upcomingCapitalCall: string | null
  },
  trends: {
    lpsGrowth: number,
    highPriorityKYC: number
  }
}
```

**Recent Activity:**
```
GET /api/staff/dashboard/activity?limit=10
Response: {
  activities: [
    {
      id: string,
      type: string,
      description: string,
      status: 'success' | 'running' | 'failed',
      timestamp: string
    }
  ]
}
```

### Realtime Updates (Future)

```typescript
'use client'

export function DashboardClient({ initialMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to workflow_runs for activity feed
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workflow_runs'
      }, (payload) => {
        // Add new activity to feed
        setMetrics(prev => ({
          ...prev,
          activityFeed: [payload.new, ...prev.activityFeed.slice(0, 9)]
        }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return <DashboardView metrics={metrics} />
}
```

### Performance Optimizations

**Caching Strategy:**
- Cache operational metrics for 5 minutes (refresh on page reload)
- Activity feed fetches only last 10 records
- Pipeline counts calculated via indexed queries

**Database Indexes:**
```sql
-- Already suggested above
create index idx_investors_kyc_status on investors(kyc_status) where kyc_status in ('pending', 'review');
create index idx_workflow_runs_created on workflow_runs(created_at desc);
create index idx_tasks_kind_status on tasks(kind, status);
```

### Security Considerations

**Authentication:**
- Server-side auth check before any data fetch
- Staff role verification using `profiles.role like 'staff_%'`
- Title-based permissions for sensitive workflows

**RLS Policies:**
- Staff can read all investors, tasks, workflow_runs
- No RLS needed for dashboard metrics (staff-only page)
- Sensitive fields (PII) not displayed on dashboard

---

## Part 3: Success Metrics

**Dashboard Usage:**
- % of staff who view dashboard daily (target: >90%)
- Average time to first action after login (target: <30 seconds)
- Navigation patterns (which cards clicked most)

**Operational Efficiency:**
- Reduction in time to identify pending tasks (baseline vs. dashboard)
- Workflow execution rate (launches from dashboard vs. total)
- Mean time to resolution for pending KYC reviews

**Automation Adoption:**
- % of workflows executed via dashboard vs. manual processes
- Workflow success rate (target: >95%)
- Average workflow execution time

---

## Document Version History
- v1.0 (October 2, 2025): Initial Staff Dashboard PRD with implementation roadmap
