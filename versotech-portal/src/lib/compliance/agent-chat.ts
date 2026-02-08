const DEFAULT_AGENT_TASK_CODE = 'W001'

type ServiceClient = any

export type ComplianceAgentIdentity = {
  id: string
  name: string
  role: string | null
  avatar_url: string | null
  system_prompt: string | null
  is_active: boolean
}

export type AgentChatMetadata = {
  default_thread: boolean
  task_code: string
  agent_id: string | null
  agent_name: string | null
  agent_avatar_url: string | null
  first_contact_at?: string | null
  first_contact_message_id?: string | null
  first_contact_by_user_id?: string | null
  welcome_sent_at?: string | null
}

function asRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, any>
}

function asIsoDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function readAgentChatMetadata(metadata: unknown): AgentChatMetadata | null {
  const root = asRecord(metadata)
  const raw = asRecord(root.agent_chat)
  if (!raw.default_thread && !raw.task_code && !raw.agent_id) return null

  return {
    default_thread: raw.default_thread === true,
    task_code: typeof raw.task_code === 'string' && raw.task_code.trim() ? raw.task_code : DEFAULT_AGENT_TASK_CODE,
    agent_id: typeof raw.agent_id === 'string' ? raw.agent_id : null,
    agent_name: typeof raw.agent_name === 'string' ? raw.agent_name : null,
    agent_avatar_url: typeof raw.agent_avatar_url === 'string' ? raw.agent_avatar_url : null,
    first_contact_at: asIsoDate(raw.first_contact_at),
    first_contact_message_id: typeof raw.first_contact_message_id === 'string' ? raw.first_contact_message_id : null,
    first_contact_by_user_id: typeof raw.first_contact_by_user_id === 'string' ? raw.first_contact_by_user_id : null,
    welcome_sent_at: asIsoDate(raw.welcome_sent_at),
  }
}

export function isAgentChatConversation(metadata: unknown): boolean {
  const parsed = readAgentChatMetadata(metadata)
  if (!parsed) return false
  return parsed.default_thread === true || parsed.task_code === DEFAULT_AGENT_TASK_CODE
}

export function buildAgentChatMetadata(
  previous: unknown,
  agent: ComplianceAgentIdentity | null
): AgentChatMetadata {
  const current = readAgentChatMetadata(previous)
  return {
    default_thread: true,
    task_code: DEFAULT_AGENT_TASK_CODE,
    agent_id: agent?.id ?? current?.agent_id ?? null,
    agent_name: agent?.name ?? current?.agent_name ?? "Wayne O'Connor",
    agent_avatar_url: agent?.avatar_url ?? current?.agent_avatar_url ?? null,
    first_contact_at: current?.first_contact_at ?? null,
    first_contact_message_id: current?.first_contact_message_id ?? null,
    first_contact_by_user_id: current?.first_contact_by_user_id ?? null,
    welcome_sent_at: current?.welcome_sent_at ?? null,
  }
}

export async function resolveComplianceChatAgent(
  supabase: ServiceClient,
  options?: { requireActive?: boolean }
): Promise<ComplianceAgentIdentity | null> {
  const requireActive = options?.requireActive !== false

  const { data: assignment } = await supabase
    .from('agent_task_assignments')
    .select('agent_id')
    .eq('task_code', DEFAULT_AGENT_TASK_CODE)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  let candidate: ComplianceAgentIdentity | null = null

  if (assignment?.agent_id) {
    const { data } = await supabase
      .from('ai_agents')
      .select('id, name, role, avatar_url, system_prompt, is_active')
      .eq('id', assignment.agent_id)
      .maybeSingle()
    candidate = data ?? null
  }

  if (!candidate) {
    const { data } = await supabase
      .from('ai_agents')
      .select('id, name, role, avatar_url, system_prompt, is_active')
      .ilike('name', 'Wayne%')
      .limit(1)
      .maybeSingle()
    candidate = data ?? null
  }

  if (!candidate) return null
  if (requireActive && !candidate.is_active) return null
  return candidate
}

function defaultWelcomeMessage(agentName: string) {
  return `Hi, I’m ${agentName}, your compliance contact at VERSOTECH. You can ask me compliance and onboarding questions here anytime, and I’ll guide next steps or escalate to a human compliance officer when needed.`
}

export async function ensureDefaultAgentConversationForInvestor(
  supabase: ServiceClient,
  userId: string
) {
  const agent = await resolveComplianceChatAgent(supabase, { requireActive: false })
  if (!agent) return null

  const now = new Date().toISOString()
  let conversationId: string | null = null
  let conversationMetadata: Record<string, any> = {}

  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id, metadata, subject, conversation_participants!inner(user_id)')
    .eq('conversation_participants.user_id', userId)
    .contains('metadata', { agent_chat: { task_code: DEFAULT_AGENT_TASK_CODE } })
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (existingConversation?.id) {
    conversationId = existingConversation.id
    conversationMetadata = asRecord(existingConversation.metadata)
  } else {
    const newMetadata = {
      compliance: {
        flagged: true,
        status: 'open',
        urgency: 'medium',
        reason: 'Default compliance support channel',
        flagged_at: now,
        flagged_by: userId,
        assigned_agent_id: agent.id,
        auto_default: true,
        updated_at: now,
      },
      agent_chat: {
        default_thread: true,
        task_code: DEFAULT_AGENT_TASK_CODE,
        agent_id: agent.id,
        agent_name: agent.name,
        agent_avatar_url: agent.avatar_url,
        first_contact_at: null,
        first_contact_message_id: null,
        first_contact_by_user_id: null,
        welcome_sent_at: null,
      },
    }

    const { data: createdConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        subject: agent.name,
        type: 'dm',
        visibility: 'investor',
        owner_team: 'compliance',
        created_by: userId,
        metadata: newMetadata,
      })
      .select('id, metadata')
      .single()

    if (conversationError || !createdConversation) {
      console.error('[agent-chat] Failed to create default conversation:', conversationError)
      return null
    }

    conversationId = createdConversation.id
    conversationMetadata = asRecord(createdConversation.metadata)

    await supabase.from('conversation_participants').insert({
      conversation_id: conversationId,
      user_id: userId,
      participant_role: 'member',
    })
  }

  if (!conversationId) return null

  const nextAgentMetadata = buildAgentChatMetadata(conversationMetadata, agent)
  const nextCompliance = {
    ...asRecord(conversationMetadata.compliance),
    flagged: true,
    status: asRecord(conversationMetadata.compliance).status || 'open',
    assigned_agent_id: agent.id,
    updated_at: now,
  }

  const { data: existingMessages } = await supabase
    .from('messages')
    .select('id, metadata')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  const hasBootstrapMessage = (existingMessages || []).some((item: any) => {
    const meta = asRecord(item?.metadata)
    return meta.source === 'compliance_assistant' && meta.bootstrap === true
  })

  if (!hasBootstrapMessage) {
    const { error: welcomeError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: null,
      message_type: 'system',
      body: defaultWelcomeMessage(agent.name || "Wayne O'Connor"),
      metadata: {
        ai_generated: true,
        source: 'compliance_assistant',
        bootstrap: true,
        assistant_agent_id: agent.id,
        assistant_name: agent.name,
        assistant_avatar_url: agent.avatar_url,
      },
    })
    if (welcomeError) {
      console.error('[agent-chat] Failed to insert bootstrap message:', welcomeError)
    } else {
      nextAgentMetadata.welcome_sent_at = now
    }
  } else if (!nextAgentMetadata.welcome_sent_at) {
    nextAgentMetadata.welcome_sent_at = now
  }

  const nextMetadata = {
    ...conversationMetadata,
    compliance: nextCompliance,
    agent_chat: nextAgentMetadata,
  }

  await supabase
    .from('conversations')
    .update({
      subject: agent.name,
      metadata: nextMetadata,
    })
    .eq('id', conversationId)

  return {
    conversationId,
    agent,
    metadata: nextMetadata,
  }
}

export async function markAgentChatFirstContact(
  supabase: ServiceClient,
  params: {
    conversationId: string
    conversationMetadata: unknown
    senderUserId: string
    messageId: string
    messageCreatedAt: string
  }
) {
  const root = asRecord(params.conversationMetadata)
  const current = buildAgentChatMetadata(root.agent_chat, null)

  if (!current.default_thread) return false
  if (current.first_contact_at) return false

  const nextAgentChat: AgentChatMetadata = {
    ...current,
    first_contact_at: asIsoDate(params.messageCreatedAt) || new Date().toISOString(),
    first_contact_message_id: params.messageId,
    first_contact_by_user_id: params.senderUserId,
  }

  const { error } = await supabase
    .from('conversations')
    .update({
      metadata: {
        ...root,
        agent_chat: nextAgentChat,
      },
    })
    .eq('id', params.conversationId)

  if (error) {
    console.error('[agent-chat] Failed to mark first contact:', error)
    return false
  }

  return true
}
