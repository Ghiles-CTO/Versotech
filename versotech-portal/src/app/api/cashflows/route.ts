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
        cashflows: [],
        summary: {
          totalCalls: 0,
          totalDistributions: 0,
          netCashflow: 0
        }
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Parse query parameters
    const vehicleId = searchParams.get('vehicle_id')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('cashflows')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          currency
        )
      `)
      .in('investor_id', investorIds)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    if (fromDate) {
      query = query.gte('date', fromDate)
    }

    if (toDate) {
      query = query.lte('date', toDate)
    }

    const { data: cashflows, error: cashflowsError } = await query

    if (cashflowsError) {
      console.error('Cashflows query error:', cashflowsError)
      return NextResponse.json(
        { error: 'Failed to fetch cashflows' },
        { status: 500 }
      )
    }

    // Calculate summary
    const summary = {
      totalCalls: 0,
      totalDistributions: 0,
      netCashflow: 0
    }

    if (cashflows) {
      for (const cf of cashflows) {
        if (cf.type === 'call') {
          summary.totalCalls += cf.amount || 0
        } else if (cf.type === 'distribution') {
          summary.totalDistributions += cf.amount || 0
        }
      }
      summary.netCashflow = summary.totalDistributions - summary.totalCalls
    }

    // Format response
    const formattedCashflows = cashflows?.map(cf => ({
      id: cf.id,
      vehicleId: cf.vehicle_id,
      vehicleName: cf.vehicles?.name,
      vehicleType: cf.vehicles?.type,
      type: cf.type,
      amount: cf.amount,
      date: cf.date,
      reference: cf.ref_id,
      currency: cf.vehicles?.currency || 'USD',
      description: cf.type === 'call' ? 'Capital Call' : 'Distribution'
    })) || []

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'cashflows',
      entity_id: user.id,
      metadata: {
        vehicle_id: vehicleId,
        from_date: fromDate,
        to_date: toDate,
        result_count: formattedCashflows.length
      }
    })

    return NextResponse.json({
      cashflows: formattedCashflows,
      summary,
      pagination: {
        limit,
        offset,
        hasMore: formattedCashflows.length === limit
      }
    })

  } catch (error) {
    console.error('Cashflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
