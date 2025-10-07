import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get messages (RLS policy ensures user can only see messages from their conversations)
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          email,
          role
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      messages: messages || [],
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

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const { body, file_key } = await request.json()

    if (!body && !file_key) {
      return NextResponse.json({ error: 'Message body or file is required' }, { status: 400 })
    }

    // Verify user has access to this conversation (via RLS)
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    }

    // Create message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body,
        file_key
      })
      .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          email,
          role
        )
      `)
      .single()

    if (msgError) {
      console.error('Error creating message:', msgError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Log message for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.MESSAGE_SENT,
      entity: AuditEntities.MESSAGES,
      entity_id: message.id,
      metadata: {
        conversation_id: conversationId,
        has_body: !!body,
        has_attachment: !!file_key,
        message_length: body?.length || 0
      }
    })

    // The message will be broadcast to other participants via Supabase Realtime
    // No need to manually notify - frontend will listen to realtime changes

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

