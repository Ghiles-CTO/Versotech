import type { SupabaseClient } from '@supabase/supabase-js'

export type DealAnalyticsEvent =
  | 'im_interested'
  | 'closed_deal_interest'
  | 'data_room_submit'
  | 'deal_interest_approved'
  | 'deal_subscription_approved'
  | 'nda_completed'
  | 'subscription_completed'
  | 'deal_interest_submitted'

interface TrackDealEventInput {
  supabase: SupabaseClient
  dealId: string
  eventType: DealAnalyticsEvent
  investorId?: string | null
  payload?: Record<string, unknown>
}

/**
 * Stores analytics / telemetry events for deal workflow milestones.
 * Wraps the shared insert logic so event names stay consistent.
 */
export async function trackDealEvent({
  supabase,
  dealId,
  eventType,
  investorId,
  payload
}: TrackDealEventInput) {
  try {
    await supabase.from('deal_activity_events').insert({
      deal_id: dealId,
      investor_id: investorId ?? null,
      event_type: eventType,
      payload: payload ?? {},
      occurred_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to track deal analytics event', { eventType, dealId, error })
  }
}
