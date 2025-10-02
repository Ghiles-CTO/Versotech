# Request Management PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Request Management module is VERSO's operational command center for triaging, assigning, and fulfilling investor service requests. When an investor asks for a custom tax report, performance analysis, contribution history export, or investment committee presentation, their request flows into this unified queue where staff can assess priority, assign to the appropriate specialist, and track progress through to delivery.

This system transforms ad-hoc investor servicing from scattered email threads into a structured workflow with clear SLA commitments, automated routing, and full audit trails. Staff members see a real-time dashboard of open requests, can trigger automated workflows for routine asks (position statements, tax packs), attach deliverables, and close tickets with investor notifications—all from a single interface.

Behind the scenes, Request Management integrates with the Process Center (auto-trigger report generation workflows), Messages (inline investor communication), and Documents (store and deliver fulfillment attachments). The system tracks SLA performance, flags overdue items for escalation, and provides analytics on request volume, turnaround time, and common ask patterns.

---

## Part 1: Business Context (Non-Technical)

### What is Request Management?

The Request Management module is the central ticketing system for investor service requests that require staff fulfillment. It handles requests across multiple service categories:

- **Tax Documents**: K-1s, tax summaries, foreign tax credit statements, year-end packages
- **Performance Reports**: Custom NAV analyses, benchmark comparisons, sector breakdowns
- **Data Exports**: Capital contribution history, distribution schedules, transaction logs (Excel/CSV)
- **Presentations**: Investment committee decks, board materials, portfolio summaries
- **Communications**: Newsletter inclusions, investor update requests, co-investor introductions
- **Document Requests**: Deal memoranda, subscription agreements, offering documents
- **Analysis**: Cashflow projections, allocation scenarios, portfolio sensitivity analysis

Each request includes:
- **Title & Description**: What the investor is asking for
- **Category**: Type of request for routing and SLA assignment
- **Priority**: Urgency level (low, medium, high, urgent)
- **Status**: Current state (open → assigned → in_progress → ready → closed)
- **Investor Context**: Who submitted, which vehicles, investment history
- **Due Date**: SLA-based deadline or custom deadline from investor
- **Assignment**: Assigned staff member and team
- **Deliverables**: Attached documents, workflow outputs, or completion notes
- **Communication Thread**: Inline messages with investor for clarifications

### Why Does It Matter?

**For VERSO Operations Team:**
- **Centralized Workload**: All investor asks in one place, no missed emails or Slack requests
- **Clear Prioritization**: Auto-calculated priorities based on investor tier, request type, and SLA
- **Workflow Automation**: Routine requests (position statements, standard reports) trigger n8n workflows
- **Accountability**: Every request assigned to specific staff member with due date tracking
- **Performance Visibility**: See team workload distribution, overdue items, turnaround time metrics

**For VERSO Leadership:**
- **Service Quality**: Track average response time, SLA compliance, investor satisfaction
- **Resource Planning**: Identify request volume trends, peak periods, staffing needs
- **Operational Efficiency**: Measure automation rate (% of requests auto-fulfilled vs. manual)
- **Investor Intelligence**: Analyze common requests to identify product gaps or documentation needs

**For Investors:**
- **Transparency**: Know exactly when their request was received, assigned, and will be delivered
- **Self-Service Portal**: Submit requests via investor portal without emailing support
- **Predictable Service**: Clear SLA commitments (standard requests within 3 business days)
- **Quality Assurance**: All deliverables reviewed by staff before delivery

### How It Connects to Other Modules

- **Reports Page (Investor Portal)**: Investors submit custom asks via Reports → creates `request_tickets` record
- **Process Center**: Staff can trigger workflows from Request detail page (e.g., "Generate Position Statement" for related request)
- **Messages**: Inline communication thread on each request for staff-investor clarifications
- **Documents**: Fulfillment attachments stored in Documents module with investor access
- **Task Management**: Complex requests auto-create task checklist for staff member
- **Dashboard**: Request counts and SLA performance surface in Staff Dashboard KPIs
- **Inbox Manager Workflow**: Automated email routing creates request tickets for support emails

### Who Uses It?

**Primary Users:**
- **Operations Analysts** (`staff_ops`): Handle routine requests (exports, standard reports)
- **Relationship Managers** (`staff_rm`): Fulfill bespoke requests for assigned investors (presentations, custom analyses)
- **Compliance Officers** (`staff_admin`): Handle tax documents, regulatory filings
- **Data Analysts** (`staff_ops`): Complex data exports, custom performance analyses
- **Business Operations** (`staff_admin`): High-priority investor support, escalations

**Access Levels:**
- All staff can view request queue (filtered to their assignments)
- `staff_ops` can assign and fulfill standard requests
- `staff_rm` can fulfill requests for their assigned investors
- `staff_admin` can reassign, escalate, and access all requests

### Core Use Cases

**1. Standard Tax Document Request (Automated Fulfillment)**

**Scenario:** Acme Fund LP requests "Tax Year 2023 K-1 and foreign tax credit summary for all vehicles"

**Workflow:**
1. Acme's CFO submits request via investor portal → Reports → Custom Ask
2. System creates `request_tickets` record:
   - `category`: tax_doc
   - `priority`: high (tax season)
   - `due_date`: now() + 2 business days
   - `assigned_to`: Compliance Officer (Sarah Chen)
3. Sarah receives notification: "New tax document request from Acme Fund (Due: Jan 18)"
4. Sarah opens Request Management, sees Acme's request at top (sorted by due date)
5. Sarah clicks "View Details" → sees full request description
6. Sarah identifies this as standard tax package (can be automated)
7. Sarah clicks "Trigger Workflow" → selects "Tax Package Generation"
8. n8n workflow executes:
   - Queries Supabase for Acme's 2023 transactions across all vehicles
   - Generates K-1 PDF for each vehicle (VERSO FUND, REAL Empire)
   - Calculates foreign tax credits from international deal distributions
   - Compiles tax summary Excel workbook
   - Stores 3 documents in Documents module (Acme access granted)
9. Workflow completes → updates `request_tickets`:
   - `status`: ready
   - `result_doc_id`: [array of 3 document IDs]
10. Sarah receives notification: "Acme Fund tax package ready for review"
11. Sarah reviews generated documents for accuracy
12. Sarah clicks "Deliver" → confirmation modal
13. System:
    - Updates status to `closed`
    - Creates activity feed entry for Acme: "Your tax documents are ready"
    - Sends email to Acme CFO with download links
    - Logs fulfillment in audit trail
14. Acme CFO receives email, downloads documents from investor portal

**Timeline:** 30 minutes staff time, 5-10 minutes workflow execution (vs. 3+ hours manual)

**2. Custom Performance Analysis (Manual Fulfillment)**

**Scenario:** John Smith requests "Monthly performance analysis comparing my returns to S&P 500 and private equity benchmarks for last 12 months"

**Workflow:**
1. John submits custom ask via portal
2. System creates request ticket:
   - `category`: analysis
   - `priority`: medium
   - `due_date`: now() + 3 business days
   - `assigned_to`: John's RM (Michael Rodriguez)
3. Michael opens request, reads description
4. Michael clicks "Start Work" → status changes to `in_progress`
5. Michael works on analysis:
   - Pulls John's NAV history from `performance_snapshots`
   - Downloads S&P 500 and Cambridge Private Equity Index data
   - Creates Excel workbook with comparison charts
   - Writes 1-page summary memo
6. Michael uploads both files to Request detail page
7. Michael enters completion note: "Analysis shows your portfolio outperformed S&P by 8.2% and matched PE benchmark (17.3% vs. 17.1% TVPI)"
8. Michael clicks "Mark Ready" → status changes to `ready`
9. System creates activity feed entry for John
10. Michael reviews deliverables one more time
11. Michael clicks "Deliver"
12. System closes request and notifies John with document links

**Timeline:** 2-3 hours (within 3-day SLA)

**3. Request Clarification (SLA Pause)**

**Scenario:** Global Investments LLC requests "Contribution history export" but doesn't specify format or date range

**Workflow:**
1. Request submitted → assigned to ops analyst (Emma)
2. Emma sees insufficient detail in request description
3. Emma clicks "Request Info" → modal appears:
   - "What additional information do you need?"
   - Emma enters: "Please specify: (1) Preferred format (Excel vs. CSV), (2) Date range (all-time vs. specific period), (3) Level of detail (summary vs. transaction-level)"
4. System:
   - Updates status to `awaiting_info`
   - Pauses SLA clock
   - Sends message to investor via Messages module
   - Creates notification for investor
5. Investor receives notification, responds via Messages:
   - "Excel format, all-time, transaction-level detail please"
6. System:
   - Updates status back to `assigned`
   - Resumes SLA clock
   - Notifies Emma of investor response
7. Emma proceeds with fulfillment using provided details

**Benefit:** Prevents wasted work, ensures correct deliverable first time

**4. Bulk Assignment (New Staff Member Onboarding)**

**Scenario:** New relationship manager (David) joins team, inherits 15 investors with 5 pending requests

**Workflow:**
1. Admin (Sarah) opens Request Management
2. Filters to: `assigned_to` = "John (departing RM)", `status` != "closed"
3. Selects all 5 requests via checkboxes
4. Clicks "Bulk Reassign" → modal:
   - New assignee: David Park
   - Reason: "RM transition - investor portfolio handoff"
5. System:
   - Updates all 5 requests: `assigned_to` = David, logs reassignment
   - Sends David notification: "You've been assigned 5 requests (view queue)"
   - Sends investors courtesy notification: "Your request is now assigned to David Park"
6. David sees 5 requests in his queue with context from previous RM notes

**Efficiency:** 5 requests reassigned in 30 seconds vs. 5+ minutes individual

**5. SLA Escalation (Overdue Request)**

**Scenario:** Performance report request from Tech Ventures Fund is overdue (SLA: 3 days, actual: 4 days elapsed)

**Workflow:**
1. System monitors SLA deadlines every 15 minutes
2. Detects Tech Ventures request at 2.5 days elapsed (80% of SLA)
3. Sends warning notification to assigned RM (Michael):
   - Email: "Request SLA Warning: Tech Ventures performance report due in 12 hours"
4. Michael doesn't action (vacation, other priorities)
5. SLA breaches at 3 days → system:
   - Marks request as "overdue" (red badge in queue)
   - Escalates to Michael's manager (Operations Lead - Sarah)
   - Creates high-priority task: "Review overdue request: Tech Ventures performance report"
   - Sends proactive investor notification: "We're working on your request and will deliver within 24 hours. We apologize for the delay."
6. Sarah reviews, reassigns to available analyst (Emma)
7. Emma completes and delivers within 24 hours
8. SLA breach logged in compliance report for process improvement review

**Outcome:** Prevents investor frustration, ensures escalation path for overdue items

### Key Features (Business Language)

**Request Queue Management:**
- Unified table of all requests with real-time status
- Filter by: status, category, priority, assigned staff, investor, date range
- Sort by: due date, priority, creation date, investor name
- Color-coded priority badges (urgent=red, high=orange, medium=blue, low=green)
- Overdue indicator (red badge with "X days overdue")
- Quick search by request ID, investor name, title keywords

**Request Detail View:**
- Full request description from investor
- Request metadata (ID, submitted date, category, priority, due date)
- Investor context (name, investment history, current portfolio value, assigned RM)
- Related vehicles (which funds/SPVs are relevant)
- Status history timeline (created → assigned → in progress → ready → closed)
- Attached documents (investor-provided context files)
- Fulfillment deliverables (staff-attached results)
- Communication thread (Messages integration for investor clarifications)
- Linked workflow runs (if automated fulfillment triggered)
- Staff notes (internal-only notes not visible to investor)

**Request Actions:**
- **Assign**: Route to specific staff member with assignment note
- **Start Work**: Change status to in_progress, optionally create task checklist
- **Request Info**: Send clarification questions to investor, pause SLA
- **Trigger Workflow**: Launch n8n process for automated fulfillment
- **Attach Deliverable**: Upload result documents (PDF, Excel, PowerPoint)
- **Mark Ready**: Signal fulfillment complete, pending final review
- **Deliver**: Close request, send investor notification with deliverable links
- **Cancel**: Close without fulfillment (duplicate, withdrawn, etc.)
- **Reassign**: Route to different staff member
- **Escalate**: Flag for senior review without changing assignment

**SLA Management:**
- Auto-calculated due dates based on category and priority:
  - Tax documents (high priority): 2 business days
  - Performance reports: 3 business days
  - Data exports: 3 business days
  - Presentations: 5 business days
  - Communications: 5 business days
  - Custom analysis: 5 business days
- SLA warning at 80% elapsed (e.g., 2.4 days into 3-day SLA)
- SLA pause for "awaiting_info" status (clock stops until investor responds)
- Overdue flagging and auto-escalation
- SLA performance dashboard (on-time %, average turnaround, overdue count)

**Workflow Integration:**
- "Trigger Workflow" button on request detail page
- Auto-suggest workflows based on request category (e.g., "Tax Documents" → "Tax Package Generation")
- Workflow execution status displayed inline (queued, running, completed, failed)
- Auto-attach workflow outputs to request as deliverables
- Workflow completion auto-updates request status to `ready`

**Communication:**
- Inline Messages thread on request detail page
- Staff can send messages to investor for clarifications
- Investor responses appear in request timeline
- Email notifications for new messages (both staff and investor)
- Internal notes field (staff-only, not visible to investor)

**Bulk Operations:**
- Multi-select requests via checkboxes
- Bulk assign (route multiple requests to same staff member)
- Bulk reassign (portfolio handoff, team restructuring)
- Bulk prioritize (upgrade multiple requests to high priority)
- Bulk close (mark multiple resolved requests as closed)

**Analytics & Reporting:**
- Request volume trends (by category, by time period)
- Turnaround time analysis (average, median, by category)
- SLA compliance rate (% completed within SLA)
- Staff workload distribution (requests per staff member)
- Common request patterns (identify recurring asks for automation)
- Investor request frequency (identify high-touch investors)

### Business Rules

**Request Creation:**
- Auto-created when investor submits custom ask via Reports page
- Can be manually created by staff for phone/email requests
- Duplicate prevention: Same investor + similar title within 24 hours prompts warning

**Priority Assignment:**
- **Urgent**: Regulatory deadline, board meeting prep <48h, investor escalation (SLA: 1 business day)
- **High**: Tax documents, large investor requests (>$5M portfolio), compliance items (SLA: 2 business days)
- **Medium**: Standard reports, data exports, routine analyses (SLA: 3 business days)
- **Low**: Nice-to-have requests, non-urgent communications (SLA: 5 business days)

**Routing Logic:**
- Tax documents → Compliance Officer
- Performance reports → Assigned RM or data analyst
- Presentations → Assigned RM
- Data exports → Operations analyst
- Unassigned requests → Round-robin to available ops staff

**SLA Rules:**
- Clock starts when request created
- Clock pauses when status = `awaiting_info`
- Clock resumes when investor provides requested info
- Business days only (weekends/holidays excluded)
- SLA breach logged but doesn't block fulfillment
- Overdue requests escalate to team lead at SLA + 1 business day

**Workflow Automation Eligibility:**
- Position statements, tax packages, standard exports: Auto-suggest workflow
- Custom analyses, presentations, bespoke requests: Manual fulfillment only
- Staff can override automation suggestion (e.g., complex edge case requires manual work)

**Fulfillment Requirements:**
- Must attach deliverable document OR enter completion note before marking `ready`
- Deliverables must be reviewed by assigned staff before delivery
- Delivery triggers investor notification via email + portal notification
- Closed requests cannot be reopened (create new request instead)

**Communication:**
- Investor messages visible to all staff (not private)
- Staff internal notes not visible to investor
- All communication logged in audit trail
- Profanity filter on investor messages (flag for manual review)

### Visual Design Standards

**Layout:**
- Header: "Request Management" title, filter/search bar, stats summary
- Stats row: 5 KPI cards (Total, Open, In Progress, Ready, Overdue)
- Request cards: Expandable cards with title, badges, metadata, actions
- Sidebar: Quick filters (My Requests, Overdue, High Priority), Analytics link

**Request Card Design:**
- Status icon (clock=open, user=assigned, play=in_progress, checkmark=ready, gray checkmark=closed)
- Title (bold, truncated at 60 chars with "...")
- Request ID badge (e.g., "REQ-001")
- 3 badges: Status, Priority, Category
- Description (2-line preview, expandable to full)
- Metadata grid: Investor, Submitted date, Assigned staff, Due date
- Related vehicles badges
- Action buttons row (context-sensitive based on status)

**Color Coding:**
- **Priority**:
  - Urgent: Red (`bg-red-100 text-red-800`)
  - High: Orange (`bg-orange-100 text-orange-800`)
  - Medium: Blue (`bg-blue-100 text-blue-800`)
  - Low: Green (`bg-green-100 text-green-800`)
- **Status**:
  - Open: Yellow (`bg-yellow-100 text-yellow-800`)
  - Assigned/In Progress: Blue (`bg-blue-100 text-blue-800`)
  - Ready: Green (`bg-green-100 text-green-800`)
  - Closed: Gray (`bg-gray-100 text-gray-800`)
- **Due Date**:
  - >2 days remaining: Gray (normal)
  - 1-2 days remaining: Yellow (approaching)
  - <1 day remaining: Orange (urgent)
  - Overdue: Red (bold, pulsing)

**Icons:**
- Request status: `Clock` (open), `User` (assigned), `Play` (in progress), `CheckCircle` (ready/closed)
- Overdue: `AlertTriangle` (red, pulsing)
- Linked workflow: `Play` (blue)
- Result document: `FileText` (green)

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/requests/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `AppLayout` + staff role check
**Data Flow**: Server-side fetch from Supabase with client-side realtime updates

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, search, filters)
       ├─ Stats Cards (Total, Open, In Progress, Ready, Overdue)
       ├─ Search & Filters Card
       ├─ Request Cards Grid
       │    └─ RequestCard (Client Component) × N
       │         ├─ Request header (status icon, title, badges)
       │         ├─ Description
       │         ├─ Metadata grid
       │         ├─ Related vehicles
       │         ├─ Status indicators (workflow, document)
       │         └─ Action buttons
       └─ Quick Actions Card
```

### Current Implementation

**Server Component (page.tsx):**
```typescript
const mockRequests = [
  {
    id: 'REQ-001',
    title: 'Tax Year 2023 Detailed Breakdown',
    description: 'Need comprehensive tax documentation...',
    category: 'Tax Documents',
    priority: 'high',
    status: 'open',
    investorName: 'Acme Fund LP',
    submittedAt: '2024-01-15T14:30:00Z',
    dueDate: '2024-01-20T23:59:59Z',
    assignedTo: 'Sarah Chen',
    relatedVehicles: ['VERSO FUND', 'REAL Empire']
  },
  // ... more mock requests
]

export default function RequestsPage() {
  const stats = {
    total: mockRequests.length,
    open: mockRequests.filter(r => r.status === 'open').length,
    inProgress: mockRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
    ready: mockRequests.filter(r => r.status === 'ready').length,
    overdue: mockRequests.filter(r => r.dueDate && new Date(r.dueDate) < new Date()).length
  }

  return (
    <AppLayout brand="versotech">
      {/* Stats Cards */}
      {/* Request Cards */}
    </AppLayout>
  )
}
```

### Data Model Requirements

**Core Tables:**

```sql
-- Request tickets (defined in Reports_Page_PRD.md, reproduced here for completeness)
create table request_tickets (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  created_by uuid references profiles(id), -- Investor user who submitted
  category text check (category in ('analysis', 'tax_doc', 'cashflow', 'valuation', 'data_export', 'presentation', 'communication', 'other')),
  subject text not null,
  details text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('open', 'assigned', 'in_progress', 'awaiting_info', 'ready', 'closed', 'cancelled')) default 'open',

  -- Assignment
  assigned_to uuid references profiles(id),
  assigned_at timestamptz,

  -- Workflow integration
  linked_workflow_run uuid references workflow_runs(id),

  -- Fulfillment
  result_doc_id uuid references documents(id),
  result_doc_ids uuid[], -- Multiple documents
  completion_note text,

  -- Related entities
  deal_id uuid references deals(id),
  vehicle_id uuid references vehicles(id),

  -- SLA tracking
  due_date date,
  sla_paused_at timestamptz,
  sla_resumed_at timestamptz,
  actual_fulfillment_time_hours numeric,

  -- Timestamps
  closed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_request_tickets_status on request_tickets(status, priority, due_date);
create index idx_request_tickets_assigned on request_tickets(assigned_to, status);
create index idx_request_tickets_investor on request_tickets(investor_id, created_at desc);
create index idx_request_tickets_category on request_tickets(category, status);
create index idx_request_tickets_due on request_tickets(due_date) where status not in ('closed', 'cancelled');

-- Request messages (for staff-investor communication)
create table request_messages (
  id uuid primary key default gen_random_uuid(),
  request_ticket_id uuid references request_tickets(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  message_text text not null,
  is_internal_note boolean default false, -- If true, only visible to staff
  created_at timestamptz default now()
);

create index idx_request_messages_ticket on request_messages(request_ticket_id, created_at);
```

**Triggers & Automation:**

```sql
-- Auto-set due date based on category and priority
create or replace function set_request_due_date()
returns trigger
language plpgsql
as $$
declare
  v_sla_days int;
begin
  -- Calculate SLA days
  if new.priority = 'urgent' then
    v_sla_days := 1;
  elsif new.category = 'tax_doc' then
    v_sla_days := 2;
  elsif new.priority = 'high' then
    v_sla_days := 2;
  elsif new.category in ('analysis', 'data_export') then
    v_sla_days := 3;
  elsif new.category in ('presentation', 'communication') then
    v_sla_days := 5;
  else
    v_sla_days := 3; -- Default
  end if;

  -- Set due date (business days)
  new.due_date := (current_date + (v_sla_days || ' days')::interval)::date;

  return new;
end;
$$;

create trigger request_tickets_set_due_date before insert on request_tickets
for each row execute function set_request_due_date();

-- Auto-assign request based on category
create or replace function auto_assign_request()
returns trigger
language plpgsql
as $$
declare
  v_assigned_to uuid;
begin
  if new.assigned_to is not null then
    return new; -- Already assigned
  end if;

  -- Route based on category
  if new.category = 'tax_doc' then
    -- Assign to compliance officer
    select id into v_assigned_to
    from profiles
    where title = 'compliance_officer' and role = 'staff_admin'
    order by random()
    limit 1;
  elsif new.category in ('analysis', 'presentation') and new.investor_id is not null then
    -- Assign to investor's RM
    select primary_rm into v_assigned_to
    from investors
    where id = new.investor_id;
  elsif new.category in ('data_export', 'communication') then
    -- Round-robin to ops staff
    select id into v_assigned_to
    from profiles
    where role = 'staff_ops'
    order by random()
    limit 1;
  end if;

  new.assigned_to := v_assigned_to;
  new.assigned_at := case when v_assigned_to is not null then now() else null end;

  return new;
end;
$$;

create trigger request_tickets_auto_assign before insert on request_tickets
for each row execute function auto_assign_request();

-- Calculate actual fulfillment time on close
create or replace function calculate_request_fulfillment_time()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status and new.status in ('closed', 'cancelled') then
    new.closed_at := now();

    -- Calculate hours excluding SLA pause time
    declare
      v_pause_duration interval := '0 hours';
    begin
      if new.sla_paused_at is not null and new.sla_resumed_at is not null then
        v_pause_duration := new.sla_resumed_at - new.sla_paused_at;
      end if;

      new.actual_fulfillment_time_hours := extract(epoch from ((now() - new.created_at) - v_pause_duration)) / 3600;
    end;
  end if;

  return new;
end;
$$;

create trigger request_tickets_calc_time before update on request_tickets
for each row execute function calculate_request_fulfillment_time();

-- Notify assigned staff
create or replace function notify_assigned_staff_request()
returns trigger
language plpgsql
as $$
begin
  if new.assigned_to is not null and (old.assigned_to is null or old.assigned_to is distinct from new.assigned_to) then
    insert into notifications (
      user_id,
      title,
      message,
      type,
      link
    ) values (
      new.assigned_to,
      'New Request Assigned',
      format('New %s request: %s (Due: %s)',
        new.category,
        new.subject,
        to_char(new.due_date, 'Mon DD')
      ),
      'info',
      '/versotech/staff/requests/' || new.id
    );
  end if;

  return new;
end;
$$;

create trigger request_tickets_notify_assigned after insert or update of assigned_to on request_tickets
for each row execute function notify_assigned_staff_request();
```

**Database Functions:**

```sql
-- Get request statistics
create or replace function get_request_stats(p_staff_id uuid default null)
returns table (
  total_requests int,
  open_count int,
  in_progress_count int,
  ready_count int,
  overdue_count int,
  avg_fulfillment_time_hours numeric,
  sla_compliance_rate numeric
)
language plpgsql
as $$
begin
  return query
  with request_data as (
    select
      status,
      due_date,
      actual_fulfillment_time_hours,
      created_at,
      closed_at
    from request_tickets
    where (p_staff_id is null or assigned_to = p_staff_id)
      and created_at >= current_date - interval '30 days'
  )
  select
    count(*)::int as total_requests,
    count(*) filter (where status = 'open')::int as open_count,
    count(*) filter (where status in ('assigned', 'in_progress'))::int as in_progress_count,
    count(*) filter (where status = 'ready')::int as ready_count,
    count(*) filter (where status not in ('closed', 'cancelled') and due_date < current_date)::int as overdue_count,
    avg(actual_fulfillment_time_hours) filter (where status = 'closed')::numeric(10,2) as avg_fulfillment_time_hours,
    (count(*) filter (where status = 'closed' and closed_at::date <= due_date)::numeric /
      nullif(count(*) filter (where status = 'closed'), 0) * 100)::numeric(5,2) as sla_compliance_rate
  from request_data;
end;
$$;
```

### API Routes

**Get Requests List:**
```typescript
// app/api/staff/requests/route.ts
export async function GET(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const assignedTo = searchParams.get('assigned_to')

  let query = supabase
    .from('request_tickets')
    .select(`
      *,
      investors (id, legal_name),
      created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name),
      assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name),
      linked_workflow:workflow_runs (id, status)
    `)
    .order('due_date', { ascending: true })

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (assignedTo === 'me') query = query.eq('assigned_to', profile.id)

  const { data: requests, error } = await query

  // Get stats
  const { data: stats } = await supabase
    .rpc('get_request_stats', { p_staff_id: profile.id })
    .single()

  return NextResponse.json({
    requests,
    stats,
    hasData: true
  })
}
```

**Update Request Status:**
```typescript
// app/api/staff/requests/[id]/status/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { status, completion_note, result_doc_ids } = await req.json()

  // Update request
  const { data: request, error } = await supabase
    .from('request_tickets')
    .update({
      status,
      completion_note,
      result_doc_ids
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If delivered, notify investor
  if (status === 'closed') {
    await supabase.from('notifications').insert({
      user_id: request.created_by,
      title: 'Request Fulfilled',
      message: `Your request "${request.subject}" has been completed and is ready to view.`,
      type: 'success',
      link: '/versoholdings/reports'
    })
  }

  return NextResponse.json({ request })
}
```

### RLS Policies

```sql
alter table request_tickets enable row level security;
alter table request_messages enable row level security;

-- Staff can view all requests
create policy request_tickets_staff_read on request_tickets for select
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role like 'staff_%')
);

-- Staff can update assigned requests
create policy request_tickets_staff_update on request_tickets for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
      and (request_tickets.assigned_to = auth.uid() or profiles.role = 'staff_admin')
  )
);

-- Investors can view their own requests
create policy request_tickets_investor_read on request_tickets for select
using (created_by = auth.uid());
```

---

## Part 3: Success Metrics

**SLA Performance:**
- SLA compliance rate: Target >85%
- Average fulfillment time: Target <48 hours
- Overdue request count: Target <10% of active requests

**Operational Efficiency:**
- Automation rate: Target >30% of requests fulfilled via workflows
- Staff workload balance: Max 15 active requests per staff member
- Reassignment rate: Target <15% (indicates good initial routing)

**Quality:**
- Clarification request rate: Target <20% (clear initial requests)
- Rework rate: Target <5% (deliverables correct first time)
- Investor satisfaction: Target NPS >70

---

## Document Version History

- v1.0 (October 2, 2025): Initial Request Management PRD with comprehensive business context and technical implementation roadmap
