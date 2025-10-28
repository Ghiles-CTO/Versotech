/**
 * Subscription Business Logic Calculations
 *
 * Utilities for calculating fees, shares, financial positions, and analytics
 * from subscription data
 */

import type {
  Subscription,
  ShareStructure,
  FeeBreakdown,
  FinancialPosition,
  SubscriptionAnalytics,
} from '@/types/subscription'

// ============================================================================
// SHARE STRUCTURE CALCULATIONS
// ============================================================================

/**
 * Calculate share structure from subscription
 * Returns null if share data is incomplete
 */
export function calculateShareStructure(sub: Subscription): ShareStructure | null {
  const { price_per_share, cost_per_share, num_shares, spread_per_share } = sub

  // All share fields must be present
  if (
    price_per_share == null ||
    cost_per_share == null ||
    num_shares == null ||
    spread_per_share == null
  ) {
    return null
  }

  const total_spread = spread_per_share * num_shares
  const total_cost = cost_per_share * num_shares
  const total_price = price_per_share * num_shares

  return {
    price_per_share,
    cost_per_share,
    num_shares,
    spread_per_share,
    total_spread,
    total_cost,
    total_price,
  }
}

/**
 * Validate share structure consistency
 * Checks: spread = price - cost, and totals match
 */
export function validateShareStructure(structure: ShareStructure): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check: spread_per_share should equal price_per_share - cost_per_share
  const expected_spread = structure.price_per_share - structure.cost_per_share
  const spread_diff = Math.abs(structure.spread_per_share - expected_spread)

  if (spread_diff > 0.01) {
    // Allow 1 cent tolerance
    errors.push(
      `Spread mismatch: expected ${expected_spread.toFixed(2)}, got ${structure.spread_per_share.toFixed(2)}`
    )
  }

  // Check: total_spread should equal spread_per_share * num_shares
  const expected_total_spread = structure.spread_per_share * structure.num_shares
  if (Math.abs(structure.total_spread - expected_total_spread) > 0.01) {
    errors.push(`Total spread calculation mismatch`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// FEE BREAKDOWN CALCULATIONS
// ============================================================================

/**
 * Calculate complete fee breakdown from subscription
 */
export function calculateFeeBreakdown(sub: Subscription): FeeBreakdown {
  const subscription_fee_amount = sub.subscription_fee_amount || 0
  const bd_fee_amount = sub.bd_fee_amount || 0
  const finra_fee_amount = sub.finra_fee_amount || 0
  const spread_fee_amount = sub.spread_fee_amount || 0

  const total_fees =
    subscription_fee_amount + bd_fee_amount + finra_fee_amount + spread_fee_amount

  const effective_fee_rate = sub.commitment > 0 ? (total_fees / sub.commitment) * 100 : 0

  return {
    subscription_fee: {
      percent: sub.subscription_fee_percent,
      amount: sub.subscription_fee_amount,
    },
    bd_fee: {
      percent: sub.bd_fee_percent,
      amount: sub.bd_fee_amount,
    },
    finra_fee: {
      amount: sub.finra_fee_amount,
    },
    spread_fee: {
      amount: sub.spread_fee_amount,
    },
    performance_fees: {
      tier1: {
        percent: sub.performance_fee_tier1_percent,
        threshold: sub.performance_fee_tier1_threshold,
      },
      tier2: {
        percent: sub.performance_fee_tier2_percent,
        threshold: sub.performance_fee_tier2_threshold,
      },
    },
    total_fees,
    effective_fee_rate,
  }
}

/**
 * Calculate net investment amount after fees
 */
export function calculateNetInvestment(sub: Subscription): number {
  const fees = calculateFeeBreakdown(sub)
  return sub.commitment - fees.total_fees
}

/**
 * Get applicable performance fee tier based on current NAV
 */
export function getPerformanceFeeTier(
  sub: Subscription,
  current_nav: number
): { tier: 1 | 2 | null; percent: number | null; threshold: number | null } {
  // Check tier 2 first (higher threshold)
  if (
    sub.performance_fee_tier2_threshold != null &&
    sub.performance_fee_tier2_percent != null &&
    current_nav >= sub.performance_fee_tier2_threshold
  ) {
    return {
      tier: 2,
      percent: sub.performance_fee_tier2_percent,
      threshold: sub.performance_fee_tier2_threshold,
    }
  }

  // Check tier 1
  if (
    sub.performance_fee_tier1_threshold != null &&
    sub.performance_fee_tier1_percent != null &&
    current_nav >= sub.performance_fee_tier1_threshold
  ) {
    return {
      tier: 1,
      percent: sub.performance_fee_tier1_percent,
      threshold: sub.performance_fee_tier1_threshold,
    }
  }

  // No tier applicable
  return { tier: null, percent: null, threshold: null }
}

// ============================================================================
// FINANCIAL POSITION CALCULATIONS
// ============================================================================

/**
 * Calculate financial position from subscription
 */
export function calculateFinancialPosition(sub: Subscription): FinancialPosition {
  const funded_amount = sub.funded_amount || 0
  const capital_calls_total = sub.capital_calls_total || 0
  const distributions_total = sub.distributions_total || 0

  // Calculate outstanding amount
  const outstanding_amount =
    sub.outstanding_amount != null ? sub.outstanding_amount : sub.commitment - funded_amount

  // Calculate rates
  const funding_rate = sub.commitment > 0 ? (funded_amount / sub.commitment) * 100 : 0
  const distribution_rate =
    funded_amount > 0 ? (distributions_total / funded_amount) * 100 : 0

  return {
    commitment: sub.commitment,
    funded_amount,
    outstanding_amount,
    capital_calls_total,
    distributions_total,
    current_nav: sub.current_nav,
    funding_rate,
    distribution_rate,
  }
}

/**
 * Calculate ROI (Return on Investment)
 * ROI = (Current NAV - Funded Amount) / Funded Amount * 100
 */
export function calculateROI(sub: Subscription): number | null {
  const funded_amount = sub.funded_amount || 0
  const current_nav = sub.current_nav

  if (funded_amount === 0 || current_nav == null) {
    return null
  }

  return ((current_nav - funded_amount) / funded_amount) * 100
}

/**
 * Calculate MOIC (Multiple on Invested Capital)
 * MOIC = Current NAV / Funded Amount
 */
export function calculateMOIC(sub: Subscription): number | null {
  const funded_amount = sub.funded_amount || 0
  const current_nav = sub.current_nav

  if (funded_amount === 0 || current_nav == null) {
    return null
  }

  return current_nav / funded_amount
}

// ============================================================================
// COMPLETE ANALYTICS
// ============================================================================

/**
 * Calculate complete subscription analytics
 */
export function calculateSubscriptionAnalytics(
  sub: Subscription,
  investor_name: string,
  vehicle_name: string
): SubscriptionAnalytics {
  return {
    subscription_id: sub.id,
    subscription_number: sub.subscription_number,
    investor_name,
    vehicle_name,
    share_structure: calculateShareStructure(sub),
    fee_breakdown: calculateFeeBreakdown(sub),
    financial_position: calculateFinancialPosition(sub),
    roi: calculateROI(sub),
    multiple: calculateMOIC(sub),
  }
}

// ============================================================================
// DATA INTEGRITY CHECKS
// ============================================================================

/**
 * Validate subscription data integrity
 */
export function validateSubscriptionIntegrity(sub: Subscription): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check: funded_amount should not exceed commitment
  if (sub.funded_amount > sub.commitment) {
    errors.push(
      `Funded amount ($${sub.funded_amount}) exceeds commitment ($${sub.commitment})`
    )
  }

  // Check: outstanding_amount should equal commitment - funded_amount
  const expected_outstanding = sub.commitment - sub.funded_amount
  if (
    sub.outstanding_amount != null &&
    Math.abs(sub.outstanding_amount - expected_outstanding) > 0.01
  ) {
    warnings.push(
      `Outstanding amount mismatch: expected ${expected_outstanding.toFixed(2)}, got ${sub.outstanding_amount.toFixed(2)}`
    )
  }

  // Check: if share data exists, validate spread_fee_amount
  if (
    sub.spread_per_share != null &&
    sub.num_shares != null &&
    sub.spread_fee_amount != null
  ) {
    const expected_spread_fee = sub.spread_per_share * sub.num_shares
    if (Math.abs(sub.spread_fee_amount - expected_spread_fee) > 0.01) {
      warnings.push(
        `Spread fee mismatch: expected ${expected_spread_fee.toFixed(2)}, got ${sub.spread_fee_amount.toFixed(2)}`
      )
    }
  }

  // Check: if subscription_fee_percent exists, check if amount matches
  if (
    sub.subscription_fee_percent != null &&
    sub.subscription_fee_amount != null
  ) {
    const expected_sub_fee = (sub.commitment * sub.subscription_fee_percent) / 100
    if (Math.abs(sub.subscription_fee_amount - expected_sub_fee) > 0.01) {
      warnings.push(
        `Subscription fee mismatch: expected ${expected_sub_fee.toFixed(2)}, got ${sub.subscription_fee_amount.toFixed(2)}`
      )
    }
  }

  // Check: if BD fee percent exists, check if amount matches
  if (sub.bd_fee_percent != null && sub.bd_fee_amount != null) {
    const expected_bd_fee = (sub.commitment * sub.bd_fee_percent) / 100
    if (Math.abs(sub.bd_fee_amount - expected_bd_fee) > 0.01) {
      warnings.push(
        `BD fee mismatch: expected ${expected_bd_fee.toFixed(2)}, got ${sub.bd_fee_amount.toFixed(2)}`
      )
    }
  }

  // Check: distributions_total should not exceed funded_amount + current_nav
  if (sub.current_nav != null) {
    const max_distributions = sub.funded_amount + sub.current_nav
    if (sub.distributions_total > max_distributions) {
      errors.push(
        `Distributions ($${sub.distributions_total}) exceed funded + NAV ($${max_distributions})`
      )
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format multiple (MOIC)
 */
export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`
}
