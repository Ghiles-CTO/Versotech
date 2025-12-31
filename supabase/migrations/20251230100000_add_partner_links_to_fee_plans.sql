-- Migration: Add partner/introducer/arranger links to fee_plans
-- Purpose: Enable fee plans to be assigned to specific partners, introducers, and arrangers
-- This fixes the schema gap where API code references these columns but they don't exist

-- Add entity reference columns
ALTER TABLE fee_plans
ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS introducer_id uuid REFERENCES introducers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commercial_partner_id uuid REFERENCES commercial_partners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_arranger_id uuid REFERENCES arranger_entities(id) ON DELETE SET NULL;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_fee_plans_partner_id ON fee_plans(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fee_plans_introducer_id ON fee_plans(introducer_id) WHERE introducer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fee_plans_commercial_partner_id ON fee_plans(commercial_partner_id) WHERE commercial_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fee_plans_created_by_arranger_id ON fee_plans(created_by_arranger_id) WHERE created_by_arranger_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN fee_plans.partner_id IS 'Reference to partner entity this fee plan is assigned to';
COMMENT ON COLUMN fee_plans.introducer_id IS 'Reference to introducer entity this fee plan is assigned to';
COMMENT ON COLUMN fee_plans.commercial_partner_id IS 'Reference to commercial partner entity this fee plan is assigned to';
COMMENT ON COLUMN fee_plans.created_by_arranger_id IS 'Reference to arranger entity that created this fee plan';

-- Update RLS policies to allow arrangers to manage their own fee plans

-- Drop existing arranger policy if it exists (idempotent)
DROP POLICY IF EXISTS "arrangers_manage_own_fee_plans" ON fee_plans;

-- Arrangers can view fee plans they created or that are assigned to their partners
CREATE POLICY "arrangers_view_fee_plans" ON fee_plans
FOR SELECT USING (
  -- Arranger created this plan
  created_by_arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  -- OR fee plan is linked to a deal the arranger manages
  OR deal_id IN (
    SELECT d.id FROM deals d
    JOIN arranger_users au ON au.arranger_id = d.arranger_entity_id
    WHERE au.user_id = auth.uid()
  )
  -- OR existing staff access
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
  )
);

-- Arrangers can insert fee plans for their entities
DROP POLICY IF EXISTS "arrangers_insert_fee_plans" ON fee_plans;
CREATE POLICY "arrangers_insert_fee_plans" ON fee_plans
FOR INSERT WITH CHECK (
  -- Must set created_by_arranger_id to their arranger entity
  created_by_arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  -- OR staff can insert
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
  )
);

-- Arrangers can update their own fee plans
DROP POLICY IF EXISTS "arrangers_update_fee_plans" ON fee_plans;
CREATE POLICY "arrangers_update_fee_plans" ON fee_plans
FOR UPDATE USING (
  created_by_arranger_id IN (
    SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
  )
);
