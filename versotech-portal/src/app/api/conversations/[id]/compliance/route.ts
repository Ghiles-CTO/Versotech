import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { resolveAgentIdForTask } from '@/lib/agents'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const action = typeof body?.action === 'string' ? body.action : 'flag'
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''
    const urgency = typeof body?.urgency === 'string' ? body.urgency : 'medium'
    const messageId = typeof body?.messageId === 'string' ? body.messageId : null
    const assignedAgentId = typeof body?.assignedAgentId === 'string' ? body.assignedAgentId : null

    if (!['flag', 'resolve', 'assign'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { id: conversationId } = await params
    const { data: conversation, error: conversationError } = await serviceSupabase
      .from('conversations')
      .select('id, metadata')
      .eq('id', conversationId)
      .maybeSingle()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const metadata = (conversation.metadata || {}) as Record<string, any>
    const compliance = { ...(metadata.compliance || {}) }
    const now = new Date().toISOString()

    if (action === 'flag') {
      compliance.flagged = true
      compliance.auto_default = false
      compliance.status = compliance.status || 'open'
      if (reason) compliance.reason = reason
      compliance.urgency = urgency || compliance.urgency || 'medium'
      compliance.flagged_at = compliance.flagged_at || now
      compliance.flagged_by = user.id
      if (messageId) compliance.message_id = messageId
      compliance.updated_at = now
    }

    if (action === 'resolve') {
      compliance.status = 'resolved'
      compliance.resolved_at = now
      compliance.resolved_by = user.id
      compliance.updated_at = now
    }

    if (action === 'assign' && assignedAgentId) {
      compliance.assigned_agent_id = assignedAgentId
      compliance.updated_at = now
    }

    const { error: updateError } = await serviceSupabase
      .from('conversations')
      .update({ metadata: { ...metadata, compliance } })
      .eq('id', conversationId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
    }

    if (action === 'flag') {
      try {
        const agentId = await resolveAgentIdForTask(serviceSupabase, 'W001')
        await serviceSupabase.from('compliance_activity_log').insert({
          event_type: 'compliance_question',
          description: reason || 'Compliance question flagged from chat.',
          agent_id: agentId,
          created_by: user.id,
          metadata: {
            conversation_id: conversationId,
            message_id: messageId,
            urgency,
            status: 'open',
          },
        })

        const { data: ceoUsers } = await serviceSupabase.from('ceo_users').select('user_id')
        const notifications = (ceoUsers ?? []).map((ceo) => ({
          user_id: ceo.user_id,
          investor_id: null,
          title: 'Compliance question flagged',
          message: reason || 'A compliance question was flagged in chat.',
          link: '/versotech_main/messages?compliance=true',
          type: 'general',
          agent_id: agentId,
          data: {
            conversation_id: conversationId,
            urgency,
          },
        }))

        if (notifications.length) {
          await serviceSupabase.from('investor_notifications').insert(notifications)
        }
      } catch (logError) {
        console.error('[compliance] Failed to log compliance question:', logError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[conversations/compliance] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
