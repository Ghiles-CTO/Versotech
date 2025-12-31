/**
 * Internal Approval API for Placement Agreements
 * POST /api/placement-agreements/[id]/internal-approve - CEO/Staff approves arranger-created agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/placement-agreements/[id]/internal-approve
 * Approves an arranger-created placement agreement (changes status from pending_internal_approval to draft)
 * Only staff/CEO can perform this action
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

    // Check if user is staff
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')
    if (!isStaff) {
      return NextResponse.json({ error: 'Only staff can approve agreements' }, { status: 403 })
    }

    // Get the agreement
    const { data: agreement, error: fetchError } = await serviceSupabase
      .from('placement_agreements')
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Verify status is pending_internal_approval
    if (agreement.status !== 'pending_internal_approval') {
      return NextResponse.json(
        { error: `Cannot approve agreement with status: ${agreement.status}` },
        { status: 400 }
      )
    }

    // Update status to draft (now it can be sent to CP)
    const { data: updated, error: updateError } = await serviceSupabase
      .from('placement_agreements')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('[placement-agreements/internal-approve] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to approve agreement' }, { status: 500 })
    }

    // Notify the arranger that their agreement was approved
    if (agreement.arranger_id && agreement.created_by) {
      try {
        const cp = Array.isArray(agreement.commercial_partner)
          ? agreement.commercial_partner[0]
          : agreement.commercial_partner

        // Notify the creator (arranger user)
        await serviceSupabase.from('investor_notifications').insert({
          user_id: agreement.created_by,
          investor_id: null,
          title: 'Placement Agreement Approved',
          message: `Your placement agreement with ${cp?.legal_name || 'the commercial partner'} has been approved. You can now send it for their review.`,
          link: `/versotech_main/placement-agreements/${id}`,
        })
      } catch (notifyError) {
        console.error('[placement-agreements/internal-approve] Notification error:', notifyError)
      }
    }

    return NextResponse.json({
      data: updated,
      message: 'Agreement approved successfully. It can now be sent to the commercial partner.',
    })
  } catch (error) {
    console.error('[placement-agreements/internal-approve] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
