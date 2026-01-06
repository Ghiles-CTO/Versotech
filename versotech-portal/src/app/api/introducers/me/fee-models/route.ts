/**
 * Introducer Fee Models Endpoint
 *
 * GET /api/introducers/me/fee-models
 *
 * Returns fee models for the current introducer.
 *
 * IMPORTANT: Per Fred's requirements:
 * - Introducers can ONLY see their fee models
 * - Introducers CANNOT see term sheets (term sheet data is NOT included)
 * - Partners CAN see term sheets, so they use a different endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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

    // Get the introducer profile for this user
    // Check BOTH: direct user_id link AND introducer_users junction table
    let introducerId: string | null = null;

    // Method 1: Check direct user_id on introducers table (legacy/primary)
    const { data: directIntroducer } = await serviceSupabase
      .from('introducers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (directIntroducer) {
      introducerId = directIntroducer.id;
    }

    // Method 2: Check introducer_users junction table (multi-user support)
    if (!introducerId) {
      const { data: introducerUser } = await serviceSupabase
        .from('introducer_users')
        .select('introducer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (introducerUser) {
        introducerId = introducerUser.introducer_id;
      }
    }

    if (!introducerId) {
      return NextResponse.json(
        { error: 'You are not registered as an introducer' },
        { status: 403 }
      );
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const dealId = searchParams.get('deal_id');
    const status = searchParams.get('status');

    // Build query for fee models linked to this introducer
    // NOTE: We explicitly do NOT join term_sheet data per Fred's requirements
    let query = supabase
      .from('fee_plans')
      .select(`
        id,
        name,
        description,
        deal_id,
        status,
        is_active,
        created_at,
        updated_at,
        accepted_at,
        accepted_by,
        invoice_requests_enabled,
        fee_components (
          id,
          kind,
          calc_method,
          frequency,
          rate_bps,
          flat_amount,
          payment_schedule,
          duration_periods,
          duration_unit
        ),
        deals:deal_id (
          id,
          name,
          company_name,
          status,
          close_at
        )
      `)
      .eq('introducer_id', introducerId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: feeModels, error: feeModelsError } = await query;

    if (feeModelsError) {
      console.error('Error fetching fee models:', feeModelsError);
      return NextResponse.json(
        { error: 'Failed to fetch fee models' },
        { status: 500 }
      );
    }

    // Summary stats
    const stats = {
      total: feeModels?.length || 0,
      accepted: feeModels?.filter(fm => fm.status === 'accepted').length || 0,
      pending: feeModels?.filter(fm => fm.status === 'sent' || fm.status === 'pending_signature').length || 0,
      draft: feeModels?.filter(fm => fm.status === 'draft').length || 0,
    };

    return NextResponse.json({
      data: feeModels || [],
      stats,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/introducers/me/fee-models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
