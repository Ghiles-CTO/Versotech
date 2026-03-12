import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { ensureAccountSupportConversationForUser } from '@/lib/messaging/account-support'

function parseRequestBody(body: unknown): {
  initialMessage: string | null
  messageMetadata: Record<string, unknown> | null
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      initialMessage: null,
      messageMetadata: null,
    }
  }

  const record = body as Record<string, unknown>
  const initialMessage =
    typeof record.initial_message === 'string' && record.initial_message.trim()
      ? record.initial_message.trim()
      : null
  const messageMetadata =
    record.message_metadata &&
    typeof record.message_metadata === 'object' &&
    !Array.isArray(record.message_metadata)
      ? (record.message_metadata as Record<string, unknown>)
      : null

  return {
    initialMessage,
    messageMetadata,
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestBody = await request.json().catch(() => null)
    const { initialMessage, messageMetadata } = parseRequestBody(requestBody)

    const serviceSupabase = createServiceClient()
    const supportConversation = await ensureAccountSupportConversationForUser(serviceSupabase, user.id)

    if (!supportConversation) {
      return NextResponse.json(
        { error: 'Support conversation is not available for the active persona' },
        { status: 404 }
      )
    }

    if (initialMessage) {
      const { error: messageError } = await serviceSupabase
        .from('messages')
        .insert({
          conversation_id: supportConversation.conversationId,
          sender_id: user.id,
          body: initialMessage,
          metadata: messageMetadata || undefined,
        })

      if (messageError) {
        return NextResponse.json(
          { error: 'Failed to send support message', details: messageError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: supportConversation.conversationId,
        subject: supportConversation.subject,
        created: supportConversation.created,
      },
    })
  } catch (error) {
    console.error('[Support Conversation] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
