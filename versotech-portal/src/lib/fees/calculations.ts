/**
 * Fee Calculation Utilities
 * Handles calculations for subscription, management, performance, and spread fees
 */

export interface FeeCalculationInput {
  investmentAmount: number;
  rateBps?: number; // Basis points (e.g., 200 = 2%)
  flatAmount?: number;
  durationPeriods?: number;
  numShares?: number;
  entryPricePerShare?: number;
  exitPricePerShare?: number;
  costPerShare?: number;
  tierThresholdMultiplier?: number;
}

export interface PerformanceFeeTier {
  rateBps: number;
  thresholdMultiplier?: number; // e.g., 10.0 for "10x return"
  nextTierComponentId?: string;
}

/**
 * Convert basis points to decimal percentage
 * @param bps - Basis points (e.g., 200 for 2%)
 * @returns Decimal percentage (e.g., 0.02 for 2%)
 */
export function bpsToPercent(bps: number): number {
  return bps / 10000;
}

/**
 * Convert decimal percentage to basis points
 * @param percent - Decimal percentage (e.g., 0.02 for 2%)
 * @returns Basis points (e.g., 200 for 2%)
 */
export function percentToBps(percent: number): number {
  return Math.round(percent * 10000);
}

/**
 * Calculate subscription fee
 * Formula: investment_amount × subscription_fee_percent
 * @param input - Fee calculation input
 * @returns Calculated subscription fee
 */
export function calculateSubscriptionFee(input: FeeCalculationInput): number {
  if (input.flatAmount) {
    return input.flatAmount;
  }

  if (!input.rateBps) {
    return 0;
  }

  const feePercent = bpsToPercent(input.rateBps);
  return input.investmentAmount * feePercent;
}

/**
 * Calculate management fee (single period or total for upfront payment)
 * Formula: investment_amount × management_fee_percent × number_of_periods
 * @param input - Fee calculation input
 * @param isUpfront - If true, calculates total for all periods; if false, calculates single period
 * @returns Calculated management fee
 */
export function calculateManagementFee(
  input: FeeCalculationInput,
  isUpfront: boolean = false
): number {
  if (!input.rateBps) {
    return 0;
  }

  const feePercent = bpsToPercent(input.rateBps);
  const baseFee = input.investmentAmount * feePercent;

  if (isUpfront && input.durationPeriods) {
    return baseFee * input.durationPeriods;
  }

  return baseFee;
}

export interface ManagementFeePeriodInput {
  baseAmount: number;
  rateBps: number;
  periodStartDate: Date;
  periodEndDate: Date;
}

/**
 * Calculate management fee for a specific period with pro-rata adjustment
 * Formula: base_amount × (rate_bps / 10000) × (period_days / 365)
 * @param input - Period-based fee calculation input
 * @returns Calculated management fee prorated for the period
 */
export function calculateManagementFeePeriod(input: ManagementFeePeriodInput): number {
  if (!input.rateBps || input.rateBps <= 0) {
    return 0;
  }

  if (!input.baseAmount || input.baseAmount <= 0) {
    return 0;
  }

  const periodDays = calculateDaysBetween(input.periodStartDate, input.periodEndDate);
  if (periodDays <= 0) {
    return 0;
  }

  const feePercent = bpsToPercent(input.rateBps);
  const annualizedFraction = periodDays / 365;

  return input.baseAmount * feePercent * annualizedFraction;
}

/**
 * Calculate the number of days between two dates (inclusive of end date)
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @returns Number of days in the period
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = endDate.getTime() - startDate.getTime();
  // Add 1 to include the end date in the count (both start and end are inclusive)
  return Math.floor(diffMs / msPerDay) + 1;
}

/**
 * Calculate the end date for a fee period based on frequency
 * @param startDate - Period start date
 * @param frequency - Fee frequency (annual, quarterly, monthly)
 * @returns Period end date (day before next period starts)
 */
export function calculatePeriodEndDate(
  startDate: Date,
  frequency: 'annual' | 'quarterly' | 'monthly'
): Date {
  const endDate = new Date(startDate);

  switch (frequency) {
    case 'annual':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }

  // Subtract 1 day to get the last day of the current period
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
}

/**
 * Calculate simple performance fee (no tiers)
 * Formula: (exit_price - entry_price) × num_shares × performance_fee_percent
 * @param input - Fee calculation input
 * @returns Calculated performance fee
 */
export function calculateSimplePerformanceFee(input: FeeCalculationInput): number {
  if (!input.rateBps || !input.numShares || !input.entryPricePerShare || !input.exitPricePerShare) {
    return 0;
  }

  const gainPerShare = input.exitPricePerShare - input.entryPricePerShare;

  // No performance fee if there's no gain
  if (gainPerShare <= 0) {
    return 0;
  }

  const feePercent = bpsToPercent(input.rateBps);
  return gainPerShare * input.numShares * feePercent;
}

/**
 * Calculate tiered performance fee
 * Example: 20% on gains up to 10x, 30% on gains above 10x
 * @param input - Fee calculation input
 * @param tiers - Array of performance fee tiers
 * @returns Calculated tiered performance fee
 */
export function calculateTieredPerformanceFee(
  input: FeeCalculationInput,
  tiers: PerformanceFeeTier[]
): number {
  if (!input.numShares || !input.entryPricePerShare || !input.exitPricePerShare) {
    return 0;
  }

  const gainPerShare = input.exitPricePerShare - input.entryPricePerShare;

  // No performance fee if there's no gain
  if (gainPerShare <= 0) {
    return 0;
  }

  const returnMultiplier = input.exitPricePerShare / input.entryPricePerShare;
  let totalFee = 0;

  // Sort tiers by threshold (ascending)
  const sortedTiers = [...tiers].sort((a, b) => {
    const aThreshold = a.thresholdMultiplier || Infinity;
    const bThreshold = b.thresholdMultiplier || Infinity;
    return aThreshold - bThreshold;
  });

  let previousThreshold = 1; // Start at 1x (entry price)

  for (const tier of sortedTiers) {
    const currentThreshold = tier.thresholdMultiplier || Infinity;

    if (returnMultiplier <= previousThreshold) {
      break; // Return is below this tier
    }

    const applicableMultiplier = Math.min(returnMultiplier, currentThreshold);
    const tierGainPerShare = input.entryPricePerShare * (applicableMultiplier - previousThreshold);
    const tierFeePercent = bpsToPercent(tier.rateBps);
    const tierFee = tierGainPerShare * input.numShares * tierFeePercent;

    totalFee += tierFee;
    previousThreshold = currentThreshold;

    if (returnMultiplier <= currentThreshold) {
      break; // Return doesn't reach next tier
    }
  }

  return totalFee;
}

/**
 * Calculate spread (price per share markup)
 * Formula: (investor_price_per_share - cost_per_share) × num_shares
 * @param input - Fee calculation input
 * @returns Calculated spread revenue
 */
export function calculateSpread(input: FeeCalculationInput): number {
  if (!input.numShares || !input.entryPricePerShare || !input.costPerShare) {
    return 0;
  }

  const spreadPerShare = input.entryPricePerShare - input.costPerShare;

  // No spread if investor price is at or below cost
  if (spreadPerShare <= 0) {
    return 0;
  }

  return spreadPerShare * input.numShares;
}

/**
 * Calculate introducer commission
 * Formula: base_fee_amount × commission_rate_percent
 * @param baseFeeAmount - The base fee amount to calculate commission on
 * @param commissionRateBps - Commission rate in basis points
 * @returns Calculated commission amount
 */
export function calculateIntroducerCommission(
  baseFeeAmount: number,
  commissionRateBps: number
): number {
  const commissionPercent = bpsToPercent(commissionRateBps);
  return baseFeeAmount * commissionPercent;
}

/**
 * Calculate total wire amount (investment + subscription fee)
 * @param investmentAmount - Base investment amount
 * @param subscriptionFeeBps - Subscription fee in basis points
 * @returns Total amount investor needs to wire
 */
export function calculateTotalWireAmount(
  investmentAmount: number,
  subscriptionFeeBps: number
): number {
  const subscriptionFee = calculateSubscriptionFee({
    investmentAmount,
    rateBps: subscriptionFeeBps,
  });

  return investmentAmount + subscriptionFee;
}

/**
 * Calculate net fee retained by Verso after introducer commission
 * @param grossFee - Total fee collected
 * @param introducerCommissionBps - Introducer commission rate in basis points
 * @returns Net fee retained
 */
export function calculateNetFeeRetained(
  grossFee: number,
  introducerCommissionBps: number
): number {
  const commission = calculateIntroducerCommission(grossFee, introducerCommissionBps);
  return grossFee - commission;
}

/**
 * Format currency for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format basis points for display
 * @param bps - Basis points
 * @returns Formatted percentage string (e.g., "2.00%")
 */
export function formatBps(bps: number): string {
  const percent = bpsToPercent(bps) * 100;
  return `${percent.toFixed(2)}%`;
}
