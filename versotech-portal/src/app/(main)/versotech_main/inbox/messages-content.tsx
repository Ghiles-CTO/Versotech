'use client'

import { useEffect, useState } from 'react'
import { MessagingClient } from '@/components/messaging/staff/messaging-client'
import { normalizeConversation } from '@/lib/messaging/supabase'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MessagesContent() {
  const [conversations, setConversations] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Not authenticated')
          return
        }

        setCurrentUserId(user.id)

        // Fetch conversations
        const { data, error: fetchError } = await supabase
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

        if (fetchError) throw fetchError

        // Normalize conversations
        const normalizedConversations = (data || []).map(normalizeConversation)

        // Get unread counts
        const conversationIds = normalizedConversations.map(conv => conv.id)
        if (conversationIds.length > 0) {
          const { data: unreadData } = await supabase.rpc('get_conversation_unread_counts', {
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

        setConversations(normalizedConversations)
        setError(null)
      } catch (err) {
        console.error('[MessagesContent] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading messages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Messages</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Not Authenticated</h3>
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    )
  }

  return (
    <MessagingClient initialConversations={conversations} currentUserId={currentUserId} />
  )
}
