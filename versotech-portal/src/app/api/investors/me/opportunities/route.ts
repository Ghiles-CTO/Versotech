import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Get subscription status for each deal's vehicle
    const vehicleIds = (memberDeals || [])
      .map(m => (m.deals as any)?.vehicles?.id)
      .filter(Boolean)

    let subscriptionMap: Record<string, any> = {}
    if (vehicleIds.length > 0) {
      const { data: subscriptions } = await serviceSupabase
        .from('subscriptions')
        .select(`
          id,
          vehicle_id,
          investor_id,
          status,
          commitment,
          pack_generated_at,
          pack_sent_at,
          signed_at,
          funded_at,
          activated_at
        `)
        .in('investor_id', investorIdsForLookup)
        .in('vehicle_id', vehicleIds)

      if (subscriptions) {
        subscriptionMap = subscriptions.reduce((acc, sub) => {
          if (sub.investor_id && sub.vehicle_id) {
            acc[`${sub.investor_id}:${sub.vehicle_id}`] = sub
          }
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Build opportunities response with journey stage data
    const opportunities = (memberDeals || []).map(membership => {
      const deal = membership.deals as any
      if (!deal) return null

      const vehicleId = deal.vehicles?.id
      const membershipInvestorId = membership.investor_id || investorId
      const subscription = vehicleId ? subscriptionMap[`${membershipInvestorId}:${vehicleId}`] : null
      const dataRoomAccess = dataRoomAccessMap[`${membership.deal_id}:${membershipInvestorId}`]

      // Calculate current journey stage (1-10)
      let currentStage = 0
      if (subscription?.activated_at) currentStage = 10
      else if (subscription?.funded_at) currentStage = 9
      else if (subscription?.signed_at) currentStage = 8
      else if (subscription?.pack_sent_at) currentStage = 7
      else if (subscription?.pack_generated_at) currentStage = 6
      else if (membership.data_room_granted_at) currentStage = 5
      else if (membership.nda_signed_at) currentStage = 4
      else if (membership.interest_confirmed_at) currentStage = 3
      else if (membership.viewed_at) currentStage = 2
      else if (membership.dispatched_at) currentStage = 1

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
            received: membership.dispatched_at,
            viewed: membership.viewed_at,
            interest_confirmed: membership.interest_confirmed_at,
            nda_signed: membership.nda_signed_at,
            data_room_access: membership.data_room_granted_at,
            pack_generated: subscription?.pack_generated_at || null,
            pack_sent: subscription?.pack_sent_at || null,
            signed: subscription?.signed_at || null,
            funded: subscription?.funded_at || null,
            active: subscription?.activated_at || null
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
