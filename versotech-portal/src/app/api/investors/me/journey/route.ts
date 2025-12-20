import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/investors/me/journey
 *
 * Fetches the 10-stage investor journey for a specific deal.
 *
 * Query params:
 * - dealId: UUID of the deal
 * - investorId: UUID of the investor (optional - will use current user's investor if not provided)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')
    let investorId = searchParams.get('investorId')

    if (!dealId) {
      return NextResponse.json(
        { error: 'dealId is required' },
        { status: 400 }
      )
    }

    // If no investorId provided, try to find the investor for the current user
    if (!investorId) {
      const serviceClient = createServiceClient()
      const { data: investorUser } = await serviceClient
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
        .single()

      if (investorUser?.investor_id) {
        investorId = investorUser.investor_id
      } else {
        return NextResponse.json(
          { error: 'No investor found for current user' },
          { status: 404 }
        )
      }
    }

    // Call the database function to get journey stages
    const serviceClient = createServiceClient()
    const { data: stages, error: journeyError } = await serviceClient
      .rpc('get_investor_journey_stage', {
        p_deal_id: dealId,
        p_investor_id: investorId
      })

    if (journeyError) {
      console.error('[Journey API] Error fetching journey stages:', journeyError)
      return NextResponse.json(
        { error: 'Failed to fetch journey stages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      stages: stages || [],
      dealId,
      investorId
    })

  } catch (error) {
    console.error('[Journey API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
