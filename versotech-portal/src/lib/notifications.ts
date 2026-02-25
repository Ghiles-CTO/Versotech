import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, emailShell } from '@/lib/email/resend-service'
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
  | 'investment_activated'
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
  'investment_activated',
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
    data: params.extraMetadata ?? null,
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
 * Uses the shared emailShell from resend-service for consistent styling.
 */
function generateNotificationEmail(params: {
  recipientName: string
  title: string
  message: string
  link: string
  type: NotificationType
}): string {
  const buttonText = 'Access VERSO Portal'
  const showTitle = params.type !== 'deal_invite'

  const body = `
    <div class="content">
      ${showTitle ? `<p style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${params.title}</p>` : ''}
      <p>Hello ${params.recipientName},</p>
      <p>${params.message}</p>
    </div>

    <div class="button-container">
      <a href="${params.link}" class="button">${buttonText}</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return emailShell(body)
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
