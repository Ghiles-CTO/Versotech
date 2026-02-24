import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'
import { checkAndUpdateEntityKYCStatus } from '@/lib/kyc/check-entity-kyc-status'
import { resolveKycSubmissionAssignee } from '@/lib/kyc/reviewer-assignment'
import { notifyCeoPersonalInfoSubmitted } from '@/lib/kyc/submit-notifications'

const normalizeSnapshotValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

const snapshotsMatch = (
  nextSnapshot: Record<string, unknown>,
  previousSnapshot: Record<string, unknown>
) =>
  Object.keys(nextSnapshot).every(
    (key) =>
      normalizeSnapshotValue(nextSnapshot[key]) ===
      normalizeSnapshotValue(previousSnapshot[key])
  )

/**
 * POST /api/investors/me/submit-personal-kyc
 *
 * Individual investor-only endpoint to submit profile fields for formal
 * personal_info review in the KYC queue.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

    if (investorUserError || !investorUser?.investor_id) {
      return NextResponse.json({ error: 'Investor profile not found' }, { status: 404 })
    }

    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        type,
        kyc_status,
        first_name,
        last_name,
        date_of_birth,
        nationality,
        residential_street,
        residential_country,
        email,
        phone,
        account_approval_status
      `)
      .eq('id', investorUser.investor_id)
      .maybeSingle()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    if (investor.type !== 'individual') {
      return NextResponse.json(
        { error: 'This endpoint only applies to individual investors' },
        { status: 400 }
      )
    }

    const requiredFields: Array<{ field: keyof typeof investor; label: string }> = [
      { field: 'first_name', label: 'First Name' },
      { field: 'last_name', label: 'Last Name' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'nationality', label: 'Nationality' },
      { field: 'residential_street', label: 'Residential Address' },
      { field: 'residential_country', label: 'Country of Residence' },
    ]

    const missingFields = requiredFields.filter(({ field }) => !investor[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required personal fields before submitting',
          missing: missingFields.map(field => field.label),
        },
        { status: 400 }
      )
    }

    const reviewSnapshot: Record<string, unknown> = {
      first_name: investor.first_name,
      last_name: investor.last_name,
      date_of_birth: investor.date_of_birth,
      nationality: investor.nationality,
      residential_street: investor.residential_street,
      residential_country: investor.residential_country,
      email: investor.email,
      phone: investor.phone,
    }

    const { data: latestSubmission, error: latestSubmissionError } = await serviceSupabase
      .from('kyc_submissions')
      .select('metadata')
      .eq('investor_id', investor.id)
      .eq('document_type', 'personal_info')
      .is('investor_member_id', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestSubmissionError) {
      console.error('[submit-personal-kyc] Failed to load latest submission snapshot:', latestSubmissionError)
      return NextResponse.json({ error: 'Failed to validate previous personal KYC submission' }, { status: 500 })
    }

    const latestSnapshotRaw = (latestSubmission?.metadata as Record<string, unknown> | undefined)?.review_snapshot
    if (
      latestSnapshotRaw &&
      typeof latestSnapshotRaw === 'object' &&
      !Array.isArray(latestSnapshotRaw) &&
      snapshotsMatch(reviewSnapshot, latestSnapshotRaw as Record<string, unknown>)
    ) {
      return NextResponse.json(
        { error: 'No personal information changes to submit' },
        { status: 400 }
      )
    }

    const { data: existingPending } = await serviceSupabase
      .from('kyc_submissions')
      .select('id')
      .eq('investor_id', investor.id)
      .eq('document_type', 'personal_info')
      .is('investor_member_id', null)
      .in('status', ['pending', 'under_review'])
      .limit(1)
      .maybeSingle()

    if (existingPending?.id) {
      return NextResponse.json(
        { error: 'Personal KYC is already submitted for review' },
        { status: 400 }
      )
    }

    // Idempotency gate: only one request can transition this investor to submitted.
    const { data: reserveTransition, error: reserveTransitionError } = await serviceSupabase
      .from('investors')
      .update({
        kyc_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', investor.id)
      .neq('kyc_status', 'submitted')
      .select('id')
      .maybeSingle()

    if (reserveTransitionError) {
      console.error('[submit-personal-kyc] Failed to reserve submission:', reserveTransitionError)
      return NextResponse.json({ error: 'Failed to reserve personal KYC submission' }, { status: 500 })
    }

    if (!reserveTransition) {
      return NextResponse.json(
        { error: 'Personal KYC is already submitted for review' },
        { status: 400 }
      )
    }

    const assignedTo = await resolveKycSubmissionAssignee(serviceSupabase)
    const nowIso = new Date().toISOString()

    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: investor.id,
        document_type: 'personal_info',
        status: 'approved',
        submitted_at: nowIso,
        reviewed_at: nowIso,
        reviewed_by: assignedTo,
        metadata: {
          submission_type: 'personal_kyc_individual',
          auto_approved: true,
          entity_type: 'investor',
          entity_name: investor.display_name || investor.legal_name,
          submitted_by_user_id: user.id,
          review_snapshot: reviewSnapshot,
        }
      })
      .select('id')
      .single()

    if (submissionError) {
      const isUniqueViolation = (submissionError as { code?: string }).code === '23505'
      if (isUniqueViolation) {
        return NextResponse.json(
          { error: 'Personal KYC is already submitted for review' },
          { status: 400 }
        )
      }

      console.error('[submit-personal-kyc] Failed to create submission:', submissionError)
      await serviceSupabase
        .from('investors')
        .update({
          kyc_status: investor.kyc_status || 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', investor.id)
        .eq('kyc_status', 'submitted')
      return NextResponse.json({ error: 'Failed to submit personal KYC' }, { status: 500 })
    }

    const currentAccountStatus = investor.account_approval_status?.toLowerCase() ?? null
    const shouldSetIncomplete = !currentAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete', 'rejected'].includes(currentAccountStatus)

    const investorUpdateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (shouldSetIncomplete) {
      investorUpdateData.account_approval_status = 'pending_onboarding'
    }

    await serviceSupabase
      .from('investors')
      .update(investorUpdateData)
      .eq('id', investor.id)

    await checkAndUpdateEntityKYCStatus(
      serviceSupabase as any,
      'investor',
      investor.id
    )

    const submitterName =
      `${investor.first_name || ''} ${investor.last_name || ''}`.trim() ||
      investor.display_name ||
      investor.legal_name ||
      null

    try {
      await notifyCeoPersonalInfoSubmitted({
        supabase: serviceSupabase,
        entityType: 'investor',
        entityId: investor.id,
        submittedByUserId: user.id,
        memberName: submitterName,
        entityName: investor.display_name || investor.legal_name || null,
      })
    } catch (notificationError) {
      console.error('[submit-personal-kyc] Failed to notify CEO users:', notificationError)
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Personal KYC submitted',
    })
  } catch (error) {
    console.error('[submit-personal-kyc] Internal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
