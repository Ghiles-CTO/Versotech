"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  Clock,
  Filter,
  Loader2,
  MessageCircle,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  User,
  Workflow,
  XCircle,
  UserPlus,
} from 'lucide-react'
import { RequestPrioritySelector } from './request-priority-selector'
import { RequestStatusSelector } from './request-status-selector'
import { RequestAssignmentDialog } from './request-assignment-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  REQUEST_STATUS_CONFIG,
  REQUEST_CATEGORIES,
  PRIORITY_CONFIG,
  formatTimeRemaining,
  isOverdue,
} from '@/lib/reports/constants'
import type { RequestTicketWithRelations, RequestStatus } from '@/types/reports'
import { cn } from '@/lib/utils'

type RequestFilters = {
  search: string
  status: string | 'all'
  category: string | 'all'
  priority: string | 'all'
  assignedTo: 'all' | 'me'
  overdueOnly: boolean
  groupByCategory?: boolean
}

type RequestStats = {
  total_requests: number
  open_count: number
  in_progress_count: number
  ready_count: number
  overdue_count: number
  avg_fulfillment_time_hours: number | null
  sla_compliance_rate: number | null
}

type RequestsResponse = {
  requests: RequestTicketWithRelations[]
  stats: RequestStats | null
  hasData: boolean
}

const defaultFilters: RequestFilters = {
  search: '',
  status: 'all',
  category: 'all',
  priority: 'all',
  assignedTo: 'all',
  overdueOnly: false,
  groupByCategory: true,
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'tax_doc', label: 'Tax Documents' },
  { value: 'analysis', label: 'Performance Analysis' },
  { value: 'data_export', label: 'Data Exports' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'communication', label: 'Communications' },
  { value: 'cashflow', label: 'Cashflow' },
  { value: 'valuation', label: 'Valuation' },
  { value: 'other', label: 'Other' },
]

const prioritySortOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

const realtimeChannelName = 'staff_request_tickets_updates'

export function RequestManagementPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [filters, setFilters] = useState<RequestFilters>(() => {
    if (!searchParams) return defaultFilters
    return {
      search: searchParams.get('q') || '',
      status: (searchParams.get('status') as RequestFilters['status']) || 'all',
      category: (searchParams.get('category') as RequestFilters['category']) || 'all',
      priority: (searchParams.get('priority') as RequestFilters['priority']) || 'all',
      assignedTo: (searchParams.get('assigned_to') as RequestFilters['assignedTo']) || 'all',
      overdueOnly: searchParams.get('overdue') === 'true',
      groupByCategory: searchParams.get('group_by_category') === 'true',
    }
  })
  const [requests, setRequests] = useState<RequestTicketWithRelations[]>([])
  const [stats, setStats] = useState<RequestStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestTicketWithRelations | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    void loadRequests()
    void loadCurrentUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function loadCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel(realtimeChannelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_tickets' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          void loadRequests(false)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for manual refresh triggers after actions
  useEffect(() => {
    const handler = () => {
      void loadRequests(false)
    }
    window.addEventListener('staffRequests:refresh', handler)
    return () => window.removeEventListener('staffRequests:refresh', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!searchParams) return
    const params = new URLSearchParams()
    if (filters.search) params.set('q', filters.search)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.priority !== 'all') params.set('priority', filters.priority)
    if (filters.assignedTo !== 'all') params.set('assigned_to', filters.assignedTo)
    if (filters.overdueOnly) params.set('overdue', 'true')
    if (filters.groupByCategory) params.set('group_by_category', 'true')

    const query = params.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function loadRequests(showLoader = true) {
    if (showLoader) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('q', filters.search)
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.priority !== 'all') params.set('priority', filters.priority)
      if (filters.assignedTo !== 'all') params.set('assigned_to', filters.assignedTo)
      if (filters.overdueOnly) params.set('overdue_only', 'true')
      if (filters.groupByCategory) params.set('group_by_category', 'true')

      const response = await fetch(`/api/staff/requests${params.size ? `?${params.toString()}` : ''}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        let message = 'Failed to load requests'
        try {
          const details = await response.json()
          const parts: string[] = []
          if (typeof details?.error === 'string' && details.error.trim().length > 0) {
            parts.push(details.error.trim())
          }
          if (typeof details?.details === 'string' && details.details.trim().length > 0) {
            parts.push(details.details.trim())
          }
          if (typeof details?.hint === 'string' && details.hint.trim().length > 0) {
            parts.push(`Hint: ${details.hint.trim()}`)
          }
          if (typeof details?.code === 'string' && details.code.trim().length > 0) {
            parts.push(`Code: ${details.code.trim()}`)
          }
          if (parts.length > 0) {
            message = parts.join(' — ')
          }
        } catch {
          // Ignore JSON parsing failures
        }

        if (response.status === 401) {
          const authMessage =
            'Staff authentication required. Sign in with a staff account or set the demo_auth_user cookie for a staff role.'
          if (authError !== authMessage) {
            toast.info(authMessage)
          }
          setAuthError(authMessage)
          setError(null)
          setRequests([])
          setStats(null)
          setIsLoading(false)
          return
        }

        console.error('[StaffRequests] API returned error:', message, response.status, { filters, authError })
        throw new Error(`${message} (status ${response.status})`)
      }

      const data = (await response.json()) as RequestsResponse
      setRequests(data.requests || [])
      setStats(data.stats || null)
      setAuthError(null)

      if (!data.hasData) {
        toast.info('Connect Supabase data or run migrations to populate real requests.')
      }
    } catch (err) {
      console.error('[StaffRequests] Failed to load requests', err)
      const message = err instanceof Error ? err.message : 'Unexpected error occurred'
      if (message.toLowerCase().includes('staff authentication required')) {
        if (authError !== message) {
          toast.info(message)
        }
        setAuthError(message)
        setError(null)
      } else {
        setError(message)
        if (!message.toLowerCase().includes('failed to fetch requests')) {
          toast.error(message)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const priorityA = prioritySortOrder[(a as any).priority as keyof typeof prioritySortOrder] ?? 99
      const priorityB = prioritySortOrder[(b as any).priority as keyof typeof prioritySortOrder] ?? 99
      if (priorityA !== priorityB) return priorityA - priorityB

      const tsA = a.created_at ? new Date(a.created_at).getTime() : 0
      const tsB = b.created_at ? new Date(b.created_at).getTime() : 0
      return tsB - tsA
    })
  }, [requests])

  const overdueCount = stats?.overdue_count ?? 0

  const handleFilterChange = (next: Partial<RequestFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const openRequest = (request: RequestTicketWithRelations) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6 text-foreground">
      {authError && (
        <Card className="border border-amber-400/40 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="text-amber-100">Staff Authentication Required</CardTitle>
            <CardDescription className="text-amber-100/80">
              {authError}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-amber-50/90 space-y-2">
            <p>
              Sign in with a staff account: <strong>admin@versotech.com</strong> / <strong>admin123</strong>
            </p>
            <p className="text-xs">
              Or set the <code>demo_auth_user</code> cookie (must use valid UUID for assigned_to filters):
            </p>
            <pre className="rounded bg-amber-900/40 border border-amber-400/30 p-2 text-xs text-amber-50 overflow-x-auto">
              {`{"id":"2a833fc7-b307-4485-a4c1-4e5c5a010e74","email":"admin@versotech.com","role":"staff_admin","displayName":"Admin Demo"}`}
            </pre>
          </CardContent>
        </Card>
      )}

      <PageHeader onRefresh={() => loadRequests()} isRefreshing={isLoading} />

      <StatsOverview
        stats={stats}
        totalRequests={filteredRequests.length}
        overdueCount={overdueCount}
      />

      {!authError && (
        <FiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          isLoading={isLoading}
        />
      )}

      <RequestQueue
        requests={filteredRequests}
        isLoading={isLoading}
        error={authError ? null : error}
        onRefresh={() => loadRequests()}
        onSelectRequest={openRequest}
        disabled={Boolean(authError)}
        authError={authError}
        groupByCategory={!!filters.groupByCategory}
        currentUserId={currentUserId}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {selectedRequest ? (
              <RequestDetails 
                request={selectedRequest} 
                onUpdate={() => loadRequests()}
                currentUserId={currentUserId}
              />
            ) : (
              <div className="text-muted-foreground">Select a request to view details</div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PageHeader({ onRefresh, isRefreshing }: { onRefresh: () => void; isRefreshing: boolean }) {
  const router = useRouter()
  
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Request Management</h1>
        <p className="text-muted-foreground mt-1">
          Centralized triage for investor tax, performance, and servicing requests.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} className="gap-2" disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Refresh
        </Button>
        <Button 
          className="gap-2"
          onClick={() => router.push('/versotech/staff/requests/analytics')}
        >
          <TrendingUp className="h-4 w-4" />
          Analytics
        </Button>
      </div>
    </div>
  )
}

function StatsOverview({
  stats,
  totalRequests,
  overdueCount,
}: {
  stats: RequestStats | null
  totalRequests: number
  overdueCount: number
}) {
  const cards = [
    {
      title: 'Total Requests',
      value: stats?.total_requests ?? totalRequests,
      description: 'Active in queue',
    },
    {
      title: 'Open',
      value: stats?.open_count ?? 0,
      description: 'Awaiting assignment',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress_count ?? 0,
      description: 'Assigned & being worked',
    },
    {
      title: 'Ready',
      value: stats?.ready_count ?? 0,
      description: 'Awaiting delivery',
    },
    {
      title: 'Overdue',
      value: overdueCount,
      description: 'Past SLA deadline',
      highlight: overdueCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={cn(
            'border border-white/10 bg-white/5 transition-shadow',
            card.highlight ? 'shadow-lg shadow-red-500/20' : 'hover:shadow-lg',
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FiltersBar({
  filters,
  onChange,
  onReset,
  isLoading,
}: {
  filters: RequestFilters
  onChange: (next: Partial<RequestFilters>) => void
  onReset: () => void
  isLoading: boolean
}) {
  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.priority !== 'all' || 
    filters.assignedTo !== 'all' || 
    filters.overdueOnly ||
    filters.search.length > 0

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by request ID, investor, title, or assignee"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={onReset}
              disabled={isLoading || !hasActiveFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant={filters.groupByCategory ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => onChange({ groupByCategory: !filters.groupByCategory })}
            >
              <ClipboardList className="h-4 w-4" />
              {filters.groupByCategory ? 'Grouped' : 'Group'}
            </Button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.assignedTo === 'me' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => onChange({ assignedTo: filters.assignedTo === 'me' ? 'all' : 'me' })}
          >
            <User className="h-3 w-3" /> My Tasks
          </Button>
          <Button
            variant={filters.status === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ status: filters.status === 'open' ? 'all' : 'open' })}
          >
            Unassigned
          </Button>
          <Button
            variant={filters.overdueOnly ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => onChange({ overdueOnly: !filters.overdueOnly })}
          >
            <AlertTriangle className="h-3 w-3" /> Overdue
          </Button>
          <Button
            variant={filters.priority === 'urgent' || filters.priority === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (filters.priority === 'urgent' || filters.priority === 'high') {
                onChange({ priority: 'all' })
              } else {
                onChange({ priority: 'urgent' })
              }
            }}
          >
            High Priority
          </Button>
          <Button
            variant={filters.status === 'in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ status: filters.status === 'in_progress' ? 'all' : 'in_progress' })}
          >
            In Progress
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Select
            value={filters.status}
            onValueChange={(value) => onChange({ status: value as RequestFilters['status'] })}
          >
            <SelectTrigger className="gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => onChange({ priority: value as RequestFilters['priority'] })}
          >
            <SelectTrigger className="gap-2">
              <ArrowDownWideNarrow className="h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => onChange({ category: value as RequestFilters['category'] })}
          >
            <SelectTrigger className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.assignedTo}
            onValueChange={(value) => onChange({ assignedTo: value as RequestFilters['assignedTo'] })}
          >
            <SelectTrigger className="gap-2">
              <User className="h-4 w-4" />
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Assignee</SelectLabel>
                <SelectItem value="all">All staff</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.overdueOnly ? 'overdue' : 'any'}
            onValueChange={(value) => onChange({ overdueOnly: value === 'overdue' })}
          >
            <SelectTrigger className="gap-2">
              <Clock className="h-4 w-4" />
              <SelectValue placeholder="SLA" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>SLA</SelectLabel>
                <SelectItem value="any">All requests</SelectItem>
                <SelectItem value="overdue">SLA breaches only</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestQueue({
  requests,
  isLoading,
  error,
  onRefresh,
  onSelectRequest,
  disabled = false,
  authError,
  groupByCategory = false,
  currentUserId,
}: {
  requests: RequestTicketWithRelations[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  onSelectRequest: (request: RequestTicketWithRelations) => void
  disabled?: boolean
  authError?: string | null
  groupByCategory?: boolean
  currentUserId?: string | null
}) {
  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading request queue…</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-red-400/30 bg-red-500/10">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-red-200">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
          <Button variant="outline" onClick={onRefresh} className="gap-2 border-white/20">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (authError) {
    return (
      <Card className="border border-dashed border-amber-400/40 bg-amber-500/10">
        <CardContent className="p-10 text-center space-y-3 text-amber-100">
          <ClipboardList className="h-12 w-12 text-amber-300/80 mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">Authentication Required</p>
            <p className="text-sm text-amber-100/80">{authError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests.length) {
    return (
      <Card className="border border-dashed border-white/20 bg-white/5">
        <CardContent className="p-12 text-center space-y-3">
          <ClipboardList className="h-12 w-12 text-muted-foreground/80 mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">No active requests</p>
            <p className="text-sm text-muted-foreground">
              When investors submit requests from the Reports page or inbox automations, they will appear here for triage.
            </p>
          </div>
          <Button variant="outline" onClick={onRefresh} className="gap-2 border-white/20">
            <RotateCcw className="h-4 w-4" />
            Check again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (groupByCategory) {
    const byCategory = new Map<string, RequestTicketWithRelations[]>()
    for (const req of requests) {
      const key = (req as any).category || 'other'
      const arr = byCategory.get(key) || []
      arr.push(req)
      byCategory.set(key, arr)
    }
    return (
      <div className={cn('space-y-6', disabled && 'opacity-50 pointer-events-none select-none')}>
        {Array.from(byCategory.entries()).map(([cat, items]) => (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/20">
                {REQUEST_CATEGORIES[cat as keyof typeof REQUEST_CATEGORIES]?.label || cat}
              </Badge>
              <span className="text-xs text-muted-foreground">{items.length} items</span>
            </div>
            <div className="space-y-3">
              {items.map((req) => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  onSelect={() => onSelectRequest(req)}
                  onUpdate={onRefresh}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none select-none')}>
      {requests.map((request) => (
        <RequestCard 
          key={request.id} 
          request={request} 
          onSelect={() => onSelectRequest(request)}
          onUpdate={onRefresh}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}

function RequestCard({ 
  request, 
  onSelect, 
  onUpdate,
  currentUserId 
}: { 
  request: RequestTicketWithRelations
  onSelect: () => void
  onUpdate?: () => void
  currentUserId?: string | null
}) {
  const statusConfig = REQUEST_STATUS_CONFIG[request.status as keyof typeof REQUEST_STATUS_CONFIG]
  const overdue = !!(request.due_date && isOverdue(request.due_date))

  return (
    <Card
      className={cn(
        'border border-white/10 bg-white/5 hover:border-white/30 transition-colors',
        overdue && 'border-red-400/50 bg-red-500/5',
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline" className="border-white/20 text-xs uppercase tracking-wide">
                {request.id.split('-')[0]}
              </Badge>
              <div className="flex items-center gap-2">
                <RequestStatusSelector
                  requestId={request.id}
                  currentStatus={request.status as any}
                  onUpdate={onUpdate}
                />
                <RequestPrioritySelector
                  requestId={request.id}
                  currentPriority={request.priority as any}
                  onUpdate={onUpdate}
                  variant="inline"
                />
                <Badge variant="outline" className="border-white/20">
                  {REQUEST_CATEGORIES[request.category]?.label || request.category}
                </Badge>
                {overdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">{request.subject}</h3>
              {request.details && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{request.details}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
              <MetadataItem label="Investor" value={request.investor?.legal_name || 'N/A'} />
              <MetadataItem
                label="Created"
                value={new Date(request.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
              <MetadataItem
                label="Due"
                value={
                  request.due_date
                    ? new Date(request.due_date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not set'
                }
                emphasis={overdue}
              />
              <MetadataItem
                label="Assigned"
                value={request.assigned_to_profile?.display_name || 'Unassigned'}
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {request.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatTimeRemaining(request.due_date)}
                </div>
              )}
              {request.linked_workflow_run && (
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" /> Workflow {shortenId(request.linked_workflow_run)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:min-w-[160px]">
            <Button variant="outline" size="sm" className="gap-2" onClick={onSelect}>
              <EyeIcon />
              View Details
            </Button>
            
            <RequestAssignmentDialog
              requestId={request.id}
              currentAssignee={request.assigned_to_profile}
              currentUserId={currentUserId || undefined}
              onUpdate={onUpdate}
              trigger={
                <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
                  <UserPlus className="h-4 w-4" />
                  {request.assigned_to ? 'Reassign' : 'Assign'}
                </Button>
              }
            />
            
            <Button variant="ghost" size="sm" className="gap-2" onClick={onSelect}>
              <MessageCircle className="h-4 w-4" />
              Conversation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestDetails({ request, onUpdate, currentUserId }: { 
  request: RequestTicketWithRelations
  onUpdate?: () => void
  currentUserId?: string | null
}) {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const overdue = !!(request.due_date && request.status !== 'closed' && request.status !== 'ready' && isOverdue(request.due_date))
  const statusConfig = REQUEST_STATUS_CONFIG[request.status as keyof typeof REQUEST_STATUS_CONFIG]

  const handleCreateConversation = async () => {
    setIsCreatingConversation(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: `Request ${request.id}: ${request.subject}`,
          participant_ids: [request.created_by],
          type: 'dm',
          initial_message: `Context: request ${request.id} (${request.category || 'general'}) - ${request.subject}`,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        const convId = result?.conversation?.id
        if (convId) {
          toast.success('Conversation created')
          window.location.href = `/versotech/staff/messages/${convId}`
        }
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error('Failed to create conversation')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/20 text-xs">
            {request.id}
          </Badge>
          <RequestStatusSelector
            requestId={request.id}
            currentStatus={request.status as any}
            onUpdate={onUpdate}
          />
          <RequestPrioritySelector
            requestId={request.id}
            currentPriority={request.priority as any}
            onUpdate={onUpdate}
            variant="inline"
          />
          <Badge variant="outline" className="border-white/20">
            {REQUEST_CATEGORIES[request.category]?.label || request.category}
          </Badge>
          {overdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> SLA breach
            </Badge>
          )}
        </div>
        <h2 className="text-2xl font-semibold">{request.subject}</h2>
        {request.details && <p className="text-sm text-muted-foreground whitespace-pre-line">{request.details}</p>}
      </div>

      <Separator className="border-white/10" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailsCard title="Investor">
          <p className="text-sm font-medium">{request.investor?.legal_name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">Created by: {request.created_by_profile?.display_name}</p>
        </DetailsCard>
        <DetailsCard title="Assignment">
          <p className="text-sm font-medium">{request.assigned_to_profile?.display_name || 'Unassigned'}</p>
          <p className="text-xs text-muted-foreground">
            {request.assigned_to ? 'Assigned staff member responsible for delivery.' : 'Assign to an available analyst or RM.'}
          </p>
        </DetailsCard>
        {(request as any).due_date && (
          <DetailsCard title="SLA & Due Date">
            <p className="text-sm font-medium">
              {new Date((request as any).due_date).toLocaleString(undefined, {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimeRemaining((request as any).due_date)}
            </p>
          </DetailsCard>
        )}
        <DetailsCard title="Linked Workflow & Deliverables">
          {request.linked_workflow_run ? (
            <p className="text-sm font-medium">Workflow run: {shortenId(request.linked_workflow_run)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No workflow run linked.</p>
          )}
          {request.result_doc_id ? (
            <p className="text-xs text-muted-foreground">Deliverable ready for review.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Attach deliverables before closing the request.</p>
          )}
        </DetailsCard>
      </div>

      <Separator className="border-white/10" />

      <div>
        <h3 className="text-lg font-medium mb-2">Status History & Notes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            Created at {new Date(request.created_at).toLocaleString()} by {request.created_by_profile?.display_name}
          </li>
          {request.updated_at && (
            <li>Last updated at {new Date(request.updated_at).toLocaleString()}</li>
          )}
          {request.closed_at && <li>Closed at {new Date(request.closed_at).toLocaleString()}</li>}
          {request.completion_note && (
            <li className="bg-white/5 border border-white/10 rounded-md p-3 text-foreground">
              <p className="text-sm font-medium mb-1">Completion Note</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{request.completion_note}</p>
            </li>
          )}
        </ul>
      </div>

      <Separator className="border-white/10" />

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <RequestAssignmentDialog
            requestId={request.id}
            currentAssignee={request.assigned_to_profile}
            currentUserId={currentUserId || undefined}
            onUpdate={onUpdate}
            trigger={
              <Button variant="secondary" className="justify-start gap-2 w-full">
                <UserPlus className="h-4 w-4" />
                {request.assigned_to ? 'Reassign Request' : 'Assign Request'}
              </Button>
            }
          />
          
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={handleCreateConversation}
            disabled={isCreatingConversation}
          >
            {isCreatingConversation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Create Conversation
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuickActionButtons({ request }: { request: RequestTicketWithRelations }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Button variant="secondary" className="justify-start gap-2">
        <User className="h-4 w-4" /> Assign to team member
      </Button>
      <Button variant="secondary" className="justify-start gap-2">
        <Play className="h-4 w-4" /> Trigger automation
      </Button>
      <Button variant="outline" className="justify-start gap-2">
        <MessageCircle className="h-4 w-4" /> Request clarification
      </Button>
      <Button variant="outline" className="justify-start gap-2">
        <CheckCircle className="h-4 w-4" /> Mark ready for review
      </Button>
    </div>
  )
}

function MetadataItem({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={cn('text-sm font-medium', emphasis && 'text-red-300')}>{value}</div>
    </div>
  )
}

function DetailsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}

function shortenId(id: string) {
  if (!id) return ''
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


