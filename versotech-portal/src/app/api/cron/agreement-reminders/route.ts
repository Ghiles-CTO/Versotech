/**
 * Agreement Reminders Cron Job
 * POST /api/cron/agreement-reminders - Send reminders for pending agreements
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron, or external scheduler)
 * It checks for:
 * - Introducer agreements awaiting signature for more than 7 days
 * - Placement agreements awaiting signature for more than 7 days
 * - Signature requests expiring within 2 days
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Verify cron secret to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const results = {
    introducerReminders: 0,
    placementReminders: 0,
    expiringSignatures: 0,
    errors: [] as string[],
  }

  try {
    // 1. Check for introducer agreements awaiting CEO signature for > 7 days
    console.log('[REMINDERS] Checking introducer agreements pending CEO signature...')
    const { data: pendingIntroducerAgreements, error: iaError } = await supabase
      .from('introducer_agreements')
      .select(`
        id,
        introducer_id,
        updated_at,
        introducer:introducer_id (
          id,
          legal_name
        )
      `)
      .eq('status', 'approved')
      .lt('updated_at', sevenDaysAgo.toISOString())

    if (iaError) {
      results.errors.push(`Introducer agreements query failed: ${iaError.message}`)
    } else if (pendingIntroducerAgreements && pendingIntroducerAgreements.length > 0) {
      // Notify staff about stale agreements
      const { data: staffUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['staff_admin', 'ceo'])
        .limit(5)

      if (staffUsers && staffUsers.length > 0) {
        for (const agreement of pendingIntroducerAgreements) {
          const introducer = agreement.introducer as any
          const notifications = staffUsers.map((staff: { id: string }) => ({
            user_id: staff.id,
            investor_id: null,
            title: 'Reminder: Introducer Agreement Awaiting Signature',
            message: `The fee agreement for ${introducer?.legal_name || 'Introducer'} has been pending your signature for over 7 days.`,
            link: `/versotech_main/introducer-agreements/${agreement.id}`,
          }))

          await supabase.from('investor_notifications').insert(notifications)
          results.introducerReminders++
        }
      }
    }

    // 2. Check for placement agreements awaiting CEO signature for > 7 days
    console.log('[REMINDERS] Checking placement agreements pending CEO signature...')
    const { data: pendingPlacementAgreements, error: paError } = await supabase
      .from('placement_agreements')
      .select(`
        id,
        commercial_partner_id,
        updated_at,
        commercial_partner:commercial_partner_id (
          id,
          legal_name,
          display_name
        )
      `)
      .eq('status', 'approved')
      .lt('updated_at', sevenDaysAgo.toISOString())

    if (paError) {
      results.errors.push(`Placement agreements query failed: ${paError.message}`)
    } else if (pendingPlacementAgreements && pendingPlacementAgreements.length > 0) {
      const { data: staffUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['staff_admin', 'ceo'])
        .limit(5)

      if (staffUsers && staffUsers.length > 0) {
        for (const agreement of pendingPlacementAgreements) {
          const cp = agreement.commercial_partner as any
          const notifications = staffUsers.map((staff: { id: string }) => ({
            user_id: staff.id,
            investor_id: null,
            title: 'Reminder: Placement Agreement Awaiting Signature',
            message: `The placement agreement for ${cp?.display_name || cp?.legal_name || 'Commercial Partner'} has been pending your signature for over 7 days.`,
            link: `/versotech_main/placement-agreements/${agreement.id}`,
          }))

          await supabase.from('investor_notifications').insert(notifications)
          results.placementReminders++
        }
      }
    }

    // 3. Check for signature requests expiring within 2 days
    console.log('[REMINDERS] Checking expiring signature requests...')
    const { data: expiringSignatures, error: sigError } = await supabase
      .from('signature_requests')
      .select(`
        id,
        signer_email,
        signer_name,
        signer_role,
        document_type,
        token_expires_at,
        introducer_agreement_id,
        placement_agreement_id,
        subscription_id
      `)
      .eq('status', 'pending')
      .gt('token_expires_at', now.toISOString())
      .lt('token_expires_at', twoDaysFromNow.toISOString())

    if (sigError) {
      results.errors.push(`Signature requests query failed: ${sigError.message}`)
    } else if (expiringSignatures && expiringSignatures.length > 0) {
      for (const sig of expiringSignatures) {
        // Find the user to notify based on signer role
        let userId: string | null = null
        let link = '/versotech_main/versosign'

        if (sig.signer_role === 'introducer' && sig.introducer_agreement_id) {
          // Find introducer user
          const { data: introducerAgreement } = await supabase
            .from('introducer_agreements')
            .select('introducer_id')
            .eq('id', sig.introducer_agreement_id)
            .single()

          if (introducerAgreement) {
            const { data: introducerUser } = await supabase
              .from('introducer_users')
              .select('user_id')
              .eq('introducer_id', introducerAgreement.introducer_id)
              .maybeSingle()

            userId = introducerUser?.user_id || null
            link = `/versotech_main/introducer-agreements/${sig.introducer_agreement_id}`
          }
        } else if (sig.signer_role === 'commercial_partner' && sig.placement_agreement_id) {
          // Find CP user
          const { data: placementAgreement } = await supabase
            .from('placement_agreements')
            .select('commercial_partner_id')
            .eq('id', sig.placement_agreement_id)
            .single()

          if (placementAgreement) {
            const { data: cpUser } = await supabase
              .from('commercial_partner_users')
              .select('user_id')
              .eq('commercial_partner_id', placementAgreement.commercial_partner_id)
              .maybeSingle()

            userId = cpUser?.user_id || null
            link = `/versotech_main/placement-agreements/${sig.placement_agreement_id}`
          }
        } else if (sig.signer_role === 'admin' || sig.signer_role === 'arranger') {
          // Find staff user by email
          const { data: staffUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', sig.signer_email)
            .maybeSingle()

          userId = staffUser?.id || null
        }

        if (userId) {
          const expiresAt = new Date(sig.token_expires_at)
          const hoursRemaining = Math.round((expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000))

          await supabase.from('investor_notifications').insert({
            user_id: userId,
            investor_id: null,
            title: 'Signature Request Expiring Soon',
            message: `Your signature request for ${sig.document_type.replace('_', ' ')} will expire in ${hoursRemaining} hours. Please sign before it expires.`,
            link,
          })

          results.expiringSignatures++
        }
      }
    }

    console.log('[REMINDERS] Cron job completed:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[REMINDERS] Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
