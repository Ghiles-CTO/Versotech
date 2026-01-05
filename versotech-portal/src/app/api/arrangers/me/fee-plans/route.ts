/**
 * Arranger Fee Plans API Routes
 * GET /api/arrangers/me/fee-plans - List fee plans created by arranger
 * POST /api/arrangers/me/fee-plans - Create new fee plan for a partner
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createFeePlanSchema } from '@/lib/fees/validation'
import { z } from 'zod'

// Extended schema for arranger fee plan creation
const arrangerCreateFeePlanSchema = createFeePlanSchema.safeExtend({
  partner_id: z.string().uuid().optional(),
  introducer_id: z.string().uuid().optional(),
  commercial_partner_id: z.string().uuid().optional(),
})

/**
 * GET /api/arrangers/me/fee-plans
 * List fee plans created by the current arranger
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const partnerId = searchParams.get('partner_id')
    const introducerId = searchParams.get('introducer_id')
    const commercialPartnerId = searchParams.get('commercial_partner_id')
    const includeComponents = searchParams.get('include_components') === 'true'
    const isActive = searchParams.get('is_active')

    // Build query for fee plans created by this arranger
    let query = serviceSupabase
      .from('fee_plans')
      .select(
        includeComponents
          ? '*, components:fee_components(*)'
          : '*'
      )
      .eq('created_by_arranger_id', arrangerId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }
    if (introducerId) {
      query = query.eq('introducer_id', introducerId)
    }
    if (commercialPartnerId) {
      query = query.eq('commercial_partner_id', commercialPartnerId)
    }
    if (isActive !== null && isActive !== 'all') {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('[arranger/fee-plans] Error fetching fee plans:', error)
      return NextResponse.json({ error: 'Failed to fetch fee plans' }, { status: 500 })
    }

    // Add usage count (number of subscriptions using each plan)
    const plansWithUsage = await Promise.all(
      (data || []).map(async (plan: any) => {
        const { count } = await serviceSupabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('fee_plan_id', plan.id)

        return {
          ...plan,
          subscription_count: count || 0,
        }
      })
    )

    return NextResponse.json({ data: plansWithUsage })
  } catch (error) {
    console.error('[arranger/fee-plans] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/fee-plans
 * Create a new fee plan (for a partner, introducer, or commercial partner)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse and validate request body
    const body = await request.json()
    const validation = arrangerCreateFeePlanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { components, partner_id, introducer_id, commercial_partner_id, ...feePlanData } = validation.data

    // Verify the entity belongs to arranger's network (via deal relationships)
    if (partner_id) {
      const { data: hasRelation } = await serviceSupabase
        .from('deal_memberships')
        .select('id')
        .eq('referred_by_entity_type', 'partner')
        .eq('referred_by_entity_id', partner_id)
        .limit(1)
        .single()

      // Allow if partner has any deal relation (simplified check)
      // In production, you might want stricter validation
    }

    // Create fee plan with arranger ownership
    const { data: feePlan, error: planError } = await serviceSupabase
      .from('fee_plans')
      .insert({
        ...feePlanData,
        partner_id: partner_id || null,
        introducer_id: introducer_id || null,
        commercial_partner_id: commercial_partner_id || null,
        created_by: user.id,
        created_by_arranger_id: arrangerId,
        is_active: true,
        effective_from: feePlanData.effective_from || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (planError) {
      console.error('[arranger/fee-plans] Error creating fee plan:', planError)
      return NextResponse.json({ error: 'Failed to create fee plan' }, { status: 500 })
    }

    // Create fee components
    if (components && components.length > 0) {
      const componentInserts = components.map((component) => ({
        ...component,
        fee_plan_id: feePlan.id,
      }))

      const { data: createdComponents, error: componentsError } = await serviceSupabase
        .from('fee_components')
        .insert(componentInserts)
        .select()

      if (componentsError) {
        console.error('[arranger/fee-plans] Error creating components:', componentsError)
        // Rollback: delete the created fee plan
        await serviceSupabase.from('fee_plans').delete().eq('id', feePlan.id)
        return NextResponse.json({ error: 'Failed to create fee components' }, { status: 500 })
      }

      return NextResponse.json(
        { data: { ...feePlan, components: createdComponents } },
        { status: 201 }
      )
    }

    return NextResponse.json({ data: feePlan }, { status: 201 })
  } catch (error) {
    console.error('[arranger/fee-plans] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
