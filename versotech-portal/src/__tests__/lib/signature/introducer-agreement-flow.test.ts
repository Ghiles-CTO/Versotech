import { describe, expect, it } from 'vitest'
import {
  areRequiredIntroducerInternalSignaturesComplete,
  canSignIntroducerAgreement,
} from '@/lib/signature/introducer-agreement-flow'
import { getRequiredAnchorsForIntroducerAgreement } from '@/lib/signature/anchor-detector'

describe('introducer-agreement-flow', () => {
  it('requires both CEO and arranger when an arranger is present', () => {
    const requests = [
      { id: 'sig-admin', signer_role: 'admin', status: 'signed', signature_position: 'party_a' },
      { id: 'sig-arranger', signer_role: 'arranger', status: 'pending', signature_position: 'party_c' },
    ]

    expect(areRequiredIntroducerInternalSignaturesComplete(requests, true)).toBe(false)
  })

  it('releases once both CEO and arranger are signed', () => {
    const requests = [
      { id: 'sig-admin', signer_role: 'admin', status: 'signed', signature_position: 'party_a' },
      { id: 'sig-arranger', signer_role: 'arranger', status: 'signed', signature_position: 'party_c' },
    ]

    expect(areRequiredIntroducerInternalSignaturesComplete(requests, true)).toBe(true)
  })

  it('still allows CEO-only internal completion when no arranger exists', () => {
    const requests = [
      { id: 'sig-admin', signer_role: 'admin', status: 'signed', signature_position: 'party_a' },
    ]

    expect(areRequiredIntroducerInternalSignaturesComplete(requests, false)).toBe(true)
  })

  it('only allows introducer signing after internal release', () => {
    expect(canSignIntroducerAgreement('pending_introducer_signature', 'introducer', true)).toBe(true)
    expect(canSignIntroducerAgreement('pending_ceo_signature', 'introducer', true)).toBe(false)
  })

  it('allows internal signing in approved and pending internal states', () => {
    expect(canSignIntroducerAgreement('approved', 'admin', true)).toBe(true)
    expect(canSignIntroducerAgreement('pending_arranger_signature', 'admin', true)).toBe(true)
    expect(canSignIntroducerAgreement('pending_ceo_signature', 'arranger', true)).toBe(true)
  })

  it('requires a separate arranger anchor when the agreement has an arranger', () => {
    expect(getRequiredAnchorsForIntroducerAgreement(2, true)).toEqual([
      'party_a',
      'party_c',
      'party_b',
      'party_b_2',
    ])
  })
})
