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

  // Check user personas for access control
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isStaff = personas?.some((p: any) => p.persona_type === 'staff') || false
  const isArranger = personas?.some((p: any) => p.persona_type === 'arranger') || false
  const isIntroducer = personas?.some((p: any) => p.persona_type === 'introducer') || false

  // Block arrangers who don't have staff access
  // Per user stories: Arrangers need notifications, not messaging
  if (isArranger && !isStaff) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Messages Not Available
          </h3>
          <p className="text-muted-foreground">
            As an arranger, you&apos;ll receive important updates via the notification system.
            Check the notification bell for alerts about agreements, payments, and signatures.
          </p>
        </div>
      </div>
    )
  }

  // Block introducers who don't have staff access
  // Per PRD: Introducers have zero messaging user stories - passive notification recipients only
  if (isIntroducer && !isStaff) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Messages Not Available
          </h3>
          <p className="text-muted-foreground">
            As an introducer, you&apos;ll receive important updates via the notification system.
            Check the notification bell for alerts about introduction progress and commission updates.
          </p>
        </div>
      </div>
    )
  }

  // Only staff get elevated messaging access (all conversations)
  const hasStaffAccess = isStaff

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
