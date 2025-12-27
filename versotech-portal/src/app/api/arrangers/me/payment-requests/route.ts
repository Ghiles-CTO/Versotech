/**
 * Arranger Payment Request API Routes
 * GET /api/arrangers/me/payment-requests - List payment requests for current arranger
 * POST /api/arrangers/me/payment-requests - Create new payment request
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createPaymentRequestSchema = z.object({
  fee_event_ids: z.array(z.string().uuid()).min(1, 'At least one fee event required'),
  notes: z.string().max(1000).optional(),
})

/**
 * GET /api/arrangers/me/payment-requests
 * Returns payment requests (invoices) where the arranger is the payee
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get payment requests (invoices) where arranger is the payee
    // First, get fee events created by this arranger or for their deals
    const { data: feeEvents, error: eventsError } = await serviceSupabase
      .from('fee_events')
      .select('id, invoice_id')
      .eq('payee_arranger_id', arrangerId)
      .not('invoice_id', 'is', null)

    if (eventsError) {
      console.error('[payment-requests] Fee events lookup error:', eventsError)
      return NextResponse.json({ error: 'Failed to load fee events' }, { status: 500 })
    }

    const invoiceIds = [...new Set((feeEvents || []).filter(e => e.invoice_id).map(e => e.invoice_id))]

    if (invoiceIds.length === 0) {
      return NextResponse.json({ payment_requests: [] })
    }

    // Fetch invoices
    const { data: invoices, error: invoicesError } = await serviceSupabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        investor_id,
        deal_id,
        status,
        subtotal,
        total,
        paid_amount,
        due_date,
        created_at,
        notes,
        investor:investor_id (
          id,
          legal_name,
          display_name
        ),
        deal:deal_id (
          id,
          name
        )
      `)
      .in('id', invoiceIds)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('[payment-requests] Invoices fetch error:', invoicesError)
      return NextResponse.json({ error: 'Failed to fetch payment requests' }, { status: 500 })
    }

    return NextResponse.json({ payment_requests: invoices || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/arrangers/me/payment-requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/arrangers/me/payment-requests
 * Create a payment request for fee events owed to the arranger
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find arranger entity for current user
    const { data: arrangerUser, error: arrangerUserError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (arrangerUserError || !arrangerUser?.arranger_id) {
      return NextResponse.json({ error: 'Arranger profile not found' }, { status: 404 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Parse and validate request body
    const body = await request.json()
    const validation = createPaymentRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { fee_event_ids, notes } = validation.data

    // Verify all fee events belong to this arranger and are not already invoiced
    const { data: feeEvents, error: eventsError } = await serviceSupabase
      .from('fee_events')
      .select('id, computed_amount, fee_type, deal_id, investor_id, status, invoice_id, payee_arranger_id')
      .in('id', fee_event_ids)

    if (eventsError || !feeEvents) {
      return NextResponse.json({ error: 'Failed to fetch fee events' }, { status: 500 })
    }

    if (feeEvents.length !== fee_event_ids.length) {
      return NextResponse.json({ error: 'One or more fee events not found' }, { status: 404 })
    }

    // Check ownership and status
    for (const event of feeEvents) {
      if (event.payee_arranger_id !== arrangerId) {
        return NextResponse.json({ error: 'Fee event does not belong to this arranger' }, { status: 403 })
      }
      if (event.invoice_id) {
        return NextResponse.json({ error: `Fee event ${event.id} already has an invoice` }, { status: 400 })
      }
      if (event.status !== 'accrued') {
        return NextResponse.json({ error: `Fee event ${event.id} is not in accrued status` }, { status: 400 })
      }
    }

    // Calculate totals
    const total = feeEvents.reduce((sum, event) => sum + Number(event.computed_amount), 0)

    // Get the first deal/investor for the invoice header
    const primaryDealId = feeEvents[0].deal_id
    const primaryInvestorId = feeEvents[0].investor_id

    // Generate invoice number
    const invoiceNumber = `ARR-${arrangerId.substring(0, 6).toUpperCase()}-${Date.now()}`

    // Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create invoice
    const { data: invoice, error: invoiceError } = await serviceSupabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        deal_id: primaryDealId,
        investor_id: primaryInvestorId,
        subtotal: total,
        total: total,
        paid_amount: 0,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        notes: notes || `Payment request from arranger for ${feeEvents.length} fee event(s)`,
        created_by: user.id,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json({ error: 'Failed to create payment request' }, { status: 500 })
    }

    // Update fee events with invoice_id
    const { error: updateError } = await serviceSupabase
      .from('fee_events')
      .update({
        invoice_id: invoice.id,
        status: 'invoiced',
      })
      .in('id', fee_event_ids)

    if (updateError) {
      console.error('Error updating fee events:', updateError)
      // Don't fail the request, just log
    }

    // Notify staff about the payment request
    const { data: staffUsers } = await serviceSupabase
      .from('profiles')
      .select('id')
      .in('role', ['staff_admin', 'staff_ops'])
      .limit(5)

    if (staffUsers && staffUsers.length > 0) {
      const notifications = staffUsers.map((staff: { id: string }) => ({
        user_id: staff.id,
        investor_id: null,
        title: 'New Arranger Payment Request',
        message: `An arranger has submitted a payment request for ${feeEvents.length} fee event(s) totaling ${total.toLocaleString()}.`,
        link: `/versotech_main/staff/fees?tab=invoices&invoice=${invoice.id}`,
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json(
      {
        data: invoice,
        message: 'Payment request created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/arrangers/me/payment-requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
