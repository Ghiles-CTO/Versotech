import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
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
        feesByVehicle: [],
        feesByDeal: [],
        summary: {
          totalAccrued: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          pendingAmount: 0
        }
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)
    const vehicleId = searchParams.get('vehicle_id')
    const dealId = searchParams.get('deal_id')

    // Get fee events - try both vehicle-based and deal-based fees
    const [vehicleFeesResponse, dealFeesResponse] = await Promise.allSettled([
      // Vehicle-based fees (traditional subscription/management fees)
      supabase
        .from('fee_events')
        .select(`
          *,
          fee_components (
            id,
            kind,
            calc_method,
            rate_bps,
            frequency,
            fee_plans (
              name,
              description
            )
          ),
          vehicles (
            id,
            name,
            type
          )
        `)
        .in('investor_id', investorIds)
        .not('vehicle_id', 'is', null)
        .eq('vehicle_id', vehicleId || null)
        .order('event_date', { ascending: false }),

      // Deal-based fees (spread, allocation fees)
      supabase
        .from('fee_events')
        .select(`
          *,
          fee_components (
            id,
            kind,
            calc_method,
            rate_bps,
            frequency,
            fee_plans (
              name,
              description
            )
          ),
          deals (
            id,
            name,
            deal_type
          )
        `)
        .in('investor_id', investorIds)
        .not('deal_id', 'is', null)
        .eq('deal_id', dealId || null)
        .order('event_date', { ascending: false })
    ])

    const vehicleFees = vehicleFeesResponse.status === 'fulfilled' ? vehicleFeesResponse.value.data || [] : []
    const dealFees = dealFeesResponse.status === 'fulfilled' ? dealFeesResponse.value.data || [] : []

    // If no fee events found, create mock data based on positions and allocations
    let mockVehicleFees: any[] = []
    let mockDealFees: any[] = []

    if (vehicleFees.length === 0 && dealFees.length === 0) {
      console.log('No fee events found, generating estimates based on positions')
      
      // Get positions for fee estimates
      const { data: positions } = await supabase
        .from('positions')
        .select(`
          *,
          vehicles (id, name, type),
          subscriptions (commitment, status)
        `)
        .in('investor_id', investorIds)

      if (positions) {
        mockVehicleFees = positions.map((position: any) => ({
          id: `mock_${position.id}`,
          vehicle_id: position.vehicle_id,
          fee_component: {
            kind: 'subscription',
            calc_method: 'fixed',
            rate_bps: 0,
            frequency: 'one_time',
            fee_plans: { name: 'Standard Plan', description: 'Standard subscription fees' }
          },
          computed_amount: Math.round((position.cost_basis || 0) * 0.01), // 1% estimate
          currency: 'USD',
          status: 'estimated',
          event_date: position.as_of_date || new Date().toISOString().split('T')[0],
          vehicles: position.vehicles
        }))
      }

      // Get allocations for deal fee estimates
      const { data: allocations } = await supabase
        .from('allocations')
        .select(`
          *,
          deals (id, name, deal_type)
        `)
        .in('investor_id', investorIds)

      if (allocations) {
        mockDealFees = allocations.map((allocation: any) => ({
          id: `mock_deal_${allocation.id}`,
          deal_id: allocation.deal_id,
          fee_component: {
            kind: 'spread',
            calc_method: 'per_unit_spread',
            rate_bps: 0,
            frequency: 'one_time',
            fee_plans: { name: 'Deal Plan', description: 'Deal-specific fees' }
          },
          computed_amount: Math.round((allocation.units * allocation.unit_price) * 0.005), // 0.5% estimate
          currency: 'USD',
          status: 'estimated',
          event_date: allocation.approved_at || new Date().toISOString().split('T')[0],
          deals: allocation.deals
        }))
      }
    }

    // Combine actual and mock data
    const allVehicleFees = [...vehicleFees, ...mockVehicleFees]
    const allDealFees = [...dealFees, ...mockDealFees]

    // Process fees by vehicle
    const feesByVehicle = allVehicleFees.reduce((acc: any, fee: any) => {
      const vehicleId = fee.vehicle_id
      if (!acc[vehicleId]) {
        acc[vehicleId] = {
          vehicleId,
          vehicleName: fee.vehicles?.name || 'Unknown Vehicle',
          vehicleType: fee.vehicles?.type || 'fund',
          fees: []
        }
      }
      acc[vehicleId].fees.push({
        id: fee.id,
        type: fee.fee_component?.kind || fee.fee_components?.kind || 'subscription',
        amount: parseFloat(fee.computed_amount) || 0,
        status: fee.status,
        eventDate: fee.event_date,
        frequency: fee.fee_component?.frequency || fee.fee_components?.frequency || 'one_time',
        description: fee.fee_component?.fee_plans?.name || fee.fee_components?.fee_plans?.name || 'Standard Fee'
      })
      return acc
    }, {})

    // Process fees by deal
    const feesByDeal = allDealFees.reduce((acc: any, fee: any) => {
      const dealId = fee.deal_id
      if (!acc[dealId]) {
        acc[dealId] = {
          dealId,
          dealName: fee.deals?.name || 'Unknown Deal',
          dealType: fee.deals?.deal_type || 'equity_secondary',
          fees: []
        }
      }
      acc[dealId].fees.push({
        id: fee.id,
        type: fee.fee_component?.kind || fee.fee_components?.kind || 'spread',
        amount: parseFloat(fee.computed_amount) || 0,
        status: fee.status,
        eventDate: fee.event_date,
        frequency: fee.fee_component?.frequency || fee.fee_components?.frequency || 'one_time',
        description: fee.fee_component?.fee_plans?.name || fee.fee_components?.fee_plans?.name || 'Deal Fee'
      })
      return acc
    }, {})

    // Calculate summary
    const allFees = [...allVehicleFees, ...allDealFees]
    const summary = {
      totalAccrued: allFees.filter(f => f.status === 'accrued').reduce((sum, f) => sum + (parseFloat(f.computed_amount) || 0), 0),
      totalInvoiced: allFees.filter(f => f.status === 'invoiced').reduce((sum, f) => sum + (parseFloat(f.computed_amount) || 0), 0),
      totalPaid: allFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (parseFloat(f.computed_amount) || 0), 0),
      pendingAmount: allFees.filter(f => ['accrued', 'invoiced'].includes(f.status)).reduce((sum, f) => sum + (parseFloat(f.computed_amount) || 0), 0)
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'fee_events',
      entity_id: user.id,
      metadata: {
        vehicle_id: vehicleId,
        deal_id: dealId,
        result_count: allFees.length
      }
    })

    return NextResponse.json({
      feesByVehicle: Object.values(feesByVehicle),
      feesByDeal: Object.values(feesByDeal),
      summary
    })

  } catch (error) {
    console.error('Fees API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
