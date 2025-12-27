/**
 * Arranger Fee Models API Routes
 * GET /api/arrangers/me/fee-models - List fee models for current arranger
 * POST /api/arrangers/me/fee-models - Create new fee model for arranger
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeePlanSchema } from '@/lib/fees/validation'

/**
 * GET /api/arrangers/me/fee-models
 * Returns fee models assigned to the current arranger or deals they manage.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError) {
      console.error('[arranger-fee-models] Arranger lookup error:', arrangerUserError)
      return NextResponse.json({ error: 'Failed to load arranger profile' }, { status: 500 })
    }

    if (!arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get deals managed by this arranger
    const { data: managedDeals, error: dealsError } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerId)

    if (dealsError) {
      console.error('[arranger-fee-models] Deals lookup error:', dealsError)
      return NextResponse.json({ error: 'Failed to load managed deals' }, { status: 500 })
    }

    const dealIds = (managedDeals || []).map(d => d.id)

    // Query fee plans: created by arranger OR for deals they manage
    let query = serviceSupabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        is_active,
        is_default,
        effective_from,
        effective_until,
        partner_id,
        introducer_id,
        commercial_partner_id,
        created_by_arranger_id,
        deal:deal_id (
          id,
          name
        ),
        partner:partner_id (
          id,
          display_name,
          legal_name
        ),
        fee_components (
          id,
          kind,
          rate_bps,
          flat_amount,
          calc_method,
          frequency
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Build filter conditions
    const conditions: string[] = []
    conditions.push(`created_by_arranger_id.eq.${arrangerId}`)
    if (dealIds.length > 0) {
      conditions.push(`deal_id.in.(${dealIds.join(',')})`)
    }

    query = query.or(conditions.join(','))

    const { data: feePlans, error: feePlansError } = await query

    if (feePlansError) {
      console.error('[arranger-fee-models] Fee plan fetch error:', feePlansError)
      return NextResponse.json({ error: 'Failed to fetch fee models' }, { status: 500 })
    }

    return NextResponse.json({ fee_models: feePlans || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/fee-models:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/fee-models
 * Create a new fee model for the current arranger
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse and validate request body
    const body = await request.json()
    const validation = createFeePlanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { components, ...feePlanData } = validation.data

    // Create fee plan with arranger linkage
    const { data: feePlan, error: planError } = await serviceSupabase
      .from('fee_plans')
      .insert({
        ...feePlanData,
        created_by: user.id,
        created_by_arranger_id: arrangerId,
        is_active: true,
      })
      .select()
      .single()

    if (planError) {
      console.error('Error creating fee plan:', planError)
      return NextResponse.json({ error: 'Failed to create fee plan' }, { status: 500 })
    }

    // Create fee components
    if (components && components.length > 0) {
      const componentInserts = components.map((component: any) => ({
        ...component,
        fee_plan_id: feePlan.id,
      }))

      const { error: componentsError } = await serviceSupabase
        .from('fee_components')
        .insert(componentInserts)

      if (componentsError) {
        console.error('Error creating fee components:', componentsError)
        // Rollback: delete the created fee plan
        await serviceSupabase.from('fee_plans').delete().eq('id', feePlan.id)
        return NextResponse.json({ error: 'Failed to create fee components' }, { status: 500 })
      }
    }

    // Fetch the complete plan with components
    const { data: completePlan } = await serviceSupabase
      .from('fee_plans')
      .select(`
        *,
        fee_components (*)
      `)
      .eq('id', feePlan.id)
      .single()

    return NextResponse.json(
      { data: completePlan },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/arrangers/me/fee-models:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
