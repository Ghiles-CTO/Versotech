import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/partners/me/fee-models
 * Returns fee models assigned to the current partner or deals they are entitled to.
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: partnerUser, error: partnerUserError } = await serviceSupabase
      .from('partner_users')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partnerUserError) {
      console.error('[fee-models] Partner lookup error:', partnerUserError)
      return NextResponse.json({ error: 'Failed to load partner profile' }, { status: 500 })
    }

    if (!partnerUser?.partner_id) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    const { data: memberships, error: membershipsError } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('user_id', user.id)

    if (membershipsError) {
      console.error('[fee-models] Membership lookup error:', membershipsError)
      return NextResponse.json({ error: 'Failed to load deal memberships' }, { status: 500 })
    }

    const { data: referrals, error: referralsError } = await serviceSupabase
      .from('deal_memberships')
      .select('deal_id')
      .eq('referred_by_entity_type', 'partner')
      .eq('referred_by_entity_id', partnerUser.partner_id)

    if (referralsError) {
      console.error('[fee-models] Referral lookup error:', referralsError)
      return NextResponse.json({ error: 'Failed to load referral deals' }, { status: 500 })
    }

    const dealIds = Array.from(
      new Set([
        ...(memberships || []).map(m => m.deal_id).filter(Boolean),
        ...(referrals || []).map(r => r.deal_id).filter(Boolean)
      ])
    )

    let query = serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        is_active,
        is_default,
        effective_from,
        effective_until,
        deal:deal_id (
          id,
          name
        ),
        fee_components (
          id,
          kind,
          rate_bps,
          flat_amount,
          calc_method,
          frequency
        )
      `)
      .order('created_at', { ascending: false })

    if (dealIds.length > 0) {
      query = query.or(`partner_id.eq.${partnerUser.partner_id},deal_id.in.(${dealIds.join(',')})`)
    } else {
      query = query.eq('partner_id', partnerUser.partner_id)
    }

    const { data: feePlans, error: feePlansError } = await query

    if (feePlansError) {
      console.error('[fee-models] Fee plan fetch error:', feePlansError)
      return NextResponse.json({ error: 'Failed to fetch fee models' }, { status: 500 })
    }

    return NextResponse.json({ fee_models: feePlans || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/partners/me/fee-models:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
