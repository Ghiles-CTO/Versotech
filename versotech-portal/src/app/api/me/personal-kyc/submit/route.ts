import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { checkAndUpdateEntityKYCStatus } from '@/lib/kyc/check-entity-kyc-status'
import { resolveKycSubmissionAssignee } from '@/lib/kyc/reviewer-assignment'

// Entity type configurations
const ENTITY_CONFIGS = {
  investor: {
    memberTable: 'investor_members',
    entityIdColumn: 'investor_id',
    submissionEntityIdColumn: 'investor_id',
    userTable: 'investor_users',
    entityTable: 'investors',
  },
  partner: {
    memberTable: 'partner_members',
    entityIdColumn: 'partner_id',
    submissionEntityIdColumn: 'partner_id',
    userTable: 'partner_users',
    entityTable: 'partners',
  },
  introducer: {
    memberTable: 'introducer_members',
    entityIdColumn: 'introducer_id',
    submissionEntityIdColumn: 'introducer_id',
    userTable: 'introducer_users',
    entityTable: 'introducers',
  },
  lawyer: {
    memberTable: 'lawyer_members',
    entityIdColumn: 'lawyer_id',
    submissionEntityIdColumn: 'lawyer_id',
    userTable: 'lawyer_users',
    entityTable: 'lawyers',
  },
  commercial_partner: {
    memberTable: 'commercial_partner_members',
    entityIdColumn: 'commercial_partner_id',
    submissionEntityIdColumn: 'commercial_partner_id',
    userTable: 'commercial_partner_users',
    entityTable: 'commercial_partners',
  },
  arranger: {
    memberTable: 'arranger_members',
    entityIdColumn: 'arranger_id',
    submissionEntityIdColumn: 'arranger_entity_id',
    userTable: 'arranger_users',
    entityTable: 'arranger_entities',
  },
} as const

type EntityType = keyof typeof ENTITY_CONFIGS

type MemberRow = {
  id: string
  linked_user_id: string | null
  email: string | null
  full_name: string | null
  first_name: string | null
  last_name: string | null
  kyc_status: string | null
  date_of_birth: string | null
  nationality: string | null
  residential_street: string | null
  residential_country: string | null
  id_type: string | null
  id_number: string | null
  [key: string]: unknown
}

/**
 * POST /api/me/personal-kyc/submit
 *
 * Generic endpoint to submit personal KYC for any entity type.
 * Creates a kyc_submissions record and updates member kyc_status to 'submitted'.
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { entityType, memberId } = body

    // Validate entity type
    if (!entityType || !Object.keys(ENTITY_CONFIGS).includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be one of: ' + Object.keys(ENTITY_CONFIGS).join(', ') },
        { status: 400 }
      )
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const config = ENTITY_CONFIGS[entityType as EntityType]
    const serviceSupabase = createServiceClient()

    // Resolve the member for submission:
    // - user must belong to the same entity via the persona user bridge table
    // - any authorized entity user can submit KYC for any member in that entity
    // - if the member matches the current user by email, auto-link for future ownership clarity
    const memberSelect = `
      id,
      ${config.entityIdColumn},
      linked_user_id,
      email,
      full_name,
      first_name,
      last_name,
      kyc_status,
      date_of_birth,
      nationality,
      residential_street,
      residential_country,
      id_type,
      id_number
    `

    const { data: rawMemberData, error: rawMemberError } = await serviceSupabase
      .from(config.memberTable)
      .select(memberSelect)
      .eq('id', memberId)
      .maybeSingle()
    const rawMember = rawMemberData as MemberRow | null

    if (rawMemberError) {
      console.error(`Error fetching ${entityType} member:`, rawMemberError)
      return NextResponse.json(
        { error: 'Failed to fetch member data' },
        { status: 500 }
      )
    }

    if (!rawMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    const entityId = rawMember[config.entityIdColumn as keyof typeof rawMember]
    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json(
        { error: 'Member is not linked to a valid entity' },
        { status: 400 }
      )
    }

    const { data: entityUser, error: entityUserError } = await serviceSupabase
      .from(config.userTable)
      .select('user_id')
      .eq('user_id', user.id)
      .eq(config.entityIdColumn, entityId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (entityUserError || !entityUser) {
      return NextResponse.json(
        { error: 'Member not found or access denied' },
        { status: 404 }
      )
    }

    let member = rawMember
    const linkedUserId = member.linked_user_id as string | null
    const memberEmail = typeof member.email === 'string' ? member.email.trim().toLowerCase() : null
    const userEmail = user.email?.trim().toLowerCase() ?? null
    const shouldAutoLinkToCurrentUser = !linkedUserId && !!memberEmail && !!userEmail && memberEmail === userEmail

    if (shouldAutoLinkToCurrentUser) {
      const { data: linkedMemberData, error: linkError } = await serviceSupabase
        .from(config.memberTable)
        .update({
          linked_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .is('linked_user_id', null)
        .select(memberSelect)
        .maybeSingle()
      const linkedMember = linkedMemberData as MemberRow | null

      if (linkError) {
        console.error(`Error auto-linking ${entityType} member:`, linkError)
        return NextResponse.json(
          { error: 'Failed to verify member ownership' },
          { status: 500 }
        )
      }

      if (linkedMember) {
        member = linkedMember
      }
    }

    // Check if already submitted (prevent double-submit)
    if (member.kyc_status === 'submitted') {
      return NextResponse.json(
        { error: 'Personal KYC already submitted for review' },
        { status: 400 }
      )
    }

    // Validate required fields are complete
    const requiredFields = [
      { field: 'first_name', label: 'First Name' },
      { field: 'last_name', label: 'Last Name' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'nationality', label: 'Nationality' },
      { field: 'residential_street', label: 'Residential Address' },
      { field: 'residential_country', label: 'Country of Residence' },
    ]

    const missingFields = requiredFields.filter(
      ({ field }) => !member[field as keyof typeof member]
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

    // Build submission data dynamically based on entity type
    const submissionMemberIdColumn = `${entityType}_member_id`

    // Prevent duplicate queue entries when a personal_info submission is already pending
    const { data: existingPendingSubmission, error: existingPendingError } = await serviceSupabase
      .from('kyc_submissions')
      .select('id')
      .eq(config.submissionEntityIdColumn, entityId)
      .eq(submissionMemberIdColumn, member.id)
      .eq('document_type', 'personal_info')
      .in('status', ['pending', 'under_review'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPendingError) {
      console.error('Error checking existing pending personal KYC submission:', existingPendingError)
      return NextResponse.json(
        { error: 'Failed to validate existing KYC submission status' },
        { status: 500 }
      )
    }

    if (existingPendingSubmission) {
      return NextResponse.json(
        { error: 'Personal KYC already submitted for review' },
        { status: 400 }
      )
    }

    // Idempotency gate: transition member to submitted once.
    // Concurrent submits for the same member will cause only one request to pass this step.
    const previousMemberStatus = member.kyc_status
    const { data: statusTransition, error: statusTransitionError } = await serviceSupabase
      .from(config.memberTable)
      .update({
        kyc_status: 'approved',
        kyc_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .neq('kyc_status', 'approved')
      .select('id')
      .maybeSingle()

    if (statusTransitionError) {
      console.error('Error transitioning member to submitted:', statusTransitionError)
      return NextResponse.json(
        { error: 'Failed to reserve personal KYC submission' },
        { status: 500 }
      )
    }

    if (!statusTransition) {
      return NextResponse.json(
        { error: 'Personal KYC already approved for this member' },
        { status: 400 }
      )
    }

    const assignedTo = await resolveKycSubmissionAssignee(serviceSupabase)
    const nowIso = new Date().toISOString()

    const submissionData: Record<string, unknown> = {
      document_type: 'personal_info',
      status: 'approved',
      submitted_at: nowIso,
      reviewed_at: nowIso,
      reviewed_by: assignedTo,
      metadata: {
        submission_type: 'personal_kyc',
        auto_approved: true,
        entity_type: entityType,
        member_name: member.full_name || `${member.first_name} ${member.last_name}`,
        submitted_by_user_id: user.id,
        review_snapshot: {
          first_name: member.first_name,
          last_name: member.last_name,
          date_of_birth: member.date_of_birth,
          nationality: member.nationality,
          residential_street: member.residential_street,
          residential_country: member.residential_country,
          id_type: member.id_type,
          id_number: member.id_number,
        }
      }
    }

    // Add entity-specific foreign key
    submissionData[config.submissionEntityIdColumn] = entityId
    submissionData[submissionMemberIdColumn] = member.id

    // Create KYC submission record
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert(submissionData)
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
      // Best-effort rollback if insert failed after status transition.
      await serviceSupabase
        .from(config.memberTable)
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
      .from(config.entityTable)
      .select('account_approval_status')
      .eq('id', entityId)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus = !existingAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from(config.entityTable)
        .update({
          account_approval_status: 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
    }

    await checkAndUpdateEntityKYCStatus(
      serviceSupabase as any,
      entityType as any,
      entityId
    )

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Personal KYC submitted and approved'
    })

  } catch (error) {
    console.error('Error in personal-kyc submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
