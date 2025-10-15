import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  folder: z.string().optional(),
  file_name: z.string().optional(),
  visible_to_investors: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  document_notes: z.string().optional(),
  document_expires_at: z.string().datetime().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()
    const { data: document, error } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('*')
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await clientSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const updates = updateSchema.parse(body)

    const serviceSupabase = createServiceClient()
    const { data: document, error } = await serviceSupabase
      .from('deal_data_room_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        type: 'data_room_document_updated',
        document_id: documentId,
        updates
      }
    })

    return NextResponse.json({ success: true, document })

  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: dealId, documentId } = await params

  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await clientSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    // Get document details for cleanup
    const { data: document } = await serviceSupabase
      .from('deal_data_room_documents')
      .select('file_key')
      .eq('id', documentId)
      .single()

    // Delete from storage
    if (document?.file_key) {
      await serviceSupabase.storage
        .from('deal-documents')
        .remove([document.file_key])
    }

    // Delete from database
    const { error } = await serviceSupabase
      .from('deal_data_room_documents')
      .delete()
      .eq('id', documentId)
      .eq('deal_id', dealId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.DELETE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        type: 'data_room_document_deleted',
        document_id: documentId,
        file_key: document?.file_key
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

