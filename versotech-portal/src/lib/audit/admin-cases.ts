import { PDFDocument, StandardFonts } from 'pdf-lib'
import { PRIORITY_CONFIG, REQUEST_CATEGORIES } from '@/lib/reports/constants'
import type { Json } from '@/types/supabase'

export const ADMIN_CASE_SLA_HOURS = 72
export const ADMIN_CASE_EXPORT_LIMIT = 1000
export const ADMIN_CASE_PDF_EXPORT_LIMIT = 250

const RESOLVED_REQUEST_STATUSES = new Set(['ready', 'closed', 'cancelled'])

export type AdminCaseStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'escalated'

export type AdminCaseFilters = {
  search?: string | null
  status?: string | null
  assignedTo?: string | null
  from?: string | null
  to?: string | null
  escalatedOnly?: boolean
  resolution?: string | null
  priority?: string | null
  category?: string | null
  limit?: number
}

type RelatedProfile = {
  id: string
  display_name: string | null
  email: string | null
}

type RelatedInvestor = {
  id: string
  legal_name: string | null
}

type RequestTicketRecord = {
  id: string
  subject: string | null
  details: string | null
  category: string | null
  priority: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  due_date: string | null
  assigned_at: string | null
  assigned_to: string | null
  completion_note: string | null
  closed_at: string | null
  escalated_at: string | null
  escalated_by: string | null
  escalation_reason: string | null
  created_by: string | null
  investor?: RelatedInvestor | RelatedInvestor[] | null
  created_by_profile?: RelatedProfile | RelatedProfile[] | null
  assigned_to_profile?: RelatedProfile | RelatedProfile[] | null
  escalated_by_profile?: RelatedProfile | RelatedProfile[] | null
}

type AuditEventRecord = {
  id: string
  action: string
  timestamp: string
  action_details: Json | null
  actor_id: string | null
  actor_profile?: RelatedProfile | RelatedProfile[] | null
}

export type AdminCaseItem = {
  id: string
  summary: string
  description: string | null
  category: string
  categoryLabel: string
  priority: string
  priorityLabel: string
  rawStatus: string
  adminStatus: AdminCaseStatus
  statusLabel: string
  investorName: string | null
  createdAt: string
  updatedAt: string | null
  dueDate: string | null
  assignedAt: string | null
  assigneeName: string | null
  assigneeEmail: string | null
  isOverdue: boolean
  isEscalated: boolean
  isResolved: boolean
  slaBreachAt: string
  slaIndicator: string
  escalatedAt: string | null
  escalationReason: string | null
}

export type AdminCaseTimelineEntry = {
  id: string
  action: string
  title: string
  description: string | null
  timestamp: string
  actorName: string
  actorEmail: string | null
  isSynthetic?: boolean
}

export type AdminCaseDetail = {
  caseItem: AdminCaseItem
  completionNote: string | null
  createdByName: string | null
  createdByEmail: string | null
  escalatedByName: string | null
  escalatedByEmail: string | null
  timeline: AdminCaseTimelineEntry[]
}

export type AdminCaseListResult = {
  cases: AdminCaseItem[]
  totalCount: number
  summary: {
    total: number
    open: number
    inProgress: number
    pending: number
    resolved: number
    escalated: number
    overdue: number
  }
}

function normalizeJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function toObject(value: Json | null): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function toDisplayDate(value: string | null | undefined) {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleString()
}

function formatOverdueLabel(hours: number) {
  if (hours <= 0) return 'Within SLA'
  const days = Math.floor(hours / 24)
  const remainderHours = hours % 24
  if (days > 0) {
    return `${days}d ${remainderHours}h overdue`
  }
  return `${hours}h overdue`
}

export function getAdminCaseCategoryLabel(category: string | null | undefined) {
  if (!category) return 'Other'
  return REQUEST_CATEGORIES[category as keyof typeof REQUEST_CATEGORIES]?.label ?? titleCase(category)
}

export function getAdminCasePriorityLabel(priority: string | null | undefined) {
  if (!priority) return 'Normal'
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.label ?? titleCase(priority)
}

export function getAdminCaseStatusLabel(status: AdminCaseStatus) {
  switch (status) {
    case 'open':
      return 'Open'
    case 'in_progress':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    case 'resolved':
      return 'Resolved'
    case 'escalated':
      return 'Escalated'
    default:
      return titleCase(status)
  }
}

export function getAdminCaseStatusStyles(status: AdminCaseStatus) {
  switch (status) {
    case 'open':
      return 'bg-slate-100 text-slate-800 border-slate-200'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'escalated':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

export function getAdminCaseSlaBreachAt(createdAt: string | null | undefined) {
  const created = createdAt ? new Date(createdAt) : new Date()
  return new Date(created.getTime() + ADMIN_CASE_SLA_HOURS * 60 * 60 * 1000).toISOString()
}

export function isAdminCaseResolved(status: string | null | undefined) {
  return status ? RESOLVED_REQUEST_STATUSES.has(status) : false
}

export function getAdminCaseStatus(ticket: Pick<RequestTicketRecord, 'status' | 'escalated_at'>): AdminCaseStatus {
  const rawStatus = ticket.status ?? 'open'
  if (!isAdminCaseResolved(rawStatus) && ticket.escalated_at) {
    return 'escalated'
  }
  if (rawStatus === 'awaiting_info') {
    return 'pending'
  }
  if (rawStatus === 'assigned' || rawStatus === 'in_progress') {
    return 'in_progress'
  }
  if (isAdminCaseResolved(rawStatus)) {
    return 'resolved'
  }
  return 'open'
}

export function isAdminCaseOverdue(ticket: Pick<RequestTicketRecord, 'created_at' | 'status'>) {
  if (isAdminCaseResolved(ticket.status)) return false
  const breachAt = new Date(getAdminCaseSlaBreachAt(ticket.created_at))
  return breachAt.getTime() < Date.now()
}

function getSlaIndicator(createdAt: string | null | undefined) {
  const breachAt = new Date(getAdminCaseSlaBreachAt(createdAt))
  const diffMs = Date.now() - breachAt.getTime()
  if (diffMs <= 0) {
    const remainingHours = Math.ceil(Math.abs(diffMs) / (60 * 60 * 1000))
    if (remainingHours >= 24) {
      return `${Math.floor(remainingHours / 24)}d remaining`
    }
    return `${remainingHours}h remaining`
  }
  const overdueHours = Math.ceil(diffMs / (60 * 60 * 1000))
  return formatOverdueLabel(overdueHours)
}

function matchesSearch(item: AdminCaseItem, search: string | null | undefined) {
  if (!search) return true
  const value = search.trim().toLowerCase()
  if (!value) return true

  return [
    item.id,
    item.summary,
    item.description,
    item.categoryLabel,
    item.priorityLabel,
    item.statusLabel,
    item.investorName,
    item.assigneeName,
    item.assigneeEmail,
  ]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(value))
}

function matchesDerivedFilters(item: AdminCaseItem, filters: AdminCaseFilters) {
  if (filters.status && filters.status !== 'all' && item.adminStatus !== filters.status) {
    return false
  }
  if (filters.resolution === 'resolved' && !item.isResolved) {
    return false
  }
  if (filters.resolution === 'unresolved' && item.isResolved) {
    return false
  }
  if (filters.escalatedOnly && !item.isEscalated) {
    return false
  }
  return matchesSearch(item, filters.search)
}

function mapCaseRecord(ticket: RequestTicketRecord): AdminCaseItem {
  const investor = normalizeJoin(ticket.investor)
  const assignee = normalizeJoin(ticket.assigned_to_profile)
  const createdAt = ticket.created_at ?? new Date().toISOString()
  const rawStatus = ticket.status ?? 'open'
  const adminStatus = getAdminCaseStatus(ticket)
  const summary = (ticket.subject || '').trim() || 'Untitled case'

  return {
    id: ticket.id,
    summary,
    description: ticket.details?.trim() || null,
    category: ticket.category ?? 'other',
    categoryLabel: getAdminCaseCategoryLabel(ticket.category),
    priority: ticket.priority ?? 'normal',
    priorityLabel: getAdminCasePriorityLabel(ticket.priority),
    rawStatus,
    adminStatus,
    statusLabel: getAdminCaseStatusLabel(adminStatus),
    investorName: investor?.legal_name ?? null,
    createdAt,
    updatedAt: ticket.updated_at,
    dueDate: ticket.due_date,
    assignedAt: ticket.assigned_at,
    assigneeName: assignee?.display_name ?? null,
    assigneeEmail: assignee?.email ?? null,
    isOverdue: isAdminCaseOverdue(ticket),
    isEscalated: Boolean(ticket.escalated_at) && !isAdminCaseResolved(ticket.status),
    isResolved: isAdminCaseResolved(ticket.status),
    slaBreachAt: getAdminCaseSlaBreachAt(ticket.created_at),
    slaIndicator: getSlaIndicator(ticket.created_at),
    escalatedAt: ticket.escalated_at,
    escalationReason: ticket.escalation_reason,
  }
}

function getTimelineTitle(action: string, details: Record<string, unknown> | null) {
  if (typeof details?.summary === 'string' && details.summary.trim().length > 0) {
    return details.summary.trim()
  }

  switch (action) {
    case 'request_created':
      return 'Case created'
    case 'request_assigned':
      return `Assigned to ${String(details?.assignee_name || 'staff member')}`
    case 'request_reassigned':
      return `Reassigned to ${String(details?.assignee_name || 'staff member')}`
    case 'request_status_changed':
      return `Status changed to ${titleCase(String(details?.new_status || 'updated'))}`
    case 'request_priority_changed':
      return `Priority changed to ${titleCase(String(details?.new_priority || 'updated'))}`
    case 'request_escalated':
      return 'Escalated to supervisor'
    default:
      return titleCase(action)
  }
}

function getTimelineDescription(action: string, details: Record<string, unknown> | null) {
  if (!details) return null

  if (typeof details.note === 'string' && details.note.trim().length > 0) {
    return details.note.trim()
  }

  if (typeof details.completion_note === 'string' && details.completion_note.trim().length > 0) {
    return details.completion_note.trim()
  }

  if (action === 'request_status_changed') {
    const previous = details.previous_status ? titleCase(String(details.previous_status)) : null
    const current = details.new_status ? titleCase(String(details.new_status)) : null
    if (previous && current) {
      return `${previous} -> ${current}`
    }
  }

  if (action === 'request_priority_changed') {
    const previous = details.previous_priority ? titleCase(String(details.previous_priority)) : null
    const current = details.new_priority ? titleCase(String(details.new_priority)) : null
    if (previous && current) {
      return `${previous} -> ${current}`
    }
  }

  if (typeof details.reason === 'string' && details.reason.trim().length > 0) {
    return details.reason.trim()
  }

  return null
}

function mapTimelineEvent(event: AuditEventRecord): AdminCaseTimelineEntry {
  const details = toObject(event.action_details)
  const actor = normalizeJoin(event.actor_profile)

  return {
    id: event.id,
    action: event.action,
    title: getTimelineTitle(event.action, details),
    description: getTimelineDescription(event.action, details),
    timestamp: event.timestamp,
    actorName: actor?.display_name || actor?.email || 'System',
    actorEmail: actor?.email ?? null,
  }
}

function buildSummary(items: AdminCaseItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.total += 1
      acc.overdue += item.isOverdue ? 1 : 0

      switch (item.adminStatus) {
        case 'open':
          acc.open += 1
          break
        case 'in_progress':
          acc.inProgress += 1
          break
        case 'pending':
          acc.pending += 1
          break
        case 'resolved':
          acc.resolved += 1
          break
        case 'escalated':
          acc.escalated += 1
          break
      }

      return acc
    },
    {
      total: 0,
      open: 0,
      inProgress: 0,
      pending: 0,
      resolved: 0,
      escalated: 0,
      overdue: 0,
    },
  )
}

function formatExportValue(value: string | null | undefined) {
  return value ? value.replace(/\s+/g, ' ').trim() : ''
}

function toCsvCell(value: string | number | boolean | null | undefined) {
  const stringValue = value == null ? '' : String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function wrapText(input: string, maxChars: number) {
  const words = input.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const lines: string[] = []
  let current = words[0]

  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  lines.push(current)
  return lines
}

export async function listAdminCases(supabase: any, filters: AdminCaseFilters = {}): Promise<AdminCaseListResult> {
  const limit = Math.max(1, Math.min(filters.limit ?? 200, ADMIN_CASE_EXPORT_LIMIT))
  let query = supabase
    .from('request_tickets')
    .select(`
      id,
      subject,
      details,
      category,
      priority,
      status,
      created_at,
      updated_at,
      due_date,
      assigned_at,
      assigned_to,
      completion_note,
      closed_at,
      escalated_at,
      escalated_by,
      escalation_reason,
      created_by,
      investor:investors!request_tickets_investor_id_fkey (id, legal_name),
      created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
      assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email),
      escalated_by_profile:profiles!request_tickets_escalated_by_fkey (id, display_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.assignedTo && filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'unassigned') {
      query = query.is('assigned_to', null)
    } else {
      query = query.eq('assigned_to', filters.assignedTo)
    }
  }

  if (filters.from) {
    query = query.gte('created_at', new Date(filters.from).toISOString())
  }

  if (filters.to) {
    const inclusiveEnd = new Date(filters.to)
    inclusiveEnd.setHours(23, 59, 59, 999)
    query = query.lte('created_at', inclusiveEnd.toISOString())
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message)
  }

  const allCases = ((data || []) as RequestTicketRecord[])
    .map(mapCaseRecord)
    .filter((item) => matchesDerivedFilters(item, filters))

  return {
    cases: allCases,
    totalCount: allCases.length,
    summary: buildSummary(allCases),
  }
}

export async function getAdminCaseDetail(supabase: any, requestId: string): Promise<AdminCaseDetail> {
  const { data, error } = await supabase
    .from('request_tickets')
    .select(`
      id,
      subject,
      details,
      category,
      priority,
      status,
      created_at,
      updated_at,
      due_date,
      assigned_at,
      assigned_to,
      completion_note,
      closed_at,
      escalated_at,
      escalated_by,
      escalation_reason,
      created_by,
      investor:investors!request_tickets_investor_id_fkey (id, legal_name),
      created_by_profile:profiles!request_tickets_created_by_fkey (id, display_name, email),
      assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name, email),
      escalated_by_profile:profiles!request_tickets_escalated_by_fkey (id, display_name, email)
    `)
    .eq('id', requestId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Case not found')
  }

  const ticket = data as RequestTicketRecord
  const createdBy = normalizeJoin(ticket.created_by_profile)
  const escalatedBy = normalizeJoin(ticket.escalated_by_profile)

  const { data: events, error: eventError } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      timestamp,
      action_details,
      actor_id,
      actor_profile:profiles!audit_logs_actor_id_fkey (id, display_name, email)
    `)
    .eq('entity_type', 'request_tickets')
    .eq('entity_id', requestId)
    .order('timestamp', { ascending: true })

  if (eventError) {
    throw new Error(eventError.message)
  }

  const timeline = ((events || []) as AuditEventRecord[]).map(mapTimelineEvent)
  const hasCreatedEvent = timeline.some((entry) => entry.action === 'request_created')

  if (!hasCreatedEvent && ticket.created_at) {
    timeline.unshift({
      id: `created-${ticket.id}`,
      action: 'request_created',
      title: 'Case created',
      description: ticket.subject || null,
      timestamp: ticket.created_at,
      actorName: createdBy?.display_name || createdBy?.email || 'System',
      actorEmail: createdBy?.email ?? null,
      isSynthetic: true,
    })
  }

  return {
    caseItem: mapCaseRecord(ticket),
    completionNote: ticket.completion_note,
    createdByName: createdBy?.display_name ?? null,
    createdByEmail: createdBy?.email ?? null,
    escalatedByName: escalatedBy?.display_name ?? null,
    escalatedByEmail: escalatedBy?.email ?? null,
    timeline,
  }
}

export function adminCasesToCsv(items: AdminCaseItem[]) {
  const headers = [
    'Case ID',
    'Summary',
    'Category',
    'Priority',
    'Admin Status',
    'Raw Status',
    'Investor',
    'Assigned To',
    'Assigned At',
    'Created At',
    'Updated At',
    '3-Day SLA Breach At',
    'SLA Indicator',
    'Escalated',
    'Escalated At',
    'Escalation Reason',
    'Description',
  ]

  const rows = items.map((item) =>
    [
      item.id,
      item.summary,
      item.categoryLabel,
      item.priorityLabel,
      item.statusLabel,
      item.rawStatus,
      item.investorName || '',
      item.assigneeName || '',
      item.assignedAt ? toDisplayDate(item.assignedAt) : '',
      toDisplayDate(item.createdAt),
      item.updatedAt ? toDisplayDate(item.updatedAt) : '',
      toDisplayDate(item.slaBreachAt),
      item.slaIndicator,
      item.isEscalated,
      item.escalatedAt ? toDisplayDate(item.escalatedAt) : '',
      item.escalationReason || '',
      item.description || '',
    ].map(toCsvCell),
  )

  return [headers.map(toCsvCell).join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export async function buildAdminCasesPdf(items: AdminCaseItem[], filters: AdminCaseFilters = {}) {
  const pdfDoc = await PDFDocument.create()
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Courier)
  const subtitleFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const summary = buildSummary(items)

  let page = pdfDoc.addPage([842, 595])
  let y = 555
  const left = 40
  const lineHeight = 14

  const ensureSpace = (neededLines = 1) => {
    if (y - neededLines * lineHeight < 40) {
      page = pdfDoc.addPage([842, 595])
      y = 555
    }
  }

  const addWrappedLine = (text: string, font = bodyFont, size = 10, maxChars = 105) => {
    const lines = wrapText(text, maxChars)
    for (const line of lines) {
      ensureSpace()
      page.drawText(line, { x: left, y, size, font })
      y -= lineHeight
    }
  }

  page.drawText('VERSOTECH Admin Cases Report', {
    x: left,
    y,
    size: 20,
    font: titleFont,
  })
  y -= 24
  page.drawText(`Generated ${new Date().toLocaleString()}`, {
    x: left,
    y,
    size: 10,
    font: subtitleFont,
  })
  y -= 18

  const filterSummary = [
    filters.status && filters.status !== 'all' ? `status=${filters.status}` : null,
    filters.assignedTo && filters.assignedTo !== 'all' ? `assignee=${filters.assignedTo}` : null,
    filters.priority && filters.priority !== 'all' ? `priority=${filters.priority}` : null,
    filters.category && filters.category !== 'all' ? `category=${filters.category}` : null,
    filters.escalatedOnly ? 'escalated-only' : null,
    filters.resolution && filters.resolution !== 'all' ? `resolution=${filters.resolution}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  if (filterSummary) {
    page.drawText(`Filters: ${filterSummary}`, {
      x: left,
      y,
      size: 10,
      font: subtitleFont,
    })
    y -= 18
  }

  addWrappedLine(
    `Summary: total=${summary.total}, open=${summary.open}, in_progress=${summary.inProgress}, pending=${summary.pending}, escalated=${summary.escalated}, resolved=${summary.resolved}, overdue=${summary.overdue}`,
    subtitleFont,
    11,
    100,
  )
  y -= 8

  for (const [index, item] of items.slice(0, ADMIN_CASE_PDF_EXPORT_LIMIT).entries()) {
    ensureSpace(5)
    addWrappedLine(
      `${index + 1}. ${formatExportValue(item.summary)} | ${item.categoryLabel} | ${item.priorityLabel} | ${item.statusLabel}`,
    )
    addWrappedLine(
      `Created: ${toDisplayDate(item.createdAt)} | Assigned: ${item.assigneeName || 'Unassigned'}${item.assignedAt ? ` @ ${toDisplayDate(item.assignedAt)}` : ''}`,
    )
    addWrappedLine(`SLA: ${item.slaIndicator} | Escalated: ${item.isEscalated ? 'Yes' : 'No'}`)
    if (item.description) {
      addWrappedLine(`Description: ${formatExportValue(item.description)}`, bodyFont, 10, 100)
    }
    if (item.escalationReason) {
      addWrappedLine(`Escalation Reason: ${formatExportValue(item.escalationReason)}`, bodyFont, 10, 100)
    }
    y -= 6
  }

  return Buffer.from(await pdfDoc.save())
}
