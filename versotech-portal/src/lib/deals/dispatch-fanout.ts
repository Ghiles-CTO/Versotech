import type { SupabaseClient } from '@supabase/supabase-js'
import { createInvestorNotification, type NotificationType } from '@/lib/notifications'
import { emailShell, sendEmail } from '@/lib/email/resend-service'

interface DealDispatchFanoutParams {
  supabase: SupabaseClient<any, any, any>
  dealId: string
  dealName: string
  seedUserIds: string[]
  investorIds?: Array<string | null | undefined>
  initiatedByUserId: string
  role?: string
  notificationTitle?: string
  notificationMessage?: string
  notificationType?: NotificationType
  notificationLink?: string
}

interface DealDispatchFanoutResult {
  success: boolean
  notifiedUsers: number
  emailedRecipients: number
  errors: string[]
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))]
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildDealInviteEmailHtml(params: {
  title: string
  message: string
  dealName: string
  fullLink: string
}) {
  const { title, message, dealName, fullLink } = params

  const body = `
    <div class="content">
      <p style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${escapeHtml(title)}</p>
      <p>Hello,</p>
      <p>${escapeHtml(message)}</p>
      <p><strong>Deal:</strong> ${escapeHtml(dealName)}</p>
    </div>

    <div class="button-container">
      <a href="${fullLink}" class="button">Review Opportunity</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return emailShell(body)
}

async function resolveDispatchRecipients(params: {
  supabase: SupabaseClient<any, any, any>
  seedUserIds: string[]
  investorIds: string[]
}) {
  const { supabase, seedUserIds, investorIds } = params

  const userIds = new Set<string>(seedUserIds)
  const userInvestorMap = new Map<string, string>()
  const emailRecipients = new Set<string>()

  // Expand recipients to all active users linked to each investor entity.
  if (investorIds.length > 0) {
    const { data: investorUsers, error: investorUsersError } = await supabase
      .from('investor_users')
      .select('user_id, investor_id')
      .in('investor_id', investorIds)
      .eq('is_active', true)

    if (investorUsersError) {
      throw new Error(`Failed loading investor users: ${investorUsersError.message}`)
    }

    for (const row of investorUsers || []) {
      if (row.user_id) {
        userIds.add(row.user_id)
        if (row.investor_id && !userInvestorMap.has(row.user_id)) {
          userInvestorMap.set(row.user_id, row.investor_id)
        }
      }
    }
  }

  const allUserIds = [...userIds]

  // For any user without a mapped investor_id, attempt to resolve from investor_users.
  const unresolvedUserIds = allUserIds.filter(userId => !userInvestorMap.has(userId))
  if (unresolvedUserIds.length > 0) {
    const { data: userInvestorRows, error: userInvestorError } = await supabase
      .from('investor_users')
      .select('user_id, investor_id, is_primary')
      .in('user_id', unresolvedUserIds)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (userInvestorError) {
      throw new Error(`Failed resolving investor links: ${userInvestorError.message}`)
    }

    for (const row of userInvestorRows || []) {
      if (row.user_id && row.investor_id && !userInvestorMap.has(row.user_id)) {
        userInvestorMap.set(row.user_id, row.investor_id)
      }
    }
  }

  const resolvedInvestorIds = uniqueStrings([
    ...investorIds,
    ...allUserIds.map(userId => userInvestorMap.get(userId)),
  ])

  // Member emails (supports member-only recipients without platform users).
  if (resolvedInvestorIds.length > 0) {
    const { data: memberRows, error: memberError } = await supabase
      .from('investor_members')
      .select('email')
      .in('investor_id', resolvedInvestorIds)
      .eq('is_active', true)
      .not('email', 'is', null)

    if (memberError) {
      throw new Error(`Failed loading investor member emails: ${memberError.message}`)
    }

    for (const row of memberRows || []) {
      const email = typeof row.email === 'string' ? normalizeEmail(row.email) : ''
      if (email && isValidEmail(email)) {
        emailRecipients.add(email)
      }
    }
  }

  // Keep profile emails as safety fallback for user recipients.
  if (allUserIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', allUserIds)

    if (profileError) {
      throw new Error(`Failed loading user profile emails: ${profileError.message}`)
    }

    for (const row of profileRows || []) {
      const email = typeof row.email === 'string' ? normalizeEmail(row.email) : ''
      if (email && isValidEmail(email)) {
        emailRecipients.add(email)
      }
    }
  }

  return {
    userIds: allUserIds,
    userInvestorMap,
    emailRecipients: [...emailRecipients],
  }
}

export async function sendDealDispatchFanout(params: DealDispatchFanoutParams): Promise<DealDispatchFanoutResult> {
  const {
    supabase,
    dealId,
    dealName,
    seedUserIds,
    investorIds = [],
    initiatedByUserId,
    role,
    notificationTitle = 'Deal Invitation',
    notificationMessage = `You've been invited to view ${dealName}. Review the deal details and data room.`,
    notificationType = 'deal_invite',
    notificationLink = `/versotech_main/opportunities/${dealId}`,
  } = params

  const errors: string[] = []

  try {
    const recipients = await resolveDispatchRecipients({
      supabase,
      seedUserIds: uniqueStrings(seedUserIds),
      investorIds: uniqueStrings(investorIds),
    })

    const notifyResults = await Promise.allSettled(
      recipients.userIds.map(userId =>
        createInvestorNotification({
          userId,
          investorId: recipients.userInvestorMap.get(userId),
          title: notificationTitle,
          message: notificationMessage,
          link: notificationLink,
          type: notificationType,
          sendEmailNotification: false, // Email fanout is member-based and handled below.
          createdBy: initiatedByUserId,
          dealId,
          extraMetadata: {
            deal_id: dealId,
            role: role || null,
            initiated_by: initiatedByUserId,
          },
        })
      )
    )

    const notifyFailures = notifyResults
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason)

    if (notifyFailures.length > 0) {
      errors.push(`Failed creating ${notifyFailures.length} in-app notification(s)`)
      console.error('[deal-dispatch-fanout] Notification fanout failures:', notifyFailures)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.versoholdings.com'
    const fullLink = `${appUrl}${notificationLink}`
    const emailHtml = buildDealInviteEmailHtml({
      title: notificationTitle,
      message: notificationMessage,
      dealName,
      fullLink,
    })

    const emailSubject = `${notificationTitle} - VERSO`
    let emailedRecipients = 0

    const emailResults = await Promise.allSettled(
      recipients.emailRecipients.map(async email => {
        const result = await sendEmail({
          to: email,
          subject: emailSubject,
          html: emailHtml,
        })

        if (!result.success) {
          throw new Error(result.error || `Unknown email error for ${email}`)
        }
      })
    )

    const emailFailures = emailResults.filter(result => result.status === 'rejected')
    emailedRecipients = emailResults.length - emailFailures.length

    if (emailFailures.length > 0) {
      errors.push(`Failed sending ${emailFailures.length} email(s)`)
      console.error('[deal-dispatch-fanout] Email fanout failures:', emailFailures)
    }

    return {
      success: errors.length === 0,
      notifiedUsers: recipients.userIds.length,
      emailedRecipients,
      errors,
    }
  } catch (error) {
    console.error('[deal-dispatch-fanout] Unexpected error:', error)
    return {
      success: false,
      notifiedUsers: 0,
      emailedRecipients: 0,
      errors: [error instanceof Error ? error.message : 'Unknown fanout error'],
    }
  }
}

