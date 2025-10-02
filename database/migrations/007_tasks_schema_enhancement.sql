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
