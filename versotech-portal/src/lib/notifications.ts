import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend-service'

/**
 * Notification types for categorizing investor notifications.
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
  | 'certificate_issued'
  | 'escrow_confirmed'
  | 'system'
  // Introducer notification types (PRD Section 6.6)
  | 'introducer_agreement_signed'      // Row 86: Agreement signed
  | 'introducer_agreement_rejected'    // Row 88: Agreement rejected
  | 'introducer_agreement_pending'     // Agreement pending signature
  | 'introducer_pack_sent'             // Row 91: Pack sent to referred investor
  | 'introducer_pack_approved'         // Row 92: Pack approved by referred investor
  | 'introducer_pack_signed'           // Row 93: Pack signed by referred investor
  | 'introducer_escrow_funded'         // Row 94: Escrow funded by referred investor
  | 'introducer_invoice_sent'          // Row 95: Invoice submitted
  | 'introducer_payment_sent'          // Row 96: Payment sent
  | 'introducer_commission_accrued'    // Commission accrued
  | 'introducer_invoice_approved'      // Row 103: Invoice approved by CEO
  | 'introducer_invoice_rejected'      // Row 104: Invoice rejected (request for change)
  | 'introducer_payment_confirmed'     // Row 105: Payment confirmed
  // Partner notification types (PRD Section 5.6)
  | 'partner_commission_accrued'
  | 'partner_invoice_requested'
  | 'partner_invoiced'
  | 'partner_paid'
  | 'partner_rejected'
  // Deal share types (PRD Rows 95-96)
  | 'deal_shared'
  | 'partner_deal_share'

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
  /** Whether to also send an email (default: true for important notifications) */
  sendEmailNotification?: boolean
  /** User ID who triggered this notification (for "assigned by me" filtering) */
  createdBy?: string
  /** Related deal ID for deal-specific notifications */
  dealId?: string
}

// Notification types that should trigger email notifications
const EMAIL_NOTIFICATION_TYPES: NotificationType[] = [
  'certificate_issued',
  'subscription',
  'capital_call',
  'escrow_confirmed',
  'deal_invite',
  'kyc_status'
]

/**
 * Creates an investor notification and optionally sends an email.
 * Uses the service client to bypass RLS for admin operations.
 *
 * @example
 * await createInvestorNotification({
 *   userId: 'user-uuid',
 *   investorId: 'investor-uuid',
 *   title: 'KYC Approved',
 *   message: 'Your KYC documents have been approved.',
 *   link: '/versoholdings/documents',
 *   type: 'kyc_status'
 * })
 */
export async function createInvestorNotification(params: CreateNotificationParams): Promise<void> {
  const supabase = createServiceClient()

  // Create database notification with all fields including new columns
  const { error } = await supabase.from('investor_notifications').insert({
    user_id: params.userId,
    investor_id: params.investorId ?? null,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    type: params.type,
    created_by: params.createdBy ?? null,
    deal_id: params.dealId ?? null
  })

  if (error) {
    console.error('[notifications] Failed to create notification:', error)
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  // Send email for important notification types
  const shouldSendEmail = params.sendEmailNotification !== false &&
    EMAIL_NOTIFICATION_TYPES.includes(params.type)

  if (shouldSendEmail) {
    try {
      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', params.userId)
        .single()

      if (profile?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.versoholdings.com'
        const fullLink = params.link ? `${appUrl}${params.link}` : appUrl

        await sendEmail({
          to: profile.email,
          subject: `${params.title} - VERSO Holdings`,
          html: generateNotificationEmail({
            recipientName: profile.display_name || 'Investor',
            title: params.title,
            message: params.message,
            link: fullLink,
            type: params.type
          })
        })
        console.log(`[notifications] Email sent to ${profile.email} for ${params.type}`)
      }
    } catch (emailError) {
      console.error('[notifications] Failed to send email notification:', emailError)
      // Don't throw - email failure shouldn't block the notification creation
    }
  }
}

/**
 * Creates notifications for all users linked to an investor entity
 */
export async function createInvestorNotificationForAll(params: Omit<CreateNotificationParams, 'userId'> & { investorId: string }): Promise<void> {
  const supabase = createServiceClient()

  // Get all users linked to this investor
  const { data: investorUsers } = await supabase
    .from('investor_users')
    .select('user_id')
    .eq('investor_id', params.investorId)

  if (!investorUsers || investorUsers.length === 0) {
    console.warn(`[notifications] No users found for investor ${params.investorId}`)
    return
  }

  // Create notification for each user
  for (const iu of investorUsers) {
    await createInvestorNotification({
      ...params,
      userId: iu.user_id
    })
  }
}

/**
 * Generate HTML email for notification
 */
function generateNotificationEmail(params: {
  recipientName: string
  title: string
  message: string
  link: string
  type: NotificationType
}): string {
  const typeColors: Partial<Record<NotificationType, string>> = {
    // Core types
    certificate_issued: '#10b981', // green
    subscription: '#6366f1', // indigo
    capital_call: '#f59e0b', // amber
    escrow_confirmed: '#10b981', // green
    deal_invite: '#8b5cf6', // purple
    kyc_status: '#3b82f6', // blue
    deal_access: '#6366f1',
    document: '#6366f1',
    task: '#f59e0b',
    approval: '#10b981',
    nda_complete: '#10b981',
    system: '#6b7280',
    // Introducer types (PRD Section 6.6)
    introducer_agreement_signed: '#10b981',
    introducer_agreement_rejected: '#ef4444',
    introducer_agreement_pending: '#f59e0b',
    introducer_pack_sent: '#6366f1',
    introducer_pack_approved: '#10b981',
    introducer_pack_signed: '#10b981',
    introducer_escrow_funded: '#10b981',
    introducer_invoice_sent: '#6366f1',
    introducer_payment_sent: '#10b981',
    introducer_commission_accrued: '#8b5cf6',
    introducer_invoice_approved: '#10b981',
    introducer_invoice_rejected: '#ef4444',
    introducer_payment_confirmed: '#10b981',
    // Partner types (PRD Section 5.6)
    partner_commission_accrued: '#8b5cf6',
    partner_invoice_requested: '#6366f1',
    partner_invoiced: '#10b981',
    partner_paid: '#10b981',
    partner_rejected: '#ef4444',
    // Deal share types
    deal_shared: '#3b82f6',
    partner_deal_share: '#3b82f6'
  }

  const accentColor = typeColors[params.type] || '#6366f1'

  // All styles are inline for email client compatibility (Gmail, Outlook strip <style> tags)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">VERSO Holdings</h1>
                </td>
              </tr>
              <!-- Accent Bar -->
              <tr>
                <td style="height: 4px; background-color: ${accentColor};"></td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <h2 style="color: #1a1a2e; margin-top: 0; margin-bottom: 16px; font-size: 20px;">${params.title}</h2>
                  <p style="margin: 0 0 16px 0; color: #333333;">Hi ${params.recipientName},</p>

                  <!-- Message Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                    <tr>
                      <td style="background-color: #f8fafc; border-left: 4px solid ${accentColor}; padding: 20px;">
                        <p style="margin: 0; color: #333333;">${params.message}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Button -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                    <tr>
                      <td style="background-color: ${accentColor}; border-radius: 6px;">
                        <a href="${params.link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">View in Portal</a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666666; font-size: 14px; margin-top: 30px; margin-bottom: 0;">
                    If you have any questions, please contact our team through the platform.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; text-align: center; padding: 20px;">
                  <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px;">&copy; ${new Date().getFullYear()} VERSO Holdings. All rights reserved.</p>
                  <p style="margin: 0; color: #666666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
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
