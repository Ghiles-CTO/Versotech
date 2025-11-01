/**
 * Simplified Invoice Generation
 * Just the essentials - no complex validation or webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Simple Invoice API] Starting...');

    // Get the authenticated user first
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    console.log('[Simple Invoice API] Body:', JSON.stringify(body, null, 2));

    // Basic validation - just check we have the essentials
    if (!body.investor_id || !body.fee_event_ids || !body.due_date) {
      return NextResponse.json({
        error: 'Missing required fields: investor_id, fee_event_ids, or due_date'
      }, { status: 400 });
    }

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    // 1. Fetch fee events to get amounts
    const { data: feeEvents, error: feeEventsError } = await supabase
      .from('fee_events')
      .select('*')
      .in('id', body.fee_event_ids);

    if (feeEventsError) {
      console.error('[Simple Invoice API] Error fetching fee events:', feeEventsError);
      return NextResponse.json({ error: 'Failed to fetch fee events' }, { status: 500 });
    }

    console.log('[Simple Invoice API] Found fee events:', feeEvents?.length);

    // 2. Calculate total
    const total = feeEvents?.reduce((sum, event) => {
      return sum + Number(event.computed_amount || 0);
    }, 0) || 0;

    console.log('[Simple Invoice API] Total calculated:', total);

    // 3. Generate invoice number
    const timestamp = Date.now();
    const invoiceNumber = `INV-${timestamp}`;

    // 4. Create invoice (without balance_due - it's generated)
    const invoiceData = {
      investor_id: body.investor_id,
      invoice_number: invoiceNumber,
      due_date: body.due_date,
      subtotal: total,
      total: total,
      status: 'draft',
      created_by: user.id, // Use the authenticated user's ID
      paid_amount: 0,
      currency: 'USD'
    };

    console.log('[Simple Invoice API] Creating invoice:', invoiceData);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      console.error('[Simple Invoice API] Invoice creation error:', invoiceError);
      return NextResponse.json({
        error: 'Failed to create invoice',
        details: invoiceError.message
      }, { status: 500 });
    }

    console.log('[Simple Invoice API] Invoice created:', invoice.id);

    // 5. Create invoice line items
    const lineItems = feeEvents?.map(event => ({
      invoice_id: invoice.id,
      fee_event_id: event.id,
      kind: event.fee_type || 'fee',
      description: event.fee_type === 'flat'
        ? 'Investment commitment'
        : `${event.fee_type?.replace('_', ' ')} fee`,
      quantity: 1,
      unit_price: Number(event.computed_amount || 0),
      amount: Number(event.computed_amount || 0)
    })) || [];

    console.log('[Simple Invoice API] Creating line items:', lineItems.length);

    if (lineItems.length > 0) {
      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(lineItems);

      if (linesError) {
        console.error('[Simple Invoice API] Error creating line items:', linesError);
        // Don't fail - invoice is already created
      }
    }

    // 6. Update fee events to mark them as invoiced
    const { error: updateError } = await supabase
      .from('fee_events')
      .update({
        status: 'invoiced',
        invoice_id: invoice.id
      })
      .in('id', body.fee_event_ids);

    if (updateError) {
      console.error('[Simple Invoice API] Error updating fee events:', updateError);
      // Don't fail - invoice is already created
    }

    console.log('[Simple Invoice API] Success! Invoice:', invoice.id);

    return NextResponse.json({
      success: true,
      invoice: invoice
    }, { status: 200 });

  } catch (error) {
    console.error('[Simple Invoice API] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}