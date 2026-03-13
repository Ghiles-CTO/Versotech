import { NextRequest, NextResponse } from 'next/server'

import { emailShell, sendEmail } from '@/lib/email/resend-service'
import { getInvestorAccountApprovalReadiness } from '@/lib/kyc/investor-account-approval-readiness'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type ReminderStage = {
  key: '48h' | '72h' | '5d'
  delayHours: number
}

type InvestorCandidate = {
  id: string
  legal_name: string | null
  display_name: string | null
  account_approval_status: string | null
}

type InvestorUserLink = {
  investor_id: string
  user_id: string
  role: string | null
  is_primary: boolean | null
  can_sign: boolean | null
  created_at: string
}

type ProfileRow = {
  id: string
  email: string | null
  display_name: string | null
}

type AcceptedInvitationRow = {
  entity_id: string
  accepted_at: string | null
  accepted_by_user_id: string | null
}

const REMINDER_STAGES: ReminderStage[] = [
  { key: '48h', delayHours: 48 },
  { key: '72h', delayHours: 72 },
  { key: '5d', delayHours: 120 },
]

function normalizeStatus(value?: string | null) {
  return (value || '').toLowerCase().trim()
}

function chooseReminderStage(params: {
  anchorAt: string
  now: number
  sentStages: Set<string>
}): ReminderStage | null {
  const anchorMs = Date.parse(params.anchorAt)
  if (!Number.isFinite(anchorMs)) {
    return null
  }

  for (const stage of REMINDER_STAGES) {
    if (params.sentStages.has(stage.key)) {
      continue
    }

    if (params.now >= anchorMs + stage.delayHours * 60 * 60 * 1000) {
      return stage
    }
  }

  return null
}

function pickReminderRecipient(links: InvestorUserLink[]): InvestorUserLink | null {
  if (links.length === 0) return null

  const sorted = [...links].sort((a, b) => {
    const rank = (row: InvestorUserLink) => {
      if (row.is_primary === true || normalizeStatus(row.role) === 'admin') return 0
      if (row.can_sign === true) return 1
      return 2
    }

    const rankDiff = rank(a) - rank(b)
    if (rankDiff !== 0) return rankDiff
    return Date.parse(a.created_at) - Date.parse(b.created_at)
  })

  return sorted[0] ?? null
}

function buildReminderCopy(params: {
  investorName: string
  stage: ReminderStage
  isReadyToSubmit: boolean
}) {
  if (params.isReadyToSubmit) {
    return {
      title: 'Submit your account for approval',
      message: `Your onboarding is complete. Submit your account for approval to unlock investing for ${params.investorName}.`,
      link: '/versotech_main/profile?tab=overview',
    }
  }

  return {
    title: 'Complete your account onboarding',
    message: `Your account setup for ${params.investorName} is still incomplete. Finish the required onboarding items so your account can be submitted for approval.`,
    link: '/versotech_main/profile?tab=kyc',
  }
}

function buildReminderEmail(params: {
  recipientName: string
  title: string
  message: string
  link: string
}) {
  const body = `
    <div class="content">
      <p>Hello ${params.recipientName},</p>
      <p style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${params.title}</p>
      <p>${params.message}</p>
    </div>

    <div class="button-container">
      <a href="${params.link}" class="button">Access VERSO Portal</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return emailShell(body)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = Date.now()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.versotech.com'

  let remindersSent = 0
  let skipped = 0
  const errors: string[] = []

  try {
    const { data: investors, error: investorsError } = await supabase
      .from('investors')
      .select('id, legal_name, display_name, account_approval_status')
      .or('account_approval_status.is.null,account_approval_status.eq.new,account_approval_status.eq.incomplete,account_approval_status.eq.pending_onboarding')

    if (investorsError) {
      return NextResponse.json(
        { error: 'Failed to load investor accounts', details: investorsError.message },
        { status: 500 }
      )
    }

    const candidates = (investors || []) as InvestorCandidate[]
    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        remindersSent: 0,
        skipped: 0,
        checked: 0,
      })
    }

    const investorIds = candidates.map((investor) => investor.id)

    const [{ data: investorUsers, error: investorUsersError }, { data: invitations, error: invitationsError }, { data: existingNotifications, error: notificationsError }] = await Promise.all([
      supabase
        .from('investor_users')
        .select('investor_id, user_id, role, is_primary, can_sign, created_at')
        .in('investor_id', investorIds),
      supabase
        .from('member_invitations')
        .select('entity_id, accepted_at, accepted_by_user_id')
        .eq('entity_type', 'investor')
        .in('entity_id', investorIds)
        .not('accepted_at', 'is', null),
      supabase
        .from('investor_notifications')
        .select('investor_id, data')
        .eq('type', 'kyc_status')
        .in('investor_id', investorIds)
        .gte('created_at', new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    if (investorUsersError || invitationsError || notificationsError) {
      return NextResponse.json(
        {
          error: 'Failed to load reminder dependencies',
          details: investorUsersError?.message || invitationsError?.message || notificationsError?.message,
        },
        { status: 500 }
      )
    }

    const userLinksByInvestor = new Map<string, InvestorUserLink[]>()
    for (const row of (investorUsers || []) as InvestorUserLink[]) {
      const list = userLinksByInvestor.get(row.investor_id) || []
      list.push(row)
      userLinksByInvestor.set(row.investor_id, list)
    }

    const sentStagesByInvestor = new Map<string, Set<string>>()
    const storedAnchorByInvestor = new Map<string, string>()
    for (const row of existingNotifications || []) {
      const investorId = (row as { investor_id: string | null }).investor_id
      const data = (row as { data?: Record<string, unknown> | null }).data
      if (!investorId || !data || data.workflow !== 'account_approval_reminder') {
        continue
      }

      const stage = typeof data.stage === 'string' ? data.stage : null
      if (!stage) continue

      const sentStages = sentStagesByInvestor.get(investorId) || new Set<string>()
      sentStages.add(stage)
      sentStagesByInvestor.set(investorId, sentStages)

      const anchorAt = typeof data.anchor_at === 'string' ? data.anchor_at : null
      if (anchorAt) {
        const currentAnchor = storedAnchorByInvestor.get(investorId)
        if (!currentAnchor || Date.parse(anchorAt) < Date.parse(currentAnchor)) {
          storedAnchorByInvestor.set(investorId, anchorAt)
        }
      }
    }

    const acceptedAtByInvestorUser = new Map<string, string>()
    for (const row of (invitations || []) as AcceptedInvitationRow[]) {
      if (!row.accepted_at || !row.accepted_by_user_id) continue

      const key = `${row.entity_id}:${row.accepted_by_user_id}`
      const current = acceptedAtByInvestorUser.get(key)
      if (!current || Date.parse(row.accepted_at) < Date.parse(current)) {
        acceptedAtByInvestorUser.set(key, row.accepted_at)
      }
    }

    const recipientUserIds = new Set<string>()
    const recipientByInvestor = new Map<string, InvestorUserLink>()

    for (const investor of candidates) {
      const recipient = pickReminderRecipient(userLinksByInvestor.get(investor.id) || [])
      if (!recipient) continue
      recipientByInvestor.set(investor.id, recipient)
      recipientUserIds.add(recipient.user_id)
    }

    if (recipientUserIds.size === 0) {
      return NextResponse.json({
        success: true,
        checked: candidates.length,
        remindersSent: 0,
        skipped: candidates.length,
      })
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', Array.from(recipientUserIds))

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to load reminder recipients', details: profilesError.message },
        { status: 500 }
      )
    }

    const profilesById = new Map<string, ProfileRow>()
    for (const row of (profiles || []) as ProfileRow[]) {
      profilesById.set(row.id, row)
    }

    for (const investor of candidates) {
      try {
        const currentStatus = normalizeStatus(investor.account_approval_status)
        if (['pending_approval', 'approved', 'rejected', 'unauthorized', 'blacklisted'].includes(currentStatus)) {
          skipped++
          continue
        }

        const recipient = recipientByInvestor.get(investor.id)
        const recipientProfile = recipient ? profilesById.get(recipient.user_id) : null
        if (!recipient || !recipientProfile?.email) {
          skipped++
          continue
        }

        const readiness = await getInvestorAccountApprovalReadiness({
          supabase,
          investorId: investor.id,
        })

        if (!readiness || readiness.hasPendingApproval) {
          skipped++
          continue
        }

        const anchorAt =
          storedAnchorByInvestor.get(investor.id) ||
          acceptedAtByInvestorUser.get(`${investor.id}:${recipient.user_id}`) ||
          recipient.created_at

        if (!anchorAt) {
          skipped++
          continue
        }

        const stage = chooseReminderStage({
          anchorAt,
          now,
          sentStages: sentStagesByInvestor.get(investor.id) || new Set<string>(),
        })

        if (!stage) {
          skipped++
          continue
        }

        const investorName = investor.display_name || investor.legal_name || 'your account'
        const copy = buildReminderCopy({
          investorName,
          stage,
          isReadyToSubmit: readiness.isReady,
        })

        const { error: notificationError } = await supabase.from('investor_notifications').insert({
          user_id: recipient.user_id,
          investor_id: investor.id,
          title: copy.title,
          message: copy.message,
          link: copy.link,
          type: 'kyc_status',
          data: {
            workflow: 'account_approval_reminder',
            stage: stage.key,
            anchor_at: anchorAt,
          },
        })

        if (notificationError) {
          throw new Error(`Failed to create notification: ${notificationError.message}`)
        }

        const emailResult = await sendEmail({
          to: recipientProfile.email,
          subject: `${copy.title} - VERSO`,
          html: buildReminderEmail({
            recipientName: recipientProfile.display_name || 'Investor',
            title: copy.title,
            message: copy.message,
            link: `${appUrl}${copy.link}`,
          }),
        })

        if (!emailResult.success) {
          errors.push(`Investor ${investor.id}: email delivery failed${emailResult.error ? ` (${emailResult.error})` : ''}`)
        }

        remindersSent++
      } catch (error) {
        errors.push(
          `Investor ${investor.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'account_approval_reminders_cron',
      action_details: {
        checked: candidates.length,
        reminders_sent: remindersSent,
        skipped,
        errors: errors.length,
      },
      timestamp: new Date(now).toISOString(),
    })

    return NextResponse.json({
      success: true,
      checked: candidates.length,
      remindersSent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
