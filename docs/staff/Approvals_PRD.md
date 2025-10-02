# Approvals PRD - VersoTech Staff Portal

**Version:** 1.0
**Product:** VERSO VersoTech Staff Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Approvals module is VERSO's centralized queue for reviewing and approving investor-initiated requests that require staff oversight before execution. When an investor submits a commitment to a deal, reserves shares, requests a large withdrawal, or updates sensitive profile information, an approval record is created and routed to the appropriate staff member for review.

This system ensures dual-control for high-risk operations, maintains regulatory compliance (BVI FSC requirements for transaction oversight), and provides a full audit trail of who approved what and when. Instead of approval requests scattered across email threads and Slack messages, all pending items surface in a single interface with clear SLA tracking, priority flags, and bulk action capabilities.

Behind the scenes, approval workflows integrate with Task Management (auto-create tasks on rejection), Messages (notify investors of approval status), and Audit Log (record all approval decisions with justifications). The system supports automated escalation (overdue approvals route to senior staff), intelligent routing (commitments >$1M go to compliance officers), and performance analytics (track approval velocity and SLA compliance).

---

## Part 1: Business Context (Non-Technical)

### What is the Approvals Module?

The Approvals module is the central workflow management system for staff oversight of investor-initiated actions. It handles approval requests across multiple operational areas:

- **Investor Commitments**: Review and approve deal participation requests from investors
- **Share Reservations**: Approve inventory holds before allocation finalization
- **Large Withdrawals**: Verify withdrawal requests exceeding $100K
- **KYC Changes**: Approve updates to sensitive investor information (address, beneficiaries)
- **Fee Overrides**: Approve custom fee arrangements negotiated by RMs
- **Document Access**: Approve requests for sensitive deal documents
- **Portal Permissions**: Approve elevated access levels (view-only → transact)

Each approval request includes:
- **Context**: What is being requested and by whom
- **Priority**: Urgency level (low, medium, high, critical)
- **SLA Deadline**: Time remaining before breach
- **Routing**: Assigned staff member or team
- **History**: Previous approval decisions for same entity
- **Supporting Data**: Related records, documents, and justifications

### Why Does It Matter?

**For VERSO Operations Team:**
- **Risk Mitigation**: Catch errors before they become costly (e.g., overselling inventory, violating investor limits)
- **Fraud Prevention**: Dual-control prevents single-person misappropriation
- **Workload Management**: Clear queue with priorities prevents approvals from falling through cracks
- **Efficiency**: Bulk approval tools reduce time spent on routine low-risk items
- **Accountability**: Every approval decision is logged with approver attribution

**For VERSO Leadership:**
- **Regulatory Compliance**: Demonstrate BVI FSC-required transaction oversight and dual-control
- **Risk Visibility**: Real-time dashboard of high-risk pending items (large commitments, compliance exceptions)
- **Performance Metrics**: Track approval SLA compliance, bottlenecks, and staff workload distribution
- **Audit Readiness**: Complete approval history for regulatory inspections

**For Investors:**
- **Transparency**: Know exactly where their request stands (pending review, approved, rejected)
- **Predictability**: Clear SLA commitments (standard approvals within 24 hours, high-priority within 4 hours)
- **Communication**: Automated status updates via portal and email

### How It Connects to Other Modules

- **Deal Management**: Investor commitments trigger approval records; approval grants create allocations
- **Investor Management**: KYC changes, profile updates, and risk rating overrides flow through approvals
- **Task Management**: Rejected approvals auto-create tasks ("Clarify rejection reason with investor")
- **Messages**: Approval status changes trigger notifications in investor Messages
- **Audit Log**: Every approval decision logged with timestamp, approver, and justification
- **Process Center**: Workflows can auto-trigger approvals (e.g., capital call >$500K requires dual approval)
- **Fees Management**: Fee overrides and custom arrangements require admin approval

### Who Uses It?

**Primary Users:**
- **Operations Analysts** (`staff_ops`): Process routine approvals (small commitments, standard document requests)
- **Relationship Managers** (`staff_rm`): Approve investor requests for their assigned portfolio
- **Compliance Officers** (`staff_admin`): Approve high-risk items (large transactions, KYC exceptions, regulatory filings)
- **Business Operations** (`staff_admin`): Approve capital calls, withdrawals, fee overrides

**Access Levels:**
- All staff can view approvals queue (filtered to their assignments)
- `staff_ops` can approve items <$50K
- `staff_rm` can approve items for their assigned investors (no amount limit if standard)
- `staff_admin` can approve all items, including high-risk and compliance exceptions

### Core Use Cases

**1. Investor Commitment Approval (Standard)**

**Scenario:** Sarah (individual investor) wants to commit $250K to VERSO FUND Deal #15.

**Workflow:**
1. Sarah logs into investor portal, navigates to Deal #15, clicks "Submit Commitment"
2. Enters commitment amount: $250,000
3. System validates:
   - Sarah has accepted deal NDA
   - Sarah has completed KYC
   - Sarah has sufficient unfunded commitment ($500K available)
   - Deal is open and has available inventory
4. System creates `approvals` record:
   - `entity_type`: commitment
   - `entity_id`: (new commitment record ID)
   - `requested_by`: Sarah's user ID
   - `priority`: medium (standard commitment)
   - `sla_breach_at`: now() + 24 hours
   - `assigned_to`: Sarah's RM (Michael Rodriguez)
5. Michael receives notification: "Sarah Chen submitted $250K commitment to Deal #15 (SLA: 24h)"
6. Michael opens Approvals queue, sees Sarah's request at top (sorted by SLA)
7. Michael clicks on row, reviews:
   - Sarah's current portfolio (total commitments, available capital)
   - Deal #15 details (terms, structure, minimum commitment met)
   - Sarah's investment history (previously invested $500K across 3 deals)
8. Michael clicks "Approve" → confirmation modal:
   - "Approve $250K commitment from Sarah Chen to Deal #15?"
   - Optional note field: "Approved per investment strategy discussion 10/1"
9. System executes:
   - Updates `approvals.status` to `approved`
   - Creates allocation record (investor_id, deal_id, commitment_amount)
   - Reserves inventory from deal share lots
   - Creates task "Send subscription agreement to Sarah Chen"
   - Creates activity feed entry for Sarah: "Your $250K commitment to Deal #15 was approved"
   - Sends email to Sarah with next steps
10. Sarah sees notification in portal: "Commitment approved! Next step: Sign subscription agreement"

**Timeline:** 2-4 hours (standard SLA: 24 hours)

**2. High-Value Commitment Approval (Dual Control)**

**Scenario:** Acme Fund LP wants to commit $2.5M to REAL Empire Deal #22 (institutional investor, large amount).

**Workflow:**
1. Acme Fund submits commitment via portal
2. System detects commitment >$1M → requires dual approval
3. Creates `approvals` record:
   - `priority`: high (large amount)
   - `sla_breach_at`: now() + 4 hours
   - `assigned_to`: Primary RM (Sarah Chen)
   - `requires_secondary_approval`: true
   - `secondary_approver_role`: compliance_officer
4. Sarah receives high-priority notification (email + Slack ping)
5. Sarah reviews and clicks "Approve"
6. System routes to secondary approver (Compliance Officer - David Park)
7. David reviews:
   - Acme Fund's KYC status (completed, expires 2026-03-15)
   - AML risk rating (low)
   - Concentration risk (Acme currently has $8M across VERSO vehicles, this would increase to $10.5M)
   - Deal structure compliance with BVI AIFMD rules
8. David approves with note: "Verified concentration within policy limits (15% of fund NAV)"
9. System executes allocation and notifies Acme Fund
10. Both approvals logged in audit trail

**Timeline:** 1-3 hours (high-priority SLA: 4 hours)

**3. Rejection with Clarification**

**Scenario:** John Smith (new investor) tries to commit $100K to Deal #18 but hasn't completed KYC.

**Workflow:**
1. John submits commitment via portal
2. System creates approval record (priority: medium)
3. Ops analyst (Emma) reviews, notices KYC status = "pending"
4. Emma clicks "Reject" → rejection modal:
   - Reason dropdown: "KYC Incomplete"
   - Custom message: "Please complete KYC verification before committing. Upload passport, proof of address, and source of funds via the Documents page."
5. System executes:
   - Updates `approvals.status` to `rejected`
   - Stores rejection reason and message
   - Creates task assigned to John: "Complete KYC Documentation"
   - Sends email to John with rejection reason and next steps
   - Creates activity feed entry for John
6. John receives notification, uploads KYC documents
7. After KYC approved, John resubmits commitment
8. New approval record created, routed to Emma
9. Emma approves this time

**Timeline:** 30 minutes (rejection immediate once reviewed)

**4. Bulk Approval (Low-Risk Items)**

**Scenario:** 8 investors submitted small commitments ($5K-$25K) to Deal #12, all meet criteria.

**Workflow:**
1. Ops analyst (Liam) opens Approvals queue
2. Filters to: Deal #12, amount <$50K, KYC status = completed
3. Selects all 8 items via checkboxes
4. Clicks "Bulk Approve"
5. Confirmation modal shows summary:
   - 8 approvals selected
   - Total commitment value: $140K
   - All meet auto-approval criteria
6. Liam confirms
7. System:
   - Approves all 8 in single transaction
   - Creates 8 allocations
   - Sends 8 approval emails to investors
   - Logs bulk approval in audit trail with single audit entry
8. Queue clears 8 items instantly

**Timeline:** 2 minutes for 8 approvals (vs. 15+ minutes individual)

**5. SLA Escalation**

**Scenario:** Commitment approval from Maria (priority: medium, SLA: 24h) is unaddressed for 20 hours.

**Workflow:**
1. System monitors SLA deadlines every 15 minutes
2. Detects Maria's approval at 20 hours elapsed (4 hours before breach)
3. Sends escalation notification to assigned RM (Michael)
   - Email: "Approval SLA Warning: 4 hours remaining for Maria's commitment"
   - Slack ping in #approvals-sla channel
4. If no action at 23 hours elapsed:
   - Escalates to Michael's manager (Operations Lead - Sarah)
   - Creates high-priority task "Review overdue approval: Maria commitment"
5. If SLA breaches (24+ hours):
   - Marks approval as "overdue" in queue (red badge)
   - Logs SLA breach in compliance report
   - Sends notification to investor: "We're reviewing your request and will respond shortly"
6. When finally approved:
   - Records actual approval time (e.g., 26 hours)
   - Flags for SLA performance review

**Outcome:** Early warning system prevents most SLA breaches; when breaches occur, investors are notified proactively

### Key Features (Business Language)

**Approval Queue Management:**
- Centralized table of all pending approvals with real-time status
- Filter by: type, priority, assigned staff, SLA status, date range
- Sort by: SLA urgency, creation date, amount, priority
- Color-coded SLA indicators (green >12h, yellow 4-12h, red <4h or overdue)
- Quick search by investor name, deal name, or approval ID

**Approval Details:**
- Request type (commitment, reservation, withdrawal, KYC change, etc.)
- Requesting user (investor name, email)
- Entity details (deal name, commitment amount, vehicle)
- Priority level with auto-calculation based on amount and risk
- SLA countdown timer (hours remaining or overdue)
- Assigned staff member (auto-routed based on investor RM, request type)
- Supporting documents (subscription agreements, KYC docs)
- Previous approval history for same investor/deal

**Approval Actions:**
- **Approve**: Grant request, trigger downstream workflows (allocation, task creation)
- **Reject**: Deny request with required reason and optional custom message
- **Request Info**: Send clarification request to investor (pauses SLA clock)
- **Reassign**: Route to different staff member with justification
- **Escalate**: Flag for senior review without changing assignment
- **Defer**: Postpone decision with new SLA deadline

**Bulk Operations:**
- Multi-select approvals via checkboxes
- Bulk approve (all selected items approved with single click)
- Bulk reject (mass rejection with shared reason)
- Bulk reassign (route multiple items to different staff member)
- Auto-select filters ("Select all under $10K", "Select all with complete KYC")

**SLA Management:**
- Auto-calculated SLA deadlines based on priority and request type
- SLA warning notifications at 75% elapsed time
- Escalation workflows for overdue items
- SLA pause for "Request Info" status (clock stops until investor responds)
- SLA performance dashboard (on-time %, average time, overdue count)

**Approval Rules & Automation:**
- Auto-approval for low-risk items (commitments <$5K from verified investors)
- Dual-approval required for: amounts >$1M, compliance exceptions, fee overrides
- Role-based routing (KYC changes → compliance, withdrawals → bizops)
- Intelligent assignment (investor requests route to assigned RM)
- Escalation ladder (overdue items escalate to team lead → director)

**Audit & Reporting:**
- Full approval history with timestamps, approvers, and justifications
- Downloadable audit report (CSV/PDF) for compliance reviews
- SLA performance metrics (on-time %, average processing time, breach count)
- Approval volume trends (by type, by staff member, by time period)
- Rejection analysis (top rejection reasons, repeat offenders)

### Business Rules

**Approval Creation:**
- Auto-created when investor submits commitment, reservation, withdrawal >$10K
- Manual creation allowed for staff-initiated requests (fee override, access grant)
- Duplicate prevention: Same investor + entity + type within 24 hours blocked

**Priority Assignment:**
- **Critical**: Withdrawals >$500K, compliance emergencies (SLA: 2 hours)
- **High**: Commitments >$1M, KYC exceptions, fee overrides (SLA: 4 hours)
- **Medium**: Standard commitments, reservations, document requests (SLA: 24 hours)
- **Low**: Profile updates, small document requests (SLA: 72 hours)

**Routing Logic:**
- Investor requests → assigned RM
- KYC changes → compliance officer
- Withdrawals → bizops team
- Fee overrides → admin
- Unassigned requests → round-robin to available ops staff

**Approval Authority:**
- `staff_ops`: Approve <$50K, standard requests
- `staff_rm`: Approve unlimited for assigned investors (standard requests)
- `staff_admin`: Approve all (including high-risk, exceptions)
- Dual approval required: >$1M commitments, compliance exceptions, new investor first commitment >$250K

**SLA Rules:**
- Clock starts when approval created
- Clock pauses when status = "awaiting_info" (waiting for investor response)
- Clock resumes when investor provides requested info
- SLA breach logged but does not block approval (can still approve after deadline)
- Overdue items escalate to team lead at SLA + 4 hours

**Auto-Approval Criteria:**
- Commitment <$5K from investor with:
  - KYC status = completed (not expired)
  - Previous successful commitments ≥3
  - No rejected approvals in last 90 days
  - Deal has available inventory
  - Investor has sufficient unfunded commitment
- Auto-approved items still logged in audit trail

**Rejection Requirements:**
- Must select rejection reason from dropdown (KYC incomplete, insufficient funds, deal closed, etc.)
- Optional custom message to investor (recommended)
- Rejection triggers: investor notification, task creation (if actionable), audit log entry
- Rejected approvals can be resubmitted after correction

### Visual Design Standards

**Layout:**
- Header: "Approval Queue" title, filter/export buttons
- Stats row: 3 KPI cards (Pending, SLA Breaches, Avg Processing Time)
- Table: Approval rows with checkboxes, sortable columns
- Sidebar: Quick actions, SLA performance, approval rules reference

**Approval Row Design:**
- Checkbox for bulk selection
- Request type badge (colored by category)
- Requesting user (name, avatar, timestamp)
- Entity summary (deal name or affected record)
- Priority badge (critical=red, high=orange, medium=blue, low=gray)
- SLA status badge with countdown timer
- Assigned staff avatar
- Action buttons (Approve=green, Reject=red, More options=dropdown)

**Color Coding:**
- **Priority**:
  - Critical: Red (`bg-red-100 text-red-800`)
  - High: Orange (`bg-orange-100 text-orange-800`)
  - Medium: Blue (`bg-blue-100 text-blue-800`)
  - Low: Gray (`bg-gray-100 text-gray-800`)
- **SLA Status**:
  - >12h remaining: Green
  - 4-12h remaining: Yellow
  - <4h remaining: Orange
  - Overdue: Red (pulsing animation)
- **Approval Status**:
  - Approved: Green checkmark
  - Rejected: Red X
  - Pending: Blue clock

**Icons:**
- Pending approvals: `Clock`
- SLA breaches: `AlertTriangle`
- Approved: `CheckCircle2`
- Rejected: `XCircle`
- Escalated: `AlertTriangle` (orange)

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Route**: `/versotech/staff/approvals/page.tsx`
**Type**: Server Component (Next.js App Router)
**Authentication**: Required via `AppLayout` + staff role check
**Data Flow**: Server-side fetch from Supabase with realtime updates

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versotech")
       ├─ Header (title, filter, export buttons)
       ├─ Stats Cards (Pending, Overdue, Avg Time)
       ├─ Approvals Table
       │    ├─ Bulk Actions Bar (select all, bulk approve/reject)
       │    └─ ApprovalRow (Client Component) × N
       │         ├─ Request details
       │         ├─ SLA countdown
       │         └─ Action buttons (Approve, Reject)
       └─ Sidebar (Quick Actions, SLA Performance)
```

### Current Implementation

**Server Component (page.tsx):**
```typescript
async function fetchApprovalData() {
  try {
    const response = await fetch('/api/approvals?status=pending', {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    return {
      approvals: [],
      counts: { pending: 0, approved: 0, rejected: 0 },
      hasData: false
    }
  }
}

export default async function ApprovalsPage() {
  const { approvals, counts, hasData } = await fetchApprovalData()

  const stats = {
    total_pending: counts.pending,
    overdue_count: 0, // TODO: Calculate
    avg_processing_time_hours: 18.5 // TODO: Calculate from historical data
  }

  return (
    <AppLayout brand="versotech">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_pending}
            </div>
          </CardContent>
        </Card>
        {/* ... more stat cards ... */}
      </div>

      {/* Approvals Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request Type / User</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>SLA Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map(approval => (
            <TableRow key={approval.id}>
              {/* Approval row details */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppLayout>
  )
}
```

### Data Model Requirements

**Core Tables:**

```sql
-- Approval requests
create table approvals (
  id uuid primary key default gen_random_uuid(),

  -- Request context
  entity_type text check (entity_type in (
    'commitment', 'reservation', 'allocation',
    'withdrawal', 'kyc_change', 'profile_update',
    'fee_override', 'document_access', 'permission_grant'
  )) not null,
  entity_id uuid not null, -- ID of commitment, reservation, etc.
  entity_metadata jsonb, -- Cached snapshot of entity for approval review

  -- Requester
  requested_by uuid references profiles(id) not null,
  request_reason text,

  -- Approval routing
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  assigned_to uuid references profiles(id),
  assigned_team text, -- 'ops', 'compliance', 'bizops'

  -- Dual approval
  requires_secondary_approval boolean default false,
  secondary_approver_role text, -- 'staff_admin', 'compliance_officer'
  secondary_approved_by uuid references profiles(id),
  secondary_approved_at timestamptz,

  -- Status tracking
  status text check (status in (
    'pending', 'approved', 'rejected', 'awaiting_info',
    'escalated', 'cancelled'
  )) default 'pending',

  -- SLA management
  sla_breach_at timestamptz not null, -- Deadline
  sla_paused_at timestamptz, -- When clock paused (awaiting_info)
  sla_resumed_at timestamptz, -- When clock resumed
  actual_processing_time_hours numeric, -- Actual time to decision

  -- Decision
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  approval_notes text,

  -- Related records
  related_deal_id uuid references deals(id),
  related_investor_id uuid references investors(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz -- When status changed to approved/rejected
);

create index idx_approvals_status on approvals(status, sla_breach_at);
create index idx_approvals_assigned on approvals(assigned_to, status);
create index idx_approvals_entity on approvals(entity_type, entity_id);
create index idx_approvals_requester on approvals(requested_by, created_at desc);
create index idx_approvals_sla on approvals(sla_breach_at) where status = 'pending';

-- Approval history log
create table approval_history (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid references approvals(id) on delete cascade not null,
  action text check (action in (
    'created', 'assigned', 'reassigned', 'approved',
    'rejected', 'escalated', 'info_requested', 'cancelled'
  )) not null,
  actor_id uuid references profiles(id) not null,
  notes text,
  metadata jsonb, -- { previous_assigned_to, new_assigned_to, etc. }
  created_at timestamptz default now()
);

create index idx_approval_history_approval on approval_history(approval_id, created_at);
```

**Triggers & Automation:**

```sql
-- Auto-calculate SLA deadline on insert
create or replace function set_approval_sla_deadline()
returns trigger
language plpgsql
as $$
declare
  v_sla_hours int;
begin
  -- Calculate SLA hours based on priority
  v_sla_hours := case new.priority
    when 'critical' then 2
    when 'high' then 4
    when 'medium' then 24
    when 'low' then 72
    else 24
  end;

  new.sla_breach_at := now() + (v_sla_hours || ' hours')::interval;

  return new;
end;
$$;

create trigger approvals_set_sla before insert on approvals
for each row execute function set_approval_sla_deadline();

-- Auto-assign approval based on routing rules
create or replace function auto_assign_approval()
returns trigger
language plpgsql
as $$
declare
  v_assigned_to uuid;
begin
  -- If already manually assigned, skip
  if new.assigned_to is not null then
    return new;
  end if;

  -- Route based on entity type and related records
  if new.entity_type in ('commitment', 'reservation', 'allocation') and new.related_investor_id is not null then
    -- Assign to investor's primary RM
    select primary_rm into v_assigned_to
    from investors
    where id = new.related_investor_id;
  elsif new.entity_type in ('kyc_change', 'profile_update') then
    -- Assign to compliance team (round-robin)
    select id into v_assigned_to
    from profiles
    where role = 'staff_admin'
      and title = 'compliance_officer'
    order by random()
    limit 1;
  elsif new.entity_type = 'withdrawal' then
    -- Assign to bizops team
    select id into v_assigned_to
    from profiles
    where title = 'bizops'
    order by random()
    limit 1;
  end if;

  new.assigned_to := coalesce(v_assigned_to, new.assigned_to);

  return new;
end;
$$;

create trigger approvals_auto_assign before insert on approvals
for each row execute function auto_assign_approval();

-- Log approval status changes
create or replace function log_approval_change()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into approval_history (
      approval_id,
      action,
      actor_id,
      notes,
      metadata
    ) values (
      new.id,
      case new.status
        when 'approved' then 'approved'
        when 'rejected' then 'rejected'
        when 'escalated' then 'escalated'
        when 'awaiting_info' then 'info_requested'
        when 'cancelled' then 'cancelled'
        else 'updated'
      end,
      new.approved_by,
      new.approval_notes,
      jsonb_build_object(
        'old_status', old.status,
        'new_status', new.status
      )
    );

    -- Calculate actual processing time if resolved
    if new.status in ('approved', 'rejected') then
      new.resolved_at := now();
      new.actual_processing_time_hours := extract(epoch from (now() - new.created_at)) / 3600;
    end if;
  end if;

  return new;
end;
$$;

create trigger approvals_log_changes before update on approvals
for each row execute function log_approval_change();

-- Notify assigned staff when approval created
create or replace function notify_assigned_staff()
returns trigger
language plpgsql
as $$
begin
  if new.assigned_to is not null then
    insert into notifications (
      user_id,
      title,
      message,
      type,
      link
    ) values (
      new.assigned_to,
      'New Approval Request',
      format('New %s approval from %s (Priority: %s, SLA: %s)',
        new.entity_type,
        (select display_name from profiles where id = new.requested_by),
        new.priority,
        to_char(new.sla_breach_at, 'HH24:MI Mon DD')
      ),
      'info',
      '/versotech/staff/approvals/' || new.id
    );
  end if;

  return new;
end;
$$;

create trigger approvals_notify_assigned after insert on approvals
for each row execute function notify_assigned_staff();
```

**Database Functions:**

```sql
-- Get approval statistics
create or replace function get_approval_stats(p_staff_id uuid default null)
returns table (
  total_pending int,
  overdue_count int,
  avg_processing_time_hours numeric,
  approval_rate_24h numeric, -- % approved within 24h
  total_approved_30d int,
  total_rejected_30d int
)
language plpgsql
as $$
begin
  return query
  with approval_data as (
    select
      status,
      sla_breach_at,
      actual_processing_time_hours,
      created_at,
      resolved_at
    from approvals
    where (p_staff_id is null or assigned_to = p_staff_id)
      and created_at >= current_date - interval '30 days'
  )
  select
    count(*) filter (where status = 'pending')::int as total_pending,
    count(*) filter (where status = 'pending' and sla_breach_at < now())::int as overdue_count,
    avg(actual_processing_time_hours) filter (where status in ('approved', 'rejected'))::numeric(10,2) as avg_processing_time_hours,
    (count(*) filter (where status = 'approved' and actual_processing_time_hours <= 24)::numeric /
      nullif(count(*) filter (where status = 'approved'), 0) * 100)::numeric(5,2) as approval_rate_24h,
    count(*) filter (where status = 'approved')::int as total_approved_30d,
    count(*) filter (where status = 'rejected')::int as total_rejected_30d
  from approval_data;
end;
$$;

-- Check if approval meets auto-approval criteria
create or replace function check_auto_approval_criteria(p_approval_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_approval record;
  v_investor record;
  v_previous_commitments int;
  v_recent_rejections int;
begin
  select * into v_approval from approvals where id = p_approval_id;

  -- Only auto-approve commitments
  if v_approval.entity_type != 'commitment' then
    return false;
  end if;

  -- Check commitment amount
  if (v_approval.entity_metadata->>'amount')::numeric > 5000 then
    return false;
  end if;

  -- Get investor details
  select * into v_investor from investors where id = v_approval.related_investor_id;

  -- Check KYC status
  if v_investor.kyc_status != 'completed' or v_investor.kyc_expiry_date < current_date then
    return false;
  end if;

  -- Check previous successful commitments
  select count(*) into v_previous_commitments
  from approvals
  where related_investor_id = v_approval.related_investor_id
    and entity_type = 'commitment'
    and status = 'approved';

  if v_previous_commitments < 3 then
    return false;
  end if;

  -- Check recent rejections
  select count(*) into v_recent_rejections
  from approvals
  where related_investor_id = v_approval.related_investor_id
    and status = 'rejected'
    and created_at >= current_date - interval '90 days';

  if v_recent_rejections > 0 then
    return false;
  end if;

  return true; -- All criteria met
end;
$$;
```

### API Routes

**Get Approvals List:**
```typescript
// app/api/approvals/route.ts
export async function GET(req: Request) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending'
  const priority = searchParams.get('priority')
  const assignedTo = searchParams.get('assigned_to')

  let query = supabase
    .from('approvals')
    .select(`
      *,
      requested_by_profile:profiles!approvals_requested_by_fkey (
        id, display_name, email
      ),
      assigned_to_profile:profiles!approvals_assigned_to_fkey (
        id, display_name, email
      ),
      related_deal:deals (id, name),
      related_investor:investors (id, legal_name)
    `)
    .eq('status', status)
    .order('sla_breach_at', { ascending: true })

  if (priority) query = query.eq('priority', priority)
  if (assignedTo === 'me') query = query.eq('assigned_to', profile.id)

  const { data: approvals, error } = await query

  // Get stats
  const { data: stats } = await supabase
    .rpc('get_approval_stats', { p_staff_id: profile.id })
    .single()

  return NextResponse.json({
    approvals,
    counts: {
      pending: stats.total_pending,
      approved: stats.total_approved_30d,
      rejected: stats.total_rejected_30d
    },
    stats,
    hasData: true
  })
}
```

**Approve/Reject Approval:**
```typescript
// app/api/approvals/[id]/action/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const profile = await requireStaffAuth()

  const { action, notes } = await req.json() // action: 'approve' | 'reject', notes: string

  // 1. Fetch approval
  const { data: approval, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !approval) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  // 2. Check authority (can this user approve this?)
  const canApprove = checkApprovalAuthority(profile, approval)
  if (!canApprove) {
    return NextResponse.json({ error: 'Insufficient authority' }, { status: 403 })
  }

  // 3. Update approval status
  const { error: updateError } = await supabase
    .from('approvals')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      approval_notes: notes,
      rejection_reason: action === 'reject' ? notes : null
    })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 4. Execute downstream actions
  if (action === 'approve') {
    await executeApprovalActions(supabase, approval)
  } else {
    await executeRejectionActions(supabase, approval, notes)
  }

  // 5. Notify requester
  await supabase.from('notifications').insert({
    user_id: approval.requested_by,
    title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
    message: `Your ${approval.entity_type} request has been ${action}ed. ${notes || ''}`,
    type: action === 'approve' ? 'success' : 'warning',
    link: `/versoholdings/deals` // Link to appropriate page
  })

  return NextResponse.json({ success: true })
}

async function executeApprovalActions(supabase, approval) {
  if (approval.entity_type === 'commitment') {
    // Create allocation, reserve inventory, create tasks
    // (Implementation similar to Deal Management PRD)
  } else if (approval.entity_type === 'kyc_change') {
    // Apply KYC changes to investor profile
  }
  // ... other entity types
}

async function executeRejectionActions(supabase, approval, reason) {
  // Create task for investor to address rejection
  await supabase.from('tasks').insert({
    owner_user_id: approval.requested_by,
    kind: `resolve_${approval.entity_type}_rejection`,
    category: 'investment_setup',
    title: `Address rejection: ${approval.entity_type}`,
    description: reason,
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  })
}
```

### RLS Policies

```sql
alter table approvals enable row level security;

-- Staff can view approvals assigned to them or all if admin
create policy approvals_staff_read on approvals for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and (
        profiles.role like 'staff_%'
        and (
          approvals.assigned_to = auth.uid()
          or profiles.role = 'staff_admin'
        )
      )
  )
);

-- Staff can update approvals assigned to them
create policy approvals_staff_update on approvals for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role like 'staff_%'
      and (
        approvals.assigned_to = auth.uid()
        or profiles.role = 'staff_admin'
      )
  )
);

-- Investors can view their own approval requests
create policy approvals_investor_read on approvals for select
using (requested_by = auth.uid());
```

---

## Part 3: Success Metrics

**SLA Performance:**
- On-time approval rate (within SLA): Target >90%
- Average processing time: Target <12 hours
- SLA breach count: Target <5% of total approvals

**Operational Efficiency:**
- Time saved via bulk approvals: Target 30% reduction in approval time
- Auto-approval rate: Target 15% of eligible requests
- Escalation rate: Target <10% of approvals

**Quality:**
- Rejection rate: Target <15%
- Repeat rejection rate (same investor/request): Target <3%
- Approval decision accuracy (no reversals): Target >98%

---

## Document Version History

- v1.0 (October 2, 2025): Initial Approvals PRD with comprehensive business context and technical implementation roadmap
