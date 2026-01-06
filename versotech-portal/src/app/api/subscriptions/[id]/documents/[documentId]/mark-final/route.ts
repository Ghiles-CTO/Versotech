import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

const STAFF_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']

/**
 * POST /api/subscriptions/[id]/documents/[documentId]/mark-final
 *
 * Toggles document status between draft and final.
 *
 * RULES:
 * - Only ONE document can be 'final' per subscription at a time
 * - When marking a document as final, all other documents become draft
 * - Can toggle back from final → draft
 * - Cannot change status of documents that are pending_signature or signed
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: subscriptionId, documentId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !STAFF_ROLES.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Fetch the document
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('id, subscription_id, status, name, type')
      .eq('id', documentId)
      .eq('subscription_id', subscriptionId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Cannot change status of documents in signature workflow
    if (document.status === 'pending_signature' || document.status === 'signed') {
      return NextResponse.json(
        { error: `Cannot change status: document is ${document.status === 'pending_signature' ? 'pending signatures' : 'already signed'}` },
        { status: 400 }
      )
    }

    // Determine the new status (toggle)
    // 'final' and 'published' are both treated as "ready" states that can toggle back to draft
    const isCurrentlyReady = document.status === 'final' || document.status === 'published'
    const newStatus = isCurrentlyReady ? 'draft' : 'final'
    const newType = isCurrentlyReady
      ? 'subscription_draft'
      : (document.type === 'subscription_draft' ? 'subscription_pack' : document.type)

    // If marking as final, first demote all other documents for this subscription to draft
    if (newStatus === 'final') {
      const { error: demoteError } = await serviceSupabase
        .from('documents')
        .update({
          status: 'draft',
          type: 'subscription_draft'
        })
        .eq('subscription_id', subscriptionId)
        .in('status', ['final', 'published']) // Demote both 'final' and 'published' docs
        .neq('id', documentId)

      if (demoteError) {
        console.error('Error demoting other documents:', demoteError)
        // Continue anyway - this is not critical
      }
    }

    // Update the target document
    const { data: updatedDoc, error: updateError } = await serviceSupabase
      .from('documents')
      .update({
        status: newStatus,
        type: newType
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating document status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document status' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: documentId,
      metadata: {
        type: isCurrentlyReady ? 'document_reverted_to_draft' : 'document_marked_final',
        subscription_id: subscriptionId,
        previous_status: document.status,
        new_status: newStatus,
        document_name: document.name
      }
    })

    return NextResponse.json({
      success: true,
      message: isCurrentlyReady ? 'Document reverted to draft' : 'Document marked as final',
      document: updatedDoc,
      action: isCurrentlyReady ? 'reverted' : 'finalized'
    })

  } catch (error) {
    console.error('Mark final error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
