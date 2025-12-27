import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createInvestorNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * Cron job to send KYC expiry reminder notifications
 * Runs daily to remind investors whose KYC documents are expiring:
 * - 30 days before expiry (first reminder)
 * - 14 days before expiry (second reminder)
 * - 7 days before expiry (urgent reminder)
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

  let remindersSent = 0
  let errorsCount = 0
  const errors: string[] = []

  try {
    // Calculate reminder dates using UTC milliseconds
    const DAY_MS = 24 * 60 * 60 * 1000
    const thirtyDaysFromNow = new Date(nowUtc + 30 * DAY_MS)
    const fourteenDaysFromNow = new Date(nowUtc + 14 * DAY_MS)
    const sevenDaysFromNow = new Date(nowUtc + 7 * DAY_MS)
    const todayUtc = new Date(nowUtc).toISOString().split('T')[0]

    // Query investors with KYC that needs attention
    // Check kyc_expiry_date field on investors table
    const { data: expiringKyc, error: queryError } = await supabase
      .from('investors')
      .select(`
        id,
        legal_name,
        display_name,
        kyc_expiry_date,
        kyc_status,
        kyc_last_reminder_sent_at,
        investor_users (
          user_id
        )
      `)
      .not('kyc_expiry_date', 'is', null)
      .lte('kyc_expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .in('kyc_status', ['approved', 'pending_refresh'])

    if (queryError) {
      console.error('Failed to query expiring KYC:', queryError)
      return NextResponse.json(
        { error: 'Failed to query expiring KYC', details: queryError },
        { status: 500 }
      )
    }

    if (!expiringKyc || expiringKyc.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No KYC expiring in the next 30 days',
        remindersSent: 0
      })
    }

    // Process each investor
    for (const investor of expiringKyc) {
      try {
        const users = investor.investor_users as { user_id: string }[] | null
        if (!users || users.length === 0) continue

        const expiryDate = new Date(investor.kyc_expiry_date)
        const expiryUtc = Date.UTC(expiryDate.getUTCFullYear(), expiryDate.getUTCMonth(), expiryDate.getUTCDate())
        const daysUntilExpiry = Math.ceil((expiryUtc - nowUtc) / DAY_MS)

        // Determine reminder type based on days until expiry
        let reminderType: '30_day' | '14_day' | '7_day' | 'expired' | null = null
        let urgency: 'normal' | 'high' | 'critical' = 'normal'

        if (daysUntilExpiry <= 0) {
          reminderType = 'expired'
          urgency = 'critical'
        } else if (daysUntilExpiry <= 7) {
          reminderType = '7_day'
          urgency = 'critical'
        } else if (daysUntilExpiry <= 14) {
          reminderType = '14_day'
          urgency = 'high'
        } else if (daysUntilExpiry <= 30) {
          reminderType = '30_day'
          urgency = 'normal'
        }

        if (!reminderType) continue

        // Check if we already sent this type of reminder
        if (investor.kyc_last_reminder_sent_at) {
          const lastReminder = new Date(investor.kyc_last_reminder_sent_at)
          const lastReminderUtc = Date.UTC(lastReminder.getUTCFullYear(), lastReminder.getUTCMonth(), lastReminder.getUTCDate())
          const daysSinceReminder = Math.floor((nowUtc - lastReminderUtc) / DAY_MS)

          // Don't send more than once per week unless it's urgent
          if (urgency === 'normal' && daysSinceReminder < 7) continue
          if (urgency === 'high' && daysSinceReminder < 3) continue
          if (urgency === 'critical' && daysSinceReminder < 1) continue
        }

        // Build notification message
        const investorName = investor.display_name || investor.legal_name
        let title: string
        let message: string

        if (reminderType === 'expired') {
          title = 'KYC Documents Expired'
          message = `Your KYC documents have expired. Please update your documentation immediately to maintain access to investment opportunities.`
        } else {
          title = `KYC Documents Expiring ${daysUntilExpiry === 1 ? 'Tomorrow' : `in ${daysUntilExpiry} Days`}`
          message = `Your KYC documents for ${investorName} will expire on ${expiryDate.toISOString().split('T')[0]}. Please update your documentation to ensure uninterrupted access.`
        }

        // Send notifications in parallel to all users linked to this investor
        await Promise.all(users.map(userLink =>
          createInvestorNotification({
            userId: userLink.user_id,
            investorId: investor.id,
            title,
            message,
            link: '/versotech_main/profile?tab=kyc',
            type: 'kyc_status',
            sendEmailNotification: true
          })
        ))

        // Update last reminder timestamp
        await supabase
          .from('investors')
          .update({
            kyc_last_reminder_sent_at: now.toISOString(),
            kyc_status: reminderType === 'expired' ? 'expired' : investor.kyc_status
          })
          .eq('id', investor.id)

        remindersSent++
      } catch (error) {
        errorsCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed for investor ${investor.id}: ${errorMsg}`)
        console.error('Error processing KYC reminder:', investor.id, error)
      }
    }

    // Log the cron run
    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'kyc_expiry_reminders_cron',
      action_details: {
        checked: expiringKyc.length,
        reminders_sent: remindersSent,
        errors: errorsCount
      },
      timestamp: now.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringKyc.length} investors, sent ${remindersSent} reminders`,
      checked: expiringKyc.length,
      remindersSent,
      errorsCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Unexpected error in KYC expiry cron:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
