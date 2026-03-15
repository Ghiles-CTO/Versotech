/**
 * Individual Fee Plan API Routes
 * GET /api/staff/fees/plans/[id] - Get fee plan details
 * PUT /api/staff/fees/plans/[id] - Update fee plan
 * DELETE /api/staff/fees/plans/[id] - Archive fee plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { updateFeePlanSchema } from '@/lib/fees/validation';
import { syncFeePlanToTermSheet } from '@/lib/fees/term-sheet-sync';
import { normalizeFeeComponentsForInsert } from '@/lib/fees/normalize-fee-components';
import { checkStaffAccess } from '@/lib/auth';
import {
  buildIntroducerCommercialBlockPayload,
  getIntroducerCommercialEligibility,
} from '@/lib/introducers/commercial-eligibility';

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
    const serviceSupabase = createServiceClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasStaffAccess = await checkStaffAccess(user.id);
    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const serviceSupabase = createServiceClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasStaffAccess = await checkStaffAccess(user.id);
    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const existingPlanResult = await serviceSupabase
      .from('fee_plans')
      .select('id, introducer_id, partner_id, commercial_partner_id, deal_id')
      .eq('id', id)
      .single();

    const existingPlan = existingPlanResult.data;
    if (existingPlanResult.error || !existingPlan) {
      return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
    }

    const {
      components,
      introducer_id,
      partner_id,
      commercial_partner_id,
      ...feePlanData
    } = validation.data;

    const entityFieldProvided =
      introducer_id !== undefined ||
      partner_id !== undefined ||
      commercial_partner_id !== undefined;

    const normalizedEntityFields = entityFieldProvided
      ? {
          introducer_id: introducer_id ?? null,
          partner_id: partner_id ?? null,
          commercial_partner_id: commercial_partner_id ?? null,
        }
      : {
          introducer_id: existingPlan.introducer_id ?? null,
          partner_id: existingPlan.partner_id ?? null,
          commercial_partner_id: existingPlan.commercial_partner_id ?? null,
        };

    if (normalizedEntityFields.introducer_id) {
      const eligibility = await getIntroducerCommercialEligibility({
        supabase: serviceSupabase,
        introducerId: normalizedEntityFields.introducer_id,
      });

      if (!eligibility) {
        return NextResponse.json({ error: 'Failed to verify introducer eligibility' }, { status: 500 });
      }

      if (!eligibility.eligible) {
        return NextResponse.json(buildIntroducerCommercialBlockPayload(eligibility), {
          status: 409,
        });
      }
    }

    // Update fee plan
    const { data: updatedPlan, error: planError } = await serviceSupabase
      .from('fee_plans')
      .update({
        ...feePlanData,
        ...normalizedEntityFields,
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
      await serviceSupabase.from('fee_components').delete().eq('fee_plan_id', id);

      // Insert new components
      const componentInserts = normalizeFeeComponentsForInsert(components, id);

      const { data: newComponents, error: componentsError } = await serviceSupabase
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
      const { data: currentComponents } = await serviceSupabase
        .from('fee_components')
        .select('*')
        .eq('fee_plan_id', id);

      updatedComponents = currentComponents;
    }

    // If this fee plan has a deal_id and components were updated, sync back to term sheet
    if (updatedPlan.deal_id && components && components.length > 0) {
      const syncResult = await syncFeePlanToTermSheet(
        serviceSupabase,
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
