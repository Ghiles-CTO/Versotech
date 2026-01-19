import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/deals/:id/active-agreements
 *
 * Fetches active introducer agreements for a deal with their associated
 * term sheets and fee plans. Used for the "Dispatch Investor to Introducer" flow.
 *
 * Query params:
 * - introducer_id (required): Filter agreements by this introducer
 *
 * Business Rule: Only agreements with status='active' are returned.
 * Each agreement must have an associated fee_plan that's accepted and active.
 *
 * Response shape:
 * {
 *   agreements: [
 *     {
 *       id: string,
 *       introducer_id: string,
 *       introducer_name: string,
 *       fee_plan_id: string,
 *       fee_plan_name: string,
 *       term_sheet_id: string,
 *       term_sheet_version: number
 *     }
 *   ]
 * }
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Parse query params
    const url = new URL(request.url)
    const introducerId = url.searchParams.get('introducer_id')

    if (!introducerId) {
      return NextResponse.json(
        { error: 'introducer_id query parameter is required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id
    })

    const hasStaffAccess = personas?.some(
      (p: { persona_type: string }) => ['staff', 'ceo', 'arranger'].includes(p.persona_type)
    ) || false

    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 })
    }

    // Query active introducer agreements for this deal AND this introducer
    // Join with fee_plans to get term_sheet_id and fee plan details
    const { data: agreements, error: agreementsError } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        id,
        introducer_id,
        fee_plan_id,
        reference_number,
        signed_date,
        introducer:introducer_id (
          id,
          legal_name,
          display_name
        ),
        fee_plan:fee_plan_id (
          id,
          name,
          status,
          is_active,
          term_sheet_id
        )
      `)
      .eq('deal_id', dealId)
      .eq('introducer_id', introducerId)
      .eq('status', 'active')
      .order('signed_date', { ascending: false })

    if (agreementsError) {
      console.error('Error fetching active agreements:', agreementsError)
      return NextResponse.json(
        { error: 'Failed to fetch active agreements' },
        { status: 500 }
      )
    }

    // DEBUG: Log raw query results
    console.log('🔍 [ACTIVE-AGREEMENTS] Raw query results:', JSON.stringify(agreements, null, 2))
    console.log('🔍 [ACTIVE-AGREEMENTS] Deal ID:', dealId, 'Introducer ID:', introducerId)

    // Get valid agreements with accepted fee plans
    const agreementsWithValidFeePlans = (agreements || []).filter(agreement => {
      const feePlan = agreement.fee_plan as any
      return feePlan &&
             feePlan.status === 'accepted' &&
             feePlan.is_active === true &&
             feePlan.term_sheet_id
    })

    // Fetch term sheet versions for the valid agreements
    const termSheetIds = [...new Set(
      agreementsWithValidFeePlans
        .map(a => (a.fee_plan as any)?.term_sheet_id)
        .filter(Boolean)
    )]

    let termSheetVersions: Record<string, number> = {}
    if (termSheetIds.length > 0) {
      const { data: termSheets } = await serviceSupabase
        .from('deal_fee_structures')
        .select('id, version')
        .in('id', termSheetIds)

      termSheetVersions = (termSheets || []).reduce((acc, ts) => {
        acc[ts.id] = ts.version
        return acc
      }, {} as Record<string, number>)
    }

    // Transform to response shape
    const validAgreements = agreementsWithValidFeePlans.map(agreement => {
      const introducer = agreement.introducer as any
      const feePlan = agreement.fee_plan as any
      const termSheetId = feePlan?.term_sheet_id

      return {
        id: agreement.id,
        introducer_id: agreement.introducer_id,
        introducer_name: introducer?.display_name || introducer?.legal_name || 'Unknown Introducer',
        fee_plan_id: agreement.fee_plan_id,
        fee_plan_name: feePlan?.name || 'Fee Plan',
        term_sheet_id: termSheetId,
        term_sheet_version: termSheetVersions[termSheetId] || 1,
        reference_number: agreement.reference_number,
        signed_date: agreement.signed_date
      }
    })

    return NextResponse.json({
      deal_id: dealId,
      agreements: validAgreements,
      total: validAgreements.length
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/active-agreements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
