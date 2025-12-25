/**
 * Staff Sell Requests Management API
 * GET /api/staff/sell-requests/[id] - Get specific sell request (staff view)
 * PATCH /api/staff/sell-requests/[id] - Update sell request status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { auditLogger, AuditActions } from '@/lib/audit'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Note: 'approved' and 'rejected' statuses are now handled via the approvals system
// This route handles post-approval workflow: matching, in_progress, completed, cancelled
const updateSchema = z.object({
  status: z.enum(['matched', 'in_progress', 'completed', 'cancelled']).optional(),
  status_notes: z.string().max(1000).optional(),
  matched_buyer_id: z.string().uuid().optional().nullable(),
  matched_deal_id: z.string().uuid().optional().nullable()
})

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const staffRoles = ['staff_admin', 'ceo', 'staff_ops', 'lawyer']
    if (!profile || !staffRoles.includes(profile.role || '')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Get the sell request with full details
    const { data: sellRequest, error: fetchError } = await serviceSupabase
      .from('investor_sale_requests')
      .select(`
        *,
        investor:investors(
          id,
          legal_name,
          email,
          investor_type
        ),
        subscription:subscriptions(
          id,
          commitment,
          funded_amount,
          currency,
          num_shares,
          units,
          price_per_share,
          status
        ),
        deal:deals(id, name, status),
        vehicle:vehicles(id, name, type, series),
        matched_buyer:matched_buyer_id(id, legal_name, email),
        matched_deal:matched_deal_id(id, name),
        created_by_profile:created_by(id, display_name, email),
        updated_by_profile:updated_by(id, display_name, email)
      `)
      .eq('id', id)
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, display_name, email')
      .eq('id', user.id)
      .single()

    const staffRoles = ['staff_admin', 'ceo', 'staff_ops', 'lawyer']
    if (!profile || !staffRoles.includes(profile.role || '')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    // Get current sell request
    const { data: current, error: fetchError } = await serviceSupabase
      .from('investor_sale_requests')
      .select('*, investor:investors(id, legal_name)')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Sale request not found' }, { status: 404 })
    }

    // Build update object
    const updates: Record<string, any> = {
      updated_by: user.id
    }

    const { status, status_notes, matched_buyer_id, matched_deal_id } = validation.data

    if (status) {
      updates.status = status

      // Set timestamps based on status changes
      if (status === 'matched' && current.status !== 'matched') {
        updates.matched_at = new Date().toISOString()
      }
      if (status === 'completed') {
        updates.transfer_completed_at = new Date().toISOString()
      }
    }

    if (status_notes !== undefined) updates.status_notes = status_notes
    if (matched_buyer_id !== undefined) updates.matched_buyer_id = matched_buyer_id
    if (matched_deal_id !== undefined) updates.matched_deal_id = matched_deal_id

    // Apply update
    const { data: updated, error: updateError } = await serviceSupabase
      .from('investor_sale_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update sell request:', updateError)
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    // Create notification for investor on significant status changes
    if (status && status !== current.status) {
      const { data: investorUsers } = await serviceSupabase
        .from('investor_users')
        .select('user_id')
        .eq('investor_id', current.investor_id)
        .limit(1)

      if (investorUsers?.[0]?.user_id) {
        // Note: 'approved' and 'rejected' notifications are sent by the approvals system
        const statusMessages: Record<string, string> = {
          matched: 'A buyer has been found for your sale request.',
          in_progress: 'Your sale is being processed.',
          completed: 'Your sale has been completed successfully.'
        }

        if (statusMessages[status]) {
          const { error: notifError } = await serviceSupabase.from('investor_notifications').insert({
            user_id: investorUsers[0].user_id,
            investor_id: current.investor_id,
            title: `Sale Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: statusMessages[status],
            link: '/versotech_main/portfolio'
          })
          if (notifError) console.error('Failed to create notification:', notifError)
        }
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'investor_sale_requests' as any,
      entity_id: id,
      metadata: {
        previous_status: current.status,
        new_status: status || current.status,
        updates: validation.data,
        investor_name: (current.investor as any)?.legal_name
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Sale request updated successfully`
    })

  } catch (error) {
    console.error('Update sell request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
