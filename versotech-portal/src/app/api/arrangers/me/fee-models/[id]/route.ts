/**
 * Individual Arranger Fee Model API Routes
 * GET /api/arrangers/me/fee-models/[id] - Get fee plan details
 * PATCH /api/arrangers/me/fee-models/[id] - Update fee plan
 * DELETE /api/arrangers/me/fee-models/[id] - Archive fee plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateFeePlanSchema } from '@/lib/fees/validation'

/**
 * GET /api/arrangers/me/fee-models/[id]
 * Get a single fee plan with its components
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
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

    // Fetch fee plan with components
    const { data: feePlan, error } = await serviceSupabase
      .from('fee_plans')
      .select(`
        *,
        components:fee_components(*),
        deal:deal_id (
          id,
          name
        ),
        partner:partner_id (
          id,
          display_name,
          legal_name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
      }
      console.error('Error fetching fee plan:', error)
      return NextResponse.json({ error: 'Failed to fetch fee plan' }, { status: 500 })
    }

    // Verify arranger has access to this fee plan
    // Fee plan is accessible if: created_by_arranger_id matches OR deal is managed by arranger
    let hasAccess = feePlan.created_by_arranger_id === arrangerId

    if (!hasAccess && feePlan.deal_id) {
      const { data: deal } = await serviceSupabase
        .from('deals')
        .select('arranger_entity_id')
        .eq('id', feePlan.deal_id)
        .single()

      hasAccess = deal?.arranger_entity_id === arrangerId
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this fee plan' }, { status: 403 })
    }

    return NextResponse.json({ data: feePlan })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/fee-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/arrangers/me/fee-models/[id]
 * Update a fee plan (and optionally its components)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
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

    // Verify fee plan exists and arranger has access
    const { data: existingPlan, error: fetchError } = await serviceSupabase
      .from('fee_plans')
      .select('id, created_by_arranger_id, deal_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    // Only the arranger who created it can update
    if (existingPlan.created_by_arranger_id !== arrangerId) {
      return NextResponse.json({ error: 'Only the creator can update this fee plan' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateFeePlanSchema.safeParse(body)

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

    // Update fee plan
    const { data: updatedPlan, error: planError } = await serviceSupabase
      .from('fee_plans')
      .update({
        ...feePlanData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (planError) {
      console.error('Error updating fee plan:', planError)
      return NextResponse.json({ error: 'Failed to update fee plan' }, { status: 500 })
    }

    // If components are provided, update them
    let updatedComponents = null
    if (components && components.length > 0) {
      // Delete existing components
      await serviceSupabase.from('fee_components').delete().eq('fee_plan_id', id)

      // Insert new components
      const componentInserts = components.map((component: any) => ({
        ...component,
        fee_plan_id: id,
      }))

      const { data: newComponents, error: componentsError } = await serviceSupabase
        .from('fee_components')
        .insert(componentInserts)
        .select()

      if (componentsError) {
        console.error('Error updating fee components:', componentsError)
        return NextResponse.json(
          {
            error: 'Failed to update fee components',
            details: componentsError.message,
          },
          { status: 500 }
        )
      }

      updatedComponents = newComponents
    }

    // Fetch current components if not updated
    if (!updatedComponents) {
      const { data: currentComponents } = await serviceSupabase
        .from('fee_components')
        .select('*')
        .eq('fee_plan_id', id)

      updatedComponents = currentComponents
    }

    return NextResponse.json({
      data: {
        ...updatedPlan,
        components: updatedComponents,
      },
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/arrangers/me/fee-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/arrangers/me/fee-models/[id]
 * Archive a fee plan (soft delete by setting is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
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

    // Verify fee plan exists and arranger has access
    const { data: existingPlan, error: fetchError } = await serviceSupabase
      .from('fee_plans')
      .select('id, created_by_arranger_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    // Only the arranger who created it can delete
    if (existingPlan.created_by_arranger_id !== arrangerId) {
      return NextResponse.json({ error: 'Only the creator can delete this fee plan' }, { status: 403 })
    }

    // Soft delete by setting is_active to false
    const { error } = await serviceSupabase
      .from('fee_plans')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error archiving fee plan:', error)
      return NextResponse.json({ error: 'Failed to archive fee plan' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Fee plan archived successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/arrangers/me/fee-models/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
