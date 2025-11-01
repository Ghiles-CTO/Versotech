/**
 * Individual Fee Plan API Routes
 * GET /api/staff/fees/plans/[id] - Get fee plan details
 * PUT /api/staff/fees/plans/[id] - Update fee plan
 * DELETE /api/staff/fees/plans/[id] - Archive fee plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateFeePlanSchema } from '@/lib/fees/validation';
import { syncFeePlanToTermSheet } from '@/lib/fees/term-sheet-sync';

/**
 * GET /api/staff/fees/plans/[id]
 * Get a single fee plan with its components
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fee plan with components
    const { data: feePlan, error } = await supabase
      .from('fee_plans')
      .select(
        `
        *,
        components:fee_components(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
      }
      console.error('Error fetching fee plan:', error);
      return NextResponse.json({ error: 'Failed to fetch fee plan' }, { status: 500 });
    }

    return NextResponse.json({ data: feePlan });
  } catch (error) {
    console.error('Unexpected error in GET /api/staff/fees/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/staff/fees/plans/[id]
 * Update a fee plan (and optionally its components)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateFeePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { components, ...feePlanData } = validation.data;

    // Update fee plan
    const { data: updatedPlan, error: planError } = await supabase
      .from('fee_plans')
      .update({
        ...feePlanData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (planError) {
      console.error('Error updating fee plan:', planError);
      return NextResponse.json({ error: 'Failed to update fee plan' }, { status: 500 });
    }

    // If components are provided, update them
    let updatedComponents = null;
    if (components && components.length > 0) {
      // Delete existing components
      await supabase.from('fee_components').delete().eq('fee_plan_id', id);

      // Insert new components
      const componentInserts = components.map((component) => ({
        ...component,
        fee_plan_id: id,
      }));

      const { data: newComponents, error: componentsError } = await supabase
        .from('fee_components')
        .insert(componentInserts)
        .select();

      if (componentsError) {
        console.error('Error updating fee components:', componentsError);
        return NextResponse.json({
          error: 'Failed to update fee components',
          details: componentsError.message,
          hint: componentsError.hint,
          code: componentsError.code
        }, { status: 500 });
      }

      updatedComponents = newComponents;
    }

    // Fetch current components if not updated
    if (!updatedComponents) {
      const { data: currentComponents } = await supabase
        .from('fee_components')
        .select('*')
        .eq('fee_plan_id', id);

      updatedComponents = currentComponents;
    }

    // If this fee plan has a deal_id and components were updated, sync back to term sheet
    if (updatedPlan.deal_id && components && components.length > 0) {
      const syncResult = await syncFeePlanToTermSheet(
        supabase,
        id,
        updatedPlan.deal_id
      );

      if (!syncResult.success) {
        console.warn('Failed to sync fee plan to term sheet:', syncResult.error);
      }
    }

    return NextResponse.json({
      data: {
        ...updatedPlan,
        components: updatedComponents,
      },
    });
  } catch (error) {
    console.error('Unexpected error in PUT /api/staff/fees/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/fees/plans/[id]
 * Archive a fee plan (soft delete by setting is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('fee_plans')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error archiving fee plan:', error);
      return NextResponse.json({ error: 'Failed to archive fee plan' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Fee plan archived successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/staff/fees/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
