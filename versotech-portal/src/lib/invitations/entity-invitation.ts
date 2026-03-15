import { SupabaseClient } from '@supabase/supabase-js'

export type ExternalInvitationEntityType =
  | 'investor'
  | 'partner'
  | 'introducer'
  | 'lawyer'
  | 'commercial_partner'
  | 'arranger'

type NormalizedInvitationMetadata = {
  displayName: string | null
  title: string | null
  isPrimary: boolean
  canSign: boolean
}

type MemberConfig = {
  memberTable: string
  entityIdColumn: string
  memberHasCanSign: boolean
}

type MemberSnapshot = {
  id: string
  linked_user_id: string | null
  full_name: string | null
  email: string | null
  role_title: string | null
  is_signatory: boolean | null
  can_sign?: boolean | null
}

type ExistingMemberMatch = {
  member: MemberSnapshot
  matchedBy: 'linked_user' | 'email_unlinked'
}

export type MemberEnrichmentRollback = {
  memberTable: string
  memberId: string
  deleteInserted: boolean
  restoreData?: Record<string, unknown>
}

const MEMBER_CONFIG: Record<ExternalInvitationEntityType, MemberConfig> = {
  investor: {
    memberTable: 'investor_members',
    entityIdColumn: 'investor_id',
    memberHasCanSign: true,
  },
  partner: {
    memberTable: 'partner_members',
    entityIdColumn: 'partner_id',
    memberHasCanSign: false,
  },
  introducer: {
    memberTable: 'introducer_members',
    entityIdColumn: 'introducer_id',
    memberHasCanSign: false,
  },
  lawyer: {
    memberTable: 'lawyer_members',
    entityIdColumn: 'lawyer_id',
    memberHasCanSign: false,
  },
  commercial_partner: {
    memberTable: 'commercial_partner_members',
    entityIdColumn: 'commercial_partner_id',
    memberHasCanSign: false,
  },
  arranger: {
    memberTable: 'arranger_members',
    entityIdColumn: 'arranger_id',
    memberHasCanSign: false,
  },
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeEmail(value: unknown): string | null {
  const email = readTrimmedString(value)?.toLowerCase()
  return email && email.length > 0 ? email : null
}

function deriveFallbackDisplayName(email: string | null): string {
  if (!email) return 'Entity Member'
  const localPart = email.split('@')[0] || 'Entity Member'
  return localPart.replace(/[._-]+/g, ' ').trim() || 'Entity Member'
}

export function isExternalInvitationEntityType(
  entityType: string
): entityType is ExternalInvitationEntityType {
  return entityType in MEMBER_CONFIG
}

export function normalizeInvitationMetadata(
  metadata: unknown,
  defaults?: Partial<Pick<NormalizedInvitationMetadata, 'isPrimary' | 'canSign'>>
): NormalizedInvitationMetadata {
  const safeMetadata =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {}

  return {
    displayName: readTrimmedString(safeMetadata.display_name),
    title: readTrimmedString(safeMetadata.title),
    isPrimary:
      typeof safeMetadata.is_primary === 'boolean'
        ? safeMetadata.is_primary
        : Boolean(defaults?.isPrimary),
    canSign:
      typeof safeMetadata.can_sign === 'boolean'
        ? safeMetadata.can_sign
        : Boolean(defaults?.canSign),
  }
}

export function resolveInvitationInviteeName(params: {
  email?: string | null
  metadata?: unknown
  fallbackName?: string | null
}): string | undefined {
  const metadata = normalizeInvitationMetadata(params.metadata)
  return (
    metadata.displayName ||
    readTrimmedString(params.fallbackName) ||
    normalizeEmail(params.email)?.split('@')[0] ||
    undefined
  )
}

async function findExistingMember(params: {
  supabase: SupabaseClient<any>
  config: MemberConfig
  entityId: string
  userId: string
  email: string | null
}) {
  const { supabase, config, entityId, userId, email } = params
  const selectColumns = config.memberHasCanSign
    ? 'id, linked_user_id, full_name, email, role_title, is_signatory, can_sign'
    : 'id, linked_user_id, full_name, email, role_title, is_signatory'

  const { data: linkedMember, error: linkedMemberError } = await supabase
    .from(config.memberTable)
    .select(selectColumns)
    .eq(config.entityIdColumn, entityId)
    .eq('is_active', true)
    .eq('linked_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (linkedMemberError) throw linkedMemberError
  if (linkedMember) {
    return {
      member: linkedMember as unknown as MemberSnapshot,
      matchedBy: 'linked_user',
    } satisfies ExistingMemberMatch
  }

  if (!email) return null

  const { data: emailCandidates, error: emailCandidatesError } = await supabase
    .from(config.memberTable)
    .select(selectColumns)
    .eq(config.entityIdColumn, entityId)
    .eq('is_active', true)
    .is('linked_user_id', null)
    .ilike('email', email)
    .order('created_at', { ascending: true })
    .limit(2)

  if (emailCandidatesError) throw emailCandidatesError
  if (!emailCandidates || emailCandidates.length === 0) return null

  if (emailCandidates.length > 1) {
    console.warn('[entity-invitation] Multiple unlinked members matched invited email; reusing oldest match', {
      memberTable: config.memberTable,
      entityId,
      userId,
      matchedMemberIds: emailCandidates.map(candidate => (candidate as unknown as { id: string }).id),
    })
  }

  return {
    member: emailCandidates[0] as unknown as MemberSnapshot,
    matchedBy: 'email_unlinked',
  } satisfies ExistingMemberMatch
}

function buildRollbackRestoreData(member: MemberSnapshot, config: MemberConfig) {
  const restoreData: Record<string, unknown> = {
    linked_user_id: member.linked_user_id,
    full_name: member.full_name,
    email: member.email,
    role_title: member.role_title,
    is_signatory: member.is_signatory ?? false,
    updated_at: new Date().toISOString(),
  }

  if (config.memberHasCanSign) {
    restoreData.can_sign = member.can_sign ?? false
  }

  return restoreData
}

export async function rollbackMemberRecordEnrichment(params: {
  supabase: SupabaseClient<any>
  rollback: MemberEnrichmentRollback | null | undefined
}) {
  const { supabase, rollback } = params

  if (!rollback?.memberId) return

  if (rollback.deleteInserted) {
    const { error: deleteError } = await supabase
      .from(rollback.memberTable)
      .delete()
      .eq('id', rollback.memberId)

    if (deleteError) throw deleteError
    return
  }

  if (!rollback.restoreData) return

  const { error: restoreError } = await supabase
    .from(rollback.memberTable)
    .update(rollback.restoreData)
    .eq('id', rollback.memberId)

  if (restoreError) throw restoreError
}

export async function enrichMemberRecordFromInvitation(params: {
  supabase: SupabaseClient<any>
  entityType: ExternalInvitationEntityType
  entityId: string
  userId: string
  userEmail?: string | null
  displayName?: string | null
  title?: string | null
  canSign?: boolean
  createdBy?: string | null
}) {
  const { supabase, entityType, entityId, userId } = params
  const config = MEMBER_CONFIG[entityType]
  const email = normalizeEmail(params.userEmail)
  const displayName =
    readTrimmedString(params.displayName) || deriveFallbackDisplayName(email)
  const title = readTrimmedString(params.title)
  const canSign = Boolean(params.canSign)
  const nowIso = new Date().toISOString()

  const existingMember = await findExistingMember({
    supabase,
    config,
    entityId,
    userId,
    email,
  })

  const updateData: Record<string, unknown> = {
    linked_user_id: userId,
    full_name: displayName,
    updated_at: nowIso,
  }

  if (email) {
    updateData.email = email
  }

  if (title) {
    updateData.role_title = title
  }

  updateData.is_signatory = canSign

  if (config.memberHasCanSign) {
    updateData.can_sign = canSign
  }

  const applyExistingMemberUpdate = async (match: ExistingMemberMatch) => {
    let updateQuery = supabase
      .from(config.memberTable)
      .update(updateData)
      .eq('id', match.member.id)

    if (match.matchedBy === 'email_unlinked') {
      updateQuery = updateQuery.is('linked_user_id', null)
    }

    const { data: updatedMember, error: memberUpdateError } = await updateQuery
      .select('id')
      .maybeSingle()

    if (memberUpdateError) throw memberUpdateError

    if (!updatedMember) {
      const racedMember = await findExistingMember({
        supabase,
        config,
        entityId,
        userId,
        email,
      })

      if (!racedMember?.member.id) {
        throw new Error(`Failed to update ${config.memberTable} record for invitation acceptance`)
      }

      return applyExistingMemberUpdate(racedMember)
    }

    return {
      memberId: match.member.id,
      created: false,
      rollback: {
        memberTable: config.memberTable,
        memberId: match.member.id,
        deleteInserted: false,
        restoreData: buildRollbackRestoreData(match.member, config),
      } satisfies MemberEnrichmentRollback,
    }
  }

  if (existingMember?.member.id) {
    return applyExistingMemberUpdate(existingMember)
  }

  const insertData: Record<string, unknown> = {
    [config.entityIdColumn]: entityId,
    linked_user_id: userId,
    full_name: displayName,
    role: 'other',
    kyc_status: 'pending',
    is_active: true,
    effective_from: nowIso.split('T')[0],
    created_at: nowIso,
    updated_at: nowIso,
    is_signatory: canSign,
  }

  if (email) {
    insertData.email = email
  }

  if (title) {
    insertData.role_title = title
  }

  if (params.createdBy) {
    insertData.created_by = params.createdBy
  }

  if (config.memberHasCanSign) {
    insertData.can_sign = canSign
  }

  const { data: insertedMember, error: insertError } = await supabase
    .from(config.memberTable)
    .insert(insertData)
    .select('id')
    .maybeSingle()

  if (!insertError && insertedMember?.id) {
    return {
      memberId: insertedMember.id as string,
      created: true,
      rollback: {
        memberTable: config.memberTable,
        memberId: insertedMember.id as string,
        deleteInserted: true,
      } satisfies MemberEnrichmentRollback,
    }
  }

  const racedMember = await findExistingMember({
    supabase,
    config,
    entityId,
    userId,
    email,
  })

  if (racedMember?.member.id) {
    return applyExistingMemberUpdate(racedMember)
  }

  if (insertError) throw insertError

  return { memberId: null, created: false, rollback: null }
}
