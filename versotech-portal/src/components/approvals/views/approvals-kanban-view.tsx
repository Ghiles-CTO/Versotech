'use client'

import { useState } from 'react'
import { Approval } from '@/types/approvals'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, LayoutGrid, ListFilter, Mail, Shield } from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsKanbanViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
}

type GroupBy = 'status' | 'priority'

const statusColumns = [
  { id: 'pending', title: 'Pending Review', color: 'border-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 'rejected', title: 'Rejected', color: 'border-rose-500', bgColor: 'bg-rose-500/10' }
]

const priorityColumns = [
  { id: 'critical', title: 'Critical Priority', color: 'border-red-500', bgColor: 'bg-red-500/10' },
  { id: 'high', title: 'High Priority', color: 'border-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'medium', title: 'Medium Priority', color: 'border-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'low', title: 'Low Priority', color: 'border-blue-500', bgColor: 'bg-blue-500/10' }
]

const priorityColors = {
  low: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  medium: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  high: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
  critical: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
  cancelled: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300'
}

export function ApprovalsKanbanView({ approvals, onApprovalClick }: ApprovalsKanbanViewProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('status')

  const columns = groupBy === 'status' ? statusColumns : priorityColumns

  return (
    <div className="space-y-4">
      {/* Grouping Controls */}
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span>Group by:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={groupBy === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('status')}
            className={groupBy === 'status' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Status
          </Button>
          <Button
            variant={groupBy === 'priority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('priority')}
            className={groupBy === 'priority' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Priority
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnApprovals = approvals.filter((a) =>
            groupBy === 'status' ? a.status === column.id : a.priority === column.id
          )

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
                            {approval.entity_type.replace(/_/g, ' ')}
                          </Badge>
                          <p className="font-semibold text-sm truncate text-foreground">
                            {approval.entity_type === 'member_invitation'
                              ? approval.entity_metadata?.email || 'Unknown'
                              : (approval.related_deal?.name || approval.related_investor?.legal_name || 'Unknown')}
                          </p>
                        </div>
                        {groupBy === 'status' ? (
                          <Badge className={priorityColors[approval.priority]}>
                            {approval.priority}
                          </Badge>
                        ) : (
                          <Badge className={statusColors[approval.status]}>
                            {approval.status}
                          </Badge>
                        )}
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
