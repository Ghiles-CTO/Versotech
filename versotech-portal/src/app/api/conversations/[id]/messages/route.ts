import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeMessage } from '@/lib/messaging'

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const { id: conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

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
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const { id: conversationId } = await params
    const { body, file_key, reply_to_message_id, metadata } = await request.json()

    if (!body && !file_key) {
      return NextResponse.json({ error: 'Message body or file is required' }, { status: 400 })
    }

    // Verify conversation exists (access control handled by RLS)
    const serviceClient = createServiceClient()
    const { data: conversation, error: convError } = await serviceClient
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message (RLS will enforce access control)
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
        file_key,
        reply_to_message_id,
        metadata: metadata ?? {}
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

    return NextResponse.json({
      success: true,
      message: normalizedMessage
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

