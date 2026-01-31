import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/investors/me/submit-entity-kyc
 *
 * Submits the entity's KYC information for review.
 * Creates a kyc_submissions record and updates entity kyc_status to 'submitted'.
 */
export async function POST() {
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

    // Get user's investor link
    const { data: investorUser, error: investorUserError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id, is_primary, role')
      .eq('user_id', user.id)
      .single()

    if (investorUserError || !investorUser) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      )
    }

    // Only admins or primary contacts can submit entity KYC
    if (!investorUser.is_primary && investorUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only primary contacts or admins can submit entity KYC' },
        { status: 403 }
      )
    }

    // Get investor entity details
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        type,
        kyc_status,
        country_of_incorporation,
        registered_address_line_1,
        registered_city,
        registered_country,
        email,
        phone
      `)
      .eq('id', investorUser.investor_id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json(
        { error: 'Investor entity not found' },
        { status: 404 }
      )
    }

    // Only allow for entity-type investors
    if (investor.type === 'individual') {
      return NextResponse.json(
        { error: 'Entity KYC submission is not applicable for individual investors' },
        { status: 400 }
      )
    }

    // Check if already submitted or approved
    if (investor.kyc_status === 'submitted') {
      return NextResponse.json(
        { error: 'Entity KYC already submitted for review' },
        { status: 400 }
      )
    }

    if (investor.kyc_status === 'approved') {
      return NextResponse.json(
        { error: 'Entity KYC already approved' },
        { status: 400 }
      )
    }

    // Validate required entity fields are complete
    const requiredFields = [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country_of_incorporation', label: 'Country of Incorporation' },
      { field: 'registered_address_line_1', label: 'Registered Address' },
      { field: 'registered_country', label: 'Registered Country' },
    ]

    const missingFields = requiredFields.filter(
      ({ field }) => !investor[field as keyof typeof investor]
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required entity fields before submitting',
          missing: missingFields.map(f => f.label)
        },
        { status: 400 }
      )
    }

    // Create KYC submission record for entity info
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: investor.id,
        document_type: 'entity_info',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        metadata: {
          submission_type: 'entity_kyc',
          entity_name: investor.legal_name,
          entity_type: investor.type,
          submitted_by_user_id: user.id,
        }
      })
      .select('id')
      .single()

    if (submissionError) {
      console.error('Error creating KYC submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create KYC submission' },
        { status: 500 }
      )
    }

    // Update entity kyc_status to 'submitted'
    const { error: updateError } = await serviceSupabase
      .from('investors')
      .update({
        kyc_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', investor.id)

    if (updateError) {
      console.error('Error updating investor KYC status:', updateError)
      // Don't fail the request - submission was created
    }

    const { data: entityStatus } = await serviceSupabase
      .from('investors')
      .select('account_approval_status')
      .eq('id', investor.id)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus = !existingAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from('investors')
        .update({
          account_approval_status: 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', investor.id)
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Entity KYC submitted for review'
    })

  } catch (error) {
    console.error('Error in submit-entity-kyc:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
