/**
 * Approve Introducer Agreement API
 * POST /api/introducer-agreements/[id]/approve - Introducer approves agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/introducer-agreements/[id]/approve
 * Introducer approves agreement - changes status to approved
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get agreement
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Check if user is the introducer for this agreement
    const { data: introducerUser } = await serviceSupabase
      .from('introducer_users')
      .select('introducer_id')
      .eq('user_id', user.id)
      .single()

    if (!introducerUser || introducerUser.introducer_id !== agreement.introducer_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (agreement.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Can only approve agreements pending approval' },
        { status: 400 }
      )
    }

    // Update status to approved
    const { data, error } = await serviceSupabase
      .from('introducer_agreements')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[introducer-agreements/approve] Update error:', error)
      return NextResponse.json({ error: 'Failed to approve agreement' }, { status: 500 })
    }

    // Get CEO/staff_admin user to notify
    const { data: ceoUsers } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    // Create notifications for CEO/staff_admin users
    const introducer = agreement.introducer as any
    if (ceoUsers && ceoUsers.length > 0) {
      const notifications = ceoUsers.map((ceo: any) => ({
        user_id: ceo.id,
        investor_id: null, // Staff notification, not investor
        title: 'Agreement Approved',
        message: `${introducer?.legal_name || 'Introducer'} approved their fee agreement. Ready for your signature.`,
        link: `/versotech_main/introducers/${agreement.introducer_id}?tab=agreements`,
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json({
      data,
      message: 'Agreement approved. Awaiting CEO signature.',
    })
  } catch (error) {
    console.error('[introducer-agreements/approve] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
