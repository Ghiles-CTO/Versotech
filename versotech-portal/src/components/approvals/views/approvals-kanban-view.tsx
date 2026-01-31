'use client'
import { Approval } from '@/types/approvals'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Mail, Shield } from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsKanbanViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
}

const statusColumns = [
  { id: 'pending', title: 'Pending Review', color: 'border-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 'rejected', title: 'Rejected', color: 'border-rose-500', bgColor: 'bg-rose-500/10' }
]

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  cancelled: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300'
}

export function ApprovalsKanbanView({ approvals, onApprovalClick }: ApprovalsKanbanViewProps) {
  const columns = statusColumns

  return (
    <div className="space-y-4">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnApprovals = approvals.filter((a) => a.status === column.id)

          return (
            <div key={column.id} className="space-y-4">
              <div className={`border-l-4 ${column.color} pl-4 ${column.bgColor} py-3 rounded-r-lg`}>
                <h3 className="font-semibold text-lg text-foreground">{column.title}</h3>
                <p className="text-sm text-muted-foreground">{columnApprovals.length} items</p>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {columnApprovals.map((approval) => (
                  <Card
                    key={approval.id}
                    className="cursor-pointer hover:bg-muted transition-all border-border hover:border-primary/30 hover:shadow-lg"
                    onClick={() => onApprovalClick(approval)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs">
                            {approval.entity_type === 'deal_interest'
                              ? 'Data Room Access Request'
                              : approval.entity_type.replace(/_/g, ' ')}
                          </Badge>
                          <p className="font-semibold text-sm truncate text-foreground">
                            {approval.entity_type === 'member_invitation'
                              ? approval.entity_metadata?.email || 'Unknown'
                              : (approval.related_deal?.name || approval.related_investor?.legal_name || 'Unknown')}
                          </p>
                        </div>
                        <Badge className={statusColors[approval.status]}>
                          {approval.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {approval.sla_breach_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Due {format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}</span>
                        </div>
                      )}
                      {approval.entity_metadata?.indicative_amount && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <DollarSign className="h-3 w-3" />
                          {approval.entity_metadata.indicative_currency || 'USD'}{' '}
                          {approval.entity_metadata.indicative_amount.toLocaleString()}
                        </div>
                      )}
                      {approval.assigned_to_profile && (
                        <p className="text-xs text-muted-foreground truncate">
                          Assigned: {approval.assigned_to_profile.display_name}
                        </p>
                      )}
                      {approval.entity_type === 'member_invitation' && approval.entity_metadata && (
                        <>
                          <p className="text-xs text-muted-foreground truncate">
                            {approval.entity_metadata.entity_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{approval.entity_metadata.role || 'Member'}</span>
                            {approval.entity_metadata.is_signatory && (
                              <Badge className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1 py-0">
                                <Shield className="h-2.5 w-2.5 mr-0.5" />
                                Signatory
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                      {approval.entity_type !== 'member_invitation' && approval.related_investor && (
                        <p className="text-xs text-muted-foreground truncate">
                          {approval.related_investor.legal_name}
                        </p>
                      )}
                      {approval.entity_type === 'deal_interest' && approval.requested_by_profile && (
                        <p className="text-xs text-muted-foreground truncate">
                          Requested by {approval.requested_by_profile.display_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(approval.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {columnApprovals.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    No {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
