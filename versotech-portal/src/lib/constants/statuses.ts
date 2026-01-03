/**
 * Centralized Status Constants
 *
 * This file consolidates all status values used across the application
 * to ensure consistency and make status management easier.
 */

// ============================================================================
// DEAL STATUSES
// ============================================================================

export const DEAL_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  ALLOCATION_PENDING: 'allocation_pending',
  FULLY_SUBSCRIBED: 'fully_subscribed',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const

export type DealStatus = typeof DEAL_STATUS[keyof typeof DEAL_STATUS]

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  [DEAL_STATUS.DRAFT]: 'Draft',
  [DEAL_STATUS.OPEN]: 'Open',
  [DEAL_STATUS.ALLOCATION_PENDING]: 'Allocation Pending',
  [DEAL_STATUS.FULLY_SUBSCRIBED]: 'Fully Subscribed',
  [DEAL_STATUS.CLOSED]: 'Closed',
  [DEAL_STATUS.CANCELLED]: 'Cancelled',
}

export const DEAL_STATUS_STYLES: Record<DealStatus, string> = {
  [DEAL_STATUS.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-200',
  [DEAL_STATUS.OPEN]: 'bg-green-100 text-green-800 border-green-200',
  [DEAL_STATUS.ALLOCATION_PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [DEAL_STATUS.FULLY_SUBSCRIBED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [DEAL_STATUS.CLOSED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [DEAL_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
}

// Dark theme styles for deal status (used in lawyer dashboard)
export const DEAL_STATUS_STYLES_DARK: Record<DealStatus, string> = {
  [DEAL_STATUS.DRAFT]: 'bg-gray-500/20 text-gray-400',
  [DEAL_STATUS.OPEN]: 'bg-green-500/20 text-green-400',
  [DEAL_STATUS.ALLOCATION_PENDING]: 'bg-yellow-500/20 text-yellow-400',
  [DEAL_STATUS.FULLY_SUBSCRIBED]: 'bg-blue-500/20 text-blue-400',
  [DEAL_STATUS.CLOSED]: 'bg-purple-500/20 text-purple-400',
  [DEAL_STATUS.CANCELLED]: 'bg-red-500/20 text-red-400',
}

// ============================================================================
// SUBSCRIPTION STATUSES
// ============================================================================

export const SUBSCRIPTION_STATUS = {
  COMMITTED: 'committed',
  PARTIALLY_FUNDED: 'partially_funded',
  FUNDED: 'funded',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SUBSCRIPTION_STATUS.COMMITTED]: 'Committed',
  [SUBSCRIPTION_STATUS.PARTIALLY_FUNDED]: 'Partially Funded',
  [SUBSCRIPTION_STATUS.FUNDED]: 'Funded',
  [SUBSCRIPTION_STATUS.CANCELLED]: 'Cancelled',
  [SUBSCRIPTION_STATUS.COMPLETED]: 'Completed',
}

export const SUBSCRIPTION_STATUS_STYLES: Record<SubscriptionStatus, string> = {
  [SUBSCRIPTION_STATUS.COMMITTED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [SUBSCRIPTION_STATUS.PARTIALLY_FUNDED]: 'bg-amber-100 text-amber-800 border-amber-200',
  [SUBSCRIPTION_STATUS.FUNDED]: 'bg-green-100 text-green-800 border-green-200',
  [SUBSCRIPTION_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [SUBSCRIPTION_STATUS.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-200',
}

// Dark theme styles for subscription status
export const SUBSCRIPTION_STATUS_STYLES_DARK: Record<SubscriptionStatus, string> = {
  [SUBSCRIPTION_STATUS.COMMITTED]: 'bg-blue-500/20 text-blue-400',
  [SUBSCRIPTION_STATUS.PARTIALLY_FUNDED]: 'bg-amber-500/20 text-amber-400',
  [SUBSCRIPTION_STATUS.FUNDED]: 'bg-green-500/20 text-green-400',
  [SUBSCRIPTION_STATUS.CANCELLED]: 'bg-red-500/20 text-red-400',
  [SUBSCRIPTION_STATUS.COMPLETED]: 'bg-purple-500/20 text-purple-400',
}

// ============================================================================
// FEE EVENT STATUSES
// ============================================================================

export const FEE_STATUS = {
  ACCRUED: 'accrued',
  INVOICED: 'invoiced',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const

export type FeeStatus = typeof FEE_STATUS[keyof typeof FEE_STATUS]

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  [FEE_STATUS.ACCRUED]: 'Accrued',
  [FEE_STATUS.INVOICED]: 'Invoiced',
  [FEE_STATUS.PAID]: 'Paid',
  [FEE_STATUS.CANCELLED]: 'Cancelled',
}

export const FEE_STATUS_STYLES: Record<FeeStatus, string> = {
  [FEE_STATUS.ACCRUED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [FEE_STATUS.INVOICED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [FEE_STATUS.PAID]: 'bg-green-100 text-green-800 border-green-200',
  [FEE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
}

// ============================================================================
// SETTLEMENT STATUSES
// ============================================================================

export const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  FUNDED: 'funded',
} as const

export type SettlementStatus = typeof SETTLEMENT_STATUS[keyof typeof SETTLEMENT_STATUS]

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  [SETTLEMENT_STATUS.PENDING]: 'Pending',
  [SETTLEMENT_STATUS.PARTIAL]: 'Partial',
  [SETTLEMENT_STATUS.FUNDED]: 'Funded',
}

export const SETTLEMENT_STATUS_STYLES: Record<SettlementStatus, string> = {
  [SETTLEMENT_STATUS.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200',
  [SETTLEMENT_STATUS.PARTIAL]: 'bg-blue-100 text-blue-800 border-blue-200',
  [SETTLEMENT_STATUS.FUNDED]: 'bg-green-100 text-green-800 border-green-200',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a status value for display (replace underscores with spaces, capitalize)
 */
export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Get the style class for a deal status, with fallback
 */
export function getDealStatusStyle(status: string, dark = false): string {
  const styles = dark ? DEAL_STATUS_STYLES_DARK : DEAL_STATUS_STYLES
  return styles[status as DealStatus] || styles[DEAL_STATUS.DRAFT]
}

/**
 * Get the style class for a subscription status, with fallback
 */
export function getSubscriptionStatusStyle(status: string, dark = false): string {
  const styles = dark ? SUBSCRIPTION_STATUS_STYLES_DARK : SUBSCRIPTION_STATUS_STYLES
  return styles[status as SubscriptionStatus] || styles[SUBSCRIPTION_STATUS.COMMITTED]
}
