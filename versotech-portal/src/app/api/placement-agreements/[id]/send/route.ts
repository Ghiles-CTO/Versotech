/**
 * Send Placement Agreement API
 * POST /api/placement-agreements/[id]/send - Send agreement to commercial partner for review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/placement-agreements/[id]/send
 * Send agreement to commercial partner - changes status to pending_approval
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

    // Check if user is staff
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')
    if (!isStaff) {
      return NextResponse.json({ error: 'Only staff can send agreements' }, { status: 403 })
    }

    // Get agreement with commercial partner info
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only send agreements in draft status' },
        { status: 400 }
      )
    }

    // Update status to pending_approval
    const { data, error } = await serviceSupabase
      .from('placement_agreements')
      .update({
        status: 'pending_approval',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[placement-agreements/send] Update error:', error)
      return NextResponse.json({ error: 'Failed to send agreement' }, { status: 500 })
    }

    // Find commercial partner user to notify
    const { data: cpUsers } = await serviceSupabase
      .from('commercial_partner_users')
      .select('user_id')
      .eq('commercial_partner_id', agreement.commercial_partner_id)

    // Create notifications for commercial partner users
    const cp = agreement.commercial_partner as any
    if (cpUsers && cpUsers.length > 0) {
      const notifications = cpUsers.map((cpUser: any) => ({
        user_id: cpUser.user_id,
        investor_id: null, // CP notification, not investor
        title: 'New Placement Agreement',
        message: 'You have received a new placement agreement for review.',
        link: `/versotech_main/placement-agreements/${id}`,
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    return NextResponse.json({
      data,
      message: 'Agreement sent to commercial partner for review',
    })
  } catch (error) {
    console.error('[placement-agreements/send] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
