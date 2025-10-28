-- Migration: Deal Workflow Phase 4 - Investor Deal Holdings
-- Date: 2025-11-02 12:15
-- Adds investor_deal_holdings table to persist post-subscription allocations.

CREATE TABLE IF NOT EXISTS investor_deal_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  subscription_submission_id uuid REFERENCES deal_subscription_submissions(id) ON DELETE SET NULL,
  approval_id uuid REFERENCES approvals(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending_funding' CHECK (status IN ('pending_funding', 'funded', 'active', 'closed')),
  subscribed_amount numeric(18,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  effective_date date,
  funding_due_at timestamptz,
  funded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investor_id, deal_id)
);
CREATE INDEX IF NOT EXISTS idx_investor_deal_holdings_investor ON investor_deal_holdings (investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_deal_holdings_deal ON investor_deal_holdings (deal_id);
ALTER TABLE investor_deal_holdings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investor_deal_holdings_investor_select ON investor_deal_holdings;
CREATE POLICY investor_deal_holdings_investor_select ON investor_deal_holdings
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM investor_users iu
    WHERE iu.investor_id = investor_deal_holdings.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS investor_deal_holdings_staff_all ON investor_deal_holdings;
CREATE POLICY investor_deal_holdings_staff_all ON investor_deal_holdings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
COMMENT ON TABLE investor_deal_holdings IS 'Tracks per-investor holdings/allocations for each deal once subscriptions are confirmed.';
