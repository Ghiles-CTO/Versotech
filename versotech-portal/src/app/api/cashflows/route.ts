import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
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

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const vehicleId = searchParams.get('vehicle_id')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const type = searchParams.get('type') // 'call' or 'distribution'

    let query = supabase
      .from('cashflows')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          currency
        ),
        investors (
          legal_name
        )
      `)

    // For investors, only show their own cashflows
    if (profile.role === 'investor') {
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
            netCashflow: 0,
            count: 0
          },
          hasData: false
        })
      }

      const investorIds = investorLinks.map(link => link.investor_id)
      query = query.in('investor_id', investorIds)
    }

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

    if (type) {
      query = query.eq('type', type)
    }

    const { data: cashflows, error } = await query
      .order('date', { ascending: false })

    if (error) {
      console.error('Cashflows fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cashflows' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const summary = {
      totalCalls: cashflows?.filter(cf => cf.type === 'call').reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0,
      totalDistributions: cashflows?.filter(cf => cf.type === 'distribution').reduce((sum, cf) => sum + (cf.amount || 0), 0) || 0,
      count: cashflows?.length || 0
    }
    
    summary.netCashflow = summary.totalDistributions - summary.totalCalls

    // Group by vehicle for summary
    const byVehicle = cashflows?.reduce((acc, cf) => {
      const vehicleName = cf.vehicles?.name || 'Unknown Vehicle'
      if (!acc[vehicleName]) {
        acc[vehicleName] = {
          vehicle: cf.vehicles,
          totalCalls: 0,
          totalDistributions: 0,
          count: 0
        }
      }
      
      if (cf.type === 'call') {
        acc[vehicleName].totalCalls += cf.amount || 0
      } else if (cf.type === 'distribution') {
        acc[vehicleName].totalDistributions += cf.amount || 0
      }
      
      acc[vehicleName].count++
      return acc
    }, {} as Record<string, any>) || {}

    // Group by month for timeline
    const byMonth = cashflows?.reduce((acc, cf) => {
      const monthKey = new Date(cf.date).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          calls: 0,
          distributions: 0,
          netFlow: 0
        }
      }
      
      if (cf.type === 'call') {
        acc[monthKey].calls += cf.amount || 0
      } else if (cf.type === 'distribution') {
        acc[monthKey].distributions += cf.amount || 0
      }
      
      acc[monthKey].netFlow = acc[monthKey].distributions - acc[monthKey].calls
      return acc
    }, {} as Record<string, any>) || {}

    // Convert to arrays and sort
    const vehicleSummary = Object.values(byVehicle)
    const timelineSummary = Object.values(byMonth).sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    )

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'cashflows',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/cashflows',
        role: profile.role,
        cashflow_count: cashflows?.length || 0,
        filters: { vehicle_id: vehicleId, from: fromDate, to: toDate, type },
        summary
      }
    })

    return NextResponse.json({
      cashflows: cashflows || [],
      summary,
      byVehicle: vehicleSummary,
      timeline: timelineSummary,
      hasData: (cashflows && cashflows.length > 0)
    })

  } catch (error) {
    console.error('Cashflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
