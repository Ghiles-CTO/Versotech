/**
 * Duplicate Fee Plan API Route
 * POST /api/staff/fees/plans/[id]/duplicate - Duplicate an existing fee plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/staff/fees/plans/[id]/duplicate
 * Duplicate an existing fee plan with all its components
 */
export async function POST(
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

    // Fetch the original fee plan with components
    const { data: originalPlan, error: fetchError } = await supabase
      .from('fee_plans')
      .select(
        `
        *,
        components:fee_components(*)
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
      }
      console.error('Error fetching fee plan:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch fee plan' }, { status: 500 });
    }

    // Create new fee plan (copy of original)
    const {
      id: _originalId,
      created_at,
      updated_at,
      created_by,
      components,
      ...planData
    } = originalPlan as any;

    const { data: newPlan, error: planError } = await supabase
      .from('fee_plans')
      .insert({
        ...planData,
        name: `${planData.name} (Copy)`,
        is_default: false, // Copies should not be default
        created_by: user.id,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error duplicating fee plan:', planError);
      return NextResponse.json({ error: 'Failed to duplicate fee plan' }, { status: 500 });
    }

    // Duplicate fee components
    if (components && components.length > 0) {
      const componentInserts = components.map((component: any) => {
        const {
          id,
          fee_plan_id,
          created_at,
          updated_at,
          ...componentData
        } = component;

        return {
          ...componentData,
          fee_plan_id: newPlan.id,
        };
      });

      const { data: newComponents, error: componentsError } = await supabase
        .from('fee_components')
        .insert(componentInserts)
        .select();

      if (componentsError) {
        console.error('Error duplicating fee components:', componentsError);
        // Rollback: delete the created fee plan
        await supabase.from('fee_plans').delete().eq('id', newPlan.id);
        return NextResponse.json(
          { error: 'Failed to duplicate fee components' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          data: {
            ...newPlan,
            components: newComponents,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...newPlan,
          components: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/staff/fees/plans/[id]/duplicate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
