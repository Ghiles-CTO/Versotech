/**
 * Termsheet Close Date Notification Cron Job
 *
 * GET /api/cron/deal-close-check
 *
 * Cron job to notify staff when TERMSHEETS reach their completion date.
 * - Sends one notification to staff/CEO users for EACH termsheet
 * - Does NOT create close approvals automatically
 *
 * Closing actions still run only through the manual Request Close workflow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createInvestorNotification } from '@/lib/notifications'
import { createServiceClient } from '@/lib/supabase/server'
import { getCeoSigner } from '@/lib/staff/ceo-signer'

export const dynamic = 'force-dynamic'

type TermsheetCloseNotificationResult = {
  termsheetId: string
  dealId: string
  dealName: string
  notificationsCreated?: number
  created: boolean
  skippedReason?: string
}

const STAFF_ROLES = ['ceo', 'staff_admin', 'staff_ops', 'staff_rm']

async function getFallbackRequesterId(supabase: ReturnType<typeof createServiceClient>) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .in('role', STAFF_ROLES)
    .order('role', { ascending: true })
    .limit(1)
    .maybeSingle()

  return profile?.id || null
}

async function getNotificationRecipientIds(supabase: ReturnType<typeof createServiceClient>) {
  const recipientIds = new Set<string>()

  const [{ data: staffProfiles }, { data: ceoUsers }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id')
      .in('role', STAFF_ROLES),
    supabase
      .from('ceo_users')
      .select('user_id')
  ])

  for (const profile of staffProfiles || []) {
    if (profile.id) recipientIds.add(profile.id)
  }

  for (const ceoUser of ceoUsers || []) {
    if (ceoUser.user_id) recipientIds.add(ceoUser.user_id)
  }

  return [...recipientIds]
}

function formatCompletionDateLabel(completionDate: string) {
  const parsed = new Date(completionDate)
  if (Number.isNaN(parsed.getTime())) return completionDate

  return `${parsed.toLocaleString('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} UTC`
}

interface TermsheetWithDeal {
  id: string
  deal_id: string
  version: number
  status: string
  completion_date: string
  closed_processed_at: string | null
  subscription_fee_percent: number | null
  deal: {
    id: string
    name: string
    company_name: string | null
    status: string
    currency: string | null
    vehicle_id: string | null
  }[] | {
    id: string
    name: string
    company_name: string | null
    status: string
    currency: string | null
    vehicle_id: string | null
  } | null
}

async function buildTermsheetCloseMetadata(
  supabase: ReturnType<typeof createServiceClient>,
  termsheet: TermsheetWithDeal
) {
  const dealId = termsheet.deal_id
  // Normalize deal (Supabase may return array or single object)
  const deal = Array.isArray(termsheet.deal) ? termsheet.deal[0] : termsheet.deal

  // Get funded subscriptions linked to this termsheet via deal_memberships
  const { data: fundedSubs } = await supabase
    .from('subscriptions')
    .select('id, funded_amount, investor_id')
    .eq('deal_id', dealId)
    .eq('status', 'funded')
    .eq('term_sheet_id', termsheet.id)

  const fundedCount = fundedSubs?.length || 0
  const fundedTotal = (fundedSubs || []).reduce(
    (sum, sub) => sum + (Number(sub.funded_amount) || 0),
    0
  )

  // Get fee plans linked to this termsheet
  const { data: feePlans } = await supabase
    .from('fee_plans')
    .select('status, partner_id, introducer_id, commercial_partner_id')
    .eq('deal_id', dealId)
    .eq('term_sheet_id', termsheet.id)
    .eq('is_active', true)

  const feePlanStatusCounts = (feePlans || []).reduce<Record<string, number>>(
    (acc, plan) => {
      const key = plan.status || 'draft'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {}
  )

  const partnerIds = new Set((feePlans || []).map(fp => fp.partner_id).filter(Boolean))
  const introducerIds = new Set((feePlans || []).map(fp => fp.introducer_id).filter(Boolean))
  const commercialPartnerIds = new Set((feePlans || []).map(fp => fp.commercial_partner_id).filter(Boolean))

  return {
    termsheet_id: termsheet.id,
    termsheet_version: termsheet.version,
    completion_date: termsheet.completion_date,
    deal_id: dealId,
    deal_name: deal?.name || 'Unknown Deal',
    company_name: deal?.company_name || null,
    deal_status: deal?.status || null,
    currency: deal?.currency || null,
    funded_subscriptions_count: fundedCount,
    funded_amount_total: fundedTotal,
    fee_plan_counts: {
      total: feePlans?.length || 0,
      by_status: feePlanStatusCounts,
      partners: partnerIds.size,
      introducers: introducerIds.size,
      commercial_partners: commercialPartnerIds.size
    }
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results: TermsheetCloseNotificationResult[] = []
  let totalTermsheetsChecked = 0
  let notificationsCreated = 0

  try {
    // Query TERMSHEETS with completion_date reached, not yet processed
    const { data: termsheets, error: queryError } = await supabase
      .from('deal_fee_structures')
      .select(`
        id,
        deal_id,
        version,
        status,
        completion_date,
        closed_processed_at,
        subscription_fee_percent,
        deal:deals!deal_fee_structures_deal_id_fkey (
          id,
          name,
          company_name,
          status,
          currency,
          vehicle_id
        )
      `)
      .eq('status', 'published')
      .not('completion_date', 'is', null)
      .is('closed_processed_at', null)
      .lte('completion_date', now.toISOString())

    if (queryError) {
      console.error('[termsheet-close-cron] Failed to query termsheets:', queryError)
      return NextResponse.json(
        { error: 'Failed to query termsheets', details: queryError },
        { status: 500 }
      )
    }

    if (!termsheets || termsheets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No termsheets ready for close date notifications',
        termsheetsChecked: 0,
        notificationsCreated: 0
      })
    }

    totalTermsheetsChecked = termsheets.length
    const ceoSigner = await getCeoSigner(supabase)
    const fallbackRequesterId = ceoSigner?.id || await getFallbackRequesterId(supabase)
    const recipientIds = await getNotificationRecipientIds(supabase)

    if (recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'No staff recipients found for close date notifications' },
        { status: 500 }
      )
    }

    for (const termsheet of termsheets as unknown as TermsheetWithDeal[]) {
      // Normalize deal (Supabase may return array or single object)
      const deal = Array.isArray((termsheet as any).deal) ? (termsheet as any).deal[0] : termsheet.deal

      // Skip if deal is not in appropriate status
      // Valid statuses from deal_status_enum: draft, open, allocation_pending, closed, cancelled
      // We process: open (active deal), allocation_pending (finalizing), closed (already closed but termsheet not processed)
      const dealStatus = deal?.status
      if (!dealStatus || !['open', 'allocation_pending', 'closed'].includes(dealStatus)) {
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: `Deal status not ready: ${dealStatus}`
        })
        continue
      }

      const { data: existingApproval } = await supabase
        .from('approvals')
        .select('id, status')
        .eq('entity_type', 'termsheet_close')
        .eq('entity_id', termsheet.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingApproval) {
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: 'Manual close request already pending'
        })
        continue
      }

      // Check which recipients have already been notified for THIS termsheet
      const { data: existingNotifications } = await supabase
        .from('investor_notifications')
        .select('user_id')
        .eq('deal_id', termsheet.deal_id)
        .contains('data', {
          notification_kind: 'termsheet_close_due',
          termsheet_id: termsheet.id,
        })

      const alreadyNotified = new Set((existingNotifications || []).map(notification => notification.user_id))
      const pendingRecipientIds = recipientIds.filter(recipientId => !alreadyNotified.has(recipientId))

      if (pendingRecipientIds.length === 0) {
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: 'Notification already sent'
        })
        continue
      }

      const metadata = await buildTermsheetCloseMetadata(supabase, termsheet)
      const completionDateLabel = formatCompletionDateLabel(termsheet.completion_date)
      const title = 'Term sheet close date reached'
      const message = `Deal "${deal?.name || 'Unknown Deal'}" term sheet v${termsheet.version} reached its closing date on ${completionDateLabel}. Review it and use Request Close when ready.`

      const notificationResults = await Promise.allSettled(
        pendingRecipientIds.map(recipientId =>
          createInvestorNotification({
            userId: recipientId,
            investorId: undefined,
            title,
            message,
            link: `/versotech_main/deals/${termsheet.deal_id}`,
            type: 'system',
            createdBy: fallbackRequesterId || undefined,
            dealId: termsheet.deal_id,
            sendEmailNotification: false,
            extraMetadata: {
              ...metadata,
              notification_kind: 'termsheet_close_due',
              notified_at: now.toISOString(),
            },
          })
        )
      )

      const successfulNotifications = notificationResults.filter(result => result.status === 'fulfilled').length

      if (successfulNotifications === 0) {
        console.error('[termsheet-close-cron] Failed to create notifications for termsheet:', termsheet.id)
        results.push({
          termsheetId: termsheet.id,
          dealId: termsheet.deal_id,
          dealName: deal?.name || 'Unknown',
          created: false,
          skippedReason: 'Notification creation failed'
        })
        continue
      }

      notificationsCreated += successfulNotifications

      await supabase.from('audit_logs').insert({
        event_type: 'system',
        action: 'termsheet_close_date_notification_sent',
        entity_type: 'deal_fee_structure',
        entity_id: termsheet.id,
        actor_id: fallbackRequesterId,
        action_details: {
          deal_id: termsheet.deal_id,
          deal_name: deal?.name || 'Unknown Deal',
          termsheet_version: termsheet.version,
          completion_date: termsheet.completion_date,
          notifications_created: successfulNotifications,
        },
        timestamp: now.toISOString(),
      })

      results.push({
        termsheetId: termsheet.id,
        dealId: termsheet.deal_id,
        dealName: deal?.name || 'Unknown',
        notificationsCreated: successfulNotifications,
        created: true
      })
    }

    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'termsheet_close_notification_check_cron',
      action_details: {
        termsheets_checked: totalTermsheetsChecked,
        notifications_created: notificationsCreated,
        errors: results.filter(r => r.created === false && r.skippedReason === 'Notification creation failed').length
      },
      timestamp: now.toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Created ${notificationsCreated} termsheet close date notifications`,
      termsheetsChecked: totalTermsheetsChecked,
      notificationsCreated,
      results
    })
  } catch (error) {
    console.error('[termsheet-close-cron] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
