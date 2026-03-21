import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCycleStage, LIVE_CYCLE_STATUSES } from '@/lib/deals/investment-cycles'

/**
 * GET /api/investors/me/opportunities
 * Fetch all investment opportunities available to the current investor
 * Includes journey stage progress and subscription status
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID for this user
    const { data: investorLinks, error: linksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (linksError || !investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorId = investorLinks[0].investor_id

    // Fetch all deals where investor has membership (dispatched deals)
    const { data: memberDeals, error: memberDealsError } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        deal_id,
        investor_id,
        role,
        dispatched_at,
        viewed_at,
        interest_confirmed_at,
        nda_signed_at,
        data_room_granted_at,
        deals (
          id,
          name,
          description,
          status,
          deal_type,
          currency,
          minimum_investment,
          maximum_investment,
          target_amount,
          raised_amount,
          open_at,
          close_at,
          company_name,
          company_logo_url,
          sector,
          stage,
          location,
          vehicles (
            id,
            name,
            type
          )
        )
      `)
      .eq('user_id', user.id)

    if (memberDealsError) {
      console.error('Error fetching member deals:', memberDealsError)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    // Get data room access status for all deals
    const dealIds = (memberDeals || []).map(m => m.deal_id)
    const membershipInvestorIds = Array.from(
      new Set((memberDeals || []).map(m => m.investor_id).filter(Boolean))
    ) as string[]
    const investorIdsForLookup = membershipInvestorIds.length > 0
      ? membershipInvestorIds
      : [investorId]

    let dataRoomAccessMap: Record<string, { granted_at: string; expires_at: string | null }> = {}
    if (dealIds.length > 0) {
      const { data: accessData } = await serviceSupabase
        .from('deal_data_room_access')
        .select('deal_id, investor_id, granted_at, expires_at, revoked_at')
        .in('investor_id', investorIdsForLookup)
        .in('deal_id', dealIds)
        .is('revoked_at', null)

      if (accessData) {
        dataRoomAccessMap = accessData.reduce((acc, item) => {
          if (item.investor_id) {
            acc[`${item.deal_id}:${item.investor_id}`] = {
              granted_at: item.granted_at,
              expires_at: item.expires_at
            }
          }
          return acc
        }, {} as Record<string, { granted_at: string; expires_at: string | null }>)
      }
    }

    let selectedCycleMap: Record<string, any> = {}
    let subscriptionByCycleId: Record<string, any> = {}
    if (dealIds.length > 0) {
      const { data: cycles } = await serviceSupabase
        .from('deal_investment_cycles' as any)
        .select(`
          id,
          deal_id,
          investor_id,
          status,
          sequence_number,
          dispatched_at,
          viewed_at,
          interest_confirmed_at,
          submission_pending_at,
          approved_at,
          pack_generated_at,
          pack_sent_at,
          signed_at,
          funded_at,
          activated_at
        `)
        .in('deal_id', dealIds)
        .in('investor_id', investorIdsForLookup)
        .order('sequence_number', { ascending: false })
        .order('created_at', { ascending: false })

      const cycleIds = (cycles || []).map((cycle: any) => cycle.id).filter(Boolean)

      if (cycleIds.length > 0) {
        const { data: subscriptions } = await serviceSupabase
          .from('subscriptions')
          .select(`
            id,
            cycle_id,
            deal_id,
            investor_id,
            status,
            commitment,
            pack_generated_at,
            pack_sent_at,
            signed_at,
            funded_at,
            activated_at
          `)
          .in('cycle_id', cycleIds)
          .order('created_at', { ascending: false })

        if (subscriptions) {
          subscriptionByCycleId = subscriptions.reduce((acc, sub: any) => {
            if (sub.cycle_id && !acc[sub.cycle_id]) {
              acc[sub.cycle_id] = sub
            }
            return acc
          }, {} as Record<string, any>)
        }
      }

      const cyclesByKey = new Map<string, any[]>()
      for (const cycle of cycles || []) {
        const key = `${cycle.investor_id}:${cycle.deal_id}`
        const existing = cyclesByKey.get(key) || []
        existing.push(cycle)
        cyclesByKey.set(key, existing)
      }

      selectedCycleMap = Array.from(cyclesByKey.entries()).reduce((acc, [key, cycleList]) => {
        acc[key] = cycleList.find(cycle => LIVE_CYCLE_STATUSES.includes(cycle.status)) || cycleList[0] || null
        return acc
      }, {} as Record<string, any>)
    }

    // Build opportunities response with journey stage data
    const opportunities = (memberDeals || []).map(membership => {
      const deal = membership.deals as any
      if (!deal) return null

      const membershipInvestorId = membership.investor_id || investorId
      const selectedCycle = selectedCycleMap[`${membershipInvestorId}:${membership.deal_id}`] || null
      const subscription = selectedCycle?.id ? subscriptionByCycleId[selectedCycle.id] || null : null
      const dataRoomAccess = dataRoomAccessMap[`${membership.deal_id}:${membershipInvestorId}`]

      const currentStage = selectedCycle
        ? getCycleStage({
            ...selectedCycle,
            pack_generated_at: subscription?.pack_generated_at || selectedCycle.pack_generated_at,
            pack_sent_at: subscription?.pack_sent_at || selectedCycle.pack_sent_at,
            signed_at: subscription?.signed_at || selectedCycle.signed_at,
            funded_at: subscription?.funded_at || selectedCycle.funded_at,
            activated_at: subscription?.activated_at || selectedCycle.activated_at,
          })
        : (() => {
            if (subscription?.activated_at) return 10
            if (subscription?.funded_at) return 9
            if (subscription?.signed_at) return 8
            if (subscription?.pack_sent_at) return 7
            if (subscription?.pack_generated_at) return 6
            if (membership.data_room_granted_at) return 5
            if (membership.nda_signed_at) return 4
            if (membership.interest_confirmed_at) return 3
            if (membership.viewed_at) return 2
            if (membership.dispatched_at) return 1
            return 0
          })()

      return {
        id: deal.id,
        name: deal.name,
        description: deal.description,
        status: deal.status,
        deal_type: deal.deal_type,
        currency: deal.currency || 'USD',
        minimum_investment: deal.minimum_investment,
        maximum_investment: deal.maximum_investment,
        target_amount: deal.target_amount,
        raised_amount: deal.raised_amount,
        open_at: deal.open_at,
        close_at: deal.close_at,
        company_name: deal.company_name,
        company_logo_url: deal.company_logo_url,
        sector: deal.sector,
        stage: deal.stage,
        location: deal.location,
        vehicle: deal.vehicles,
        // Journey progress
        journey: {
          current_stage: currentStage,
          stages: {
            received: selectedCycle?.dispatched_at || membership.dispatched_at,
            viewed: selectedCycle?.viewed_at || membership.viewed_at,
            interest_confirmed: selectedCycle?.interest_confirmed_at || membership.interest_confirmed_at,
            nda_signed: membership.nda_signed_at,
            data_room_access: membership.data_room_granted_at,
            pack_generated: subscription?.pack_generated_at || selectedCycle?.pack_generated_at || null,
            pack_sent: subscription?.pack_sent_at || selectedCycle?.pack_sent_at || null,
            signed: subscription?.signed_at || selectedCycle?.signed_at || null,
            funded: subscription?.funded_at || selectedCycle?.funded_at || null,
            active: subscription?.activated_at || selectedCycle?.activated_at || null
          }
        },
        // Data room access
        data_room_access: dataRoomAccess ? {
          has_access: true,
          granted_at: dataRoomAccess.granted_at,
          expires_at: dataRoomAccess.expires_at
        } : {
          has_access: false,
          granted_at: null,
          expires_at: null
        },
        // Subscription status
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          commitment: subscription.commitment,
          is_signed: !!subscription.signed_at,
          is_funded: !!subscription.funded_at,
          is_active: !!subscription.activated_at
        } : null
      }
    }).filter(Boolean)

    return NextResponse.json({ opportunities })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/opportunities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
