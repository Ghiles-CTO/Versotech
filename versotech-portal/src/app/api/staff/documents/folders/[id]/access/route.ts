import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schema
const grantAccessSchema = z.object({
  investor_id: z.string().uuid('Invalid investor ID')
})

// GET /api/staff/documents/folders/:id/access - List investors with access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase } = auth

    // Get access grants
    const { data: grants, error: grantsError } = await serviceSupabase
      .from('folder_access_grants')
      .select(`
        *,
        investor:investors(id, legal_name, type, status),
        granted_by_profile:profiles!folder_access_grants_granted_by_fkey(display_name, email)
      `)
      .eq('folder_id', id)
      .order('granted_at', { ascending: false })

    if (grantsError) {
      console.error('[API] Folder access grants query error:', grantsError)
      return NextResponse.json(
        { error: 'Failed to fetch access grants', details: grantsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      grants: grants || [],
      total: grants?.length || 0
    })

  } catch (error) {
    console.error('[API] Folder access GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/staff/documents/folders/:id/access - Grant investor access to folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const grantedBy = uuidRegex.test(userId) ? userId : null

    // Parse request body
    const body = await request.json()
    const validation = grantAccessSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { investor_id } = validation.data

    // Check if folder exists
    const { data: folder, error: folderError } = await serviceSupabase
      .from('document_folders')
      .select('name, path')
      .eq('id', id)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Check if investor exists
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('legal_name')
      .eq('id', investor_id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      )
    }

    // Grant access (insert or ignore if exists)
    const { data: grant, error: grantError } = await serviceSupabase
      .from('folder_access_grants')
      .insert({
        folder_id: id,
        investor_id,
        granted_by: grantedBy
      })
      .select(`
        *,
        investor:investors(id, legal_name, type, status),
        granted_by_profile:profiles!folder_access_grants_granted_by_fkey(display_name, email)
      `)
      .single()

    if (grantError) {
      // Check if it's a unique constraint violation (already exists)
      if (grantError.code === '23505') {
        return NextResponse.json(
          { error: 'Investor already has access to this folder' },
          { status: 409 }
        )
      }
      console.error('[API] Grant access error:', grantError)
      return NextResponse.json(
        { error: 'Failed to grant access', details: grantError.message },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.CREATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        action_type: 'grant_folder_access',
        folder_name: folder.name,
        folder_path: folder.path,
        investor_id,
        investor_name: investor.legal_name
      }
    })

    return NextResponse.json({ grant }, { status: 201 })

  } catch (error) {
    console.error('[API] Folder access POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/documents/folders/:id/access/:investorId - Revoke investor access
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const investorId = searchParams.get('investor_id')

    if (!investorId) {
      return NextResponse.json(
        { error: 'investor_id is required' },
        { status: 400 }
      )
    }
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Delete grant
    const { error: deleteError } = await serviceSupabase
      .from('folder_access_grants')
      .delete()
      .eq('folder_id', id)
      .eq('investor_id', investorId)

    if (deleteError) {
      console.error('[API] Revoke access error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to revoke access', details: deleteError.message },
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
        action_type: 'revoke_folder_access',
        folder_id: id,
        investor_id: investorId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API] Folder access DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

