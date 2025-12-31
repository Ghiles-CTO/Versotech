-- Migration: Create partner_commissions table
-- Purpose: Track commissions/fees owed to partners for their referrals
-- Pattern: Mirrors introducer_commissions table structure

-- Create the partner_commissions table
CREATE TABLE IF NOT EXISTS public.partner_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
    deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
    investor_id uuid REFERENCES public.investors(id) ON DELETE SET NULL,
    arranger_id uuid REFERENCES public.arranger_entities(id) ON DELETE SET NULL,
    fee_plan_id uuid REFERENCES public.fee_plans(id) ON DELETE SET NULL,
    basis_type text,
    rate_bps integer NOT NULL,
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Constraints matching introducer_commissions pattern
    CONSTRAINT partner_commissions_base_amount_check CHECK (base_amount IS NULL OR base_amount >= 0),
    CONSTRAINT partner_commissions_basis_type_check CHECK (basis_type IN ('invested_amount', 'spread', 'management_fee', 'performance_fee')),
    CONSTRAINT partner_commissions_status_check CHECK (status IN ('accrued', 'invoice_requested', 'invoiced', 'paid', 'cancelled'))
);

-- Set ownership
ALTER TABLE public.partner_commissions OWNER TO postgres;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_deal_id ON partner_commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_investor_id ON partner_commissions(investor_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_arranger_id ON partner_commissions(arranger_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_deal_investor ON partner_commissions(deal_id, investor_id);

-- Add comments for documentation
COMMENT ON TABLE partner_commissions IS 'Tracks commissions/fees owed to partners for investor referrals';
COMMENT ON COLUMN partner_commissions.partner_id IS 'Partner entity receiving this commission';
COMMENT ON COLUMN partner_commissions.arranger_id IS 'Arranger entity responsible for this commission';
COMMENT ON COLUMN partner_commissions.basis_type IS 'What the commission is based on: invested_amount, spread, management_fee, performance_fee';
COMMENT ON COLUMN partner_commissions.rate_bps IS 'Commission rate in basis points (100 bps = 1%)';
COMMENT ON COLUMN partner_commissions.base_amount IS 'The base amount the commission is calculated from';
COMMENT ON COLUMN partner_commissions.accrual_amount IS 'The calculated commission amount';
COMMENT ON COLUMN partner_commissions.status IS 'Workflow status: accrued -> invoice_requested -> invoiced -> paid';

-- Enable Row Level Security
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Arrangers can view commissions for partners on their deals
CREATE POLICY "arrangers_view_partner_commissions" ON partner_commissions
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
);

-- RLS Policy: Arrangers can insert commissions for their partners
CREATE POLICY "arrangers_insert_partner_commissions" ON partner_commissions
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
CREATE POLICY "arrangers_update_partner_commissions" ON partner_commissions
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
CREATE POLICY "staff_delete_partner_commissions" ON partner_commissions
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops')
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON partner_commissions TO authenticated;
GRANT DELETE ON partner_commissions TO authenticated;
