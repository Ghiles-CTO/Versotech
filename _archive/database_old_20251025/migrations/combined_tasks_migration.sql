-- Migration 007: Enhance tasks table per Tasks & Onboarding PRD requirements
-- This migration extends the existing tasks table with comprehensive task management fields

BEGIN;

-- Add new columns to existing tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS owner_investor_id uuid REFERENCES investors(id),
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS estimated_minutes int,
  ADD COLUMN IF NOT EXISTS completion_reason text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Make title NOT NULL with default for existing rows
UPDATE tasks SET title = 'Untitled Task' WHERE title IS NULL;
ALTER TABLE tasks ALTER COLUMN title SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN title SET DEFAULT 'Untitled Task';

-- Update status field to have better default
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';

-- Add check constraints for enums
DO $$
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_kind_check') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_kind_check;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_category_check') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_category_check;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_priority_check;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_status_check') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_status_check;
    END IF;
END $$;

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
    'waived',
    'blocked'
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

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE tasks IS 'Task management for investor onboarding, compliance, and deal-specific actions';
COMMENT ON COLUMN tasks.owner_user_id IS 'User who owns this task';
COMMENT ON COLUMN tasks.owner_investor_id IS 'Investor entity associated with this task';
COMMENT ON COLUMN tasks.kind IS 'Specific task type (maps to task_templates)';
COMMENT ON COLUMN tasks.category IS 'High-level category: onboarding, compliance, or investment_setup';
COMMENT ON COLUMN tasks.title IS 'Human-readable task title';
COMMENT ON COLUMN tasks.description IS 'Detailed task description and instructions';
COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, high';
COMMENT ON COLUMN tasks.status IS 'Current task status';
COMMENT ON COLUMN tasks.due_at IS 'Recommended completion deadline';
COMMENT ON COLUMN tasks.estimated_minutes IS 'Expected time to complete task';
COMMENT ON COLUMN tasks.related_entity_type IS 'Type of linked entity: document, deal, workflow_run, esign_envelope';
COMMENT ON COLUMN tasks.related_entity_id IS 'ID of the related entity';
COMMENT ON COLUMN tasks.completion_reason IS 'Reason for completion: completed, waived, automated';
COMMENT ON COLUMN tasks.completed_at IS 'Timestamp when task was completed';
COMMENT ON COLUMN tasks.completed_by IS 'User who completed the task';

COMMIT;
-- Migration 008: Create supporting tables for task management system
-- Creates task_templates, task_actions, and task_dependencies tables

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
  default_due_days int, -- Days from creation to set due_at
  prerequisite_task_kinds text[], -- Array of task kinds that must complete first
  trigger_event text, -- Event that triggers task creation: 'investor_created', 'deal_invitation', 'allocation_approved'
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
  action_config jsonb, -- Configuration object: { url, workflow_id, template_id, document_type, etc. }
  PRIMARY KEY (task_id),

  CONSTRAINT task_actions_type_check CHECK (action_type IN (
    'url_redirect',
    'document_upload',
    'esign_flow',
    'questionnaire',
    'n8n_workflow'
  ))
);

-- Task Dependencies (sequencing and prerequisites)
CREATE TABLE IF NOT EXISTS task_dependencies (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_task_id),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_templates_trigger_event
  ON task_templates(trigger_event);

CREATE INDEX IF NOT EXISTS idx_task_templates_kind
  ON task_templates(kind);

CREATE INDEX IF NOT EXISTS idx_task_actions_task_id
  ON task_actions(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id
  ON task_dependencies(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on
  ON task_dependencies(depends_on_task_id);

-- Add helpful comments
COMMENT ON TABLE task_templates IS 'Reusable task definitions for automated task creation';
COMMENT ON COLUMN task_templates.kind IS 'Unique identifier for this task template (must match tasks.kind)';
COMMENT ON COLUMN task_templates.trigger_event IS 'Event that triggers instantiation of this template';
COMMENT ON COLUMN task_templates.prerequisite_task_kinds IS 'Array of task kinds that must be completed before this task becomes available';
COMMENT ON COLUMN task_templates.default_due_days IS 'Number of days after creation when task should be due';

COMMENT ON TABLE task_actions IS 'Defines what action happens when a task is started/continued';
COMMENT ON COLUMN task_actions.action_type IS 'Type of action: url_redirect, document_upload, esign_flow, questionnaire, n8n_workflow';
COMMENT ON COLUMN task_actions.action_config IS 'JSON configuration for the action (URLs, IDs, parameters)';

COMMENT ON TABLE task_dependencies IS 'Defines prerequisite relationships between tasks';
COMMENT ON COLUMN task_dependencies.task_id IS 'The task that has a dependency';
COMMENT ON COLUMN task_dependencies.depends_on_task_id IS 'The task that must be completed first';

COMMIT;
-- Migration 009: Row Level Security policies for task management tables
-- Ensures investors see only their tasks, staff see all tasks

BEGIN;

-- Enable RLS on all task-related tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migration)
DROP POLICY IF EXISTS tasks_investor_read ON tasks;
DROP POLICY IF EXISTS tasks_update ON tasks;
DROP POLICY IF EXISTS tasks_staff_insert ON tasks;
DROP POLICY IF EXISTS tasks_staff_delete ON tasks;
DROP POLICY IF EXISTS task_templates_read ON task_templates;
DROP POLICY IF EXISTS task_templates_staff_write ON task_templates;
DROP POLICY IF EXISTS task_actions_read ON task_actions;
DROP POLICY IF EXISTS task_actions_staff_write ON task_actions;
DROP POLICY IF EXISTS task_dependencies_read ON task_dependencies;
DROP POLICY IF EXISTS task_dependencies_staff_write ON task_dependencies;

-- ==========================================
-- TASKS TABLE POLICIES
-- ==========================================

-- Investors and staff can read tasks
CREATE POLICY tasks_investor_read ON tasks FOR SELECT
USING (
  -- User owns the task directly
  owner_user_id = auth.uid()
  OR (
    -- User is linked to the investor entity that owns the task
    owner_investor_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM investor_users iu
      WHERE iu.investor_id = tasks.owner_investor_id
        AND iu.user_id = auth.uid()
    )
  )
  OR (
    -- User is staff (can see all tasks)
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
    )
  )
);

-- Investors and staff can update their own tasks
CREATE POLICY tasks_update ON tasks FOR UPDATE
USING (
  -- User owns the task
  owner_user_id = auth.uid()
  OR (
    -- User is linked to the investor entity
    EXISTS (
      SELECT 1 FROM investor_users iu
      WHERE iu.investor_id = tasks.owner_investor_id
        AND iu.user_id = auth.uid()
    )
  )
  OR (
    -- Staff can update any task
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
    )
  )
);

-- Only staff can insert new tasks
CREATE POLICY tasks_staff_insert ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- Only staff can delete tasks
CREATE POLICY tasks_staff_delete ON tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- ==========================================
-- TASK TEMPLATES POLICIES
-- ==========================================

-- All authenticated users can read templates
CREATE POLICY task_templates_read ON task_templates FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admin and ops staff can manage templates
CREATE POLICY task_templates_staff_write ON task_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops')
  )
);

-- ==========================================
-- TASK ACTIONS POLICIES
-- ==========================================

-- Users can read actions for tasks they can see
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

-- Only staff can write task actions
CREATE POLICY task_actions_staff_write ON task_actions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- ==========================================
-- TASK DEPENDENCIES POLICIES
-- ==========================================

-- Users can read dependencies for tasks they can see
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

-- Only staff can manage task dependencies
CREATE POLICY task_dependencies_staff_write ON task_dependencies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

COMMIT;
-- Migration 010: Task automation functions and triggers
-- Creates functions for automated task creation, overdue detection, and dependency management

BEGIN;

-- ==========================================
-- FUNCTION: Create tasks from templates on trigger events
-- ==========================================

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
      -- If task has prerequisites, mark as blocked initially
      WHEN tt.prerequisite_task_kinds IS NOT NULL AND array_length(tt.prerequisite_task_kinds, 1) > 0
        THEN 'blocked'
      ELSE 'pending'
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

COMMENT ON FUNCTION create_tasks_from_templates IS
  'Creates tasks for a user/investor from templates matching a trigger event. Prevents duplicate tasks.';

-- ==========================================
-- FUNCTION: Mark overdue tasks (run via cron)
-- ==========================================

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

COMMENT ON FUNCTION mark_overdue_tasks IS
  'Marks pending/in_progress tasks as overdue if past due date. Run via cron hourly.';

-- ==========================================
-- FUNCTION: Unlock dependent tasks when prerequisite completes
-- ==========================================

CREATE OR REPLACE FUNCTION unlock_dependent_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if task was just completed
  IF NEW.status IN ('completed', 'waived') AND OLD.status NOT IN ('completed', 'waived') THEN

    -- Find tasks that depend on this one and check if all their dependencies are met
    UPDATE tasks t
    SET status = 'pending'
    WHERE t.id IN (
      SELECT td.task_id
      FROM task_dependencies td
      WHERE td.depends_on_task_id = NEW.id
        -- Check if ALL dependencies for this task are now complete
        AND NOT EXISTS (
          SELECT 1
          FROM task_dependencies td2
          JOIN tasks t2 ON t2.id = td2.depends_on_task_id
          WHERE td2.task_id = td.task_id
            AND td2.depends_on_task_id != NEW.id  -- Exclude the just-completed task
            AND t2.status NOT IN ('completed', 'waived')
        )
    )
    AND t.status = 'blocked';

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION unlock_dependent_tasks IS
  'Automatically unlocks tasks when all dependencies are completed. Triggered on task update.';

-- ==========================================
-- TRIGGER: Auto-unlock dependent tasks
-- ==========================================

DROP TRIGGER IF EXISTS tasks_unlock_dependents ON tasks;
CREATE TRIGGER tasks_unlock_dependents
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION unlock_dependent_tasks();

-- ==========================================
-- HELPER FUNCTION: Get task progress by category
-- ==========================================

CREATE OR REPLACE FUNCTION get_task_progress_by_category(
  p_user_id uuid,
  p_investor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  category text,
  total_tasks bigint,
  completed_tasks bigint,
  percentage numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.category,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived')) as completed_tasks,
    ROUND(
      (COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived'))::numeric / COUNT(*)::numeric) * 100,
      0
    ) as percentage
  FROM tasks t
  WHERE t.owner_user_id = p_user_id
    AND (p_investor_id IS NULL OR t.owner_investor_id = p_investor_id)
    AND t.category IS NOT NULL
  GROUP BY t.category;
$$;

COMMENT ON FUNCTION get_task_progress_by_category IS
  'Returns task completion statistics grouped by category for a given user/investor.';

COMMIT;
