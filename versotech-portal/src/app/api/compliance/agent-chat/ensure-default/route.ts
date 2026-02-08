import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ensureDefaultAgentConversationForInvestor } from '@/lib/compliance/agent-chat'

export async function POST() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id,
  })

  const isInvestor = (personas ?? []).some((p: any) => p?.persona_type === 'investor')
  if (!isInvestor) {
    return NextResponse.json({ ensured: false })
  }

  const ensured = await ensureDefaultAgentConversationForInvestor(serviceSupabase, user.id)

  return NextResponse.json({
    ensured: Boolean(ensured?.conversationId),
    conversation_id: ensured?.conversationId ?? null,
  })
}

