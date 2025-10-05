import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Filter,
  Download
} from 'lucide-react'

// Fetch approval data from API
async function fetchApprovalData() {
  try {
    const response = await fetch('/api/approvals?status=pending', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch approval data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return {
      approvals: [],
      counts: { pending: 0, approved: 0, rejected: 0 },
      hasData: false
    }
  }
}

function getTimeUntilSLA(slaDate: string): { text: string; isOverdue: boolean; urgency: 'low' | 'medium' | 'high' } {
  const now = new Date()
  const sla = new Date(slaDate)
  const diffMs = sla.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 0) {
    return { text: `${Math.abs(diffHours)}h overdue`, isOverdue: true, urgency: 'high' }
  } else if (diffHours < 4) {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'high' }
  } else if (diffHours < 12) {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'medium' }
  } else {
    return { text: `${diffHours}h remaining`, isOverdue: false, urgency: 'low' }
  }
}

export default async function ApprovalsPage() {
  // Fetch real approval data
  const { approvals, counts, hasData } = await fetchApprovalData()

  const stats = {
    total_pending: counts.pending,
    overdue_count: 0, // TODO: Calculate from approval data
    avg_processing_time_hours: 18.5 // TODO: Calculate from historical data
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-8">

        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Approval Queue</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Review and approve investor commitments and allocations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

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
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.avg_processing_time_hours}h</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Review investor commitments and take approval actions
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Bulk Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Bulk Approve
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <XCircle className="mr-2 h-4 w-4" />
                  Bulk Reject
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableHead>
                    <TableHead>Request Type / User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>SLA Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals && approvals.length > 0 ? approvals.map((approval) => {
                    // Calculate SLA status if we have a deadline
                    const slaStatus = approval.sla_breach_at
                      ? getTimeUntilSLA(approval.sla_breach_at)
                      : { text: 'No SLA', isOverdue: false, urgency: 'low' as const }

                    return (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <input type="checkbox" className="rounded border-gray-300" />
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{approval.entity_type.replace('_', ' ').toUpperCase()}</div>
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
                            <div className="font-medium text-foreground">Entity ID</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {approval.entity_id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={approval.priority === 'high' ? 'destructive' : 'secondary'}>
                            {approval.priority.toUpperCase()}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              slaStatus.isOverdue ? 'destructive' :
                              slaStatus.urgency === 'high' ? 'destructive' :
                              slaStatus.urgency === 'medium' ? 'default' : 'secondary'
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
                            <Button variant="outline" size="sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Approve All Under $10K
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                Review Overdue Items
              </Button>
              <Button className="w-full justify-start" variant="outline">
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
                  <span className="font-medium text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overdue items</span>
                  <span className="font-medium text-red-600">{stats.overdue_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average processing</span>
                  <span className="font-medium">{stats.avg_processing_time_hours}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  )
}