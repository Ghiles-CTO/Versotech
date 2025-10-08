import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

type ConversationParticipant = {
  id: string
  display_name: string | null
  email: string | null
  role: string | null
  participant_role: 'owner' | 'member' | 'viewer' | null
  last_read_at: string | null
}

type ConversationMessageSummary = {
  id: string
  body: string | null
  message_type: string | null
  created_at: string
  sender: {
    id: string | null
    display_name: string | null
    email: string | null
    role: string | null
  } | null
} | null

type NormalizedConversation = {
  id: string
  subject: string | null
  type: string
  visibility: string | null
  owner_team: string | null
  deal_id: string | null
  created_by: string | null
  created_at: string
  last_message_at: string | null
  participants: ConversationParticipant[]
  latest_message: ConversationMessageSummary
  unread_count: number
  is_participant: boolean
  message_count: number | null
}

const CONVERSATION_TYPES = new Set(['dm', 'group', 'deal_room', 'broadcast'])
const CONVERSATION_VISIBILITIES = new Set(['investor', 'internal', 'deal'])

function buildSelectColumns(includeMessages: boolean) {
  const base = `
    id,
    subject,
    type,
    visibility,
    owner_team,
    deal_id,
    created_by,
    created_at,
    last_message_at,
    conversation_participants (
      user_id,
      participant_role,
      last_read_at,
      profiles:user_id (
        id,
        display_name,
        email,
        role
      )
    )
  `

  if (!includeMessages) {
    return base
  }

  return `${base},
    messages (
      id,
      body,
      message_type,
      created_at,
      sender:sender_id (
        id,
        display_name,
        email,
        role
      )
    )
  `
}

function normalizeConversation(
  raw: any,
  includeMessages: boolean,
  currentUserId: string
): NormalizedConversation {
  const participantsRaw: any[] = raw?.conversation_participants || []

  const participants: ConversationParticipant[] = participantsRaw.map((participant) => {
    const profile = participant?.profiles || {}
    return {
      id: profile.id || participant.user_id,
      display_name: profile.display_name || profile.email || null,
      email: profile.email || null,
      role: profile.role || null,
      participant_role: participant?.participant_role ?? null,
      last_read_at: participant?.last_read_at ?? null,
    }
  })

  const isParticipant = participants.some((participant) => participant.id === currentUserId)

  let latest_message: ConversationMessageSummary = null
  let message_count: number | null = null

  if (includeMessages) {
    const latest = raw?.messages?.[0]
    if (latest) {
      latest_message = {
        id: latest.id,
        body: latest.body ?? null,
        message_type: latest.message_type ?? null,
        created_at: latest.created_at,
        sender: latest.sender
          ? {
              id: latest.sender.id ?? null,
              display_name: latest.sender.display_name ?? null,
              email: latest.sender.email ?? null,
              role: latest.sender.role ?? null,
            }
          : null,
      }
    }
    message_count = Array.isArray(raw?.messages) ? raw.messages.length : null
  }

  return {
    id: raw.id,
    subject: raw.subject ?? null,
    type: raw.type ?? 'dm',
    visibility: raw.visibility ?? 'internal',
    owner_team: raw.owner_team ?? null,
    deal_id: raw.deal_id ?? null,
    created_by: raw.created_by ?? null,
    created_at: raw.created_at,
    last_message_at: raw.last_message_at ?? null,
    participants,
    latest_message,
    unread_count: 0,
    is_participant: isParticipant,
    message_count,
  }
}

async function applyUnreadCounts(
  supabaseClient: any,
  userId: string,
  conversations: NormalizedConversation[]
) {
  if (!conversations.length) return

  const conversationIds = conversations.map((conversation) => conversation.id)

  const { data: unreadRows, error } = await supabaseClient.rpc('get_conversation_unread_counts', {
    p_user_id: userId,
    p_conversation_ids: conversationIds,
  })

  if (error) {
    console.error('Error fetching unread counts:', error)
    return
  }

  const unreadMap = new Map<string, number>()
  for (const row of unreadRows || []) {
    if (row?.conversation_id) {
      unreadMap.set(row.conversation_id, Number(row.unread_count) || 0)
    }
  }

  for (const conversation of conversations) {
    conversation.unread_count = unreadMap.get(conversation.id) ?? 0
  }
}

// Get conversations for current user (staff filters supported)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user (handles both real auth and demo mode)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const visibilityParam = (url.searchParams.get('visibility') || 'all').toLowerCase()
    const typeParam = (url.searchParams.get('type') || 'all').toLowerCase()
    const searchTermRaw = url.searchParams.get('search') || ''
    const unreadOnly = url.searchParams.get('unread') === 'true'
    const includeMessages = url.searchParams.get('includeMessages') !== 'false'

    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0)
    const fetchLimit = Math.min(Math.max(limit * 4, 100), 500)

    const visibilityFilter = ['all', 'investor', 'internal', 'deal'].includes(visibilityParam)
      ? (visibilityParam as 'all' | 'investor' | 'internal' | 'deal')
      : 'all'
    const typeFilter = ['all', 'dm', 'group', 'deal_room', 'broadcast'].includes(typeParam)
      ? (typeParam as 'all' | 'dm' | 'group' | 'deal_room' | 'broadcast')
      : 'all'
    const searchTerm = searchTermRaw.trim().toLowerCase()

    const userRole = user.user_metadata?.role || user.role
    const isStaff = ['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)
    const client = isStaff ? createServiceClient() : supabase

    const selectColumns = buildSelectColumns(includeMessages)

    let query = client
      .from('conversations')
      .select(selectColumns)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(fetchLimit)

    if (includeMessages) {
      query = query
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' })
    }

    const { data: rawConversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    const baseList = (rawConversations || []).filter((conv: any) => {
      const participants: any[] = conv.conversation_participants || []
      const isParticipant = participants.some(p => p?.user_id === user.id)

      // Non-staff can only view conversations they participate in
      if (!isStaff && !isParticipant) {
        return false
      }

      // Visibility checks
      if (visibilityFilter !== 'all' && conv.visibility !== visibilityFilter) {
        return false
      }

      if (isStaff) {
        if (conv.visibility === 'investor' && !isParticipant) {
          // Staff can only see investor conversations when directly participating
          return false
        }
        if (visibilityFilter === 'all' && conv.visibility === 'investor' && !isParticipant) {
          return false
        }
      }

      // Type filter
      if (typeFilter !== 'all' && conv.type !== typeFilter) {
        return false
      }

      return true
    })

    const normalized = baseList.map((conv: any) =>
      normalizeConversation(conv, includeMessages, user.id)
    )

    await applyUnreadCounts(supabase, user.id, normalized)

    let filtered = normalized

    if (unreadOnly) {
      filtered = filtered.filter(conv => conv.unread_count > 0)
    }

    if (searchTerm) {
      filtered = filtered.filter(conv => {
        const haystack: string[] = []
        if (conv.subject) haystack.push(conv.subject)
        if (conv.owner_team) haystack.push(conv.owner_team)
        conv.participants.forEach(participant => {
          if (participant.display_name) haystack.push(participant.display_name)
          if (participant.email) haystack.push(participant.email)
        })
        if (conv.latest_message?.body) haystack.push(conv.latest_message.body)

        return haystack.some(entry => entry.toLowerCase().includes(searchTerm))
      })
    }

    filtered.sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime()
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime()
      return bTime - aTime
    })

    const total = filtered.length
    const sliced = filtered.slice(offset, offset + limit)

    // Remove helper flags before returning
    const conversations = sliced

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + conversations.length < total,
      },
      filters: {
        visibility: visibilityFilter,
        type: typeFilter,
        unread_only: unreadOnly,
        search: searchTerm || null,
      },
    })

  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, participant_ids, type = 'dm', initial_message } = await request.json()

    if (!participant_ids || participant_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 })
    }

    // Ensure current user is included in participants
    const allParticipants = [...new Set([user.id, ...participant_ids])]

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject,
        created_by: user.id,
        type,
        name: type === 'group' ? subject : null
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const participantInserts = allParticipants.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }))

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts)

    if (partError) {
      console.error('Error adding participants:', partError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Send initial message if provided
    if (initial_message) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          body: initial_message
        })

      if (msgError) {
        console.error('Error sending initial message:', msgError)
      }
    }

    // Log conversation creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.CONVERSATIONS,
      entity_id: conversation.id,
      metadata: {
        subject,
        type,
        participant_count: allParticipants.length,
        has_initial_message: !!initial_message
      }
    })

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        participant_count: allParticipants.length
      }
    })

  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

