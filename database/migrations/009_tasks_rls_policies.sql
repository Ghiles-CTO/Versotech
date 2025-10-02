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
