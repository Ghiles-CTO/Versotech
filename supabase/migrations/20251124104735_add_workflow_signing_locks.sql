-- Add workflow-level signature locking columns
-- Purpose: Prevent race conditions during progressive signing (multi-party signatures)
-- Context: When multiple parties sign the same document, we need to ensure only one
--          signing operation happens at a time to prevent PDF corruption and data races

-- Add three columns for managing signature workflow locks
ALTER TABLE workflow_runs
  ADD COLUMN IF NOT EXISTS signing_in_progress BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS signing_locked_by UUID REFERENCES signature_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS signing_locked_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for efficient lock queries
-- Partial index only on locked rows for optimal performance
CREATE INDEX IF NOT EXISTS idx_workflow_runs_signing_lock
  ON workflow_runs(signing_in_progress, signing_locked_at)
  WHERE signing_in_progress IS NOT NULL;

-- Add documentation comments
COMMENT ON COLUMN workflow_runs.signing_in_progress IS
  'Lock flag for progressive signing. TRUE when a signature is being processed, NULL when available. Used to prevent race conditions.';

COMMENT ON COLUMN workflow_runs.signing_locked_by IS
  'References the signature_request that currently holds the lock. NULL when unlocked. FK constraint ensures referential integrity.';

COMMENT ON COLUMN workflow_runs.signing_locked_at IS
  'Timestamp when the lock was acquired. Used for detecting stale locks and debugging race conditions.';
