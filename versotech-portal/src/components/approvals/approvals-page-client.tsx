'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  HandCoins,
  Package
} from 'lucide-react'
import { Approval, ApprovalStats, SLAStatus } from '@/types/approvals'
import { ApprovalActionDialog } from './approval-action-dialog'
import { ApprovalFilters, FilterState } from './approval-filters'
import { ApprovalDetailDrawer } from './approval-detail-drawer'
import { ApprovalViewSwitcher, ViewType } from './approval-view-switcher'
import { ApprovalsKanbanView } from './views/approvals-kanban-view'
import { ApprovalsListView } from './views/approvals-list-view'
import { ApprovalsDatabaseView } from './views/approvals-database-view'
import { exportApprovalsToCSV } from '@/lib/export-csv'
import { toast } from 'sonner'

interface ApprovalsPageClientProps {
  initialApprovals: Approval[]
  initialStats: ApprovalStats
  initialCounts: {
    pending: number
    approved: number
    rejected: number
  }
}

// Calculate SLA status from deadline
function calculateSLAStatus(slaBreachAt: string | null | undefined): SLAStatus {
  if (!slaBreachAt) {
    return { text: 'No SLA', isOverdue: false, urgency: 'low' }
  }

  const now = new Date()
  const sla = new Date(slaBreachAt)
  const diffMs = sla.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 0) {
    return {
      text: `${Math.abs(diffHours)}h overdue`,
      isOverdue: true,
      urgency: 'high',
      hoursRemaining: diffHours
    }
  } else if (diffHours < 4) {
    return {
      text: `${diffHours}h remaining`,
      isOverdue: false,
      urgency: 'high',
      hoursRemaining: diffHours
    }
  } else if (diffHours < 12) {
    return {
      text: `${diffHours}h remaining`,
      isOverdue: false,
      urgency: 'medium',
      hoursRemaining: diffHours
    }
  } else {
    return {
      text: `${diffHours}h remaining`,
      isOverdue: false,
      urgency: 'low',
      hoursRemaining: diffHours
    }
  }
}

export function ApprovalsPageClient({
  initialApprovals,
  initialStats,
  initialCounts
}: ApprovalsPageClientProps) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [stats, setStats] = useState<ApprovalStats>(initialStats)
  const [counts, setCounts] = useState(initialCounts)
  const [isLoading, setIsLoading] = useState(false)

  // Track initial mount to prevent API call from overwriting server data
  // The server passes initialApprovals with correct data for the preferred view,
  // but the useEffect below fires before localStorage view is loaded, causing
  // a race condition where pending-only data overwrites the complete dataset
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    entity_types: [],
    priorities: [],
    assigned_to_me: false,
    overdue_only: false
  })

  // Pagination state - initialize total from initial data
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: initialApprovals?.length || 0
  })

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null)

  // Detail drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailDrawerApproval, setDetailDrawerApproval] = useState<Approval | null>(null)

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('table')

  // Filter approvals based on current view
  // Kanban shows all statuses, other views show only pending
  const visibleApprovals = useMemo(() => {
    if (currentView === 'kanban') {
      return approvals
    }
    // Table, List, Database views only show pending items
    return approvals.filter(a => a.status === 'pending')
  }, [approvals, currentView])

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('approvals-view-preference')
    if (savedView && ['table', 'kanban', 'list', 'database'].includes(savedView)) {
      setCurrentView(savedView as ViewType)
    }
  }, [])

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem('approvals-view-preference', currentView)
  }, [currentView])

  // Reset pagination when view changes to avoid offset issues
  // (e.g., switching from table view page 3 to Kanban which may have fewer items)
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [currentView])

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Build query params from filters
      const params = new URLSearchParams()

      // ALWAYS fetch all statuses to ensure data consistency across views
      // The visibleApprovals memo handles filtering for non-kanban views
      // This prevents data loss when user applies filter in table then switches to kanban
      params.append('status', 'pending,approved,rejected')
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      params.append('decided_after', thirtyDaysAgo.toISOString())

      // Kanban view needs ALL items without pagination to show complete board
      // Other views (table, list, database) use standard pagination
      const effectiveLimit = currentView === 'kanban' ? 500 : pagination.limit
      params.append('limit', effectiveLimit.toString())
      if (currentView !== 'kanban') {
        params.append('offset', ((pagination.page - 1) * pagination.limit).toString())
      }

      if (filters.entity_types.length > 0) {
        params.append('entity_types', filters.entity_types.join(','))
      }
      if (filters.priorities.length > 0) {
        params.append('priorities', filters.priorities.join(','))
      }
      if (filters.assigned_to_me) {
        params.append('assigned_to', 'me')
      }
      if (filters.overdue_only) {
        params.append('overdue_only', 'true')
      }

      const response = await fetch(`/api/approvals?${params.toString()}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch approvals')

      const data = await response.json()
      setApprovals(data.approvals || [])
      setStats(data.stats || initialStats)
      setCounts(data.counts || initialCounts)
      setPagination(prev => ({ ...prev, total: data.total || 0 }))
    } catch (error) {
      console.error('Error refreshing approvals:', error)
      toast.error('Failed to refresh approvals data')
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit, initialStats, initialCounts, currentView])

  // Handle approve button click
  const handleApproveClick = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogAction('approve')
    setDialogOpen(true)
  }

  // Handle reject button click
  const handleRejectClick = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogAction('reject')
    setDialogOpen(true)
  }

  // Handle successful action
  const handleActionSuccess = () => {
    setSelectedIds(new Set()) // Clear selection after action
    refreshData()
  }

  // Detail drawer handlers
  const handleApprovalClick = (approval: Approval) => {
    setDetailDrawerApproval(approval)
    setDetailDrawerOpen(true)
  }

  const handleDrawerApprove = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'approve' })
      })

      if (!response.ok) throw new Error('Approval failed')

      toast.success('Approval approved successfully')
      await refreshData()
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Failed to approve')
      throw error
    }
  }

  const handleDrawerReject = async (approvalId: string, reason: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reject', rejection_reason: reason })
      })

      if (!response.ok) throw new Error('Rejection failed')

      toast.success('Approval rejected')
      await refreshData()
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Failed to reject')
      throw error
    }
  }

  // Refresh when filters or pagination change
  // Note: currentView is intentionally NOT included - server provides complete data
  // for all views, so we don't need to refetch when switching views. User can
  // manually refresh if needed via the Refresh button.
  useEffect(() => {
    // Skip initial mount - we already have correct server data from initialApprovals
    if (isInitialMount) {
      setIsInitialMount(false)
      return
    }
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.entity_types, filters.priorities, filters.assigned_to_me, filters.overdue_only, pagination.page])

  // Bulk selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === visibleApprovals.length && visibleApprovals.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleApprovals.map(a => a.id)))
    }
  }

  // Bulk action handler
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) {
      toast.error('No approvals selected')
      return
    }

    setIsBulkProcessing(true)
    try {
      const response = await fetch('/api/approvals/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          approval_ids: Array.from(selectedIds),
          action,
          rejection_reason: action === 'reject' ? 'Bulk rejection' : undefined
        })
      })

      if (!response.ok) throw new Error(`Bulk ${action} failed`)

      const data = await response.json()

      if (data.successful_count > 0) {
        toast.success(`${data.successful_count} approval${data.successful_count > 1 ? 's' : ''} ${action}d successfully`)
      }
      if (data.failed_count > 0) {
        toast.error(`${data.failed_count} approval${data.failed_count > 1 ? 's' : ''} failed`)
      }

      setSelectedIds(new Set())
      refreshData()
    } catch (error) {
      console.error(`Bulk ${action} error:`, error)
      toast.error(`Failed to ${action} selected approvals`)
    } finally {
      setIsBulkProcessing(false)
    }
  }

  // Export to CSV handler
  const handleExport = () => {
    try {
      if (!visibleApprovals || visibleApprovals.length === 0) {
        toast.error('No data to export')
        return
      }

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `approvals-export-${timestamp}.csv`
      exportApprovalsToCSV(visibleApprovals, filename)
      toast.success(`Exported ${visibleApprovals.length} approvals to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  // Quick action: Review overdue items
  const handleReviewOverdue = async () => {
    if (stats.overdue_count === 0) {
      toast.info('No overdue items')
      return
    }
    const newFilters = { 
      entity_types: [], 
      priorities: [], 
      assigned_to_me: false, 
      overdue_only: true 
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleReviewInterests = async () => {
    const newFilters = {
      entity_types: ['deal_interest'] as any[],
      priorities: [],
      assigned_to_me: false,
      overdue_only: false
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleReviewSubscriptions = async () => {
    const newFilters = {
      entity_types: ['deal_subscription'] as any[],
      priorities: [],
      assigned_to_me: false,
      overdue_only: false
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Quick action: Clear all filters
  const handleClearFilters = async () => {
    const newFilters = { 
      entity_types: [], 
      priorities: [], 
      assigned_to_me: false, 
      overdue_only: false 
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    setSelectedIds(new Set())
  }

  return (
    <>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total_pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue_count}</div>
              <p className="text-xs text-muted-foreground mt-1">Past deadline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.avg_processing_time_hours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Approvals Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>
                    Review deal approvals across commitments, interests, and data-room workflows
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <ApprovalFilters
                    onFilterChange={setFilters}
                    currentFilters={filters}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={!visibleApprovals || visibleApprovals.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshData()}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <ApprovalViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
                <Badge variant="secondary" className="text-sm">
                  {visibleApprovals.length} approval{visibleApprovals.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table View */}
            {currentView === 'table' && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedIds.size === visibleApprovals.length && visibleApprovals.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Request Type / User</TableHead>
                        <TableHead>Deal / Investor</TableHead>
                        <TableHead>SLA Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleApprovals && visibleApprovals.length > 0 ? (
                        visibleApprovals.map((approval) => {
                          const slaStatus = calculateSLAStatus(approval.sla_breach_at)

                          return (
                            <TableRow
                              key={approval.id}
                              className={`cursor-pointer hover:bg-white/5 transition-colors ${selectedIds.has(approval.id) ? 'bg-muted/50' : ''}`}
                              onClick={() => handleApprovalClick(approval)}
                            >
                              <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.has(approval.id)}
                                  onCheckedChange={() => toggleSelection(approval.id)}
                                  aria-label={`Select approval ${approval.id}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {approval.entity_type === 'deal_interest' || approval.entity_type === 'deal_interest_nda'
                                      ? 'DATA ROOM ACCESS REQUEST'
                                      : approval.entity_type.replace(/_/g, ' ').toUpperCase()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {approval.requested_by_profile?.display_name || 'Unknown User'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(approval.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div>
                                  {approval.related_investor && (
                                    <div className="font-medium text-foreground">
                                      {approval.related_investor.legal_name}
                                    </div>
                                  )}
                                  {approval.related_deal && (
                                    <div className="text-sm text-muted-foreground">
                                      {approval.related_deal.name}
                                    </div>
                                  )}
                                  {!approval.related_investor && !approval.related_deal && (
                                    <div className="text-sm text-muted-foreground font-mono">
                                      {approval.entity_id.substring(0, 8)}...
                                    </div>
                                  )}
                                  {(() => {
                                    // For deal_subscription approvals, use derived_amount
                                    if (approval.entity_type === 'deal_subscription') {
                                      const derivedAmount = approval.entity_metadata?.derived_amount
                                      if (derivedAmount) {
                                        const currency = approval.entity_metadata?.payload?.currency || 'USD'
                                        const numeric = parseFloat(derivedAmount)
                                        if (!Number.isNaN(numeric)) {
                                          return (
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {currency} {numeric.toLocaleString()}
                                            </div>
                                          )
                                        }
                                      }
                                    }

                                    // For other approval types, use indicative_amount or requested_amount
                                    const indicativeAmount = approval.entity_metadata?.indicative_amount
                                    const requestedAmount = approval.entity_metadata?.requested_amount || approval.entity_metadata?.amount
                                    const indicativeCurrency = approval.entity_metadata?.indicative_currency || ''

                                    let formattedAmount: string | null = null
                                    if (indicativeAmount) {
                                      const numeric = parseFloat(indicativeAmount)
                                      if (!Number.isNaN(numeric)) {
                                        formattedAmount = `${indicativeCurrency} ${numeric.toLocaleString()}`.trim()
                                      }
                                    } else if (requestedAmount) {
                                      const numeric = parseFloat(requestedAmount)
                                      if (!Number.isNaN(numeric)) {
                                        formattedAmount = `$${numeric.toLocaleString()}`
                                      }
                                    }

                                    return formattedAmount ? (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {formattedAmount}
                                      </div>
                                    ) : null
                                  })()}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant={
                                    slaStatus.isOverdue
                                      ? 'destructive'
                                      : slaStatus.urgency === 'high'
                                      ? 'destructive'
                                      : slaStatus.urgency === 'medium'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {slaStatus.text}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {approval.assigned_to_profile?.display_name || 'Unassigned'}
                                </span>
                              </TableCell>

                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {/* Only show action buttons for pending approvals */}
                                {approval.status === 'pending' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleApproveClick(approval)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectClick(approval)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {approval.status}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {isLoading ? 'Loading approvals...' : 'No pending approvals found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {visibleApprovals.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}-
                    {Math.min(pagination.page * pagination.limit, Math.max(pagination.total, visibleApprovals.length))} of {Math.max(pagination.total, visibleApprovals.length)} approvals
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1 || isLoading}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || isLoading}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Kanban View */}
            {currentView === 'kanban' && (
              <ApprovalsKanbanView
                approvals={visibleApprovals}
                onApprovalClick={handleApprovalClick}
              />
            )}

            {/* List View */}
            {currentView === 'list' && (
              <ApprovalsListView
                approvals={visibleApprovals}
                onApprovalClick={handleApprovalClick}
                onApprove={handleDrawerApprove}
                onReject={handleDrawerReject}
              />
            )}

            {/* Database/Grid View */}
            {currentView === 'database' && (
              <ApprovalsDatabaseView
                approvals={visibleApprovals}
                onApprovalClick={handleApprovalClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleReviewOverdue}
                disabled={stats.overdue_count === 0}
              >
                <Clock className="mr-2 h-4 w-4 text-red-600" />
                Review Overdue ({stats.overdue_count})
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleReviewInterests}
              >
                <HandCoins className="mr-2 h-4 w-4 text-purple-600" />
                Data Room Access Requests
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleReviewSubscriptions}
              >
                <Package className="mr-2 h-4 w-4 text-sky-600" />
                Subscription Approvals
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleClearFilters}
                disabled={
                  filters.entity_types.length === 0 && 
                  filters.priorities.length === 0 && 
                  !filters.assigned_to_me && 
                  !filters.overdue_only
                }
              >
                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SLA Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">On-time approvals (24h)</span>
                  <span className="font-medium text-green-600">
                    {stats.approval_rate_24h.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overdue items</span>
                  <span className="font-medium text-red-600">{stats.overdue_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average processing</span>
                  <span className="font-medium">
                    {stats.avg_processing_time_hours.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approved (30d)</span>
                  <span className="font-medium text-green-600">{stats.total_approved_30d}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rejected (30d)</span>
                  <span className="font-medium text-red-600">{stats.total_rejected_30d}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 border-2 border-blue-500 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm">
              {selectedIds.size} approval{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              onClick={() => handleBulkAction('approve')}
              disabled={isBulkProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve All
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('reject')}
              disabled={isBulkProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
              disabled={isBulkProcessing}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Approval Action Dialog */}
      <ApprovalActionDialog
        approval={selectedApproval}
        action={dialogAction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleActionSuccess}
      />

      {/* Detail Drawer */}
      <ApprovalDetailDrawer
        approval={detailDrawerApproval}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onApprove={handleDrawerApprove}
        onReject={handleDrawerReject}
      />
    </>
  )
}
