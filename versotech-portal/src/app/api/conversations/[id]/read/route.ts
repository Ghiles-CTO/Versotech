import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error marking conversation as read:', updateError)
      return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true, last_read_at: now })
  } catch (error) {
    console.error('Conversation read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

