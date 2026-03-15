/**
 * Request Invoice API
 * POST /api/arrangers/me/introducer-commissions/[id]/request-invoice
 *
 * Updates commission status to 'invoice_requested' and sends notification to introducer.
 * Implements User Story Row 33: Auto-notify introducer to send invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createInvestorNotification } from '@/lib/notifications'
import { getEntityPrimaryAndAdminRecipients } from '@/lib/notifications/entity-recipient-groups'

/**
 * POST /api/arrangers/me/introducer-commissions/[id]/request-invoice
 * Request invoice from introducer for a commission
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

    // Fetch commission with introducer info
    const { data: commission, error: fetchError } = await serviceSupabase
      .from('introducer_commissions')
      .select(`
        id,
        status,
        accrual_amount,
        currency,
        introducer_id,
        deal_id,
        introducer:introducers(id, legal_name, email, user_id),
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
      .from('introducer_commissions')
      .update({
        status: 'invoice_requested',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[request-invoice] Error updating commission:', updateError)
      return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
    }

    // Get introducer info
    const introducer = Array.isArray(commission.introducer) ? commission.introducer[0] : commission.introducer
    const deal = Array.isArray(commission.deal) ? commission.deal[0] : commission.deal

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: commission.currency || 'USD',
    }).format(commission.accrual_amount)

    const dealText = deal?.name ? ` for ${deal.name}` : ''
    const arrangerText = arrangerEntity?.legal_name ? ` from ${arrangerEntity.legal_name}` : ''

    const recipientGroup = await getEntityPrimaryAndAdminRecipients({
      supabase: serviceSupabase,
      entityType: 'introducer',
      entityId: commission.introducer_id,
    })

    const recipientUserIds = recipientGroup.userIds.length > 0
      ? recipientGroup.userIds
      : typeof introducer?.user_id === 'string'
        ? [introducer.user_id]
        : []

    if (recipientUserIds.length === 0) {
      console.warn('[request-invoice] No user found for introducer:', commission.introducer_id)
    } else {
      for (const recipientUserId of recipientUserIds) {
        await createInvestorNotification({
          userId: recipientUserId,
          title: 'Invoice Requested',
          message: `Please submit your invoice for commission of ${formattedAmount}${dealText}${arrangerText}.`,
          link: '/versotech_main/my-commissions',
          type: 'introducer_invoice_requested',
          sendEmailNotification: true,
          createdBy: user.id,
          dealId: commission.deal_id,
        })
      }

      console.log('[request-invoice] Notification sent to introducer recipients:', recipientUserIds.length)
    }

    // Create audit log
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'commission',
      action: 'invoice_requested',
      entity_type: 'introducer_commission',
      entity_id: id,
      actor_id: user.id,
      action_details: {
        description: 'Invoice requested from introducer',
        introducer_id: commission.introducer_id,
        introducer_name: introducer?.legal_name,
        deal_id: commission.deal_id,
        amount: commission.accrual_amount,
        currency: commission.currency,
      },
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      data: updatedCommission,
      message: 'Invoice request sent to introducer',
    })
  } catch (error) {
    console.error('[request-invoice] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
