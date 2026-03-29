import { describe, expect, it } from 'vitest'
import { getRequesterApprovalNotificationCopy } from '@/lib/approvals/requester-notifications'

describe('getRequesterApprovalNotificationCopy', () => {
  it('adds the subscription-pack follow-up copy for approved subscriptions', () => {
    expect(
      getRequesterApprovalNotificationCopy({
        action: 'approve',
        entityType: 'deal_subscription',
      })
    ).toEqual({
      approvalLabel: 'subscription',
      title: 'subscription approved',
      message: 'Your subscription request has been approved. Your subscription pack will be sent for signature soon.',
    })
  })

  it('keeps generic approval copy for other entity types', () => {
    expect(
      getRequesterApprovalNotificationCopy({
        action: 'approve',
        entityType: 'deal_interest',
      })
    ).toEqual({
      approvalLabel: 'data room access',
      title: 'data room access approved',
      message: 'Your data room access request has been approved.',
    })
  })
})
