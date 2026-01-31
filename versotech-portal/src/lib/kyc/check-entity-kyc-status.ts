import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Entity types that support KYC
 */
export type KYCEntityType =
  | 'investor'
  | 'partner'
  | 'introducer'
  | 'lawyer'
  | 'commercial_partner'
  | 'arranger'

/**
 * Maps entity types to their table names and member table names
 */
const ENTITY_CONFIG: Record<KYCEntityType, {
  entityTable: string
  memberTable: string
  entityIdColumn: string
}> = {
  investor: {
    entityTable: 'investors',
    memberTable: 'investor_members',
    entityIdColumn: 'investor_id',
  },
  partner: {
    entityTable: 'partners',
    memberTable: 'partner_members',
    entityIdColumn: 'partner_id',
  },
  introducer: {
    entityTable: 'introducers',
    memberTable: 'introducer_members',
    entityIdColumn: 'introducer_id',
  },
  lawyer: {
    entityTable: 'lawyers',
    memberTable: 'lawyer_members',
    entityIdColumn: 'lawyer_id',
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    memberTable: 'commercial_partner_members',
    entityIdColumn: 'commercial_partner_id',
  },
  arranger: {
    entityTable: 'arranger_entities',
    memberTable: 'arranger_members',
    entityIdColumn: 'arranger_id',
  },
}

/**
 * Determines entity type from a KYC submission based on which *_id field is set
 */
export function getEntityTypeFromSubmission(submission: any): {
  entityType: KYCEntityType | null
  entityId: string | null
  memberId: string | null
} {
  // Check member IDs first (personal KYC submissions)
  if (submission.investor_member_id) {
    return { entityType: 'investor', entityId: submission.investor_id, memberId: submission.investor_member_id }
  }
  if (submission.partner_member_id) {
    return { entityType: 'partner', entityId: submission.partner_id, memberId: submission.partner_member_id }
  }
  if (submission.introducer_member_id) {
    return { entityType: 'introducer', entityId: submission.introducer_id, memberId: submission.introducer_member_id }
  }
  if (submission.lawyer_member_id) {
    return { entityType: 'lawyer', entityId: submission.lawyer_id, memberId: submission.lawyer_member_id }
  }
  if (submission.commercial_partner_member_id) {
    return { entityType: 'commercial_partner', entityId: submission.commercial_partner_id, memberId: submission.commercial_partner_member_id }
  }
  if (submission.arranger_member_id) {
    return { entityType: 'arranger', entityId: submission.arranger_entity_id, memberId: submission.arranger_member_id }
  }

  // Check entity IDs (entity-level KYC submissions)
  if (submission.investor_id) {
    return { entityType: 'investor', entityId: submission.investor_id, memberId: null }
  }
  if (submission.partner_id) {
    return { entityType: 'partner', entityId: submission.partner_id, memberId: null }
  }
  if (submission.introducer_id) {
    return { entityType: 'introducer', entityId: submission.introducer_id, memberId: null }
  }
  if (submission.lawyer_id) {
    return { entityType: 'lawyer', entityId: submission.lawyer_id, memberId: null }
  }
  if (submission.commercial_partner_id) {
    return { entityType: 'commercial_partner', entityId: submission.commercial_partner_id, memberId: null }
  }
  if (submission.arranger_entity_id) {
    return { entityType: 'arranger', entityId: submission.arranger_entity_id, memberId: null }
  }

  return { entityType: null, entityId: null, memberId: null }
}

/**
 * Updates member KYC status to 'approved' when personal_info submission is approved
 */
export async function updateMemberKYCStatus(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  memberId: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const config = ENTITY_CONFIG[entityType]

  const updateData: any = {
    kyc_status: status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'approved') {
    updateData.kyc_approved_at = new Date().toISOString()
  }

  if (notes) {
    updateData.kyc_notes = notes
  }

  const { error } = await supabase
    .from(config.memberTable)
    .update(updateData)
    .eq('id', memberId)

  if (error) {
    console.error(`Error updating ${config.memberTable} KYC status:`, error)
    throw error
  }

  console.log(`[KYC] Updated ${config.memberTable} member ${memberId} to ${status}`)
}

/**
 * Checks if all KYC requirements are met for an entity and updates status
 *
 * For entities, this checks:
 * 1. Entity-level KYC info is submitted/approved (entity_info document_type)
 * 2. All active members have approved personal KYC (personal_info document_type)
 *
 * When all requirements are met:
 * - Entity kyc_status is updated to 'approved'
 * - Entity account_approval_status is updated to 'pending_approval'
 * - An account_activation approval is created
 */
export async function checkAndUpdateEntityKYCStatus(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string
) {
  const config = ENTITY_CONFIG[entityType]

  try {
    // Get entity current status
    const { data: entity, error: entityError } = await supabase
      .from(config.entityTable)
      .select('id, kyc_status, account_approval_status')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      console.error(`[KYC] Entity ${entityId} not found in ${config.entityTable}`)
      return
    }

    // Already approved - nothing to do
    if (entity.kyc_status === 'approved') {
      console.log(`[KYC] Entity ${entityId} already has approved KYC status`)
      return
    }

    // Get all KYC submissions for this entity
    const { data: submissions, error: submissionsError } = await supabase
      .from('kyc_submissions')
      .select('id, document_type, status, investor_member_id, partner_member_id, introducer_member_id, lawyer_member_id, commercial_partner_member_id, arranger_member_id')
      .eq(`${entityType === 'arranger' ? 'arranger_entity_id' : entityType + '_id'}`, entityId)

    if (submissionsError) {
      console.error(`[KYC] Error fetching submissions for ${entityType} ${entityId}:`, submissionsError)
      return
    }

    if (!submissions || submissions.length === 0) {
      console.log(`[KYC] No submissions found for ${entityType} ${entityId}`)
      return
    }

    // Check if entity_info submission is approved
    const entityInfoApproved = submissions.some(
      s => s.document_type === 'entity_info' && s.status === 'approved'
    )

    if (!entityInfoApproved) {
      console.log(`[KYC] Entity ${entityId}: entity_info not approved yet`)
      return
    }

    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from(config.memberTable)
      .select('id, full_name, kyc_status')
      .eq(config.entityIdColumn, entityId)
      .eq('is_active', true)

    if (membersError) {
      console.error(`[KYC] Error fetching members for ${entityType} ${entityId}:`, membersError)
      return
    }

    // Check all members have approved KYC
    if (members && members.length > 0) {
      const memberIdColumn = `${entityType === 'arranger' ? 'arranger' : entityType}_member_id`

      for (const member of members) {
        // Check if this member has an approved personal_info submission
        const memberSubmissionApproved = submissions.some(
          s => s.document_type === 'personal_info' &&
               s.status === 'approved' &&
               s[memberIdColumn as keyof typeof s] === member.id
        )

        // Also check member's direct kyc_status
        const memberApproved = member.kyc_status === 'approved' || memberSubmissionApproved

        if (!memberApproved) {
          console.log(`[KYC] Entity ${entityId}: Member ${member.full_name} (${member.id}) not approved yet`)
          return
        }
      }
    }

    // All requirements met - update entity KYC status
    console.log(`[KYC] All requirements met for ${entityType} ${entityId} - updating to approved`)

    await supabase
      .from(config.entityTable)
      .update({
        kyc_status: 'approved',
        account_approval_status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId)

    // Create account activation approval
    await createAccountActivationApproval(supabase, entityType, entityId)

  } catch (error) {
    console.error(`[KYC] Error checking entity KYC status for ${entityType} ${entityId}:`, error)
  }
}

/**
 * Creates an account_activation approval request when KYC is fully approved
 */
async function createAccountActivationApproval(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string
) {
  const config = ENTITY_CONFIG[entityType]

  try {
    // Get entity name for approval metadata
    const { data: entity } = await supabase
      .from(config.entityTable)
      .select('legal_name, display_name')
      .eq('id', entityId)
      .single()

    const entityName = entity?.display_name || entity?.legal_name || 'Unknown Entity'

    // Find the primary user (member with linked_user_id) to set as requested_by
    const { data: primaryMember } = await supabase
      .from(config.memberTable)
      .select('linked_user_id')
      .eq(config.entityIdColumn, entityId)
      .not('linked_user_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const requestedBy = primaryMember?.linked_user_id || null

    // Check if there's already a pending activation approval
    const { data: existingApproval } = await supabase
      .from('approvals')
      .select('id')
      .eq('entity_type', 'account_activation')
      .eq('entity_id', entityId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingApproval) {
      console.log(`[KYC] Account activation approval already exists for ${entityType} ${entityId}`)
      return
    }

    // Create approval request
    await supabase
      .from('approvals')
      .insert({
        entity_type: 'account_activation',
        entity_id: entityId,
        status: 'pending',
        priority: 'medium',
        requested_by: requestedBy,
        entity_metadata: {
          entity_table: config.entityTable,
          entity_name: entityName,
          persona_type: entityType,
        },
        created_at: new Date().toISOString(),
      })

    console.log(`[KYC] Created account activation approval for ${entityType} ${entityId}${requestedBy ? ` (requested_by: ${requestedBy})` : ''}`)

  } catch (error) {
    console.error(`[KYC] Error creating account activation approval:`, error)
  }
}

/**
 * Handles the full KYC review flow for any entity type
 *
 * This is called from the KYC review endpoint after approving a submission.
 * It:
 * 1. Updates member kyc_status if this is a personal_info submission
 * 2. Checks overall entity KYC status
 * 3. Creates account activation approval if all KYC is complete
 */
export async function handleKYCApproval(
  supabase: SupabaseClient,
  submission: any
) {
  const { entityType, entityId, memberId } = getEntityTypeFromSubmission(submission)

  if (!entityType || !entityId) {
    console.error('[KYC] Could not determine entity type from submission:', submission.id)
    return
  }

  // If this is a personal_info submission for a member, update member status
  if (submission.document_type === 'personal_info' && memberId) {
    await updateMemberKYCStatus(supabase, entityType, memberId, 'approved')
  }

  // Check and update overall entity KYC status
  await checkAndUpdateEntityKYCStatus(supabase, entityType, entityId)
}
