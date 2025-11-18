import { AppLayout } from '@/components/layout/app-layout'
import { InvestorMessagingClient } from '@/components/messaging/investor/messaging-client'
import { requireAuth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizeConversation } from '@/lib/messaging/supabase'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const profile = await requireAuth(['investor'])
  const supabase = createServiceClient()

  const { data: participantRows, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', profile.id)
    .limit(250)

  if (participantError) {
    throw new Error(participantError.message)
  }

  const conversationIds = (participantRows || []).map(row => row.conversation_id)

  if (!conversationIds.length) {
    return (
      <AppLayout brand="versoholdings">
        <InvestorMessagingClient currentUserId={profile.id} initialConversations={[]} />
      </AppLayout>
    )
  }

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
          role
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
          role
        )
      )
    `)
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  const conversations = (data || []).map(normalizeConversation)

  return (
    <AppLayout brand="versoholdings">
      <InvestorMessagingClient currentUserId={profile.id} initialConversations={conversations} />
    </AppLayout>
  )
}