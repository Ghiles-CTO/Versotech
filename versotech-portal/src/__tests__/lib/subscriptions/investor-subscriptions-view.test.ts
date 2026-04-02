import { describe, expect, it } from 'vitest'

import {
  buildInvestorSubscriptionsSummary,
  resolvePercentBasedFeeAmount,
  resolveSpreadAmount,
  sanitizeSubscriptionForViewer,
} from '@/lib/subscriptions/investor-subscriptions-view'

describe('investor subscriptions view helpers', () => {
  it('prefers explicit fee amounts over derived percentages', () => {
    expect(resolvePercentBasedFeeAmount(100_000, 1_250, 2)).toBe(1_250)
  })

  it('derives fee amounts from commitment and percent when explicit amount is missing', () => {
    expect(resolvePercentBasedFeeAmount(100_000, null, 2.5)).toBe(2_500)
  })

  it('derives spread totals from per-share spread when spread amount is missing', () => {
    expect(
      resolveSpreadAmount({
        spread_fee_amount: null,
        spread_per_share: 1.5,
        num_shares: 2_000,
      })
    ).toBe(3_000)
  })

  it('masks spread fields for viewers without spread access', () => {
    expect(
      sanitizeSubscriptionForViewer(
        {
          id: 'sub-1',
          spread_fee_amount: 4_500,
          spread_per_share: 2.25,
        },
        false
      )
    ).toEqual({
      id: 'sub-1',
      spread_fee_amount: null,
      spread_per_share: null,
    })
  })

  it('builds currency totals using derived subscription and management fees', () => {
    const summary = buildInvestorSubscriptionsSummary(
      [
        {
          vehicle_id: 'veh-1',
          currency: 'USD',
          commitment: 100_000,
          subscription_fee_percent: 2,
          subscription_fee_amount: null,
          management_fee_percent: 1.5,
          management_fee_amount: null,
          spread_fee_amount: null,
          spread_per_share: 1,
          num_shares: 1_000,
        },
        {
          vehicle_id: 'veh-2',
          currency: 'EUR',
          commitment: 80_000,
          subscription_fee_percent: null,
          subscription_fee_amount: 1_200,
          management_fee_percent: null,
          management_fee_amount: 900,
          spread_fee_amount: 700,
          spread_per_share: 0.5,
          num_shares: 1_400,
        },
      ],
      { canViewSpread: true }
    )

    expect(summary).toEqual({
      total_vehicles: 2,
      total_subscriptions: 2,
      total_commitment_by_currency: {
        USD: 100_000,
        EUR: 80_000,
      },
      total_subscription_fees_by_currency: {
        USD: 2_000,
        EUR: 1_200,
      },
      total_management_fees_by_currency: {
        USD: 1_500,
        EUR: 900,
      },
      total_spread_by_currency: {
        USD: 1_000,
        EUR: 700,
      },
    })
  })

  it('omits spread totals when the viewer cannot see spread', () => {
    const summary = buildInvestorSubscriptionsSummary(
      [
        {
          vehicle_id: 'veh-1',
          currency: 'USD',
          commitment: 100_000,
          spread_fee_amount: 5_000,
          spread_per_share: 5,
          num_shares: 1_000,
        },
      ],
      { canViewSpread: false }
    )

    expect(summary.total_spread_by_currency).toEqual({})
  })
})
