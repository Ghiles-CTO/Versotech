import 'server-only'

import { cookies } from 'next/headers'
import {
  ACTIVE_PERSONA_ID_COOKIE,
  ACTIVE_PERSONA_TYPE_COOKIE,
  resolveActivePersona,
  type PersonaIdentity,
} from '@/lib/persona/active-persona'
import {
  ACCOUNT_SUPPORT_AVATAR_URL,
  ACCOUNT_SUPPORT_METADATA_TYPE,
  ACCOUNT_SUPPORT_OWNER_SCOPE,
  buildAccountSupportSubject,
  hasAccountSupportInboxAccess,
  isAccountSupportPersonaType,
  type AccountSupportPersonaType,
} from '@/lib/messaging/account-support.shared'

type RequestPersona = PersonaIdentity & {
  entity_name?: string | null
  role_in_entity?: string | null
}

type AccountSupportPersona = RequestPersona & {
  persona_type: AccountSupportPersonaType
}

type EnsureAccountSupportConversationResult = {
  conversationId: string
  created: boolean
  persona: AccountSupportPersona
  subject: string
}

const ACCOUNT_SUPPORT_BOOTSTRAP_SOURCE = 'account_support'

function defaultSupportWelcomeMessage() {
  return 'Welcome to Versotech. Feel free to ask any questions you have regarding the onboarding and investment lifecycle. We will get back to you as soon as we see your query.'
}

const ACCOUNT_SUPPORT_CONFIG: Record<
  AccountSupportPersonaType,
  {
    entityTable: string
    entityNameFields: string[]
    userTable: string
    userEntityIdColumn: string
  }
> = {
  investor: {
    entityTable: 'investors',
    entityNameFields: ['legal_name', 'name'],
    userTable: 'investor_users',
    userEntityIdColumn: 'investor_id',
  },
  introducer: {
    entityTable: 'introducers',
    entityNameFields: ['legal_name', 'name'],
    userTable: 'introducer_users',
    userEntityIdColumn: 'introducer_id',
  },
  partner: {
    entityTable: 'partners',
    entityNameFields: ['name', 'legal_name'],
    userTable: 'partner_users',
    userEntityIdColumn: 'partner_id',
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    entityNameFields: ['name', 'legal_name'],
    userTable: 'commercial_partner_users',
    userEntityIdColumn: 'commercial_partner_id',
  },
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

async function readActivePersonaCookies() {
  const cookieStore = await cookies()
  return {
    cookiePersonaId: cookieStore.get(ACTIVE_PERSONA_ID_COOKIE)?.value ?? null,
    cookiePersonaType: cookieStore.get(ACTIVE_PERSONA_TYPE_COOKIE)?.value ?? null,
  }
}

export async function getRequestActivePersonaForUser(
  supabase: any,
  userId: string
): Promise<RequestPersona | null> {
  const { data, error } = await supabase.rpc('get_user_personas', {
    p_user_id: userId,
  })

  if (error) {
    console.error('[AccountSupport] Failed to load personas:', error)
    return null
  }

  const personas = Array.isArray(data)
    ? data.filter((persona): persona is RequestPersona => {
        if (!persona || typeof persona !== 'object') return false
        const record = persona as Record<string, unknown>
        return (
          typeof record.persona_type === 'string' &&
          typeof record.entity_id === 'string' &&
          record.entity_id.length > 0
        )
      })
    : []

  if (!personas.length) {
    return null
  }

  const activePersona = resolveActivePersona(personas, await readActivePersonaCookies())
  return activePersona ?? personas[0]
}

export async function getActiveAccountSupportPersonaForUser(
  supabase: any,
  userId: string
): Promise<AccountSupportPersona | null> {
  const activePersona = await getRequestActivePersonaForUser(supabase, userId)

  if (!activePersona || !isAccountSupportPersonaType(activePersona.persona_type)) {
    return null
  }

  return {
    ...activePersona,
    persona_type: activePersona.persona_type,
  }
}

export async function hasAccountSupportInboxAccessForUser(
  supabase: any,
  userId: string
): Promise<boolean> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (!profileError && hasAccountSupportInboxAccess(profile?.role)) {
    return true
  }

  const { data: personas, error: personaError } = await supabase.rpc('get_user_personas', {
    p_user_id: userId,
  })

  if (personaError) {
    console.error('[AccountSupport] Failed to resolve support inbox access:', personaError)
    return false
  }

  return Array.isArray(personas)
    ? personas.some((persona: any) => {
        const personaType = persona?.persona_type
        const roleInEntity = persona?.role_in_entity
        return personaType === 'ceo' || (personaType === 'staff' && roleInEntity === 'staff_admin')
      })
    : false
}

async function resolveEntityName(supabase: any, persona: AccountSupportPersona): Promise<string> {
  const fromPersona = typeof persona.entity_name === 'string' ? persona.entity_name.trim() : ''
  if (fromPersona) {
    return fromPersona
  }

  const config = ACCOUNT_SUPPORT_CONFIG[persona.persona_type]
  const selectColumns = config.entityNameFields.join(', ')
  const { data, error } = await supabase
    .from(config.entityTable)
    .select(selectColumns)
    .eq('id', persona.entity_id)
    .maybeSingle()

  if (error) {
    console.error('[AccountSupport] Failed to resolve entity name:', error)
  }

  const row = asRecord(data)
  for (const field of config.entityNameFields) {
    const value = row[field]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return 'Account'
}

async function getExternalParticipantIds(
  supabase: any,
  persona: AccountSupportPersona,
  currentUserId: string
): Promise<string[]> {
  const config = ACCOUNT_SUPPORT_CONFIG[persona.persona_type]
  const { data, error } = await supabase
    .from(config.userTable)
    .select('user_id')
    .eq(config.userEntityIdColumn, persona.entity_id)

  if (error) {
    throw new Error(error.message)
  }

  const participantIds = new Set<string>()

  for (const row of data || []) {
    if (typeof row?.user_id === 'string' && row.user_id) {
      participantIds.add(row.user_id)
    }
  }

  participantIds.add(currentUserId)
  return Array.from(participantIds)
}

async function getSupportOwnerIds(supabase: any): Promise<string[]> {
  const { data: ownerRows, error: ownerError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['ceo', 'staff_admin'])
    .is('deleted_at', null)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(50)

  if (ownerError) {
    throw new Error(ownerError.message)
  }

  return (ownerRows || [])
    .map((row: { id?: string | null }) => row.id)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
}

async function syncConversationParticipants(
  supabase: any,
  conversationId: string,
  participantIds: string[]
) {
  const desiredIds = new Set(participantIds)
  const { data: existingRows, error: existingError } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)

  if (existingError) {
    throw new Error(existingError.message)
  }

  const existingIds = new Set<string>()
  for (const row of existingRows || []) {
    if (typeof row?.user_id === 'string' && row.user_id) {
      existingIds.add(row.user_id)
    }
  }

  const missingIds = participantIds.filter((userId) => !existingIds.has(userId))
  if (missingIds.length) {
    const joinedAt = new Date().toISOString()
    const { error: insertError } = await supabase
      .from('conversation_participants')
      .insert(
        missingIds.map((userId) => ({
          conversation_id: conversationId,
          user_id: userId,
          participant_role: 'member',
          last_read_at: joinedAt,
        }))
      )

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  const staleIds = Array.from(existingIds).filter((userId) => !desiredIds.has(userId))
  if (staleIds.length) {
    const { error: deleteError } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .in('user_id', staleIds)

    if (deleteError) {
      throw new Error(deleteError.message)
    }
  }
}

function buildSupportMetadata(persona: AccountSupportPersona, entityName: string) {
  return {
    support_thread_type: ACCOUNT_SUPPORT_METADATA_TYPE,
    entity_type: persona.persona_type,
    entity_id: persona.entity_id,
    entity_name: entityName,
    owner_scope: ACCOUNT_SUPPORT_OWNER_SCOPE,
  }
}

async function ensureSupportBootstrapMessage(supabase: any, conversationId: string) {
  const { data: existingMessages, error: existingError } = await supabase
    .from('messages')
    .select('id, metadata')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  if (existingError) {
    throw new Error(existingError.message)
  }

  const hasBootstrapMessage = (existingMessages || []).some((message: any) => {
    const metadata = asRecord(message?.metadata)
    return metadata.source === ACCOUNT_SUPPORT_BOOTSTRAP_SOURCE && metadata.bootstrap === true
  })

  if (hasBootstrapMessage) {
    return
  }

  const { error: insertError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: null,
    message_type: 'system',
    body: defaultSupportWelcomeMessage(),
    metadata: {
      source: ACCOUNT_SUPPORT_BOOTSTRAP_SOURCE,
      bootstrap: true,
      assistant_name: ACCOUNT_SUPPORT_DISPLAY_NAME,
      assistant_avatar_url: ACCOUNT_SUPPORT_AVATAR_URL,
      support_sender: true,
    },
  })

  if (insertError) {
    throw new Error(insertError.message)
  }
}

export async function ensureAccountSupportConversationForPersona(
  supabase: any,
  {
    currentUserId,
    persona,
  }: {
    currentUserId: string
    persona: AccountSupportPersona
  }
): Promise<EnsureAccountSupportConversationResult | null> {
  const [entityName, externalParticipantIds, ownerIds] = await Promise.all([
    resolveEntityName(supabase, persona),
    getExternalParticipantIds(supabase, persona, currentUserId),
    getSupportOwnerIds(supabase),
  ])

  const participantIds = Array.from(new Set([...externalParticipantIds, ...ownerIds]))
  if (!ownerIds.length) {
    throw new Error('No CEO-side support owners are available')
  }
  if (!participantIds.length) {
    return null
  }

  const metadataLookup = {
    support_thread_type: ACCOUNT_SUPPORT_METADATA_TYPE,
    entity_type: persona.persona_type,
    entity_id: persona.entity_id,
  }
  const subject = buildAccountSupportSubject(entityName)
  const nextMetadata = buildSupportMetadata(persona, entityName)

  const { data: existingRows, error: existingError } = await supabase
    .from('conversations')
    .select('id, subject, metadata')
    .contains('metadata', metadataLookup)
    .is('archived_at', null)
    .order('created_at', { ascending: true })
    .limit(1)

  if (existingError) {
    throw new Error(existingError.message)
  }

  let conversation = existingRows?.[0] ?? null
  let created = false

  if (!conversation) {
    const { data: createdConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        subject,
        created_by: currentUserId,
        type: 'group',
        visibility: 'investor',
        owner_team: 'support',
        metadata: nextMetadata,
      })
      .select('id, subject, metadata')
      .single()

    if (createError) {
      if (createError.code !== '23505') {
        throw new Error(createError.message)
      }

      const { data: raceRows, error: raceError } = await supabase
        .from('conversations')
        .select('id, subject, metadata')
        .contains('metadata', metadataLookup)
        .is('archived_at', null)
        .order('created_at', { ascending: true })
        .limit(1)

      if (raceError) {
        throw new Error(raceError.message)
      }

      conversation = raceRows?.[0] ?? null

      if (!conversation) {
        throw new Error(createError.message)
      }
    } else {
      conversation = createdConversation
      created = true
    }
  } else {
    const currentMetadata = asRecord(conversation.metadata)
    const needsUpdate =
      conversation.subject !== subject ||
      currentMetadata.entity_name !== entityName ||
      currentMetadata.owner_scope !== ACCOUNT_SUPPORT_OWNER_SCOPE

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          subject,
          metadata: {
            ...currentMetadata,
            ...nextMetadata,
          },
        })
        .eq('id', conversation.id)

      if (updateError) {
        throw new Error(updateError.message)
      }
    }
  }

  await syncConversationParticipants(supabase, conversation.id, participantIds)
  await ensureSupportBootstrapMessage(supabase, conversation.id)

  return {
    conversationId: conversation.id,
    created,
    persona,
    subject,
  }
}

export async function ensureAccountSupportConversationForUser(
  supabase: any,
  userId: string
): Promise<EnsureAccountSupportConversationResult | null> {
  const persona = await getActiveAccountSupportPersonaForUser(supabase, userId)
  if (!persona) {
    return null
  }

  return ensureAccountSupportConversationForPersona(supabase, {
    currentUserId: userId,
    persona,
  })
}
