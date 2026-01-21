/**
 * Invitation Reminders Cron Job
 * POST /api/cron/invitation-reminders
 *
 * Sends reminder emails for pending member invitations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { getAppUrl } from '@/lib/signature/token'

const CRON_SECRET = process.env.CRON_SECRET

const MAX_REMINDERS = 2
const REMINDER_INTERVAL_DAYS = 3

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const reminderCutoff = new Date(now.getTime() - REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000)

  const results = {
    checked: 0,
    reminded: 0,
    skipped: 0,
    errors: [] as string[]
  }

  try {
    const { data: invitations, error } = await supabase
      .from('member_invitations')
      .select('id, email, entity_name, entity_type, role, invited_by_name, expires_at, sent_at, last_reminded_at, reminder_count, invitation_token, created_at')
      .eq('status', 'pending')
      .gt('expires_at', now.toISOString())

    if (error) {
      return NextResponse.json({ error: `Failed to fetch invitations: ${error.message}` }, { status: 500 })
    }

    results.checked = invitations?.length || 0

    const eligible = (invitations || []).filter((invite) => {
      const reminderCount = invite.reminder_count ?? 0
      if (reminderCount >= MAX_REMINDERS) return false

      const lastTouch = invite.last_reminded_at || invite.sent_at || invite.created_at
      if (!lastTouch) return false

      return new Date(lastTouch) <= reminderCutoff
    })

    for (const invite of eligible) {
      try {
        const acceptUrl = `${getAppUrl()}/invitation/accept?token=${invite.invitation_token}`

        const emailResult = await sendInvitationEmail({
          email: invite.email,
          inviteeName: undefined,
          entityName: invite.entity_name || 'the organization',
          entityType: invite.entity_type,
          role: invite.role,
          inviterName: invite.invited_by_name || 'A team member',
          acceptUrl,
          expiresAt: invite.expires_at
        })

        if (!emailResult.success) {
          results.errors.push(`Failed to send reminder for ${invite.email}: ${emailResult.error}`)
          continue
        }

        const newReminderCount = (invite.reminder_count ?? 0) + 1

        await supabase
          .from('member_invitations')
          .update({
            last_reminded_at: now.toISOString(),
            reminder_count: newReminderCount,
            sent_at: invite.sent_at || now.toISOString()
          })
          .eq('id', invite.id)

        await supabase.from('audit_logs').insert({
          event_type: 'authorization',
          action: 'invitation_reminder_sent',
          entity_type: 'member_invitation',
          entity_id: invite.id,
          action_details: {
            email: invite.email,
            entity_type: invite.entity_type,
            reminder_count: newReminderCount
          },
          timestamp: now.toISOString()
        })

        results.reminded += 1
      } catch (reminderError) {
        results.errors.push(
          `Error processing invitation ${invite.id}: ${reminderError instanceof Error ? reminderError.message : 'unknown error'}`
        )
      }
    }

    results.skipped = results.checked - results.reminded

    return NextResponse.json({
      success: true,
      message: `Processed ${results.checked} invitations, sent ${results.reminded} reminder(s).`,
      results
    })
  } catch (error) {
    console.error('[invitation-reminders] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
