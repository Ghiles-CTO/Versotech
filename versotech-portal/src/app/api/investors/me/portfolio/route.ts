import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/investors/me/portfolio
 * Fetch the investor's portfolio with all subscriptions and their status
 * Per Phase 3 rules: distinguishes between active, funded, and pending investments
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

    // Fetch all subscriptions with vehicle and deal info
    const { data: subscriptions, error: subscriptionsError } = await serviceSupabase
      .from('subscriptions')
      .select(`
        id,
        vehicle_id,
        investor_id,
        status,
        commitment,
        funded_amount,
        subscription_date,
        pack_generated_at,
        pack_sent_at,
        signed_at,
        funded_at,
        activated_at,
        created_at,
        vehicles (
          id,
          name,
          type,
          currency,
          deals (
            id,
            name,
            company_logo_url,
            sector
          )
        )
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError)
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }

    // Get positions for NAV values
    const { data: positions } = await serviceSupabase
      .from('positions')
      .select('vehicle_id, last_nav, units')
      .eq('investor_id', investorId)

    const navMap = (positions || []).reduce((acc, pos) => {
      acc[pos.vehicle_id] = pos.last_nav || 0
      return acc
    }, {} as Record<string, number>)

    // Build investments response
    const investments = (subscriptions || []).map(sub => {
      const vehicle = sub.vehicles as any
      const deals = vehicle?.deals as any[] || []
      const deal = deals[0] // Get first associated deal

      return {
        id: sub.id,
        vehicle_id: sub.vehicle_id,
        vehicle_name: vehicle?.name || 'Unknown Vehicle',
        vehicle_type: vehicle?.type || 'unknown',
        deal_id: deal?.id || null,
        deal_name: deal?.name || null,
        status: sub.status,
        commitment: sub.commitment,
        funded_amount: sub.funded_amount,
        current_nav: navMap[sub.vehicle_id] || null,
        currency: vehicle?.currency || 'USD',
        pack_generated_at: sub.pack_generated_at,
        pack_sent_at: sub.pack_sent_at,
        signed_at: sub.signed_at,
        funded_at: sub.funded_at,
        activated_at: sub.activated_at,
        subscription_date: sub.subscription_date,
        company_logo_url: deal?.company_logo_url || null
      }
    })

    // Calculate summary stats (active investments only per Phase 3 rules)
    const activeInvestments = investments.filter(i => i.activated_at)
    const summary = {
      total_investments: investments.length,
      active_investments: activeInvestments.length,
      funded_investments: investments.filter(i => i.funded_at && !i.activated_at).length,
      pending_investments: investments.filter(i => !i.funded_at).length,
      total_commitment: activeInvestments.reduce((sum, i) => sum + (i.commitment || 0), 0),
      total_funded: activeInvestments.reduce((sum, i) => sum + (i.funded_amount || 0), 0),
      total_nav: activeInvestments.reduce((sum, i) => sum + (i.current_nav || 0), 0)
    }

    return NextResponse.json({
      investments,
      summary
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
