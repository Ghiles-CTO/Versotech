/**
 * Mark Commission as Invoiced API
 * POST /api/staff/fees/commissions/[id]/mark-invoiced
 *
 * Marks a commission as invoiced for any entity type (introducer, partner, commercial partner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const markInvoicedSchema = z.object({
  entity_type: z.enum(['introducer', 'partner', 'commercial_partner']).default('introducer'),
});

// Configuration for different commission types
const COMMISSION_CONFIG = {
  'introducer': {
    table: 'introducer_commissions',
  },
  'partner': {
    table: 'partner_commissions',
  },
  'commercial_partner': {
    table: 'commercial_partner_commissions',
  },
} as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff role check - only staff can mark commissions as invoiced
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
      return NextResponse.json({ error: 'Forbidden - Staff only' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const validation = markInvoicedSchema.safeParse(body);
    const { entity_type } = validation.success
      ? validation.data
      : { entity_type: 'introducer' as const };

    const config = COMMISSION_CONFIG[entity_type];

    // Verify commission exists before updating
    const { data: commission, error: fetchError } = await serviceSupabase
      .from(config.table)
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    if (commission.status !== 'invoice_submitted') {
      return NextResponse.json(
        { error: `Commission status must be invoice_submitted (current: ${commission.status})` },
        { status: 400 }
      );
    }

    // Update commission status to invoiced
    const { error } = await serviceSupabase
      .from(config.table)
      .update({
        status: 'invoiced',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
        rejected_by: null,
        rejected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking commission as invoiced:', error);
      return NextResponse.json({ error: 'Failed to mark commission as invoiced' }, { status: 500 });
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'marked_invoiced',
      entity_type: config.table.replace('_commissions', '_commission'),
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Commission marked as invoiced',
        entity_type,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-invoiced route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
