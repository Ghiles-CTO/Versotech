import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { processAgentChatReply } from '@/lib/compliance/agent-chat-reply'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const body = await request.json().catch(() => ({}))
    const messageId = typeof body?.message_id === 'string' ? body.message_id : null

    const staff = await isStaffUser(supabase, user)
    if (!staff) {
      const { data: membership } = await serviceSupabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const result = await processAgentChatReply(serviceSupabase, {
      conversationId,
      triggerMessageId: messageId,
      actorUserId: user.id,
    })

    return NextResponse.json({
      success: result.ok,
      status: result.status,
      provider: (result as any).provider ?? null,
      model: (result as any).model ?? null,
      escalated: (result as any).escalated ?? false,
      error: (result as any).error ?? null,
    })
  } catch (error) {
    console.error('[agent-reply] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
