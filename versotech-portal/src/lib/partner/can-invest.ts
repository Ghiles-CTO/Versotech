import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

/**
 * Roles that allow direct subscription to deals
 * commercial_partner_proxy is excluded - it has its own endpoint at /api/commercial-partners/proxy-subscribe
 */
export const INVESTOR_ELIGIBLE_ROLES = [
  'investor',
  'partner_investor',
  'introducer_investor',
  'commercial_partner_investor',
  'co_investor'
] as const

/**
 * Roles that only allow tracking/viewing deals (cannot subscribe)
 */
export const TRACKING_ONLY_ROLES = [
  'partner',
  'lawyer',
  'viewer',
  'arranger',
  'verso_staff'
] as const

export type InvestorEligibleRole = typeof INVESTOR_ELIGIBLE_ROLES[number]
export type TrackingOnlyRole = typeof TRACKING_ONLY_ROLES[number]
export type DealMemberRole = InvestorEligibleRole | TrackingOnlyRole | 'commercial_partner_proxy' | 'introducer' | 'banker' | 'advisor' | 'spouse'

export interface PartnerAccessResult {
  /** Whether the partner can invest directly in this deal */
  canInvest: boolean
  /** Whether the partner has tracking-only access (cannot invest) */
  isTrackingOnly: boolean
  /** The partner's role in the deal membership */
  role: DealMemberRole | null
  /** Whether the partner has been dispatched to this deal */
  isDispatched: boolean
  /** Error message if access check failed */
  error?: string
}

/**
 * Check if a partner user can invest in a specific deal
 *
 * This checks the deal_memberships table for the user's role:
 * - partner_investor: Can invest directly
 * - partner: Tracking only (cannot invest)
 * - No membership: Cannot access deal
 *
 * @param userId - The user ID to check
 * @param dealId - The deal ID to check access for
 * @param isServer - Whether running in server context (uses service client)
 */
export async function canPartnerInvestInDeal(
  userId: string,
  dealId: string,
  isServer: boolean = true
): Promise<PartnerAccessResult> {
  try {
    const supabase = isServer ? createServiceClient() : createClient()

    const { data: membership, error } = await supabase
      .from('deal_memberships')
      .select('role, dispatched_at')
      .eq('user_id', userId)
      .eq('deal_id', dealId)
      .maybeSingle()

    if (error) {
      return {
        canInvest: false,
        isTrackingOnly: false,
        role: null,
        isDispatched: false,
        error: error.message
      }
    }

    if (!membership) {
      return {
        canInvest: false,
        isTrackingOnly: false,
        role: null,
        isDispatched: false
      }
    }

    const role = membership.role as DealMemberRole
    const isDispatched = !!membership.dispatched_at
    const canInvest = INVESTOR_ELIGIBLE_ROLES.includes(role as InvestorEligibleRole)
    const isTrackingOnly = TRACKING_ONLY_ROLES.includes(role as TrackingOnlyRole)

    return {
      canInvest,
      isTrackingOnly,
      role,
      isDispatched
    }
  } catch (err) {
    return {
      canInvest: false,
      isTrackingOnly: false,
      role: null,
      isDispatched: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Check if a role allows direct subscription
 */
export function isInvestorEligibleRole(role: string | null | undefined): boolean {
  if (!role) return false
  return INVESTOR_ELIGIBLE_ROLES.includes(role as InvestorEligibleRole)
}

/**
 * Check if a role is tracking-only (cannot subscribe)
 */
export function isTrackingOnlyRole(role: string | null | undefined): boolean {
  if (!role) return false
  return TRACKING_ONLY_ROLES.includes(role as TrackingOnlyRole)
}

/**
 * Get a human-readable label for a partner's access level
 */
export function getPartnerAccessLabel(role: DealMemberRole | null): string {
  if (!role) return 'No Access'

  switch (role) {
    case 'partner_investor':
      return 'Can Invest'
    case 'partner':
      return 'Tracking Only'
    case 'viewer':
      return 'View Only'
    case 'arranger':
      return 'Arranger'
    case 'lawyer':
      return 'Legal Counsel'
    case 'verso_staff':
      return 'Staff'
    default:
      if (isInvestorEligibleRole(role)) return 'Can Invest'
      return 'View Only'
  }
}
