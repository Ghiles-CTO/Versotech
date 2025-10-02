# Reports & Ask Center PRD - Investor & Staff Portals

**Version:** 2.0
**Product:** VERSO Holdings & VersoTech Portals
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Reports & Ask center lets investors pull their own investment reports or request bespoke analysis without leaving the portal. Standard reports (positions statements, investment summaries, tax packs) are one click away, while custom asks route to the Verso team with clear status tracking. Every deliverable lands back in the portal as a watermarked document tied to the right investor, vehicle, or deal.

Behind the scenes, requests trigger workflow automation via n8n and inform the operations team when manual work is required. Staff triage, assign, and fulfil requests from the same interface, ensuring that investor expectations, compliance obligations, and audit trails are all maintained.

---

## Part 1: Business Context (Non-Technical)

### What is the Reports & Ask Center?

It is the investor's self-service reporting hub. Investors see recommended quick reports they can generate instantly and a simple form for asking for something custom. Progress bars, timestamps, and delivery alerts remove guesswork about when a report will be ready. Staff manage the same queue, updating statuses and attaching results once ready.

### Why Does It Matter?

**For Investors**
- Immediate access to up-to-date portfolio statements without emailing support.
- Transparent tracking for custom requests with clear SLAs and notifications.
- Confidence that downloaded files are current, secure, and traceable.

**For Verso Operations**
- Reduces manual email threads and centralises workload management.
- Automates routine report generation, freeing teams for higher-value work.
- Provides performance metrics and audit history for regulatory inspections.

### How It Connects to Other Modules
- Generated documents are stored in the Documents module and appear in the activity feed.
- Tasks can be auto-created if a request requires follow-up actions (e.g., investor must approve data).
- Messages surface key status changes, keeping investors informed in chat.
- Staff dashboards aggregate open requests for operational oversight.

### Who Uses It?
- Investors and their delegates requesting statements, tax packs, or custom analyses.
- Staff administrators and operations analysts fulfilling bespoke requests.
- Compliance reviewers ensuring reports meet regulatory standards before release.

### Core Use Cases
1. **Positions Statement Download** - Investor clicks "Generate Positions Statement," receives a new PDF within seconds, and sees it logged in Documents.
2. **Vehicle Performance Report** - Investor requests an investments report filtered to a vehicle; workflow compiles data, staff reviews, and the final document auto-delivers.
3. **Custom Ask** - Investor submits "Need cashflow schedule for Q1," staff assigns to an analyst, attaches spreadsheet when ready, and closes the ticket.
4. **Audit Support** - Staff bulk-generate recent tax packs for multiple investors ahead of annual filings.
5. **Deal-Level Reporting** - Deal lead requests a bespoke allocation recap tied to a specific deal for introducer partners.

---

## Part 2: Experience Walkthrough

- **Investor Landing View**: Hero explains quick reports vs. custom requests. Tiles display standard reports with estimated generation time and last updated timestamp.
- **Quick Reports**: Buttons trigger automated workflows; generation status (Queued -> Processing -> Ready) appears inline. Completed reports drop into a "Recently Generated" list with download links.
- **Custom Ask Form**: Simple form capturing subject, description, desired timeframe, related vehicle/deal, and urgency. Confirmation screen summarises the request and expected SLA.
- **Request Timeline**: Each ask shows status, assigned staff member, and message history. Investors can add clarifying comments without leaving the page.
- **Staff Queue View**: Filterable table of open requests with columns for priority, SLA countdown, related investor, and linked workflow run. Quick actions to assign, trigger automation, or attach deliverables.
- **Delivery & Notifications**: When fulfilled, investors receive both an in-portal alert and optional email; the document is accessible from the request card and the Documents area.
- **Analytics Tab (staff)**: Charts for request volume, turnaround time, and automation usage.

---

## Part 3: Data Model & Integrations

- **`report_requests`**: Core table representing quick or custom report jobs (investor, vehicle, filters, status, result document).
- **`request_tickets`**: Tracks Ask submissions requiring manual handling; links to workflow runs and assigned staff.
- **`documents`**: Stores generated reports with ownership metadata, watermarks, and audit logging.
- **`workflow_runs`**: n8n executions tied to `report_requests` or `request_tickets`; webhooks update status and attach output documents.
- **`tasks`**: Optional tasks generated when investor action is required (e.g., approve data corrections) before a request can be closed.
- **`activity_feed`**: Broadcasts key milestones ("Report ready", "Request assigned") for visibility.
- **`messages`**: Inline conversation thread for each request, ensuring communications are captured.
- **Realtime & Notifications**: Supabase channels refresh status counts; notification service drives email or push reminders.
- **Security & RLS**: Policies ensure investors see only their own requests and documents; staff roles view all.

---

## Part 4: Functional Requirements

- **Quick Report Generation**: Support standard report types (positions statement, investment summary, capital activity, tax pack). Trigger n8n workflow with idempotency tokens; show progress in UI.
- **Custom Asks**: Capture structured data (category, deadline, attachments). Investors can edit or cancel while status is `queued`.
- **Staff Workflow**: Staff can assign requests, update status (`queued`, `in_progress`, `waiting_on_investor`, `ready`, `closed`), and attach output documents.
- **Document Delivery**: Generated files must be watermarked, stored in Documents, and available via short-lived URLs. Closing a request requires linking a document or completion note.
- **SLA Tracking**: Calculate due dates based on request type and priority; flag overdue items in staff view.
- **Auditing**: Log every state change, assignment, and document attachment in `audit_log` with user attribution.
- **Reporting**: Expose metrics API for staff dashboards (open counts, average turnaround, automation ratio).
- **Access Control**: Enforce RLS on `report_requests` and `request_tickets` so investors see only their own records; staff roles see all.
- **Error Handling**: If a workflow fails, surface error state with retry option and notify assigned staff via Messages.
- **Localization**: Support multi-currency formats and locale-specific date labels in generated outputs.

---

## Part 5: States & Edge Cases

- **Duplicate Requests**: Detect identical quick report requests within a short window and reuse the existing result when appropriate.
- **Investor Revoked**: If an investor loses access (account suspended), auto-cancel outstanding requests and notify staff.
- **Data Staleness**: Display "As of" timestamp based on latest valuation/cashflow data included in the report.
- **Workflow Timeout**: If n8n run exceeds SLA, escalate to staff and move status to `in_progress` with warning badge.
- **Partial Delivery**: Allow attaching multiple documents (e.g., PDF plus Excel appendix) before marking as complete.
- **Compliance Hold**: Staff can place a request on hold pending compliance review; investor sees hold reason.

---

## Part 6: Success Metrics

- Percentage of standard reports generated via self-service vs. manual requests.
- Average turnaround time for custom asks by priority tier.
- Automation success rate (completed without manual intervention).
- Investor satisfaction score post-delivery (thumbs up/down prompt).
- Reduction in email-based report requests compared to baseline.

---

## Part 7: Open Questions & Follow-Ups

1. Which report templates are in-scope for MVP beyond positions statement and investments summary?
2. Do we need investor-level permissions to restrict who can submit custom asks (e.g., only primary contact)?
3. What is the retention policy for request history and generated reports (especially tax-sensitive data)?
4. Should staff be able to bulk-generate reports across multiple investors from this interface?
5. How do we handle highly sensitive attachments (e.g., bank statements) that may require additional encryption or access steps?

---

## Glossary

- **Quick Report**: Predefined report generated automatically (positions statement, investment summary, etc.).
- **Custom Ask**: Investor-submitted request that may require manual work or bespoke analysis.
- **Workflow Run**: Automated process in n8n triggered to build or deliver a report.
- **SLA**: Service level agreement defining expected turnaround time based on request priority.
- **Completion Note**: Staff-authored summary closing a request when no document is attached.

---

---

## Part 8: Technical Implementation

### 8.1 Architecture

**Page Route**: `/versoholdings/reports/page.tsx`
**Type**: Server Component with Client Components for request management
**Authentication**: Required via `AppLayout`

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout
       ├─ Quick Reports Section
       │    └─ QuickReportButton(s) → triggers n8n workflow
       ├─ Custom Ask Form → RequestTicketModal
       ├─ Active Requests List → RequestCard(s)
       └─ Recently Generated Reports
```

### 8.2 Data Model

```sql
-- Quick report requests
create table report_requests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  vehicle_id uuid references vehicles(id),
  report_type text check (report_type in ('positions_statement', 'investment_summary', 'capital_activity', 'tax_pack', 'custom')),
  filters jsonb, -- { from_date, to_date, currency, etc. }
  status text check (status in ('queued', 'processing', 'ready', 'failed', 'cancelled')) default 'queued',
  result_doc_id uuid references documents(id),
  workflow_run_id uuid,
  error_message text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Custom asks
create table request_tickets (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references investors(id),
  created_by uuid references profiles(id),
  category text check (category in ('analysis', 'tax_doc', 'cashflow', 'valuation', 'other')),
  subject text not null,
  details text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('open', 'assigned', 'in_progress', 'waiting_on_investor', 'ready', 'closed')) default 'open',
  assigned_to uuid references profiles(id),
  linked_workflow_run uuid,
  result_doc_id uuid references documents(id),
  completion_note text,
  deal_id uuid references deals(id),
  due_date date,
  closed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_report_requests_investor on report_requests(investor_id, status);
create index idx_request_tickets_status on request_tickets(status, priority, due_date);
create index idx_request_tickets_assigned on request_tickets(assigned_to, status);
```

### 8.3 n8n Workflow Integration

**Quick Report Flow:**
```typescript
async function generateQuickReport(reportType: string, filters: object) {
  // 1. Create report_requests record
  const { data: request } = await supabase
    .from('report_requests')
    .insert({
      investor_id: currentInvestorId,
      report_type: reportType,
      filters,
      status: 'queued',
      created_by: user.id
    })
    .select()
    .single()

  // 2. Trigger n8n workflow
  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-verso-signature': generateHMAC({...}), // HMAC signature
      'x-idempotency-key': request.id
    },
    body: JSON.stringify({
      workflow: 'generate_report',
      report_request_id: request.id,
      report_type: reportType,
      investor_id: currentInvestorId,
      filters
    })
  })

  const { workflow_run_id } = await response.json()

  // 3. Update with workflow_run_id
  await supabase
    .from('report_requests')
    .update({ workflow_run_id })
    .eq('id', request.id)

  return request.id
}
```

**n8n Callback Webhook:**
```typescript
// app/api/webhooks/n8n/report-complete/route.ts
export async function POST(req: Request) {
  const supabase = createServiceRoleClient()

  // Verify signature
  if (!verifyN8nSignature(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { report_request_id, status, document_id, error_message } = await req.json()

  // Update report_requests
  await supabase
    .from('report_requests')
    .update({
      status: status === 'success' ? 'ready' : 'failed',
      result_doc_id: document_id,
      error_message,
      completed_at: new Date().toISOString()
    })
    .eq('id', report_request_id)

  // Create activity feed entry
  if (status === 'success') {
    await supabase.from('activity_feed').insert({
      investor_id: request.investor_id,
      activity_type: 'document',
      title: 'Report Ready',
      description: `Your ${report_type} report is ready to download`,
      importance: 'medium'
    })
  }

  return NextResponse.json({ success: true })
}
```

### 8.4 API Routes

**Create Quick Report:**
```
POST /api/reports/generate
Body: { reportType, filters }
Response: { request_id, status: 'queued' }
```

**Create Custom Ask:**
```
POST /api/requests
Body: { category, subject, details, priority, deal_id? }
Response: { ticket_id }
```

**Get Request Status:**
```
GET /api/reports/[id]
Response: { id, status, result_doc_id, created_at, completed_at }
```

**Update Request (staff):**
```
PATCH /api/requests/[id]
Body: { status, assigned_to, completion_note, result_doc_id }
Response: { ticket }
```

### 8.5 Realtime Updates

```typescript
useEffect(() => {
  const channel = supabase
    .channel('report_updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'report_requests',
      filter: `investor_id=eq.${investorId}`
    }, (payload) => {
      if (payload.new.status === 'ready') {
        toast.success('Your report is ready!')
        refreshReports()
      }
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [investorId])
```

### 8.6 RLS Policies

```sql
alter table report_requests enable row level security;
alter table request_tickets enable row level security;

create policy report_requests_read on report_requests for select
using (
  exists (
    select 1 from investor_users iu
    where iu.investor_id = report_requests.investor_id
      and iu.user_id = auth.uid()
  )
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

create policy request_tickets_read on request_tickets for select
using (
  created_by = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%')
);

create policy request_tickets_update_staff on request_tickets for update
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role like 'staff_%'));
```

### 8.7 SLA Tracking

```sql
-- Function to calculate SLA deadline
create or replace function calculate_request_sla(priority text)
returns interval
language plpgsql
as $$
begin
  return case priority
    when 'urgent' then interval '4 hours'
    when 'high' then interval '1 day'
    when 'medium' then interval '3 days'
    when 'low' then interval '7 days'
    else interval '3 days'
  end;
end;
$$;

-- Auto-set due_date on insert
create trigger set_request_due_date before insert on request_tickets
for each row execute function (
  new.due_date = current_date + calculate_request_sla(new.priority)
);
```

---

**Document Version History**
- v2.0 (October 2, 2025): Added comprehensive technical implementation section
- v1.0 (September 2025): Initial Reports & Ask PRD aligned with Verso portal v2 automation design




