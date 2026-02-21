'use client'
import { Approval } from '@/types/approvals'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, Shield, CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsKanbanViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
  onApproveClick?: (approval: Approval) => void
  onRejectClick?: (approval: Approval) => void
}

const statusColumns = [
  { id: 'pending', title: 'Pending Review', color: 'border-amber-500', badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500', badgeColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
  { id: 'rejected', title: 'Rejected', color: 'border-rose-500', badgeColor: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300' }
]

export function ApprovalsKanbanView({ approvals, onApprovalClick, onApproveClick, onRejectClick }: ApprovalsKanbanViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {statusColumns.map((column) => {
        const columnApprovals = approvals.filter((a) => a.status === column.id)

        return (
          <div key={column.id} className="flex flex-col min-w-0">
            {/* Column Header */}
            <div className={`border-l-4 ${column.color} pl-3 py-2 mb-3 flex items-center justify-between`}>
              <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {columnApprovals.length}
              </Badge>
            </div>

            {/* Scrollable Card List */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {columnApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onApprovalClick(approval)}
                >
                  {/* Type badge */}
                  <Badge variant="outline" className="text-[10px] mb-1.5">
                    {approval.entity_type === 'deal_interest' || approval.entity_type === 'deal_interest_nda'
                      ? 'Data Room Access'
                      : approval.entity_type.replace(/_/g, ' ')}
                  </Badge>

                  {/* Title */}
                  <p className="font-medium text-sm truncate text-foreground">
                    {approval.entity_type === 'member_invitation'
                      ? approval.entity_metadata?.email || 'Unknown'
                      : (
                        approval.related_deal?.name ||
                        approval.related_investor?.legal_name ||
                        approval.entity_metadata?.entity_name ||
                        'Unknown'
                      )}
                  </p>

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    {approval.sla_breach_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}
                      </span>
                    )}
                    {approval.entity_metadata?.indicative_amount && (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <DollarSign className="h-3 w-3" />
                        {approval.entity_metadata.indicative_currency || 'USD'}{' '}
                        {approval.entity_metadata.indicative_amount.toLocaleString()}
                      </span>
                    )}
                    {approval.entity_type === 'member_invitation' && approval.entity_metadata?.is_signatory && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Shield className="h-3 w-3" />
                        Signatory
                      </span>
                    )}
                  </div>

                  {/* Bottom: requester + entity info */}
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className="truncate">
                      {approval.entity_type === 'member_invitation'
                        ? approval.entity_metadata?.entity_name
                        : approval.related_investor?.legal_name || approval.requested_by_profile?.display_name || ''}
                    </span>
                    <span className="shrink-0 ml-2">
                      {format(new Date(approval.created_at), 'MMM dd')}
                    </span>
                  </div>

                  {/* Quick actions for pending cards */}
                  {column.id === 'pending' && (onApproveClick || onRejectClick) && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                      {onApproveClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => onApproveClick(approval)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {onRejectClick && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => onRejectClick(approval)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {columnApprovals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                  No {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
