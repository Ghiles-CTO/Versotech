import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createInvestorNotification, getInvestorPrimaryUserId } from '@/lib/notifications'
import {
  handleKYCApproval,
  updateMemberKYCStatus,
  getEntityTypeFromSubmission,
} from '@/lib/kyc/check-entity-kyc-status'

interface ReviewBody {
  action: 'approve' | 'reject' | 'request_info'
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

    if (!profile || !(profile.role.startsWith('staff_') || profile.role === 'ceo')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: ReviewBody = await request.json()
    const { action, rejection_reason, notes } = body

    if (!action || !['approve', 'reject', 'request_info'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", or "request_info"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      )
    }

    if (action === 'request_info' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Please specify what additional information is needed' },
        { status: 400 }
      )
    }

    // Use service client for privileged operations
    const serviceSupabase = createServiceClient()

    // Get submission details with all possible entity relations
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .select(`
        *,
        investor:investors(id, legal_name, display_name, email, kyc_status),
        partner:partners(id, name, legal_name, kyc_status),
        introducer:introducers(id, display_name, legal_name, kyc_status),
        lawyer:lawyers(id, firm_name, display_name, kyc_status),
        commercial_partner:commercial_partners(id, name, legal_name, kyc_status),
        arranger_entity:arranger_entities(id, legal_name, kyc_status),
        investor_member:investor_members(id, full_name, kyc_status),
        partner_member:partner_members(id, full_name, kyc_status),
        introducer_member:introducer_members(id, full_name, kyc_status),
        lawyer_member:lawyer_members(id, full_name, kyc_status),
        commercial_partner_member:commercial_partner_members(id, full_name, kyc_status),
        arranger_member:arranger_members(id, full_name, kyc_status)
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
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    }

    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason
    }

    // For request_info, store the request in metadata but keep status as pending
    if (action === 'request_info') {
      updateData.metadata = {
        ...(submission.metadata || {}),
        info_requested: true,
        info_request_reason: rejection_reason,
        info_requested_at: new Date().toISOString(),
        info_requested_by: user.id,
        review_notes: notes || undefined
      }
    } else if (notes) {
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

    // If approved, handle KYC approval for any entity type
    if (action === 'approve') {
      // Use generic handler for all entity types
      await handleKYCApproval(serviceSupabase, submission)

      // Also check investor-specific status for backwards compatibility
      if (submission.investor_id) {
        await checkAndUpdateInvestorKYCStatus(
          serviceSupabase,
          submission.investor_id
        )
      }
    }

    // If rejected and this is a personal_info submission, update member status
    if (action === 'reject' && submission.document_type === 'personal_info') {
      const { entityType, memberId } = getEntityTypeFromSubmission(submission)
      if (entityType && memberId) {
        await updateMemberKYCStatus(serviceSupabase, entityType, memberId, 'rejected', rejection_reason)
      }
    }

    // Auto-complete related tasks if approved (investor-specific)
    if (action === 'approve' && submission.investor_id) {
      await autoCompleteRelatedTasks(
        serviceSupabase,
        submission.investor_id,
        submission.document_type,
        user.id
      )
    }

    // Determine entity info for audit log
    const { entityType, entityId } = getEntityTypeFromSubmission(submission)
    const entity = submission.investor || submission.partner || submission.introducer ||
                   submission.lawyer || submission.commercial_partner || submission.arranger_entity
    const entityName = entity?.legal_name || entity?.display_name || entity?.name || entity?.firm_name || 'Unknown'

    // Create audit log
    const auditActions: Record<string, string> = {
      approve: 'kyc_document_approved',
      reject: 'kyc_document_rejected',
      request_info: 'kyc_info_requested'
    }

    await serviceSupabase.from('audit_logs').insert({
      event_type: 'compliance',
      actor_id: user.id,
      action: auditActions[action],
      entity_type: 'kyc_submission',
      entity_id: submissionId,
      action_details: {
        document_type: submission.document_type,
        persona_type: entityType,
        related_entity_id: entityId,
        entity_name: entityName,
        investor_id: submission.investor_id || null,
        partner_id: submission.partner_id || null,
        introducer_id: submission.introducer_id || null,
        lawyer_id: submission.lawyer_id || null,
        commercial_partner_id: submission.commercial_partner_id || null,
        arranger_entity_id: submission.arranger_entity_id || null,
        rejection_reason: rejection_reason || null,
        info_request_reason: action === 'request_info' ? rejection_reason : null,
        notes: notes || null
      },
      timestamp: new Date().toISOString()
    })

    // Send notification to investor (only for investor entity types)
    // TODO: Add notification support for other entity types
    if (submission.investor_id && submission.investor) {
      try {
        const investorUserId = await getInvestorPrimaryUserId(submission.investor.id)
        if (investorUserId) {
          const investorName = submission.investor.display_name || submission.investor.legal_name || 'Investor'
          const docTypeLabel = submission.document_type.replace(/_/g, ' ')

          if (action === 'approve') {
            await createInvestorNotification({
              userId: investorUserId,
              investorId: submission.investor.id,
              title: submission.document_type === 'personal_info' ? 'Personal KYC Approved' :
                     submission.document_type === 'entity_info' ? 'Entity KYC Approved' :
                     'KYC Documents Approved',
              message: submission.document_type === 'personal_info'
                ? 'Your personal KYC information has been reviewed and approved.'
                : submission.document_type === 'entity_info'
                ? 'Your entity information has been reviewed and approved.'
                : 'Your KYC documents have been reviewed and approved. Thank you for completing your verification.',
              link: '/versotech_main/profile',
              type: 'kyc_status',
              extraMetadata: {
                submission_id: submissionId,
                document_type: submission.document_type
              }
            })
          } else if (action === 'request_info') {
            await createInvestorNotification({
              userId: investorUserId,
              investorId: submission.investor.id,
              title: 'Additional Information Requested',
              message: `Our compliance team has requested additional information for your ${docTypeLabel} submission. Please review and provide the requested details.`,
              link: '/versotech_main/profile',
              type: 'kyc_status',
              extraMetadata: {
                submission_id: submissionId,
                document_type: submission.document_type,
                info_request_reason: rejection_reason
              }
            })
          } else {
            await createInvestorNotification({
              userId: investorUserId,
              investorId: submission.investor.id,
              title: 'KYC Submission Requires Attention',
              message: `Your ${docTypeLabel} submission requires attention. Please review and resubmit.`,
              link: '/versotech_main/profile',
              type: 'kyc_status',
              extraMetadata: {
                submission_id: submissionId,
                document_type: submission.document_type,
                rejection_reason: rejection_reason
              }
            })
          }
        }
      } catch (notificationError) {
        console.error('[kyc-review] Failed to send notification:', notificationError)
      }
    }

    const successMessages: Record<string, string> = {
      approve: 'Document approved successfully',
      reject: 'Document rejected successfully',
      request_info: 'Information request sent to investor'
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: successMessages[action]
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
 *
 * For individual investors:
 * - Requires: passport_id (or passport), utility_bill
 *
 * For entity investors:
 * - Entity-level docs: incorporation_certificate, memo_articles,
 *   register_members, register_directors, bank_confirmation
 * - Per-member docs: Each active member needs passport_id AND utility_bill
 *
 * NOTE: Questionnaire is COMPLIANCE, not KYC - handled separately
 * NOTE: NDA is handled in deal flow, not KYC requirements
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

    const isEntityType = ['entity', 'institution', 'corporate'].includes(investor.type)

    // Get all investor KYC submissions (exclude counterparty entity submissions)
    const { data: submissions } = await supabase
      .from('kyc_submissions')
      .select('document_type, status, investor_member_id')
      .eq('investor_id', investorId)
      .is('counterparty_entity_id', null) // Only main investor KYC

    if (!submissions) return

    // Helper to check if a document type is approved
    const isDocApproved = (docType: string, memberId?: string | null) => {
      return submissions.some((sub: any) =>
        sub.document_type === docType &&
        sub.status === 'approved' &&
        (memberId === undefined || sub.investor_member_id === memberId)
      )
    }

    // Helper to check if either passport or passport_id is approved (they're equivalent)
    const isIdDocApproved = (memberId?: string | null) => {
      return isDocApproved('passport_id', memberId) || isDocApproved('passport', memberId)
    }

    if (isEntityType) {
      // Entity investor: Check entity-level docs + per-member docs

      // Entity-level required documents (NO questionnaire, NO NDA)
      const entityDocs = [
        'incorporation_certificate',
        'memo_articles',
        'register_members',
        'register_directors',
        'bank_confirmation'
      ]

      // Check all entity-level docs are approved (no member association)
      const entityDocsApproved = entityDocs.every(docType =>
        isDocApproved(docType, null)
      )

      if (!entityDocsApproved) {
        console.log(`[KYC Status] Investor ${investorId}: Entity documents not all approved`)
        return
      }

      // Get all active members for this entity investor
      const { data: members } = await supabase
        .from('investor_members')
        .select('id, full_name')
        .eq('investor_id', investorId)
        .eq('is_active', true)

      // Track which members have all docs approved
      const membersWithAllDocsApproved: string[] = []

      if (members && members.length > 0) {
        // Each member needs ID (passport or passport_id) AND utility_bill approved
        for (const member of members) {
          const hasId = isIdDocApproved(member.id)
          const hasAddress = isDocApproved('utility_bill', member.id)

          if (hasId && hasAddress) {
            membersWithAllDocsApproved.push(member.id)
          } else {
            // Missing docs - investor can't be fully approved yet
            if (!hasId) {
              console.log(`[KYC Status] Investor ${investorId}: Member ${member.full_name} missing approved ID document`)
            }
            if (!hasAddress) {
              console.log(`[KYC Status] Investor ${investorId}: Member ${member.full_name} missing approved utility_bill`)
            }
            return
          }
        }
      }

      // Update member KYC status for those with all docs approved
      if (membersWithAllDocsApproved.length > 0) {
        await supabase
          .from('investor_members')
          .update({ kyc_status: 'approved' })
          .in('id', membersWithAllDocsApproved)
          .neq('kyc_status', 'approved') // Only update if not already approved

        console.log(`[KYC Status] Updated ${membersWithAllDocsApproved.length} member(s) to approved`)
      }
    } else {
      // Individual investor: Check ID (passport or passport_id) + utility_bill
      if (!isIdDocApproved(null)) {
        console.log(`[KYC Status] Investor ${investorId}: Individual ID document not approved`)
        return
      }

      if (!isDocApproved('utility_bill', null)) {
        console.log(`[KYC Status] Investor ${investorId}: Individual utility_bill not approved`)
        return
      }
    }

    // All checks passed - update investor KYC status if not already approved
    if (investor.kyc_status !== 'approved') {
      await supabase
        .from('investors')
        .update({
          kyc_status: 'approved',
          kyc_completed_at: new Date().toISOString()
        })
        .eq('id', investorId)

      console.log(`[KYC Status] Investor ${investorId}: KYC status updated to approved`)
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
    // Task titles must match how tasks are created in the system
    const taskTitlePatterns: Record<string, string> = {
      // Individual documents
      passport_id: 'Upload ID',
      passport: 'Upload ID',
      utility_bill: 'Upload Utility Bill',
      // Entity documents
      incorporation_certificate: 'Upload Incorporation',
      memo_articles: 'Upload Memo',
      register_members: 'Upload Register of Members',
      register_directors: 'Upload Register of Directors',
      register_beneficial_owners: 'Upload Register of UBOs',
      bank_confirmation: 'Upload Bank Confirmation',
      // Catch-all for other types
      other: 'Upload Document'
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
