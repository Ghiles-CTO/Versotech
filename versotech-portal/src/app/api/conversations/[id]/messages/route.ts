import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeMessage } from '@/lib/messaging'
import {
  isAgentChatConversation,
  markAgentChatFirstContact,
} from '@/lib/compliance/agent-chat'

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
      .select('id, metadata, created_by')
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
    const conversationMetadata = ((conversation as { metadata?: unknown })?.metadata || {}) as Record<string, any>
    const bodyText = typeof body === 'string' ? body.trim() : ''
    const isAiAuthoredInput = (messageMetadata as Record<string, any> | undefined)?.ai_generated === true
    const isEligibleAgentThread = isAgentChatConversation(conversationMetadata)
    // Allow AI replies for the thread owner even if they also have staff roles (e.g. CEO
    // with investor persona). Only block AI when a different staff member responds manually.
    const isThreadOwner = conversation.created_by === userId
    const isStaffInterveningManually = isStaff && !isThreadOwner
    const agentReplyEligible = Boolean(
      !isStaffInterveningManually && isEligibleAgentThread && bodyText && !isAiAuthoredInput
    )

    if (!isStaffInterveningManually && isAgentChatConversation(conversationMetadata) && bodyText && !isAiAuthoredInput) {
      await markAgentChatFirstContact(serviceSupabase, {
        conversationId,
        conversationMetadata,
        senderUserId: userId,
        messageId: message.id,
        messageCreatedAt: message.created_at,
      })
    }

    return NextResponse.json({
      success: true,
      message: normalizedMessage,
      agentReplyEligible,
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

