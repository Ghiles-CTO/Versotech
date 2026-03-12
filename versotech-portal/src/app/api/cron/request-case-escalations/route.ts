import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ADMIN_CASE_SLA_HOURS } from '@/lib/audit/admin-cases'

const UNRESOLVED_STATUSES = ['open', 'assigned', 'in_progress', 'awaiting_info']

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const threshold = new Date(now.getTime() - ADMIN_CASE_SLA_HOURS * 60 * 60 * 1000).toISOString()
  const escalationReason = 'Automatically escalated after remaining unresolved for more than 3 days.'

  try {
    const { data: staleCases, error: staleError } = await supabase
      .from('request_tickets')
      .select(`
        id,
        subject,
        status,
        created_at,
        assigned_to,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email)
      `)
      .in('status', UNRESOLVED_STATUSES)
      .is('escalated_at', null)
      .lte('created_at', threshold)
      .order('created_at', { ascending: true })
      .limit(100)

    if (staleError) {
      throw staleError
    }

    if (!staleCases?.length) {
      return NextResponse.json({
        success: true,
        escalatedCount: 0,
        checkedAt: now.toISOString(),
      })
    }

    const { data: supervisors, error: supervisorError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('role', ['staff_admin', 'ceo'])

    if (supervisorError) {
      throw supervisorError
    }

    const escalated: Array<{ id: string; subject: string | null }> = []

    for (const caseItem of staleCases) {
      const { error: updateError } = await supabase
        .from('request_tickets')
        .update({
          escalated_at: now.toISOString(),
          escalation_reason: escalationReason,
        })
        .eq('id', caseItem.id)
        .is('escalated_at', null)

      if (updateError) {
        console.error('[request-case-escalations] Failed to update request ticket', caseItem.id, updateError)
        continue
      }

      const assignee = Array.isArray(caseItem.assigned_to_profile)
        ? caseItem.assigned_to_profile[0]
        : caseItem.assigned_to_profile
      const investor = Array.isArray(caseItem.investor) ? caseItem.investor[0] : caseItem.investor

      await supabase.from('audit_logs').insert({
        event_type: 'case_management',
        actor_id: null,
        action: 'request_escalated',
        entity_type: 'request_tickets',
        entity_id: caseItem.id,
        action_details: {
          summary: 'Escalated to supervisor',
          reason: escalationReason,
          previous_status: caseItem.status,
          assignee_name: assignee?.display_name || assignee?.email || null,
        },
        timestamp: now.toISOString(),
      })

      if (supervisors?.length) {
        const notifications = supervisors.map((supervisor) => ({
          user_id: supervisor.id,
          investor_id: investor?.id ?? null,
          title: 'Escalated admin case',
          message: `${caseItem.subject || 'Untitled case'} exceeded the 3-day SLA and needs supervisor review.`,
          link: `/versotech_main/audit?tab=cases&caseId=${caseItem.id}`,
          type: 'system',
          data: {
            request_ticket_id: caseItem.id,
            escalation_reason: escalationReason,
            assigned_to: assignee?.display_name || assignee?.email || null,
          },
        }))

        await supabase.from('investor_notifications').insert(notifications)
      }

      escalated.push({ id: caseItem.id, subject: caseItem.subject })
    }

    return NextResponse.json({
      success: true,
      escalatedCount: escalated.length,
      escalated,
      checkedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('[request-case-escalations] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request escalations' },
      { status: 500 },
    )
  }
}
