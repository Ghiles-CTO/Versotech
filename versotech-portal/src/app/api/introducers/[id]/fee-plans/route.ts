import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

/**
 * GET /api/introducers/[id]/fee-plans
 *
 * Returns all fee plans linked to this introducer across all deals.
 * Includes deal info, term sheet info, and investor counts.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const serviceClient = createServiceClient()
    const isStaff = await isStaffUser(serviceClient, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: introducerId } = await params

    // Verify introducer exists
    const { data: introducer, error: introducerError } = await serviceClient
      .from('introducers')
      .select('id, legal_name')
      .eq('id', introducerId)
      .single()

    if (introducerError || !introducer) {
      return NextResponse.json({ error: 'Introducer not found' }, { status: 404 })
    }

    // Fetch fee plans for this introducer with deal and term sheet info
    const { data: feePlans, error: feePlansError } = await serviceClient
      .from('fee_plans')
      .select(`
        id,
        name,
        status,
        is_active,
        accepted_at,
        accepted_by,
        created_at,
        updated_at,
        deal:deal_id (
          id,
          name,
          status
        ),
        term_sheet:term_sheet_id (
          id,
          version,
          status
        )
      `)
      .eq('introducer_id', introducerId)
      .order('created_at', { ascending: false })

    if (feePlansError) {
      console.error('[Introducer Fee Plans] Error fetching:', feePlansError)
      return NextResponse.json(
        { error: 'Failed to fetch fee plans' },
        { status: 500 }
      )
    }

    // Get investor counts for each fee plan from deal_memberships
    const feePlanIds = (feePlans || []).map(fp => fp.id)

    let investorCounts: Record<string, number> = {}
    if (feePlanIds.length > 0) {
      const { data: memberships } = await serviceClient
        .from('deal_memberships')
        .select('assigned_fee_plan_id')
        .in('assigned_fee_plan_id', feePlanIds)

      // Count memberships per fee plan
      investorCounts = (memberships || []).reduce((acc, m) => {
        if (m.assigned_fee_plan_id) {
          acc[m.assigned_fee_plan_id] = (acc[m.assigned_fee_plan_id] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    }

    // Enrich fee plans with investor counts
    const enrichedFeePlans = (feePlans || []).map(fp => ({
      ...fp,
      investor_count: investorCounts[fp.id] || 0
    }))

    return NextResponse.json({
      fee_plans: enrichedFeePlans,
      introducer: {
        id: introducer.id,
        name: introducer.legal_name
      }
    })

  } catch (error) {
    console.error('[Introducer Fee Plans] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
