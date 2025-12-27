/**
 * Investor Sell Request Detail API
 * GET /api/investor/sell-request/[id] - Get specific sell request
 * DELETE /api/investor/sell-request/[id] - Cancel a pending request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor_id for this user
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 })
    }

    // Get the specific sell request
    const { data: sellRequest, error: fetchError } = await serviceSupabase
      .from('investor_sale_requests')
      .select(`
        *,
        subscription:subscriptions(
          id,
          commitment,
          funded_amount,
          currency,
          num_shares,
          units,
          vehicle:vehicles(id, name, type, series)
        ),
        deal:deals(id, name),
        matched_buyer:matched_buyer_id(id, legal_name)
      `)
      .eq('id', id)
      .eq('investor_id', investorUser.investor_id)
      .single()

    if (fetchError || !sellRequest) {
      return NextResponse.json({ error: 'Sale request not found' }, { status: 404 })
    }

    return NextResponse.json({ data: sellRequest })

  } catch (error) {
    console.error('Get sell request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor_id for this user
    const { data: investorUser } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 })
    }

    // Get the sell request to verify ownership and status
    const { data: sellRequest, error: fetchError } = await serviceSupabase
      .from('investor_sale_requests')
      .select('id, status, investor_id')
      .eq('id', id)
      .eq('investor_id', investorUser.investor_id)
      .single()

    if (fetchError || !sellRequest) {
      return NextResponse.json({ error: 'Sale request not found' }, { status: 404 })
    }

    // Only allow cancellation of pending requests
    if (sellRequest.status !== 'pending') {
      return NextResponse.json({
        error: 'Only pending requests can be cancelled',
        current_status: sellRequest.status
      }, { status: 400 })
    }

    // Update status to cancelled
    const { error: updateError } = await serviceSupabase
      .from('investor_sale_requests')
      .update({
        status: 'cancelled',
        updated_by: user.id
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to cancel sell request:', updateError)
      return NextResponse.json({ error: 'Failed to cancel request' }, { status: 500 })
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'investor_sale_requests' as any,
      entity_id: id,
      metadata: {
        previous_status: 'pending',
        new_status: 'cancelled',
        action: 'investor_cancelled'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Sale request cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel sell request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
