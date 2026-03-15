/**
 * Approve Introducer Agreement API
 * POST /api/introducer-agreements/[id]/approve - Introducer approves agreement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import {
  readActivePersonaCookieValues,
  resolveActiveIntroducerLink,
} from '@/lib/kyc/active-introducer-link'
import { createInvestorNotification } from '@/lib/notifications'

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

    const { cookiePersonaType, cookiePersonaId } = readActivePersonaCookieValues(request.cookies)
    const { link: introducerUser, error: introducerUserError } = await resolveActiveIntroducerLink<{
      introducer_id: string
    }>({
      supabase: serviceSupabase,
      userId: user.id,
      cookiePersonaType,
      cookiePersonaId,
      select: 'introducer_id',
    })

    if (introducerUserError) {
      console.error('[introducer-agreements/approve] Failed to resolve introducer link:', introducerUserError)
      return NextResponse.json({ error: 'Failed to resolve introducer account' }, { status: 500 })
    }

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

    // Audit log: Agreement approved by introducer (GAP-8)
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.AGREEMENT_APPROVED,
      entity: AuditEntities.INTRODUCER_AGREEMENTS,
      entity_id: id,
      metadata: {
        introducer_id: agreement.introducer_id,
        arranger_id: agreement.arranger_id,
        previous_status: 'pending_approval',
        new_status: 'approved'
      }
    })

    // Get CEO/staff_admin user to notify
    const { data: ceoUsers } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'staff_admin')
      .limit(5)

    // Create notifications for CEO/staff_admin users
    const introducer = agreement.introducer as any
    if (ceoUsers && ceoUsers.length > 0) {
      for (const ceo of ceoUsers as Array<{ id: string }>) {
        try {
          await createInvestorNotification({
            userId: ceo.id,
            title: 'Agreement Approved',
            message: `${introducer?.legal_name || 'Introducer'} approved their fee agreement. Ready for your signature.`,
            link: `/versotech_main/introducers/${agreement.introducer_id}?tab=agreements`,
            type: 'introducer_agreement_pending',
            createdBy: user.id,
            sendEmailNotification: true,
          })
        } catch (notificationError) {
          console.error('[introducer-agreements/approve] Failed to notify staff recipient:', notificationError)
        }
      }
    }

    // Notify arranger if this agreement is linked to one
    if (agreement.arranger_id) {
      const { data: arrangerUsers } = await serviceSupabase
        .from('arranger_users')
        .select('user_id')
        .eq('arranger_id', agreement.arranger_id)
        .limit(5)

      if (arrangerUsers && arrangerUsers.length > 0) {
        for (const arrangerUser of arrangerUsers as Array<{ user_id: string }>) {
          try {
            await createInvestorNotification({
              userId: arrangerUser.user_id,
              title: 'Introducer Agreement Approved',
              message: `${introducer?.legal_name || 'Introducer'} approved the fee agreement. Ready for your signature.`,
              link: '/versotech_main/my-introducers',
              type: 'introducer_agreement_pending',
              createdBy: user.id,
              sendEmailNotification: true,
            })
          } catch (notificationError) {
            console.error('[introducer-agreements/approve] Failed to notify arranger recipient:', notificationError)
          }
        }
      }
    }

    return NextResponse.json({
      data,
      message: 'Agreement approved. Awaiting signature.',
    })
  } catch (error) {
    console.error('[introducer-agreements/approve] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
