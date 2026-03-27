const ACTIVE_INTEREST_REQUEST_STATUSES = new Set(['pending_review', 'approved'])

export interface DataRoomRequestAvailabilityInput {
  isAccountApproved: boolean
  isTrackingOnly: boolean
  canViewDataRoom: boolean
  hasDataRoomAccess: boolean
  canSignNda: boolean
  accessExpiresAt: string | null
  latestInterestStatus: string | null
}

export function hasExpiredDataRoomAccess(
  hasDataRoomAccess: boolean,
  accessExpiresAt: string | null,
  nowMs: number = Date.now()
): boolean {
  if (hasDataRoomAccess || !accessExpiresAt) return false

  const expiresAtMs = new Date(accessExpiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) return false

  return expiresAtMs <= nowMs
}

export function canRequestDataRoomAccess(
  input: DataRoomRequestAvailabilityInput,
  nowMs: number = Date.now()
): boolean {
  if (!input.isAccountApproved) return false
  if (input.isTrackingOnly) return false
  if (!input.canViewDataRoom) return false
  if (input.hasDataRoomAccess) return false
  if (input.canSignNda) return false
  if (hasExpiredDataRoomAccess(input.hasDataRoomAccess, input.accessExpiresAt, nowMs)) return false

  return !ACTIVE_INTEREST_REQUEST_STATUSES.has(input.latestInterestStatus ?? '')
}
