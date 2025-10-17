import { AppLayout } from '@/components/layout/app-layout'
import { CalendarSplitView } from '@/components/calendar/calendar-split-view'
import type { CalendarEvent } from '@/components/calendar/calendar-view'
import { requireStaffAuth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const TASK_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  high: { id: 'task-high', name: 'Task • High priority', color: '#dc2626' },
  medium: { id: 'task-medium', name: 'Task • Medium priority', color: '#f97316' },
  low: { id: 'task-low', name: 'Task • Standard priority', color: '#2563eb' }
}

const REQUEST_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  urgent: { id: 'request-urgent', name: 'Investor request • Urgent', color: '#be123c' },
  high: { id: 'request-high', name: 'Investor request • High', color: '#b45309' },
  normal: { id: 'request-normal', name: 'Investor request • Standard', color: '#0ea5e9' },
  low: { id: 'request-low', name: 'Investor request • Low', color: '#64748b' }
}

const REPORT_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  queued: { id: 'report-queued', name: 'Report queue • Queued', color: '#38bdf8' },
  processing: { id: 'report-processing', name: 'Report queue • Processing', color: '#1d4ed8' }
}

const APPROVAL_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  critical: { id: 'approval-critical', name: 'Approval • Critical', color: '#dc2626' },
  high: { id: 'approval-high', name: 'Approval • High priority', color: '#ea580c' },
  medium: { id: 'approval-medium', name: 'Approval • Medium priority', color: '#d97706' },
  low: { id: 'approval-low', name: 'Approval • Low priority', color: '#16a34a' }
}

const DEAL_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  open: { id: 'deal-open', name: 'Deal window • Open', color: '#4338ca' },
  allocation_pending: { id: 'deal-allocation', name: 'Deal window • Allocation pending', color: '#7c3aed' },
  closed: { id: 'deal-closed', name: 'Deal window • Closed', color: '#64748b' },
  cancelled: { id: 'deal-cancelled', name: 'Deal window • Cancelled', color: '#9ca3af' }
}

export default async function StaffCalendarPage() {
  const staffUser = await requireStaffAuth()
  const supabase = createServiceClient()

  const [{ data: taskRows }, { data: requestRows }, { data: reportRows }, { data: approvalRows }, { data: dealRows }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_at, created_at, owner_user_id, owner_investor_id, category')
      .in('status', ['pending', 'in_progress', 'overdue'])
      .not('owner_user_id', 'is', null)
      .order('due_at', { ascending: true, nullsFirst: false })
      .limit(30),
    supabase
      .from('request_tickets')
      .select(`
        id,
        subject,
        status,
        priority,
        due_date,
        created_at,
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey(display_name)
      `)
      .in('status', ['open', 'assigned', 'in_progress', 'awaiting_info'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(30),
    supabase
      .from('report_requests')
      .select('id, report_type, status, created_at, completed_at')
      .in('status', ['queued', 'processing'])
      .order('created_at', { ascending: true })
      .limit(25),
    supabase
      .from('approvals')
      .select('id, entity_type, action, status, priority, created_at, sla_breach_at, request_reason')
      .eq('status', 'pending')
      .order('sla_breach_at', { ascending: true, nullsFirst: false })
      .limit(25),
    supabase
      .from('deals')
      .select('id, name, status, open_at, close_at, created_at')
      .order('close_at', { ascending: true, nullsFirst: false })
      .limit(25)
  ])

  const calendarEvents: CalendarEvent[] = []

  for (const task of taskRows ?? []) {
    const palette = TASK_PALETTE[task.priority ?? 'medium'] ?? TASK_PALETTE.medium
    const startDate = new Date(task.created_at)
    const endDate = task.due_at ? new Date(task.due_at) : addDays(startDate, 2)

    const descriptors: string[] = []
    if (task.category) descriptors.push(`Category • ${toSentence(task.category)}`)
    if (task.owner_user_id === staffUser.id) descriptors.push('Owner • You')

    calendarEvents.push({
      id: `task-${task.id}`,
      name: task.title,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: descriptors.length ? descriptors.join(' · ') : undefined
    })
  }

  for (const request of requestRows ?? []) {
    const palette = REQUEST_PALETTE[request.priority] ?? REQUEST_PALETTE.normal
    const startDate = new Date(request.created_at)
    const endDate = request.due_date ? new Date(request.due_date) : addDays(startDate, 3)

    calendarEvents.push({
      id: `request-${request.id}`,
      name: request.subject || 'Investor request',
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: request.assigned_to_profile?.display_name
        ? `Assigned to ${request.assigned_to_profile.display_name}`
        : `Status • ${toSentence(request.status) || 'Unassigned'}`
    })
  }

  for (const report of reportRows ?? []) {
    const palette = REPORT_PALETTE[report.status] ?? REPORT_PALETTE.queued
    const startDate = new Date(report.created_at)
    const endDate = report.completed_at ? new Date(report.completed_at) : addDays(startDate, 2)

    calendarEvents.push({
      id: `report-${report.id}`,
      name: `Report • ${toSentence(report.report_type) ?? 'Deliverable'}`,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: `Status • ${toSentence(report.status)}`
    })
  }

  for (const approval of approvalRows ?? []) {
    const palette = APPROVAL_PALETTE[approval.priority ?? 'medium'] ?? APPROVAL_PALETTE.medium
    const startDate = new Date(approval.created_at)
    const endDate = approval.sla_breach_at ? new Date(approval.sla_breach_at) : addDays(startDate, 3)

    calendarEvents.push({
      id: `approval-${approval.id}`,
      name: `Approval • ${toSentence(approval.entity_type) ?? 'Request'}`,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: approval.request_reason ? `Reason • ${approval.request_reason}` : `Action • ${toSentence(approval.action)}`
    })
  }

  for (const deal of dealRows ?? []) {
    const palette = DEAL_PALETTE[deal.status ?? 'open'] ?? DEAL_PALETTE.open
    const startDate = deal.open_at ? new Date(deal.open_at) : new Date(deal.created_at)
    const endDate = deal.close_at ? new Date(deal.close_at) : addDays(startDate, 21)

    calendarEvents.push({
      id: `deal-${deal.id}`,
      name: deal.name,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: `Status • ${toSentence(deal.status) || 'Open'}`
    })
  }

  calendarEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  return (
    <AppLayout brand="versotech">
      <div className="space-y-8 px-6 py-8">
        <CalendarSplitView
          calendarEvents={calendarEvents}
          emptyCalendarMessage="Once workflows are scheduled or assigned, they will appear here."
          brand="versotech"
        />
      </div>
    </AppLayout>
  )
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 86_400_000)
}

function toSentence(value: string | null): string | undefined {
  if (!value) return undefined
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
