import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkAndUpdateEntityKYCStatus } from '@/lib/kyc/check-entity-kyc-status'
import { resolveKycSubmissionAssignee } from '@/lib/kyc/reviewer-assignment'
import { getMobilePhoneValidationError } from '@/lib/validation/phone-number'

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/**
 * POST /api/investors/me/members/[memberId]/submit-kyc
 *
 * Submits a member's personal KYC.
 * Creates an auto-approved personal_info submission and updates member kyc_status to 'approved'.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params

  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Verify the member belongs to this user via linked_user_id
    const { data: member, error: memberError } = await serviceSupabase
      .from('investor_members')
      .select('id, investor_id, linked_user_id, full_name, kyc_status, first_name, last_name, date_of_birth, nationality, phone_mobile, residential_street, residential_country, id_type, id_number')
      .eq('id', memberId)
      .eq('linked_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found or access denied' },
        { status: 404 }
      )
    }

    // Check if already submitted or approved
    if (member.kyc_status === 'submitted') {
      return NextResponse.json(
        { error: 'Personal KYC already submitted for review' },
        { status: 400 }
      )
    }

    if (member.kyc_status === 'approved') {
      return NextResponse.json(
        { error: 'Personal KYC already approved' },
        { status: 400 }
      )
    }

    // Validate required fields are complete
    const requiredFields = [
      { field: 'first_name', label: 'First Name' },
      { field: 'last_name', label: 'Last Name' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'nationality', label: 'Nationality' },
      { field: 'phone_mobile', label: 'Mobile Phone' },
      { field: 'residential_street', label: 'Residential Address' },
      { field: 'residential_country', label: 'Country of Residence' },
    ]

    const missingFields = requiredFields.filter(
      ({ field }) => !hasMeaningfulValue(member[field as keyof typeof member])
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required fields before submitting',
          missing: missingFields.map(f => f.label)
        },
        { status: 400 }
      )
    }

    const mobilePhoneError = getMobilePhoneValidationError(member.phone_mobile, true)
    if (mobilePhoneError) {
      return NextResponse.json(
        {
          error: mobilePhoneError,
          details: { fieldErrors: { phone_mobile: [mobilePhoneError] } },
        },
        { status: 400 }
      )
    }

    const { data: existingPending } = await serviceSupabase
      .from('kyc_submissions')
      .select('id')
      .eq('investor_id', member.investor_id)
      .eq('investor_member_id', member.id)
      .eq('document_type', 'personal_info')
      .in('status', ['pending', 'under_review', 'approved'])
      .limit(1)
      .maybeSingle()

    if (existingPending?.id) {
      return NextResponse.json(
        { error: 'Personal KYC already submitted for review' },
        { status: 400 }
      )
    }

    const previousMemberStatus = member.kyc_status
    const nowIso = new Date().toISOString()
    const { data: reserveTransition, error: reserveTransitionError } = await serviceSupabase
      .from('investor_members')
      .update({
        kyc_status: 'approved',
        kyc_approved_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', memberId)
      .neq('kyc_status', 'approved')
      .select('id')
      .maybeSingle()

    if (reserveTransitionError) {
      console.error('Error reserving member KYC submission:', reserveTransitionError)
      return NextResponse.json(
        { error: 'Failed to reserve KYC submission' },
        { status: 500 }
      )
    }

    if (!reserveTransition) {
      return NextResponse.json(
        { error: 'Personal KYC already approved' },
        { status: 400 }
      )
    }

    const assignedTo = await resolveKycSubmissionAssignee(serviceSupabase)

    // Create KYC submission record
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: member.investor_id,
        investor_member_id: member.id,
        document_type: 'personal_info',
        status: 'approved',
        submitted_at: nowIso,
        reviewed_at: nowIso,
        reviewed_by: assignedTo,
        metadata: {
          submission_type: 'personal_kyc',
          auto_approved: true,
          member_name: member.full_name || `${member.first_name} ${member.last_name}`,
          submitted_by_user_id: user.id,
          review_snapshot: {
            first_name: member.first_name,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth,
            nationality: member.nationality,
            phone_mobile: member.phone_mobile,
            residential_street: member.residential_street,
            residential_country: member.residential_country,
            id_type: member.id_type,
            id_number: member.id_number,
          }
        }
      })
      .select('id')
      .single()

    if (submissionError) {
      const isUniqueViolation = (submissionError as { code?: string }).code === '23505'
      if (isUniqueViolation) {
        return NextResponse.json(
          { error: 'Personal KYC already submitted for review' },
          { status: 400 }
        )
      }

      console.error('Error creating KYC submission:', submissionError)
      await serviceSupabase
        .from('investor_members')
        .update({
          kyc_status: previousMemberStatus || 'pending',
          kyc_approved_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .eq('kyc_status', 'approved')
      return NextResponse.json(
        { error: 'Failed to create KYC submission' },
        { status: 500 }
      )
    }

    const { data: entityStatus } = await serviceSupabase
      .from('investors')
      .select('account_approval_status')
      .eq('id', member.investor_id)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus = !existingAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from('investors')
        .update({
          account_approval_status: 'pending_onboarding',
          updated_at: new Date().toISOString()
        })
        .eq('id', member.investor_id)
    }

    await checkAndUpdateEntityKYCStatus(
      serviceSupabase as any,
      'investor',
      member.investor_id
    )

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Personal KYC submitted'
    })

  } catch (error) {
    console.error('Error in submit-kyc:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
