import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

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

    const { id: conversationId } = await params

    const { error: updateError } = await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_user_id: user.id
    })

    if (updateError) {
      console.error('Error marking conversation as read:', updateError)
      return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversation read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

