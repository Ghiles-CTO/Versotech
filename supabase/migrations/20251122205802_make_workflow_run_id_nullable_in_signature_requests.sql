-- Make workflow_run_id nullable for manually uploaded documents
-- Add subscription_id and document_id for direct linking

-- Drop the existing foreign key constraint (if it exists)
ALTER TABLE signature_requests
DROP CONSTRAINT IF EXISTS signature_requests_workflow_run_id_fkey;

-- Make workflow_run_id nullable
ALTER TABLE signature_requests
ALTER COLUMN workflow_run_id DROP NOT NULL;

-- Add new columns for manual document uploads
ALTER TABLE signature_requests
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

ALTER TABLE signature_requests
ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- Re-add foreign key constraint as nullable
ALTER TABLE signature_requests
ADD CONSTRAINT signature_requests_workflow_run_id_fkey
  FOREIGN KEY (workflow_run_id)
  REFERENCES workflow_runs(id)
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signature_requests_subscription_id
  ON signature_requests(subscription_id);

CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id
  ON signature_requests(document_id);

-- Add comment explaining the change
COMMENT ON COLUMN signature_requests.workflow_run_id IS 'Optional workflow run ID - only populated for n8n generated documents. NULL for manually uploaded documents.';
COMMENT ON COLUMN signature_requests.subscription_id IS 'Direct link to subscription for manually uploaded subscription packs';
COMMENT ON COLUMN signature_requests.document_id IS 'Direct link to document being signed';
