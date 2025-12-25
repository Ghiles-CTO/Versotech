/**
 * Certificate Trigger Utility
 * Triggers certificate generation when subscription becomes active
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
    // IDEMPOTENCY CHECK: First verify subscription exists and is not already activated
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, status, activated_at')
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

    // Set activated_at timestamp (atomic update)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ activated_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .is('activated_at', null)  // Only update if still null (race condition protection)

    if (updateError) {
      console.error(`❌ Failed to set activated_at for subscription ${subscriptionId}:`, updateError)
      // Continue anyway - the workflow might still be useful
    }

    // Trigger certificate generation workflow (async)
    const result = await triggerWorkflow({
      workflowKey: 'generate-investment-certificate',
      payload: {
        subscription_id: subscriptionId,
        investor_id: investorId,
        vehicle_id: vehicleId,
        commitment_amount: commitment,
        funded_amount: fundedAmount,
        shares: shares || null,
        price_per_share: pricePerShare || null,
        certificate_date: new Date().toISOString().split('T')[0],
        include_watermark: true
      },
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
    } else if (investorUsers && investorUsers.length > 0) {
      // Create notifications for all users linked to this investor
      const notifications = investorUsers.map(iu => ({
        user_id: iu.user_id,
        investor_id: investorId,
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
  } catch (error) {
    console.error(`❌ Certificate trigger failed for subscription ${subscriptionId}:`, error)
    // Don't throw - this is a non-critical operation
  }
}
