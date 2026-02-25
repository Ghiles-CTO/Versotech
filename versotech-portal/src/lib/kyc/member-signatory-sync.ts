import { SupabaseClient } from '@supabase/supabase-js'

export type SignatoryEntityType =
  | 'investor'
  | 'partner'
  | 'introducer'
  | 'lawyer'
  | 'commercial_partner'
  | 'arranger'

type SyncConfig = {
  memberTable: string
  userTable: string
  entityIdColumn: string
  memberHasCanSign: boolean
}

const SYNC_CONFIG: Record<SignatoryEntityType, SyncConfig> = {
  investor: {
    memberTable: 'investor_members',
    userTable: 'investor_users',
    entityIdColumn: 'investor_id',
    memberHasCanSign: true,
  },
  partner: {
    memberTable: 'partner_members',
    userTable: 'partner_users',
    entityIdColumn: 'partner_id',
    memberHasCanSign: false,
  },
  introducer: {
    memberTable: 'introducer_members',
    userTable: 'introducer_users',
    entityIdColumn: 'introducer_id',
    memberHasCanSign: false,
  },
  lawyer: {
    memberTable: 'lawyer_members',
    userTable: 'lawyer_users',
    entityIdColumn: 'lawyer_id',
    memberHasCanSign: false,
  },
  commercial_partner: {
    memberTable: 'commercial_partner_members',
    userTable: 'commercial_partner_users',
    entityIdColumn: 'commercial_partner_id',
    memberHasCanSign: false,
  },
  arranger: {
    memberTable: 'arranger_members',
    userTable: 'arranger_users',
    entityIdColumn: 'arranger_id',
    memberHasCanSign: false,
  },
}

type MemberRow = {
  id: string
  linked_user_id?: string | null
  email?: string | null
  is_signatory?: boolean | null
  can_sign?: boolean | null
}

function normalizeEmail(value?: string | null): string | null {
  const normalized = value?.trim().toLowerCase()
  return normalized && normalized.length > 0 ? normalized : null
}

async function findSingleEntityUserIdByEmail(params: {
  supabase: SupabaseClient<any>
  config: SyncConfig
  entityId: string
  email?: string | null
}): Promise<string | null> {
  const { supabase, config, entityId } = params
  const email = normalizeEmail(params.email)
  if (!email) return null

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .limit(2)

  if (profilesError) {
    throw profilesError
  }

  if (!profiles || profiles.length !== 1) {
    return null
  }

  const profileId = profiles[0].id as string

  const { data: entityLink, error: entityLinkError } = await supabase
    .from(config.userTable)
    .select('user_id')
    .eq(config.entityIdColumn, entityId)
    .eq('user_id', profileId)
    .maybeSingle()

  if (entityLinkError) {
    throw entityLinkError
  }

  return entityLink?.user_id ? (entityLink.user_id as string) : null
}

async function resolveMemberForUser(params: {
  supabase: SupabaseClient<any>
  config: SyncConfig
  entityId: string
  userId: string
  userEmail?: string | null
}): Promise<MemberRow | null> {
  const { supabase, config, entityId, userId } = params

  const { data: linkedMember, error: linkedMemberError } = await supabase
    .from(config.memberTable)
    .select('*')
    .eq(config.entityIdColumn, entityId)
    .eq('linked_user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (linkedMemberError) {
    throw linkedMemberError
  }

  if (linkedMember) {
    return linkedMember as MemberRow
  }

  const email = normalizeEmail(params.userEmail)
  if (!email) {
    return null
  }

  const { data: emailCandidates, error: emailCandidatesError } = await supabase
    .from(config.memberTable)
    .select('*')
    .eq(config.entityIdColumn, entityId)
    .eq('is_active', true)
    .is('linked_user_id', null)
    .ilike('email', email)
    .limit(2)

  if (emailCandidatesError) {
    throw emailCandidatesError
  }

  if (!emailCandidates || emailCandidates.length !== 1) {
    return null
  }

  const candidate = emailCandidates[0]
  const { data: linkedCandidate, error: linkCandidateError } = await supabase
    .from(config.memberTable)
    .update({ linked_user_id: userId })
    .eq('id', candidate.id)
    .is('linked_user_id', null)
    .select('*')
    .maybeSingle()

  if (linkCandidateError) {
    throw linkCandidateError
  }

  if (linkedCandidate) {
    return linkedCandidate as MemberRow
  }

  const { data: racedMember, error: racedMemberError } = await supabase
    .from(config.memberTable)
    .select('*')
    .eq(config.entityIdColumn, entityId)
    .eq('linked_user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (racedMemberError) {
    throw racedMemberError
  }

  return racedMember ? (racedMember as MemberRow) : null
}

export async function syncMemberSignatoryFromUserLink(params: {
  supabase: SupabaseClient<any>
  entityType: SignatoryEntityType
  entityId: string
  userId: string
  canSign: boolean
  userEmail?: string | null
}) {
  const { supabase, entityType, entityId, userId, canSign } = params
  const config = SYNC_CONFIG[entityType]
  const desiredSignatory = Boolean(canSign)
  const nowIso = new Date().toISOString()

  const member = await resolveMemberForUser({
    supabase,
    config,
    entityId,
    userId,
    userEmail: params.userEmail,
  })

  if (!member?.id) {
    return { updated: false, reason: 'member_not_found' as const }
  }

  const updateData: Record<string, unknown> = {
    is_signatory: desiredSignatory,
    updated_at: nowIso,
  }

  if (config.memberHasCanSign) {
    updateData.can_sign = desiredSignatory
  }

  if (!member.linked_user_id) {
    updateData.linked_user_id = userId
  }

  const { error: memberUpdateError } = await supabase
    .from(config.memberTable)
    .update(updateData)
    .eq('id', member.id)

  if (memberUpdateError) {
    throw memberUpdateError
  }

  return { updated: true, memberId: member.id }
}

export async function syncUserSignatoryFromMember(params: {
  supabase: SupabaseClient<any>
  entityType: SignatoryEntityType
  entityId: string
  memberId: string
}) {
  const { supabase, entityType, entityId, memberId } = params
  const config = SYNC_CONFIG[entityType]

  const { data: member, error: memberError } = await supabase
    .from(config.memberTable)
    .select('*')
    .eq('id', memberId)
    .eq(config.entityIdColumn, entityId)
    .maybeSingle()

  if (memberError) {
    throw memberError
  }

  if (!member) {
    return { updated: false, reason: 'member_not_found' as const }
  }

  const memberRow = member as MemberRow
  const signatoryFromMember = config.memberHasCanSign
    ? Boolean(memberRow.can_sign ?? memberRow.is_signatory)
    : Boolean(memberRow.is_signatory)

  let linkedUserId = memberRow.linked_user_id || null

  if (!linkedUserId) {
    linkedUserId = await findSingleEntityUserIdByEmail({
      supabase,
      config,
      entityId,
      email: memberRow.email,
    })

    if (linkedUserId) {
      const { error: memberLinkError } = await supabase
        .from(config.memberTable)
        .update({ linked_user_id: linkedUserId, updated_at: new Date().toISOString() })
        .eq('id', memberRow.id)
        .is('linked_user_id', null)

      if (memberLinkError) {
        throw memberLinkError
      }
    }
  }

  if (!linkedUserId) {
    return { updated: false, reason: 'linked_user_not_found' as const }
  }

  const { error: userUpdateError } = await supabase
    .from(config.userTable)
    .update({ can_sign: signatoryFromMember })
    .eq(config.entityIdColumn, entityId)
    .eq('user_id', linkedUserId)

  if (userUpdateError) {
    throw userUpdateError
  }

  return { updated: true, userId: linkedUserId }
}
