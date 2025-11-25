import { createClient } from '@/lib/supabase/client'
import type {
  ConversationFilters,
  ConversationMessage,
  ConversationSummary,
  MessageSender,
} from '@/types/messaging'

interface FetchConversationsOptions extends ConversationFilters {
  limit?: number
  offset?: number
  includeMessages?: boolean
}

interface FetchConversationsResponse {
  conversations: ConversationSummary[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface FetchMessagesOptions {
  limit?: number
  offset?: number
}

export async function fetchConversationsClient(
  filters: FetchConversationsOptions
): Promise<FetchConversationsResponse> {
  const params = new URLSearchParams()

  if (filters.visibility) params.set('visibility', filters.visibility)
  if (filters.type) params.set('type', filters.type)
  if (filters.unreadOnly) params.set('unread', 'true')
  if (filters.search) params.set('search', filters.search)
  if (filters.dealId) params.set('dealId', filters.dealId)
  if (typeof filters.limit === 'number') params.set('limit', String(filters.limit))
  if (typeof filters.offset === 'number') params.set('offset', String(filters.offset))
  if (filters.includeMessages === false) params.set('includeMessages', 'false')

  const response = await fetch(`/api/conversations?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || 'Failed to load conversations')
  }

  const data = await response.json()

  return {
    conversations: data.conversations as ConversationSummary[],
    total: data.pagination.total,
    limit: data.pagination.limit,
    offset: data.pagination.offset,
    hasMore: data.pagination.has_more,
  }
}

export function normalizeConversation(raw: any): ConversationSummary {
  const participants = Array.isArray(raw?.conversation_participants)
    ? raw.conversation_participants.map((participant: any) => {
        const profile = participant?.profiles || {}
        return {
          id: profile.id || participant.user_id,
          displayName: profile.display_name || profile.email || null,
          email: profile.email || null,
          role: profile.role || null,
          avatarUrl: profile.avatar_url ?? null,
          participantRole: participant?.participant_role ?? 'member',
          joinedAt: participant?.joined_at,
          lastReadAt: participant?.last_read_at ?? null,
          lastNotifiedAt: participant?.last_notified_at ?? null,
          isMuted: participant?.is_muted ?? false,
          isPinned: participant?.is_pinned ?? false,
        }
      })
    : []

  const latestMessageRaw = Array.isArray(raw?.messages) ? raw.messages[0] : null
  const latestMessage = latestMessageRaw ? normalizeMessage(latestMessageRaw) : null

  return {
    id: raw.id,
    subject: raw.subject ?? null,
    preview: raw.preview ?? null,
    type: raw.type ?? 'dm',
    visibility: raw.visibility ?? 'internal',
    ownerTeam: raw.owner_team ?? null,
    dealId: raw.deal_id ?? null,
    createdBy: raw.created_by ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastMessageAt: raw.last_message_at ?? null,
    lastMessageId: raw.last_message_id ?? null,
    archivedAt: raw.archived_at ?? null,
    metadata: raw.metadata ?? {},
    participants,
    unreadCount: raw.unreadCount ?? 0,
    latestMessage,
    participantCount: participants.length,
  }
}

export async function fetchConversationMessages(
  conversationId: string,
  options: FetchMessagesOptions = {}
): Promise<ConversationMessage[]> {
  const params = new URLSearchParams()
  if (typeof options.limit === 'number') params.set('limit', String(options.limit))
  if (typeof options.offset === 'number') params.set('offset', String(options.offset))

  const response = await fetch(`/api/conversations/${conversationId}/messages?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || 'Failed to fetch messages')
  }

  const data = await response.json()
  return data.messages as ConversationMessage[]
}

export async function markConversationRead(conversationId: string) {
  await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' })
}

export function getClientSupabase() {
  return createClient()
}

export function subscribeToConversationUpdates(
  conversationId: string,
  callbacks: {
    onMessage?: (message: ConversationMessage) => void
    onUpdate?: () => void
  }
) {
  const supabase = createClient()
  
  console.log('[Realtime] Subscribing to conversation:', conversationId)

  const channel = supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('[Realtime] Message received for conversation:', conversationId, payload.new)
        if (payload.eventType === 'INSERT') {
          callbacks.onMessage?.(normalizeMessage(payload.new))
        }
        callbacks.onUpdate?.()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversation_participants',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('[Realtime] Participants changed for conversation:', conversationId)
        callbacks.onUpdate?.()
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Channel status for', conversationId, ':', status)
    })

  return () => {
    console.log('[Realtime] Unsubscribing from conversation:', conversationId)
    supabase.removeChannel(channel)
  }
}

export function normalizeMessage(raw: any): ConversationMessage {
  // Handle both API responses (with joined sender) and realtime events (without joins)
  const sender = raw.sender as MessageSender | undefined

  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    body: raw.body ?? null,
    messageType: raw.message_type ?? 'text',
    fileKey: raw.file_key ?? null,
    replyToMessageId: raw.reply_to_message_id ?? null,
    metadata: raw.metadata ?? {},
    createdAt: raw.created_at,
    editedAt: raw.edited_at ?? null,
    deletedAt: raw.deleted_at ?? null,
    // Sender might not be available in realtime payloads, that's ok
    sender: sender ? {
      id: sender.id ?? null,
      displayName: sender.displayName ?? (sender as any).display_name ?? null,
      email: sender.email ?? null,
      role: sender.role ?? null,
      avatarUrl: sender.avatarUrl ?? (sender as any).avatar_url ?? null,
    } : null,
    readBy: Array.isArray(raw.read_by) ? raw.read_by : [],
  }
}


