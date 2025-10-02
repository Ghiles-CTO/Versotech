# Tasks & Onboarding Page PRD - Investor Portal

**Version:** 2.0
**Product:** VERSO Holdings Investor Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Tasks & Onboarding page guides investors through everything they must complete to access deals and stay compliant. It organizes requirements into friendly categories, shows progress bars, and highlights urgent items so investors always know what to do next. Completed items remain visible for audit comfort and personal reassurance.

The experience mirrors a modern checklist: onboarding steps, compliance documents, banking details, and deal-specific actions all live in one place. Each task surfaces context, expected effort, due dates, and action buttons that link to the right workflow (document upload, e-sign, questionnaire, etc.).

By providing a self-serve checklist, Verso accelerates investor activation, reduces back-and-forth emails, and ensures compliance tasks are tracked consistently with a full audit trail.

---

## Part 1: Business Context (Non-Technical)

### What is the Tasks & Onboarding Page?

It is a guided checklist for investors. When someone logs in, they immediately see how many steps are pending, which categories need attention, and what they have already completed. Each card is written in plain language so investors understand exactly what is being requested and why it matters.

### Why Does It Matter?

**For Investors**
- Clear roadmap from invitation to being “fully onboarded”.
- No guesswork: tasks include instructions, due dates, and estimated effort.
- Keeps a permanent record of what has been completed for personal or internal compliance use.

**For Verso Operations**
- Fewer reminder emails; the portal becomes the single source of truth.
- Task completion drives downstream automation (activate access, release documents, trigger capital calls).
- Provides status reporting for regulators or auditors reviewing onboarding rigor.

### Who Uses It?

- New investors completing KYC, documentation, and bank setup.
- Existing investors executing deal-specific actions (sign NDA, confirm allocation).
- Staff members (in view mode) assisting investors over the phone or during concierge onboarding sessions.

### Core Use Cases

1. **Initial Account Setup**  
   A new investor sees the onboarding category at 75% complete and finishes the remaining profile questionnaire via the “Continue” button.

2. **Compliance Follow-Up**  
   An investor receives an email reminder, logs in, and sees the NDA task flagged as high priority with a due date; they review and e-sign immediately.

3. **Bank Verification**  
   Operations requires updated banking details before the next distribution. The investor uploads proof through the task card, and the system marks it complete.

4. **Deal Allocation Acceptance**  
   After receiving an allocation, the investor completes the related task to confirm commitment, which triggers document generation.

5. **Audit Review**  
   An investor downloads their completed tasks list to share with their internal compliance team (future enhancement).

---

## Part 2: Experience Walkthrough

### Header & Progress Overview
- Hero section shows title “Tasks & Onboarding” with short description.
- Three summary cards (Onboarding, Compliance & KYC, Investment Setup) display progress bars, counts of completed vs total tasks, and category descriptions.

### Pending Tasks List
- Displays tasks with status `pending` or `in_progress`.
- Each row includes icon, title, friendly description, priority badge, estimated time, and due date.
- Right-hand side shows status pill and primary button (“Start” or “Continue”) launching the relevant workflow.

### Completed Tasks
- Separate card lists finished tasks with completion dates.
- Provides reassurance that actions were recorded; data used for audit history.

### Help & Support Card
- Persistent help block offering contact support button for investors needing assistance.
- Reinforces Verso concierge service without leaving the page.

### Mobile & Accessibility Considerations
- Responsive layout stacks cards vertically.
- All actions are accessible via keyboard with clear focus states and ARIA labels.

---

## Part 3: Data Model & Integrations

- **`tasks`**: central table representing investor tasks. Key fields include `id`, `owner_user_id`, `kind`, `status` (`pending`, `in_progress`, `completed`, `overdue`), `priority`, `due_at`, `completed_at`, `estimated_minutes`, and `related_entity_type/id` for linking to documents, deals, or workflows.
- **`task_templates`** (planned): reusable definitions used to instantiate tasks per investor when triggered by onboarding sequences or deal events.
- **`task_categories` view**: derived grouping that aggregates progress per category (`onboarding`, `compliance`, `investment_setup`).
- **`documents`** and **`esign_envelopes`**: when a task involves signing or uploading, completion is contingent on records appearing here; tasks reference these via `related_entity_type`.
- **`workflow_runs`**: tasks may launch n8n workflows (e.g., AML screening). Completion updates the associated task.
- **`approvals`**: some tasks require staff approval post-submission; task moves to `completed` only after approval is granted.
- **Realtime Updates**: Supabase channel `tasks_changes` updates counts instantly when status changes, feeding the investor’s notification badge.

---

## Part 4: Functional Requirements

- **Access Control**: Investors only see tasks assigned to their user or investor entity; staff can impersonate with support tooling.
- **Category Progress Calculation**: Progress percentage = (`completedTasks` / `totalTasks`) * 100, rounded to nearest integer.
- **Task Sorting**: Pending list sorted by priority (`high`, `medium`, `low`), then due date, then created_at.
- **Buttons & Actions**: “Start/Continue” button routes to appropriate flow (document upload, questionnaire, signing). Disable button if prerequisite data missing.
- **Status Badges**: Visual differentiation for `pending`, `in_progress`, `completed`, `overdue`. Overdue tasks display warning icon.
- **Completion Flow**: When a linked workflow finishes successfully, mark task `completed`, set `completed_at`, and move to completed section.
- **Notifications**: Task status change triggers entry in `activity_feed` and optional email. Completed tasks remain visible until archived.
- **Empty States**: If no pending tasks, show celebratory message and quick links to documents or dashboard.

---

## Part 5: States & Edge Cases

- **Overdue Tasks**: Highlight in red with warning copy; consider enabling snooze for staff-managed extensions.
- **Deferred Tasks**: Some tasks can be skipped with staff approval; mark as `completed` with `completion_reason = 'waived'`.
- **Deal-Specific Tasks**: Filter by deal context when user arrives from a deal page, showing only relevant items.
- **Offline / Workflow Failure**: If external service (DocuSign, n8n) fails, show inline error and allow retry.
- **Multiple Investors**: Users representing several investor entities need a switcher to view each entity’s checklist (roadmap).
- **Audit Lock**: Completed tasks should become read-only; edits require staff override with logged reason.

---

## Part 6: Success Metrics

- Average time from invitation to completion of all onboarding tasks.
- Percentage of investors with overdue tasks older than 7 days (target <10%).
- Task completion rate per category (onboarding vs compliance vs investment setup).
- Drop in manual reminder emails sent by staff (proxy via `reminder_sent` logs).
- Investor satisfaction score for onboarding experience (post-completion survey).

---

## Part 7: Open Questions & Follow-Ups

1. Should investors have the ability to upload supporting documents directly from the task card or route through Documents page?
2. Do we expose delegated task assignment (e.g., advisor completes on behalf of investor)?
3. How do we handle tasks that must recur annually (KYC refresh) without cluttering the list?
4. Should staff be able to reorder tasks per investor, or do templates dictate sequencing?
5. Confirm retention policy for completed tasks (do we archive after 24 months?).

---

## Glossary

- **Task**: A required action item assigned to an investor or staff member.
- **Category**: Logical grouping of tasks (onboarding, compliance, investment setup).
- **Priority**: Urgency indicator driving sort order and styling.
- **Due Date**: Recommended completion deadline for compliance tracking.
- **Workflow**: Automated process (via n8n or similar) launched from a task action.

---

---

## Part 8: Technical Implementation

### 8.1 Architecture Overview

**Page Route**: `/versoholdings/tasks/page.tsx`
**Type**: Server Component with Client Components for interactions
**Authentication**: Required via `AppLayout` wrapper

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versoholdings")
       ├─ Tasks Header (progress overview)
       ├─ Category Summary Cards
       │    ├─ Onboarding Progress Card
       │    ├─ Compliance & KYC Progress Card
       │    └─ Investment Setup Progress Card
       ├─ Pending Tasks List
       │    └─ TaskCard(s)
       │         ├─ Icon & Metadata
       │         ├─ Priority Badge
       │         ├─ Status Indicator
       │         └─ Action Button (launches modal/workflow)
       ├─ Completed Tasks Section
       │    └─ CompletedTaskCard(s)
       └─ Help & Support Card
```

### 8.2 Data Model

**Primary Table: `tasks`**
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references profiles(id) on delete cascade,
  owner_investor_id uuid references investors(id),
  kind text check (kind in (
    'onboarding_profile',
    'onboarding_bank_details',
    'kyc_individual',
    'kyc_entity',
    'kyc_aml_check',
    'compliance_nda',
    'compliance_subscription_agreement',
    'compliance_tax_forms',
    'investment_allocation_confirmation',
    'investment_funding_instructions',
    'investment_capital_call_response',
    'deal_commitment_review',
    'deal_nda_signature',
    'other'
  )) not null,
  category text check (category in ('onboarding', 'compliance', 'investment_setup')) not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed', 'overdue', 'waived')) default 'pending',
  due_at timestamptz,
  estimated_minutes int,
  related_entity_type text, -- 'document', 'deal', 'workflow_run', 'esign_envelope'
  related_entity_id uuid,
  completion_reason text, -- 'completed', 'waived', 'automated'
  completed_at timestamptz,
  completed_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_tasks_owner_status on tasks(owner_user_id, status);
create index idx_tasks_owner_investor on tasks(owner_investor_id, status);
create index idx_tasks_category on tasks(category, status);
create index idx_tasks_priority_due on tasks(priority desc, due_at asc nulls last);
create index idx_tasks_related_entity on tasks(related_entity_type, related_entity_id);

-- Auto-update updated_at
create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at_column();
```

**Supporting Tables:**
```sql
-- Task Templates (for automated task creation)
create table task_templates (
  id uuid primary key default gen_random_uuid(),
  kind text unique not null,
  category text not null,
  title text not null,
  description text,
  priority text default 'medium',
  estimated_minutes int,
  default_due_days int, -- Days from creation
  prerequisite_task_kinds text[], -- Array of task kinds that must complete first
  trigger_event text, -- 'investor_created', 'deal_invitation', 'allocation_approved'
  created_at timestamptz default now()
);

-- Task Actions (workflow integration)
create table task_actions (
  task_id uuid references tasks(id) on delete cascade,
  action_type text check (action_type in ('url_redirect', 'document_upload', 'esign_flow', 'questionnaire', 'n8n_workflow')),
  action_config jsonb, -- { url, workflow_id, template_id, etc. }
  primary key (task_id)
);

-- Task Dependencies (sequencing)
create table task_dependencies (
  task_id uuid references tasks(id) on delete cascade,
  depends_on_task_id uuid references tasks(id) on delete cascade,
  primary key (task_id, depends_on_task_id),
  check (task_id != depends_on_task_id)
);
```

### 8.3 RLS Policies

```sql
alter table tasks enable row level security;

-- Investors see only their own tasks
create policy tasks_investor_read on tasks for select
using (
  owner_user_id = auth.uid()
  or (
    owner_investor_id is not null
    and exists (
      select 1 from investor_users iu
      where iu.investor_id = tasks.owner_investor_id
        and iu.user_id = auth.uid()
    )
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Task completion
create policy tasks_update on tasks for update
using (
  owner_user_id = auth.uid()
  or exists (
    select 1 from investor_users iu
    where iu.investor_id = tasks.owner_investor_id
      and iu.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);
```

### 8.4 Server-Side Data Fetching

```typescript
// page.tsx
export default async function TasksPage() {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/versoholdings/login')

  // 2. Get investor IDs
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) || []

  // 3. Get all tasks (pending + completed)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      task_actions(action_type, action_config),
      related_document:documents!related_entity_id(id, file_key, type),
      related_deal:deals!related_entity_id(id, name, status)
    `)
    .or(`owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`)
    .order('priority', { ascending: false })
    .order('due_at', { ascending: true, nullsFirst: false })

  // 4. Calculate category progress
  const categorySummary = {
    onboarding: calculateProgress(tasks?.filter(t => t.category === 'onboarding')),
    compliance: calculateProgress(tasks?.filter(t => t.category === 'compliance')),
    investment_setup: calculateProgress(tasks?.filter(t => t.category === 'investment_setup'))
  }

  // 5. Separate pending and completed
  const pendingTasks = tasks?.filter(t =>
    t.status === 'pending' || t.status === 'in_progress' || t.status === 'overdue'
  )
  const completedTasks = tasks?.filter(t =>
    t.status === 'completed' || t.status === 'waived'
  )

  return (
    <AppLayout brand="versoholdings">
      <TasksPageClient
        pendingTasks={pendingTasks || []}
        completedTasks={completedTasks || []}
        categorySummary={categorySummary}
      />
    </AppLayout>
  )
}

function calculateProgress(tasks: Task[]) {
  if (!tasks || tasks.length === 0) return { total: 0, completed: 0, percentage: 100 }
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'waived').length
  return {
    total: tasks.length,
    completed,
    percentage: Math.round((completed / tasks.length) * 100)
  }
}
```

### 8.5 Task Lifecycle & Automation

**Task Creation (Automated):**
```sql
-- Function to create tasks from templates on trigger events
create or replace function create_tasks_from_templates(
  p_user_id uuid,
  p_investor_id uuid,
  p_trigger_event text
)
returns setof tasks
language plpgsql
as $$
begin
  return query
  insert into tasks (
    owner_user_id,
    owner_investor_id,
    kind,
    category,
    title,
    description,
    priority,
    estimated_minutes,
    due_at
  )
  select
    p_user_id,
    p_investor_id,
    tt.kind,
    tt.category,
    tt.title,
    tt.description,
    tt.priority,
    tt.estimated_minutes,
    case
      when tt.default_due_days is not null
        then now() + (tt.default_due_days || ' days')::interval
      else null
    end
  from task_templates tt
  where tt.trigger_event = p_trigger_event
    -- Only create if no existing task of this kind for this user
    and not exists (
      select 1 from tasks t
      where t.owner_user_id = p_user_id
        and t.kind = tt.kind
    )
  returning *;
end;
$$;
```

**Task Completion Webhook (from external systems):**
```typescript
// app/api/webhooks/task-completion/route.ts
export async function POST(req: Request) {
  const supabase = createServiceRoleClient()

  // 1. Verify HMAC signature
  const signature = req.headers.get('x-verso-signature')
  if (!verifyWebhookSignature(req, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse payload
  const { task_id, completion_reason, related_entity_id, completed_by } = await req.json()

  // 3. Update task
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completion_reason: completion_reason || 'completed',
      completed_at: new Date().toISOString(),
      completed_by,
      related_entity_id, // Link to generated document, signed envelope, etc.
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    console.error('Task completion failed:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // 4. Create activity feed entry
  await supabase.from('activity_feed').insert({
    investor_id: data.owner_investor_id,
    activity_type: 'task',
    title: 'Task Completed',
    description: `${data.title} has been completed`,
    importance: 'low',
    read_status: false
  })

  // 5. Check for dependent tasks to unlock
  const { data: dependents } = await supabase
    .from('task_dependencies')
    .select('task_id')
    .eq('depends_on_task_id', task_id)

  // Unlock dependent tasks
  if (dependents && dependents.length > 0) {
    await supabase
      .from('tasks')
      .update({ status: 'pending' })
      .in('id', dependents.map(d => d.task_id))
      .eq('status', 'blocked')
  }

  return NextResponse.json({ success: true, task: data })
}
```

**Automatic Overdue Detection:**
```sql
-- Function to mark overdue tasks (run via cron)
create or replace function mark_overdue_tasks()
returns void
language plpgsql
as $$
begin
  update tasks
  set status = 'overdue'
  where status in ('pending', 'in_progress')
    and due_at is not null
    and due_at < now();
end;
$$;

-- Schedule with pg_cron (or n8n cron workflow)
-- SELECT cron.schedule('mark-overdue-tasks', '0 * * * *', 'SELECT mark_overdue_tasks()');
```

### 8.6 Task Action Flows

**1. Document Upload Task:**
```typescript
// TaskActionButton component
function TaskActionButton({ task }: { task: Task }) {
  const action = task.task_actions?.[0]

  if (action?.action_type === 'document_upload') {
    return (
      <DocumentUploadModal
        taskId={task.id}
        documentType={action.action_config.document_type}
        onComplete={() => markTaskComplete(task.id)}
      >
        <Button>Upload Document</Button>
      </DocumentUploadModal>
    )
  }

  if (action?.action_type === 'esign_flow') {
    return (
      <Button onClick={() => launchESignFlow(task.id, action.action_config)}>
        Sign Document
      </Button>
    )
  }

  // ... other action types
}
```

**2. E-Sign Flow:**
```typescript
async function launchESignFlow(taskId: string, config: { template_id: string }) {
  // Call API to generate esign envelope
  const response = await fetch('/api/tasks/esign/initiate', {
    method: 'POST',
    body: JSON.stringify({
      task_id: taskId,
      template_id: config.template_id
    })
  })

  const { signing_url } = await response.json()

  // Redirect to DocuSign/Dropbox Sign
  window.location.href = signing_url

  // Webhook will mark task complete when signed
}
```

**3. n8n Workflow Trigger:**
```typescript
async function launchWorkflow(taskId: string, workflowId: string) {
  const response = await fetch('/api/workflows/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-idempotency-key': taskId
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      task_id: taskId,
      context: { /* task metadata */ }
    })
  })

  const { run_id } = await response.json()

  // Poll for completion or subscribe to webhook
  return run_id
}
```

### 8.7 Realtime Updates

```typescript
// Client component
'use client'

export function TasksPageClient({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to task changes
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `owner_user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t =>
            t.id === payload.new.id ? payload.new : t
          ))
        }
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ... render logic
}
```

### 8.8 API Routes

**Mark Task Complete:**
```
PATCH /api/tasks/[id]/complete
Body: { completion_reason?: string }
Response: { task: Task }
```

**Update Task Status:**
```
PATCH /api/tasks/[id]
Body: { status: string, notes?: string }
Response: { task: Task }
```

**Bulk Complete (staff only):**
```
POST /api/tasks/bulk-complete
Body: { task_ids: string[], completion_reason: string }
Response: { completed: number }
```

### 8.9 Performance & Monitoring

**Metrics to Track:**
- Task completion rate by category
- Average time to complete per task kind
- Overdue task count (alert if >20)
- Task creation errors (template failures)

**Database Indexes:**
```sql
-- Already defined above for optimal queries
create index idx_tasks_owner_status on tasks(owner_user_id, status);
create index idx_tasks_priority_due on tasks(priority desc, due_at asc nulls last);
```

**Caching Strategy:**
- Server-side render initial task list (fast first paint)
- Client-side cache completed tasks (reduce DB load)
- Realtime updates only for active tasks

---

**Document Version History**
- v2.0 (October 2, 2025): Added comprehensive technical implementation section
- v1.0 (September 2025): Initial Tasks & Onboarding PRD aligned with investor portal v2 checklist design
