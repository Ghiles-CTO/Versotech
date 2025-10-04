import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Delete (soft delete) a message
 * Users can only delete their own messages
 */
export async function DELETE(
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

    const { id: messageId } = await params

    // Get message to verify ownership
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id, conversation_id, body')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is the sender
    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 })
    }

    // Soft delete the message (set deleted_at timestamp)
    const { error: deleteError } = await supabase
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
        body: '[Message deleted]' // Replace body for compliance/audit
      })
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    // Log message deletion for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.MESSAGES,
      entity_id: messageId,
      metadata: {
        conversation_id: message.conversation_id,
        original_length: message.body?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Edit a message
 * Users can only edit their own messages
 */
export async function PATCH(
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

    const { id: messageId } = await params
    const { body: newBody } = await request.json()

    if (!newBody || !newBody.trim()) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 })
    }

    // Get message to verify ownership
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id, conversation_id, deleted_at')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if message is deleted
    if (message.deleted_at) {
      return NextResponse.json({ error: 'Cannot edit deleted message' }, { status: 400 })
    }

    // Check if user is the sender
    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        body: newBody,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
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

    if (updateError) {
      console.error('Error updating message:', updateError)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    // Log message edit for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'UPDATE' as any,
      entity: AuditEntities.MESSAGES,
      entity_id: messageId,
      metadata: {
        conversation_id: message.conversation_id,
        new_length: newBody.length
      }
    })

    return NextResponse.json({
      success: true,
      message: updatedMessage
    })

  } catch (error) {
    console.error('Edit message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
