-- Migration: Create commercial_partner_commissions table
-- Purpose: Track commissions/fees owed to commercial partners for their referrals
-- Pattern: Mirrors partner_commissions table structure

-- ============================================================================
-- PART 1: Create the commercial_partner_commissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.commercial_partner_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    commercial_partner_id uuid NOT NULL REFERENCES public.commercial_partners(id) ON DELETE CASCADE,
    deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
    investor_id uuid REFERENCES public.investors(id) ON DELETE SET NULL,
    arranger_id uuid NOT NULL REFERENCES public.arranger_entities(id) ON DELETE CASCADE,
    fee_plan_id uuid REFERENCES public.fee_plans(id) ON DELETE SET NULL,
    basis_type text,
    rate_bps integer NOT NULL DEFAULT 0,
    base_amount numeric(18,2),
    accrual_amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'USD',
    status text DEFAULT 'accrued',
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
    paid_at timestamptz,
    approved_by uuid REFERENCES public.profiles(id),
    approved_at timestamptz,
    payment_due_date date,
    payment_reference text,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints matching partner_commissions pattern
    CONSTRAINT cp_commissions_base_amount_check CHECK (base_amount IS NULL OR base_amount >= 0),
    CONSTRAINT cp_commissions_accrual_amount_check CHECK (accrual_amount >= 0),
    CONSTRAINT cp_commissions_basis_type_check CHECK (basis_type IN ('invested_amount', 'spread', 'management_fee', 'performance_fee')),
    CONSTRAINT cp_commissions_status_check CHECK (status IN ('accrued', 'invoice_requested', 'invoiced', 'paid', 'cancelled'))
);

-- Set ownership
ALTER TABLE public.commercial_partner_commissions OWNER TO postgres;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_cp_commissions_cp_id ON commercial_partner_commissions(commercial_partner_id);
CREATE INDEX IF NOT EXISTS idx_cp_commissions_deal_id ON commercial_partner_commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_cp_commissions_investor_id ON commercial_partner_commissions(investor_id);
CREATE INDEX IF NOT EXISTS idx_cp_commissions_arranger_id ON commercial_partner_commissions(arranger_id);
CREATE INDEX IF NOT EXISTS idx_cp_commissions_status ON commercial_partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_cp_commissions_deal_investor ON commercial_partner_commissions(deal_id, investor_id);

-- Add comments for documentation
COMMENT ON TABLE commercial_partner_commissions IS 'Tracks commissions/fees owed to commercial partners for investor referrals';
COMMENT ON COLUMN commercial_partner_commissions.commercial_partner_id IS 'Commercial partner entity receiving this commission';
COMMENT ON COLUMN commercial_partner_commissions.arranger_id IS 'Arranger entity responsible for this commission';
COMMENT ON COLUMN commercial_partner_commissions.basis_type IS 'What the commission is based on: invested_amount, spread, management_fee, performance_fee';
COMMENT ON COLUMN commercial_partner_commissions.rate_bps IS 'Commission rate in basis points (100 bps = 1%)';
COMMENT ON COLUMN commercial_partner_commissions.base_amount IS 'The base amount the commission is calculated from';
COMMENT ON COLUMN commercial_partner_commissions.accrual_amount IS 'The calculated commission amount';
COMMENT ON COLUMN commercial_partner_commissions.status IS 'Workflow status: accrued -> invoice_requested -> invoiced -> paid';

-- Enable Row Level Security
ALTER TABLE commercial_partner_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Arrangers can view commissions for CPs on their deals
CREATE POLICY "arrangers_view_cp_commissions" ON commercial_partner_commissions
FOR SELECT USING (
    -- Arranger can see if they manage this commission
    arranger_id IN (
        SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
    )
    -- OR the commission is for a deal they manage
    OR deal_id IN (
        SELECT d.id FROM deals d
        JOIN arranger_users au ON au.arranger_id = d.arranger_entity_id
        WHERE au.user_id = auth.uid()
    )
    -- OR staff access
    OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
    )
    -- OR commercial partner can see their own commissions
    OR commercial_partner_id IN (
        SELECT commercial_partner_id FROM commercial_partner_users WHERE user_id = auth.uid()
    )
);

-- RLS Policy: Arrangers can insert commissions for their CPs
CREATE POLICY "arrangers_insert_cp_commissions" ON commercial_partner_commissions
FOR INSERT WITH CHECK (
    -- Arranger creating for their entity
    arranger_id IN (
        SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
    )
    -- OR staff
    OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
    )
);

-- RLS Policy: Arrangers can update their commissions (status changes)
CREATE POLICY "arrangers_update_cp_commissions" ON commercial_partner_commissions
FOR UPDATE USING (
    arranger_id IN (
        SELECT arranger_id FROM arranger_users WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
    )
);

-- RLS Policy: Staff can delete (for corrections)
CREATE POLICY "staff_delete_cp_commissions" ON commercial_partner_commissions
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops')
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON commercial_partner_commissions TO authenticated;
GRANT DELETE ON commercial_partner_commissions TO authenticated;

-- Create trigger for updated_at
CREATE TRIGGER update_cp_commissions_updated_at
    BEFORE UPDATE ON commercial_partner_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 2: Update placement_agreements status constraint for internal approval
-- ============================================================================

-- First, check if the constraint exists and drop it if so
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'placement_agreements_status_check'
    ) THEN
        ALTER TABLE placement_agreements DROP CONSTRAINT placement_agreements_status_check;
    END IF;
END $$;

-- Add the new constraint with pending_internal_approval status
ALTER TABLE placement_agreements
ADD CONSTRAINT placement_agreements_status_check
CHECK (status IN (
    'draft',
    'pending_internal_approval',  -- NEW: Arranger-created, awaiting CEO/staff approval
    'pending_approval',           -- Sent to CP, awaiting their approval
    'approved',                   -- CP approved, ready for signatures
    'pending_ceo_signature',      -- CEO/admin needs to sign
    'pending_cp_signature',       -- CP needs to sign
    'active',                     -- Fully executed
    'rejected',                   -- CP or CEO rejected
    'terminated'                  -- Agreement terminated
));

-- Add comment for new status
COMMENT ON COLUMN placement_agreements.status IS 'Agreement lifecycle: draft -> [pending_internal_approval ->] pending_approval -> approved -> pending_ceo_signature -> pending_cp_signature -> active. Internal approval required for arranger-created agreements.';
