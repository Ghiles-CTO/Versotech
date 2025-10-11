import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder_id: z.string().uuid().nullable().optional(),
  type: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'published', 'archived']).optional()
})

// PATCH /api/staff/documents/:id - Update document metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const authSupabase = await createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const { data: profile } = await authSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }
    
    const serviceSupabase = createServiceClient()

    // Parse and validate request body
    const body = await request.json()
    const validation = updateDocumentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Get existing document
    const { data: existingDoc, error: fetchError } = await serviceSupabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document
    const { data: document, error: updateError } = await serviceSupabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        folder:document_folders(id, name, path, folder_type),
        vehicle:vehicles!documents_vehicle_id_fkey(id, name, type),
        investor:investors!documents_owner_investor_id_fkey(id, legal_name),
        deal:deals!documents_deal_id_fkey(id, name, status),
        created_by_profile:profiles!documents_created_by_fkey(display_name, email)
      `)
      .single()

    if (updateError) {
      console.error('Document update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        document_name: document.name,
        updates,
        old_values: {
          name: existingDoc.name,
          status: existingDoc.status,
          folder_id: existingDoc.folder_id
        }
      }
    })

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Document PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/documents/:id - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const authSupabase = await createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const { data: profile } = await authSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }
    
    const serviceSupabase = createServiceClient()

    // Get document details
    const { data: document, error: fetchError } = await serviceSupabase
      .from('documents')
      .select('name, file_key, current_version')
      .eq('id', id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get all version file keys
    const { data: versions } = await serviceSupabase
      .from('document_versions')
      .select('file_key')
      .eq('document_id', id)

    // Delete file from storage (current version)
    const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
    await serviceSupabase.storage
      .from(storageBucket)
      .remove([document.file_key])

    // Delete all version files
    if (versions && versions.length > 0) {
      const versionFileKeys = versions.map(v => v.file_key)
      await serviceSupabase.storage
        .from(storageBucket)
        .remove(versionFileKeys)
    }

    // Delete document record (cascade will delete versions, approvals, schedules)
    const { error: deleteError } = await serviceSupabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Document deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.DELETE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        document_name: document.name,
        file_key: document.file_key,
        versions_deleted: versions?.length || 0
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Document DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

