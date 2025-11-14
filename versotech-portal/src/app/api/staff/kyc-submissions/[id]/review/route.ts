import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface ReviewBody {
  action: 'approve' | 'reject'
  rejection_reason?: string
  notes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params

  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile and verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: ReviewBody = await request.json()
    const { action, rejection_reason, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      )
    }

    // Use service client for privileged operations
    const serviceSupabase = createServiceClient()

    // Get submission details
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .select(`
        *,
        investor:investors(id, name, email, kyc_status)
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check if submission is in a reviewable state
    if (!['pending', 'under_review'].includes(submission.status)) {
      return NextResponse.json(
        { error: `Cannot review submission with status: ${submission.status}` },
        { status: 400 }
      )
    }

    // Update submission
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    }

    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason
    }

    if (notes) {
      updateData.metadata = {
        ...(submission.metadata || {}),
        review_notes: notes
      }
    }

    const { data: updatedSubmission, error: updateError } = await serviceSupabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    // If approved, check if all required documents for this investor are now approved
    if (action === 'approve') {
      await checkAndUpdateInvestorKYCStatus(
        serviceSupabase,
        submission.investor.id
      )
    }

    // Auto-complete related tasks if approved
    if (action === 'approve') {
      await autoCompleteRelatedTasks(
        serviceSupabase,
        submission.investor.id,
        submission.document_type,
        user.id
      )
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: action === 'approve' ? 'kyc_document_approved' : 'kyc_document_rejected',
      entity_type: 'kyc_submission',
      entity_id: submissionId,
      details: {
        document_type: submission.document_type,
        investor_id: submission.investor.id,
        investor_name: submission.investor.name,
        rejection_reason: rejection_reason || null,
        notes: notes || null
      }
    })

    // TODO: Send notification to investor
    // This would integrate with messaging system or email notifications

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: action === 'approve'
        ? 'Document approved successfully'
        : 'Document rejected successfully'
    })

  } catch (error) {
    console.error('KYC review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Check if all required KYC documents are approved and update investor status
 */
async function checkAndUpdateInvestorKYCStatus(
  supabase: any,
  investorId: string
) {
  try {
    // Get investor type to determine required documents
    const { data: investor } = await supabase
      .from('investors')
      .select('type, kyc_status')
      .eq('id', investorId)
      .single()

    if (!investor) return

    // Define required document types
    const baseRequiredDocs = [
      'government_id',
      'proof_of_address',
      'accreditation_letter'
    ]

    const entityRequiredDocs = [
      'entity_formation_docs',
      'beneficial_ownership'
    ]

    const requiredDocs = investor.type === 'corporate'
      ? [...baseRequiredDocs, ...entityRequiredDocs]
      : baseRequiredDocs

    // Get all submissions for this investor
    const { data: submissions } = await supabase
      .from('kyc_submissions')
      .select('document_type, status')
      .eq('investor_id', investorId)

    if (!submissions) return

    // Check if all required documents are approved
    const allApproved = requiredDocs.every(docType => {
      return submissions.some(
        (sub: any) => sub.document_type === docType && sub.status === 'approved'
      )
    })

    // Update investor KYC status if all approved
    if (allApproved && investor.kyc_status !== 'approved') {
      await supabase
        .from('investors')
        .update({
          kyc_status: 'approved',
          kyc_approved_at: new Date().toISOString()
        })
        .eq('id', investorId)
    }

  } catch (error) {
    console.error('Error checking investor KYC status:', error)
    // Don't throw - this is a background operation
  }
}

/**
 * Auto-complete tasks related to this KYC document
 */
async function autoCompleteRelatedTasks(
  supabase: any,
  investorId: string,
  documentType: string,
  reviewerId: string
) {
  try {
    // Find tasks related to this document type for this investor
    const taskTitlePatterns = {
      government_id: 'Upload Government ID',
      proof_of_address: 'Upload Proof of Address',
      accreditation_letter: 'Upload Accreditation Letter',
      bank_statement: 'Upload Bank Statement',
      entity_formation_docs: 'Upload Entity Formation Documents',
      beneficial_ownership: 'Upload Beneficial Ownership Information'
    }

    const taskTitle = taskTitlePatterns[documentType as keyof typeof taskTitlePatterns]

    if (!taskTitle) return

    // Update tasks with matching title for this investor
    await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: reviewerId
      })
      .eq('investor_id', investorId)
      .ilike('title', `%${taskTitle}%`)
      .eq('status', 'pending')

  } catch (error) {
    console.error('Error auto-completing tasks:', error)
    // Don't throw - this is a background operation
  }
}
