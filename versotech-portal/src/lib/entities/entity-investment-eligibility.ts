/**
 * Entity Investment Eligibility Check
 *
 * Determines if an entity can invest based on:
 * 1. Entity KYC status (must be approved/completed)
 * 2. All signatory members must have:
 *    - CEO approval (ceo_approval_status = 'approved')
 *    - Individual KYC approved (kyc_status = 'approved' or 'completed')
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface EligibilityBlocker {
  type: 'entity_kyc' | 'member_kyc' | 'member_approval'
  message: string
  details?: {
    member_name?: string
    member_id?: string
    status?: string
  }
}

export interface EntityInvestmentEligibility {
  canInvest: boolean
  blockers: EligibilityBlocker[]
  entityKycStatus?: string
  signatoryCount: number
  approvedSignatoryCount: number
}

// Entity type to table mapping
const ENTITY_TABLES: Record<string, string> = {
  investor: 'investors',
  partner: 'partners',
  introducer: 'introducers',
  commercial_partner: 'commercial_partners',
  lawyer: 'lawyers',
  arranger: 'arranger_entities'
}

// User junction table mapping
const USER_TABLES: Record<string, string> = {
  investor: 'investor_users',
  partner: 'partner_users',
  introducer: 'introducer_users',
  commercial_partner: 'commercial_partner_users',
  lawyer: 'lawyer_users',
  arranger: 'arranger_users'
}

// Entity ID column in junction tables
const ENTITY_ID_COLUMNS: Record<string, string> = {
  investor: 'investor_id',
  partner: 'partner_id',
  introducer: 'introducer_id',
  commercial_partner: 'commercial_partner_id',
  lawyer: 'lawyer_id',
  arranger: 'arranger_id'
}

/**
 * Check if an entity can invest based on KYC and member approval requirements
 *
 * @param supabase - Supabase client (service client recommended for full access)
 * @param entityId - The ID of the entity
 * @param entityType - The type of entity (investor, partner, etc.)
 * @returns Eligibility result with blockers if any
 */
export async function canEntityInvest(
  supabase: SupabaseClient,
  entityId: string,
  entityType: string
): Promise<EntityInvestmentEligibility> {
  const blockers: EligibilityBlocker[] = []
  let entityKycStatus: string | undefined
  let signatoryCount = 0
  let approvedSignatoryCount = 0

  // Validate entity type
  const entityTable = ENTITY_TABLES[entityType]
  const userTable = USER_TABLES[entityType]
  const entityIdColumn = ENTITY_ID_COLUMNS[entityType]

  if (!entityTable || !userTable || !entityIdColumn) {
    return {
      canInvest: false,
      blockers: [{
        type: 'entity_kyc',
        message: `Unknown entity type: ${entityType}`
      }],
      signatoryCount: 0,
      approvedSignatoryCount: 0
    }
  }

  // 1. Check entity KYC status
  const { data: entity, error: entityError } = await supabase
    .from(entityTable)
    .select('id, kyc_status')
    .eq('id', entityId)
    .single()

  if (entityError || !entity) {
    return {
      canInvest: false,
      blockers: [{
        type: 'entity_kyc',
        message: 'Entity not found'
      }],
      signatoryCount: 0,
      approvedSignatoryCount: 0
    }
  }

  entityKycStatus = entity.kyc_status

  // Entity KYC must be approved or completed
  const validEntityKycStatuses = ['approved', 'completed', 'verified']
  if (!entity.kyc_status || !validEntityKycStatuses.includes(entity.kyc_status.toLowerCase())) {
    blockers.push({
      type: 'entity_kyc',
      message: `Entity KYC is ${entity.kyc_status || 'not started'}. KYC must be approved before investing.`,
      details: {
        status: entity.kyc_status
      }
    })
  }

  // 2. Get all signatory members and check their CEO approval status
  // We need to check members where can_sign = true OR is_signatory = true
  const { data: members, error: membersError } = await supabase
    .from(userTable)
    .select(`
      user_id,
      role,
      can_sign,
      ceo_approval_status,
      ceo_approved_at,
      profiles:user_id(
        id,
        display_name,
        email
      )
    `)
    .eq(entityIdColumn, entityId)
    .or('can_sign.eq.true,role.eq.admin,role.eq.owner')  // Check signatories

  if (membersError) {
    console.error('Error fetching members:', membersError)
    return {
      canInvest: false,
      blockers: [{
        type: 'member_approval',
        message: 'Failed to verify member status'
      }],
      entityKycStatus,
      signatoryCount: 0,
      approvedSignatoryCount: 0
    }
  }

  // Filter to actual signatories (can_sign = true)
  const signatories = members?.filter(m => m.can_sign === true) || []
  signatoryCount = signatories.length

  // If no explicit signatories, check admin/owner members
  const signatoriesToCheck = signatoryCount > 0
    ? signatories
    : (members?.filter(m => ['admin', 'owner'].includes(m.role)) || [])

  if (signatoriesToCheck.length === 0) {
    blockers.push({
      type: 'member_approval',
      message: 'No authorized signatories found for this entity'
    })
  }

  // 3. Get member KYC status from kyc_submissions table
  // For investors, member KYC is tracked via kyc_submissions.investor_member_id
  const memberUserIds = signatoriesToCheck.map(m => m.user_id)

  // Query KYC submissions for these members
  // A member has approved KYC if they have at least one approved KYC submission
  const { data: kycSubmissions } = await supabase
    .from('kyc_submissions')
    .select('investor_member_id, status')
    .eq('investor_id', entityId)
    .in('investor_member_id', memberUserIds)
    .eq('status', 'approved')

  // Build a set of members with approved KYC
  const membersWithApprovedKyc = new Set(
    kycSubmissions?.map(k => k.investor_member_id) || []
  )

  // Check each signatory
  for (const member of signatoriesToCheck) {
    const profile = member.profiles as unknown as {
      id: string
      display_name?: string
      email?: string
    } | null

    const memberName = profile?.display_name || profile?.email || 'Unknown member'
    const hasApprovedKyc = membersWithApprovedKyc.has(member.user_id)

    // Check CEO approval status
    if (member.ceo_approval_status !== 'approved') {
      blockers.push({
        type: 'member_approval',
        message: `Member "${memberName}" is not CEO-approved`,
        details: {
          member_name: memberName,
          member_id: member.user_id,
          status: member.ceo_approval_status || 'pending'
        }
      })
    }

    // Check individual KYC status via kyc_submissions
    if (!hasApprovedKyc) {
      blockers.push({
        type: 'member_kyc',
        message: `Member "${memberName}" KYC is not approved`,
        details: {
          member_name: memberName,
          member_id: member.user_id,
          status: 'not_approved'
        }
      })
    }

    // Count approved signatories
    if (member.ceo_approval_status === 'approved' && hasApprovedKyc) {
      approvedSignatoryCount++
    }
  }

  return {
    canInvest: blockers.length === 0,
    blockers,
    entityKycStatus,
    signatoryCount: signatoriesToCheck.length,
    approvedSignatoryCount
  }
}

/**
 * Get a human-readable summary of eligibility blockers
 */
export function getEligibilityBlockersSummary(blockers: EligibilityBlocker[]): string {
  if (blockers.length === 0) return 'Entity is eligible to invest'

  const entityKycBlockers = blockers.filter(b => b.type === 'entity_kyc')
  const memberKycBlockers = blockers.filter(b => b.type === 'member_kyc')
  const memberApprovalBlockers = blockers.filter(b => b.type === 'member_approval')

  const parts: string[] = []

  if (entityKycBlockers.length > 0) {
    parts.push('Entity KYC not approved')
  }

  if (memberApprovalBlockers.length > 0) {
    const count = memberApprovalBlockers.length
    parts.push(`${count} member${count > 1 ? 's' : ''} not CEO-approved`)
  }

  if (memberKycBlockers.length > 0) {
    const count = memberKycBlockers.length
    parts.push(`${count} member${count > 1 ? 's' : ''} with incomplete KYC`)
  }

  return parts.join(', ')
}
