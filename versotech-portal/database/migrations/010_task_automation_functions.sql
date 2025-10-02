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
