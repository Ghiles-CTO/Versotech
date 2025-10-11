import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

// Delete a conversation
export async function DELETE(
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
    
    // Check if user is the creator or staff
    const serviceClient = createServiceClient()
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('id, created_by, subject')
      .eq('id', conversationId)
      .single()
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    const userRole = user.user_metadata?.role || user.role
    const isStaff = ['staff_admin', 'staff_ops', 'staff_rm'].includes(userRole)
    const isCreator = conversation.created_by === user.id
    
    if (!isStaff && !isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Delete the conversation (cascade will handle participants and messages)
    const { error: deleteError } = await serviceClient
      .from('conversations')
      .delete()
      .eq('id', conversationId)
    
    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
    }
    
    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.CONVERSATIONS,
      entity_id: conversationId,
      metadata: {
        subject: conversation.subject,
      }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Delete conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

