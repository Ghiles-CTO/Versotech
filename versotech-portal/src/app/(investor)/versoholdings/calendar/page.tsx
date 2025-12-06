import { redirect } from 'next/navigation'

import { AppLayout } from '@/components/layout/app-layout'
import { CalendarSplitView } from '@/components/calendar/calendar-split-view'
import type { CalendarEvent } from '@/components/calendar/calendar-view'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const TASK_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  high: { id: 'task-high', name: 'Task • High priority', color: '#dc2626' },
  medium: { id: 'task-medium', name: 'Task • Medium priority', color: '#f97316' },
  low: { id: 'task-low', name: 'Task • Standard priority', color: '#2563eb' }
}

const REQUEST_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  urgent: { id: 'request-urgent', name: 'Custom request • Urgent', color: '#be123c' },
  high: { id: 'request-high', name: 'Custom request • High', color: '#b45309' },
  normal: { id: 'request-normal', name: 'Custom request • Standard', color: '#0ea5e9' },
  low: { id: 'request-low', name: 'Custom request • Low', color: '#64748b' }
}

const DEAL_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  open: { id: 'deal-open', name: 'Deal window • Open', color: '#4338ca' },
  allocation_pending: { id: 'deal-allocation', name: 'Deal window • Allocation pending', color: '#7c3aed' },
  closed: { id: 'deal-closed', name: 'Deal window • Closed', color: '#64748b' },
  cancelled: { id: 'deal-cancelled', name: 'Deal window • Cancelled', color: '#9ca3af' }
}

export default async function InvestorCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/versoholdings/login')
  }

  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map((link) => link.investor_id) ?? []
  const serviceSupabase = createServiceClient()

  let tasksQuery = serviceSupabase
    .from('tasks')
    .select('id, title, status, priority, due_at, category, created_at, owner_user_id, owner_investor_id')
    .not('status', 'eq', 'completed')

  if (investorIds.length > 0) {
    tasksQuery = tasksQuery.or(`owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`)
  } else {
    tasksQuery = tasksQuery.eq('owner_user_id', user.id)
  }

  const { data: taskRowsRaw } = await tasksQuery
    .order('due_at', { ascending: true, nullsFirst: false })
    .limit(20)

  // Sort by priority (high → medium → low), then by due_at
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const taskRows = (taskRowsRaw ?? []).sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    if (!a.due_at && !b.due_at) return 0
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  })

  const { data: dealRows } = await serviceSupabase
    .from('deals')
    .select(`
      id,
      name,
      status,
      open_at,
      close_at,
      created_at,
      vehicles ( id, name ),
      deal_memberships!inner ( user_id )
    `)
    .eq('deal_memberships.user_id', user.id)
    .order('close_at', { ascending: true, nullsFirst: false })
    .limit(20)

  let requestRows: Array<{ id: string; subject: string; status: string; priority: string; due_date: string | null; created_at: string }> = []

  if (investorIds.length > 0) {
    const { data: requests } = await serviceSupabase
      .from('request_tickets')
      .select('id, subject, status, priority, due_date, created_at')
      .in('investor_id', investorIds)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(20)

    requestRows = requests ?? []
  }

  const calendarEvents: CalendarEvent[] = []

  for (const task of taskRows ?? []) {
    const priorityKey = task.priority || 'medium'
    const palette = TASK_PALETTE[priorityKey] ?? TASK_PALETTE.low
    const endDate = task.due_at ? new Date(task.due_at) : new Date(task.created_at)
    const startDate = task.due_at ? addDays(endDate, -1) : new Date(task.created_at)

    calendarEvents.push({
      id: `task-${task.id}`,
      name: task.title,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: task.category ? `Category • ${sentenceCase(task.category)}` : undefined
    })
  }

  for (const deal of dealRows ?? []) {
    const statusKey = deal.status ?? 'open'
    const palette = DEAL_PALETTE[statusKey] ?? DEAL_PALETTE.open
    const openDate = deal.open_at ? new Date(deal.open_at) : new Date(deal.created_at)
    const closeDate = deal.close_at ? new Date(deal.close_at) : addDays(openDate, 21)

    calendarEvents.push({
      id: `deal-${deal.id}`,
      name: deal.name,
      startAt: openDate.toISOString(),
      endAt: closeDate.toISOString(),
      status: palette,
      description: deal.vehicles?.[0]?.name ? `Vehicle • ${deal.vehicles[0].name}` : undefined
    })
  }

  for (const request of requestRows) {
    const palette = REQUEST_PALETTE[request.priority] ?? REQUEST_PALETTE.normal
    const startDate = new Date(request.created_at)
    const endDate = request.due_date ? new Date(request.due_date) : addDays(startDate, 3)

    calendarEvents.push({
      id: `request-${request.id}`,
      name: request.subject || 'Custom request',
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: `Status • ${sentenceCase(request.status)}`
    })
  }

  calendarEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  return (
    <AppLayout brand="versoholdings">
      <div className="space-y-8 px-6 py-8">
        <CalendarSplitView
          calendarEvents={calendarEvents}
          emptyCalendarMessage="We'll surface deadlines, deal activity, and deliverables here once they are scheduled."
          brand="versoholdings"
        />
      </div>
    </AppLayout>
  )
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 86_400_000)
}

function sentenceCase(input: string | null): string | undefined {
  if (!input) return undefined
  return input
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

