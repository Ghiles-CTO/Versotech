import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveAgentIdForTask } from '@/lib/agents'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const summary = typeof body?.summary === 'string' ? body.summary.trim() : ''
  if (!summary) {
    return NextResponse.json({ error: 'Summary is required' }, { status: 400 })
  }

  const persona = body?.persona ?? {}
  const personaType = typeof persona?.persona_type === 'string' ? persona.persona_type : null
  const personaEntityId = typeof persona?.entity_id === 'string' ? persona.entity_id : null
  const personaEntityName = typeof persona?.entity_name === 'string' ? persona.entity_name : null

  const agentId = await resolveAgentIdForTask(serviceSupabase, 'W001')

  await serviceSupabase.from('compliance_activity_log').insert({
    event_type: 'compliance_question',
    description: summary,
    agent_id: agentId,
    created_by: user.id,
    metadata: {
      channel: 'notifications',
      persona_type: personaType,
      persona_entity_id: personaEntityId,
      persona_entity_name: personaEntityName,
    },
  })

  const { data: ceoUsers } = await serviceSupabase.from('ceo_users').select('user_id')
  const notifierLabel = personaEntityName || personaType || 'A user'
  const ceoNotifications = (ceoUsers ?? []).map((ceo) => ({
    user_id: ceo.user_id,
    title: 'New compliance question',
    message: `${notifierLabel} submitted a compliance question: ${summary}`,
    link: '/versotech_admin/agents?tab=activity',
    created_by: user.id,
    agent_id: agentId,
    type: 'compliance_question',
    metadata: {
      persona_type: personaType,
      persona_entity_id: personaEntityId,
    },
  }))

  if (ceoNotifications.length) {
    await serviceSupabase.from('investor_notifications').insert(ceoNotifications)
  }

  await serviceSupabase.from('investor_notifications').insert({
    user_id: user.id,
    title: 'Compliance question sent',
    message: 'Your compliance question was sent to the compliance team. We will follow up shortly.',
    link: '/versotech_main/notifications',
    created_by: user.id,
    agent_id: agentId,
    type: 'compliance_question',
    metadata: {
      persona_type: personaType,
      persona_entity_id: personaEntityId,
    },
  })

  return NextResponse.json({ success: true })
}
