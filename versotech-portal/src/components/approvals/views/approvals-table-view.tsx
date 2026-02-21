'use client'

import { useState, useMemo } from 'react'
import { Approval, SLAStatus } from '@/types/approvals'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface ApprovalsTableViewProps {
  approvals: Approval[]
  selectedIds: Set<string>
  onToggleSelection: (id: string) => void
  onToggleSelectAll: () => void
  onApprovalClick: (approval: Approval) => void
  onApproveClick: (approval: Approval) => void
  onRejectClick: (approval: Approval) => void
  isLoading: boolean
  pagination: { page: number; limit: number; total: number }
  onPageChange: (page: number) => void
}

type SortField = 'created_at' | 'sla_breach_at' | 'entity_type' | 'assigned_to'
type SortDirection = 'asc' | 'desc'

function calculateSLAStatus(slaBreachAt: string | null | undefined): SLAStatus {
  if (!slaBreachAt) {
    return { text: 'No SLA', isOverdue: false, urgency: 'low' }
  }

  const now = new Date()
  const sla = new Date(slaBreachAt)
  const diffMs = sla.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 0) {
    return { text: `${Math.abs(diffHours)}h overdue`, isOverdue: true, urgency: 'high', hoursRemaining: diffHours }
  } else if (diffHours < 4) {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'high', hoursRemaining: diffHours }
  } else if (diffHours < 12) {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'medium', hoursRemaining: diffHours }
  } else {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'low', hoursRemaining: diffHours }
  }
}

function SortIcon({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) {
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
  return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
}

export function ApprovalsTableView({
  approvals,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onApprovalClick,
  onApproveClick,
  onRejectClick,
  isLoading,
  pagination,
  onPageChange
}: ApprovalsTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedApprovals = useMemo(() => {
    const sorted = [...approvals]
    sorted.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

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
        case 'assigned_to':
          aVal = a.assigned_to_profile?.display_name || 'zzz'
          bVal = b.assigned_to_profile?.display_name || 'zzz'
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [approvals, sortField, sortDirection])

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === approvals.length && approvals.length > 0}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('entity_type')}
                  className="flex items-center hover:text-foreground"
                >
                  Request Type / User
                  <SortIcon field="entity_type" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </TableHead>
              <TableHead>Deal / Investor</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('sla_breach_at')}
                  className="flex items-center hover:text-foreground"
                >
                  SLA Status
                  <SortIcon field="sla_breach_at" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('assigned_to')}
                  className="flex items-center hover:text-foreground"
                >
                  Assigned To
                  <SortIcon field="assigned_to" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center hover:text-foreground"
                >
                  Created
                  <SortIcon field="created_at" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApprovals.length > 0 ? (
              sortedApprovals.map((approval) => {
                const slaStatus = calculateSLAStatus(approval.sla_breach_at)

                return (
                  <TableRow
                    key={approval.id}
                    className={`cursor-pointer hover:bg-white/5 transition-colors ${selectedIds.has(approval.id) ? 'bg-muted/50' : ''}`}
                    onClick={() => onApprovalClick(approval)}
                  >
                    <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(approval.id)}
                        onCheckedChange={() => onToggleSelection(approval.id)}
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
                          approval.entity_metadata?.entity_name ? (
                            <div className="text-sm text-muted-foreground">
                              {approval.entity_metadata.entity_name}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground font-mono">
                              {approval.entity_id.substring(0, 8)}...
                            </div>
                          )
                        )}
                        {(() => {
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

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(approval.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {approval.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApproveClick(approval)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRejectClick(approval)}
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
          Showing {approvals.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}-
          {Math.min(pagination.page * pagination.limit, Math.max(pagination.total, approvals.length))} of {Math.max(pagination.total, approvals.length)} approvals
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1 || isLoading}
            onClick={() => onPageChange(pagination.page - 1)}
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
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
