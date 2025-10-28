import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schema
const approveSchema = z.object({
  review_notes: z.string().optional(),
  action: z.enum(['approve', 'reject', 'request_changes'])
})

// POST /api/staff/documents/:id/approve - Approve/Reject document
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
    const reviewedBy = uuidRegex.test(userId) ? userId : null

    // Parse and validate request body
    const body = await request.json()
    const validation = approveSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { review_notes, action } = validation.data

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

    // Check if document is in pending approval status
    if (document.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Document is not pending approval' },
        { status: 400 }
      )
    }

    // Get pending approval record
    const { data: pendingApproval } = await serviceSupabase
      .from('document_approvals')
      .select('id, requested_by')
      .eq('document_id', id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (!pendingApproval) {
      return NextResponse.json(
        { error: 'No pending approval found' },
        { status: 404 }
      )
    }

    // Determine new status
    const approvalStatus = action === 'approve' ? 'approved' : 
                          action === 'reject' ? 'rejected' : 
                          'changes_requested'
    
    const documentStatus = action === 'approve' ? 'approved' : 'draft'

    // Update approval record
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('document_approvals')
      .update({
        status: approvalStatus,
        reviewed_by: reviewedBy,
        review_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', pendingApproval.id)
      .select(`
        *,
        requested_by_profile:profiles!document_approvals_requested_by_fkey(display_name, email),
        reviewed_by_profile:profiles!document_approvals_reviewed_by_fkey(display_name, email)
      `)
      .single()

    if (approvalError) {
      console.error('Approval update error:', approvalError)
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      )
    }

    // Update document status
    const { error: updateError } = await serviceSupabase
      .from('documents')
      .update({ status: documentStatus })
      .eq('id', id)

    if (updateError) {
      console.error('Document status update error:', updateError)
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        action_type: 'approval_review',
        approval_action: action,
        document_name: document.name,
        review_notes,
        approval_id: approval.id
      }
    })

    return NextResponse.json({ approval })

  } catch (error) {
    console.error('Approve POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

