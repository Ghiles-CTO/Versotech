import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

    const { data: investorUser, error: investorUserError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .maybeSingle()

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
        id_type,
        id_number,
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
      { field: 'id_type', label: 'ID Document Type' },
      { field: 'id_number', label: 'ID Document Number' },
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

    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: investor.id,
        document_type: 'personal_info',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        metadata: {
          submission_type: 'personal_kyc_individual',
          entity_type: 'investor',
          entity_name: investor.display_name || investor.legal_name,
          submitted_by_user_id: user.id,
          review_snapshot: {
            first_name: investor.first_name,
            last_name: investor.last_name,
            date_of_birth: investor.date_of_birth,
            nationality: investor.nationality,
            residential_street: investor.residential_street,
            residential_country: investor.residential_country,
            id_type: investor.id_type,
            id_number: investor.id_number,
            email: investor.email,
            phone: investor.phone,
          }
        }
      })
      .select('id')
      .single()

    if (submissionError) {
      console.error('[submit-personal-kyc] Failed to create submission:', submissionError)
      return NextResponse.json({ error: 'Failed to submit personal KYC' }, { status: 500 })
    }

    const currentAccountStatus = investor.account_approval_status?.toLowerCase() ?? null
    const shouldSetIncomplete = !currentAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete'].includes(currentAccountStatus)

    const investorUpdateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (investor.kyc_status !== 'approved') {
      investorUpdateData.kyc_status = 'submitted'
    }

    if (shouldSetIncomplete) {
      investorUpdateData.account_approval_status = 'incomplete'
    }

    await serviceSupabase
      .from('investors')
      .update(investorUpdateData)
      .eq('id', investor.id)

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Personal KYC submitted for review',
    })
  } catch (error) {
    console.error('[submit-personal-kyc] Internal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
