/**
 * Lawyer Confirm Payment API
 * POST /api/lawyers/me/commercial-partner-commissions/[id]/confirm-payment
 *
 * Marks commercial partner commission as paid and notifies all parties.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const confirmPaymentSchema = z.object({
  bank_reference: z.string().optional(),
  payment_date: z.string().optional(),
  notes: z.string().optional(),
})

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

    const { data: lawyerUser, error: lawyerError } = await serviceSupabase
      .from('lawyer_users')
      .select('lawyer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (lawyerError || !lawyerUser) {
      return NextResponse.json({ error: 'Not a lawyer' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const validation = confirmPaymentSchema.safeParse(body)
    const paymentData = validation.success ? validation.data : {}

    const { data: commission, error: fetchError } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        commercial_partner_id,
        arranger_id,
        deal_id,
        invoice_id,
        notes,
        commercial_partner:commercial_partner_id(id, name, legal_name, display_name, contact_name, contact_email),
        arranger:arranger_id(id, legal_name),
        deal:deal_id(id, name)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    if (commission.status !== 'invoiced') {
      return NextResponse.json(
        { error: `Cannot confirm payment for commission with status '${commission.status}'. Must be 'invoiced'.` },
        { status: 400 }
      )
    }

    if (commission.deal_id) {
      const { data: assignment } = await serviceSupabase
        .from('deal_lawyer_assignments')
        .select('id')
        .eq('deal_id', commission.deal_id)
        .eq('lawyer_id', lawyerUser.lawyer_id)
        .maybeSingle()

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

    const commercialPartner = Array.isArray(commission.commercial_partner)
      ? commission.commercial_partner[0]
      : commission.commercial_partner
    const arranger = Array.isArray(commission.arranger) ? commission.arranger[0] : commission.arranger
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    const paidAt = paymentData.payment_date
      ? new Date(paymentData.payment_date).toISOString()
      : new Date().toISOString()

    const { error: updateError } = await serviceSupabase
      .from('commercial_partner_commissions')
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

    const notificationsToCreate: any[] = []

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
            message: `Payment of ${formattedAmount} to ${commercialPartner?.legal_name || commercialPartner?.display_name || commercialPartner?.name || 'Commercial Partner'} has been confirmed${deal ? ` for ${deal.name}` : ''}.`,
            link: `/versotech_main/my-commercial-partners`,
            type: 'success',
          })
        }
      }
    }

    if (commission.commercial_partner_id) {
      const { data: cpUsers } = await serviceSupabase
        .from('commercial_partner_users')
        .select('user_id')
        .eq('commercial_partner_id', commission.commercial_partner_id)

      if (cpUsers) {
        for (const cpu of cpUsers) {
          notificationsToCreate.push({
            user_id: cpu.user_id,
            investor_id: null,
            title: 'Commission Payment Received',
            message: `Your commission payment of ${formattedAmount}${deal ? ` for ${deal.name}` : ''} has been processed${paymentData.bank_reference ? `. Reference: ${paymentData.bank_reference}` : ''}.`,
            link: `/versotech_main/my-commissions`,
            type: 'success',
          })
        }
      }
    }

    const { data: staffAdmins } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .neq('id', user.id)
      .limit(5)

    if (staffAdmins) {
      for (const admin of staffAdmins) {
        notificationsToCreate.push({
          user_id: admin.id,
          investor_id: null,
          title: 'Commercial Partner Payment Confirmed',
          message: `Payment of ${formattedAmount} to ${commercialPartner?.legal_name || commercialPartner?.display_name || commercialPartner?.name || 'Commercial Partner'} has been confirmed by lawyer.`,
          link: `/versotech_main/fees`,
          type: 'info',
        })
      }
    }

    if (notificationsToCreate.length > 0) {
      await serviceSupabase.from('investor_notifications').insert(notificationsToCreate)
    }

    await serviceSupabase.from('notifications').insert({
      user_id: user.id,
      title: 'Payment Confirmation Sent',
      message: `You confirmed payment of ${formattedAmount} to ${commercialPartner?.legal_name || commercialPartner?.display_name || commercialPartner?.name || 'Commercial Partner'}${deal ? ` for ${deal.name}` : ''}.`,
      link: `/versotech_main/lawyer-reconciliation`,
      type: 'success',
      read: false,
    })

    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'payment_confirmed',
      entity_type: 'commercial_partner_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Commercial partner commission payment confirmed by lawyer',
        commercial_partner_id: commission.commercial_partner_id,
        commercial_partner_name: commercialPartner?.legal_name || commercialPartner?.display_name || commercialPartner?.name,
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
