/**
 * Request Invoice API for Commercial Partner Commissions
 * POST /api/arrangers/me/commercial-partner-commissions/[id]/request-invoice
 *
 * Updates commission status to 'invoice_requested' and sends notification to CP.
 * Implements User Story 2.4 Row 53: Send notification to CP to send invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

    // Check if user is an arranger
    const { data: arrangerUser, error: arrangerError } = await serviceSupabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single()

    if (arrangerError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get arranger entity info for notification
    const { data: arrangerEntity } = await serviceSupabase
      .from('arranger_entities')
      .select('legal_name')
      .eq('id', arrangerId)
      .single()

    // Fetch commission with CP info
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('commercial_partner_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        commercial_partner_id,
        deal_id,
        commercial_partner:commercial_partners(id, name, legal_name, contact_email),
        deal:deals(id, name)
      `)
      .eq('id', id)
      .eq('arranger_id', arrangerId)
      .single()

    if (fetchError || !commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Validate status - must be 'accrued'
    if (commission.status !== 'accrued') {
      return NextResponse.json(
        { error: `Cannot request invoice for commission with status '${commission.status}'. Must be 'accrued'.` },
        { status: 400 }
      )
    }

    // Update status to invoice_requested
    const { data: updatedCommission, error: updateError } = await serviceSupabase
      .from('commercial_partner_commissions')
      .update({
        status: 'invoice_requested',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[cp-request-invoice] Error updating commission:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Get CP info
    const cp = Array.isArray(commission.commercial_partner) ? commission.commercial_partner[0] : commission.commercial_partner
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    // Send notification to CP users
    const { data: cpUsers } = await serviceSupabase
      .from('commercial_partner_users')
      .select('user_id')
      .eq('commercial_partner_id', commission.commercial_partner_id)

    if (cpUsers && cpUsers.length > 0) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: commission.currency || 'USD',
      }).format(commission.accrual_amount)

      const dealText = deal?.name ? ` for ${deal.name}` : ''
      const arrangerText = arrangerEntity?.legal_name ? ` from ${arrangerEntity.legal_name}` : ''

      const notifications = cpUsers.map((cpu: any) => ({
        user_id: cpu.user_id,
        investor_id: null,
        title: 'Invoice Requested',
        message: `Please submit your invoice for commission of ${formattedAmount}${dealText}${arrangerText}.`,
        link: '/versotech_main/my-commissions',
        type: 'action_required',
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
      console.log('[cp-request-invoice] Sent', notifications.length, 'notifications to CP users')
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'invoice_requested',
      entity_type: 'commercial_partner_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Invoice requested from commercial partner',
        commercial_partner_id: commission.commercial_partner_id,
        commercial_partner_name: cp?.name || cp?.legal_name,
        deal_id: commission.deal_id,
        amount: commission.accrual_amount,
        currency: commission.currency,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      data: updatedCommission,
      message: 'Invoice request sent to commercial partner',
    })
  } catch (error) {
    console.error('[cp-request-invoice] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
