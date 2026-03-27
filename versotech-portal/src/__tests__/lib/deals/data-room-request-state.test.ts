import { describe, expect, it } from 'vitest'
import {
  canRequestDataRoomAccess,
  hasExpiredDataRoomAccess,
} from '@/lib/deals/data-room-request-state'

describe('data room request state', () => {
  it('allows requesting data room access after the direct confirm-interest path when no request is already in flight', () => {
    expect(
      canRequestDataRoomAccess({
        isAccountApproved: true,
        isTrackingOnly: false,
        canViewDataRoom: true,
        hasDataRoomAccess: false,
        canSignNda: false,
        accessExpiresAt: null,
        latestInterestStatus: null,
      })
    ).toBe(true)
  })

  it('blocks duplicate requests when a data room request is already pending review', () => {
    expect(
      canRequestDataRoomAccess({
        isAccountApproved: true,
        isTrackingOnly: false,
        canViewDataRoom: true,
        hasDataRoomAccess: false,
        canSignNda: false,
        accessExpiresAt: null,
        latestInterestStatus: 'pending_review',
      })
    ).toBe(false)
  })

  it('blocks duplicate requests when a data room request is already approved and NDA signing should take over', () => {
    expect(
      canRequestDataRoomAccess({
        isAccountApproved: true,
        isTrackingOnly: false,
        canViewDataRoom: true,
        hasDataRoomAccess: false,
        canSignNda: false,
        accessExpiresAt: null,
        latestInterestStatus: 'approved',
      })
    ).toBe(false)
  })

  it('treats expired access as a separate state instead of a normal request-access state', () => {
    const nowMs = new Date('2026-03-27T12:00:00.000Z').getTime()

    expect(
      hasExpiredDataRoomAccess(false, '2026-03-20T12:00:00.000Z', nowMs)
    ).toBe(true)

    expect(
      canRequestDataRoomAccess({
        isAccountApproved: true,
        isTrackingOnly: false,
        canViewDataRoom: true,
        hasDataRoomAccess: false,
        canSignNda: false,
        accessExpiresAt: '2026-03-20T12:00:00.000Z',
        latestInterestStatus: null,
      }, nowMs)
    ).toBe(false)
  })
})
