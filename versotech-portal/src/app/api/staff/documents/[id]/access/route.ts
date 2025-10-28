import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schema
const grantAccessSchema = z.object({
  investor_id: z.string().uuid('Invalid investor ID')
})

// GET /api/staff/documents/:id/access - List investors with access to document
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
      .from('document_access_grants')
      .select(`
        *,
        investor:investors(id, legal_name, type, status),
        granted_by_profile:profiles!document_access_grants_granted_by_fkey(display_name, email)
      `)
      .eq('document_id', id)
      .order('granted_at', { ascending: false })

    if (grantsError) {
      console.error('[API] Document access grants query error:', grantsError)
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
    console.error('[API] Document access GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/staff/documents/:id/access - Grant investor access to document
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
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { investor_id } = validation.data

    // Check if document exists
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('name')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
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

    // Grant access
    const { data: grant, error: grantError } = await serviceSupabase
      .from('document_access_grants')
      .insert({
        document_id: id,
        investor_id,
        granted_by: grantedBy
      })
      .select(`
        *,
        investor:investors(id, legal_name, type, status),
        granted_by_profile:profiles!document_access_grants_granted_by_fkey(display_name, email)
      `)
      .single()

    if (grantError) {
      if (grantError.code === '23505') {
        return NextResponse.json(
          { error: 'Investor already has access to this document' },
          { status: 409 }
        )
      }
      console.error('[API] Grant document access error:', grantError)
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
        action_type: 'grant_document_access',
        document_name: document.name,
        investor_id,
        investor_name: investor.legal_name
      }
    })

    return NextResponse.json({ grant }, { status: 201 })

  } catch (error) {
    console.error('[API] Document access POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/documents/:id/access - Revoke investor access
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
      .from('document_access_grants')
      .delete()
      .eq('document_id', id)
      .eq('investor_id', investorId)

    if (deleteError) {
      console.error('[API] Revoke document access error:', deleteError)
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
        action_type: 'revoke_document_access',
        document_id: id,
        investor_id: investorId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API] Document access DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

