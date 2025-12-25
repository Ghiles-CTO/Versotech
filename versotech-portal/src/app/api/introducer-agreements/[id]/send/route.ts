/**
 * Send Introducer Agreement API
 * POST /api/introducer-agreements/[id]/send - Send agreement to introducer for review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/introducer-agreements/[id]/send
 * Send agreement to introducer - changes status to pending_approval
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

    // Get agreement with introducer info
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('introducer_agreements')
      .select(`
        *,
        introducer:introducer_id (
          id,
          legal_name,
          email,
          user_id
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
      .from('introducer_agreements')
      .update({
        status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[introducer-agreements/send] Update error:', error)
      return NextResponse.json({ error: 'Failed to send agreement' }, { status: 500 })
    }

    // Create notification for introducer if they have a user account
    const introducer = agreement.introducer as any
    if (introducer?.user_id) {
      await serviceSupabase.from('investor_notifications').insert({
        user_id: introducer.user_id,
        investor_id: null, // Introducer notification, not investor
        title: 'New Fee Agreement',
        message: 'You have received a new fee agreement for review.',
        link: `/versotech_main/introducer-agreements/${id}`,
      })
    }

    return NextResponse.json({
      data,
      message: 'Agreement sent to introducer for review',
    })
  } catch (error) {
    console.error('[introducer-agreements/send] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
