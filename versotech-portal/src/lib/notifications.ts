import { createServiceClient } from '@/lib/supabase/server'

/**
 * Notification types for categorizing investor notifications.
 * Stored inside the metadata.type field.
 */
export type NotificationType =
  | 'kyc_status'
  | 'deal_invite'
  | 'deal_access'
  | 'document'
  | 'task'
  | 'capital_call'
  | 'approval'
  | 'subscription'
  | 'nda_complete'
  | 'system'

export interface CreateNotificationParams {
  /** The user_id (profile) to notify */
  userId: string
  /** Optional investor_id if this notification relates to a specific investor entity */
  investorId?: string
  /** Notification title (displayed prominently) */
  title: string
  /** Notification message body */
  message: string
  /** Optional link for navigation when clicked */
  link?: string
  /** Notification type for categorization */
  type: NotificationType
  /** Additional metadata to store with the notification */
  extraMetadata?: Record<string, unknown>
}

/**
 * Creates an investor notification.
 * Uses the service client to bypass RLS for admin operations.
 *
 * @example
 * await createInvestorNotification({
 *   userId: 'user-uuid',
 *   investorId: 'investor-uuid',
 *   title: 'KYC Approved',
 *   message: 'Your KYC documents have been approved.',
 *   link: '/versoholdings/documents',
 *   type: 'kyc_status',
 *   extraMetadata: { submission_id: 'sub-uuid' }
 * })
 */
export async function createInvestorNotification(params: CreateNotificationParams): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('investor_notifications').insert({
    user_id: params.userId,
    investor_id: params.investorId ?? null,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    metadata: {
      type: params.type,
      ...params.extraMetadata
    }
  })

  if (error) {
    console.error('[notifications] Failed to create notification:', error)
  }
}

/**
 * Helper to resolve the primary user_id for an investor.
 * Returns the first user linked to the investor (by created_at).
 */
export async function getInvestorPrimaryUserId(investorId: string): Promise<string | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('investor_users')
    .select('user_id')
    .eq('investor_id', investorId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    console.error('[notifications] Failed to resolve investor user:', error)
    return null
  }

  return data?.[0]?.user_id ?? null
}
