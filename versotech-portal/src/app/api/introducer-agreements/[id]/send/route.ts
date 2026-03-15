/**
 * Send Introducer Agreement API
 * POST /api/introducer-agreements/[id]/send - Send agreement to introducer for review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { createInvestorNotification } from '@/lib/notifications'
import { getEntityPrimaryAndAdminRecipients } from '@/lib/notifications/entity-recipient-groups'
import {
  buildIntroducerCommercialBlockPayload,
  getIntroducerCommercialEligibility,
} from '@/lib/introducers/commercial-eligibility'

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

    // Check user personas
    const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
      p_user_id: user.id,
    })

    const isStaff = personas?.some((p: any) => p.persona_type === 'staff')
    const arrangerPersona = personas?.find((p: any) => p.persona_type === 'arranger')

    // Get agreement with introducer info first to check ownership
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

    // Authorization: staff can send any agreement, arrangers can only send their own
    const isArrangerOwner = arrangerPersona && agreement.arranger_id === arrangerPersona.entity_id
    if (!isStaff && !isArrangerOwner) {
      return NextResponse.json({ error: 'Only staff or the linked arranger can send agreements' }, { status: 403 })
    }

    if (agreement.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only send agreements in draft status' },
        { status: 400 }
      )
    }

    if (agreement.fee_plan_id) {
      const eligibility = await getIntroducerCommercialEligibility({
        supabase: serviceSupabase,
        introducerId: agreement.introducer_id,
      })

      if (!eligibility) {
        return NextResponse.json({ error: 'Failed to verify introducer eligibility' }, { status: 500 })
      }

      if (!eligibility.eligible) {
        return NextResponse.json(buildIntroducerCommercialBlockPayload(eligibility), {
          status: 409,
        })
      }
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

    // Audit log: Agreement sent for review (GAP-8)
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.AGREEMENT_SENT,
      entity: AuditEntities.INTRODUCER_AGREEMENTS,
      entity_id: id,
      metadata: {
        introducer_id: agreement.introducer_id,
        arranger_id: agreement.arranger_id,
        previous_status: 'draft',
        new_status: 'pending_approval'
      }
    })

    // Create notification for the introducer's primary/admin users
    const introducer = agreement.introducer as any
    const recipientGroup = await getEntityPrimaryAndAdminRecipients({
      supabase: serviceSupabase,
      entityType: 'introducer',
      entityId: agreement.introducer_id,
    })

    const recipientUserIds = recipientGroup.userIds.length > 0
      ? recipientGroup.userIds
      : typeof introducer?.user_id === 'string'
        ? [introducer.user_id]
        : []

    for (const recipientUserId of recipientUserIds) {
      await createInvestorNotification({
        userId: recipientUserId,
        title: 'New Fee Agreement',
        message: 'You have received a new fee agreement for review.',
        link: `/versotech_main/introducer-agreements/${id}`,
        type: 'introducer_agreement_pending',
        createdBy: user.id,
        sendEmailNotification: true,
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
