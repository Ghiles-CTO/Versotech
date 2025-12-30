/**
 * Arranger Document API (Self-Service)
 * DELETE /api/arrangers/me/documents/[id] - Delete a document
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/arrangers/me/documents/[id]
 * Delete a document owned by the current arranger entity
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: documentId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity for current user
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Verify document exists and belongs to this arranger
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('id, file_key, name, arranger_entity_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Security check: ensure document belongs to this arranger
    if (document.arranger_entity_id !== arrangerId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete file from storage
    if (document.file_key) {
      const { error: storageError } = await serviceSupabase.storage
        .from(process.env.STORAGE_BUCKET_NAME || 'documents')
        .remove([document.file_key])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue with database delete even if storage fails
      }
    }

    // Delete document record
    const { error: deleteError } = await serviceSupabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Document delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'compliance',
      actor_id: user.id,
      action: 'arranger_document_deleted',
      entity_type: 'document',
      entity_id: documentId,
      action_details: {
        document_name: document.name,
        arranger_id: arrangerId
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/arrangers/me/documents/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
