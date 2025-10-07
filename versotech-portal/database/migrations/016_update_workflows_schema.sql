-- Align existing workflows schema with Process Center requirements
-- Alters legacy columns instead of recreating tables

-- Rename legacy columns where necessary
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'schema'
  ) THEN
    ALTER TABLE workflows RENAME COLUMN schema TO input_schema;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'allowed_titles'
  ) THEN
    ALTER TABLE workflows RENAME COLUMN allowed_titles TO required_title;
  END IF;
END $$;

-- Ensure new columns exist on workflows table
ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS required_role text,
  ADD COLUMN IF NOT EXISTS required_title text[],
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE workflows
  ALTER COLUMN input_schema TYPE jsonb USING COALESCE(input_schema, '{}'::jsonb),
  ALTER COLUMN input_schema SET DEFAULT '{}'::jsonb;

-- Backfill names/descriptions/categories for known workflow keys
UPDATE workflows
SET
  name = COALESCE(name, INITCAP(REPLACE(key, '-', ' '))),
  description = COALESCE(description, 'Updated workflow definition'),
  category = COALESCE(category, 'data_processing')
WHERE name IS NULL OR description IS NULL OR category IS NULL;

-- Add category constraint after backfill
ALTER TABLE workflows
  ADD CONSTRAINT workflows_category_check
  CHECK (
    category IS NULL OR category IN (
      'documents',
      'compliance',
      'communications',
      'data_processing',
      'multi_step'
    )
  ) NOT VALID;

-- Ensure workflows updated_at timestamp maintained
CREATE OR REPLACE FUNCTION set_workflows_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflows_set_updated_at ON workflows;
CREATE TRIGGER workflows_set_updated_at
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION set_workflows_updated_at();

-- Ensure workflow_runs structure matches expectations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_runs' AND column_name = 'payload'
  ) THEN
    ALTER TABLE workflow_runs RENAME COLUMN payload TO input_params;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_runs' AND column_name = 'result_ref'
  ) THEN
    ALTER TABLE workflow_runs RENAME COLUMN result_ref TO result_doc_id;
  END IF;
END $$;

ALTER TABLE workflow_runs
  ADD COLUMN IF NOT EXISTS workflow_key text,
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS output_data jsonb,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS webhook_signature text,
  ADD COLUMN IF NOT EXISTS idempotency_token text,
  ADD COLUMN IF NOT EXISTS queued_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_ms integer,
  ADD COLUMN IF NOT EXISTS created_tasks uuid[];

ALTER TABLE workflow_runs
  ALTER COLUMN input_params TYPE jsonb USING COALESCE(input_params, '{}'::jsonb),
  ALTER COLUMN input_params SET DEFAULT '{}'::jsonb;

-- Create workflow_run_logs table if it does not exist
CREATE TABLE IF NOT EXISTS workflow_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id uuid REFERENCES workflow_runs(id) ON DELETE CASCADE NOT NULL,
  step_name text NOT NULL,
  step_status text
    CHECK (step_status IN ('started', 'completed', 'failed', 'skipped')),
  log_level text
    CHECK (log_level IN ('debug', 'info', 'warn', 'error'))
    DEFAULT 'info',
  message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_workflows_key ON workflows(key);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_key ON workflow_runs(workflow_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_triggered_by ON workflow_runs(triggered_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_idempotency ON workflow_runs(idempotency_token) WHERE idempotency_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_run_logs_workflow_run_id ON workflow_run_logs(workflow_run_id, created_at);


