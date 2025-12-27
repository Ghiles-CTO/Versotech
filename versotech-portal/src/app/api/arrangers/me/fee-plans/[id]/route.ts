/**
 * Individual Arranger Fee Plan API Routes
 * GET /api/arrangers/me/fee-plans/[id] - Get fee plan details
 * PUT /api/arrangers/me/fee-plans/[id] - Update fee plan
 * DELETE /api/arrangers/me/fee-plans/[id] - Archive fee plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateFeePlanSchema } from '@/lib/fees/validation'

/**
 * GET /api/arrangers/me/fee-plans/[id]
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

    // Fetch fee plan with components - must be owned by this arranger
    const { data: feePlan, error } = await serviceSupabase
      .from('fee_plans')
      .select(`
        *,
        components:fee_components(*)
      `)
      .eq('id', id)
      .eq('created_by_arranger_id', arrangerUser.arranger_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
      }
      console.error('[arranger/fee-plans] Error fetching fee plan:', error)
      return NextResponse.json({ error: 'Failed to fetch fee plan' }, { status: 500 })
    }

    return NextResponse.json({ data: feePlan })
  } catch (error) {
    console.error('[arranger/fee-plans] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/arrangers/me/fee-plans/[id]
 * Update a fee plan (and optionally its components)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify ownership
    const { data: existingPlan, error: fetchError } = await serviceSupabase
      .from('fee_plans')
      .select('id, created_by_arranger_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    if (existingPlan.created_by_arranger_id !== arrangerUser.arranger_id) {
      return NextResponse.json({ error: 'Not authorized to modify this fee plan' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateFeePlanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
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
      console.error('[arranger/fee-plans] Error updating fee plan:', planError)
      return NextResponse.json({ error: 'Failed to update fee plan' }, { status: 500 })
    }

    // If components are provided, update them
    let updatedComponents = null
    if (components && components.length > 0) {
      // Delete existing components
      await serviceSupabase.from('fee_components').delete().eq('fee_plan_id', id)

      // Insert new components
      const componentInserts = components.map((component) => ({
        ...component,
        fee_plan_id: id,
      }))

      const { data: newComponents, error: componentsError } = await serviceSupabase
        .from('fee_components')
        .insert(componentInserts)
        .select()

      if (componentsError) {
        console.error('[arranger/fee-plans] Error updating components:', componentsError)
        return NextResponse.json({
          error: 'Failed to update fee components',
          details: componentsError.message,
        }, { status: 500 })
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
    console.error('[arranger/fee-plans] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/arrangers/me/fee-plans/[id]
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

    // Verify ownership
    const { data: existingPlan, error: fetchError } = await serviceSupabase
      .from('fee_plans')
      .select('id, created_by_arranger_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 })
    }

    if (existingPlan.created_by_arranger_id !== arrangerUser.arranger_id) {
      return NextResponse.json({ error: 'Not authorized to delete this fee plan' }, { status: 403 })
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
      console.error('[arranger/fee-plans] Error archiving fee plan:', error)
      return NextResponse.json({ error: 'Failed to archive fee plan' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Fee plan archived successfully' })
  } catch (error) {
    console.error('[arranger/fee-plans] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
