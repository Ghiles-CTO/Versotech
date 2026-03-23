import { describe, expect, it } from 'vitest'
import { hasInvestorAlreadyReceivedTermSheet } from '@/lib/deals/member-dispatch-rules'

describe('member dispatch rules', () => {
  it('blocks when the active membership already points to the same term sheet', () => {
    expect(
      hasInvestorAlreadyReceivedTermSheet({
        termSheetId: 'ts-1',
        membershipTermSheetId: 'ts-1',
        cycles: [],
      })
    ).toBe(true)
  })

  it('blocks when there is prior cycle history for the same term sheet', () => {
    expect(
      hasInvestorAlreadyReceivedTermSheet({
        termSheetId: 'ts-1',
        membershipTermSheetId: null,
        cycles: [{ term_sheet_id: 'ts-1' }],
      })
    ).toBe(true)
  })

  it('allows dispatch when the investor has never received that exact term sheet', () => {
    expect(
      hasInvestorAlreadyReceivedTermSheet({
        termSheetId: 'ts-2',
        membershipTermSheetId: 'ts-1',
        cycles: [{ term_sheet_id: 'ts-1' }],
      })
    ).toBe(false)
  })
})
