/**
 * Reject Introducer Agreement API
 * POST /api/introducer-agreements/[id]/reject - Introducer rejects agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().min(1).max(1000).optional(),
})

/**
 * POST /api/introducer-agreements/[id]/reject
 * Introducer rejects agreement - changes status to rejected (terminal)
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

    // Parse optional reason
    let reason: string | undefined
    try {
      const body = await request.json()
      const validation = rejectSchema.safeParse(body)
      if (validation.success) {
        reason = validation.data.reason
      }
    } catch {
      // No body provided, that's fine
    }

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
        { error: 'Can only reject agreements pending approval' },
        { status: 400 }
      )
    }

    // Update status to rejected (append rejection reason to existing notes)
    const existingNotes = agreement.notes || ''
    const rejectionNote = reason ? `\n\n[REJECTED ${new Date().toISOString().split('T')[0]}]: ${reason}` : ''
    const { data, error } = await serviceSupabase
      .from('introducer_agreements')
      .update({
        status: 'rejected',
        notes: existingNotes + rejectionNote,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[introducer-agreements/reject] Update error:', error)
      return NextResponse.json({ error: 'Failed to reject agreement' }, { status: 500 })
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
        title: 'Agreement Rejected',
        message: `${introducer?.legal_name || 'Introducer'} rejected their fee agreement.${reason ? ` Reason: ${reason}` : ''}`,
        link: `/versotech_main/introducers/${agreement.introducer_id}?tab=agreements`,
      }))

      await serviceSupabase.from('investor_notifications').insert(notifications)
    }

    // Notify arranger if this agreement is linked to one
    if (agreement.arranger_id) {
      const { data: arrangerUsers } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', agreement.arranger_id)
        .limit(5)

      if (arrangerUsers && arrangerUsers.length > 0) {
        const arrangerNotifications = arrangerUsers.map((au: any) => ({
          user_id: au.user_id,
          investor_id: null,
          title: 'Introducer Agreement Rejected',
          message: `${introducer?.legal_name || 'Introducer'} rejected the fee agreement.${reason ? ` Reason: ${reason}` : ''}`,
          link: `/versotech_main/my-introducers`,
        }))

        await serviceSupabase.from('investor_notifications').insert(arrangerNotifications)
      }
    }

    return NextResponse.json({
      data,
      message: 'Agreement rejected.',
    })
  } catch (error) {
    console.error('[introducer-agreements/reject] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
