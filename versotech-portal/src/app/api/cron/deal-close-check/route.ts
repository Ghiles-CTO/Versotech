/**
 * Deal Close Check Cron Job
 *
 * GET /api/cron/deal-close-check
 *
 * Daily cron job to check for deals that have reached their closing date
 * and trigger the closing workflow:
 * - Generate certificates for funded subscriptions
 * - Enable invoice requests on accepted fee plans
 * - Notify introducers/partners
 *
 * Per Fred's requirements (2024):
 * "It should be linked to the closing both the issuance of the certificate
 * and the request of the invoices."
 *
 * Schedule: Run daily at midnight UTC (configure in Vercel cron or external scheduler)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleDealClose, isDealReadyForClose, DealCloseResult } from '@/lib/deals/deal-close-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results: DealCloseResult[] = []
  let totalDealsChecked = 0
  let totalDealsProcessed = 0
  let totalErrors = 0

  try {
    // Query deals that:
    // 1. Have a close_at date
    // 2. Haven't been processed yet (closed_processed_at is null)
    // 3. close_at <= today (closing date has passed)
    // 4. Are in a valid status for closing
    const { data: deals, error: queryError } = await supabase
      .from('deals')
      .select('id, name, company_name, status, close_at, closed_processed_at, vehicle_id')
      .not('close_at', 'is', null)
      .is('closed_processed_at', null)
      .lte('close_at', now.toISOString())
      .in('status', ['active', 'closing', 'collecting', 'closed'])

    if (queryError) {
      console.error('[deal-close-cron] Failed to query deals:', queryError)
      return NextResponse.json(
        { error: 'Failed to query deals', details: queryError },
        { status: 500 }
      )
    }

    if (!deals || deals.length === 0) {
      console.log('[deal-close-cron] No deals ready for close processing')
      return NextResponse.json({
        success: true,
        message: 'No deals ready for close processing',
        dealsChecked: 0,
        dealsProcessed: 0,
      })
    }

    totalDealsChecked = deals.length
    console.log(`[deal-close-cron] Found ${deals.length} deals potentially ready for close processing`)

    // Process each deal
    for (const deal of deals) {
      // Double-check with utility function (includes UTC comparison)
      if (!isDealReadyForClose(deal)) {
        console.log(`[deal-close-cron] Deal ${deal.id} not ready for close (checked by utility)`)
        continue
      }

      const closingDate = new Date(deal.close_at!)
      console.log(`[deal-close-cron] Processing deal ${deal.id} (${deal.name})`)

      const result = await handleDealClose(supabase, deal.id, closingDate)
      results.push(result)

      if (result.success) {
        totalDealsProcessed++
      } else {
        totalErrors += result.errors.length
      }
    }

    // Log the cron run to audit
    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'deal_close_check_cron',
      action_details: {
        deals_checked: totalDealsChecked,
        deals_processed: totalDealsProcessed,
        total_certificates: results.reduce((sum, r) => sum + r.certificatesTriggered, 0),
        total_fee_plans_enabled: results.reduce((sum, r) => sum + r.feePlansEnabled, 0),
        total_notifications: results.reduce((sum, r) => sum + r.notificationsSent, 0),
        errors: totalErrors,
      },
      timestamp: now.toISOString(),
    })

    // Build summary
    const summary = {
      success: true,
      message: `Processed ${totalDealsProcessed} of ${totalDealsChecked} deals`,
      dealsChecked: totalDealsChecked,
      dealsProcessed: totalDealsProcessed,
      totals: {
        certificatesTriggered: results.reduce((sum, r) => sum + r.certificatesTriggered, 0),
        feePlansEnabled: results.reduce((sum, r) => sum + r.feePlansEnabled, 0),
        notificationsSent: results.reduce((sum, r) => sum + r.notificationsSent, 0),
      },
      errorsCount: totalErrors,
      results: results.map((r) => ({
        dealId: r.dealId,
        success: r.success,
        certificates: r.certificatesTriggered,
        feePlans: r.feePlansEnabled,
        notifications: r.notificationsSent,
        errors: r.errors.length > 0 ? r.errors : undefined,
      })),
    }

    console.log('[deal-close-cron] Completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[deal-close-cron] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
