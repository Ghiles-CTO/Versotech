import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolvePrimaryInvestorLink } from '@/lib/kyc/investor-link'
import { NextResponse } from 'next/server'

/**
 * GET /api/investors/me/compliance
 * Get compliance status for the current investor
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID from investor_users
    const { link: investorUser, error: investorUserError } = await resolvePrimaryInvestorLink(
      serviceSupabase,
      user.id,
      'investor_id'
    )

    if (investorUserError) {
      console.error('Error fetching investor user:', investorUserError)
      return NextResponse.json({ error: 'Failed to fetch investor data' }, { status: 500 })
    }

    if (!investorUser) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Fetch compliance data from investor record
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select(`
        kyc_status,
        kyc_completed_at,
        kyc_expiry_date,
        aml_risk_rating,
        aml_last_reviewed_at,
        is_pep,
        is_sanctioned,
        is_professional_investor,
        is_qualified_purchaser,
        accreditation_expiry
      `)
      .eq('id', investorUser.investor_id)
      .single()

    if (investorError) {
      console.error('Error fetching investor compliance:', investorError)
      return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 })
    }

    return NextResponse.json({
      kyc_status: investor.kyc_status,
      kyc_completed_at: investor.kyc_completed_at,
      kyc_expiry_date: investor.kyc_expiry_date,
      aml_risk_rating: investor.aml_risk_rating,
      aml_last_reviewed_at: investor.aml_last_reviewed_at,
      is_pep: investor.is_pep ?? false,
      is_sanctioned: investor.is_sanctioned ?? false,
      is_professional_investor: investor.is_professional_investor ?? false,
      is_qualified_purchaser: investor.is_qualified_purchaser ?? false,
      accreditation_expiry: investor.accreditation_expiry
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/compliance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
