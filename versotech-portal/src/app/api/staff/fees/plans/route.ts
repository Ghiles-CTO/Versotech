/**
 * Fee Plans API Routes
 * GET /api/staff/fees/plans - List all fee plans
 * POST /api/staff/fees/plans - Create new fee plan
 *
 * IMPORTANT: Fee plans are commercial agreements with introducers/partners.
 * Per Fred's requirements:
 * - Must be linked to a deal (no global templates)
 * - Must be linked to a published term sheet
 * - Must be linked to an entity (introducer/partner/commercial_partner)
 * - Fee values must NOT exceed term sheet limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createFeePlanSchema } from '@/lib/fees/validation';
import type { FeePlan, FeeComponent } from '@/lib/fees/types';
import { validateFeeComponentsAgainstTermSheet } from '@/lib/fees/term-sheet-sync';
import { checkStaffAccess } from '@/lib/auth';

/**
 * GET /api/staff/fees/plans
 * List all fee plans with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

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

    // Build query - include term sheet (with fee limits), entity relationships, and generated agreements
    const selectFields = includeComponents
      ? `*,
         components:fee_components(*),
         term_sheet:term_sheet_id (id, version, status, subscription_fee_percent, management_fee_percent, carried_interest_percent),
         introducer:introducer_id (id, legal_name),
         partner:partner_id (id, name),
         commercial_partner:commercial_partner_id (id, name),
         introducer_agreement:generated_agreement_id (id, reference_number, status, pdf_url),
         placement_agreement:generated_placement_agreement_id (id, reference_number, status, pdf_url)`
      : `*,
         term_sheet:term_sheet_id (id, version, status, subscription_fee_percent, management_fee_percent, carried_interest_percent),
         introducer:introducer_id (id, legal_name),
         partner:partner_id (id, name),
         commercial_partner:commercial_partner_id (id, name),
         introducer_agreement:generated_agreement_id (id, reference_number, status, pdf_url),
         placement_agreement:generated_placement_agreement_id (id, reference_number, status, pdf_url)`;

    let query = supabase
      .from('fee_plans')
      .select(selectFields)
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
 *
 * Per Fred's requirements:
 * - deal_id is REQUIRED (no global templates)
 * - term_sheet_id is REQUIRED (must be published)
 * - Entity (introducer_id/partner_id/commercial_partner_id) is REQUIRED
 * - Fee values must NOT exceed term sheet limits
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require staff access (including CEO) before bypassing RLS
    const hasStaffAccess = await checkStaffAccess(user.id);
    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const { components, term_sheet_id, ...feePlanData } = validation.data;

    // VALIDATION 1: Verify term_sheet_id exists and is published
    const { data: termSheet, error: termSheetError } = await serviceSupabase
      .from('deal_fee_structures')
      .select('id, status, subscription_fee_percent, management_fee_percent, carried_interest_percent')
      .eq('id', term_sheet_id)
      .single();

    if (termSheetError || !termSheet) {
      return NextResponse.json(
        { error: 'Term sheet not found', details: 'The specified term_sheet_id does not exist' },
        { status: 400 }
      );
    }

    if (termSheet.status !== 'published') {
      return NextResponse.json(
        { error: 'Term sheet not published', details: 'Fee models can only be linked to published term sheets' },
        { status: 400 }
      );
    }

    // VALIDATION 2: Verify fee values don't exceed term sheet limits
    if (components && components.length > 0) {
      const validationErrors = validateFeeComponentsAgainstTermSheet(components, termSheet);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            error: 'Fee values exceed term sheet limits',
            details: validationErrors,
          },
          { status: 400 }
        );
      }
    }

    // VALIDATION 3: Verify entity exists
    const entityId = feePlanData.introducer_id || feePlanData.partner_id || feePlanData.commercial_partner_id;
    let entityType: 'introducer' | 'partner' | 'commercial_partner' | null = null;
    let entityTable = '';

    if (feePlanData.introducer_id) {
      entityType = 'introducer';
      entityTable = 'introducers';
    } else if (feePlanData.partner_id) {
      entityType = 'partner';
      entityTable = 'partners';
    } else if (feePlanData.commercial_partner_id) {
      entityType = 'commercial_partner';
      entityTable = 'commercial_partners';
    }

    if (entityId && entityTable) {
      const { data: entity, error: entityError } = await serviceSupabase
        .from(entityTable)
        .select('id')
        .eq('id', entityId)
        .single();

      if (entityError || !entity) {
        return NextResponse.json(
          { error: `${entityType} not found`, details: `The specified ${entityType}_id does not exist` },
          { status: 400 }
        );
      }
    }

    // Create fee plan with term_sheet_id
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .insert({
        ...feePlanData,
        term_sheet_id,
        created_by: user.id,
        is_active: true,
        status: 'draft', // New fee plans start in draft status
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating fee plan:', planError);
      return NextResponse.json({ error: 'Failed to create fee plan' }, { status: 500 });
    }

    // Create fee components
    let createdComponents: any[] = [];
    if (components && components.length > 0) {
      const componentInserts = components.map((component) => ({
        ...component,
        fee_plan_id: feePlan.id,
      }));

      const { data: comps, error: componentsError } = await supabase
        .from('fee_components')
        .insert(componentInserts)
        .select();

      if (componentsError) {
        console.error('Error creating fee components:', componentsError);
        console.error('Component inserts attempted:', JSON.stringify(componentInserts, null, 2));
        // Rollback: delete the created fee plan
        await supabase.from('fee_plans').delete().eq('id', feePlan.id);
        return NextResponse.json({
          error: 'Failed to create fee components',
          details: componentsError.message,
          code: componentsError.code,
          hint: componentsError.hint,
        }, { status: 500 });
      }
      createdComponents = comps || [];
    }

    // NOTE: Auto-sync to term sheet has been removed per Fred's requirements.
    // Term sheets (investor-facing) and fee models (partner agreements) serve different purposes.

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
