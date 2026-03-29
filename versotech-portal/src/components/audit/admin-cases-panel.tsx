"use client"

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  Clock3,
  Download,
  ExternalLink,
  FileDown,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PRIORITY_CONFIG, REQUEST_CATEGORIES } from '@/lib/reports/constants'
import { formatViewerDate, formatViewerDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AdminCaseDetail, AdminCaseItem, AdminCaseListResult, AdminCaseStatus } from '@/lib/audit/admin-cases'

type CaseFilters = {
  search: string
  status: 'all' | AdminCaseStatus
  agent: string
  from: string
  to: string
  escalatedOnly: boolean
  resolution: 'all' | 'resolved' | 'unresolved'
  priority: string
  category: string
}

type StaffProfile = {
  id: string
  display_name: string | null
  email: string | null
}

const defaultFilters: CaseFilters = {
  search: '',
  status: 'all',
  agent: 'all',
  from: '',
  to: '',
  escalatedOnly: false,
  resolution: 'all',
  priority: 'all',
  category: 'all',
}

const statusOptions: Array<{ value: CaseFilters['status']; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
]

const resolutionOptions: Array<{ value: CaseFilters['resolution']; label: string }> = [
  { value: 'all', label: 'All cases' },
  { value: 'resolved', label: 'Resolved only' },
  { value: 'unresolved', label: 'Unresolved only' },
]

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  ...Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
]

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  ...Object.entries(REQUEST_CATEGORIES).map(([value, config]) => ({
    value,
    label: config.label,
  })),
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'user_complaint', label: 'User Complaint' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'system_error', label: 'System Error' },
]

function buildQuery(filters: CaseFilters) {
  const params = new URLSearchParams()
  if (filters.search.trim()) params.set('q', filters.search.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.agent !== 'all') params.set('agent', filters.agent)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.escalatedOnly) params.set('escalated', 'true')
  if (filters.resolution !== 'all') params.set('resolution', filters.resolution)
  if (filters.priority !== 'all') params.set('priority', filters.priority)
  if (filters.category !== 'all') params.set('category', filters.category)
  return params
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return formatViewerDateTime(date)
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return formatViewerDate(date)
}

function getStatusClasses(status: AdminCaseStatus) {
  switch (status) {
    case 'open':
      return 'border-slate-200 bg-slate-50 text-slate-700'
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'pending':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'resolved':
      return 'border-green-200 bg-green-50 text-green-700'
    case 'escalated':
      return 'border-red-200 bg-red-50 text-red-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50 text-red-700'
    case 'high':
      return 'border-orange-200 bg-orange-50 text-orange-700'
    case 'normal':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

export function AdminCasesPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<CaseFilters>(defaultFilters)
  const [caseList, setCaseList] = useState<AdminCaseListResult | null>(null)
  const [staffOptions, setStaffOptions] = useState<StaffProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStaffLoading, setIsStaffLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(searchParams?.get('caseId') || null)
  const [selectedCase, setSelectedCase] = useState<AdminCaseDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null)

  const activeFiltersCount = useMemo(
    () =>
      Number(Boolean(filters.search.trim())) +
      Number(filters.status !== 'all') +
      Number(filters.agent !== 'all') +
      Number(Boolean(filters.from)) +
      Number(Boolean(filters.to)) +
      Number(filters.escalatedOnly) +
      Number(filters.resolution !== 'all') +
      Number(filters.priority !== 'all') +
      Number(filters.category !== 'all'),
    [filters],
  )

  const loadCases = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/audit/cases?${buildQuery(filters).toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load admin cases')
      }

      const data = (await response.json()) as AdminCaseListResult
      setCaseList(data)
    } catch (fetchError) {
      console.error('[AdminCasesPanel] Failed to load cases', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load admin cases')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const updateCaseUrl = useCallback((caseId: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', 'cases')

    if (caseId) {
      params.set('caseId', caseId)
    } else {
      params.delete('caseId')
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  const openCaseDetail = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    updateCaseUrl(caseId)
  }, [updateCaseUrl])

  const closeCaseDetail = useCallback(() => {
    setSelectedCaseId(null)
    setSelectedCase(null)
    updateCaseUrl(null)
  }, [updateCaseUrl])

  const loadAgents = useCallback(async () => {
    setIsStaffLoading(true)

    try {
      const response = await fetch('/api/profiles?role=staff_admin%2Cstaff_ops%2Cstaff_rm%2Cceo', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load agents')
      }

      const data = (await response.json()) as { profiles?: StaffProfile[] }
      setStaffOptions(data.profiles || [])
    } catch (fetchError) {
      console.error('[AdminCasesPanel] Failed to load agents', fetchError)
    } finally {
      setIsStaffLoading(false)
    }
  }, [])

  const loadCaseDetail = useCallback(async (caseId: string) => {
    setIsDetailLoading(true)

    try {
      const response = await fetch(`/api/audit/cases/${caseId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load case detail')
      }

      const data = (await response.json()) as AdminCaseDetail
      setSelectedCase(data)
    } catch (fetchError) {
      console.error('[AdminCasesPanel] Failed to load case detail', fetchError)
      toast.error(fetchError instanceof Error ? fetchError.message : 'Failed to load case detail')
      setSelectedCaseId(null)
      setSelectedCase(null)
      updateCaseUrl(null)
    } finally {
      setIsDetailLoading(false)
    }
  }, [updateCaseUrl])

  useEffect(() => {
    void loadCases()
  }, [loadCases])

  useEffect(() => {
    void loadAgents()
  }, [loadAgents])

  useEffect(() => {
    const caseId = searchParams?.get('caseId') || null
    setSelectedCaseId(caseId)

    if (!caseId) {
      setSelectedCase(null)
    }
  }, [searchParams])

  useEffect(() => {
    if (!selectedCaseId) {
      return
    }

    void loadCaseDetail(selectedCaseId)
  }, [selectedCaseId, loadCaseDetail])

  const exportCases = useCallback(async (format: 'csv' | 'pdf') => {
    setIsExporting(format)

    try {
      const params = buildQuery(filters)
      params.set('dataset', 'cases')
      params.set('format', format)

      const response = await fetch(`/api/audit/export?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const extension = format === 'pdf' ? 'pdf' : 'csv'

      anchor.href = url
      anchor.download = `admin-cases-${new Date().toISOString().slice(0, 10)}.${extension}`
      document.body.appendChild(anchor)
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)
    } catch (exportError) {
      console.error('[AdminCasesPanel] Export failed', exportError)
      toast.error(exportError instanceof Error ? exportError.message : 'Failed to export cases')
    } finally {
      setIsExporting(null)
    }
  }, [filters])

  const cases = caseList?.cases || []
  const summary = caseList?.summary || {
    total: 0,
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
    overdue: 0,
  }

  const reassignmentHistory =
    selectedCase?.timeline.filter(
      (entry) => entry.action === 'request_assigned' || entry.action === 'request_reassigned',
    ) || []

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Admin Cases</CardTitle>
              <CardDescription>
                Track reported issues, ownership history, SLA breaches, and escalations from one queue.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => void loadCases()} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => void exportCases('csv')}
                disabled={isExporting !== null}
              >
                {isExporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                CSV
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => void exportCases('pdf')}
                disabled={isExporting !== null}
              >
                {isExporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                PDF
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard title="Total Cases" value={summary.total} description="Visible after filters" />
          <SummaryCard title="Open" value={summary.open} description="Awaiting triage" />
          <SummaryCard title="In Progress" value={summary.inProgress} description="Assigned or being handled" />
          <SummaryCard title="Escalated" value={summary.escalated} description="Supervisor attention needed" highlight="danger" />
          <SummaryCard title="Overdue" value={summary.overdue} description="Older than 72 hours unresolved" highlight="warning" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search & Filters</CardTitle>
            <CardDescription>
              {activeFiltersCount > 0 ? `${activeFiltersCount} active filters` : 'Filter by ownership, status, SLA, and delivery window.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search by case ID, summary, category, investor, or assignee"
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((current) => ({ ...current, status: value as CaseFilters['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.agent}
                onValueChange={(value) => setFilters((current) => ({ ...current, agent: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isStaffLoading ? 'Loading agents...' : 'Agent'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffOptions.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.display_name || agent.email || agent.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.resolution}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, resolution: value as CaseFilters['resolution'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-cases-from">From</Label>
                  <Input
                    id="admin-cases-from"
                    type="date"
                    value={filters.from}
                    onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-cases-to">To</Label>
                  <Input
                    id="admin-cases-to"
                    type="date"
                    value={filters.to}
                    onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={filters.escalatedOnly}
                    onCheckedChange={(checked) =>
                      setFilters((current) => ({ ...current, escalatedOnly: checked === true }))
                    }
                  />
                  Escalated only
                </label>

                <Button variant="outline" onClick={() => setFilters(defaultFilters)} disabled={activeFiltersCount === 0}>
                  Reset filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary.overdue > 0 && (
          <Card className="border-red-200 bg-red-50/70">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="space-y-1">
                <p className="font-medium text-red-900">SLA breaches need escalation review</p>
                <p className="text-sm text-red-700">
                  {summary.overdue} unresolved {summary.overdue === 1 ? 'case is' : 'cases are'} older than 3 days and should remain visibly flagged.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Case Log</CardTitle>
            <CardDescription>
              Reported issues with ownership, current state, SLA signal, and escalation visibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : isLoading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading admin cases...
              </div>
            ) : cases.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Search className="h-8 w-8" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">No cases match the current filters</p>
                  <p className="text-sm">Reset the filters or widen the date range to see more activity.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reported</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Issue Summary</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned / Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Escalated</TableHead>
                    <TableHead>Last Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      className={cn(
                        'cursor-pointer',
                        caseItem.isOverdue && !caseItem.isResolved && 'bg-red-50/80 hover:bg-red-100/70',
                      )}
                      onClick={() => openCaseDetail(caseItem.id)}
                    >
                      <TableCell className="align-top">
                        <div className="font-medium text-foreground">{formatDateOnly(caseItem.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(caseItem.createdAt)}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                          {caseItem.categoryLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{caseItem.summary}</div>
                          <div className="text-xs text-muted-foreground">
                            {caseItem.investorName || 'No investor linked'} • {caseItem.id.slice(0, 8)}
                          </div>
                          {caseItem.description && (
                            <p className="line-clamp-2 max-w-xl text-xs text-muted-foreground">{caseItem.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant="outline" className={cn('capitalize', getPriorityClasses(caseItem.priority))}>
                          {caseItem.priorityLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{caseItem.assigneeName || 'Unassigned'}</div>
                          <div className="text-xs text-muted-foreground">
                            {caseItem.assignedAt ? formatDateTime(caseItem.assignedAt) : 'No assignment yet'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant="outline" className={cn('capitalize', getStatusClasses(caseItem.adminStatus))}>
                          {caseItem.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className={cn('text-sm font-medium', caseItem.isOverdue && !caseItem.isResolved && 'text-red-700')}>
                          {caseItem.slaIndicator}
                        </div>
                        <div className="text-xs text-muted-foreground">Breach at {formatDateTime(caseItem.slaBreachAt)}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        {caseItem.isEscalated ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                              Escalated
                            </Badge>
                            <div className="text-xs text-muted-foreground">{formatDateTime(caseItem.escalatedAt)}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm text-foreground">{formatDateTime(caseItem.updatedAt || caseItem.createdAt)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={Boolean(selectedCaseId)} onOpenChange={(open) => !open && closeCaseDetail()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{selectedCase?.caseItem.id || selectedCaseId}</Badge>
              {selectedCase && (
                <>
                  <Badge variant="outline" className={getStatusClasses(selectedCase.caseItem.adminStatus)}>
                    {selectedCase.caseItem.statusLabel}
                  </Badge>
                  <Badge variant="outline" className={getPriorityClasses(selectedCase.caseItem.priority)}>
                    {selectedCase.caseItem.priorityLabel}
                  </Badge>
                </>
              )}
            </div>
            <SheetTitle>{selectedCase?.caseItem.summary || 'Loading case...'}</SheetTitle>
            <SheetDescription>
              Ownership, action history, and SLA visibility for the selected admin case.
            </SheetDescription>
          </SheetHeader>

          {isDetailLoading || !selectedCase ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading case detail...
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-170px)] pr-4">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="gap-2">
                    <Link href={`/versotech_main/requests?requestId=${selectedCase.caseItem.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      Open in Requests
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={closeCaseDetail}>
                    Close
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Issue / Content Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                        {selectedCase.caseItem.categoryLabel}
                      </Badge>
                      {selectedCase.caseItem.isOverdue && !selectedCase.caseItem.isResolved && (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          72h SLA breach
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{selectedCase.caseItem.summary}</p>
                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                      {selectedCase.caseItem.description || 'No additional description provided.'}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoCard icon={User} title="Assigned / Handling Agent">
                    <p className="text-sm font-medium text-foreground">
                      {selectedCase.caseItem.assigneeName || 'Unassigned'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCase.caseItem.assignedAt
                        ? `Assigned ${formatDateTime(selectedCase.caseItem.assignedAt)}`
                        : 'No assignment timestamp yet'}
                    </p>
                    {selectedCase.caseItem.assigneeEmail && (
                      <p className="text-xs text-muted-foreground">{selectedCase.caseItem.assigneeEmail}</p>
                    )}
                  </InfoCard>

                  <InfoCard icon={Clock3} title="Current Status">
                    <Badge variant="outline" className={getStatusClasses(selectedCase.caseItem.adminStatus)}>
                      {selectedCase.caseItem.statusLabel}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Raw workflow status: {selectedCase.caseItem.rawStatus}</p>
                    <p className="text-xs text-muted-foreground">
                      Last action {formatDateTime(selectedCase.caseItem.updatedAt || selectedCase.caseItem.createdAt)}
                    </p>
                  </InfoCard>

                  <InfoCard icon={Calendar} title="SLA Monitoring / Escalation">
                    <p className={cn('text-sm font-medium', selectedCase.caseItem.isOverdue && !selectedCase.caseItem.isResolved && 'text-red-700')}>
                      {selectedCase.caseItem.slaIndicator}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Breach threshold: {formatDateTime(selectedCase.caseItem.slaBreachAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCase.caseItem.isEscalated
                        ? `Escalated ${formatDateTime(selectedCase.caseItem.escalatedAt)}`
                        : 'No escalation recorded'}
                    </p>
                    {selectedCase.caseItem.escalationReason && (
                      <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {selectedCase.caseItem.escalationReason}
                      </p>
                    )}
                  </InfoCard>

                  <InfoCard icon={Calendar} title="Case Context">
                    <p className="text-sm font-medium text-foreground">{selectedCase.caseItem.investorName || 'No investor linked'}</p>
                    <p className="text-xs text-muted-foreground">Created {formatDateTime(selectedCase.caseItem.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted by {selectedCase.createdByName || selectedCase.createdByEmail || 'Unknown user'}
                    </p>
                    {selectedCase.completionNote && (
                      <p className="rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-700">
                        Completion note: {selectedCase.completionNote}
                      </p>
                    )}
                  </InfoCard>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Reassignment History</h3>
                    <p className="text-sm text-muted-foreground">Chronological ownership changes pulled from the audit log.</p>
                  </div>

                  {reassignmentHistory.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No assignment or reassignment events recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reassignmentHistory.map((entry) => (
                        <div key={entry.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{entry.title}</p>
                              <p className="text-xs text-muted-foreground">{entry.description || 'No additional note'}</p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>{formatDateTime(entry.timestamp)}</p>
                              <p>{entry.actorName}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Chronological Log</h3>
                    <p className="text-sm text-muted-foreground">Full action trail for triage, updates, handoffs, and escalation.</p>
                  </div>

                  <div className="space-y-3">
                    {selectedCase.timeline.map((entry) => (
                      <div key={entry.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{entry.title}</p>
                            <p className="text-sm text-muted-foreground">{entry.description || 'No additional context recorded.'}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.actorName}
                              {entry.actorEmail ? ` • ${entry.actorEmail}` : ''}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function SummaryCard({
  title,
  value,
  description,
  highlight,
}: {
  title: string
  value: number
  description: string
  highlight?: 'warning' | 'danger'
}) {
  return (
    <Card
      className={cn(
        highlight === 'danger' && 'border-red-200 bg-red-50/70',
        highlight === 'warning' && 'border-amber-200 bg-amber-50/70',
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  )
}
