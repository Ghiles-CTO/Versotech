import { AppLayout } from '@/components/layout/app-layout'
import { StaffGanttView, type GanttFeatureDTO, type GanttMarkerDTO } from '@/components/gantt/staff-gantt-view'
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
  queued: { id: 'report-queued', name: 'Report generation • Queued', color: '#38bdf8' },
  processing: { id: 'report-processing', name: 'Report generation • Processing', color: '#1d4ed8' }
}

const DEAL_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  open: { id: 'deal-open', name: 'Deal pipeline • Open', color: '#4338ca' },
  allocation_pending: { id: 'deal-allocation', name: 'Deal pipeline • Allocation pending', color: '#7c3aed' },
  closed: { id: 'deal-closed', name: 'Deal pipeline • Closed', color: '#64748b' },
  cancelled: { id: 'deal-cancelled', name: 'Deal pipeline • Cancelled', color: '#9ca3af' }
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

export default async function StaffGanttPage() {
  const staffUser = await requireStaffAuth()
  const supabase = createServiceClient()

  const [{ data: taskRows }, { data: requestRows }, { data: reportRows }, { data: dealRows }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, priority, status, due_at, created_at, owner_user_id, owner_investor_id, category')
      .in('status', ['pending', 'in_progress', 'overdue'])
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
      .from('deals')
      .select('id, name, status, open_at, close_at, created_at')
      .order('close_at', { ascending: true, nullsFirst: false })
      .limit(25)
  ])

  const features: GanttFeatureDTO[] = []
  const markers: GanttMarkerDTO[] = []

  for (const task of taskRows ?? []) {
    const palette = TASK_PALETTE[task.priority] ?? TASK_PALETTE.medium
    const startDate = new Date(task.created_at)
    const endDate = task.due_at ? new Date(task.due_at) : addDays(startDate, 2)

    features.push({
      id: `task-${task.id}`,
      name: task.title,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      group: { id: 'tasks', name: 'Operational tasks' },
      owner: task.owner_user_id ? { id: task.owner_user_id, name: task.owner_user_id === staffUser.id ? 'You' : undefined } : undefined
    })
  }

  for (const request of requestRows ?? []) {
    const palette = REQUEST_PALETTE[request.priority] ?? REQUEST_PALETTE.normal
    const startDate = new Date(request.created_at)
    const endDate = request.due_date ? new Date(request.due_date) : addDays(startDate, 3)

    features.push({
      id: `request-${request.id}`,
      name: request.subject || 'Investor request',
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      group: { id: 'requests', name: 'Investor requests' },
      owner: request.assigned_to_profile?.display_name
        ? { id: request.assigned_to_profile.display_name, name: request.assigned_to_profile.display_name }
        : undefined
    })
  }

  for (const report of reportRows ?? []) {
    const palette = REPORT_PALETTE[report.status] ?? REPORT_PALETTE.queued
    const startDate = new Date(report.created_at)
    const endDate = report.completed_at ? new Date(report.completed_at) : addDays(startDate, 2)

    features.push({
      id: `report-${report.id}`,
      name: `Report • ${toSentence(report.report_type) ?? 'Deliverable'}`,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      group: { id: 'reports', name: 'Reporting queue' }
    })
  }

  for (const deal of dealRows ?? []) {
    const palette = DEAL_PALETTE[deal.status ?? 'open'] ?? DEAL_PALETTE.open
    const startDate = deal.open_at ? new Date(deal.open_at) : new Date(deal.created_at)
    const endDate = deal.close_at ? new Date(deal.close_at) : addDays(startDate, 21)

    features.push({
      id: `deal-${deal.id}`,
      name: deal.name,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      group: { id: 'deals', name: 'Deals pipeline' }
    })

    if (!deal.close_at) continue
    const closeDate = new Date(deal.close_at)
    const daysUntilClose = Math.ceil((closeDate.getTime() - Date.now()) / 86_400_000)
    if (daysUntilClose >= 0 && daysUntilClose <= 7) {
      markers.push({
        id: `marker-${deal.id}`,
        label: `${deal.name} closes ${closeDate.toLocaleDateString()}`,
        date: closeDate.toISOString(),
        className: 'bg-amber-100 text-amber-900'
      })
    }
  }

  features.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  return (
    <AppLayout brand="versotech">
      <div className="space-y-8 px-6 py-8">
        <StaffGanttView
          title="Execution roadmap"
          description="Track deal execution, investor deliverables, and operational workload across the team."
          features={features}
          markers={markers}
        />
      </div>
    </AppLayout>
  )
}

