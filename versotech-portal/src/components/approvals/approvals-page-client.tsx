'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { Approval, ApprovalStats, SLAStatus } from '@/types/approvals'
import { ApprovalActionDialog } from './approval-action-dialog'
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

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null)

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      const response = await fetch('/api/approvals?status=pending')
      if (!response.ok) throw new Error('Failed to fetch approvals')

      const data = await response.json()
      setApprovals(data.approvals || [])
      setStats(data.stats || initialStats)
      setCounts(data.counts || initialCounts)
    } catch (error) {
      console.error('Error refreshing approvals:', error)
      toast.error('Failed to refresh approvals data')
    }
  }, [initialStats, initialCounts])

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
    refreshData()
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
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Review investor commitments and take approval actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Type / User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>SLA Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals && approvals.length > 0 ? (
                    approvals.map((approval) => {
                      const slaStatus = calculateSLAStatus(approval.sla_breach_at)

                      return (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">
                                {approval.entity_type.replace(/_/g, ' ').toUpperCase()}
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
                              {approval.entity_metadata?.requested_amount && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  ${parseFloat(approval.entity_metadata.requested_amount).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                approval.priority === 'critical' || approval.priority === 'high'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {approval.priority.toUpperCase()}
                            </Badge>
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
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pending approvals found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 1-{approvals?.length || 0} of {stats.total_pending} approvals
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Approve All Under $10K
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                Review Overdue Items
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                Escalate High Priority
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

      {/* Approval Action Dialog */}
      <ApprovalActionDialog
        approval={selectedApproval}
        action={dialogAction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleActionSuccess}
      />
    </>
  )
}
