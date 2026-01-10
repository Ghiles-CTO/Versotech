import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

/**
 * GET /api/partners/[id]/referred-investors
 *
 * Returns all investors referred through this partner.
 * Includes deal info, fee plan info, and subscription status.
 *
 * Queries both:
 * 1. deal_memberships (new architecture) - investors dispatched via this partner
 * 2. partner_commissions (legacy) - investors linked through commission records
 *
 * Results are merged with deduplication to avoid showing same investor+deal twice.
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

    const { id: partnerId } = await params

    // Verify partner exists
    const { data: partner, error: partnerError } = await serviceClient
      .from('partners')
      .select('id, name')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Fetch deal memberships where this partner is the referrer
    const { data: memberships, error: membershipsError } = await serviceClient
      .from('deal_memberships')
      .select(`
        id,
        deal_id,
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        deal:deal_id (
          id,
          name,
          status
        ),
        fee_plan:assigned_fee_plan_id (
          id,
          name,
          status
        )
      `)
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerId)
      .order('invited_at', { ascending: false })

    if (membershipsError) {
      console.error('[Partner Referred Investors] Memberships error:', membershipsError)
      // Continue with legacy query even if memberships fail
    }

    // Track investor+deal pairs found in deal_memberships to avoid duplicates
    const foundPairs = new Set(
      (memberships || []).map(m => `${m.investor_id}-${m.deal_id}`)
    )

    // LEGACY FALLBACK: Query partner_commissions for historical referrals
    const { data: legacyCommissions, error: legacyError } = await serviceClient
      .from('partner_commissions')
      .select(`
        id,
        partner_id,
        investor_id,
        deal_id,
        accrual_amount,
        status,
        created_at,
        investors!partner_commissions_investor_id_fkey (
          id,
          legal_name,
          type
        ),
        deals!partner_commissions_deal_id_fkey (
          id,
          name,
          status
        )
      `)
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })

    if (legacyError) {
      console.error('[Partner Referred Investors] Legacy commissions error:', legacyError)
    }

    // Filter legacy commissions to exclude those already in deal_memberships
    // Also deduplicate by investor_id+deal_id within legacy data
    const seenLegacyPairs = new Set<string>()
    const uniqueLegacyCommissions = (legacyCommissions || []).filter(c => {
      const key = `${c.investor_id}-${c.deal_id}`
      if (foundPairs.has(key) || seenLegacyPairs.has(key)) {
        return false
      }
      seenLegacyPairs.add(key)
      return true
    })

    // Build referred investors from deal_memberships (new architecture)
    const referredFromMemberships = (memberships || []).map(m => {
      return {
        id: `dm-${m.deal_id}-${m.user_id}`,
        source: 'deal_membership' as const,
        investor_id: m.investor_id,
        user_id: m.user_id,
        deal_id: m.deal_id,
        role: m.role,
        invited_at: m.invited_at,
        accepted_at: m.accepted_at,
        profile: m.profiles,
        investor: m.investors,
        deal: m.deal,
        fee_plan: m.fee_plan,
        subscription: null as { status: string; amount: number | null; funded_at: string | null } | null
      }
    })

    // Build referred investors from legacy partner_commissions
    const referredFromCommissions = uniqueLegacyCommissions.map(c => {
      return {
        id: `pc-${c.id}`,
        source: 'partner_commission' as const,
        investor_id: c.investor_id,
        user_id: null as string | null,
        deal_id: c.deal_id,
        role: 'partner_investor' as const,
        invited_at: c.created_at,
        accepted_at: c.created_at,
        profile: null,
        investor: c.investors,
        deal: c.deals,
        fee_plan: null,
        subscription: {
          status: c.status,
          amount: c.accrual_amount ? Number(c.accrual_amount) : null,
          funded_at: null
        }
      }
    })

    // Merge both sources
    const referredInvestors = [...referredFromMemberships, ...referredFromCommissions]

    return NextResponse.json({
      referred_investors: referredInvestors,
      partner: {
        id: partner.id,
        name: partner.name
      },
      total_count: referredInvestors.length
    })

  } catch (error) {
    console.error('[Partner Referred Investors] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
