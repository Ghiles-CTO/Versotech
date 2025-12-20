import { MessagingClient } from '@/components/messaging/staff/messaging-client'
import { requireAuth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizeConversation } from '@/lib/messaging/supabase'

export const dynamic = 'force-dynamic'

export default async function StaffMessages() {
  const profile = await requireAuth(['staff_admin', 'staff_ops', 'staff_rm', 'ceo'])
  const supabase = createServiceClient()

  console.log('[Staff Messages Page] Loading conversations for user:', profile.id)

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
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
      ),
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
    `)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { foreignTable: 'messages', ascending: false })
    .limit(1, { foreignTable: 'messages' })
    .limit(50)

  if (error) {
    console.error('[Staff Messages Page] Error loading conversations:', error)
    throw new Error(error.message)
  }

  console.log('[Staff Messages Page] Loaded conversations:', data?.length || 0)

  // Normalize conversations
  const normalizedConversations = (data || []).map(normalizeConversation)

  // Compute unread counts for staff
  const conversationIds = normalizedConversations.map(conv => conv.id)
  
  if (conversationIds.length > 0) {
    const { data: unreadData } = await supabase.rpc('get_conversation_unread_counts', {
      p_user_id: profile.id,
      p_conversation_ids: conversationIds,
    })

    const unreadMap = new Map<string, number>()
    for (const row of unreadData || []) {
      if (row?.conversation_id) {
        unreadMap.set(row.conversation_id, Number(row.unread_count) || 0)
      }
    }

    for (const conversation of normalizedConversations) {
      conversation.unreadCount = unreadMap.get(conversation.id) ?? 0
    }
  }

  return (
    <MessagingClient initialConversations={normalizedConversations} currentUserId={profile.id} />
    )
}

