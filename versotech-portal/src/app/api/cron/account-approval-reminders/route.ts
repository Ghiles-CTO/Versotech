import { NextRequest, NextResponse } from 'next/server'

import { emailShell, sendEmail } from '@/lib/email/resend-service'
import { getIntroducerAccountApprovalReadiness } from '@/lib/kyc/introducer-account-approval-readiness'
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

type IntroducerCandidate = {
  id: string
  legal_name: string | null
  contact_name: string | null
  account_approval_status: string | null
}

type ReminderRecipientLink = {
  user_id: string
  role: string | null
  is_primary: boolean | null
  can_sign: boolean | null
  created_at: string
}

type InvestorUserLink = ReminderRecipientLink & {
  investor_id: string
}

type IntroducerUserLink = ReminderRecipientLink & {
  introducer_id: string
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

function sortReminderRecipients<T extends ReminderRecipientLink>(links: T[]): T[] {
  return [...links].sort((a, b) => {
    const rank = (row: ReminderRecipientLink) => {
      if (row.is_primary === true || normalizeStatus(row.role) === 'admin') return 0
      if (row.can_sign === true) return 1
      return 2
    }

    const rankDiff = rank(a) - rank(b)
    if (rankDiff !== 0) return rankDiff
    return Date.parse(a.created_at) - Date.parse(b.created_at)
  })
}

function pickReminderRecipient<T extends ReminderRecipientLink>(links: T[]): T | null {
  return sortReminderRecipients(links)[0] ?? null
}

function pickPrimaryAndAdminRecipients<T extends ReminderRecipientLink>(links: T[]): T[] {
  if (links.length === 0) return []

  const primaryOrAdmins = links.filter((link) => {
    if (link.is_primary === true) return true
    return normalizeStatus(link.role) === 'admin'
  })

  const selected = primaryOrAdmins.length > 0
    ? sortReminderRecipients(primaryOrAdmins)
    : sortReminderRecipients(links).slice(0, 1)

  const seenUserIds = new Set<string>()
  return selected.filter((link) => {
    if (!link.user_id || seenUserIds.has(link.user_id)) return false
    seenUserIds.add(link.user_id)
    return true
  })
}

function getEarliestTimestamp(values: Array<string | null | undefined>): string | null {
  let earliest: string | null = null

  for (const value of values) {
    if (!value) continue
    const parsed = Date.parse(value)
    if (!Number.isFinite(parsed)) continue
    if (!earliest || parsed < Date.parse(earliest)) {
      earliest = value
    }
  }

  return earliest
}

function buildInvestorReminderCopy(params: {
  investorName: string
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

function buildIntroducerReminderCopy(params: {
  introducerName: string
  isReadyToSubmit: boolean
}) {
  if (params.isReadyToSubmit) {
    return {
      title: 'Submit your account for approval',
      message: `Your onboarding is complete. Submit your account for approval to activate ${params.introducerName} for introductions, agreements, and commissions.`,
      link: '/versotech_main/introducer-profile?tab=overview',
    }
  }

  return {
    title: 'Complete your account onboarding',
    message: `Your introducer account setup for ${params.introducerName} is still incomplete. Finish the required onboarding items so your account can be submitted for approval.`,
    link: '/versotech_main/introducer-profile?tab=kyc',
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
    const [
      { data: investors, error: investorsError },
      { data: introducers, error: introducersError },
    ] = await Promise.all([
      supabase
        .from('investors')
        .select('id, legal_name, display_name, account_approval_status')
        .or('account_approval_status.is.null,account_approval_status.eq.new,account_approval_status.eq.incomplete,account_approval_status.eq.pending_onboarding'),
      supabase
        .from('introducers')
        .select('id, legal_name, contact_name, account_approval_status')
        .or('account_approval_status.is.null,account_approval_status.eq.new,account_approval_status.eq.incomplete,account_approval_status.eq.pending_onboarding'),
    ])

    if (investorsError || introducersError) {
      return NextResponse.json(
        {
          error: 'Failed to load account reminder candidates',
          details: investorsError?.message || introducersError?.message,
        },
        { status: 500 }
      )
    }

    const investorCandidates = (investors || []) as InvestorCandidate[]
    const introducerCandidates = (introducers || []) as IntroducerCandidate[]
    const checked = investorCandidates.length + introducerCandidates.length

    if (checked === 0) {
      return NextResponse.json({
        success: true,
        remindersSent: 0,
        skipped: 0,
        checked: 0,
      })
    }

    if (investorCandidates.length > 0) {
      const investorIds = investorCandidates.map((investor) => investor.id)

      const [
        { data: investorUsers, error: investorUsersError },
        { data: invitations, error: invitationsError },
        { data: existingNotifications, error: notificationsError },
      ] = await Promise.all([
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
            error: 'Failed to load investor reminder dependencies',
            details:
              investorUsersError?.message ||
              invitationsError?.message ||
              notificationsError?.message,
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

      for (const investor of investorCandidates) {
        const recipient = pickReminderRecipient(userLinksByInvestor.get(investor.id) || [])
        if (!recipient) continue
        recipientByInvestor.set(investor.id, recipient)
        recipientUserIds.add(recipient.user_id)
      }

      const profilesById = new Map<string, ProfileRow>()
      if (recipientUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', Array.from(recipientUserIds))

        if (profilesError) {
          return NextResponse.json(
            { error: 'Failed to load investor reminder recipients', details: profilesError.message },
            { status: 500 }
          )
        }

        for (const row of (profiles || []) as ProfileRow[]) {
          profilesById.set(row.id, row)
        }
      }

      for (const investor of investorCandidates) {
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
          const copy = buildInvestorReminderCopy({
            investorName,
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
              persona_type: 'investor',
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
    }

    if (introducerCandidates.length > 0) {
      const introducerIds = introducerCandidates.map((introducer) => introducer.id)

      const [
        { data: introducerUsers, error: introducerUsersError },
        { data: invitations, error: invitationsError },
        { data: existingNotifications, error: notificationsError },
      ] = await Promise.all([
        supabase
          .from('introducer_users')
          .select('introducer_id, user_id, role, is_primary, can_sign, created_at')
          .in('introducer_id', introducerIds),
        supabase
          .from('member_invitations')
          .select('entity_id, accepted_at, accepted_by_user_id')
          .eq('entity_type', 'introducer')
          .in('entity_id', introducerIds)
          .not('accepted_at', 'is', null),
        supabase
          .from('investor_notifications')
          .select('investor_id, data')
          .eq('type', 'kyc_status')
          .in('investor_id', introducerIds)
          .gte('created_at', new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      if (introducerUsersError || invitationsError || notificationsError) {
        return NextResponse.json(
          {
            error: 'Failed to load introducer reminder dependencies',
            details:
              introducerUsersError?.message ||
              invitationsError?.message ||
              notificationsError?.message,
          },
          { status: 500 }
        )
      }

      const userLinksByIntroducer = new Map<string, IntroducerUserLink[]>()
      for (const row of (introducerUsers || []) as IntroducerUserLink[]) {
        const list = userLinksByIntroducer.get(row.introducer_id) || []
        list.push(row)
        userLinksByIntroducer.set(row.introducer_id, list)
      }

      const sentStagesByIntroducer = new Map<string, Set<string>>()
      const storedAnchorByIntroducer = new Map<string, string>()
      for (const row of existingNotifications || []) {
        const introducerId = (row as { investor_id: string | null }).investor_id
        const data = (row as { data?: Record<string, unknown> | null }).data
        if (!introducerId || !data || data.workflow !== 'account_approval_reminder') {
          continue
        }

        if (data.persona_type && data.persona_type !== 'introducer') {
          continue
        }

        const stage = typeof data.stage === 'string' ? data.stage : null
        if (!stage) continue

        const sentStages = sentStagesByIntroducer.get(introducerId) || new Set<string>()
        sentStages.add(stage)
        sentStagesByIntroducer.set(introducerId, sentStages)

        const anchorAt = typeof data.anchor_at === 'string' ? data.anchor_at : null
        if (anchorAt) {
          const currentAnchor = storedAnchorByIntroducer.get(introducerId)
          if (!currentAnchor || Date.parse(anchorAt) < Date.parse(currentAnchor)) {
            storedAnchorByIntroducer.set(introducerId, anchorAt)
          }
        }
      }

      const acceptedAtByIntroducerUser = new Map<string, string>()
      for (const row of (invitations || []) as AcceptedInvitationRow[]) {
        if (!row.accepted_at || !row.accepted_by_user_id) continue

        const key = `${row.entity_id}:${row.accepted_by_user_id}`
        const current = acceptedAtByIntroducerUser.get(key)
        if (!current || Date.parse(row.accepted_at) < Date.parse(current)) {
          acceptedAtByIntroducerUser.set(key, row.accepted_at)
        }
      }

      const recipientUserIds = new Set<string>()
      const recipientsByIntroducer = new Map<string, IntroducerUserLink[]>()

      for (const introducer of introducerCandidates) {
        const recipients = pickPrimaryAndAdminRecipients(userLinksByIntroducer.get(introducer.id) || [])
        if (recipients.length === 0) continue
        recipientsByIntroducer.set(introducer.id, recipients)
        recipients.forEach((recipient) => recipientUserIds.add(recipient.user_id))
      }

      const profilesById = new Map<string, ProfileRow>()
      if (recipientUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', Array.from(recipientUserIds))

        if (profilesError) {
          return NextResponse.json(
            { error: 'Failed to load introducer reminder recipients', details: profilesError.message },
            { status: 500 }
          )
        }

        for (const row of (profiles || []) as ProfileRow[]) {
          profilesById.set(row.id, row)
        }
      }

      for (const introducer of introducerCandidates) {
        try {
          const currentStatus = normalizeStatus(introducer.account_approval_status)
          if (['pending_approval', 'approved', 'rejected', 'unauthorized', 'blacklisted'].includes(currentStatus)) {
            skipped++
            continue
          }

          const recipients = recipientsByIntroducer.get(introducer.id) || []
          if (recipients.length === 0) {
            skipped++
            continue
          }

          const readiness = await getIntroducerAccountApprovalReadiness({
            supabase,
            introducerId: introducer.id,
          })

          if (!readiness || readiness.hasPendingApproval) {
            skipped++
            continue
          }

          const anchorAt =
            storedAnchorByIntroducer.get(introducer.id) ||
            getEarliestTimestamp([
              ...recipients.map((recipient) => acceptedAtByIntroducerUser.get(`${introducer.id}:${recipient.user_id}`)),
              ...recipients.map((recipient) => recipient.created_at),
            ])

          if (!anchorAt) {
            skipped++
            continue
          }

          const stage = chooseReminderStage({
            anchorAt,
            now,
            sentStages: sentStagesByIntroducer.get(introducer.id) || new Set<string>(),
          })

          if (!stage) {
            skipped++
            continue
          }

          const introducerName = introducer.legal_name || introducer.contact_name || 'your account'
          const copy = buildIntroducerReminderCopy({
            introducerName,
            isReadyToSubmit: readiness.isReady,
          })

          let sentForIntroducer = false

          for (const recipient of recipients) {
            const { error: notificationError } = await supabase.from('investor_notifications').insert({
              user_id: recipient.user_id,
              investor_id: introducer.id,
              title: copy.title,
              message: copy.message,
              link: copy.link,
              type: 'kyc_status',
              data: {
                workflow: 'account_approval_reminder',
                persona_type: 'introducer',
                stage: stage.key,
                anchor_at: anchorAt,
              },
            })

            if (notificationError) {
              errors.push(`Introducer ${introducer.id} (${recipient.user_id}): notification failed (${notificationError.message})`)
              continue
            }

            sentForIntroducer = true

            const recipientProfile = profilesById.get(recipient.user_id)
            if (!recipientProfile?.email) {
              continue
            }

            const emailResult = await sendEmail({
              to: recipientProfile.email,
              subject: `${copy.title} - VERSO`,
              html: buildReminderEmail({
                recipientName: recipientProfile.display_name || 'Introducer',
                title: copy.title,
                message: copy.message,
                link: `${appUrl}${copy.link}`,
              }),
            })

            if (!emailResult.success) {
              errors.push(`Introducer ${introducer.id} (${recipient.user_id}): email delivery failed${emailResult.error ? ` (${emailResult.error})` : ''}`)
            }
          }

          if (sentForIntroducer) {
            remindersSent++
          } else {
            skipped++
          }
        } catch (error) {
          errors.push(
            `Introducer ${introducer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }
    }

    await supabase.from('audit_logs').insert({
      event_type: 'system',
      action: 'account_approval_reminders_cron',
      action_details: {
        checked,
        reminders_sent: remindersSent,
        skipped,
        errors: errors.length,
      },
      timestamp: new Date(now).toISOString(),
    })

    return NextResponse.json({
      success: true,
      checked,
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
