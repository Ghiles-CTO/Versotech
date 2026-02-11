/**
 * Invoice Generated Webhook Receiver
 * POST /api/webhooks/invoice-generated
 *
 * Receives callback from n8n after invoice PDF is generated
 * Creates document, task, and updates invoice status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';

// Relaxed UUID regex that accepts test UUIDs
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const webhookPayloadSchema = z.object({
  invoice_id: z.string().regex(uuidPattern, 'Invalid UUID format'),
  invoice_number: z.string(),
  supabase_url: z.string().url(),
  gdrive_url: z.string().url().optional(),
  email_sent: z.boolean().optional(),
  metadata: z.object({
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  }).optional(),
});

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Verify signature
    const rawBody = await request.text();
    const signature = request.headers.get('X-N8N-Signature');
    const secret = process.env.N8N_INBOUND_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or secret');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse and validate payload
    const body = JSON.parse(rawBody);
    const validation = webhookPayloadSchema.safeParse(body);

    if (!validation.success) {
      console.error('Invalid webhook payload:', validation.error.issues);
      return NextResponse.json({
        error: 'Invalid payload',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { invoice_id, invoice_number, supabase_url, gdrive_url, email_sent, metadata } = validation.data;

    // Fetch invoice with investor and deal details (for vehicle_id)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        investor:investors (
          id,
          legal_name,
          email,
          user_id
        ),
        deal:deals (
          id,
          vehicle_id
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoice_id);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 1. Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        investor_id: invoice.investor_id,
        deal_id: invoice.deal_id,
        vehicle_id: invoice.deal?.vehicle_id || null,
        type: 'invoice',
        category: 'invoices',
        file_key: supabase_url,
        file_name: `${invoice_number}.pdf`,
        mime_type: metadata?.mime_type || 'application/pdf',
        file_size: metadata?.file_size || 0,
        external_url: gdrive_url || null,
        created_by: invoice.created_by,
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document:', docError);
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    // 2. Create task for investor to pay invoice
    if (invoice.investor?.user_id) {
      const dueDate = new Date(invoice.due_date);
      const taskTitle = `Pay Invoice ${invoice_number}`;
      const taskDescription = `Invoice ${invoice_number} for $${Number(invoice.total).toLocaleString()} is due on ${dueDate.toLocaleDateString(undefined, { timeZone: 'UTC' })}. Please review and submit payment.`;

      await supabase
        .from('tasks')
        .insert({
          assignee_id: invoice.investor.user_id,
          title: taskTitle,
          description: taskDescription,
          category: 'payment',
          priority: 'high',
          due_date: invoice.due_date,
          status: 'pending',
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice_number,
            amount: invoice.total,
            document_id: document.id,
          },
        });
    }

    // 3. Update invoice status and link document
    await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        doc_id: document.id,
      })
      .eq('id', invoice_id);

    // 4. Create reconciliation expectation
    // This helps auto-match incoming payments to this invoice
    await supabase
      .from('reconciliation_matches')
      .insert({
        invoice_id: invoice.id,
        match_type: 'expected',
        matched_amount: Number(invoice.total),
        match_confidence: 100,
        match_reason: 'Invoice sent, awaiting payment',
        status: 'pending',
      });

    console.log(`Invoice ${invoice_number} processed successfully:`, {
      document_id: document.id,
      invoice_id,
      email_sent,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice processed successfully',
      data: {
        invoice_id,
        document_id: document.id,
        task_created: !!invoice.investor?.user_id,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/webhooks/invoice-generated:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
