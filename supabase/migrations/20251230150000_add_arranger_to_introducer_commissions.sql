-- Migration: Add arranger scoping to introducer_commissions
-- Purpose: Enable arrangers to manage commissions for their network of introducers
-- Pattern: Mirrors partner_commissions table structure

-- ============================================================================
-- COLUMN ADDITIONS
-- ============================================================================

-- Add arranger_id for arranger-scoped commission management
ALTER TABLE introducer_commissions
ADD COLUMN IF NOT EXISTS arranger_id uuid REFERENCES arranger_entities(id);

-- Add fee_plan_id for linking to specific fee plans
ALTER TABLE introducer_commissions
ADD COLUMN IF NOT EXISTS fee_plan_id uuid REFERENCES fee_plans(id);

-- Add updated_at for tracking modifications
ALTER TABLE introducer_commissions
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for arranger-scoped queries (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_introducer_commissions_arranger_id
ON introducer_commissions(arranger_id);

-- Index for fee plan lookups
CREATE INDEX IF NOT EXISTS idx_introducer_commissions_fee_plan_id
ON introducer_commissions(fee_plan_id);

-- Composite index for arranger + status queries (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_introducer_commissions_arranger_status
ON introducer_commissions(arranger_id, status);

-- Composite index for arranger + introducer queries
CREATE INDEX IF NOT EXISTS idx_introducer_commissions_arranger_introducer
ON introducer_commissions(arranger_id, introducer_id);

-- ============================================================================
-- RLS POLICIES FOR ARRANGERS
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE introducer_commissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Arrangers can view their introducer commissions" ON introducer_commissions;
DROP POLICY IF EXISTS "Arrangers can insert their introducer commissions" ON introducer_commissions;
DROP POLICY IF EXISTS "Arrangers can update their introducer commissions" ON introducer_commissions;

-- Arrangers can view commissions they created (via arranger_id)
CREATE POLICY "Arrangers can view their introducer commissions"
ON introducer_commissions FOR SELECT
USING (
  arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  OR
  -- Also allow staff to view all
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff_admin', 'staff_ops', 'ceo')
  )
);

-- Arrangers can insert commissions for their network
CREATE POLICY "Arrangers can insert their introducer commissions"
ON introducer_commissions FOR INSERT
WITH CHECK (
  arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  OR
  -- Staff can also insert
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff_admin', 'staff_ops', 'ceo')
  )
);

-- Arrangers can update commissions they created
CREATE POLICY "Arrangers can update their introducer commissions"
ON introducer_commissions FOR UPDATE
USING (
  arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  OR
  -- Staff can also update
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff_admin', 'staff_ops', 'ceo')
  )
);

-- Staff can delete (for corrections only)
DROP POLICY IF EXISTS "Staff can delete introducer commissions" ON introducer_commissions;
CREATE POLICY "Staff can delete introducer commissions"
ON introducer_commissions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff_admin', 'ceo')
  )
);

-- ============================================================================
-- TRIGGER FOR updated_at
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_introducer_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_introducer_commissions_updated_at ON introducer_commissions;

-- Create trigger
CREATE TRIGGER set_introducer_commissions_updated_at
  BEFORE UPDATE ON introducer_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_introducer_commissions_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN introducer_commissions.arranger_id IS
  'The arranger entity that created/manages this commission. Enables arranger-scoped RLS.';

COMMENT ON COLUMN introducer_commissions.fee_plan_id IS
  'Optional link to a specific fee plan used to calculate this commission.';

COMMENT ON COLUMN introducer_commissions.updated_at IS
  'Timestamp of last modification, auto-updated via trigger.';
