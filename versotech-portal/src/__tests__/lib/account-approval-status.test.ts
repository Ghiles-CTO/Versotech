import { describe, expect, it } from 'vitest'

import { getAccountStatusCopy } from '@/lib/account-approval-status'

describe('getAccountStatusCopy', () => {
  it('returns not yet approved for pending_onboarding accounts with approved kyc', () => {
    expect(getAccountStatusCopy('pending_onboarding', 'approved')).toMatchObject({
      label: 'NOT YET APPROVED',
      description: 'KYC is complete, but the account has not yet been submitted or approved.',
    })
  })

  it('keeps pending approval wording for accounts already submitted for approval', () => {
    expect(getAccountStatusCopy('pending_approval', 'approved')).toMatchObject({
      label: 'PENDING APPROVAL',
    })
  })
})
