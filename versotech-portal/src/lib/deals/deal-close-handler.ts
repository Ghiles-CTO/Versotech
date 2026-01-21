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
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export interface DealCloseResult {
  success: boolean
  dealId: string
  subscriptionsActivated: number
  positionsCreated: number
  commissionsCreated: number
  certificatesTriggered: number
  feePlansEnabled: number
  notificationsSent: number
  accrualNotificationsSent: number  // GAP-5: Track commission accrual notifications
  errors: string[]
}

/**
 * GAP-5 & GAP-7: Helper to send commission accrual notification and create audit log
 */
async function sendCommissionAccrualNotification(
  supabase: SupabaseClient,
  params: {
    entityType: 'introducer' | 'partner' | 'commercial_partner'
    entityId: string
    dealId: string
    dealName: string
    investorName: string
    commissionAmount: number
    currency: string
    commissionId?: string
  }
): Promise<number> {
  let notificationsSent = 0

  try {
    // Determine user table and entity table based on type
    const userTable = `${params.entityType}_users` as 'introducer_users' | 'partner_users' | 'commercial_partner_users'
    const entityIdField = `${params.entityType}_id`

    // Get all users linked to this entity
    const { data: entityUsers } = await supabase
      .from(userTable)
      .select('user_id')
      .eq(entityIdField, params.entityId)

    if (entityUsers && entityUsers.length > 0) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: params.currency || 'USD',
      }).format(params.commissionAmount)

      for (const eu of entityUsers) {
        try {
          await createInvestorNotification({
            userId: eu.user_id,
            title: 'Commission Earned',
            message: `You've earned a ${formattedAmount} commission for ${params.investorName}'s investment in ${params.dealName}.`,
            link: '/versotech_main/my-commissions',
            type: 'introducer_commission_accrued',
            sendEmailNotification: true,
            dealId: params.dealId,
          })
          notificationsSent++
        } catch (error) {
          console.error(`[deal-close] Failed to send accrual notification to user ${eu.user_id}:`, error)
        }
      }
    }

    // GAP-7: Create audit log for commission creation
    const entityMapping = {
      'introducer': AuditEntities.INTRODUCER_COMMISSIONS,
      'partner': AuditEntities.PARTNER_COMMISSIONS,
      'commercial_partner': AuditEntities.COMMERCIAL_PARTNER_COMMISSIONS,
    }

    await auditLogger.log({
      action: AuditActions.COMMISSION_ACCRUED,
      entity: entityMapping[params.entityType],
      entity_id: params.commissionId,
      metadata: {
        entity_type: params.entityType,
        entity_id: params.entityId,
        deal_id: params.dealId,
        deal_name: params.dealName,
        investor_name: params.investorName,
        commission_amount: params.commissionAmount,
        currency: params.currency,
        created_by: 'deal_close_handler',
      },
    })
  } catch (error) {
    console.error('[deal-close] Error sending accrual notification:', error)
  }

  return notificationsSent
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
    subscriptionsActivated: 0,
    positionsCreated: 0,
    commissionsCreated: 0,
    certificatesTriggered: 0,
    feePlansEnabled: 0,
    notificationsSent: 0,
    accrualNotificationsSent: 0,
    errors: [],
  }

  try {
    // Verify deal exists and hasn't been processed yet
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, name, company_name, status, close_at, closed_processed_at, vehicle_id, arranger_entity_id, currency')
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

    // Step 1: Activate funded subscriptions, create positions, and generate certificates
    // Get all funded subscriptions that haven't been activated yet
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        investor_id,
        vehicle_id,
        commitment,
        funded_amount,
        currency,
        num_shares,
        units,
        price_per_share,
        cost_per_share,
        status,
        activated_at,
        investor:investors(
          id,
          display_name,
          legal_name
        )
      `)
      .eq('deal_id', dealId)
      .eq('status', 'funded') // Only funded subscriptions awaiting activation
      .is('activated_at', null) // Not yet activated

    if (subError) {
      result.errors.push(`Failed to fetch subscriptions: ${subError.message}`)
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`[deal-close] Found ${subscriptions.length} funded subscriptions to activate`)

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
          // Step 1a: Calculate and lock spread values if not already set
          const pricePerShare = Number(sub.price_per_share) || null
          const costPerShare = Number(sub.cost_per_share) || null
          const numShares = sub.num_shares || sub.units || null

          // Calculate spread values if we have both price and cost
          let spreadPerShare: number | null = null
          let spreadFeeAmount: number | null = null
          if (pricePerShare && costPerShare && pricePerShare > 0 && costPerShare > 0) {
            spreadPerShare = pricePerShare - costPerShare
            if (numShares && numShares > 0) {
              spreadFeeAmount = spreadPerShare * Number(numShares)
            }
          }

          // Step 1b: Update subscription status to 'active' and capture final spread values
          const { error: statusError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              activated_at: new Date().toISOString(),
              // Lock spread values at close time
              ...(spreadPerShare !== null && { spread_per_share: spreadPerShare }),
              ...(spreadFeeAmount !== null && { spread_fee_amount: spreadFeeAmount }),
            })
            .eq('id', sub.id)

          if (statusError) {
            result.errors.push(`Failed to activate subscription ${sub.id}: ${statusError.message}`)
            continue
          }
          result.subscriptionsActivated++
          console.log(`[deal-close] Activated subscription ${sub.id}`)

          // Step 1b: Create position for this subscription
          const fundedAmount = Number(sub.funded_amount) || 0
          let positionUnits = sub.num_shares || sub.units
          if (!positionUnits && sub.price_per_share) {
            positionUnits = fundedAmount / Number(sub.price_per_share)
          } else if (!positionUnits && sub.cost_per_share) {
            positionUnits = fundedAmount / Number(sub.cost_per_share)
          }

          const initialNav = sub.price_per_share || sub.cost_per_share

          if (positionUnits && positionUnits > 0) {
            // Check if position already exists
            const { data: existingPosition } = await supabase
              .from('positions')
              .select('id')
              .eq('investor_id', sub.investor_id)
              .eq('vehicle_id', sub.vehicle_id || deal.vehicle_id)
              .maybeSingle()

            if (!existingPosition) {
              const { error: positionError } = await supabase
                .from('positions')
                .insert({
                  investor_id: sub.investor_id,
                  vehicle_id: sub.vehicle_id || deal.vehicle_id,
                  units: positionUnits,
                  cost_basis: fundedAmount,
                  last_nav: initialNav,
                  as_of_date: new Date().toISOString(),
                })

              if (positionError) {
                result.errors.push(`Failed to create position for subscription ${sub.id}: ${positionError.message}`)
              } else {
                result.positionsCreated++
                console.log(`[deal-close] Created position for subscription ${sub.id}: ${positionUnits} units`)
              }
            } else {
              console.log(`[deal-close] Position already exists for subscription ${sub.id}`)
            }
          }

          // Step 1c: Create introducer/partner/commercial partner commissions (based on assigned fee plan)
          try {
            const { data: dealMembership } = await supabase
              .from('deal_memberships')
              .select('referred_by_entity_id, referred_by_entity_type, assigned_fee_plan_id')
              .eq('deal_id', dealId)
              .eq('investor_id', sub.investor_id)
              .order('dispatched_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            let canProcess =
              !!dealMembership?.referred_by_entity_type && !!dealMembership.referred_by_entity_id

            if (!canProcess) {
              // No referral = no commission
            }

            if (canProcess && dealMembership) {
              const feePlanId = dealMembership.assigned_fee_plan_id
              if (!feePlanId) {
                result.errors.push(`Commission skipped for subscription ${sub.id}: no assigned fee plan`)
                canProcess = false
              }

              const { data: feePlan } = canProcess && feePlanId
                ? await supabase
                    .from('fee_plans')
                    .select('id, status, is_active, introducer_id, partner_id, commercial_partner_id, fee_components(id, kind, rate_bps)')
                    .eq('id', feePlanId)
                    .eq('deal_id', dealId)
                    .maybeSingle()
                : { data: null }

              if (canProcess && (!feePlan || !feePlan.is_active || feePlan.status !== 'accepted')) {
                result.errors.push(`Commission skipped for subscription ${sub.id}: fee plan not accepted or inactive`)
                canProcess = false
              }

              const entityMatch = canProcess && feePlan && dealMembership.referred_by_entity_type === 'introducer'
                ? feePlan.introducer_id === dealMembership.referred_by_entity_id
                : canProcess && feePlan && dealMembership.referred_by_entity_type === 'partner'
                  ? feePlan.partner_id === dealMembership.referred_by_entity_id
                  : canProcess && feePlan
                    ? feePlan.commercial_partner_id === dealMembership.referred_by_entity_id
                    : false

              if (canProcess && !entityMatch) {
                result.errors.push(`Commission skipped for subscription ${sub.id}: fee plan does not match referrer`)
                canProcess = false
              }

              const components = canProcess && feePlan ? (feePlan.fee_components as any[]) || [] : []
              const subscriptionComponent = components.find((c: any) => c.kind === 'subscription')
              const rateBps = subscriptionComponent?.rate_bps || 0

              if (canProcess && (!rateBps || rateBps <= 0)) {
                result.errors.push(`Commission skipped for subscription ${sub.id}: fee plan has no subscription fee rate`)
                canProcess = false
              }

              if (!canProcess) {
                // Skip commission creation for this subscription
              } else {
              // IMPORTANT: Commission basis is ALWAYS 'invested_amount' (funded_amount)
              // Per PRD: Commission basis NEVER includes management_fee
              // Commissions are calculated as: funded_amount × (rate_bps / 10000)
              const commissionAmount = (fundedAmount * rateBps) / 10000
              const currency = sub.currency || deal.currency || 'USD'
              const now = new Date().toISOString()

              if (dealMembership.referred_by_entity_type === 'introducer') {
                // Enforce active signed introducer agreement
                const today = new Date().toISOString().split('T')[0]
                const { data: activeAgreement } = await supabase
                  .from('introducer_agreements')
                  .select('id')
                  .eq('introducer_id', dealMembership.referred_by_entity_id)
                  .eq('fee_plan_id', feePlanId)
                  .eq('status', 'active')
                  .not('signed_date', 'is', null)
                  .or(`expiry_date.is.null,expiry_date.gte.${today}`)
                  .maybeSingle()

                if (!activeAgreement) {
                  result.errors.push(`Commission skipped for subscription ${sub.id}: introducer agreement not active`)
                } else {
                  const { data: existingCommission } = await supabase
                    .from('introducer_commissions')
                    .select('id')
                    .eq('introducer_id', dealMembership.referred_by_entity_id)
                    .eq('deal_id', dealId)
                    .eq('investor_id', sub.investor_id)
                    .maybeSingle()

                  if (!existingCommission) {
                    const { data: newCommission } = await supabase.from('introducer_commissions').insert({
                      introducer_id: dealMembership.referred_by_entity_id,
                      deal_id: dealId,
                      investor_id: sub.investor_id,
                      arranger_id: deal.arranger_entity_id || null,
                      fee_plan_id: feePlanId,
                      basis_type: 'invested_amount',
                      rate_bps: rateBps,
                      base_amount: fundedAmount,
                      accrual_amount: commissionAmount,
                      currency,
                      status: 'accrued',
                      created_at: now,
                    }).select('id').single()

                    result.commissionsCreated++

                    // GAP-5 & GAP-7: Send commission accrual notification and audit log
                    const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                    const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                    const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                      entityType: 'introducer',
                      entityId: dealMembership.referred_by_entity_id,
                      dealId,
                      dealName: deal.name || 'Deal',
                      investorName,
                      commissionAmount,
                      currency,
                      commissionId: newCommission?.id,
                    })
                    result.accrualNotificationsSent += accrualNotifications
                  }
                }
              } else if (dealMembership.referred_by_entity_type === 'partner') {
                const { data: existingCommission } = await supabase
                  .from('partner_commissions')
                  .select('id')
                  .eq('partner_id', dealMembership.referred_by_entity_id)
                  .eq('deal_id', dealId)
                  .eq('investor_id', sub.investor_id)
                  .maybeSingle()

                if (!existingCommission) {
                  const { data: newCommission } = await supabase.from('partner_commissions').insert({
                    partner_id: dealMembership.referred_by_entity_id,
                    deal_id: dealId,
                    investor_id: sub.investor_id,
                    arranger_id: deal.arranger_entity_id || null,
                    fee_plan_id: feePlanId,
                    basis_type: 'invested_amount',
                    rate_bps: rateBps,
                    base_amount: fundedAmount,
                    accrual_amount: commissionAmount,
                    currency,
                    status: 'accrued',
                    created_at: now,
                  }).select('id').single()

                  result.commissionsCreated++

                  // GAP-5 & GAP-7: Send commission accrual notification and audit log
                  const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                  const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                  const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                    entityType: 'partner',
                    entityId: dealMembership.referred_by_entity_id,
                    dealId,
                    dealName: deal.name || 'Deal',
                    investorName,
                    commissionAmount,
                    currency,
                    commissionId: newCommission?.id,
                  })
                  result.accrualNotificationsSent += accrualNotifications
                }
              } else if (dealMembership.referred_by_entity_type === 'commercial_partner') {
                if (!deal.arranger_entity_id) {
                  result.errors.push(`Commission skipped for subscription ${sub.id}: missing arranger for commercial partner`)
                } else {
                  const { data: existingCommission } = await supabase
                    .from('commercial_partner_commissions')
                    .select('id')
                    .eq('commercial_partner_id', dealMembership.referred_by_entity_id)
                    .eq('deal_id', dealId)
                    .eq('investor_id', sub.investor_id)
                    .maybeSingle()

                  if (!existingCommission) {
                    const { data: newCommission } = await supabase.from('commercial_partner_commissions').insert({
                      commercial_partner_id: dealMembership.referred_by_entity_id,
                      deal_id: dealId,
                      investor_id: sub.investor_id,
                      arranger_id: deal.arranger_entity_id,
                      fee_plan_id: feePlanId,
                      basis_type: 'invested_amount',
                      rate_bps: rateBps,
                      base_amount: fundedAmount,
                      accrual_amount: commissionAmount,
                      currency,
                      status: 'accrued',
                      created_at: now,
                    }).select('id').single()

                    result.commissionsCreated++

                    // GAP-5 & GAP-7: Send commission accrual notification and audit log
                    const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                    const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                    const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                      entityType: 'commercial_partner',
                      entityId: dealMembership.referred_by_entity_id,
                      dealId,
                      dealName: deal.name || 'Deal',
                      investorName,
                      commissionAmount,
                      currency,
                      commissionId: newCommission?.id,
                    })
                    result.accrualNotificationsSent += accrualNotifications
                  }
                }
              }
            }
            }
          } catch (commError) {
            const msg = commError instanceof Error ? commError.message : 'Unknown error'
            result.errors.push(`Commission creation failed for subscription ${sub.id}: ${msg}`)
          }

          // Step 1d: Trigger certificate generation
          await triggerCertificateGeneration({
            supabase,
            subscriptionId: sub.id,
            investorId: sub.investor_id,
            vehicleId: sub.vehicle_id || deal.vehicle_id,
            commitment: sub.commitment || 0,
            fundedAmount: fundedAmount,
            shares: sub.num_shares || sub.units,
            pricePerShare: sub.price_per_share,
            profile: triggerProfile,
          })
          result.certificatesTriggered++
        } catch (subError) {
          const msg = subError instanceof Error ? subError.message : 'Unknown error'
          result.errors.push(`Processing failed for subscription ${sub.id}: ${msg}`)
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

/**
 * Result interface for termsheet close operations
 */
export interface TermsheetCloseResult {
  success: boolean
  termsheetId: string
  dealId: string
  subscriptionsActivated: number
  positionsCreated: number
  commissionsCreated: number
  certificatesTriggered: number
  feePlansEnabled: number
  notificationsSent: number
  accrualNotificationsSent: number  // GAP-5: Track commission accrual notifications
  errors: string[]
}

/**
 * Process a TERMSHEET that has reached its completion date.
 *
 * This is the per-termsheet version of handleDealClose. Since a deal can have
 * multiple termsheets (with different completion dates), each termsheet is
 * processed independently when its completion_date is reached.
 *
 * Actions performed:
 * 1. Activate subscriptions linked to this termsheet (via deal_memberships.term_sheet_id)
 * 2. Create positions for activated subscriptions
 * 3. Generate certificates for those subscriptions
 * 4. Create commissions for fee_plans linked to this termsheet
 * 5. Enable invoice_requests on fee_plans linked to this termsheet
 * 6. Send notifications to introducers/partners
 *
 * @param supabase - Supabase client (should be service client for admin access)
 * @param termsheetId - The termsheet ID to process (deal_fee_structures.id)
 */
export async function handleTermsheetClose(
  supabase: SupabaseClient,
  termsheetId: string
): Promise<TermsheetCloseResult> {
  const result: TermsheetCloseResult = {
    success: false,
    termsheetId,
    dealId: '',
    subscriptionsActivated: 0,
    positionsCreated: 0,
    commissionsCreated: 0,
    certificatesTriggered: 0,
    feePlansEnabled: 0,
    notificationsSent: 0,
    accrualNotificationsSent: 0,
    errors: [],
  }

  try {
    // Fetch termsheet with deal info
    const { data: termsheet, error: termsheetError } = await supabase
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
          vehicle_id,
          arranger_entity_id
        )
      `)
      .eq('id', termsheetId)
      .single()

    if (termsheetError || !termsheet) {
      result.errors.push(`Termsheet not found: ${termsheetError?.message || 'Unknown error'}`)
      return result
    }

    result.dealId = termsheet.deal_id
    const deal = termsheet.deal as any

    // Idempotency check - skip if already processed
    if (termsheet.closed_processed_at) {
      console.log(`[termsheet-close] Termsheet ${termsheetId} already processed at ${termsheet.closed_processed_at}, skipping`)
      result.success = true
      return result
    }

    console.log(`[termsheet-close] Processing termsheet ${termsheetId} (${deal?.name} v${termsheet.version})`)

    // Step 1: Get investor IDs linked to THIS termsheet via deal_memberships
    // Then fetch their funded subscriptions separately (no FK between tables)
    const { data: linkedMemberships, error: membershipError } = await supabase
      .from('deal_memberships')
      .select('investor_id, referred_by_entity_id, referred_by_entity_type, assigned_fee_plan_id')
      .eq('deal_id', termsheet.deal_id)
      .eq('term_sheet_id', termsheetId)

    if (membershipError) {
      result.errors.push(`Failed to fetch deal memberships: ${membershipError.message}`)
      return result
    }

    const linkedInvestorIds = (linkedMemberships || []).map(m => m.investor_id).filter(Boolean)

    if (linkedInvestorIds.length === 0) {
      console.log(`[termsheet-close] No investors linked to termsheet ${termsheetId}`)
    }

    // Step 1b: Get funded subscriptions for those investors
    let subscriptions: any[] = []
    let subError: any = null

    if (linkedInvestorIds.length > 0) {
      const { data: subs, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          investor_id,
          vehicle_id,
          commitment,
          funded_amount,
          currency,
          num_shares,
          units,
          price_per_share,
          cost_per_share,
          status,
          activated_at,
          investor:investors(
            id,
            display_name,
            legal_name
          )
        `)
        .eq('deal_id', termsheet.deal_id)
        .eq('status', 'funded')
        .is('activated_at', null)
        .in('investor_id', linkedInvestorIds)

      subscriptions = subs || []
      subError = fetchError

      // Attach membership data to each subscription for commission processing
      subscriptions = subscriptions.map(sub => ({
        ...sub,
        deal_membership: linkedMemberships?.find(m => m.investor_id === sub.investor_id) || null
      }))
    }

    if (subError) {
      result.errors.push(`Failed to fetch subscriptions: ${subError.message}`)
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`[termsheet-close] Found ${subscriptions.length} funded subscriptions linked to termsheet ${termsheetId}`)

      // Get a system profile for triggering
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
        // deal_membership was attached during the two-step query above
        const dealMembership = sub.deal_membership

        try {
          // Step 1a: Calculate and lock spread values if not already set
          const pricePerShare = Number(sub.price_per_share) || null
          const costPerShare = Number(sub.cost_per_share) || null
          const numShares = sub.num_shares || sub.units || null

          // Calculate spread values if we have both price and cost
          let spreadPerShare: number | null = null
          let spreadFeeAmount: number | null = null
          if (pricePerShare && costPerShare && pricePerShare > 0 && costPerShare > 0) {
            spreadPerShare = pricePerShare - costPerShare
            if (numShares && numShares > 0) {
              spreadFeeAmount = spreadPerShare * Number(numShares)
            }
          }

          // Step 1b: Update subscription status to 'active' and capture final spread values
          const { error: statusError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              activated_at: new Date().toISOString(),
              // Lock spread values at close time
              ...(spreadPerShare !== null && { spread_per_share: spreadPerShare }),
              ...(spreadFeeAmount !== null && { spread_fee_amount: spreadFeeAmount }),
            })
            .eq('id', sub.id)

          if (statusError) {
            result.errors.push(`Failed to activate subscription ${sub.id}: ${statusError.message}`)
            continue
          }
          result.subscriptionsActivated++
          console.log(`[termsheet-close] Activated subscription ${sub.id}`)

          // Step 1b: Create position for this subscription
          const fundedAmount = Number(sub.funded_amount) || 0
          let positionUnits = sub.num_shares || sub.units
          if (!positionUnits && sub.price_per_share) {
            positionUnits = fundedAmount / Number(sub.price_per_share)
          } else if (!positionUnits && sub.cost_per_share) {
            positionUnits = fundedAmount / Number(sub.cost_per_share)
          }

          if (positionUnits && positionUnits > 0) {
            const { data: existingPosition } = await supabase
              .from('positions')
              .select('id')
              .eq('investor_id', sub.investor_id)
              .eq('vehicle_id', sub.vehicle_id || deal.vehicle_id)
              .maybeSingle()

            if (!existingPosition) {
              const { error: positionError } = await supabase
                .from('positions')
                .insert({
                  investor_id: sub.investor_id,
                  vehicle_id: sub.vehicle_id || deal.vehicle_id,
                  units: positionUnits,
                  cost_basis: fundedAmount,
                  last_nav: sub.price_per_share || sub.cost_per_share,
                  as_of_date: new Date().toISOString(),
                })

              if (positionError) {
                result.errors.push(`Failed to create position for subscription ${sub.id}: ${positionError.message}`)
              } else {
                result.positionsCreated++
                console.log(`[termsheet-close] Created position for subscription ${sub.id}: ${positionUnits} units`)
              }
            }
          }

          // Step 1c: Create commissions (based on fee plan linked to this termsheet)
          if (dealMembership?.referred_by_entity_type && dealMembership.referred_by_entity_id) {
            const feePlanId = dealMembership.assigned_fee_plan_id
            if (feePlanId) {
              const { data: feePlan } = await supabase
                .from('fee_plans')
                .select('id, status, is_active, introducer_id, partner_id, commercial_partner_id, fee_components(id, kind, rate_bps)')
                .eq('id', feePlanId)
                .eq('term_sheet_id', termsheetId)
                .maybeSingle()

              if (feePlan && feePlan.is_active && feePlan.status === 'accepted') {
                const components = (feePlan.fee_components as any[]) || []
                const subscriptionComponent = components.find((c: any) => c.kind === 'subscription')
                const rateBps = subscriptionComponent?.rate_bps || 0

                if (rateBps > 0) {
                  // IMPORTANT: Commission basis is ALWAYS 'invested_amount' (funded_amount)
                  // Per PRD: Commission basis NEVER includes management_fee
                  // Commissions are calculated as: funded_amount × (rate_bps / 10000)
                  const commissionAmount = (fundedAmount * rateBps) / 10000
                  const currency = sub.currency || deal.currency || 'USD'
                  const now = new Date().toISOString()

                  // Create commission based on referrer type
                  if (dealMembership.referred_by_entity_type === 'introducer' && feePlan.introducer_id === dealMembership.referred_by_entity_id) {
                    const { data: existingCommission } = await supabase
                      .from('introducer_commissions')
                      .select('id')
                      .eq('introducer_id', dealMembership.referred_by_entity_id)
                      .eq('deal_id', termsheet.deal_id)
                      .eq('investor_id', sub.investor_id)
                      .maybeSingle()

                    if (!existingCommission) {
                      const { data: newCommission } = await supabase.from('introducer_commissions').insert({
                        introducer_id: dealMembership.referred_by_entity_id,
                        deal_id: termsheet.deal_id,
                        investor_id: sub.investor_id,
                        arranger_id: deal.arranger_entity_id || null,
                        fee_plan_id: feePlanId,
                        basis_type: 'invested_amount',
                        rate_bps: rateBps,
                        base_amount: fundedAmount,
                        accrual_amount: commissionAmount,
                        currency,
                        status: 'accrued',
                        created_at: now,
                      }).select('id').single()
                      result.commissionsCreated++

                      // GAP-5 & GAP-7: Send commission accrual notification and audit log
                      const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                      const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                      const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                        entityType: 'introducer',
                        entityId: dealMembership.referred_by_entity_id,
                        dealId: termsheet.deal_id,
                        dealName: deal.name || 'Deal',
                        investorName,
                        commissionAmount,
                        currency,
                        commissionId: newCommission?.id,
                      })
                      result.accrualNotificationsSent += accrualNotifications
                    }
                  } else if (dealMembership.referred_by_entity_type === 'partner' && feePlan.partner_id === dealMembership.referred_by_entity_id) {
                    const { data: existingCommission } = await supabase
                      .from('partner_commissions')
                      .select('id')
                      .eq('partner_id', dealMembership.referred_by_entity_id)
                      .eq('deal_id', termsheet.deal_id)
                      .eq('investor_id', sub.investor_id)
                      .maybeSingle()

                    if (!existingCommission) {
                      const { data: newCommission } = await supabase.from('partner_commissions').insert({
                        partner_id: dealMembership.referred_by_entity_id,
                        deal_id: termsheet.deal_id,
                        investor_id: sub.investor_id,
                        arranger_id: deal.arranger_entity_id || null,
                        fee_plan_id: feePlanId,
                        basis_type: 'invested_amount',
                        rate_bps: rateBps,
                        base_amount: fundedAmount,
                        accrual_amount: commissionAmount,
                        currency,
                        status: 'accrued',
                        created_at: now,
                      }).select('id').single()
                      result.commissionsCreated++

                      // GAP-5 & GAP-7: Send commission accrual notification and audit log
                      const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                      const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                      const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                        entityType: 'partner',
                        entityId: dealMembership.referred_by_entity_id,
                        dealId: termsheet.deal_id,
                        dealName: deal.name || 'Deal',
                        investorName,
                        commissionAmount,
                        currency,
                        commissionId: newCommission?.id,
                      })
                      result.accrualNotificationsSent += accrualNotifications
                    }
                  } else if (dealMembership.referred_by_entity_type === 'commercial_partner' && feePlan.commercial_partner_id === dealMembership.referred_by_entity_id && deal.arranger_entity_id) {
                    const { data: existingCommission } = await supabase
                      .from('commercial_partner_commissions')
                      .select('id')
                      .eq('commercial_partner_id', dealMembership.referred_by_entity_id)
                      .eq('deal_id', termsheet.deal_id)
                      .eq('investor_id', sub.investor_id)
                      .maybeSingle()

                    if (!existingCommission) {
                      const { data: newCommission } = await supabase.from('commercial_partner_commissions').insert({
                        commercial_partner_id: dealMembership.referred_by_entity_id,
                        deal_id: termsheet.deal_id,
                        investor_id: sub.investor_id,
                        arranger_id: deal.arranger_entity_id,
                        fee_plan_id: feePlanId,
                        basis_type: 'invested_amount',
                        rate_bps: rateBps,
                        base_amount: fundedAmount,
                        accrual_amount: commissionAmount,
                        currency,
                        status: 'accrued',
                        created_at: now,
                      }).select('id').single()
                      result.commissionsCreated++

                      // GAP-5 & GAP-7: Send commission accrual notification and audit log
                      const investor = sub.investor as { display_name?: string; legal_name?: string } | null
                      const investorName = investor?.display_name || investor?.legal_name || 'Investor'
                      const accrualNotifications = await sendCommissionAccrualNotification(supabase, {
                        entityType: 'commercial_partner',
                        entityId: dealMembership.referred_by_entity_id,
                        dealId: termsheet.deal_id,
                        dealName: deal.name || 'Deal',
                        investorName,
                        commissionAmount,
                        currency,
                        commissionId: newCommission?.id,
                      })
                      result.accrualNotificationsSent += accrualNotifications
                    }
                  }
                }
              }
            }
          }

          // Step 1d: Trigger certificate generation
          await triggerCertificateGeneration({
            supabase,
            subscriptionId: sub.id,
            investorId: sub.investor_id,
            vehicleId: sub.vehicle_id || deal.vehicle_id,
            commitment: sub.commitment || 0,
            fundedAmount,
            shares: sub.num_shares || sub.units,
            pricePerShare: sub.price_per_share,
            profile: triggerProfile,
          })
          result.certificatesTriggered++
        } catch (subError) {
          const msg = subError instanceof Error ? subError.message : 'Unknown error'
          result.errors.push(`Processing failed for subscription ${sub.id}: ${msg}`)
        }
      }
    } else {
      console.log(`[termsheet-close] No funded subscriptions found for termsheet ${termsheetId}`)
    }

    // Step 2: Enable invoice_requests on fee_plans linked to THIS termsheet
    const now = new Date().toISOString()
    const { data: feePlans, error: feePlanError } = await supabase
      .from('fee_plans')
      .update({
        invoice_requests_enabled: true,
        invoice_requests_enabled_at: now,
      })
      .eq('deal_id', termsheet.deal_id)
      .eq('term_sheet_id', termsheetId)
      .eq('status', 'accepted')
      .eq('invoice_requests_enabled', false)
      .select('id, introducer_id, partner_id, commercial_partner_id, name')

    if (feePlanError) {
      result.errors.push(`Failed to enable invoice requests: ${feePlanError.message}`)
    } else if (feePlans) {
      result.feePlansEnabled = feePlans.length
      console.log(`[termsheet-close] Enabled invoice requests for ${feePlans.length} fee plans`)

      // Step 3: Send notifications to introducers/partners
      for (const feePlan of feePlans) {
        try {
          await sendTermsheetCloseNotification(supabase, feePlan, deal, termsheet.version)
          result.notificationsSent++
        } catch (notifError) {
          const msg = notifError instanceof Error ? notifError.message : 'Unknown error'
          result.errors.push(`Notification failed for fee plan ${feePlan.id}: ${msg}`)
        }
      }
    }

    // Step 4: Mark TERMSHEET as processed (idempotency)
    const { error: updateError } = await supabase
      .from('deal_fee_structures')
      .update({ closed_processed_at: now })
      .eq('id', termsheetId)

    if (updateError) {
      result.errors.push(`Failed to mark termsheet as processed: ${updateError.message}`)
    }

    result.success = result.errors.length === 0
    console.log(`[termsheet-close] Completed processing termsheet ${termsheetId}:`, {
      subscriptions: result.subscriptionsActivated,
      certificates: result.certificatesTriggered,
      feePlansEnabled: result.feePlansEnabled,
      notifications: result.notificationsSent,
      errors: result.errors.length,
    })

    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Unexpected error: ${msg}`)
    console.error(`[termsheet-close] Unexpected error processing termsheet ${termsheetId}:`, error)
    return result
  }
}

/**
 * Send notification to introducer/partner that invoice requests are now available (termsheet version)
 */
async function sendTermsheetCloseNotification(
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
  },
  termsheetVersion: number
): Promise<void> {
  let entityType: string | null = null
  let entityId: string | null = null
  let userTable: string | null = null

  if (feePlan.introducer_id) {
    entityType = 'introducer'
    entityId = feePlan.introducer_id
    userTable = 'introducer_users'
  } else if (feePlan.partner_id) {
    entityType = 'partner'
    entityId = feePlan.partner_id
    userTable = 'partner_users'
  } else if (feePlan.commercial_partner_id) {
    entityType = 'commercial_partner'
    entityId = feePlan.commercial_partner_id
    userTable = 'commercial_partner_users'
  }

  if (!entityType || !entityId || !userTable) {
    return
  }

  const { data: entityUsers } = await supabase
    .from(userTable)
    .select('user_id')
    .eq(`${entityType}_id`, entityId)

  if (!entityUsers || entityUsers.length === 0) {
    return
  }

  const dealName = deal.company_name || deal.name
  const title = 'Termsheet Closed - Invoice Requests Available'
  const message = `The termsheet v${termsheetVersion} for "${dealName}" has reached its completion date. You can now submit invoice requests for your fee agreement "${feePlan.name}".`
  const link = '/versotech_main/fee-plans'

  for (const { user_id } of entityUsers) {
    try {
      await createInvestorNotification({
        userId: user_id,
        title,
        message,
        link,
        type: 'introducer_invoice_sent',
        sendEmailNotification: true,
        dealId: deal.id,
      })
    } catch (error) {
      console.error(`[termsheet-close] Failed to create notification for user ${user_id}:`, error)
    }
  }
}
