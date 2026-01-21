import { describe, it, expect } from 'vitest'
import {
  bpsToPercent,
  percentToBps,
  calculateSubscriptionFee,
  calculateManagementFee,
  calculateSimplePerformanceFee,
  calculateTieredPerformanceFee,
  calculateSpread,
  calculateIntroducerCommission,
  calculateTotalWireAmount,
  calculateNetFeeRetained,
  formatCurrency,
  formatBps,
} from '@/lib/fees/calculations'

describe('Fee Calculations', () => {
  describe('bpsToPercent', () => {
    it('converts basis points to decimal percentage', () => {
      expect(bpsToPercent(100)).toBe(0.01) // 1%
      expect(bpsToPercent(200)).toBe(0.02) // 2%
      expect(bpsToPercent(50)).toBe(0.005) // 0.5%
      expect(bpsToPercent(10000)).toBe(1) // 100%
    })
  })

  describe('percentToBps', () => {
    it('converts decimal percentage to basis points', () => {
      expect(percentToBps(0.01)).toBe(100) // 1%
      expect(percentToBps(0.02)).toBe(200) // 2%
      expect(percentToBps(0.005)).toBe(50) // 0.5%
      expect(percentToBps(1)).toBe(10000) // 100%
    })
  })

  describe('calculateSubscriptionFee', () => {
    it('calculates subscription fee from basis points', () => {
      // Formula: commitment × (subscription_fee_bps / 10000)
      // 100,000 × (200 / 10000) = 100,000 × 0.02 = 2,000
      const result = calculateSubscriptionFee({
        investmentAmount: 100000,
        rateBps: 200, // 2%
      })
      expect(result).toBe(2000)
    })

    it('returns flat amount if provided', () => {
      const result = calculateSubscriptionFee({
        investmentAmount: 100000,
        rateBps: 200,
        flatAmount: 1500,
      })
      expect(result).toBe(1500)
    })

    it('returns 0 if no rate or flat amount', () => {
      const result = calculateSubscriptionFee({
        investmentAmount: 100000,
      })
      expect(result).toBe(0)
    })

    it('handles various investment amounts', () => {
      expect(
        calculateSubscriptionFee({ investmentAmount: 50000, rateBps: 100 })
      ).toBe(500) // 1% of 50k

      expect(
        calculateSubscriptionFee({ investmentAmount: 1000000, rateBps: 150 })
      ).toBe(15000) // 1.5% of 1M

      expect(
        calculateSubscriptionFee({ investmentAmount: 250000, rateBps: 250 })
      ).toBe(6250) // 2.5% of 250k
    })
  })

  describe('calculateManagementFee', () => {
    it('calculates single period management fee', () => {
      const result = calculateManagementFee({
        investmentAmount: 100000,
        rateBps: 200, // 2%
      })
      expect(result).toBe(2000)
    })

    it('calculates upfront management fee for multiple periods', () => {
      const result = calculateManagementFee(
        {
          investmentAmount: 100000,
          rateBps: 200, // 2%
          durationPeriods: 4, // 4 periods
        },
        true // isUpfront
      )
      expect(result).toBe(8000) // 2000 × 4 periods
    })

    it('returns 0 if no rate', () => {
      const result = calculateManagementFee({
        investmentAmount: 100000,
      })
      expect(result).toBe(0)
    })
  })

  describe('calculateSimplePerformanceFee', () => {
    it('calculates performance fee on gains', () => {
      // Gain = (50 - 10) × 1000 = 40,000
      // Fee = 40,000 × 0.20 = 8,000
      const result = calculateSimplePerformanceFee({
        investmentAmount: 0,
        rateBps: 2000, // 20%
        numShares: 1000,
        entryPricePerShare: 10,
        exitPricePerShare: 50,
      })
      expect(result).toBe(8000)
    })

    it('returns 0 if no gain', () => {
      const result = calculateSimplePerformanceFee({
        investmentAmount: 0,
        rateBps: 2000,
        numShares: 1000,
        entryPricePerShare: 50,
        exitPricePerShare: 40, // Loss
      })
      expect(result).toBe(0)
    })

    it('returns 0 if missing required fields', () => {
      expect(
        calculateSimplePerformanceFee({
          investmentAmount: 0,
          rateBps: 2000,
        })
      ).toBe(0)
    })
  })

  describe('calculateTieredPerformanceFee', () => {
    it('calculates tiered performance fee', () => {
      const tiers = [
        { rateBps: 2000, thresholdMultiplier: 10 }, // 20% up to 10x
        { rateBps: 3000 }, // 30% above 10x
      ]

      // Entry: $10, Exit: $120 (12x return)
      // Tier 1: ($10 × (10 - 1)) × 1000 × 0.20 = $90 × 1000 × 0.20 = $18,000
      // Tier 2: ($10 × (12 - 10)) × 1000 × 0.30 = $20 × 1000 × 0.30 = $6,000
      // Total: $24,000
      const result = calculateTieredPerformanceFee(
        {
          investmentAmount: 0,
          numShares: 1000,
          entryPricePerShare: 10,
          exitPricePerShare: 120,
        },
        tiers
      )
      expect(result).toBe(24000)
    })

    it('returns 0 if no gain', () => {
      const tiers = [
        { rateBps: 2000, thresholdMultiplier: 10 },
        { rateBps: 3000 },
      ]

      const result = calculateTieredPerformanceFee(
        {
          investmentAmount: 0,
          numShares: 1000,
          entryPricePerShare: 50,
          exitPricePerShare: 40,
        },
        tiers
      )
      expect(result).toBe(0)
    })
  })

  describe('calculateSpread', () => {
    it('calculates spread revenue', () => {
      // Spread = (15 - 10) × 1000 = 5,000
      const result = calculateSpread({
        investmentAmount: 0,
        numShares: 1000,
        entryPricePerShare: 15, // Investor price
        costPerShare: 10,
      })
      expect(result).toBe(5000)
    })

    it('returns 0 if investor price at or below cost', () => {
      const result = calculateSpread({
        investmentAmount: 0,
        numShares: 1000,
        entryPricePerShare: 10,
        costPerShare: 10,
      })
      expect(result).toBe(0)
    })
  })

  describe('calculateIntroducerCommission', () => {
    it('calculates commission on fee', () => {
      // Commission = 2000 × (500 / 10000) = 2000 × 0.05 = 100
      const result = calculateIntroducerCommission(2000, 500) // 5% commission
      expect(result).toBe(100)
    })
  })

  describe('calculateTotalWireAmount', () => {
    it('calculates total wire amount including subscription fee', () => {
      // Investment: 100,000, Fee: 100,000 × 0.02 = 2,000
      // Total: 102,000
      const result = calculateTotalWireAmount(100000, 200)
      expect(result).toBe(102000)
    })
  })

  describe('calculateNetFeeRetained', () => {
    it('calculates net fee after commission', () => {
      // Gross: 2000, Commission: 2000 × 0.10 = 200
      // Net: 1800
      const result = calculateNetFeeRetained(2000, 1000) // 10% commission
      expect(result).toBe(1800)
    })
  })

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatBps', () => {
    it('formats basis points as percentage', () => {
      expect(formatBps(200)).toBe('2.00%')
      expect(formatBps(150)).toBe('1.50%')
      expect(formatBps(50)).toBe('0.50%')
    })
  })
})
