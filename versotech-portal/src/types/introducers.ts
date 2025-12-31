/**
 * Type definitions for introducer-related entities
 * Used across arranger and staff introducer management features
 */

import type { CommissionSummary } from '@/components/common/commission-summary'

// Re-export CommissionSummary for convenience
export type { CommissionSummary }

/**
 * Commission status flow:
 * accrued → invoice_requested → invoiced → paid
 *                            ↘ cancelled
 */
export type CommissionStatus =
  | 'accrued'
  | 'invoice_requested'
  | 'invoiced'
  | 'paid'
  | 'cancelled'

/**
 * Basis type for commission calculation
 */
export type CommissionBasisType =
  | 'invested_amount'
  | 'spread'
  | 'management_fee'
  | 'performance_fee'

/**
 * Full introducer commission record from database
 */
export type IntroducerCommission = {
  id: string
  introducer_id: string
  arranger_id: string | null
  deal_id: string | null
  investor_id: string | null
  introduction_id: string | null
  fee_plan_id: string | null
  basis_type: CommissionBasisType
  rate_bps: number
  base_amount: number | null
  accrual_amount: number
  currency: string
  status: CommissionStatus
  invoice_id: string | null
  paid_at: string | null
  approved_by: string | null
  approved_at: string | null
  payment_due_date: string | null
  payment_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

/**
 * Commission with joined introducer, deal, and investor info
 */
export type IntroducerCommissionWithDetails = IntroducerCommission & {
  introducer?: {
    id: string
    legal_name: string
    email: string | null
  }
  deal?: {
    id: string
    name: string
    company_name: string | null
    currency: string
  }
  investor?: {
    id: string
    legal_name: string | null
    display_name: string | null
  }
}

/**
 * Introducer detail for display
 */
export type IntroducerDetail = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  status: 'active' | 'inactive' | 'suspended'
  default_commission_bps: number | null
  commission_cap_amount: number | null
  payment_terms: string | null
  agreement_expiry_date: string | null
  logo_url: string | null
  notes: string | null
  created_at: string | null
}

/**
 * Fee plan assigned to an introducer
 */
export type IntroducerFeePlan = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  effective_from: string | null
  effective_until: string | null
  deal_id: string | null
  vehicle_id: string | null
  components: FeeComponent[]
  created_at: string | null
}

/**
 * Fee plan component with rate/amount info
 */
export type FeeComponent = {
  id: string
  fee_type: string
  rate_bps: number | null
  amount: number | null
  currency: string | null
  description: string | null
}

/**
 * Deal that an introducer has referrals on
 */
export type IntroducerDeal = {
  id: string
  name: string
  company_name: string | null
  status: string
  currency: string
}

/**
 * Referral made by an introducer
 */
export type IntroducerReferral = {
  id: string
  created_at: string
  investor: {
    id: string
    name: string
  } | null
  deal: {
    id: string
    name: string
    company_name: string | null
  } | null
}

/**
 * Full introducer data for detail drawer
 */
export type IntroducerData = {
  introducer: IntroducerDetail
  fee_plans: IntroducerFeePlan[]
  commission_summary: CommissionSummary
  deals: IntroducerDeal[]
  recent_referrals: IntroducerReferral[]
  stats: {
    total_deals: number
    total_referrals: number
    active_fee_plans: number
  }
}

/**
 * Introducer for list display (My Introducers page)
 */
export type IntroducerListItem = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  status: string
  default_commission_bps: number | null
  commission_cap_amount: number | null
  agreement_expiry_date: string | null
  logo_url: string | null
  deals_count: number
  referrals_count: number
  total_referral_value: number
  fee_plans: IntroducerFeePlan[]
  commission_summary: CommissionSummary
}

/**
 * Request body for creating a commission
 */
export type CreateCommissionRequest = {
  introducer_id: string
  deal_id?: string
  investor_id?: string
  introduction_id?: string
  fee_plan_id?: string
  basis_type: CommissionBasisType
  rate_bps: number
  base_amount?: number
  accrual_amount: number
  currency?: string
  payment_due_date?: string
  notes?: string
}

/**
 * Request body for updating a commission
 */
export type UpdateCommissionRequest = {
  status?: CommissionStatus
  invoice_id?: string
  payment_reference?: string
  payment_due_date?: string
  notes?: string
}

/**
 * Response from commission list API
 */
export type CommissionListResponse = {
  data: IntroducerCommissionWithDetails[]
  summary: {
    total_accrued: number
    total_invoice_requested: number
    total_invoiced: number
    total_paid: number
    total_cancelled: number
    total_owed: number
    count_by_status: Record<CommissionStatus, number>
  }
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

/**
 * Response from introducer detail API
 */
export type IntroducerDetailResponse = {
  data: IntroducerData
}

/**
 * Reconciliation report row
 */
export type ReconciliationRow = {
  commission_id: string
  introducer_id: string
  introducer_name: string
  deal_id: string | null
  deal_name: string | null
  investor_id: string | null
  investor_name: string | null
  basis_type: CommissionBasisType
  rate_bps: number
  base_amount: number | null
  commission_amount: number
  currency: string
  status: CommissionStatus
  invoice_id: string | null
  invoice_number: string | null
  payment_due_date: string | null
  paid_at: string | null
  payment_reference: string | null
  created_at: string
}

/**
 * Reconciliation report response
 */
export type ReconciliationReportResponse = {
  data: ReconciliationRow[]
  summary: {
    total_accrued: number
    total_invoice_requested: number
    total_invoiced: number
    total_paid: number
    total_cancelled: number
    by_introducer: Record<string, {
      name: string
      total: number
      paid: number
      pending: number
    }>
  }
  filters: {
    from_date: string | null
    to_date: string | null
    introducer_id: string | null
    deal_id: string | null
    status: CommissionStatus | null
  }
}
