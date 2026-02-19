'use client'

import { useState, useMemo } from 'react'
import { Approval } from '@/types/approvals'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsDatabaseViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
}

type SortField = 'created_at' | 'sla_breach_at' | 'entity_type' | 'status'
type SortDirection = 'asc' | 'desc'

const statusColors = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  awaiting_info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  escalated: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
  cancelled: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300'
}

export function ApprovalsDatabaseView({ approvals, onApprovalClick }: ApprovalsDatabaseViewProps) {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [slaFilter, setSlaFilter] = useState<string>('all')

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    entity_type: true,
    deal_investor: true,
    amount: true,
    status: true,
    sla: true,
    assigned_to: true,
    requested_by: true,
    created_at: true
  })

  // Filter and search logic
  const filteredAndSortedApprovals = useMemo(() => {
    let filtered = approvals

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.entity_type.toLowerCase().includes(query) ||
          a.related_deal?.name?.toLowerCase().includes(query) ||
          a.related_investor?.legal_name?.toLowerCase().includes(query) ||
          a.requested_by_profile?.display_name?.toLowerCase().includes(query) ||
          a.assigned_to_profile?.display_name?.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          // Member invitation specific search
          (a.entity_type === 'member_invitation' && (
            a.entity_metadata?.email?.toLowerCase().includes(query) ||
            a.entity_metadata?.entity_name?.toLowerCase().includes(query) ||
            a.entity_metadata?.role?.toLowerCase().includes(query)
          ))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }

    // Entity type filter
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter((a) => a.entity_type === entityTypeFilter)
    }

    // SLA filter
    if (slaFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter((a) => {
        if (!a.sla_breach_at) return slaFilter === 'no_sla'
        const breachDate = new Date(a.sla_breach_at)
        if (slaFilter === 'overdue') return breachDate < now
        if (slaFilter === 'due_soon') {
          const hoursRemaining = (breachDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          return hoursRemaining > 0 && hoursRemaining < 4
        }
        if (slaFilter === 'on_track') {
          const hoursRemaining = (breachDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          return hoursRemaining >= 4
        }
        return true
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        case 'sla_breach_at':
          aVal = a.sla_breach_at ? new Date(a.sla_breach_at).getTime() : Infinity
          bVal = b.sla_breach_at ? new Date(b.sla_breach_at).getTime() : Infinity
          break
        case 'entity_type':
          aVal = a.entity_type
          bVal = b.entity_type
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [approvals, searchQuery, statusFilter, entityTypeFilter, slaFilter, sortField, sortDirection])

  // Unique values for filters
  const uniqueEntityTypes = useMemo(
    () => Array.from(new Set(approvals.map((a) => a.entity_type))),
    [approvals]
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setEntityTypeFilter('all')
    setSlaFilter('all')
  }

  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || entityTypeFilter !== 'all' || slaFilter !== 'all'

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters Bar */}
      <Card className="border-border bg-muted/50">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by deal name, investor, ID, assigned to..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="shrink-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Entity Type
                </label>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueEntityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'deal_interest' || type === 'deal_interest_nda' ? 'Data Room Access Request' : type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  SLA Status
                </label>
                <Select value={slaFilter} onValueChange={setSlaFilter}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SLA</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="due_soon">Due Soon (&lt;4h)</SelectItem>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="no_sla">No SLA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  Sort By
                </label>
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="sla_breach_at">SLA Deadline</SelectItem>
                    <SelectItem value="entity_type">Entity Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredAndSortedApprovals.length}</span> of{' '}
                <span className="font-semibold text-foreground">{approvals.length}</span> approvals
              </p>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-xs">
                  Filters Active
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Grid Table */}
      <Card className="border-border bg-muted/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-white/5">
                {visibleColumns.entity_type && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('entity_type')}
                      className="flex items-center text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Type
                      <SortIcon field="entity_type" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.deal_investor && (
                  <TableHead className="text-muted-foreground font-semibold">Deal / Investor</TableHead>
                )}
                {visibleColumns.amount && (
                  <TableHead className="text-muted-foreground font-semibold">Amount</TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.sla && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('sla_breach_at')}
                      className="flex items-center text-muted-foreground hover:text-foreground font-semibold"
                    >
                      SLA Deadline
                      <SortIcon field="sla_breach_at" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.assigned_to && (
                  <TableHead className="text-muted-foreground font-semibold">Assigned To</TableHead>
                )}
                {visibleColumns.requested_by && (
                  <TableHead className="text-muted-foreground font-semibold">Requested By</TableHead>
                )}
                {visibleColumns.created_at && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Created
                      <SortIcon field="created_at" />
                    </button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedApprovals.length > 0 ? (
                filteredAndSortedApprovals.map((approval) => {
                  const slaBreachDate = approval.sla_breach_at ? new Date(approval.sla_breach_at) : null
                  const isOverdue = slaBreachDate && slaBreachDate < new Date()

                  return (
                    <TableRow
                      key={approval.id}
                      className="border-border cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onApprovalClick(approval)}
                    >
                      {visibleColumns.entity_type && (
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {approval.entity_type === 'deal_interest' || approval.entity_type === 'deal_interest_nda'
                              ? 'Data Room Access Request'
                              : approval.entity_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.deal_investor && (
                        <TableCell>
                          <div className="space-y-1">
                            {approval.entity_type === 'member_invitation' && approval.entity_metadata ? (
                              <>
                                <p className="font-medium text-foreground text-sm">
                                  {approval.entity_metadata.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {approval.entity_metadata.entity_name} • {approval.entity_metadata.role || 'Member'}
                                  {approval.entity_metadata.is_signatory && ' • Signatory'}
                                </p>
                              </>
                            ) : (
                              <>
                                {approval.related_deal && (
                                  <p className="font-medium text-foreground text-sm">
                                    {approval.related_deal.name}
                                  </p>
                                )}
                                {approval.related_investor && (
                                  <p className="text-xs text-muted-foreground">
                                    {approval.related_investor.legal_name}
                                  </p>
                                )}
                                {!approval.related_deal && !approval.related_investor && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {approval.entity_id.substring(0, 12)}...
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.amount && (
                        <TableCell>
                          {approval.entity_metadata?.indicative_amount ? (
                            <p className="text-sm font-semibold text-emerald-400">
                              {approval.entity_metadata.indicative_currency || 'USD'}{' '}
                              {approval.entity_metadata.indicative_amount.toLocaleString()}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          <Badge className={statusColors[approval.status]}>
                            {approval.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.sla && (
                        <TableCell>
                          {slaBreachDate ? (
                            <div className={isOverdue ? 'text-red-400 font-semibold' : 'text-muted-foreground'}>
                              <p className="text-xs">
                                {format(slaBreachDate, 'MMM dd, HH:mm')}
                              </p>
                              {isOverdue && (
                                <p className="text-xs text-red-400">Overdue</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No SLA</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.assigned_to && (
                        <TableCell>
                          <p className="text-sm text-foreground">
                            {approval.assigned_to_profile?.display_name || (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </p>
                        </TableCell>
                      )}
                      {visibleColumns.requested_by && (
                        <TableCell>
                          <p className="text-sm text-foreground">
                            {approval.requested_by_profile?.display_name || 'Unknown'}
                          </p>
                        </TableCell>
                      )}
                      {visibleColumns.created_at && (
                        <TableCell>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(approval.created_at), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(approval.created_at), 'HH:mm')}
                          </p>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No approvals match your filters</p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
