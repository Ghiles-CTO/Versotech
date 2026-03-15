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
import { resolveActiveIntroducerLinkFromCookies } from '@/lib/kyc/active-introducer-link';

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

    const { link: introducerLink, error: introducerError } = await resolveActiveIntroducerLinkFromCookies<{
      introducer_id: string
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookieStore: request.cookies,
      select: 'introducer_id',
    });

    if (introducerError || !introducerLink?.introducer_id) {
      return NextResponse.json(
        { error: 'You are not registered as an introducer' },
        { status: 403 }
      );
    }

    const introducerId = introducerLink.introducer_id;

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
