'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  X,
  UserCheck
} from 'lucide-react'
import { Approval, ApprovalStats } from '@/types/approvals'
import { ApprovalActionDialog } from './approval-action-dialog'
import { ApprovalFilters, FilterState } from './approval-filters'
import { ApprovalDetailDrawer } from './approval-detail-drawer'
import { ApprovalViewSwitcher, ViewType } from './approval-view-switcher'
import { ApprovalsKanbanView } from './views/approvals-kanban-view'
import { ApprovalsListView } from './views/approvals-list-view'
import { ApprovalsTableView } from './views/approvals-table-view'
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
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    entity_types: [],
    priorities: [],
    assigned_to_me: false,
    overdue_only: false
  })

  // Pagination state
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
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'request_info' | null>(null)

  // Detail drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailDrawerApproval, setDetailDrawerApproval] = useState<Approval | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('table')

  // Filter approvals based on current view and search query
  // Kanban shows all statuses, other views show only pending
  const visibleApprovals = useMemo(() => {
    let filtered = currentView === 'kanban'
      ? approvals
      : approvals.filter(a => a.status === 'pending')

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => {
        const dealName = a.related_deal?.name?.toLowerCase() || ''
        const investorName = a.related_investor?.legal_name?.toLowerCase() || ''
        const entityName = (a.entity_metadata?.entity_name as string)?.toLowerCase() || ''
        const requesterName = a.requested_by_profile?.display_name?.toLowerCase() || ''
        const email = (a.entity_metadata?.email as string)?.toLowerCase() || ''
        const entityIdPrefix = a.entity_id?.toLowerCase() || ''
        return (
          dealName.includes(q) ||
          investorName.includes(q) ||
          entityName.includes(q) ||
          requesterName.includes(q) ||
          email.includes(q) ||
          entityIdPrefix.includes(q)
        )
      })
    }

    return filtered
  }, [approvals, currentView, searchQuery])

  // Load view preference from localStorage (fallback 'database' → 'table')
  useEffect(() => {
    const savedView = localStorage.getItem('approvals-view-preference')
    if (savedView && ['table', 'kanban', 'list'].includes(savedView)) {
      setCurrentView(savedView as ViewType)
    } else if (savedView === 'database') {
      setCurrentView('table')
      localStorage.setItem('approvals-view-preference', 'table')
    }
  }, [])

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem('approvals-view-preference', currentView)
  }, [currentView])

  // Reset pagination when view changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [currentView])

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', 'pending,approved,rejected')
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      params.append('decided_after', thirtyDaysAgo.toISOString())

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

  // Handle approve/reject button clicks → open dialog
  const handleApproveClick = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogAction('approve')
    setDialogOpen(true)
  }

  const handleRejectClick = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogAction(approval.entity_type === 'account_activation' ? 'request_info' : 'reject')
    setDialogOpen(true)
  }

  const handleActionSuccess = () => {
    setSelectedIds(new Set())
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
      const targetApproval = approvals.find(approval => approval.id === approvalId)
      const isAccountActivation = targetApproval?.entity_type === 'account_activation'
      const response = await fetch(`/api/approvals/${approvalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          isAccountActivation
            ? { action: 'request_info', notes: reason, request_sections: ['general'] }
            : { action: 'reject', rejection_reason: reason }
        )
      })

      if (!response.ok) throw new Error('Rejection failed')
      toast.success(isAccountActivation ? 'More information requested' : 'Approval rejected')
      await refreshData()
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Failed to reject')
      throw error
    }
  }

  // Refresh when filters or pagination change
  useEffect(() => {
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

  // Export to CSV
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

  return (
    <>
      <div className="space-y-6">
        {/* Compact Stats Bar */}
        <div className="flex items-center gap-6 px-4 py-3 rounded-lg border border-border bg-muted/30 text-sm overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground">Pending</span>
            <span className="font-semibold text-amber-600">{stats.total_pending}</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="text-muted-foreground">Overdue</span>
            <span className="font-semibold text-rose-600">{stats.overdue_count}</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground">Avg Processing</span>
            <span className="font-semibold text-foreground">{stats.avg_processing_time_hours.toFixed(1)}h</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">Approved 30d</span>
            <span className="font-semibold text-emerald-600">{stats.total_approved_30d}</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span className="text-muted-foreground">Rejected 30d</span>
            <span className="font-semibold text-rose-600">{stats.total_rejected_30d}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search approvals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <ApprovalViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            <ApprovalFilters
              onFilterChange={setFilters}
              currentFilters={filters}
            />
            <Button
              variant={filters.assigned_to_me ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, assigned_to_me: !prev.assigned_to_me }))}
            >
              <UserCheck className="h-4 w-4 mr-1.5" />
              Mine
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {visibleApprovals.length} item{visibleApprovals.length !== 1 ? 's' : ''}
            </Badge>
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

        {/* View Content */}
        {currentView === 'table' && (
          <ApprovalsTableView
            approvals={visibleApprovals}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            onApprovalClick={handleApprovalClick}
            onApproveClick={handleApproveClick}
            onRejectClick={handleRejectClick}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        )}

        {currentView === 'kanban' && (
          <ApprovalsKanbanView
            approvals={visibleApprovals}
            onApprovalClick={handleApprovalClick}
            onApproveClick={handleApproveClick}
            onRejectClick={handleRejectClick}
          />
        )}

        {currentView === 'list' && (
          <ApprovalsListView
            approvals={visibleApprovals}
            onApprovalClick={handleApprovalClick}
            onApproveClick={handleApproveClick}
            onRejectClick={handleRejectClick}
          />
        )}
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
