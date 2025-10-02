# Tasks & Onboarding Page - Implementation Plan

**Project:** VERSO Holdings Investor Portal
**Feature:** Tasks & Onboarding Page
**PRD Reference:** `/docs/investor/Tasks_Page_PRD.md`
**Current Status:** 15% Complete (UI mockup only)
**Target Completion:** 100% Full Production Ready
**Estimated Effort:** 10-15 developer days

---

## Executive Summary

This implementation plan transforms the current mockup Tasks page into a fully functional, database-backed task management system for investor onboarding and compliance tracking. The work is divided into 5 phases progressing from database foundation to advanced integrations.

**Current State:**
- ✅ Static UI with hardcoded task data
- ✅ Visual design complete
- ❌ No database connectivity
- ❌ No real functionality

**Target State:**
- ✅ Full database schema with RLS policies
- ✅ Server-side data fetching and rendering
- ✅ Interactive task actions (upload, sign, workflow triggers)
- ✅ Real-time updates via Supabase subscriptions
- ✅ Automated task creation and lifecycle management
- ✅ Webhook integrations for external services

---

## Phase 1: Database Foundation (Priority: CRITICAL)

**Estimated Time:** 2-3 days
**Dependency:** None (can start immediately)
**Blockers Removed:** Enables all subsequent phases

### 1.1 Extend Tasks Table Schema

**File:** `database/migrations/007_tasks_schema_enhancement.sql`

**Tasks:**
- [ ] Add missing columns to tasks table
- [ ] Create check constraints for enums
- [ ] Add indexes for performance
- [ ] Create auto-update trigger for `updated_at`

**SQL Implementation:**
```sql
-- Migration: Enhance tasks table per PRD requirements
BEGIN;

-- Add new columns to existing tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS owner_investor_id uuid REFERENCES investors(id),
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Task',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS estimated_minutes int,
  ADD COLUMN IF NOT EXISTS completion_reason text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status field to have better default
ALTER TABLE tasks
  ALTER COLUMN status SET DEFAULT 'pending';

-- Add check constraints
ALTER TABLE tasks
  ADD CONSTRAINT tasks_kind_check CHECK (kind IN (
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
  ));

ALTER TABLE tasks
  ADD CONSTRAINT tasks_category_check CHECK (category IN (
    'onboarding',
    'compliance',
    'investment_setup'
  ));

ALTER TABLE tasks
  ADD CONSTRAINT tasks_priority_check CHECK (priority IN (
    'low',
    'medium',
    'high'
  ));

ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check CHECK (status IN (
    'pending',
    'in_progress',
    'completed',
    'overdue',
    'waived'
  ));

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner_status
  ON tasks(owner_user_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_owner_investor
  ON tasks(owner_investor_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_category
  ON tasks(category, status);

CREATE INDEX IF NOT EXISTS idx_tasks_priority_due
  ON tasks(priority DESC, due_at ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_tasks_related_entity
  ON tasks(related_entity_type, related_entity_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

**Acceptance Criteria:**
- [ ] All PRD-specified columns exist in tasks table
- [ ] Check constraints prevent invalid enum values
- [ ] Indexes improve query performance (verify with EXPLAIN)
- [ ] updated_at auto-updates on every row change

---

### 1.2 Create Supporting Tables

**File:** `database/migrations/008_task_supporting_tables.sql`

**Tasks:**
- [ ] Create task_templates table
- [ ] Create task_actions table
- [ ] Create task_dependencies table
- [ ] Add foreign key relationships

**SQL Implementation:**
```sql
BEGIN;

-- Task Templates (for automated task creation)
CREATE TABLE IF NOT EXISTS task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text UNIQUE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  estimated_minutes int,
  default_due_days int, -- Days from creation
  prerequisite_task_kinds text[], -- Array of task kinds that must complete first
  trigger_event text, -- 'investor_created', 'deal_invitation', 'allocation_approved'
  created_at timestamptz DEFAULT now(),

  CONSTRAINT task_templates_category_check CHECK (category IN (
    'onboarding', 'compliance', 'investment_setup'
  )),
  CONSTRAINT task_templates_priority_check CHECK (priority IN (
    'low', 'medium', 'high'
  ))
);

-- Task Actions (workflow integration)
CREATE TABLE IF NOT EXISTS task_actions (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_config jsonb, -- { url, workflow_id, template_id, etc. }
  PRIMARY KEY (task_id),

  CONSTRAINT task_actions_type_check CHECK (action_type IN (
    'url_redirect',
    'document_upload',
    'esign_flow',
    'questionnaire',
    'n8n_workflow'
  ))
);

-- Task Dependencies (sequencing)
CREATE TABLE IF NOT EXISTS task_dependencies (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_task_id),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_templates_trigger_event
  ON task_templates(trigger_event);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on
  ON task_dependencies(depends_on_task_id);

COMMIT;
```

**Acceptance Criteria:**
- [ ] Tables created successfully
- [ ] Foreign keys enforce referential integrity
- [ ] Self-referencing dependency prevented by constraint

---

### 1.3 Implement RLS Policies

**File:** `database/migrations/009_tasks_rls_policies.sql`

**Tasks:**
- [ ] Enable RLS on all task tables
- [ ] Create investor read policy
- [ ] Create staff read policy
- [ ] Create update policies
- [ ] Test policies with different user roles

**SQL Implementation:**
```sql
BEGIN;

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Investors see only their own tasks
CREATE POLICY tasks_investor_read ON tasks FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR (
    owner_investor_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM investor_users iu
      WHERE iu.investor_id = tasks.owner_investor_id
        AND iu.user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- Task completion (investors can update their own tasks)
CREATE POLICY tasks_update ON tasks FOR UPDATE
USING (
  owner_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = tasks.owner_investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- Staff can insert tasks
CREATE POLICY tasks_staff_insert ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- Task templates: staff read/write, investors read
CREATE POLICY task_templates_read ON task_templates FOR SELECT
USING (true); -- All authenticated users can read templates

CREATE POLICY task_templates_staff_write ON task_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('staff_admin', 'staff_ops')
  )
);

-- Task actions: follow task permissions
CREATE POLICY task_actions_read ON task_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_actions.task_id
      AND (
        t.owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM investor_users iu
          WHERE iu.investor_id = t.owner_investor_id
            AND iu.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
        )
      )
  )
);

-- Task dependencies: follow task permissions
CREATE POLICY task_dependencies_read ON task_dependencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_dependencies.task_id
      AND (
        t.owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM investor_users iu
          WHERE iu.investor_id = t.owner_investor_id
            AND iu.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
        )
      )
  )
);

COMMIT;
```

**Acceptance Criteria:**
- [ ] Investors can only see their own tasks
- [ ] Staff can see all tasks
- [ ] Investors can update their own task status
- [ ] Template read access works for all users
- [ ] Staff can manage templates and dependencies

**Testing Checklist:**
```sql
-- Test as investor
SET ROLE authenticated;
SET request.jwt.claim.sub TO '<investor_user_id>';
SELECT * FROM tasks; -- Should only see own tasks

-- Test as staff
SET request.jwt.claim.sub TO '<staff_user_id>';
SELECT * FROM tasks; -- Should see all tasks
```

---

### 1.4 Automation Functions

**File:** `database/migrations/010_task_automation_functions.sql`

**Tasks:**
- [ ] Create function to generate tasks from templates
- [ ] Create function to mark overdue tasks
- [ ] Create function to unlock dependent tasks
- [ ] Add database comments for documentation

**SQL Implementation:**
```sql
BEGIN;

-- Function: Create tasks from templates on trigger events
CREATE OR REPLACE FUNCTION create_tasks_from_templates(
  p_user_id uuid,
  p_investor_id uuid,
  p_trigger_event text
)
RETURNS SETOF tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO tasks (
    owner_user_id,
    owner_investor_id,
    kind,
    category,
    title,
    description,
    priority,
    estimated_minutes,
    due_at,
    status
  )
  SELECT
    p_user_id,
    p_investor_id,
    tt.kind,
    tt.category,
    tt.title,
    tt.description,
    tt.priority,
    tt.estimated_minutes,
    CASE
      WHEN tt.default_due_days IS NOT NULL
        THEN now() + (tt.default_due_days || ' days')::interval
      ELSE NULL
    END,
    CASE
      WHEN tt.prerequisite_task_kinds IS NULL OR array_length(tt.prerequisite_task_kinds, 1) = 0
        THEN 'pending'
      ELSE 'blocked' -- Will be unlocked when prerequisites complete
    END
  FROM task_templates tt
  WHERE tt.trigger_event = p_trigger_event
    -- Only create if no existing task of this kind for this user
    AND NOT EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.owner_user_id = p_user_id
        AND t.kind = tt.kind
        AND t.status NOT IN ('completed', 'waived')
    )
  RETURNING *;
END;
$$;

-- Function: Mark overdue tasks (run via cron)
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS TABLE(updated_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count bigint;
BEGIN
  WITH updated AS (
    UPDATE tasks
    SET status = 'overdue'
    WHERE status IN ('pending', 'in_progress')
      AND due_at IS NOT NULL
      AND due_at < now()
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM updated;

  RETURN QUERY SELECT v_count;
END;
$$;

-- Function: Unlock dependent tasks when prerequisite completes
CREATE OR REPLACE FUNCTION unlock_dependent_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if task was just completed
  IF NEW.status IN ('completed', 'waived') AND OLD.status NOT IN ('completed', 'waived') THEN

    -- Find tasks that depend on this one
    UPDATE tasks t
    SET status = 'pending'
    WHERE t.id IN (
      SELECT td.task_id
      FROM task_dependencies td
      WHERE td.depends_on_task_id = NEW.id
        AND NOT EXISTS (
          -- Check if all other dependencies are also complete
          SELECT 1
          FROM task_dependencies td2
          JOIN tasks t2 ON t2.id = td2.depends_on_task_id
          WHERE td2.task_id = td.task_id
            AND td2.depends_on_task_id != NEW.id
            AND t2.status NOT IN ('completed', 'waived')
        )
    )
    AND t.status = 'blocked';

  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: Auto-unlock dependent tasks
CREATE TRIGGER tasks_unlock_dependents
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION unlock_dependent_tasks();

-- Add helpful comments
COMMENT ON FUNCTION create_tasks_from_templates IS
  'Creates tasks for a user/investor from templates matching a trigger event. Prevents duplicate tasks.';

COMMENT ON FUNCTION mark_overdue_tasks IS
  'Marks pending/in_progress tasks as overdue if past due date. Run via cron hourly.';

COMMENT ON FUNCTION unlock_dependent_tasks IS
  'Automatically unlocks tasks when all dependencies are completed. Triggered on task update.';

COMMIT;
```

**Acceptance Criteria:**
- [ ] create_tasks_from_templates creates tasks without duplicates
- [ ] mark_overdue_tasks correctly identifies overdue items
- [ ] unlock_dependent_tasks waits for all prerequisites
- [ ] Functions have SECURITY DEFINER for controlled execution

**Testing:**
```sql
-- Test template creation
SELECT create_tasks_from_templates(
  '<user_id>'::uuid,
  '<investor_id>'::uuid,
  'investor_created'
);

-- Test overdue marking
SELECT mark_overdue_tasks();

-- Test dependency unlock (insert completed task and verify dependents unlock)
```

---

## Phase 2: Data Layer (Priority: CRITICAL)

**Estimated Time:** 1-2 days
**Dependency:** Phase 1 complete
**Blockers Removed:** Enables functional UI

### 2.1 Server-Side Data Fetching

**File:** `versotech-portal/src/app/(investor)/versoholdings/tasks/page.tsx`

**Tasks:**
- [ ] Convert to async Server Component
- [ ] Fetch tasks from Supabase
- [ ] Calculate category progress
- [ ] Implement task sorting logic
- [ ] Handle investor entity relationships

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { TasksPageClient } from './tasks-page-client'

interface Task {
  id: string
  owner_user_id: string
  owner_investor_id: string | null
  kind: string
  category: 'onboarding' | 'compliance' | 'investment_setup'
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived'
  due_at: string | null
  estimated_minutes: number | null
  completed_at: string | null
  completed_by: string | null
  created_at: string
  updated_at: string
  task_actions?: {
    action_type: string
    action_config: any
  }[]
  related_document?: {
    id: string
    file_key: string
    type: string
  }
  related_deal?: {
    id: string
    name: string
    status: string
  }
}

interface CategoryProgress {
  total: number
  completed: number
  percentage: number
}

function calculateProgress(tasks: Task[]): CategoryProgress {
  if (!tasks || tasks.length === 0) {
    return { total: 0, completed: 0, percentage: 100 }
  }

  const completed = tasks.filter(
    t => t.status === 'completed' || t.status === 'waived'
  ).length

  return {
    total: tasks.length,
    completed,
    percentage: Math.round((completed / tasks.length) * 100)
  }
}

export default async function TasksPage() {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/versoholdings/login')
  }

  // 2. Get investor IDs for this user
  const { data: investorLinks, error: linksError } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) || []

  // 3. Build query filter
  let tasksQuery = supabase
    .from('tasks')
    .select(`
      *,
      task_actions(action_type, action_config),
      related_document:documents!related_entity_id(id, file_key, type),
      related_deal:deals!related_entity_id(id, name, status)
    `)

  // Filter by user or investor entities
  if (investorIds.length > 0) {
    tasksQuery = tasksQuery.or(
      `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
    )
  } else {
    tasksQuery = tasksQuery.eq('owner_user_id', user.id)
  }

  // 4. Execute query with sorting
  const { data: tasks, error: tasksError } = await tasksQuery
    .order('priority', { ascending: false }) // high -> low
    .order('due_at', { ascending: true, nullsFirst: false }) // earliest first

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
  }

  const allTasks = (tasks as Task[]) || []

  // 5. Calculate category progress
  const categorySummary = {
    onboarding: calculateProgress(
      allTasks.filter(t => t.category === 'onboarding')
    ),
    compliance: calculateProgress(
      allTasks.filter(t => t.category === 'compliance')
    ),
    investment_setup: calculateProgress(
      allTasks.filter(t => t.category === 'investment_setup')
    )
  }

  // 6. Separate pending and completed
  const pendingTasks = allTasks.filter(t =>
    t.status === 'pending' ||
    t.status === 'in_progress' ||
    t.status === 'overdue'
  )

  const completedTasks = allTasks.filter(t =>
    t.status === 'completed' ||
    t.status === 'waived'
  )

  return (
    <AppLayout brand="versoholdings">
      <TasksPageClient
        userId={user.id}
        pendingTasks={pendingTasks}
        completedTasks={completedTasks}
        categorySummary={categorySummary}
      />
    </AppLayout>
  )
}
```

**Acceptance Criteria:**
- [ ] Tasks load from database, not hardcoded data
- [ ] Category progress calculates correctly
- [ ] Tasks sorted by priority then due date
- [ ] Related entities (documents, deals) load via joins
- [ ] Investor entity tasks appear for linked users

---

### 2.2 Create Client Component

**File:** `versotech-portal/src/app/(investor)/versoholdings/tasks/tasks-page-client.tsx`

**Tasks:**
- [ ] Extract UI into client component
- [ ] Accept server data as props
- [ ] Prepare for real-time subscriptions (Phase 4)

**Implementation:**
```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  CreditCard,
  Calendar,
  ExternalLink
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  category: 'onboarding' | 'compliance' | 'investment_setup'
  status: string
  priority: string
  due_at: string | null
  completed_at: string | null
  estimated_minutes: number | null
  task_actions?: any[]
}

interface CategoryProgress {
  total: number
  completed: number
  percentage: number
}

interface TasksPageClientProps {
  userId: string
  pendingTasks: Task[]
  completedTasks: Task[]
  categorySummary: {
    onboarding: CategoryProgress
    compliance: CategoryProgress
    investment_setup: CategoryProgress
  }
}

export function TasksPageClient({
  userId,
  pendingTasks,
  completedTasks,
  categorySummary
}: TasksPageClientProps) {

  // Helper functions
  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'onboarding':
        return <FileText className="h-4 w-4" />
      case 'compliance':
        return <Shield className="h-4 w-4" />
      case 'investment_setup':
        return <CreditCard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const categoryData = [
    {
      id: 'onboarding',
      name: 'Account Onboarding',
      description: 'Complete your investor profile setup',
      ...categorySummary.onboarding
    },
    {
      id: 'compliance',
      name: 'Compliance & KYC',
      description: 'Required regulatory documentation',
      ...categorySummary.compliance
    },
    {
      id: 'investment_setup',
      name: 'Investment Setup',
      description: 'Vehicle subscriptions and commitments',
      ...categorySummary.investment_setup
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks & Onboarding</h1>
        <p className="text-gray-600 mt-1">
          Complete your required tasks to activate full portal access
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categoryData.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getCategoryIcon(category.id)}
                {category.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{category.completed} of {category.total} completed</span>
                  <span>{category.percentage}%</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
            <CardDescription>
              Complete these tasks to proceed with your onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority} priority
                        </Badge>
                        {task.estimated_minutes && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.estimated_minutes} min
                          </Badge>
                        )}
                        {task.due_at && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due {new Date(task.due_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Button size="sm">
                      {task.status === 'in_progress' ? 'Continue' : 'Start'}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
            <CardDescription>
              Tasks you&apos;ve successfully completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-700">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      {task.completed_at && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Completed {new Date(task.completed_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {pendingTasks.length === 0 && completedTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-600">
              You have no pending tasks at the moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-blue-900">Need Help?</div>
              <div className="text-sm text-blue-700">
                If you have questions about any task or need assistance with documentation,
                our team is here to help.
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Page renders with real database data
- [ ] Category progress displays correctly
- [ ] Empty states show when no tasks exist
- [ ] All UI components render properly

---

## Phase 3: API Routes (Priority: HIGH)

**Estimated Time:** 2-3 days
**Dependency:** Phase 1, 2 complete
**Blockers Removed:** Enables task completion and updates

### 3.1 Task Completion Endpoint

**File:** `versotech-portal/src/app/api/tasks/[id]/complete/route.ts`

**Tasks:**
- [ ] Create PATCH endpoint
- [ ] Validate user ownership
- [ ] Update task status
- [ ] Record completion metadata
- [ ] Return updated task

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Parse request body
  const body = await req.json()
  const { completion_reason = 'completed' } = body

  // 3. Verify task ownership and update
  const { data: task, error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completion_reason,
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single()

  if (updateError) {
    console.error('Task completion error:', updateError)
    return NextResponse.json(
      { error: 'Failed to complete task', details: updateError.message },
      { status: 500 }
    )
  }

  // 4. Create activity feed entry (if table exists)
  // Note: This assumes activity_feed table - implement if exists
  try {
    await supabase.from('activity_feed').insert({
      investor_id: task.owner_investor_id,
      activity_type: 'task',
      title: 'Task Completed',
      description: `${task.title} has been completed`,
      importance: 'low',
      read_status: false
    })
  } catch (err) {
    // Non-critical: log but don't fail request
    console.warn('Activity feed creation failed:', err)
  }

  return NextResponse.json({ task })
}
```

**Acceptance Criteria:**
- [ ] Only task owners can complete tasks
- [ ] Completion timestamp recorded
- [ ] completed_by tracks who completed it
- [ ] RLS policies enforce access control

---

### 3.2 Task Status Update Endpoint

**File:** `versotech-portal/src/app/api/tasks/[id]/route.ts`

**Tasks:**
- [ ] Create PATCH endpoint for general updates
- [ ] Support status transitions
- [ ] Add notes/metadata updates
- [ ] Validate state transitions

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'completed', 'waived'],
  in_progress: ['completed', 'pending', 'waived'],
  overdue: ['in_progress', 'completed', 'waived'],
  blocked: ['pending'], // Unlocked by system
  completed: [], // Cannot transition from completed
  waived: [] // Cannot transition from waived
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { status, notes } = body

  // 1. Get current task
  const { data: currentTask, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !currentTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // 2. Validate status transition
  if (status) {
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentTask.status] || []
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          current: currentTask.status,
          attempted: status,
          allowed: allowedTransitions
        },
        { status: 400 }
      )
    }
  }

  // 3. Build update object
  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (status) {
    updates.status = status

    // Set completion metadata if transitioning to completed
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
      updates.completed_by = user.id
      updates.completion_reason = 'completed'
    }
  }

  // 4. Execute update
  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Update failed', details: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ task: updatedTask })
}
```

**Acceptance Criteria:**
- [ ] Invalid status transitions rejected
- [ ] Metadata auto-populated on completion
- [ ] RLS policies respected
- [ ] Updated task returned

---

### 3.3 Bulk Operations (Staff Only)

**File:** `versotech-portal/src/app/api/tasks/bulk-complete/route.ts`

**Tasks:**
- [ ] Create POST endpoint
- [ ] Verify staff role
- [ ] Support batch completion
- [ ] Return count of updated tasks

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Authenticate and verify staff role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Parse request
  const { task_ids, completion_reason = 'completed' } = await req.json()

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json(
      { error: 'task_ids must be a non-empty array' },
      { status: 400 }
    )
  }

  // 3. Bulk update
  const { data: updatedTasks, error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completion_reason,
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      updated_at: new Date().toISOString()
    })
    .in('id', task_ids)
    .select()

  if (updateError) {
    return NextResponse.json(
      { error: 'Bulk update failed', details: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    completed: updatedTasks?.length || 0,
    tasks: updatedTasks
  })
}
```

**Acceptance Criteria:**
- [ ] Only staff can execute bulk operations
- [ ] Multiple tasks updated in single transaction
- [ ] Returns count and updated task list

---

### 3.4 Webhook Handler (External Integrations)

**File:** `versotech-portal/src/app/api/webhooks/task-completion/route.ts`

**Tasks:**
- [ ] Create POST webhook endpoint
- [ ] Verify HMAC signature
- [ ] Update task from external event
- [ ] Trigger dependent task unlocking

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/service-role'
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false

  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(req: NextRequest) {
  const supabase = createClient() // Service role client

  // 1. Verify signature
  const payload = await req.text()
  const signature = req.headers.get('x-verso-signature')

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  // 2. Parse payload
  const body = JSON.parse(payload)
  const {
    task_id,
    completion_reason = 'completed',
    related_entity_id,
    completed_by
  } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'task_id required' },
      { status: 400 }
    )
  }

  // 3. Update task
  const { data: task, error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completion_reason,
      completed_at: new Date().toISOString(),
      completed_by,
      related_entity_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)
    .select()
    .single()

  if (updateError) {
    console.error('Webhook task update failed:', updateError)
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    )
  }

  // 4. Unlock dependent tasks (handled by database trigger)
  // No action needed - unlock_dependent_tasks trigger handles this

  return NextResponse.json({ success: true, task })
}
```

**Acceptance Criteria:**
- [ ] HMAC signature verification works
- [ ] Invalid signatures rejected
- [ ] Task updated with external metadata
- [ ] Dependent tasks unlock automatically

---

## Phase 4: Client Interactivity (Priority: HIGH)

**Estimated Time:** 3-4 days
**Dependency:** Phase 1, 2, 3 complete
**Blockers Removed:** Enables full user experience

### 4.1 Real-Time Subscriptions

**File:** `versotech-portal/src/app/(investor)/versoholdings/tasks/tasks-page-client.tsx`

**Tasks:**
- [ ] Add Supabase real-time channel
- [ ] Subscribe to task updates
- [ ] Update UI on status changes
- [ ] Handle INSERT events for new tasks

**Implementation Addition:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// ... existing imports

export function TasksPageClient({
  userId,
  pendingTasks: initialPending,
  completedTasks: initialCompleted,
  categorySummary: initialSummary
}: TasksPageClientProps) {

  const [pendingTasks, setPendingTasks] = useState(initialPending)
  const [completedTasks, setCompletedTasks] = useState(initialCompleted)
  const [categorySummary, setCategorySummary] = useState(initialSummary)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to task changes
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `owner_user_id=eq.${userId}`
      }, (payload) => {
        console.log('Task change:', payload)

        if (payload.eventType === 'UPDATE') {
          const updatedTask = payload.new as Task

          // Update in pending or completed list
          setPendingTasks(prev =>
            prev.map(t => t.id === updatedTask.id ? updatedTask : t)
              .filter(t =>
                t.status === 'pending' ||
                t.status === 'in_progress' ||
                t.status === 'overdue'
              )
          )

          setCompletedTasks(prev => {
            const existing = prev.find(t => t.id === updatedTask.id)
            if (updatedTask.status === 'completed' || updatedTask.status === 'waived') {
              return existing
                ? prev.map(t => t.id === updatedTask.id ? updatedTask : t)
                : [...prev, updatedTask]
            }
            return prev.filter(t => t.id !== updatedTask.id)
          })

          // Recalculate category progress
          recalculateCategorySummary()
        }

        if (payload.eventType === 'INSERT') {
          const newTask = payload.new as Task
          if (newTask.status === 'pending' || newTask.status === 'in_progress') {
            setPendingTasks(prev => [newTask, ...prev])
          }
          recalculateCategorySummary()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  function recalculateCategorySummary() {
    // Fetch fresh task counts
    const supabase = createClient()

    supabase
      .from('tasks')
      .select('*')
      .eq('owner_user_id', userId)
      .then(({ data: tasks }) => {
        if (tasks) {
          setCategorySummary({
            onboarding: calculateProgress(tasks.filter(t => t.category === 'onboarding')),
            compliance: calculateProgress(tasks.filter(t => t.category === 'compliance')),
            investment_setup: calculateProgress(tasks.filter(t => t.category === 'investment_setup'))
          })
        }
      })
  }

  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] Real-time updates appear within 1 second
- [ ] Task status changes move between pending/completed
- [ ] Category progress updates automatically
- [ ] No memory leaks (cleanup on unmount)

---

### 4.2 Task Action Buttons

**File:** `versotech-portal/src/components/tasks/task-action-button.tsx`

**Tasks:**
- [ ] Create action button component
- [ ] Route to appropriate flow based on action type
- [ ] Handle document upload
- [ ] Handle e-sign launch
- [ ] Handle workflow triggers

**Implementation:**
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Upload, FileSignature, Workflow } from 'lucide-react'
import { useState } from 'react'

interface TaskAction {
  action_type: 'url_redirect' | 'document_upload' | 'esign_flow' | 'questionnaire' | 'n8n_workflow'
  action_config: {
    url?: string
    document_type?: string
    template_id?: string
    workflow_id?: string
  }
}

interface TaskActionButtonProps {
  taskId: string
  taskStatus: string
  taskActions?: TaskAction[]
  onComplete?: () => void
}

export function TaskActionButton({
  taskId,
  taskStatus,
  taskActions,
  onComplete
}: TaskActionButtonProps) {

  const [loading, setLoading] = useState(false)
  const action = taskActions?.[0]

  if (!action) {
    return (
      <Button size="sm" disabled>
        No Action Available
      </Button>
    )
  }

  const handleAction = async () => {
    setLoading(true)

    try {
      switch (action.action_type) {
        case 'url_redirect':
          if (action.action_config.url) {
            window.location.href = action.action_config.url
          }
          break

        case 'document_upload':
          // Open document upload modal
          // Implementation in Phase 4.3
          console.log('Open document upload modal')
          break

        case 'esign_flow':
          await launchESignFlow(taskId, action.action_config.template_id!)
          break

        case 'n8n_workflow':
          await launchWorkflow(taskId, action.action_config.workflow_id!)
          break

        case 'questionnaire':
          // Navigate to questionnaire
          window.location.href = `/versoholdings/questionnaire/${taskId}`
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonIcon = () => {
    switch (action.action_type) {
      case 'document_upload':
        return <Upload className="h-3 w-3 ml-2" />
      case 'esign_flow':
        return <FileSignature className="h-3 w-3 ml-2" />
      case 'n8n_workflow':
        return <Workflow className="h-3 w-3 ml-2" />
      default:
        return <ExternalLink className="h-3 w-3 ml-2" />
    }
  }

  const getButtonText = () => {
    if (taskStatus === 'in_progress') return 'Continue'

    switch (action.action_type) {
      case 'document_upload':
        return 'Upload'
      case 'esign_flow':
        return 'Sign'
      default:
        return 'Start'
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleAction}
      disabled={loading}
    >
      {loading ? 'Processing...' : getButtonText()}
      {!loading && getButtonIcon()}
    </Button>
  )
}

async function launchESignFlow(taskId: string, templateId: string) {
  const response = await fetch('/api/tasks/esign/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, template_id: templateId })
  })

  const { signing_url } = await response.json()
  window.location.href = signing_url
}

async function launchWorkflow(taskId: string, workflowId: string) {
  const response = await fetch('/api/workflows/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-idempotency-key': taskId
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      task_id: taskId
    })
  })

  const { run_id } = await response.json()
  console.log('Workflow started:', run_id)

  // Poll for completion or wait for webhook
  return run_id
}
```

**Acceptance Criteria:**
- [ ] Button text reflects action type
- [ ] Loading state shows during async operations
- [ ] E-sign redirects to external signing URL
- [ ] Workflows trigger successfully

---

### 4.3 Document Upload Modal

**File:** `versotech-portal/src/components/tasks/document-upload-modal.tsx`

**Tasks:**
- [ ] Create upload modal component
- [ ] Integrate with file upload service
- [ ] Mark task complete on success
- [ ] Show progress indicator

**Implementation:**
```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DocumentUploadModalProps {
  taskId: string
  documentType: string
  onComplete?: () => void
  children: React.ReactNode
}

export function DocumentUploadModal({
  taskId,
  documentType,
  onComplete,
  children
}: DocumentUploadModalProps) {

  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const supabase = createClient()

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${taskId}-${Date.now()}.${fileExt}`
      const filePath = `task-documents/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // 2. Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          type: documentType,
          file_key: filePath,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (docError) throw docError

      setUploadProgress(75)

      // 3. Complete task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          related_entity_type: 'document',
          related_entity_id: document.id
        })
        .eq('id', taskId)

      if (taskError) throw taskError

      setUploadProgress(100)
      setSuccess(true)

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setOpen(false)
        onComplete?.()
      }, 1500)

    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload your {documentType} to complete this task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!success && !uploading && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Select File</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PDF, JPG, or PNG (max 10MB)
              </p>
            </div>
          )}

          {uploading && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {success && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="font-semibold text-green-900">Upload Complete!</p>
              <p className="text-sm text-gray-600">Task marked as completed</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Acceptance Criteria:**
- [ ] File upload works with Supabase Storage
- [ ] Progress bar shows upload status
- [ ] Document record created in database
- [ ] Task marked complete automatically
- [ ] Error states handled gracefully

---

## Phase 5: Integrations & Automation (Priority: MEDIUM)

**Estimated Time:** 2-3 days
**Dependency:** Phase 1-4 complete
**Blockers Removed:** Enables full automation

### 5.1 Automated Task Creation

**File:** `versotech-portal/database/migrations/011_task_automation_triggers.sql`

**Tasks:**
- [ ] Create trigger on investor creation
- [ ] Create trigger on deal invitation
- [ ] Create trigger on allocation approval
- [ ] Seed initial task templates

**Implementation:**
```sql
BEGIN;

-- Seed task templates
INSERT INTO task_templates (kind, category, title, description, priority, estimated_minutes, default_due_days, trigger_event)
VALUES
  ('onboarding_profile', 'onboarding', 'Complete Investor Profile', 'Provide basic information about yourself or your entity', 'high', 10, 7, 'investor_created'),
  ('onboarding_bank_details', 'onboarding', 'Verify Banking Information', 'Confirm bank account for capital calls and distributions', 'high', 5, 14, 'investor_created'),
  ('kyc_individual', 'compliance', 'Upload Government-Issued ID', 'Provide passport or driver license for identity verification', 'high', 2, 7, 'investor_created'),
  ('compliance_nda', 'compliance', 'Sign VERSO Holdings NDA', 'Review and sign confidentiality agreement', 'high', 5, 7, 'investor_created'),
  ('deal_nda_signature', 'compliance', 'Sign Deal-Specific NDA', 'Review and sign NDA for this investment opportunity', 'high', 5, 3, 'deal_invitation'),
  ('investment_allocation_confirmation', 'investment_setup', 'Confirm Allocation', 'Review and confirm your allocation details', 'high', 5, 7, 'allocation_approved')
ON CONFLICT (kind) DO NOTHING;

-- Trigger: Auto-create tasks when investor is created
CREATE OR REPLACE FUNCTION trigger_onboarding_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get primary user for this investor
  SELECT user_id INTO v_user_id
  FROM investor_users
  WHERE investor_id = NEW.id
  LIMIT 1;

  -- Create onboarding tasks
  IF v_user_id IS NOT NULL THEN
    PERFORM create_tasks_from_templates(
      v_user_id,
      NEW.id,
      'investor_created'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER investors_create_onboarding_tasks
  AFTER INSERT ON investors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_onboarding_tasks();

-- Trigger: Create deal tasks when invited
CREATE OR REPLACE FUNCTION trigger_deal_invitation_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create deal-specific tasks
  PERFORM create_tasks_from_templates(
    NEW.user_id,
    NEW.investor_id,
    'deal_invitation'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER deal_memberships_create_tasks
  AFTER INSERT ON deal_memberships
  FOR EACH ROW
  WHEN (NEW.role = 'investor')
  EXECUTE FUNCTION trigger_deal_invitation_tasks();

COMMIT;
```

**Acceptance Criteria:**
- [ ] Tasks auto-create on investor signup
- [ ] Deal tasks create on invitation acceptance
- [ ] No duplicate tasks created
- [ ] Templates easily customizable

---

### 5.2 Overdue Detection Cron

**File:** `versotech-portal/src/app/api/cron/mark-overdue-tasks/route.ts`

**Tasks:**
- [ ] Create cron endpoint
- [ ] Call mark_overdue_tasks function
- [ ] Log execution results
- [ ] Set up Vercel Cron or external scheduler

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/service-role'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  try {
    // Call database function to mark overdue tasks
    const { data, error } = await supabase
      .rpc('mark_overdue_tasks')

    if (error) throw error

    const updatedCount = data?.[0]?.updated_count || 0

    console.log(`[Cron] Marked ${updatedCount} tasks as overdue`)

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Cron] Mark overdue failed:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**Vercel Cron Config (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/cron/mark-overdue-tasks",
    "schedule": "0 * * * *"
  }]
}
```

**Acceptance Criteria:**
- [ ] Cron runs hourly
- [ ] Tasks marked overdue when past due_at
- [ ] Execution logged for monitoring
- [ ] Protected by secret authorization

---

### 5.3 Email Notifications (Optional)

**File:** `versotech-portal/src/lib/notifications/task-notifications.ts`

**Tasks:**
- [ ] Create email template for task completion
- [ ] Create email template for overdue tasks
- [ ] Trigger emails on status changes
- [ ] Respect user notification preferences

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/service-role'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTaskCompletionEmail(taskId: string) {
  const supabase = createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      *,
      owner:profiles!owner_user_id(email, display_name)
    `)
    .eq('id', taskId)
    .single()

  if (!task || !task.owner?.email) return

  await resend.emails.send({
    from: 'VERSO Holdings <notifications@versoholdings.com>',
    to: task.owner.email,
    subject: `Task Completed: ${task.title}`,
    html: `
      <h2>Task Completed ✓</h2>
      <p>Your task "<strong>${task.title}</strong>" has been marked as completed.</p>
      <p>Completed on: ${new Date(task.completed_at).toLocaleDateString()}</p>
      <a href="https://portal.versoholdings.com/versoholdings/tasks">View All Tasks</a>
    `
  })
}

export async function sendOverdueTaskReminder(taskId: string) {
  const supabase = createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      *,
      owner:profiles!owner_user_id(email, display_name)
    `)
    .eq('id', taskId)
    .single()

  if (!task || !task.owner?.email) return

  await resend.emails.send({
    from: 'VERSO Holdings <notifications@versoholdings.com>',
    to: task.owner.email,
    subject: `Action Required: Overdue Task`,
    html: `
      <h2>⚠️ Overdue Task</h2>
      <p>Your task "<strong>${task.title}</strong>" is overdue.</p>
      <p>Due date: ${new Date(task.due_at).toLocaleDateString()}</p>
      <p>${task.description}</p>
      <a href="https://portal.versoholdings.com/versoholdings/tasks">Complete Now</a>
    `
  })
}
```

**Acceptance Criteria:**
- [ ] Emails sent on task completion
- [ ] Overdue reminders sent daily
- [ ] Email templates branded
- [ ] Unsubscribe links included

---

## Testing Strategy

### Unit Tests
- [ ] Task CRUD operations
- [ ] Status transition validation
- [ ] Category progress calculation
- [ ] RLS policy enforcement

### Integration Tests
- [ ] Task creation from templates
- [ ] Dependency unlock flow
- [ ] Webhook processing
- [ ] Real-time subscription updates

### E2E Tests
- [ ] Complete onboarding flow
- [ ] Document upload task
- [ ] E-sign task completion
- [ ] Task list real-time updates

---

## Deployment Checklist

- [ ] Run all database migrations
- [ ] Seed task templates
- [ ] Configure webhook secrets
- [ ] Set up cron jobs
- [ ] Test RLS policies in production
- [ ] Monitor task creation rates
- [ ] Set up error tracking (Sentry)
- [ ] Document API endpoints
- [ ] Train staff on task management
- [ ] Create user documentation

---

## Success Metrics

**Week 1 Post-Launch:**
- [ ] >90% of new investors receive automated tasks
- [ ] <5% task creation errors
- [ ] Average task completion time <7 days

**Month 1:**
- [ ] 50% reduction in manual reminder emails
- [ ] >80% onboarding task completion rate
- [ ] <10% overdue tasks older than 7 days

**Quarter 1:**
- [ ] Average onboarding time <14 days (down from 30)
- [ ] Investor satisfaction score >4.5/5
- [ ] Zero RLS policy violations

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration fails | High | Test on staging, have rollback script |
| RLS policies too restrictive | Medium | Comprehensive testing matrix |
| Real-time subscriptions unstable | Medium | Fallback to polling, add retry logic |
| Webhook signature verification bugs | High | Unit tests, staging webhook testing |
| Task template logic errors | High | Manual QA before auto-creation enabled |

---

## Support & Rollback

**Rollback Plan:**
- Migration 007-011 can be rolled back independently
- Task creation triggers can be disabled without data loss
- Frontend can revert to mockup mode if API fails

**Support Documentation:**
- API endpoint documentation → `/docs/api/tasks.md`
- Task template guide → `/docs/guides/task-templates.md`
- Troubleshooting → `/docs/troubleshooting/tasks.md`

---

**Document Version:** 1.0
**Last Updated:** October 2, 2025
**Owner:** Engineering Team
**Status:** Ready for Implementation
