import { redirect } from 'next/navigation'

import { CalendarSplitView } from '@/components/calendar/calendar-split-view'
import type { CalendarEvent } from '@/components/calendar/calendar-view'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Color palettes for different event types
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

const DEAL_PALETTE: Record<string, { id: string; name: string; color: string }> = {
  open: { id: 'deal-open', name: 'Deal close • Open', color: '#7c3aed' },
  allocation_pending: { id: 'deal-allocation', name: 'Deal close • Allocation pending', color: '#a855f7' },
  due_diligence: { id: 'deal-dd', name: 'Deal close • Due diligence', color: '#9333ea' },
  closed: { id: 'deal-closed', name: 'Deal close • Closed', color: '#64748b' }
}

const CAPITAL_CALL_PALETTE = {
  pending: { id: 'call-pending', name: 'Capital call due', color: '#dc2626' },
  draft: { id: 'call-draft', name: 'Capital call • Draft', color: '#f97316' }
}

const DISTRIBUTION_PALETTE = {
  scheduled: { id: 'dist-scheduled', name: 'Distribution', color: '#16a34a' }
}

const KYC_PALETTE = {
  expiring_soon: { id: 'kyc-expiring', name: 'KYC expiring', color: '#f59e0b' },
  expired: { id: 'kyc-expired', name: 'KYC expired', color: '#dc2626' },
  accred_expiring: { id: 'accred-expiring', name: 'Accreditation expiring', color: '#ea580c' }
}

const APPROVAL_PALETTE = {
  sla_breach: { id: 'approval-breach', name: 'Approval • SLA breach', color: '#dc2626' },
  pending: { id: 'approval-pending', name: 'Approval pending', color: '#f59e0b' }
}

const FEE_PALETTE = {
  accrued: { id: 'fee-accrued', name: 'Fee event', color: '#14b8a6' }
}

const DATA_ROOM_PALETTE = {
  expiring: { id: 'data-room-expiring', name: 'Data room access expiring', color: '#8b5cf6' }
}

const SUBSCRIPTION_PALETTE = {
  funding: { id: 'sub-funding', name: 'Subscription funding due', color: '#10b981' }
}

export default async function StaffCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/versotech/login')
  }

  // Check staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
    redirect('/versotech')
  }

  const serviceSupabase = createServiceClient()
  const calendarEvents: CalendarEvent[] = []

  // 1. TASKS - All staff tasks
  const { data: taskRows } = await serviceSupabase
    .from('tasks')
    .select('id, title, status, priority, due_at, category, created_at')
    .not('status', 'eq', 'completed')
    .not('owner_user_id', 'is', null)
    .order('due_at', { ascending: true, nullsFirst: false })
    .limit(50)

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

  // 2. DEALS - Target close dates
  const { data: dealRows } = await serviceSupabase
    .from('deals')
    .select('id, name, status, close_at, created_at, vehicles ( name )')
    .in('status', ['open', 'allocation_pending', 'draft'])
    .not('close_at', 'is', null)
    .order('close_at', { ascending: true })
    .limit(30)

  for (const deal of dealRows ?? []) {
    const statusKey = deal.status ?? 'open'
    const palette = DEAL_PALETTE[statusKey] ?? DEAL_PALETTE.open
    const closeDate = new Date(deal.close_at!)
    const startDate = addDays(closeDate, -7) // Show week before close

    calendarEvents.push({
      id: `deal-${deal.id}`,
      name: `Deal Close: ${deal.name}`,
      startAt: startDate.toISOString(),
      endAt: deal.close_at!,
      status: palette,
      description: deal.vehicles?.[0]?.name ? `Vehicle • ${deal.vehicles[0].name}` : undefined
    })
  }

  // 3. CAPITAL CALLS - Due dates
  const { data: capitalCallRows } = await serviceSupabase
    .from('capital_calls')
    .select('id, name, due_date, status, vehicles ( name )')
    .in('status', ['draft', 'pending', 'active'])
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
    .limit(30)

  for (const call of capitalCallRows ?? []) {
    const palette = call.status === 'pending' ? CAPITAL_CALL_PALETTE.pending : CAPITAL_CALL_PALETTE.draft
    const dueDate = new Date(call.due_date!)
    const startDate = addDays(dueDate, -3)

    calendarEvents.push({
      id: `call-${call.id}`,
      name: call.name,
      startAt: startDate.toISOString(),
      endAt: call.due_date!,
      status: palette,
      description: call.vehicles?.[0]?.name ? `Vehicle • ${call.vehicles[0].name}` : undefined
    })
  }

  // 4. DISTRIBUTIONS - Distribution dates
  const { data: distributionRows } = await serviceSupabase
    .from('distributions')
    .select('id, name, date, vehicles ( name )')
    .gte('date', new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0]) // Last 30 days or future
    .order('date', { ascending: true })
    .limit(30)

  for (const dist of distributionRows ?? []) {
    const distDate = new Date(dist.date)

    calendarEvents.push({
      id: `dist-${dist.id}`,
      name: dist.name,
      startAt: distDate.toISOString(),
      endAt: distDate.toISOString(),
      status: DISTRIBUTION_PALETTE.scheduled,
      description: dist.vehicles?.[0]?.name ? `Vehicle • ${dist.vehicles[0].name}` : undefined
    })
  }

  // 5. KYC RENEWALS - KYC and accreditation expiry dates
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 86_400_000).toISOString().split('T')[0]

  const { data: kycRows } = await serviceSupabase
    .from('investors')
    .select('id, legal_name, kyc_expiry_date, accreditation_expiry')
    .or(`kyc_expiry_date.lte.${ninetyDaysFromNow},accreditation_expiry.lte.${ninetyDaysFromNow}`)
    .limit(50)

  for (const investor of kycRows ?? []) {
    if (investor.kyc_expiry_date) {
      const expiryDate = new Date(investor.kyc_expiry_date)
      const isExpired = expiryDate < new Date()
      const palette = isExpired ? KYC_PALETTE.expired : KYC_PALETTE.expiring_soon
      const startDate = addDays(expiryDate, -14)

      calendarEvents.push({
        id: `kyc-${investor.id}`,
        name: `KYC Renewal: ${investor.legal_name}`,
        startAt: startDate.toISOString(),
        endAt: investor.kyc_expiry_date,
        status: palette,
        description: isExpired ? 'Expired' : 'Expiring soon'
      })
    }

    if (investor.accreditation_expiry) {
      const expiryDate = new Date(investor.accreditation_expiry)
      const startDate = addDays(expiryDate, -14)

      calendarEvents.push({
        id: `accred-${investor.id}`,
        name: `Accreditation Renewal: ${investor.legal_name}`,
        startAt: startDate.toISOString(),
        endAt: investor.accreditation_expiry,
        status: KYC_PALETTE.accred_expiring,
        description: 'Accreditation expiring'
      })
    }
  }

  // 6. APPROVALS - Pending approvals with SLA tracking
  const { data: approvalRows } = await serviceSupabase
    .from('approvals')
    .select('id, entity_type, action, entity_id, created_at, sla_breach_at, requested_by:profiles!requested_by ( display_name )')
    .eq('status', 'pending')
    .order('sla_breach_at', { ascending: true, nullsFirst: false })
    .limit(30)

  for (const approval of approvalRows ?? []) {
    const breachDate = approval.sla_breach_at
      ? new Date(approval.sla_breach_at)
      : addDays(new Date(approval.created_at), 3) // Default 3-day SLA

    const isBreach = breachDate < new Date()
    const palette = isBreach ? APPROVAL_PALETTE.sla_breach : APPROVAL_PALETTE.pending
    const startDate = new Date(approval.created_at)

    const approvalType = approval.action
      ? sentenceCase(approval.action)
      : sentenceCase(approval.entity_type)

    calendarEvents.push({
      id: `approval-${approval.id}`,
      name: `Approval: ${approvalType}`,
      startAt: startDate.toISOString(),
      endAt: breachDate.toISOString(),
      status: palette,
      description: Array.isArray(approval.requested_by) && approval.requested_by[0]?.display_name
        ? `Requested by ${approval.requested_by[0].display_name}`
        : undefined
    })
  }

  // 7. SUBSCRIPTION FUNDING - Funding due dates
  const { data: subscriptionRows } = await serviceSupabase
    .from('subscriptions')
    .select('id, subscription_number, funding_due_at, investors ( legal_name ), vehicles ( name )')
    .in('status', ['committed', 'active'])
    .not('funding_due_at', 'is', null)
    .gte('funding_due_at', new Date().toISOString())
    .order('funding_due_at', { ascending: true })
    .limit(30)

  for (const sub of subscriptionRows ?? []) {
    const fundingDate = new Date(sub.funding_due_at!)
    const startDate = addDays(fundingDate, -5)

    calendarEvents.push({
      id: `sub-${sub.id}`,
      name: `Funding Due: ${(Array.isArray(sub.investors) ? sub.investors[0]?.legal_name : null) || sub.subscription_number}`,
      startAt: startDate.toISOString(),
      endAt: sub.funding_due_at!,
      status: SUBSCRIPTION_PALETTE.funding,
      description: sub.vehicles?.[0]?.name ? `Vehicle • ${sub.vehicles[0].name}` : undefined
    })
  }

  // 8. FEE EVENTS - Fee accrual/payment dates
  const { data: feeRows } = await serviceSupabase
    .from('fee_events')
    .select('id, fee_type, event_date, computed_amount, deals ( name ), investors ( legal_name, display_name )')
    .in('status', ['accrued', 'invoiced'])
    .gte('event_date', new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(30)

  for (const fee of feeRows ?? []) {
    const feeDate = new Date(fee.event_date)

    const dealName = Array.isArray(fee.deals) && fee.deals[0]?.name
      ? fee.deals[0].name
      : null

    const investorName = Array.isArray(fee.investors) && fee.investors[0]
      ? (fee.investors[0].display_name || fee.investors[0].legal_name)
      : null

    const description = dealName
      ? `Deal • ${dealName}`
      : investorName
      ? `Investor • ${investorName}`
      : undefined

    calendarEvents.push({
      id: `fee-${fee.id}`,
      name: `Fee Event: ${sentenceCase(fee.fee_type)}`,
      startAt: feeDate.toISOString(),
      endAt: feeDate.toISOString(),
      status: FEE_PALETTE.accrued,
      description
    })
  }

  // 9. REQUEST TICKETS - Custom requests with due dates
  const { data: requestRows } = await serviceSupabase
    .from('request_tickets')
    .select('id, subject, status, priority, due_date, created_at, investors ( legal_name )')
    .in('status', ['open', 'in_progress'])
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(30)

  for (const request of requestRows ?? []) {
    const palette = REQUEST_PALETTE[request.priority] ?? REQUEST_PALETTE.normal
    const endDate = request.due_date ? new Date(request.due_date) : addDays(new Date(request.created_at), 5)
    const startDate = new Date(request.created_at)

    calendarEvents.push({
      id: `request-${request.id}`,
      name: request.subject || 'Investor Request',
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: palette,
      description: Array.isArray(request.investors) && request.investors[0]?.legal_name
        ? `Investor • ${request.investors[0].legal_name}`
        : undefined
    })
  }

  // 10. DATA ROOM ACCESS - Expiring access
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 86_400_000).toISOString()

  const { data: dataRoomRows } = await serviceSupabase
    .from('deal_data_room_access')
    .select('id, expires_at, deals ( name ), investors ( legal_name, display_name )')
    .is('revoked_at', null)
    .lte('expires_at', thirtyDaysFromNow)
    .order('expires_at', { ascending: true })
    .limit(30)

  for (const access of dataRoomRows ?? []) {
    const expiryDate = new Date(access.expires_at)
    const startDate = addDays(expiryDate, -3)

    const investorName = Array.isArray(access.investors) && access.investors[0]
      ? (access.investors[0].display_name || access.investors[0].legal_name)
      : null

    calendarEvents.push({
      id: `dataroom-${access.id}`,
      name: `Data Room Expiry: ${(Array.isArray(access.deals) ? access.deals[0]?.name : null) || 'Deal'}`,
      startAt: startDate.toISOString(),
      endAt: access.expires_at,
      status: DATA_ROOM_PALETTE.expiring,
      description: investorName ? `Investor • ${investorName}` : undefined
    })
  }

  // Sort events by start date
  calendarEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Staff Calendar</h1>
        <p className="text-gray-400">
          View all important deadlines, events, and tasks across the platform
        </p>
      </div>
      <CalendarSplitView
        calendarEvents={calendarEvents}
        emptyCalendarMessage="No upcoming events or deadlines scheduled."
        brand="versotech"
      />
    </div>
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
