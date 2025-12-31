/**
 * Request Invoice API for Partner Commissions
 * POST /api/arrangers/me/partner-commissions/[id]/request-invoice
 *
 * Updates commission status to 'invoice_requested' and sends notification to partner.
 * Implements User Story Row 13: Auto-notify partner to send invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/arrangers/me/partner-commissions/[id]/request-invoice
 * Request invoice from partner for a commission
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

    // Fetch commission with partner info
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('partner_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        partner_id,
        deal_id,
        partner:partners(id, name, legal_name, logo_url),
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
      .from('partner_commissions')
      .update({
        status: 'invoice_requested',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[partner-request-invoice] Error updating commission:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Get partner info
    const partner = Array.isArray(commission.partner) ? commission.partner[0] : commission.partner
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    // Find partner users to notify via partner_users table
    const { data: partnerUsers } = await serviceSupabase
      .from('partner_users')
      .select('user_id')
      .eq('partner_id', commission.partner_id)

    if (partnerUsers && partnerUsers.length > 0) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: commission.currency || 'USD',
      }).format(commission.accrual_amount)

      const dealText = deal?.name ? ` for ${deal.name}` : ''
      const arrangerText = arrangerEntity?.legal_name ? ` from ${arrangerEntity.legal_name}` : ''

      // Create notifications for all partner users
      const notifications = partnerUsers.map((pu: { user_id: string }) => ({
        user_id: pu.user_id,
        investor_id: null,
        title: 'Invoice Requested',
        message: `Please submit your invoice for commission of ${formattedAmount}${dealText}${arrangerText}.`,
        link: '/versotech_main/my-commissions',
        type: 'action_required',
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)

      console.log('[partner-request-invoice] Notifications sent to', partnerUsers.length, 'partner user(s)')
    } else {
      console.warn('[partner-request-invoice] No users found for partner:', commission.partner_id)
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'invoice_requested',
      entity_type: 'partner_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Invoice requested from partner',
        partner_id: commission.partner_id,
        partner_name: partner?.name || partner?.legal_name,
        deal_id: commission.deal_id,
        amount: commission.accrual_amount,
        currency: commission.currency,
        notifications_sent: partnerUsers?.length || 0,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      data: updatedCommission,
      message: 'Invoice request sent to partner',
      notifications_sent: partnerUsers?.length || 0,
    })
  } catch (error) {
    console.error('[partner-request-invoice] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
