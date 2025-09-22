import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating deals
const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  vehicle_id: z.string().uuid().optional(),
  deal_type: z.enum(['equity_secondary', 'equity_primary', 'credit_trade_finance', 'other']).default('equity_secondary'),
  currency: z.string().default('USD'),
  offer_unit_price: z.number().optional(),
  terms_schema: z.record(z.any()).optional(),
  open_at: z.string().datetime().optional(),
  close_at: z.string().datetime().optional()
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

    // Get user profile
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

    let query = supabase
      .from('deals')
      .select(`
        *,
        vehicles (
          id,
          name,
          type,
          currency
        ),
        deal_memberships (
          user_id,
          role,
          invited_at,
          accepted_at
        ),
        _inventory_summary:fn_deal_inventory_summary(id)
      `)

    // Apply filters
    const status = searchParams.get('status')
    const deal_type = searchParams.get('deal_type')
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (deal_type) {
      query = query.eq('deal_type', deal_type)
    }

    const { data: deals, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Deals fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      )
    }

    // Log access
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: 'deals',
      entity_id: user.id,
      metadata: {
        endpoint: '/api/deals',
        role: profile.role,
        deal_count: deals?.length || 0,
        filters: { status, deal_type }
      }
    })

    return NextResponse.json({
      deals: deals || [],
      hasData: (deals && deals.length > 0)
    })

  } catch (error) {
    console.error('API /deals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient() // Use service role for creation
    
    // Get the authenticated user from regular client
    const regularSupabase = await createClient()
    const { data: { user }, error: authError } = await regularSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDealSchema.parse(body)

    // Create the deal
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'draft' // Always start as draft
      })
      .select()
      .single()

    if (error) {
      console.error('Deal creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create deal' },
        { status: 500 }
      )
    }

    // Create initial deal membership for the creator
    await supabase
      .from('deal_memberships')
      .insert({
        deal_id: deal.id,
        user_id: user.id,
        role: 'verso_staff',
        invited_by: user.id,
        accepted_at: new Date().toISOString()
      })

    // Log creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: deal.id,
      metadata: {
        endpoint: '/api/deals',
        deal_name: deal.name,
        deal_type: deal.deal_type,
        vehicle_id: deal.vehicle_id
      }
    })

    return NextResponse.json(deal, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API /deals POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
