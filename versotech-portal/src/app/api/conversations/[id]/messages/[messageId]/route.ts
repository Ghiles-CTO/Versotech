import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

// Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: conversationId, messageId } = await params
    
    // Check if user is the sender or staff
    const serviceClient = createServiceClient()
    const { data: message } = await serviceClient
      .from('messages')
      .select('id, sender_id, body, conversation_id')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single()
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    // Query profiles table for authoritative role (don't use stale user_metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role && ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)
    const isSender = message.sender_id === user.id
    
    if (!isStaff && !isSender) {
      return NextResponse.json({ error: 'Forbidden - you can only delete your own messages' }, { status: 403 })
    }
    
    // Soft delete by setting deleted_at timestamp
    const { error: deleteError } = await serviceClient
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
    
    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }
    
    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.MESSAGES,
      entity_id: messageId,
      metadata: {
        conversation_id: conversationId,
        body_preview: message.body?.substring(0, 50),
      }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

