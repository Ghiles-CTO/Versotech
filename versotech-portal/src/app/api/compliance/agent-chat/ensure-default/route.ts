import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ensureDefaultAgentConversationForInvestor } from '@/lib/compliance/agent-chat'

// In-memory dedup: coalesce concurrent requests for the same user into one DB call.
const inFlight = new Map<string, Promise<any>>()

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

  // If another request for the same user is already in-flight, wait for it
  // instead of creating a duplicate thread.
  const existing = inFlight.get(user.id)
  if (existing) {
    const ensured = await existing
    return NextResponse.json({
      ensured: Boolean(ensured?.conversationId),
      conversation_id: ensured?.conversationId ?? null,
    })
  }

  const promise = ensureDefaultAgentConversationForInvestor(serviceSupabase, user.id)
  inFlight.set(user.id, promise)

  try {
    const ensured = await promise
    return NextResponse.json({
      ensured: Boolean(ensured?.conversationId),
      conversation_id: ensured?.conversationId ?? null,
    })
  } finally {
    inFlight.delete(user.id)
  }
}
