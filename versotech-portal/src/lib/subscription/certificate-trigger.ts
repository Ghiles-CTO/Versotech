/**
 * Certificate Trigger Utility
 * Triggers certificate generation when subscription becomes active
 *
 * COMPREHENSIVE PAYLOAD: Sends ALL data n8n needs to generate the certificate
 * without requiring n8n to query the database.
 */

import { triggerWorkflow } from '@/lib/trigger-workflow'
import { SupabaseClient } from '@supabase/supabase-js'

interface TriggerCertificateParams {
  supabase: SupabaseClient
  subscriptionId: string
  investorId: string
  vehicleId: string
  commitment: number
  fundedAmount: number
  shares?: number | null
  pricePerShare?: number | null
  profile: {
    id: string
    email?: string | null
    display_name?: string | null
    role?: string | null
    title?: string | null
  }
}

/**
 * Format date as "Month Day, Year" (e.g., "December 16, 2025")
 */
function formatCertificateDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Derive investor display name based on type
 * - Entity: use legal_name
 * - Individual: use "First Last" format
 */
function getInvestorDisplayName(investor: {
  type: string | null
  legal_name: string | null
  first_name: string | null
  last_name: string | null
}): string {
  if (investor.type === 'individual') {
    const firstName = investor.first_name?.trim() || ''
    const lastName = investor.last_name?.trim() || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
  }
  return investor.legal_name || 'Unknown Investor'
}

/**
 * Triggers certificate generation for a newly activated subscription
 * This is a fire-and-forget operation - failures are logged but don't block the caller
 *
 * IDEMPOTENCY: Will skip if subscription already has activated_at set
 */
export async function triggerCertificateGeneration({
  supabase,
  subscriptionId,
  investorId,
  vehicleId,
  commitment,
  fundedAmount,
  shares,
  pricePerShare,
  profile
}: TriggerCertificateParams): Promise<void> {
  try {
    // IDEMPOTENCY CHECK: Fetch subscription with all related data needed for certificate
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        activated_at,
        subscription_number,
        units,
        num_shares,
        deal_id,
        investor:investors!subscriptions_investor_id_fkey (
          id,
          legal_name,
          type,
          first_name,
          last_name
        ),
        vehicle:vehicles!subscriptions_vehicle_id_fkey (
          id,
          name,
          series_number,
          registration_number,
          logo_url,
          address
        ),
        deal:deals!subscriptions_deal_id_fkey (
          id,
          name,
          company_name,
          close_at,
          vehicle_id
        )
      `)
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      console.error(`❌ Subscription ${subscriptionId} not found:`, fetchError)
      return
    }

    // Skip if already activated (idempotency protection)
    if (subscription.activated_at) {
      console.log(`ℹ️ Subscription ${subscriptionId} already activated at ${subscription.activated_at}, skipping certificate trigger`)
      return
    }

    // Verify subscription status is actually 'active'
    if (subscription.status !== 'active') {
      console.warn(`⚠️ Cannot trigger certificate for subscription ${subscriptionId} - status is '${subscription.status}', expected 'active'`)
      return
    }

    // Get vehicle data - prefer subscription.vehicle, fall back to deal.vehicle
    // Type assertions needed due to Supabase query type inference treating joins as arrays
    type VehicleType = { id: string; name: string; series_number: string; registration_number: string; logo_url: string | null; address: string | null }
    let vehicleData = subscription.vehicle as unknown as VehicleType | null
    const dealData = subscription.deal as unknown as { id: string; name: string; company_name: string; close_at: string; vehicle_id: string } | null
    if (!vehicleData && dealData?.vehicle_id) {
      const { data: dealVehicle } = await supabase
        .from('vehicles')
        .select('id, name, series_number, registration_number, logo_url, address')
        .eq('id', dealData.vehicle_id)
        .single()
      vehicleData = dealVehicle as VehicleType | null
    }

    if (!vehicleData) {
      console.error(`❌ No vehicle found for subscription ${subscriptionId}`)
      return
    }

    // Fetch deal fee structure for product description (the "structure" field)
    let productDescription = ''
    if (subscription.deal_id) {
      const { data: feeStructure } = await supabase
        .from('deal_fee_structures')
        .select('structure')
        .eq('deal_id', subscription.deal_id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (feeStructure?.structure) {
        productDescription = feeStructure.structure
      }
    }

    // Set activated_at timestamp (atomic update with race condition protection)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ activated_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .is('activated_at', null)

    if (updateError) {
      console.error(`❌ Failed to set activated_at for subscription ${subscriptionId}:`, updateError)
      // Continue anyway - the workflow might still be useful
    }

    // Build investor display name based on type
    // Type assertion needed due to Supabase query type inference
    type InvestorType = { type: string | null; legal_name: string | null; first_name: string | null; last_name: string | null }
    const investorData = subscription.investor as unknown as InvestorType | null
    const investorName = investorData
      ? getInvestorDisplayName(investorData)
      : 'Unknown Investor'

    // Get deal close date or use today
    const closeDate = dealData?.close_at
      ? new Date(dealData.close_at)
      : new Date()

    // Build comprehensive certificate payload
    const certificatePayload = {
      // === HEADER TABLE DATA ===
      // Column 1: Vehicle Logo
      vehicle_logo_url: vehicleData.logo_url || '',

      // Column 2: Certificate Number (format: VC{series_number}SH{subscription_number})
      series_number: vehicleData.series_number || '',
      subscription_number: subscription.subscription_number || '',

      // Column 3: Units/Certificates
      units: subscription.units || subscription.num_shares || shares || 0,

      // Column 4: Date (formatted as "Month Day, Year")
      close_at: formatCertificateDate(closeDate),

      // === ISSUER SECTION DATA ===
      vehicle_name: vehicleData.name || '',
      company_name: dealData?.company_name || dealData?.name || '',
      vehicle_registration_number: vehicleData.registration_number || '',

      // === CERTIFICATION TEXT DATA ===
      investor_name: investorName,
      num_shares: subscription.num_shares || shares || 0,
      structure: productDescription, // e.g., "Shares of Series B Preferred Stock of X.AI"

      // === SIGNATURE TABLE DATA ===
      vehicle_address: vehicleData.address || '',

      // Static signatory info (these are the two signatories on every certificate)
      signatory_1_name: 'Mr Julien Machot',
      signatory_1_title: 'Managing Partner',
      signatory_1_signature_url: process.env.SIGNATORY_1_SIGNATURE_URL || '',

      signatory_2_name: 'Mr Frederic Dupont',
      signatory_2_title: 'General Counsel',
      signatory_2_signature_url: process.env.SIGNATORY_2_SIGNATURE_URL || '',

      // === METADATA (useful for n8n workflow) ===
      subscription_id: subscriptionId,
      investor_id: investorId,
      vehicle_id: vehicleId,
      deal_id: subscription.deal_id || '',
      commitment_amount: commitment,
      funded_amount: fundedAmount,
      price_per_share: pricePerShare || null,
      certificate_date: new Date().toISOString().split('T')[0],
      include_watermark: false // Activated subscriptions get clean certificates
    }

    console.log('📜 Triggering Certificate Generation:', {
      subscription_id: subscriptionId,
      investor: investorName,
      certificate_number: `VC${vehicleData.series_number}SH${subscription.subscription_number}`,
      units: certificatePayload.units
    })

    // Trigger certificate generation workflow
    const result = await triggerWorkflow({
      workflowKey: 'generate-investment-certificate',
      payload: certificatePayload,
      entityType: 'subscription',
      entityId: subscriptionId,
      user: {
        id: profile.id,
        email: profile.email || '',
        displayName: profile.display_name || undefined,
        role: profile.role || 'staff_admin',
        title: profile.title || undefined
      }
    })

    if (result.success) {
      console.log(`✅ Certificate generation triggered for subscription ${subscriptionId}`)
    } else {
      console.warn(`⚠️ Certificate workflow not configured: ${result.error}`)
    }

    // Create notification for ALL investor users (not just first one)
    const { data: investorUsers, error: usersError } = await supabase
      .from('investor_users')
      .select('user_id')
      .eq('investor_id', investorId)

    if (usersError) {
      console.error(`❌ Failed to fetch investor users for notification:`, usersError)
    } else if (!investorUsers || investorUsers.length === 0) {
      console.warn(`⚠️ No investor_users found for investor ${investorId} - cannot create notification`)
    } else {
      // Create notifications for all users linked to this investor
      const notifications = investorUsers.map(iu => ({
        user_id: iu.user_id,
        investor_id: investorId,
        type: 'investment_activated',
        title: 'Investment Activated',
        message: 'Your investment is now active. Your equity certificate will be available shortly.',
        link: '/versotech_main/portfolio'
      }))

      const { error: notifError } = await supabase
        .from('investor_notifications')
        .insert(notifications)

      if (notifError) {
        console.error(`❌ Failed to create investor notifications:`, notifError)
      } else {
        console.log(`✅ Created ${notifications.length} notification(s) for investor ${investorId}`)
      }
    }

    // NOTIFY ASSIGNED LAWYERS about certificate issuance
    // First, get the deal_id from the subscription
    const { data: subWithDeal, error: subDealError } = await supabase
      .from('subscriptions')
      .select('deal_id')
      .eq('id', subscriptionId)
      .single()

    if (subDealError || !subWithDeal?.deal_id) {
      console.warn(`⚠️ Could not get deal_id for lawyer notification:`, subDealError)
    } else {
      // Get lawyers assigned to this deal
      const { data: lawyerAssignments, error: assignError } = await supabase
        .from('deal_lawyer_assignments')
        .select('lawyer_id')
        .eq('deal_id', subWithDeal.deal_id)

      if (assignError) {
        console.error(`❌ Failed to fetch lawyer assignments:`, assignError)
      } else if (lawyerAssignments && lawyerAssignments.length > 0) {
        const lawyerIds = lawyerAssignments.map((a: any) => a.lawyer_id)

        // Get lawyer users
        const { data: lawyerUsers, error: lawyerUsersError } = await supabase
          .from('lawyer_users')
          .select('user_id, lawyer_id')
          .in('lawyer_id', lawyerIds)

        if (lawyerUsersError) {
          console.error(`❌ Failed to fetch lawyer users:`, lawyerUsersError)
        } else if (lawyerUsers && lawyerUsers.length > 0) {
          // Get investor name for notification
          const { data: investorForNotif } = await supabase
            .from('investors')
            .select('display_name, legal_name')
            .eq('id', investorId)
            .single()

          const investorNameForNotif = investorForNotif?.display_name || investorForNotif?.legal_name || 'An investor'

          // Create notifications for lawyers
          const lawyerNotifications = lawyerUsers.map((lu: any) => ({
            user_id: lu.user_id,
            investor_id: null,
            type: 'certificate_issued',
            title: 'Certificate Issued',
            message: `Investment certificate issued for ${investorNameForNotif}. The subscription is now fully active.`,
            link: '/versotech_main/subscription-packs'
          }))

          const { error: lawyerNotifError } = await supabase
            .from('investor_notifications')
            .insert(lawyerNotifications)

          if (lawyerNotifError) {
            console.error(`❌ Failed to create lawyer notifications:`, lawyerNotifError)
          } else {
            console.log(`✅ Created ${lawyerNotifications.length} lawyer notification(s) for certificate issuance`)
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Certificate trigger failed for subscription ${subscriptionId}:`, error)
    // Don't throw - this is a non-critical operation
  }
}
