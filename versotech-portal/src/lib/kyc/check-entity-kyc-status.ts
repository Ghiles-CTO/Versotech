import { SupabaseClient } from '@supabase/supabase-js'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

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

type EntityConfig = {
  entityTable: string
  memberTable: string
  userTable: string
  entityIdColumn: string
}

/**
 * Maps entity types to their table names and relationship columns.
 */
const ENTITY_CONFIG: Record<KYCEntityType, EntityConfig> = {
  investor: {
    entityTable: 'investors',
    memberTable: 'investor_members',
    userTable: 'investor_users',
    entityIdColumn: 'investor_id',
  },
  partner: {
    entityTable: 'partners',
    memberTable: 'partner_members',
    userTable: 'partner_users',
    entityIdColumn: 'partner_id',
  },
  introducer: {
    entityTable: 'introducers',
    memberTable: 'introducer_members',
    userTable: 'introducer_users',
    entityIdColumn: 'introducer_id',
  },
  lawyer: {
    entityTable: 'lawyers',
    memberTable: 'lawyer_members',
    userTable: 'lawyer_users',
    entityIdColumn: 'lawyer_id',
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    memberTable: 'commercial_partner_members',
    userTable: 'commercial_partner_users',
    entityIdColumn: 'commercial_partner_id',
  },
  arranger: {
    entityTable: 'arranger_entities',
    memberTable: 'arranger_members',
    userTable: 'arranger_users',
    entityIdColumn: 'arranger_id',
  },
}

const STANDARD_ENTITY_DOCUMENTS = [
  'incorporation_certificate',
  'memo_articles',
  'register_members',
  'register_beneficial_owners',
  'register_directors',
  'bank_confirmation',
]

const REQUIRED_ENTITY_DOCUMENTS: Record<KYCEntityType, string[]> = {
  investor: [...STANDARD_ENTITY_DOCUMENTS],
  partner: [...STANDARD_ENTITY_DOCUMENTS],
  introducer: [...STANDARD_ENTITY_DOCUMENTS],
  lawyer: [...STANDARD_ENTITY_DOCUMENTS],
  commercial_partner: [...STANDARD_ENTITY_DOCUMENTS],
  arranger: [...STANDARD_ENTITY_DOCUMENTS],
}

const ENTITY_DOCUMENT_ALIASES: Record<string, string[]> = {
  incorporation_certificate: ['certificate_of_incorporation'],
  memo_articles: ['company_registration', 'memorandum_articles'],
  register_beneficial_owners: ['beneficial_ownership'],
  register_directors: ['directors_list'],
  bank_confirmation: ['bank_account_details'],
}

const ACCOUNT_BLOCKED_STATUSES = new Set(['approved', 'unauthorized', 'blacklisted'])

type SubmissionRow = {
  id: string
  document_type: string
  status: string
  submitted_at?: string | null
  reviewed_at?: string | null
  metadata?: Record<string, unknown> | null
  investor_member_id?: string | null
  partner_member_id?: string | null
  introducer_member_id?: string | null
  lawyer_member_id?: string | null
  commercial_partner_member_id?: string | null
  arranger_member_id?: string | null
}

type MemberRow = {
  id: string
  full_name?: string | null
  kyc_status?: string | null
  role?: string | null
  is_signatory?: boolean | null
  linked_user_id?: string | null
}

type AccountRequestInfoSection =
  | 'general'
  | 'entity_info'
  | 'personal_info'
  | 'documents'
  | 'members'

type AccountRequestInfoState = {
  active: boolean
  requested_at: string | null
  requested_by: string | null
  reason: string | null
  details: string | null
  sections: AccountRequestInfoSection[]
}

type AccountActivationApprovalState = {
  hasPending: boolean
  hasApproved: boolean
  pendingApprovalId: string | null
  pendingEntityMetadata: Record<string, unknown> | null
  activeRequestInfo: AccountRequestInfoState | null
}

function isAccountRequestInfoSection(value: unknown): value is AccountRequestInfoSection {
  return (
    value === 'general' ||
    value === 'entity_info' ||
    value === 'personal_info' ||
    value === 'documents' ||
    value === 'members'
  )
}

function parseActiveAccountRequestInfo(entityMetadata: unknown): AccountRequestInfoState | null {
  if (!entityMetadata || typeof entityMetadata !== 'object' || Array.isArray(entityMetadata)) {
    return null
  }

  const requestInfo = (entityMetadata as Record<string, unknown>).request_info
  if (!requestInfo || typeof requestInfo !== 'object' || Array.isArray(requestInfo)) {
    return null
  }

  const parsed = requestInfo as Record<string, unknown>
  if (parsed.active !== true) {
    return null
  }

  const rawSections = Array.isArray(parsed.sections) ? parsed.sections : []
  const sections = rawSections.filter(isAccountRequestInfoSection)

  return {
    active: true,
    requested_at: typeof parsed.requested_at === 'string' ? parsed.requested_at : null,
    requested_by: typeof parsed.requested_by === 'string' ? parsed.requested_by : null,
    reason: typeof parsed.reason === 'string' ? parsed.reason : null,
    details: typeof parsed.details === 'string' ? parsed.details : null,
    sections: sections.length > 0 ? sections : ['general'],
  }
}

function getSubmissionDecisionTimestamp(submission: SubmissionRow): number | null {
  const rawValue = submission.reviewed_at || submission.submitted_at
  if (!rawValue) return null
  const parsed = Date.parse(rawValue)
  return Number.isFinite(parsed) ? parsed : null
}

function getFreshApprovedSubmissionsAfter(
  approvedSubmissions: SubmissionRow[],
  requestedAt: string | null
) {
  if (!requestedAt) return approvedSubmissions
  const requestedAtMs = Date.parse(requestedAt)
  if (!Number.isFinite(requestedAtMs)) return approvedSubmissions

  return approvedSubmissions.filter((submission) => {
    const decisionTime = getSubmissionDecisionTimestamp(submission)
    return decisionTime !== null && decisionTime > requestedAtMs
  })
}

function hasSatisfiedActiveRequestInfo(params: {
  requestInfo: AccountRequestInfoState
  entityType: KYCEntityType
  isIndividual: boolean
  submissionMemberColumn: string
  relevantMembers: MemberRow[]
  approvedSubmissions: SubmissionRow[]
}) {
  const {
    requestInfo,
    entityType,
    isIndividual,
    submissionMemberColumn,
    relevantMembers,
    approvedSubmissions,
  } = params

  const freshApprovedSubmissions = getFreshApprovedSubmissionsAfter(
    approvedSubmissions,
    requestInfo.requested_at
  )

  if (freshApprovedSubmissions.length === 0) {
    return false
  }

  const sectionSet = new Set<AccountRequestInfoSection>(
    requestInfo.sections.length > 0 ? requestInfo.sections : ['general']
  )
  const checks: boolean[] = []

  if (sectionSet.has('general')) {
    checks.push(freshApprovedSubmissions.length > 0)
  }

  if (sectionSet.has('entity_info')) {
    checks.push(
      hasApprovedSubmissionForType(
        freshApprovedSubmissions,
        'entity_info',
        submissionMemberColumn,
        null
      )
    )
  }

  if (sectionSet.has('documents')) {
    if (isIndividual && entityType === 'investor') {
      checks.push(
        hasApprovedIdDocument(freshApprovedSubmissions, submissionMemberColumn, null) &&
        hasApprovedProofOfAddress(freshApprovedSubmissions, submissionMemberColumn, null)
      )
    } else if (isIndividual) {
      checks.push(
        relevantMembers.length > 0 &&
        relevantMembers.every((member) =>
          hasApprovedIdDocument(
            freshApprovedSubmissions,
            submissionMemberColumn,
            member.id,
            false
          ) &&
          hasApprovedProofOfAddress(
            freshApprovedSubmissions,
            submissionMemberColumn,
            member.id,
            false
          )
        )
      )
    } else {
      const requiredEntityDocs = REQUIRED_ENTITY_DOCUMENTS[entityType] || []
      checks.push(
        requiredEntityDocs.every((documentType) =>
          hasApprovedEntityDocument(
            freshApprovedSubmissions,
            documentType,
            submissionMemberColumn
          )
        )
      )
    }
  }

  if (sectionSet.has('personal_info')) {
    if (isIndividual && entityType === 'investor') {
      checks.push(
        hasApprovedSubmissionForType(
          freshApprovedSubmissions,
          'personal_info',
          submissionMemberColumn,
          null
        )
      )
    } else {
      checks.push(
        relevantMembers.length > 0 &&
        relevantMembers.every((member) =>
          hasApprovedSubmissionForType(
            freshApprovedSubmissions,
            'personal_info',
            submissionMemberColumn,
            member.id
          )
        )
      )
    }
  }

  if (sectionSet.has('members')) {
    const hasFreshMemberEvidence = freshApprovedSubmissions.some(
      (submission) => !!(submission as any)[submissionMemberColumn]
    )

    const allMembersCurrentlyApproved =
      relevantMembers.length > 0 &&
      relevantMembers.every((member) => {
        const hasPersonalInfo = hasApprovedSubmissionForType(
          approvedSubmissions,
          'personal_info',
          submissionMemberColumn,
          member.id
        )
        return (
          hasPersonalInfo &&
          hasApprovedIdDocument(approvedSubmissions, submissionMemberColumn, member.id, false) &&
          hasApprovedProofOfAddress(approvedSubmissions, submissionMemberColumn, member.id, false)
        )
      })

    checks.push(allMembersCurrentlyApproved && hasFreshMemberEvidence)
  }

  return checks.length > 0 && checks.every(Boolean)
}

async function clearActiveRequestInfoMarker(params: {
  supabase: SupabaseClient
  approvalId: string
  currentEntityMetadata: Record<string, unknown> | null
  requestInfo: AccountRequestInfoState
}) {
  const { supabase, approvalId, currentEntityMetadata, requestInfo } = params
  const resolvedAt = new Date().toISOString()
  const metadata = currentEntityMetadata ? { ...currentEntityMetadata } : {}
  const history = Array.isArray(metadata.request_info_history)
    ? metadata.request_info_history.filter((entry) => !!entry && typeof entry === 'object')
    : []

  const resolvedInfo = {
    ...requestInfo,
    active: false,
    resolved_at: resolvedAt,
  }

  await supabase
    .from('approvals')
    .update({
      entity_metadata: {
        ...metadata,
        request_info: resolvedInfo,
        last_request_info: resolvedInfo,
        request_info_history: [...history, resolvedInfo],
      },
      updated_at: resolvedAt,
    })
    .eq('id', approvalId)
    .eq('status', 'pending')
}

function getSubmissionEntityColumn(entityType: KYCEntityType) {
  return entityType === 'arranger' ? 'arranger_entity_id' : `${entityType}_id`
}

function getSubmissionMemberColumn(entityType: KYCEntityType) {
  return `${entityType === 'arranger' ? 'arranger' : entityType}_member_id`
}

function normalizeStatus(value?: string | null) {
  return value ? value.toLowerCase().trim() : null
}

function getEntityName(entity: any): string {
  if (!entity) return 'Unknown Entity'
  return (
    entity.display_name ||
    entity.legal_name ||
    entity.name ||
    entity.firm_name ||
    entity.company_name ||
    'Unknown Entity'
  )
}

function isIndividualEntity(entityType: KYCEntityType, entity: any) {
  const normalizedType = normalizeStatus(entity?.type)
  if (entityType === 'investor') {
    return normalizedType === 'individual'
  }
  return normalizedType === 'individual'
}

function hasApprovedSubmissionForType(
  submissions: SubmissionRow[],
  documentType: string,
  memberColumn?: string,
  memberId?: string | null
) {
  return submissions.some((submission: any) => {
    if (submission.status !== 'approved') return false
    if (submission.document_type !== documentType) return false

    if (!memberColumn) return true

    if (memberId === undefined) return true
    if (memberId === null) return !submission[memberColumn]
    return submission[memberColumn] === memberId
  })
}

function hasApprovedIdDocument(
  submissions: SubmissionRow[],
  memberColumn: string,
  memberId?: string | null,
  allowEntityLevelFallback = false
) {
  return submissions.some((submission: any) => {
    if (submission.status !== 'approved') return false
    if (!isIdDocument(submission.document_type)) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission[memberColumn]
    if (submission[memberColumn] === memberId) return true
    return allowEntityLevelFallback && !submission[memberColumn]
  })
}

function hasApprovedProofOfAddress(
  submissions: SubmissionRow[],
  memberColumn: string,
  memberId?: string | null,
  allowEntityLevelFallback = false
) {
  return submissions.some((submission: any) => {
    if (submission.status !== 'approved') return false
    if (!isProofOfAddress(submission.document_type)) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission[memberColumn]
    if (submission[memberColumn] === memberId) return true
    return allowEntityLevelFallback && !submission[memberColumn]
  })
}

function hasApprovedEntityDocument(
  submissions: SubmissionRow[],
  documentType: string,
  memberColumn: string
) {
  const acceptedDocumentTypes = [documentType, ...(ENTITY_DOCUMENT_ALIASES[documentType] || [])]
  return acceptedDocumentTypes.some(type =>
    hasApprovedSubmissionForType(submissions, type, memberColumn, null)
  )
}

async function setAccountPendingApprovalIfNeeded(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string,
  currentAccountStatus?: string | null
) {
  const config = ENTITY_CONFIG[entityType]
  const normalizedCurrentStatus = normalizeStatus(currentAccountStatus)

  if (normalizedCurrentStatus && ACCOUNT_BLOCKED_STATUSES.has(normalizedCurrentStatus)) {
    return
  }

  if (normalizedCurrentStatus !== 'pending_approval') {
    await supabase
      .from(config.entityTable)
      .update({
        account_approval_status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId)
  }
}

async function resolveRequestedBy(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string
) {
  const config = ENTITY_CONFIG[entityType]

  const { data: primaryUser } = await supabase
    .from(config.userTable)
    .select('user_id')
    .eq(config.entityIdColumn, entityId)
    .eq('is_primary', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (primaryUser?.user_id) {
    return primaryUser.user_id as string
  }

  const { data: memberWithUser } = await supabase
    .from(config.memberTable)
    .select('linked_user_id')
    .eq(config.entityIdColumn, entityId)
    .eq('is_active', true)
    .not('linked_user_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (memberWithUser?.linked_user_id) {
    return memberWithUser.linked_user_id as string
  }

  const { data: anyUser } = await supabase
    .from(config.userTable)
    .select('user_id')
    .eq(config.entityIdColumn, entityId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (anyUser?.user_id as string | null) ?? null
}

async function resolveApprovalAssignee(supabase: SupabaseClient): Promise<string | null> {
  const { data: ceo } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'ceo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ceo?.id) {
    return ceo.id as string
  }

  const { data: staffAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'staff_admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (staffAdmin?.id as string | null) ?? null
}

/**
 * Determines entity type from a KYC submission based on which *_id field is set.
 */
export function getEntityTypeFromSubmission(submission: any): {
  entityType: KYCEntityType | null
  entityId: string | null
  memberId: string | null
} {
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
 * Updates member KYC status after a personal_info review decision.
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
    console.error(`[KYC] Failed to update ${config.memberTable} member ${memberId}:`, error)
    throw error
  }
}

/**
 * Creates an account activation approval request when KYC requirements are complete.
 */
async function createAccountActivationApproval(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string
) {
  const config = ENTITY_CONFIG[entityType]

  const { data: existingApproval } = await supabase
    .from('approvals')
    .select('id, status')
    .eq('entity_type', 'account_activation')
    .eq('entity_id', entityId)
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingApproval) {
    return
  }

  const { data: entity } = await supabase
    .from(config.entityTable)
    .select('*')
    .eq('id', entityId)
    .maybeSingle()

  const requestedBy = await resolveRequestedBy(supabase, entityType, entityId)
  const assignedTo = await resolveApprovalAssignee(supabase)
  const safeRequestedBy = requestedBy || assignedTo

  const { error: approvalInsertError } = await supabase
    .from('approvals')
    .insert({
      entity_type: 'account_activation',
      entity_id: entityId,
      status: 'pending',
      priority: 'medium',
      requested_by: safeRequestedBy,
      assigned_to: assignedTo,
      entity_metadata: {
        entity_table: config.entityTable,
        entity_name: getEntityName(entity),
        persona_type: entityType,
      },
      created_at: new Date().toISOString(),
    })

  if (approvalInsertError) {
    // Safe idempotency in race scenarios (paired with DB unique index migration).
    if ((approvalInsertError as any)?.code === '23505') {
      return
    }
    console.error(`[KYC] Failed to create account activation approval for ${entityType}:${entityId}`, {
      error: approvalInsertError,
      requestedBy,
      assignedTo,
    })
  }
}

async function getAccountActivationApprovalState(
  supabase: SupabaseClient,
  entityId: string
): Promise<AccountActivationApprovalState> {
  const { data } = await supabase
    .from('approvals')
    .select('id, status, entity_metadata, created_at')
    .eq('entity_type', 'account_activation')
    .eq('entity_id', entityId)
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: false })

  const rows = (data || []) as Array<{
    id: string
    status?: string | null
    entity_metadata?: Record<string, unknown> | null
  }>
  const latestPending = rows.find(row => normalizeStatus(row.status) === 'pending') || null

  return {
    hasPending: rows.some(row => normalizeStatus(row.status) === 'pending'),
    hasApproved: rows.some(row => normalizeStatus(row.status) === 'approved'),
    pendingApprovalId: latestPending?.id || null,
    pendingEntityMetadata: latestPending?.entity_metadata || null,
    activeRequestInfo: latestPending
      ? parseActiveAccountRequestInfo(latestPending.entity_metadata)
      : null,
  }
}

/**
 * Single KYC evaluator used by review flows for every persona.
 *
 * Rules:
 * - Individual investors: approved ID + approved proof_of_address + approved personal_info
 * - Individual non-investors: approved personal_info + approved ID + approved proof_of_address
 * - Entity personas: approved entity_info + required entity docs + all active members approved
 * - Member approval (all personas): approved personal_info + approved ID + approved proof_of_address
 */
export async function checkAndUpdateEntityKYCStatus(
  supabase: SupabaseClient,
  entityType: KYCEntityType,
  entityId: string
) {
  const config = ENTITY_CONFIG[entityType]
  const submissionEntityColumn = getSubmissionEntityColumn(entityType)
  const submissionMemberColumn = getSubmissionMemberColumn(entityType)

  try {
    const { data: entity, error: entityError } = await supabase
      .from(config.entityTable)
      .select('*')
      .eq('id', entityId)
      .maybeSingle()

    if (entityError || !entity) {
      console.error(`[KYC] Entity ${entityType}:${entityId} not found`, entityError)
      return
    }

    const { data: rawSubmissions, error: submissionsError } = await supabase
      .from('kyc_submissions')
      .select(`
        id,
        document_type,
        status,
        submitted_at,
        reviewed_at,
        metadata,
        investor_member_id,
        partner_member_id,
        introducer_member_id,
        lawyer_member_id,
        commercial_partner_member_id,
        arranger_member_id
      `)
      .eq(submissionEntityColumn, entityId)

    if (submissionsError) {
      console.error(`[KYC] Failed fetching submissions for ${entityType}:${entityId}`, submissionsError)
      return
    }

    const submissions = (rawSubmissions || []) as SubmissionRow[]
    const approvedSubmissions = submissions.filter(submission => submission.status === 'approved')

    const { data: members, error: membersError } = await supabase
      .from(config.memberTable)
      .select('id, full_name, kyc_status, role, is_signatory, linked_user_id')
      .eq(config.entityIdColumn, entityId)
      .eq('is_active', true)

    if (membersError) {
      console.error(`[KYC] Failed fetching members for ${entityType}:${entityId}`, membersError)
      return
    }

    const activeMembers = (members || []) as MemberRow[]
    const relevantMembers = activeMembers
    const isIndividual = isIndividualEntity(entityType, entity)

    let requirementsMet = false

    if (isIndividual && entityType === 'investor') {
      const hasId = hasApprovedIdDocument(approvedSubmissions, submissionMemberColumn, null)
      const hasAddress = hasApprovedProofOfAddress(approvedSubmissions, submissionMemberColumn, null)
      const hasPersonalInfo = hasApprovedSubmissionForType(
        approvedSubmissions,
        'personal_info',
        submissionMemberColumn,
        null
      )

      requirementsMet = hasId && hasAddress && hasPersonalInfo
    } else if (isIndividual) {
      if (relevantMembers.length === 0) {
        console.warn(
          `[KYC] ${entityType}:${entityId} blocked - no active members found for individual KYC completion`
        )
        requirementsMet = false
      } else {
        requirementsMet = true
        for (const member of relevantMembers) {
          const hasPersonalInfo = hasApprovedSubmissionForType(
            approvedSubmissions,
            'personal_info',
            submissionMemberColumn,
            member.id
          )

          const memberApproved =
            hasPersonalInfo &&
            hasApprovedIdDocument(
              approvedSubmissions,
              submissionMemberColumn,
              member.id,
              false
            ) &&
            hasApprovedProofOfAddress(
              approvedSubmissions,
              submissionMemberColumn,
              member.id,
              false
            )

          if (!memberApproved) {
            requirementsMet = false
            break
          }

          if (member.kyc_status !== 'approved') {
            await updateMemberKYCStatus(supabase, entityType, member.id, 'approved')
          }
        }
      }
    } else {
      const hasEntityInfo = hasApprovedSubmissionForType(approvedSubmissions, 'entity_info')
      if (!hasEntityInfo) {
        requirementsMet = false
      } else {
        const entityDocs = REQUIRED_ENTITY_DOCUMENTS[entityType] || []
        const hasAllEntityDocs = entityDocs.every(documentType =>
          hasApprovedEntityDocument(
            approvedSubmissions,
            documentType,
            submissionMemberColumn
          )
        )

        if (!hasAllEntityDocs) {
          requirementsMet = false
        } else {
          if (relevantMembers.length === 0) {
            console.warn(
              `[KYC] ${entityType}:${entityId} blocked - no active members found for entity KYC completion`
            )
            requirementsMet = false
          } else {
            requirementsMet = true
          }
          for (const member of relevantMembers) {
            const hasPersonalInfo = hasApprovedSubmissionForType(
              approvedSubmissions,
              'personal_info',
              submissionMemberColumn,
              member.id
            )

            const memberApproved =
              hasPersonalInfo &&
              hasApprovedIdDocument(
                approvedSubmissions,
                submissionMemberColumn,
                member.id,
                false
              ) &&
              hasApprovedProofOfAddress(
                approvedSubmissions,
                submissionMemberColumn,
                member.id,
                false
              )

            if (!memberApproved) {
              requirementsMet = false
              break
            }

            if (member.kyc_status !== 'approved') {
              await updateMemberKYCStatus(supabase, entityType, member.id, 'approved')
            }
          }
        }
      }
    }

    const currentKycStatus = normalizeStatus(entity.kyc_status)
    const currentAccountStatus = normalizeStatus(entity.account_approval_status)

    if (!requirementsMet) {
      if (currentKycStatus === 'approved' && currentAccountStatus !== 'approved') {
        const pendingKycUpdate: Record<string, unknown> = {
          kyc_status: 'pending',
          updated_at: new Date().toISOString(),
        }

        if (entityType !== 'investor') {
          pendingKycUpdate.kyc_approved_at = null
        }

        await supabase
          .from(config.entityTable)
          .update(pendingKycUpdate)
          .eq('id', entityId)
      }
      return
    }

    if (currentKycStatus !== 'approved') {
      const entityUpdateData: any = {
        kyc_status: 'approved',
        updated_at: new Date().toISOString(),
      }

      if (entityType === 'investor') {
        entityUpdateData.kyc_completed_at = new Date().toISOString()
      } else {
        entityUpdateData.kyc_approved_at = new Date().toISOString()
      }

      await supabase
        .from(config.entityTable)
        .update(entityUpdateData)
        .eq('id', entityId)
    }

    const activationState = await getAccountActivationApprovalState(supabase, entityId)

    if (activationState.activeRequestInfo) {
      const requestInfoSatisfied = hasSatisfiedActiveRequestInfo({
        requestInfo: activationState.activeRequestInfo,
        entityType,
        isIndividual,
        submissionMemberColumn,
        relevantMembers,
        approvedSubmissions,
      })

      if (!requestInfoSatisfied) {
        return
      }

      if (activationState.pendingApprovalId) {
        await clearActiveRequestInfoMarker({
          supabase,
          approvalId: activationState.pendingApprovalId,
          currentEntityMetadata: activationState.pendingEntityMetadata,
          requestInfo: activationState.activeRequestInfo,
        })
      }
    }

    // Manual lock path:
    // If this entity had a previously approved activation and is no longer approved at account level,
    // do not auto-open a new CEO task. This must be manually re-opened by operations.
    if (activationState.hasApproved && !activationState.hasPending && currentAccountStatus !== 'approved') {
      if (currentAccountStatus === 'pending_approval') {
        await supabase
          .from(config.entityTable)
          .update({
            account_approval_status: 'incomplete',
            updated_at: new Date().toISOString(),
          })
          .eq('id', entityId)
      }

      console.warn(
        `[KYC] ${entityType}:${entityId} reached KYC-complete state after prior activation approval. Manual account re-activation review is required.`
      )
      return
    }

    await setAccountPendingApprovalIfNeeded(
      supabase,
      entityType,
      entityId,
      currentAccountStatus
    )

    const blocked = currentAccountStatus && ACCOUNT_BLOCKED_STATUSES.has(currentAccountStatus)
    if (!blocked) {
      await createAccountActivationApproval(supabase, entityType, entityId)
    }
  } catch (error) {
    console.error(`[KYC] Error evaluating ${entityType}:${entityId}`, error)
  }
}

/**
 * Handles approval side effects for a KYC submission.
 */
export async function handleKYCApproval(
  supabase: SupabaseClient,
  submission: any
) {
  const { entityType, entityId, memberId } = getEntityTypeFromSubmission(submission)

  if (!entityType || !entityId) {
    console.error('[KYC] Could not determine entity from submission', submission?.id)
    return
  }

  if (submission.document_type === 'personal_info' && memberId) {
    await updateMemberKYCStatus(supabase, entityType, memberId, 'approved')
  }

  await checkAndUpdateEntityKYCStatus(supabase, entityType, entityId)
}
