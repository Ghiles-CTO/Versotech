/**
 * Fee Plans API Routes
 * GET /api/staff/fees/plans - List all fee plans
 * POST /api/staff/fees/plans - Create new fee plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeePlanSchema } from '@/lib/fees/validation';
import type { FeePlan, FeeComponent } from '@/lib/fees/types';
import { syncFeePlanToTermSheet } from '@/lib/fees/term-sheet-sync';

/**
 * GET /api/staff/fees/plans
 * List all fee plans with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dealId = searchParams.get('deal_id');
    const vehicleId = searchParams.get('vehicle_id');
    const isActive = searchParams.get('is_active');
    const includeComponents = searchParams.get('include_components') === 'true';

    // Build query
    let query = supabase
      .from('fee_plans')
      .select(
        includeComponents
          ? '*, components:fee_components(*)'
          : '*'
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }
    // Default to only showing active plans unless explicitly requested otherwise
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fee plans:', error);
      return NextResponse.json({ error: 'Failed to fetch fee plans' }, { status: 500 });
    }

    // Add usage count (number of subscriptions using each plan)
    const plansWithUsage = await Promise.all(
      (data || []).map(async (plan: any) => {
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('fee_plan_id', plan.id);

        return {
          ...plan,
          subscription_count: count || 0,
        };
      })
    );

    return NextResponse.json({ data: plansWithUsage });
  } catch (error) {
    console.error('Unexpected error in GET /api/staff/fees/plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/staff/fees/plans
 * Create a new fee plan with components
 */
export async function POST(request: NextRequest) {
  try {
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
    const validation = createFeePlanSchema.safeParse(body);

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

    // Create fee plan
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .insert({
        ...feePlanData,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating fee plan:', planError);
      return NextResponse.json({ error: 'Failed to create fee plan' }, { status: 500 });
    }

    // Create fee components
    const componentInserts = components.map((component) => ({
      ...component,
      fee_plan_id: feePlan.id,
    }));

    const { data: createdComponents, error: componentsError } = await supabase
      .from('fee_components')
      .insert(componentInserts)
      .select();

    if (componentsError) {
      console.error('Error creating fee components:', componentsError);
      // Rollback: delete the created fee plan
      await supabase.from('fee_plans').delete().eq('id', feePlan.id);
      return NextResponse.json({ error: 'Failed to create fee components' }, { status: 500 });
    }

    // If this fee plan has a deal_id, sync to term sheet
    if (feePlan.deal_id) {
      const syncResult = await syncFeePlanToTermSheet(
        supabase,
        feePlan.id,
        feePlan.deal_id
      );

      if (!syncResult.success) {
        console.warn('Failed to sync fee plan to term sheet:', syncResult.error);
      }
    }

    // Return created plan with components
    return NextResponse.json(
      {
        data: {
          ...feePlan,
          components: createdComponents,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/staff/fees/plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
