import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createInvestorNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send term sheet expiry reminder notifications
 * Runs daily to remind investors whose term sheets are expiring:
 * - 7 days before expiry (first reminder)
 * - 3 days before expiry (second reminder)
 * - 1 day before expiry (urgent reminder)
 * - On expiry day (expired notice)
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  // Use UTC for consistent timezone handling across server regions
  const now = new Date()
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const DAY_MS = 24 * 60 * 60 * 1000

  let remindersSent = 0
  let errorsCount = 0
  const errors: string[] = []

  try {
    // Calculate reminder dates using UTC (7 days from now)
    const sevenDaysFromNow = new Date(nowUtc + 7 * DAY_MS)

    // Query active term sheets expiring within 7 days
    const { data: expiringTermSheets, error: queryError } = await supabase
      .from('term_sheets')
      .select(`
        id,
        deal_id,
        investor_id,
        valid_until,
        status,
        currency,
        price_per_unit,
        deals (
          id,
          name,
          status
        ),
        investors (
          id,
          legal_name,
          display_name,
          investor_users (
            user_id
          )
        )
      `)
      .not('valid_until', 'is', null)
      .lte('valid_until', sevenDaysFromNow.toISOString())
      .in('status', ['pending', 'sent', 'viewed']) // Only remind for active term sheets

    if (queryError) {
      console.error('Failed to query expiring term sheets:', queryError)
      return NextResponse.json(
        { error: 'Failed to query expiring term sheets', details: queryError },
        { status: 500 }
      )
    }

    if (!expiringTermSheets || expiringTermSheets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No term sheets expiring in the next 7 days',
        remindersSent: 0
      })
    }

    // Track which term sheets we've already notified recently
    // Get recent notifications to avoid spam
    const termSheetIds = expiringTermSheets.map(ts => ts.id)
    const { data: recentNotifications } = await supabase
      .from('investor_notifications')
      .select('investor_id, created_at, title')
      .in('investor_id', expiringTermSheets.map(ts => ts.investor_id).filter(Boolean))
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .like('title', '%Term Sheet%')

    const recentlyNotifiedInvestors = new Set(
      recentNotifications?.map(n => n.investor_id) || []
    )

    // Helper to normalize join results (Supabase can return array or object)
    function normalizeJoin<T>(value: T | T[] | null): T | null {
      if (!value) return null
      return Array.isArray(value) ? value[0] || null : value
    }

    // Process each term sheet
    for (const termSheet of expiringTermSheets) {
      try {
        const investorRaw = termSheet.investors as unknown
        const investor = normalizeJoin(investorRaw as {
          id: string
          legal_name: string
          display_name: string | null
          investor_users: { user_id: string }[] | null
        } | {
          id: string
          legal_name: string
          display_name: string | null
          investor_users: { user_id: string }[] | null
        }[] | null)

        const dealRaw = termSheet.deals as unknown
        const deal = normalizeJoin(dealRaw as {
          id: string
          name: string
          status: string
        } | {
          id: string
          name: string
          status: string
        }[] | null)

        if (!investor || !investor.investor_users || investor.investor_users.length === 0) {
          continue
        }

        // Skip if deal is no longer active
        if (deal && !['active', 'closing', 'collecting'].includes(deal.status)) {
          continue
        }

        const expiryDate = new Date(termSheet.valid_until)
        const expiryUtc = Date.UTC(expiryDate.getUTCFullYear(), expiryDate.getUTCMonth(), expiryDate.getUTCDate())
        const daysUntilExpiry = Math.ceil((expiryUtc - nowUtc) / DAY_MS)

        // Determine reminder type based on days until expiry
        let reminderType: '7_day' | '3_day' | '1_day' | 'expired' | null = null
        let urgency: 'normal' | 'high' | 'critical' = 'normal'

        if (daysUntilExpiry <= 0) {
          reminderType = 'expired'
          urgency = 'critical'
        } else if (daysUntilExpiry <= 1) {
          reminderType = '1_day'
          urgency = 'critical'
        } else if (daysUntilExpiry <= 3) {
          reminderType = '3_day'
          urgency = 'high'
        } else if (daysUntilExpiry <= 7) {
          reminderType = '7_day'
          urgency = 'normal'
        }

        if (!reminderType) continue

        // Skip if we already notified this investor in the last 24 hours
        // (unless it's expired or 1-day warning)
        if (recentlyNotifiedInvestors.has(investor.id) && urgency === 'normal') {
          continue
        }

        // Build notification message
        const investorName = investor.display_name || investor.legal_name
        const dealName = deal?.name || 'Unknown Deal'
        let title: string
        let message: string

        if (reminderType === 'expired') {
          title = 'Term Sheet Expired'
          message = `Your term sheet for "${dealName}" has expired. Please contact your relationship manager if you wish to continue with this investment opportunity.`
        } else if (reminderType === '1_day') {
          title = 'Term Sheet Expires Tomorrow'
          message = `Your term sheet for "${dealName}" expires tomorrow. Please complete your subscription to secure your allocation.`
        } else if (reminderType === '3_day') {
          title = 'Term Sheet Expiring Soon'
          message = `Your term sheet for "${dealName}" expires in ${daysUntilExpiry} days (${expiryDate.toISOString().split('T')[0]}). Complete your subscription to secure your allocation.`
        } else {
          title = 'Term Sheet Reminder'
          message = `Your term sheet for "${dealName}" will expire on ${expiryDate.toISOString().split('T')[0]}. Please review and complete your subscription at your earliest convenience.`
        }

        // Send notifications in parallel to all users linked to this investor
        await Promise.all(investor.investor_users.map(userLink =>
          createInvestorNotification({
            userId: userLink.user_id,
            investorId: investor.id,
            title,
            message,
            link: `/versotech_main/opportunities/${deal?.id}`,
            type: 'subscription',
            sendEmailNotification: urgency !== 'normal' // Only email for high/critical
          })
        ))

        // If term sheet has expired, update status
        if (reminderType === 'expired' && termSheet.status !== 'expired') {
          await supabase
            .from('term_sheets')
            .update({ status: 'expired' })
            .eq('id', termSheet.id)
        }

        remindersSent++
      } catch (error) {
        errorsCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed for term sheet ${termSheet.id}: ${errorMsg}`)
        console.error('Error processing term sheet reminder:', termSheet.id, error)
      }
    }

    // Log the cron run
    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'term_sheet_reminders_cron',
      action_details: {
        checked: expiringTermSheets.length,
        reminders_sent: remindersSent,
        errors: errorsCount
      },
      timestamp: now.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringTermSheets.length} term sheets, sent ${remindersSent} reminders`,
      checked: expiringTermSheets.length,
      remindersSent,
      errorsCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Unexpected error in term sheet reminder cron:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
