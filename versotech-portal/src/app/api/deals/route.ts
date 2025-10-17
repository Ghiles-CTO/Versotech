import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'

// Validation schema for creating deals
const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  vehicle_id: z.string().uuid().optional().nullable(),
  deal_type: z.enum(['equity_secondary', 'equity_primary', 'credit_trade_finance', 'other']).default('equity_secondary'),
  currency: z.string().default('USD'),
  company_logo_url: z.string().url('Company logo is required'),
  offer_unit_price: z.number().optional().nullable(),
  terms_schema: z.any().optional(),
  open_at: z.string().optional().nullable(),
  close_at: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  investment_thesis: z.string().optional().nullable(),
  minimum_investment: z.number().optional().nullable(),
  maximum_investment: z.number().optional().nullable(),
  target_amount: z.number().optional().nullable(),
  sector: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  location: z.string().optional().nullable()
}).transform((data) => {
  // Convert datetime-local format to ISO timestamps for database
  return {
    ...data,
    open_at: data.open_at ? new Date(data.open_at).toISOString() : null,
    close_at: data.close_at ? new Date(data.close_at).toISOString() : null
  }
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
    console.log('[API /deals POST] Starting deal creation...')
    const supabase = createServiceClient()
    
    // Get authenticated user (works with both real auth and demo mode)
    const regularSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)
    
    console.log('[API /deals POST] User:', user?.email, 'Role:', user?.user_metadata?.role)
    
    if (authError || !user) {
      console.error('[API /deals POST] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (works with both real auth and demo mode)
    const isStaff = await isStaffUser(supabase, user)
    console.log('[API /deals POST] Is staff:', isStaff)
    
    if (!isStaff) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('[API /deals POST] Request body:', body)
    
    const validatedData = createDealSchema.parse(body)
    console.log('[API /deals POST] Validated data:', validatedData)

    // Get a valid UUID for created_by
    // For demo mode, use a real staff profile ID since demo IDs are not valid UUIDs
    let createdBy = user.id
    if (user.id && user.id.startsWith('demo-')) {
      let staffProfileId: string | undefined

      if (user.email) {
        const { data: profileByEmail, error: profileByEmailError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .limit(1)

        if (profileByEmailError) {
          console.error('[API /deals POST] Failed to lookup profile by email:', profileByEmailError)
        }

        staffProfileId = profileByEmail?.[0]?.id
      }

      if (!staffProfileId) {
        const { data: fallbackProfiles, error: fallbackError } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['staff_admin', 'staff_ops', 'staff_rm'])
          .order('created_at', { ascending: true })
          .limit(1)

        if (fallbackError) {
          console.error('[API /deals POST] Failed to find fallback staff profile:', fallbackError)
        }

        staffProfileId = fallbackProfiles?.[0]?.id
      }

      if (!staffProfileId) {
        console.error('[API /deals POST] No staff profile available for demo fallback user')
        return NextResponse.json(
          { error: 'Staff profile not configured for demo mode' },
          { status: 500 }
        )
      }

      createdBy = staffProfileId
      console.log('[API /deals POST] Using staff profile for demo user:', createdBy)
    }
    
    // Create the deal
    const dealData = {
      ...validatedData,
      created_by: createdBy,
      status: 'draft' // Always start as draft
    }
    
    console.log('[API /deals POST] Inserting deal:', dealData)
    
    const { data: deal, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select()
      .single()

    if (error) {
      console.error('[API /deals POST] Deal creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create deal', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('[API /deals POST] Deal created:', deal.id)

    // Create initial deal membership for the creator
    await supabase
      .from('deal_memberships')
      .insert({
        deal_id: deal.id,
        user_id: createdBy,
        role: 'verso_staff',
        invited_by: createdBy,
        accepted_at: new Date().toISOString()
      })

    // Log creation
    await auditLogger.log({
      actor_user_id: createdBy,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: deal.id,
      metadata: {
        endpoint: '/api/deals',
        deal_name: deal.name,
        deal_type: deal.deal_type,
        vehicle_id: deal.vehicle_id,
        demo_user: user.user_metadata?.role ? user.email : undefined
      }
    })

    return NextResponse.json({ deal }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API /deals POST] Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('[API /deals POST] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

