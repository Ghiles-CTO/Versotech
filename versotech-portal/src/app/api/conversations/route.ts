import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import type {
  ConversationFilters,
  ConversationSummary,
  ConversationType,
  ConversationVisibility,
  ConversationParticipant,
} from '@/types/messaging'
import { normalizeMessage, normalizeConversation } from '@/lib/messaging/supabase'

type NormalizedConversation = ConversationSummary

const CONVERSATION_TYPES = new Set<ConversationType>(['dm', 'group', 'deal_room', 'broadcast'])
const CONVERSATION_VISIBILITIES = new Set<ConversationVisibility>(['investor', 'internal', 'deal'])

function parseFilters(url: URL): {
  filters: ConversationFilters
  unreadOnly: boolean
  includeMessages: boolean
  limit: number
  offset: number
} {
  const visibilityParam = (url.searchParams.get('visibility') || 'all').toLowerCase()
  const typeParam = (url.searchParams.get('type') || 'all').toLowerCase()
  const searchTermRaw = url.searchParams.get('search') || ''
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const includeMessages = url.searchParams.get('includeMessages') !== 'false'
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0)
  const dealId = url.searchParams.get('dealId') || undefined

  const visibility: ConversationFilters['visibility'] = ['all', 'investor', 'internal', 'deal'].includes(visibilityParam)
    ? (visibilityParam as ConversationFilters['visibility'])
    : 'all'

  const type: ConversationFilters['type'] = ['all', 'dm', 'group', 'deal_room', 'broadcast'].includes(typeParam)
    ? (typeParam as ConversationFilters['type'])
    : 'all'

  return {
    filters: {
      visibility,
      type,
      search: searchTermRaw.trim().toLowerCase() || undefined,
      dealId,
      unreadOnly,
    },
    unreadOnly,
    includeMessages,
    limit,
    offset,
  }
}

function buildSelectColumns(includeMessages: boolean) {
  const base = `
    id,
    subject,
    preview,
    type,
    visibility,
    owner_team,
    deal_id,
    created_by,
    created_at,
    updated_at,
    last_message_at,
    last_message_id,
    archived_at,
    metadata,
    conversation_participants (
      conversation_id,
      user_id,
      participant_role,
      joined_at,
      last_read_at,
      last_notified_at,
      is_muted,
      is_pinned,
      profiles:user_id (
        id,
        display_name,
        email,
        role,
        avatar_url
      )
    )
  `

  if (!includeMessages) {
    return base
  }

  return `${base},
    messages (
      id,
      conversation_id,
      sender_id,
      body,
      message_type,
      file_key,
      reply_to_message_id,
      metadata,
      created_at,
      edited_at,
      deleted_at,
      sender:sender_id (
        id,
        display_name,
        email,
        role,
        avatar_url
      )
    )
  `
}

function normalizeConversationInternal(raw: any): NormalizedConversation {
  return normalizeConversation(raw)
}

async function applyUnreadCounts(
  supabaseClient: any,
  userId: string,
  conversations: NormalizedConversation[]
) {
  if (!conversations.length) return

  const conversationIds = conversations.map((conversation) => conversation.id)
  const chunkSize = 100
  const chunks = []

  for (let i = 0; i < conversationIds.length; i += chunkSize) {
    chunks.push(conversationIds.slice(i, i + chunkSize))
  }

  const unreadMap = new Map<string, number>()

  await Promise.all(
    chunks.map(async (chunk) => {
      const { data: rows, error } = await supabaseClient.rpc('get_conversation_unread_counts', {
        p_user_id: userId,
        p_conversation_ids: chunk,
      })

      if (error) {
        console.error('Error fetching unread counts:', error)
        return
      }

      for (const row of rows || []) {
        if (row?.conversation_id) {
          unreadMap.set(row.conversation_id, Number(row.unread_count) || 0)
        }
      }
    })
  )

  for (const conversation of conversations) {
    conversation.unreadCount = unreadMap.get(conversation.id) ?? 0
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
    const { filters, includeMessages, limit, offset } = parseFilters(url)
    const fetchLimit = Math.min(Math.max(limit * 4, 100), 500)

    // Check staff status using database profile (not JWT metadata)
    const isStaff = await isStaffUser(supabase, user)
    const client = createServiceClient()  // Use service client to fetch all participants (security enforced via application-level filtering at line 210)

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
      if (filters.visibility !== 'all' && conv.visibility !== filters.visibility) {
        return false
      }

      // Staff can see all conversations (RLS already enforces this)
      // Non-staff investors can only see conversations where they're participants (already checked above)

      // Type filter
      if (filters.type !== 'all' && conv.type !== filters.type) {
        return false
      }

      if (filters.dealId && conv.deal_id !== filters.dealId) {
        return false
      }

      return true
    })

  const normalized = baseList.map((conv: any) => normalizeConversationInternal(conv))

    await applyUnreadCounts(client, user.id, normalized)

    let filtered = normalized

    if (filters.unreadOnly) {
      filtered = filtered.filter((conv: NormalizedConversation) => conv.unreadCount > 0)
    }

    if (filters.search) {
      filtered = filtered.filter((conv: NormalizedConversation) => {
        const haystack: string[] = []
        if (conv.subject) haystack.push(conv.subject)
        if (conv.preview) haystack.push(conv.preview)
        if (conv.ownerTeam) haystack.push(conv.ownerTeam)
        conv.participants.forEach((participant: ConversationParticipant) => {
          if (participant.displayName) haystack.push(participant.displayName)
          if (participant.email) haystack.push(participant.email)
        })
        if (conv.latestMessage?.body) haystack.push(conv.latestMessage.body)

        return haystack.some(entry => entry.toLowerCase().includes(filters.search!))
      })
    }

    filtered.sort((a: NormalizedConversation, b: NormalizedConversation) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime()
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime()
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
        visibility: filters.visibility,
        type: filters.type,
        unread_only: filters.unreadOnly || false,
        search: filters.search || null,
      },
    })

  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new conversation
export async function POST(request: NextRequest) {
  console.log('[POST /api/conversations] ========== START ==========')
  try {
    console.log('[POST /api/conversations] Request received')
    const supabase = await createClient()
    console.log('[POST /api/conversations] Supabase client created')
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    console.log('[POST /api/conversations] getAuthenticatedUser result:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      console.error('[POST /api/conversations] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }
    
    console.log('[POST /api/conversations] Authenticated user:', user.id)
    const userId = user.id
    const userRole = user.user_metadata?.role || null

    const body = await request.json()
    console.log('[POST /api/conversations] Request body:', body)
    const { subject, participant_ids, type = 'dm', initial_message, visibility } = body

    if (!participant_ids || participant_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 })
    }

    // Ensure current user is included in participants
    const allParticipants = [...new Set([userId, ...participant_ids])]

    // Create conversation - set visibility based on type if not provided
    let finalVisibility = visibility
    if (!finalVisibility) {
      if (type === 'group') {
        finalVisibility = 'internal' // default for groups, will be overridden if investors included
      } else if (type === 'dm' || type === 'broadcast') {
        finalVisibility = 'investor' // DMs and broadcasts involve investors
      } else {
        finalVisibility = 'internal'
      }
    }

    console.log('[POST /api/conversations] Creating conversation with:', {
      subject,
      created_by: userId,
      type,
      visibility: finalVisibility
    })

    // Use service client to bypass RLS for conversation creation
    const serviceClient = createServiceClient()
    const { data: conversation, error: convError } = await serviceClient
      .from('conversations')
      .insert({
        subject,
        created_by: userId,
        type,
        visibility: finalVisibility
      })
      .select()
      .single()

    if (convError) {
      console.error('[POST /api/conversations] Error creating conversation:', {
        error: convError,
        message: convError.message,
        details: convError.details,
        hint: convError.hint,
        code: convError.code
      })
      return NextResponse.json({ 
        error: 'Failed to create conversation',
        details: convError.message || String(convError),
        hint: convError.hint || 'Check RLS policies on conversations table',
        code: convError.code
      }, { status: 500 })
    }

    console.log('[POST /api/conversations] Conversation created successfully:', conversation.id)

    // Add participants using service client (already instantiated above)
    const participantInserts = allParticipants.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }))

    console.log('[POST /api/conversations] Adding participants:', { 
      count: allParticipants.length,
      participantIds: allParticipants,
      inserts: participantInserts
    })

    const { data: participantsAdded, error: partError } = await serviceClient
      .from('conversation_participants')
      .insert(participantInserts)
      .select()

    console.log('[POST /api/conversations] Participants result:', {
      success: !partError,
      added: participantsAdded?.length,
      error: partError
    })

    if (partError) {
      console.error('[POST /api/conversations] Error adding participants:', partError)
      return NextResponse.json({ 
        error: 'Failed to add participants',
        details: partError.message || partError,
        hint: 'Check RLS policies on conversation_participants table'
      }, { status: 500 })
    }

    // Send initial message if provided
    if (initial_message) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: userId,
          body: initial_message
        })

      if (msgError) {
        console.error('Error sending initial message:', msgError)
        // Don't fail the whole request, just log the error
        // The conversation is already created successfully
      }
    }

    // Log conversation creation
    await auditLogger.log({
      actor_user_id: userId,
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
        id: conversation.id,
        subject: conversation.subject,
        type: conversation.type,
        visibility: conversation.visibility,
        participant_count: allParticipants.length
      }
    })

  } catch (error) {
    console.error('[POST /api/conversations] ========== CAUGHT ERROR ==========')
    console.error('[POST /api/conversations] Error type:', typeof error)
    console.error('[POST /api/conversations] Error:', error)
    if (error instanceof Error) {
      console.error('[POST /api/conversations] Error message:', error.message)
      console.error('[POST /api/conversations] Error stack:', error.stack)
    }
    
    const errorResponse = { 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      errorType: typeof error,
      timestamp: new Date().toISOString()
    }
    
    console.error('[POST /api/conversations] Returning error response:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
