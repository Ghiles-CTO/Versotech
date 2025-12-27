-- Migration: Add arranger support to introducer_agreements
-- This allows arrangers to create and manage introducer agreements

-- Add arranger_id column to link agreements to arrangers
ALTER TABLE introducer_agreements
ADD COLUMN IF NOT EXISTS arranger_id uuid REFERENCES arranger_entities(id);

-- Add arranger signature request tracking
ALTER TABLE introducer_agreements
ADD COLUMN IF NOT EXISTS arranger_signature_request_id uuid REFERENCES signature_requests(id);

-- Add indexes for arranger lookups
CREATE INDEX IF NOT EXISTS idx_introducer_agreements_arranger_id
ON introducer_agreements(arranger_id) WHERE arranger_id IS NOT NULL;

-- Add comment explaining the signing flow
COMMENT ON COLUMN introducer_agreements.arranger_id IS
'Optional arranger linked to this agreement. If set, arranger signs first instead of CEO.';

COMMENT ON COLUMN introducer_agreements.arranger_signature_request_id IS
'Signature request ID for arranger signing. Used when arranger_id is set.';

-- Update RLS policies to allow arrangers to view/manage their agreements
-- Note: RLS policies may need further customization based on security requirements

-- Policy for arrangers to view their own agreements
DROP POLICY IF EXISTS "Arrangers can view own agreements" ON introducer_agreements;
CREATE POLICY "Arrangers can view own agreements" ON introducer_agreements
FOR SELECT
USING (
  arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
);

-- Policy for arrangers to update their own agreements (limited fields)
DROP POLICY IF EXISTS "Arrangers can update own draft agreements" ON introducer_agreements;
CREATE POLICY "Arrangers can update own draft agreements" ON introducer_agreements
FOR UPDATE
USING (
  status = 'draft' AND
  arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
);
