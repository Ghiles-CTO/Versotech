/**
 * Generate Invoice with n8n Webhook Integration
 * POST /api/staff/fees/invoices/generate
 *
 * Flow:
 * 1. Create invoice in DB (status: draft)
 * 2. Send webhook to n8n with invoice data
 * 3. n8n generates PDF, uploads to storage, sends email
 * 4. n8n calls back to /api/webhooks/invoice-generated
 * 5. We create document, task, and mark invoice as sent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';
import { validateInvoiceTotal, formatCurrency } from '@/lib/fees/calculations';

// Relaxed UUID regex that accepts test UUIDs
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const generateInvoiceSchema = z.object({
  investor_id: z.string().regex(uuidPattern, 'Invalid UUID format'),
  deal_id: z.string().regex(uuidPattern, 'Invalid UUID format').optional(),
  fee_event_ids: z.array(z.string().regex(uuidPattern, 'Invalid UUID format')).min(1),
  due_date: z.string(),
  notes: z.string().optional(),
  custom_line_items: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    quantity: z.number().default(1),
  })).optional(),
});

/**
 * Generate HMAC signature for n8n webhook
 */
function generateWebhookSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Invoice Generate API] Request received');

    const supabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Invoice Generate API] Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Invoice Generate API] User authenticated:', user.email);

    // Validate request
    const body = await request.json();
    console.log('[Invoice Generate API] Request body:', body);

    const validation = generateInvoiceSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Invoice Generate API] Validation failed:', validation.error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues,
      }, { status: 400 });
    }

    console.log('[Invoice Generate API] Validation passed');

    const { fee_event_ids, custom_line_items, investor_id, deal_id, due_date, notes } = validation.data;

    // Fetch fee events
    const { data: feeEvents, error: eventsError } = await serviceSupabase
      .from('fee_events')
      .select('*')
      .in('id', fee_event_ids)
      .eq('status', 'accrued'); // Only accrued (uninvoiced) events

    if (eventsError || !feeEvents || feeEvents.length === 0) {
      return NextResponse.json({
        error: 'No valid accrued fee events found',
      }, { status: 400 });
    }

    // Fetch vehicle info for fee events (if allocation_id is actually a subscription_id)
    const allocationIds = feeEvents.map(e => e.allocation_id).filter(Boolean);
    let subscriptionMap: any = {};

    if (allocationIds.length > 0) {
      const { data: subscriptions } = await serviceSupabase
        .from('subscriptions')
        .select('id, subscription_number, vehicle:vehicles(id, name)')
        .in('id', allocationIds);

      if (subscriptions) {
        subscriptionMap = Object.fromEntries(subscriptions.map(s => [s.id, s]));
      }
    }

    // Fetch investor details
    const { data: investor, error: investorError } = await serviceSupabase
      .from('investors')
      .select('id, legal_name, email')
      .eq('id', investor_id)
      .single();

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    // Fetch deal details if provided
    let deal = null;
    if (deal_id) {
      const { data: dealData } = await serviceSupabase
        .from('deals')
        .select('id, name')
        .eq('id', deal_id)
        .single();
      deal = dealData;
    }

    // Calculate totals
    const feeEventsTotal = feeEvents.reduce((sum, event) => sum + Number(event.computed_amount), 0);
    const customTotal = custom_line_items?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const subtotal = feeEventsTotal + customTotal;
    const total = subtotal;

    // Generate invoice number (format: INV-YYYY-NNNN)
    const year = new Date().getFullYear();
    const { count } = await serviceSupabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `INV-${year}-%`);

    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Create invoice
    // Note: balance_due is a generated column, so we don't insert it
    const { data: invoice, error: invoiceError } = await serviceSupabase
      .from('invoices')
      .insert({
        investor_id,
        deal_id: deal_id || null,
        invoice_number: invoiceNumber,
        due_date,
        subtotal,
        total,
        // balance_due is automatically calculated as (total - paid_amount)
        status: 'draft', // Will be updated to 'sent' after n8n callback
        created_by: user.id,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('[Invoice Generate API] Error creating invoice:', invoiceError);
      return NextResponse.json({
        error: invoiceError?.message || 'Failed to create invoice',
        details: invoiceError?.details,
        code: invoiceError?.code,
      }, { status: 500 });
    }

    console.log('[Invoice Generate API] Invoice created:', invoice.id);

    // Create invoice lines
    const feeEventLines = feeEvents.map((event: any) => {
      // Get vehicle name from the subscription map if available
      const subscription = subscriptionMap[event.allocation_id];
      const vehicleName = subscription?.vehicle?.name || '';

      // Generate description based on fee type
      let description = event.notes;
      if (!description) {
        if (event.fee_type === 'flat') {
          description = vehicleName ? `Investment commitment - ${vehicleName}` : 'Investment commitment';
        } else {
          const feeTypeName = event.fee_type.replace('_', ' ');
          description = vehicleName ? `${feeTypeName} fee - ${vehicleName}` : `${feeTypeName} fee`;
        }
      }

      return {
        invoice_id: invoice.id,
        fee_event_id: event.id,
        kind: event.fee_type,
        description,
        quantity: 1,
        unit_price: Number(event.computed_amount),
        amount: Number(event.computed_amount),
      };
    });

    const customLines = custom_line_items?.map(item => ({
      invoice_id: invoice.id,
      kind: 'custom',
      description: item.description,
      quantity: item.quantity,
      unit_price: item.amount / item.quantity,
      amount: item.amount,
    })) || [];

    const { error: linesError } = await serviceSupabase
      .from('invoice_lines')
      .insert([...feeEventLines, ...customLines]);

    if (linesError) {
      console.error('Error creating invoice lines:', linesError);
      // Rollback
      await serviceSupabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: 'Failed to create invoice lines' }, { status: 500 });
    }

    // Update fee events to invoiced status
    await serviceSupabase
      .from('fee_events')
      .update({ status: 'invoiced', invoice_id: invoice.id })
      .in('id', fee_event_ids);

    // Validate invoice total matches expected (warn if mismatch)
    const expectedTotal = feeEventsTotal + customTotal;
    if (Math.abs(total - expectedTotal) > 0.01) {
      console.warn(
        `[Invoice Generate API] Invoice total mismatch! Invoice total: ${formatCurrency(total)}, Expected: ${formatCurrency(expectedTotal)}`
      );
    }

    // Prepare webhook payload for n8n
    const webhookPayload = {
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      investor: {
        id: investor.id,
        legal_name: investor.legal_name,
        email: investor.email,
      },
      deal: deal ? { id: deal.id, name: deal.name } : null,
      due_date,
      subtotal,
      total,
      currency: 'USD',
      line_items: [...feeEventLines, ...customLines].map(line => ({
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        amount: line.amount,
      })),
      notes: notes || null,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/invoice-generated`,
    };

    // Send webhook to n8n
    const n8nWebhookUrl = process.env.N8N_INVOICE_GENERATION_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('N8N_INVOICE_GENERATION_WEBHOOK_URL not configured');
      return NextResponse.json({
        warning: 'Invoice created but webhook not configured',
        data: invoice,
      }, { status: 201 });
    }

    // Generate signature
    const signature = generateWebhookSignature(
      webhookPayload,
      process.env.N8N_OUTBOUND_SECRET || ''
    );

    // Fire and forget webhook (n8n will callback)
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERSO-Signature': signature,
      },
      body: JSON.stringify(webhookPayload),
    }).catch((error) => {
      console.error('Error sending webhook to n8n:', error);
    });

    return NextResponse.json({
      data: invoice,
      message: 'Invoice created and sent for PDF generation',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/staff/fees/invoices/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
