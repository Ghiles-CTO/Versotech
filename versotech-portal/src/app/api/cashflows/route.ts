import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createCashflowSchema = z.object({
  investor_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  type: z.enum(['call', 'distribution']),
  amount: z.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ref_id: z.string().uuid().optional()
})

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
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Determine investor IDs based on role
    let investorIds: string[] = []

    if (profile.role === 'investor') {
      // Get investor entities linked to this user
      const { data: investorLinks } = await supabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)

      investorIds = investorLinks?.map(link => link.investor_id) || []
    } else if (['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
      // Staff can view cashflows for a specific investor or vehicle via query params
      const investorId = searchParams.get('investor_id')

      if (investorId) {
        investorIds = [investorId]
      }
      // If no investor_id specified, staff will get empty results (intentional)
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (investorIds.length === 0) {
      return NextResponse.json({
        cashflows: [],
        summary: {
          totalCalls: 0,
          totalDistributions: 0,
          netCashflow: 0
        }
      })
    }

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

export async function POST(request: Request) {
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

    if (!profile || !['staff_admin', 'staff_ops', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCashflowSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name, display_name')
      .eq('id', data.investor_id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      )
    }

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name')
      .eq('id', data.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // If ref_id is provided, verify it exists
    if (data.ref_id) {
      const refTable = data.type === 'call' ? 'capital_calls' : 'distributions'
      const { data: refRecord, error: refError } = await supabase
        .from(refTable)
        .select('id')
        .eq('id', data.ref_id)
        .single()

      if (refError || !refRecord) {
        return NextResponse.json(
          { error: `Referenced ${refTable.slice(0, -1)} not found` },
          { status: 404 }
        )
      }
    }

    // Create cashflow
    const { data: cashflow, error: insertError } = await supabase
      .from('cashflows')
      .insert({
        investor_id: data.investor_id,
        vehicle_id: data.vehicle_id,
        type: data.type,
        amount: data.amount,
        date: data.date,
        ref_id: data.ref_id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Cashflow creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create cashflow' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'cashflows',
      entity_id: cashflow.id,
      metadata: {
        investor_id: data.investor_id,
        investor_name: investor.display_name || investor.legal_name,
        vehicle_id: data.vehicle_id,
        vehicle_name: vehicle.name,
        type: data.type,
        amount: data.amount,
        date: data.date,
        ref_id: data.ref_id
      }
    })

    return NextResponse.json({
      success: true,
      cashflow: {
        id: cashflow.id,
        investorId: cashflow.investor_id,
        investorName: investor.display_name || investor.legal_name,
        vehicleId: cashflow.vehicle_id,
        vehicleName: vehicle.name,
        type: cashflow.type,
        amount: cashflow.amount,
        date: cashflow.date,
        refId: cashflow.ref_id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Cashflows API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
