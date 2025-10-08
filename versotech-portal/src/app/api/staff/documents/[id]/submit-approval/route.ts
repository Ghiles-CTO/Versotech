import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'

// POST /api/staff/documents/:id/submit-approval - Submit document for approval
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
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Get document
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('name, status')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is in a valid state for approval
    if (document.status === 'pending_approval') {
      return NextResponse.json(
        { error: 'Document is already pending approval' },
        { status: 400 }
      )
    }

    if (document.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot submit published document for approval. Create a new version instead.' },
        { status: 400 }
      )
    }

    // Create approval record
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('document_approvals')
      .insert({
        document_id: id,
        status: 'pending',
        requested_by: createdBy
      })
      .select(`
        *,
        requested_by_profile:profiles!document_approvals_requested_by_fkey(display_name, email)
      `)
      .single()

    if (approvalError) {
      console.error('Approval creation error:', approvalError)
      return NextResponse.json(
        { error: 'Failed to submit for approval' },
        { status: 500 }
      )
    }

    // Update document status
    const { error: updateError } = await serviceSupabase
      .from('documents')
      .update({ status: 'pending_approval' })
      .eq('id', id)

    if (updateError) {
      console.error('Document status update error:', updateError)
      // Rollback approval creation
      await serviceSupabase
        .from('document_approvals')
        .delete()
        .eq('id', approval.id)
      
      return NextResponse.json(
        { error: 'Failed to update document status' },
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
        action_type: 'submit_for_approval',
        document_name: document.name,
        approval_id: approval.id
      }
    })

    return NextResponse.json({ approval }, { status: 201 })

  } catch (error) {
    console.error('Submit approval POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

