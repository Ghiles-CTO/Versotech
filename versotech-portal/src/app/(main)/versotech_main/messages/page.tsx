import { MessagingClient } from '@/components/messaging/staff/messaging-client'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { normalizeConversation } from '@/lib/messaging/supabase'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

/**
 * Messages Page for Unified Portal (versotech_main)
 *
 * Persona-aware messaging:
 * - Staff/CEO personas: Access to all conversations
 * - Other personas: Only conversations they're participating in
 */
export default async function MessagesPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view messages.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO/arranger persona for full access
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  // Staff and arrangers get elevated messaging access
  const hasStaffAccess = personas?.some(
    (p: any) => p.persona_type === 'staff' || p.persona_type === 'arranger'
  ) || false

  let conversationData: any[] = []

  if (hasStaffAccess) {
    // Staff: Access to all conversations
    const { data, error } = await serviceSupabase
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
      console.error('[Messages Page] Error loading conversations:', error)
    }
    conversationData = data || []
  } else {
    // Non-staff: Only conversations they're participating in
    const { data, error } = await serviceSupabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner (
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
      .eq('conversation_participants.user_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { foreignTable: 'messages', ascending: false })
      .limit(1, { foreignTable: 'messages' })
      .limit(50)

    if (error) {
      console.error('[Messages Page] Error loading conversations:', error)
    }
    conversationData = data || []
  }

  // Normalize conversations
  const normalizedConversations = conversationData.map(normalizeConversation)

  // Compute unread counts
  const conversationIds = normalizedConversations.map(conv => conv.id)

  if (conversationIds.length > 0) {
    const { data: unreadData } = await serviceSupabase.rpc('get_conversation_unread_counts', {
      p_user_id: user.id,
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
    <MessagingClient initialConversations={normalizedConversations} currentUserId={user.id} />
  )
}
