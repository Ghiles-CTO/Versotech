import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const querySchema = z.object({
  term_sheet_id: z.string().uuid()
})

/**
 * GET /api/deals/:id/linkable-investors
 *
 * Fetches investors eligible to be linked to an introducer.
 * An investor is linkable if:
 * 1. They have a deal_membership with the specified term_sheet_id
 * 2. They don't already have a referred_by_entity_id set (not already linked to an introducer/partner)
 *
 * Query params:
 * - term_sheet_id (required): Only show investors on this term sheet
 *
 * Response shape:
 * {
 *   investors: [
 *     {
 *       user_id: string,
 *       investor_id: string,
 *       display_name: string,
 *       email: string,
 *       current_role: string
 *     }
 *   ]
 * }
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: dealId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
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

    // Parse query params
    const url = new URL(request.url)
    const queryParams = {
      term_sheet_id: url.searchParams.get('term_sheet_id')
    }

    const validation = querySchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'term_sheet_id is required and must be a valid UUID' },
        { status: 400 }
      )
    }

    const { term_sheet_id } = validation.data

    // Query deal memberships for investors on this term sheet who aren't already linked
    const { data: memberships, error: membershipsError } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        user_id,
        investor_id,
        role,
        term_sheet_id,
        referred_by_entity_id,
        referred_by_entity_type,
        investor:investor_id (
          id,
          legal_name,
          display_name,
          email,
          status,
          account_approval_status
        ),
        user:user_id (
          id,
          email
        )
      `)
      .eq('deal_id', dealId)
      .eq('term_sheet_id', term_sheet_id)
      .is('referred_by_entity_id', null) // Not already linked to an introducer/partner
      .in('role', ['investor', 'co_investor']) // Only base investor roles can be linked

    if (membershipsError) {
      console.error('Error fetching linkable investors:', membershipsError)
      return NextResponse.json(
        { error: 'Failed to fetch linkable investors' },
        { status: 500 }
      )
    }

    // DEBUG: Log raw query results
    console.log('🔍 [LINKABLE-INVESTORS] Deal ID:', dealId)
    console.log('🔍 [LINKABLE-INVESTORS] Term Sheet ID:', term_sheet_id)
    console.log('🔍 [LINKABLE-INVESTORS] Raw memberships:', JSON.stringify(memberships, null, 2))

    // Transform to response shape
    const investors = (memberships || [])
      .filter(membership => {
        const investor = membership.investor as any
        const investorStatus = investor?.status?.toLowerCase()
        const approvalStatus = investor?.account_approval_status?.toLowerCase()
        return investorStatus !== 'unauthorized' &&
          investorStatus !== 'blacklisted' &&
          approvalStatus !== 'unauthorized'
      })
      .map(membership => {
      const investor = membership.investor as any
      const userProfile = membership.user as any

      return {
        user_id: membership.user_id,
        investor_id: membership.investor_id,
        display_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
        email: investor?.email || userProfile?.email || '',
        current_role: membership.role
      }
    })

    // Deduplicate by investor_id (in case multiple users for same investor)
    const uniqueInvestors = investors.reduce((acc, inv) => {
      if (!acc.find(i => i.investor_id === inv.investor_id)) {
        acc.push(inv)
      }
      return acc
    }, [] as typeof investors)

    return NextResponse.json({
      deal_id: dealId,
      term_sheet_id,
      investors: uniqueInvestors,
      total: uniqueInvestors.length
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/deals/:id/linkable-investors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
