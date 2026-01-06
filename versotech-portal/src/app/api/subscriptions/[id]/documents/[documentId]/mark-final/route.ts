import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

const STAFF_ROLES = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo']

/**
 * POST /api/subscriptions/[id]/documents/[documentId]/mark-final
 *
 * Marks a draft document as final, making it ready for signature.
 * This allows staff to select which draft version they want to use
 * without having to re-upload the document.
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

    // Check if document is a draft
    if (document.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot mark as final: document is already ${document.status}` },
        { status: 400 }
      )
    }

    // Update document status to final
    const { data: updatedDoc, error: updateError } = await serviceSupabase
      .from('documents')
      .update({
        status: 'final',
        type: document.type === 'subscription_draft' ? 'subscription_pack' : document.type
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
        type: 'document_marked_final',
        subscription_id: subscriptionId,
        previous_status: 'draft',
        new_status: 'final',
        document_name: document.name
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Document marked as final',
      document: updatedDoc
    })

  } catch (error) {
    console.error('Mark final error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
