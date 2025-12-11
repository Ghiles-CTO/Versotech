export type SubscriptionStatus =
  | 'pending'
  | 'committed'
  | 'partially_funded'
  | 'active'
  | 'closed'
  | 'cancelled'

/**
 * Complete Subscription type matching all database fields
 * Total: 39 fields from subscriptions table
 */
export type Subscription = {
  // Core Fields (7)
  id: string
  subscription_number: number
  investor_id: string
  vehicle_id: string
  commitment: number
  currency: string
  status: SubscriptionStatus

  // Date Fields (5)
  created_at: string
  committed_at: string | null
  effective_date: string | null
  funding_due_at: string | null
  contract_date: string | null

  // Share/Unit Fields (5)
  price_per_share: number | null
  cost_per_share: number | null
  num_shares: number | null
  units: number | null
  spread_per_share: number | null

  // Fee Fields (9)
  spread_fee_amount: number | null
  subscription_fee_percent: number | null
  subscription_fee_amount: number | null
  bd_fee_percent: number | null
  bd_fee_amount: number | null
  finra_fee_amount: number | null
  performance_fee_tier1_percent: number | null
  performance_fee_tier1_threshold: number | null
  performance_fee_tier2_percent: number | null
  performance_fee_tier2_threshold: number | null

  // Financial Tracking Fields (5)
  funded_amount: number
  outstanding_amount: number | null
  capital_calls_total: number
  distributions_total: number
  current_nav: number | null

  // Business Context Fields (6)
  signed_doc_id: string | null
  acknowledgement_notes: string | null
  opportunity_name: string | null
  sourcing_contract_ref: string | null
  introducer_id: string | null
  introduction_id: string | null
}

export type SubscriptionWithRelations = Subscription & {
  investor: {
    id: string
    legal_name: string
    display_name: string | null
    type: string
    country: string | null
    email: string | null
    phone: string | null
    kyc_status: string
    status: string
    primary_rm: string | null
  }
  vehicle: {
    id: string
    name: string
    entity_code: string | null
    type: string
    currency: string
    status: string
    domicile: string | null
  }
}

export type CapitalActivity = {
  id: string
  type: 'contribution' | 'distribution' | 'call'
  amount: number
  date: string
  description: string
  status?: string
  classification?: string
}

export type SubscriptionMetrics = {
  total_commitment: number
  total_contributed: number
  total_distributed: number
  unfunded_commitment: number
  current_nav: number
  total_calls: number
  pending_calls: number
}

// ============================================================================
// HELPER TYPES FOR CALCULATIONS & BUSINESS LOGIC
// ============================================================================

/**
 * Share Structure Information
 * Calculated from price_per_share, cost_per_share, num_shares, spread_per_share
 */
export type ShareStructure = {
  price_per_share: number
  cost_per_share: number
  num_shares: number
  spread_per_share: number
  total_spread: number // spread_per_share * num_shares
  total_cost: number // cost_per_share * num_shares
  total_price: number // price_per_share * num_shares
}

/**
 * Fee Breakdown
 * Aggregates all fee types from subscription
 */
export type FeeBreakdown = {
  subscription_fee: {
    percent: number | null
    amount: number | null
  }
  bd_fee: {
    percent: number | null
    amount: number | null
  }
  finra_fee: {
    amount: number | null
  }
  spread_fee: {
    amount: number | null
  }
  performance_fees: {
    tier1: {
      percent: number | null
      threshold: number | null
    }
    tier2: {
      percent: number | null
      threshold: number | null
    }
  }
  total_fees: number // Sum of all fee amounts
  effective_fee_rate: number // total_fees / commitment * 100
}

/**
 * Financial Position
 * Tracks funded amounts, calls, distributions, NAV
 */
export type FinancialPosition = {
  commitment: number
  funded_amount: number
  outstanding_amount: number
  capital_calls_total: number
  distributions_total: number
  current_nav: number | null
  funding_rate: number // funded_amount / commitment * 100
  distribution_rate: number // distributions_total / funded_amount * 100 (if funded > 0)
}

/**
 * Complete Subscription Analytics
 * Combines all calculated metrics
 */
export type SubscriptionAnalytics = {
  subscription_id: string
  subscription_number: number
  investor_name: string
  vehicle_name: string
  share_structure: ShareStructure | null
  fee_breakdown: FeeBreakdown
  financial_position: FinancialPosition
  roi: number | null // (current_nav - funded_amount) / funded_amount * 100
  multiple: number | null // current_nav / funded_amount (MOIC)
}
