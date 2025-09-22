import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    // Get investor entities linked to this user
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({
        kpis: {
          currentNAV: 0,
          totalContributed: 0,
          totalDistributions: 0,
          unfundedCommitment: 0,
          unrealizedGain: 0,
          unrealizedGainPct: 0
        },
        hasData: false
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Get all positions for the investor
    const { data: positions } = await supabase
      .from('positions')
      .select(`
        *,
        vehicles (
          id,
          name,
          currency
        )
      `)
      .in('investor_id', investorIds)

    // Get all subscriptions (commitments)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('commitment, currency')
      .in('investor_id', investorIds)
      .eq('status', 'active')

    // Get all cash flows (contributions and distributions)
    const { data: cashflows } = await supabase
      .from('cashflows')
      .select('type, amount, date')
      .in('investor_id', investorIds)

    // Calculate KPIs
    let currentNAV = 0
    let totalContributed = 0
    let totalDistributions = 0
    let unfundedCommitment = 0
    let totalCostBasis = 0

    // Sum up current NAV from positions
    if (positions) {
      currentNAV = positions.reduce((sum, pos) => {
        const navValue = pos.units * pos.last_nav || 0
        return sum + navValue
      }, 0)

      totalCostBasis = positions.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0)
    }

    // Sum up commitments
    if (subscriptions) {
      const totalCommitment = subscriptions.reduce((sum, sub) => sum + (sub.commitment || 0), 0)
      unfundedCommitment = totalCommitment
    }

    // Sum up cash flows
    if (cashflows) {
      totalContributed = cashflows
        .filter(cf => cf.type === 'call')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0)

      totalDistributions = cashflows
        .filter(cf => cf.type === 'distribution')
        .reduce((sum, cf) => sum + (cf.amount || 0), 0)

      unfundedCommitment = unfundedCommitment - totalContributed
    }

    const unrealizedGain = currentNAV - totalCostBasis
    const unrealizedGainPct = totalCostBasis > 0 ? (unrealizedGain / totalCostBasis) * 100 : 0

    // Log portfolio access for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'portfolio_data',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/portfolio',
        current_nav: currentNAV,
        position_count: positions?.length || 0,
        vehicle_count: investorIds.length
      }
    })

    return NextResponse.json({
      kpis: {
        currentNAV: Math.round(currentNAV),
        totalContributed: Math.round(totalContributed),
        totalDistributions: Math.round(totalDistributions),
        unfundedCommitment: Math.round(Math.max(0, unfundedCommitment)),
        unrealizedGain: Math.round(unrealizedGain),
        unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100
      },
      hasData: true,
      summary: {
        totalVehicles: positions?.length || 0,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}