export interface EntityInvestorSubscriptionSummary {
  id: string
  commitment: number | null
  currency: string | null
  status: string | null
  effective_date: string | null
  funding_due_at: string | null
  units: number | null
  acknowledgement_notes: string | null
  created_at: string | null
  origin?: 'linked' | 'auto_discovered' | 'holding_projection'
}

export interface EntityInvestorHoldingSummary {
  id: string
  deal_id: string
  deal_name?: string | null
  status: string | null
  subscribed_amount: number | null
  currency: string | null
  effective_date: string | null
  funding_due_at: string | null
  funded_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface EntityInvestorSummary {
  id: string
  relationship_role: string | null
  allocation_status: string | null
  invite_sent_at: string | null
  created_at: string
  updated_at: string | null
  notes: string | null
  investor?: {
    id: string
    legal_name: string
    display_name: string | null
    type: string | null
    email: string | null
    country: string | null
    status: string | null
    onboarding_status: string | null
    aml_risk_rating: string | null
  } | null
  subscription?: EntityInvestorSubscriptionSummary | null
  subscriptions?: EntityInvestorSubscriptionSummary[]
  holdings?: EntityInvestorHoldingSummary[]
  total_commitment?: number | null
  total_holdings_amount?: number | null
  source?: 'entity_link' | 'subscription_only' | 'holding_only' | 'hybrid'
}

export interface EntityFlagSummary {
  id: string
  flag_type: string
  severity: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  resolved_at: string | null
  resolution_notes?: string | null
  created_at: string
}
