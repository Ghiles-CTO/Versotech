import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

/**
 * GET /api/introducers/[id]/referred-investors
 *
 * Returns all investors referred through this introducer.
 * Includes deal info, fee plan info, and subscription status.
 *
 * Queries both:
 * 1. deal_memberships (new architecture) - investors dispatched via this introducer
 * 2. subscriptions (legacy) - subscriptions where introducer_id matches
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

    // Fetch deal memberships where this introducer is the referrer
    // We need to join with fee_plans to get the introducer link
    // Note: Using full FK constraint names for disambiguation (required when multiple FKs point to same table)
    const { data: memberships, error: membershipsError } = await serviceClient
      .from('deal_memberships')
      .select(`
        deal_id,
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        referred_by_entity_id,
        referred_by_entity_type,
        assigned_fee_plan_id,
        profiles!deal_memberships_user_id_fkey (
          id,
          display_name,
          email
        ),
        investors!deal_memberships_investor_id_fkey (
          id,
          legal_name,
          type
        ),
        deals!deal_memberships_deal_id_fkey (
          id,
          name,
          status
        ),
        fee_plans!deal_memberships_assigned_fee_plan_id_fkey (
          id,
          name,
          status
        )
      `)
      .eq('referred_by_entity_type', 'introducer')
      .eq('referred_by_entity_id', introducerId)
      .order('invited_at', { ascending: false })

    if (membershipsError) {
      console.error('[Introducer Referred Investors] Memberships error:', membershipsError)
      // Continue with legacy query even if memberships fail
    }

    // Track investor+deal pairs found in deal_memberships to avoid duplicates
    const foundPairs = new Set(
      (memberships || []).map(m => `${m.investor_id}-${m.deal_id}`)
    )

    // LEGACY FALLBACK: Query subscriptions where this introducer is linked
    // This captures historical referrals before deal_memberships existed
    const { data: legacySubscriptions, error: legacyError } = await serviceClient
      .from('subscriptions')
      .select(`
        id,
        investor_id,
        deal_id,
        vehicle_id,
        status,
        commitment,
        funded_amount,
        funded_at,
        created_at,
        investors!subscriptions_investor_id_fkey (
          id,
          legal_name,
          type
        ),
        deals!subscriptions_deal_id_fkey (
          id,
          name,
          status
        )
      `)
      .eq('introducer_id', introducerId)
      .order('created_at', { ascending: false })

    if (legacyError) {
      console.error('[Introducer Referred Investors] Legacy subscriptions error:', legacyError)
    }

    // Filter legacy subscriptions to exclude those already in deal_memberships
    const uniqueLegacySubscriptions = (legacySubscriptions || []).filter(s => {
      const key = `${s.investor_id}-${s.deal_id}`
      return !foundPairs.has(key)
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
        deal: m.deals,
        fee_plan: m.fee_plans,
        subscription: null as { status: string; amount: number | null; funded_at: string | null } | null
      }
    })

    // Build referred investors from legacy subscriptions
    const referredFromSubscriptions = uniqueLegacySubscriptions.map(s => {
      return {
        id: `sub-${s.id}`,
        source: 'subscription' as const,
        investor_id: s.investor_id,
        user_id: null as string | null,
        deal_id: s.deal_id,
        role: 'investor' as const,
        invited_at: s.created_at,
        accepted_at: s.created_at,
        profile: null,
        investor: s.investors,
        deal: s.deals,
        fee_plan: null,
        subscription: {
          status: s.status,
          amount: s.commitment ? Number(s.commitment) : null,
          funded_at: s.funded_at
        }
      }
    })

    // Merge both sources
    const referredInvestors = [...referredFromMemberships, ...referredFromSubscriptions]

    return NextResponse.json({
      referred_investors: referredInvestors,
      introducer: {
        id: introducer.id,
        name: introducer.legal_name
      },
      total_count: referredInvestors.length
    })

  } catch (error) {
    console.error('[Introducer Referred Investors] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
