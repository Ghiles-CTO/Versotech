-- Add CHECK constraint to ensure workflow signing lock fields are consistent
-- Purpose: Prevent orphaned lock states where signing_in_progress is TRUE but signing_locked_by is NULL
-- Context: This can happen if a signature_request is deleted (FK has ON DELETE SET NULL)
--          The CHECK constraint ensures database-level enforcement of lock consistency

-- Add CHECK constraint to enforce lock field consistency
ALTER TABLE workflow_runs
  ADD CONSTRAINT workflow_signing_lock_consistency CHECK (
    -- Either all lock fields are set (locked state)
    (
      signing_in_progress = true
      AND signing_locked_by IS NOT NULL
      AND signing_locked_at IS NOT NULL
    )
    OR
    -- Or all lock fields are NULL/false (unlocked state)
    (
      (signing_in_progress IS NULL OR signing_in_progress = false)
      AND signing_locked_by IS NULL
      AND signing_locked_at IS NULL
    )
  );

-- Add comment to document the constraint purpose
COMMENT ON CONSTRAINT workflow_signing_lock_consistency ON workflow_runs IS
  'Ensures workflow signing lock fields are consistent: either all locked fields are set, or all are NULL/false. Prevents orphaned lock states.';
