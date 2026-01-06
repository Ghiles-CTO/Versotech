-- Migration: Add term_sheet_id to deal_memberships
-- Purpose: Track which term sheet an investor was dispatched with
-- Reference: Fee System Transformation - Fred's requirements
--
-- Business Logic:
-- - When dispatching investors, staff selects which term sheet applies
-- - Different investor classes (e.g., Class A vs Class B) get different term sheets
-- - The investor's opportunity page shows ONLY their assigned term sheet
-- - Fee plans are linked to term sheets, so this enables proper commission tracking

-- Add the foreign key column
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS term_sheet_id uuid REFERENCES deal_fee_structures(id) ON DELETE SET NULL;

-- Create partial index for efficient lookups (only on non-null values)
CREATE INDEX IF NOT EXISTS idx_deal_memberships_term_sheet
ON deal_memberships(term_sheet_id)
WHERE term_sheet_id IS NOT NULL;

-- Add documentation
COMMENT ON COLUMN deal_memberships.term_sheet_id IS
'Term sheet assigned when investor was dispatched. Determines:
1. Which fee structure the investor sees on their opportunity page
2. Which fee plans are available (fee plans are linked to term sheets)
3. Commission calculations via assigned_fee_plan_id → term_sheet relationship
Required when dispatching investors. Null for legacy memberships (fallback to first published term sheet).';
