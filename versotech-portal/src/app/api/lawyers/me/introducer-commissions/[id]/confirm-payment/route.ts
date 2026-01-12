/**
 * Lawyer Confirm Payment API
 * POST /api/lawyers/me/introducer-commissions/[id]/confirm-payment
 *
 * Marks commission as paid and notifies all parties.
 * Implements User Story Row 32 (Section 3.3): Lawyer sends payment complete notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const confirmPaymentSchema = z.object({
  bank_reference: z.string().optional(),
  payment_date: z.string().optional(), // ISO date string
  notes: z.string().optional(),
})

/**
 * POST /api/lawyers/me/introducer-commissions/[id]/confirm-payment
 * Confirm payment has been made to introducer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a lawyer
    const { data: lawyerUser, error: lawyerError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerError || !lawyerUser) {
      return NextResponse.json({ error: 'Not a lawyer' }, { status: 403 })
    }

    // Parse body
    const body = await request.json().catch(() => ({}))
    const validation = confirmPaymentSchema.safeParse(body)
    const paymentData = validation.success ? validation.data : {}

    // Fetch commission with all related data
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('introducer_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        introducer_id,
        arranger_id,
        deal_id,
        invoice_id,
        notes,
        introducer:introducers(id, legal_name, email),
        arranger:arranger_entities(id, legal_name),
        deal:deals(id, name)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Validate status - must be 'invoiced'
    if (commission.status !== 'invoiced') {
      return NextResponse.json(
        { error: `Cannot confirm payment for commission with status '${commission.status}'. Must be 'invoiced'.` },
        { status: 400 }
      )
    }

    // Verify lawyer is assigned to this deal (if deal exists)
    if (commission.deal_id) {
      const { data: assignment } = await serviceSupabase
        .from('deal_lawyer_assignments')
        .select('id')
        .eq('deal_id', commission.deal_id)
        .eq('lawyer_id', lawyerUser.lawyer_id)
        .maybeSingle()

      // If no assignment found, check if user is staff_admin (CEO)
      if (!assignment) {
        const { data: profile } = await serviceSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'staff_admin') {
          return NextResponse.json(
            { error: 'You are not assigned to this deal' },
            { status: 403 }
          )
        }
      }
    }

    const introducer = Array.isArray(commission.introducer) ? commission.introducer[0] : commission.introducer
    const arranger = Array.isArray(commission.arranger) ? commission.arranger[0] : commission.arranger
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    const paidAt = paymentData.payment_date
      ? new Date(paymentData.payment_date).toISOString()
      : new Date().toISOString()

    // Update commission to 'paid'
    const { error: updateError } = await serviceSupabase
      .from('introducer_commissions')
      .update({
        status: 'paid',
        paid_at: paidAt,
        payment_reference: paymentData.bank_reference || null,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: paymentData.notes
          ? (commission.notes ? `${commission.notes}\n\nPayment confirmed: ${paymentData.notes}` : `Payment confirmed: ${paymentData.notes}`)
          : commission.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('[confirm-payment] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: commission.currency || 'USD',
    }).format(commission.accrual_amount)

    // Collect notifications
    const notificationsToCreate: any[] = []

    // 1. Notify arranger users
    if (commission.arranger_id) {
      const { data: arrangerUsers } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', commission.arranger_id)

      if (arrangerUsers) {
        for (const au of arrangerUsers) {
          notificationsToCreate.push({
            user_id: au.user_id,
            investor_id: null,
            title: 'Commission Payment Confirmed',
            message: `Payment of ${formattedAmount} to ${introducer?.legal_name || 'Introducer'} has been confirmed${deal ? ` for ${deal.name}` : ''}.`,
            link: `/versotech_main/my-introducers`,
            type: 'success',
          })
        }
      }
    }

    // 2. Notify introducer users
    if (commission.introducer_id) {
      const { data: introducerUsers } = await serviceSupabase
        .from('introducer_users')
        .select('user_id')
        .eq('introducer_id', commission.introducer_id)

      if (introducerUsers) {
        for (const iu of introducerUsers) {
          notificationsToCreate.push({
            user_id: iu.user_id,
            investor_id: null,
            title: 'Commission Payment Received',
            message: `Your commission payment of ${formattedAmount}${deal ? ` for ${deal.name}` : ''} has been processed${paymentData.bank_reference ? `. Reference: ${paymentData.bank_reference}` : ''}.`,
            link: `/versotech_main/my-commissions`,
            type: 'success',
          })
        }
      }
    }

    // 3. Notify staff_admin (CEO)
    const { data: staffAdmins } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .neq('id', user.id) // Don't notify the user who confirmed
      .limit(5)

    if (staffAdmins) {
      for (const admin of staffAdmins) {
        notificationsToCreate.push({
          user_id: admin.id,
          investor_id: null,
          title: 'Introducer Payment Confirmed',
          message: `Payment of ${formattedAmount} to ${introducer?.legal_name || 'Introducer'} has been confirmed by lawyer.`,
          link: `/versotech_main/fees`,
          type: 'info',
        })
      }
    }

    // Send notifications to non-lawyer recipients (investor_notifications table)
    if (notificationsToCreate.length > 0) {
      await serviceSupabase.from('investor_notifications').insert(notificationsToCreate)
      console.log('[confirm-payment] Sent', notificationsToCreate.length, 'notifications to investor_notifications')
    }

    // Send confirmation notification to the lawyer actor (notifications table - lawyers query this table)
    await serviceSupabase.from('notifications').insert({
      user_id: user.id,
      title: 'Payment Confirmation Sent',
      message: `You confirmed payment of ${formattedAmount} to ${introducer?.legal_name || 'Introducer'}${deal ? ` for ${deal.name}` : ''}.`,
      link: `/versotech_main/lawyer-reconciliation`,
      type: 'success',
      read: false,
    })
    console.log('[confirm-payment] Sent confirmation to lawyer in notifications table')

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'payment_confirmed',
      entity_type: 'introducer_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Introducer commission payment confirmed by lawyer',
        introducer_id: commission.introducer_id,
        introducer_name: introducer?.legal_name,
        arranger_id: commission.arranger_id,
        arranger_name: arranger?.legal_name,
        deal_id: commission.deal_id,
        deal_name: deal?.name,
        amount: commission.accrual_amount,
        currency: commission.currency,
        bank_reference: paymentData.bank_reference,
        payment_date: paidAt,
        notifications_sent: notificationsToCreate.length,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Payment confirmed. ${notificationsToCreate.length} notification(s) sent.`,
      paid_at: paidAt,
      payment_reference: paymentData.bank_reference || null,
    })
  } catch (error) {
    console.error('[confirm-payment] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
