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
