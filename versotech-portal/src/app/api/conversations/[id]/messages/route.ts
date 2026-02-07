import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeMessage } from '@/lib/messaging'
import { generateComplianceReply } from '@/lib/compliance/chat-assistant'
import { resolveAgentIdForTask } from '@/lib/agents'

const DEFAULT_COMPLIANCE_KNOWLEDGE = [
  'KYC/AML reminders are managed in-platform and tracked in compliance logs.',
  'Blacklist matches require compliance review; do not state automatic legal conclusions.',
  'OFAC checks are manual and require supporting screening evidence upload.',
  'High-risk or uncertain topics must be escalated to a human compliance officer.',
]

// Get messages for a conversation
export async function GET(
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
    
    const userId = user.id

    const { id: conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    const isStaff = await isStaffUser(supabase, user)
    const readClient = isStaff ? serviceSupabase : supabase

    const { data: messages, error } = await readClient
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          email,
          role,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    const normalized = (messages || []).map(normalizeMessage)

    return NextResponse.json({
      messages: normalized,
      has_more: (messages?.length || 0) === limit
    })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Send a new message
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
    
    const userId = user.id

    const { id: conversationId } = await params
    const { body, file_key, reply_to_message_id, metadata: messageMetadata } = await request.json()

    if (!body && !file_key) {
      return NextResponse.json({ error: 'Message body or file is required' }, { status: 400 })
    }

    // Verify conversation exists (access control handled by RLS)
    const isStaff = await isStaffUser(supabase, user)

    const { data: conversation, error: convError } = await serviceSupabase
      .from('conversations')
      .select('id, metadata')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message (RLS will enforce access control)
    if (isStaff) {
      const { data: existingParticipant } = await serviceSupabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingParticipant) {
        await serviceSupabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversationId,
            user_id: userId,
            participant_role: 'member'
          })
      }
    }

    const writeClient = isStaff ? serviceSupabase : supabase
    const { data: message, error: msgError } = await writeClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
        file_key,
        reply_to_message_id,
        metadata: messageMetadata ?? {}
      })
      .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          email,
          role,
          avatar_url
        )
      `)
      .single()

    if (msgError) {
      console.error('Error creating message:', msgError)
      
      // Check if it's an RLS policy violation
      if (msgError.code === '42501' || msgError.message?.includes('policy')) {
        return NextResponse.json({ error: 'Access denied - you do not have permission to send messages in this conversation' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    const normalizedMessage = normalizeMessage(message)

    // Log message for audit
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.MESSAGE_SENT,
      entity: AuditEntities.MESSAGES,
      entity_id: message.id,
      metadata: {
        conversation_id: conversationId,
        has_body: !!body,
        has_attachment: !!file_key,
        reply_to_message_id: reply_to_message_id || null,
        message_length: body?.length || 0
      }
    })

    // Compliance AI assistant:
    // Reuses current conversation/message tables and only runs for compliance-flagged threads.
    const conversationMetadata = ((conversation as { metadata?: unknown })?.metadata || {}) as Record<string, any>
    const complianceMetadata = (conversationMetadata.compliance || {}) as Record<string, any>
    const isComplianceThread = complianceMetadata.flagged === true
    const isComplianceOpen = (complianceMetadata.status || 'open') !== 'resolved'
    const bodyText = typeof body === 'string' ? body.trim() : ''
    const isAiAuthoredInput = (messageMetadata as Record<string, any> | undefined)?.ai_generated === true

    if (isComplianceThread && isComplianceOpen && bodyText && !isStaff && !isAiAuthoredInput) {
      try {
        const wayneAgentId = await resolveAgentIdForTask(serviceSupabase, 'W001')
        const { data: wayneAgent } = wayneAgentId
          ? await serviceSupabase
              .from('ai_agents')
              .select('id, name, system_prompt')
              .eq('id', wayneAgentId)
              .maybeSingle()
          : { data: null }

        const assistantName = wayneAgent?.name || "Wayne O'Connor"
        const assistantPrompt = wayneAgent?.system_prompt || null

        const { data: recentMessages } = await serviceSupabase
          .from('messages')
          .select('id, body, created_at, metadata, sender:sender_id(display_name, email)')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(12)

        const conversationContext = (recentMessages || [])
          .slice()
          .reverse()
          .map((item: any) => {
            const sender = Array.isArray(item.sender) ? item.sender[0] : item.sender
            const meta = (item.metadata || {}) as Record<string, any>
            return {
              createdAt: item.created_at,
              senderName: sender?.display_name || sender?.email || null,
              body: typeof item.body === 'string' ? item.body : '',
              isAi: meta.ai_generated === true,
            }
          })
          .filter((item: { body: string }) => item.body.length > 0)

        const { data: recentComplianceEvents } = await serviceSupabase
          .from('compliance_activity_log')
          .select('event_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(8)

        const knowledgeContext = [
          ...DEFAULT_COMPLIANCE_KNOWLEDGE,
          ...(recentComplianceEvents || []).map((item) => {
            const description = typeof item.description === 'string' ? item.description.trim() : ''
            const eventType = typeof item.event_type === 'string' ? item.event_type : 'event'
            if (!description) return `Recent ${eventType} event recorded.`
            return `Recent ${eventType}: ${description}`
          }),
        ]

        const aiResult = await generateComplianceReply({
          latestUserMessage: bodyText,
          conversationContext,
          knowledgeContext,
          systemPrompt: assistantPrompt,
        })

        if (aiResult.error) {
          console.error('[compliance-ai] Generation failed:', aiResult.error)
        }

        if (aiResult.reply) {
          await serviceSupabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: null,
            message_type: 'system',
            body: aiResult.reply,
            metadata: {
              ai_generated: true,
              assistant_name: assistantName,
              assistant_agent_id: wayneAgentId,
              provider: aiResult.provider,
              model: aiResult.model,
              source: 'compliance_assistant',
              escalated: aiResult.escalated,
              escalation_reason: aiResult.escalationReason,
              reply_to_message_id: message.id,
              knowledge_context_count: knowledgeContext.length,
            },
          })
        }

        if (aiResult.escalated) {
          const now = new Date().toISOString()
          const updatedCompliance: Record<string, any> = {
            ...complianceMetadata,
            flagged: true,
            status: 'open',
            urgency: 'high',
            updated_at: now,
            escalated_by_ai: true,
            escalation_reason: aiResult.escalationReason,
          }

          if (!updatedCompliance.flagged_at) updatedCompliance.flagged_at = now
          if (!updatedCompliance.flagged_by) updatedCompliance.flagged_by = userId
          if (!updatedCompliance.reason && aiResult.escalationReason) {
            updatedCompliance.reason = aiResult.escalationReason
          }

          await serviceSupabase
            .from('conversations')
            .update({
              metadata: {
                ...conversationMetadata,
                compliance: updatedCompliance,
              },
            })
            .eq('id', conversationId)

          await serviceSupabase.from('compliance_activity_log').insert({
            event_type: 'compliance_question',
            description: `AI escalation: ${aiResult.escalationReason || 'High-risk compliance topic'}`,
            agent_id: wayneAgentId,
            created_by: userId,
            metadata: {
              conversation_id: conversationId,
              message_id: message.id,
              escalated_by_ai: true,
              provider: aiResult.provider,
              model: aiResult.model,
            },
          })

          const { data: ceoUsers } = await serviceSupabase.from('ceo_users').select('user_id')
          const notifications = (ceoUsers || []).map((ceo) => ({
            user_id: ceo.user_id,
            title: 'AI escalated compliance conversation',
            message: `High-risk topic detected: ${aiResult.escalationReason || 'Compliance review required'}`,
            link: '/versotech_main/messages?compliance=true',
            type: 'compliance_question',
            created_by: userId,
            agent_id: wayneAgentId,
            data: {
              conversation_id: conversationId,
              message_id: message.id,
              escalated_by_ai: true,
            },
          }))

          if (notifications.length > 0) {
            await serviceSupabase.from('investor_notifications').insert(notifications)
          }
        }
      } catch (assistantError) {
        console.error('[compliance-ai] Assistant pipeline failed:', assistantError)
      }
    }

    return NextResponse.json({
      success: true,
      message: normalizedMessage
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

