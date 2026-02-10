import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend-service'
import { resolveAgentIdForTask } from '@/lib/agents'

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
  | 'introducer_invoice_requested'     // Invoice requested by arranger
  | 'introducer_invoice_sent'          // Row 95: Invoice submitted
  | 'introducer_payment_sent'          // Row 96: Payment sent
  | 'introducer_commission_accrued'    // Commission accrued
  | 'introducer_invoice_approved'      // Row 103: Invoice approved by CEO
  | 'introducer_invoice_rejected'      // Row 104: Invoice rejected (request for change)
  | 'introducer_payment_confirmed'     // Row 105: Payment confirmed
  // Partner notification types (PRD Section 5.6)
  | 'partner_commission_accrued'
  | 'partner_invoice_requested'
  | 'partner_invoice_submitted'
  | 'partner_invoiced'
  | 'partner_paid'
  | 'partner_rejected'
  // Commercial partner notification types
  | 'cp_commission_accrued'
  | 'cp_invoice_requested'
  | 'cp_invoice_submitted'
  | 'cp_invoice_approved'
  | 'cp_invoice_rejected'
  | 'cp_payment_confirmed'
  // Deal share types (PRD Rows 95-96)
  | 'deal_shared'
  | 'partner_deal_share'
  // Compliance types (agent-branded)
  | 'risk_alert'
  | 'compliance_question'

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
  /** Optional agent ID for branded notifications */
  agentId?: string
}

const DEFAULT_AGENT_TASK_BY_TYPE: Partial<Record<NotificationType, string>> = {
  kyc_status: 'V002',
  nda_complete: 'V001',
  risk_alert: 'U002',
  compliance_question: 'W001',
}

// Notification types that should trigger email notifications
const EMAIL_NOTIFICATION_TYPES: NotificationType[] = [
  'certificate_issued',
  'subscription',
  'capital_call',
  'escrow_confirmed',
  'deal_invite',
  'kyc_status',
  // GAP-13 FIX: Add introducer notification types for email delivery
  'introducer_agreement_signed',
  'introducer_agreement_pending',
  'introducer_commission_accrued',
  'introducer_invoice_sent',
  'introducer_payment_confirmed',
  // Partner notification types
  'partner_commission_accrued',
  'partner_paid',
  // Commercial partner notification types
  'cp_commission_accrued',
  'cp_invoice_requested',
  'cp_invoice_submitted',
  'cp_invoice_approved',
  'cp_invoice_rejected',
  'cp_payment_confirmed',
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
  let agentId = params.agentId ?? null
  const taskCode = DEFAULT_AGENT_TASK_BY_TYPE[params.type]
  if (!agentId && taskCode) {
    try {
      agentId = await resolveAgentIdForTask(supabase, taskCode)
    } catch (error) {
      console.warn('[notifications] Failed to resolve agent for', taskCode, error)
    }
  }

  // Create database notification with all fields including new columns
  const { error } = await supabase.from('investor_notifications').insert({
    user_id: params.userId,
    investor_id: params.investorId ?? null,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    type: params.type,
    created_by: params.createdBy ?? null,
    deal_id: params.dealId ?? null,
    agent_id: agentId
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
          subject: `${params.title} - VERSO`,
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
 * Uses the unified V E R S O clean design matching all other email templates.
 */
function generateNotificationEmail(params: {
  recipientName: string
  title: string
  message: string
  link: string
  type: NotificationType
}): string {
  // Determine button text based on notification type
  const dealTypes: NotificationType[] = ['deal_invite', 'deal_access', 'deal_shared', 'partner_deal_share']
  const buttonText = dealTypes.includes(params.type) ? 'View Deal' : 'View in Verso'

  // Hide title in body for deal_invite (it's redundant with the notification itself)
  const showTitle = params.type !== 'deal_invite'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&display=swap" rel="stylesheet">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1a1a1a; background-color: #ffffff; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 50px 40px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px; border-bottom: 1px solid #f0f0f0;">
              <p style="font-family: 'League Spartan', Arial, Helvetica, sans-serif; font-size: 48px; font-weight: 800; letter-spacing: 8px; color: #000000; text-transform: uppercase; margin: 0;">V E R S O</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 50px 0 0 0;">
              ${showTitle ? `<p style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px 0;">${params.title}</p>` : ''}
              <p style="font-size: 15px; color: #333333; margin: 0 0 20px 0;">Hi ${params.recipientName},</p>
              <p style="font-size: 15px; color: #333333; margin: 0 0 20px 0;">${params.message}</p>
            </td>
          </tr>
          <!-- Button -->
          <tr>
            <td align="center" style="padding: 25px 0 45px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #0077ac; border-radius: 4px;">
                    <a href="${params.link}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">${buttonText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #f0f0f0; padding-top: 30px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">&copy; ${new Date().getFullYear()} V E R S O. All rights reserved.</p>
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
