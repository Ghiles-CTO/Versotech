/**
 * Deal Close Handler
 *
 * Handles the business logic when a deal reaches its closing date.
 * Per Fred's requirements (2024):
 * - Certificates are generated on deal closing date (NOT on funded status)
 * - Invoice request capability is enabled on deal closing date
 * - Notifications are sent to introducers/partners
 *
 * This is idempotent - if a deal has already been processed (closed_processed_at is set),
 * it will be skipped.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { triggerCertificateGeneration } from '@/lib/subscription/certificate-trigger'
import { createInvestorNotification } from '@/lib/notifications'

export interface DealCloseResult {
  success: boolean
  dealId: string
  certificatesTriggered: number
  feePlansEnabled: number
  notificationsSent: number
  errors: string[]
}

/**
 * Process a deal that has reached its closing date.
 *
 * Actions performed:
 * 1. Generate certificates for all funded subscriptions
 * 2. Enable invoice_requests on all accepted fee plans
 * 3. Send notifications to introducers/partners that invoice requests are now available
 *
 * @param supabase - Supabase client (should be service client for admin access)
 * @param dealId - The deal ID to process
 * @param closingDate - The closing date (for logging/reference)
 */
export async function handleDealClose(
  supabase: SupabaseClient,
  dealId: string,
  closingDate: Date
): Promise<DealCloseResult> {
  const result: DealCloseResult = {
    success: false,
    dealId,
    certificatesTriggered: 0,
    feePlansEnabled: 0,
    notificationsSent: 0,
    errors: [],
  }

  try {
    // Verify deal exists and hasn't been processed yet
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, name, company_name, status, close_at, closed_processed_at, vehicle_id')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      result.errors.push(`Deal not found: ${dealError?.message || 'Unknown error'}`)
      return result
    }

    // Idempotency check - skip if already processed
    if (deal.closed_processed_at) {
      console.log(`[deal-close] Deal ${dealId} already processed at ${deal.closed_processed_at}, skipping`)
      result.success = true // Not an error, just already done
      return result
    }

    console.log(`[deal-close] Processing deal ${dealId} (${deal.name}) closing date: ${closingDate.toISOString()}`)

    // Step 1: Generate certificates for all funded subscriptions
    // Get all funded subscriptions that haven't been activated yet
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        investor_id,
        vehicle_id,
        commitment,
        funded_amount,
        shares,
        price_per_share,
        status,
        activated_at,
        investor:investors(
          id,
          display_name,
          legal_name
        )
      `)
      .eq('deal_id', dealId)
      .eq('status', 'active') // Only funded/active subscriptions
      .is('activated_at', null) // Not yet activated (no certificate yet)

    if (subError) {
      result.errors.push(`Failed to fetch subscriptions: ${subError.message}`)
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`[deal-close] Found ${subscriptions.length} subscriptions needing certificates`)

      // Get a system profile for triggering (or use first available staff)
      const { data: systemProfile } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, title')
        .eq('role', 'staff_admin')
        .limit(1)
        .single()

      const triggerProfile = systemProfile || {
        id: 'system',
        email: 'system@versoholdings.com',
        display_name: 'System',
        role: 'system',
        title: 'Automated Process',
      }

      for (const sub of subscriptions) {
        try {
          await triggerCertificateGeneration({
            supabase,
            subscriptionId: sub.id,
            investorId: sub.investor_id,
            vehicleId: sub.vehicle_id || deal.vehicle_id,
            commitment: sub.commitment || 0,
            fundedAmount: sub.funded_amount || 0,
            shares: sub.shares,
            pricePerShare: sub.price_per_share,
            profile: triggerProfile,
          })
          result.certificatesTriggered++
        } catch (certError) {
          const msg = certError instanceof Error ? certError.message : 'Unknown error'
          result.errors.push(`Certificate trigger failed for subscription ${sub.id}: ${msg}`)
        }
      }
    }

    // Step 2: Enable invoice_requests on all accepted fee plans
    const now = new Date().toISOString()
    const { data: feePlans, error: feePlanError } = await supabase
      .from('fee_plans')
      .update({
        invoice_requests_enabled: true,
        invoice_requests_enabled_at: now,
      })
      .eq('deal_id', dealId)
      .eq('status', 'accepted')
      .eq('invoice_requests_enabled', false) // Only update those not already enabled
      .select('id, introducer_id, partner_id, commercial_partner_id, name')

    if (feePlanError) {
      result.errors.push(`Failed to enable invoice requests: ${feePlanError.message}`)
    } else if (feePlans) {
      result.feePlansEnabled = feePlans.length
      console.log(`[deal-close] Enabled invoice requests for ${feePlans.length} fee plans`)

      // Step 3: Send notifications to introducers/partners
      for (const feePlan of feePlans) {
        try {
          await sendDealCloseNotification(supabase, feePlan, deal)
          result.notificationsSent++
        } catch (notifError) {
          const msg = notifError instanceof Error ? notifError.message : 'Unknown error'
          result.errors.push(`Notification failed for fee plan ${feePlan.id}: ${msg}`)
        }
      }
    }

    // Mark deal as processed (idempotency)
    const { error: updateError } = await supabase
      .from('deals')
      .update({ closed_processed_at: now })
      .eq('id', dealId)

    if (updateError) {
      result.errors.push(`Failed to mark deal as processed: ${updateError.message}`)
    }

    result.success = result.errors.length === 0
    console.log(`[deal-close] Completed processing deal ${dealId}:`, {
      certificates: result.certificatesTriggered,
      feePlansEnabled: result.feePlansEnabled,
      notifications: result.notificationsSent,
      errors: result.errors.length,
    })

    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Unexpected error: ${msg}`)
    console.error(`[deal-close] Unexpected error processing deal ${dealId}:`, error)
    return result
  }
}

/**
 * Send notification to introducer/partner that invoice requests are now available
 */
async function sendDealCloseNotification(
  supabase: SupabaseClient,
  feePlan: {
    id: string
    introducer_id: string | null
    partner_id: string | null
    commercial_partner_id: string | null
    name: string
  },
  deal: {
    id: string
    name: string
    company_name: string | null
  }
): Promise<void> {
  let entityTable: string | null = null
  let entityId: string | null = null
  let entityType: string | null = null
  let userTable: string | null = null

  if (feePlan.introducer_id) {
    entityTable = 'introducers'
    entityId = feePlan.introducer_id
    entityType = 'introducer'
    userTable = 'introducer_users'
  } else if (feePlan.partner_id) {
    entityTable = 'partners'
    entityId = feePlan.partner_id
    entityType = 'partner'
    userTable = 'partner_users'
  } else if (feePlan.commercial_partner_id) {
    entityTable = 'commercial_partners'
    entityId = feePlan.commercial_partner_id
    entityType = 'commercial_partner'
    userTable = 'commercial_partner_users'
  }

  if (!entityTable || !entityId || !userTable) {
    console.warn(`[deal-close] Fee plan ${feePlan.id} has no linked entity`)
    return
  }

  // Get users linked to this entity
  const { data: entityUsers, error: usersError } = await supabase
    .from(userTable)
    .select('user_id')
    .eq(`${entityType}_id`, entityId)

  if (usersError) {
    console.error(`[deal-close] Failed to fetch ${entityType} users:`, usersError)
    return
  }

  if (!entityUsers || entityUsers.length === 0) {
    console.warn(`[deal-close] No users found for ${entityType} ${entityId}`)
    return
  }

  const dealName = deal.company_name || deal.name
  const title = 'Deal Closed - Invoice Requests Available'
  const message = `The deal "${dealName}" has reached its closing date. You can now submit invoice requests for your fee agreement "${feePlan.name}".`
  const link = '/versotech_main/fee-plans'

  // Send notification to all users linked to this entity
  for (const { user_id } of entityUsers) {
    try {
      await createInvestorNotification({
        userId: user_id,
        title,
        message,
        link,
        type: 'introducer_invoice_sent', // Reusing existing type for invoice availability
        sendEmailNotification: true,
        dealId: deal.id,
      })
    } catch (error) {
      console.error(`[deal-close] Failed to create notification for user ${user_id}:`, error)
    }
  }
}

/**
 * Check if a deal has reached its closing date and hasn't been processed yet
 */
export function isDealReadyForClose(deal: {
  close_at: string | null
  closed_processed_at: string | null
  status: string
}): boolean {
  // Must have a closing date
  if (!deal.close_at) return false

  // Must not already be processed
  if (deal.closed_processed_at) return false

  // Deal must be in an appropriate status (not draft, not already fully closed)
  const validStatuses = ['active', 'closing', 'collecting', 'closed']
  if (!validStatuses.includes(deal.status)) return false

  // Check if closing date has passed
  const closingDate = new Date(deal.close_at)
  const now = new Date()

  // Use UTC comparison for consistency
  const closingDateUtc = Date.UTC(
    closingDate.getUTCFullYear(),
    closingDate.getUTCMonth(),
    closingDate.getUTCDate()
  )
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return nowUtc >= closingDateUtc
}
