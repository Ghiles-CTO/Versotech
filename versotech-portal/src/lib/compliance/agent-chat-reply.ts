import { generateComplianceReply } from '@/lib/compliance/chat-assistant'
import {
  buildAgentChatMetadata,
  isAgentChatConversation,
  readAgentChatMetadata,
  resolveComplianceChatAgent,
} from '@/lib/compliance/agent-chat'

type ServiceClient = any

const DEFAULT_COMPLIANCE_KNOWLEDGE = [
  'KYC/AML reminders are managed in-platform and tracked in compliance logs.',
  'Blacklist matches require compliance review; do not state automatic legal conclusions.',
  'OFAC checks are manual and require supporting screening evidence upload.',
  'High-risk or uncertain topics must be escalated to a human compliance officer.',
]

function asRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, any>
}

function safeTrim(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAgentName(value: unknown) {
  const source = safeTrim(value)
  if (!source) return ''
  return source
    .normalize('NFKD')
    .replace(/[’`]/g, "'")
    .replace(/[^a-zA-Z0-9'\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function fallbackReplyMessage(latestMessage: string) {
  const message = latestMessage.toLowerCase()

  if (
    /(kyc|passport|proof of address|poa|document|expiry|expire|id card|driver.?s license)/i.test(message)
  ) {
    return 'For KYC, start with one valid government ID and one recent proof of address, then check expiry and issue dates before upload. If any document is close to expiry or unclear, keep the case open for compliance review and we will confirm the exact next step.'
  }

  if (/(ofac|sanction|blacklist|watchlist|pep)/i.test(message)) {
    return 'For sanctions or blacklist questions, pause transaction steps and route this case to human compliance review. Please upload any supporting screening evidence in the platform so the team can make the final determination.'
  }

  return 'Thanks for your message. Please continue with the details here and a compliance officer will review and provide the next required steps in-platform.'
}

export async function processAgentChatReply(
  supabase: ServiceClient,
  params: {
    conversationId: string
    triggerMessageId?: string | null
    actorUserId: string
  }
) {
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('id, metadata')
    .eq('id', params.conversationId)
    .maybeSingle()

  if (conversationError || !conversation) {
    return { ok: false, status: 'conversation_not_found' as const }
  }

  const metadataRoot = asRecord(conversation.metadata)
  if (!isAgentChatConversation(metadataRoot)) {
    return { ok: true, status: 'not_agent_thread' as const }
  }

  const agentChatMeta = readAgentChatMetadata(metadataRoot)
  const assignedAgentIdFromMetadata = agentChatMeta?.agent_id || null
  const assignedAgentNameFromMetadata = normalizeAgentName(agentChatMeta?.agent_name)

  let sourceMessage: any = null
  if (params.triggerMessageId) {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at, metadata')
      .eq('conversation_id', params.conversationId)
      .eq('id', params.triggerMessageId)
      .maybeSingle()
    sourceMessage = data
  }

  if (!sourceMessage) {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at, metadata')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: false })
      .limit(20)
    sourceMessage = (data || []).find((item: any) => {
      const meta = asRecord(item?.metadata)
      return meta.ai_generated !== true && safeTrim(item?.body).length > 0
    })
  }

  if (!sourceMessage?.id) {
    return { ok: true, status: 'no_user_message' as const }
  }

  const sourceMeta = asRecord(sourceMessage.metadata)
  if (sourceMeta.ai_generated === true || safeTrim(sourceMessage.body).length === 0) {
    return { ok: true, status: 'skip_ai_input' as const }
  }

  const { data: recentAssistantMessages } = await supabase
    .from('messages')
    .select('id, metadata')
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: false })
    .limit(30)

  const alreadyReplied = (recentAssistantMessages || []).some((item: any) => {
    const meta = asRecord(item?.metadata)
    return meta.source === 'compliance_assistant' && meta.reply_to_message_id === sourceMessage.id
  })

  if (alreadyReplied) {
    return { ok: true, status: 'already_replied' as const }
  }

  const agent = await resolveComplianceChatAgent(supabase, { requireActive: true })
  if (!agent) {
    const assistantName = agentChatMeta?.agent_name || "Wayne O'Connor"
    const assistantAvatarUrl = agentChatMeta?.agent_avatar_url || null

    const { error: unavailableInsertError } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: null,
      message_type: 'system',
      body:
        "I'm currently unavailable due to a temporary issue. Please continue sharing your question here and a human compliance officer will follow up.",
      metadata: {
        ai_generated: true,
        assistant_name: assistantName,
        assistant_agent_id: assignedAgentIdFromMetadata,
        assistant_avatar_url: assistantAvatarUrl,
        provider: 'disabled',
        model: 'agent_inactive',
        source: 'compliance_assistant',
        fallback: true,
        error: 'Compliance agent is inactive',
        reply_to_message_id: sourceMessage.id,
      },
    })

    if (unavailableInsertError) {
      console.error('[agent-chat] Failed to insert inactive-agent reply:', unavailableInsertError)
      return { ok: false, status: 'reply_failed' as const, error: unavailableInsertError.message }
    }

    try {
      await supabase.from('compliance_activity_log').insert({
        event_type: 'compliance_question',
        description: 'Compliance agent inactive: human follow-up required.',
        agent_id: assignedAgentIdFromMetadata,
        created_by: params.actorUserId,
        metadata: {
          conversation_id: params.conversationId,
          message_id: sourceMessage.id,
          agent_inactive: true,
        },
      })

      const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
      const notifications = (ceoUsers || []).map((ceo: any) => ({
        user_id: ceo.user_id,
        title: 'Compliance agent unavailable',
        message: 'An investor sent a compliance question, but the agent is inactive.',
        link: '/versotech_admin/agents?tab=chat',
        type: 'compliance_question',
        created_by: params.actorUserId,
        agent_id: assignedAgentIdFromMetadata,
        data: {
          conversation_id: params.conversationId,
          message_id: sourceMessage.id,
          agent_inactive: true,
        },
      }))

      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('investor_notifications')
          .insert(notifications)
        if (notificationError) {
          console.error('[agent-chat] Failed to insert agent-inactive notifications:', notificationError)
        }
      }
    } catch (logError) {
      console.error('[agent-chat] Failed to log agent-inactive activity:', logError)
    }

    return { ok: true, status: 'agent_inactive_replied' as const }
  }

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('id, body, created_at, metadata, sender:sender_id(display_name, email)')
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: false })
    .limit(12)

  const conversationContext = (recentMessages || [])
    .slice()
    .reverse()
    .map((item: any) => {
      const sender = Array.isArray(item.sender) ? item.sender[0] : item.sender
      const itemMeta = asRecord(item.metadata)
      return {
        createdAt: item.created_at,
        senderName: sender?.display_name || sender?.email || null,
        body: typeof item.body === 'string' ? item.body : '',
        isAi: itemMeta.ai_generated === true,
      }
    })
    .filter((item: { body: string }) => item.body.length > 0)

  const { data: recentComplianceEvents } = await supabase
    .from('compliance_activity_log')
    .select('event_type, description, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const knowledgeContext = [
    ...DEFAULT_COMPLIANCE_KNOWLEDGE,
    ...(recentComplianceEvents || []).map((item: any) => {
      const description = safeTrim(item?.description)
      const eventType = safeTrim(item?.event_type) || 'event'
      if (!description) return `Recent ${eventType} event recorded.`
      return `Recent ${eventType}: ${description}`
    }),
  ]

  const aiResult = await generateComplianceReply({
    latestUserMessage: safeTrim(sourceMessage.body),
    conversationContext,
    knowledgeContext,
    systemPrompt: agent.system_prompt || null,
  })

  if (aiResult.error || !aiResult.reply) {
    const fallbackReply = fallbackReplyMessage(safeTrim(sourceMessage.body))
    const { error: fallbackInsertError } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: null,
      message_type: 'system',
      body: fallbackReply,
      metadata: {
        ai_generated: true,
        assistant_name: agent.name,
        assistant_agent_id: agent.id,
        assistant_avatar_url: agent.avatar_url,
        provider: aiResult.provider,
        model: aiResult.model,
        source: 'compliance_assistant',
        fallback: true,
        error: aiResult.error || 'No reply generated',
        reply_to_message_id: sourceMessage.id,
      },
    })

    if (fallbackInsertError) {
      return {
        ok: false,
        status: 'reply_failed' as const,
        error: aiResult.error || fallbackInsertError.message || 'No reply generated',
      }
    }

    console.error(
      '[agent-chat] AI reply fallback used:',
      aiResult.error || 'No reply generated'
    )

    return {
      ok: true,
      status: 'fallback_replied' as const,
      provider: aiResult.provider,
      model: aiResult.model,
      escalated: false,
    }
  }

  const { error: aiInsertError } = await supabase.from('messages').insert({
    conversation_id: params.conversationId,
    sender_id: null,
    message_type: 'system',
    body: aiResult.reply,
    metadata: {
      ai_generated: true,
      assistant_name: agent.name,
      assistant_agent_id: agent.id,
      assistant_avatar_url: agent.avatar_url,
      provider: aiResult.provider,
      model: aiResult.model,
      source: 'compliance_assistant',
      escalated: aiResult.escalated,
      escalation_reason: aiResult.escalationReason,
      reply_to_message_id: sourceMessage.id,
      knowledge_context_count: knowledgeContext.length,
    },
  })

  if (aiInsertError) {
    return { ok: false, status: 'insert_failed' as const, error: aiInsertError.message }
  }

  const complianceMetadata = asRecord(metadataRoot.compliance)
  const agentChatMetadata = buildAgentChatMetadata(metadataRoot.agent_chat, agent)

  const nextMetadata: Record<string, any> = {
    ...metadataRoot,
    agent_chat: agentChatMetadata,
  }

  if (aiResult.escalated) {
    const now = new Date().toISOString()
    nextMetadata.compliance = {
      ...complianceMetadata,
      flagged: true,
      status: 'open',
      urgency: 'high',
      updated_at: now,
      escalated_by_ai: true,
      escalation_reason: aiResult.escalationReason,
      assigned_agent_id: agent.id,
      flagged_at: complianceMetadata.flagged_at || now,
      flagged_by: complianceMetadata.flagged_by || params.actorUserId,
      reason: complianceMetadata.reason || aiResult.escalationReason,
    }

    const { error: logError } = await supabase.from('compliance_activity_log').insert({
      event_type: 'compliance_question',
      description: `AI escalation: ${aiResult.escalationReason || 'High-risk compliance topic'}`,
      agent_id: agent.id,
      created_by: params.actorUserId,
      metadata: {
        conversation_id: params.conversationId,
        message_id: sourceMessage.id,
        escalated_by_ai: true,
        provider: aiResult.provider,
        model: aiResult.model,
      },
    })
    if (logError) {
      console.error('[agent-chat] Failed to log escalation activity:', logError)
    }

    const { data: ceoUsers } = await supabase.from('ceo_users').select('user_id')
    const notifications = (ceoUsers || []).map((ceo: any) => ({
      user_id: ceo.user_id,
      title: 'AI escalated compliance conversation',
      message: `High-risk topic detected: ${aiResult.escalationReason || 'Compliance review required'}`,
      link: '/versotech_admin/agents?tab=chat',
      type: 'compliance_question',
      created_by: params.actorUserId,
      agent_id: agent.id,
      data: {
        conversation_id: params.conversationId,
        message_id: sourceMessage.id,
        escalated_by_ai: true,
      },
    }))

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('investor_notifications')
        .insert(notifications)
      if (notificationError) {
        console.error('[agent-chat] Failed to insert escalation notifications:', notificationError)
      }
    }
  }

  const { error: metadataUpdateError } = await supabase
    .from('conversations')
    .update({ metadata: nextMetadata })
    .eq('id', params.conversationId)

  if (metadataUpdateError) {
    console.error('[agent-chat] Failed to update conversation metadata:', metadataUpdateError)
  }

  return {
    ok: true,
    status: aiResult.escalated ? ('escalated' as const) : ('replied' as const),
    provider: aiResult.provider,
    model: aiResult.model,
    escalated: aiResult.escalated,
  }
}
