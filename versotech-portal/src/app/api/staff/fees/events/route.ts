/**
 * Fee Events API Routes
 * GET /api/staff/fees/events - List fee events with filters
 * POST /api/staff/fees/events - Create new fee event
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createFeeEventSchema, feeEventFiltersSchema } from '@/lib/fees/validation';

/**
 * GET /api/staff/fees/events
 * List fee events with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service client to bypass RLS (this is already a staff-only endpoint)
    const supabase = createServiceClient();

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    console.log('[Fee Events API] Raw search params:', searchParams);
    const validation = feeEventFiltersSchema.safeParse(searchParams);

    if (!validation.success) {
      console.error('[Fee Events API] Validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid filters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Build query
    let query = supabase
      .from('fee_events')
      .select(
        `
        *,
        investor:investors(id, legal_name, display_name, email),
        deal:deals(id, name),
        fee_component:fee_components(*)
      `,
        { count: 'exact' }
      )
      .order('event_date', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    // Apply filters
    if (filters.investor_id) query = query.eq('investor_id', filters.investor_id);
    if (filters.deal_id) query = query.eq('deal_id', filters.deal_id);
    if (filters.allocation_id) query = query.eq('allocation_id', filters.allocation_id);
    if (filters.fee_type) query = query.eq('fee_type', filters.fee_type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.date_from) query = query.gte('event_date', filters.date_from);
    if (filters.date_to) query = query.lte('event_date', filters.date_to);
    if (filters.period_from) query = query.gte('period_start_date', filters.period_from);
    if (filters.period_to) query = query.lte('period_start_date', filters.period_to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching fee events:', error);
      return NextResponse.json({ error: 'Failed to fetch fee events' }, { status: 500 });
    }

    // Fetch subscription data for events that have allocation_id
    if (data && data.length > 0) {
      const allocationIds = data
        .map(event => event.allocation_id)
        .filter(Boolean);

      console.log('[Fee Events API] Allocation IDs to fetch:', allocationIds);

      if (allocationIds.length > 0) {
        // Fetch subscriptions with vehicle info
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            subscription_number,
            commitment,
            vehicle:vehicles(
              id,
              name
            )
          `)
          .in('id', allocationIds);

        if (subsError) {
          console.error('[Fee Events API] Error fetching subscriptions:', subsError);
        } else {
          console.log('[Fee Events API] Fetched subscriptions:', subscriptions?.length || 0);
        }

        // Create a map for quick lookup
        const subscriptionMap = new Map();
        subscriptions?.forEach(sub => {
          subscriptionMap.set(sub.id, sub);
        });

        // Merge subscription data into fee events
        data.forEach(event => {
          if (event.allocation_id) {
            event.subscription = subscriptionMap.get(event.allocation_id);
            if (!event.subscription) {
              console.warn(`[Fee Events API] No subscription found for allocation_id: ${event.allocation_id}`);
            }
          }
        });
      }

      // Log the first fee event to debug the structure
      console.log('[Fee Events API] First fee event structure:', {
        id: data[0].id,
        investor_id: data[0].investor_id,
        allocation_id: data[0].allocation_id,
        investor: data[0].investor,
        subscription: data[0].subscription,
        fee_type: data[0].fee_type,
      });
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('Unexpected error in GET /api/staff/fees/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/staff/fees/events
 * Create a new fee event (manual generation)
 */
export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    const body = await request.json();
    const validation = createFeeEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Determine payee_arranger_id from deal if provided
    let payeeArrangerId: string | null = null;
    if (validation.data.deal_id) {
      const { data: deal } = await supabase
        .from('deals')
        .select('arranger_entity_id')
        .eq('id', validation.data.deal_id)
        .single();

      if (deal?.arranger_entity_id) {
        payeeArrangerId = deal.arranger_entity_id;
      }
    }

    const { data: feeEvent, error } = await supabase
      .from('fee_events')
      .insert({
        ...validation.data,
        status: 'accrued',
        payee_arranger_id: payeeArrangerId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating fee event:', error);
      return NextResponse.json({ error: 'Failed to create fee event' }, { status: 500 });
    }

    return NextResponse.json({ data: feeEvent }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/staff/fees/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
