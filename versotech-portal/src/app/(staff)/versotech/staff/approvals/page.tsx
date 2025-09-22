import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  DollarSign,
  FileText,
  Timer,
  Zap,
  Filter,
  ArrowUpDown
} from 'lucide-react'

interface PendingApproval {
  id: string
  entity_type: string
  entity_id: string
  action: string
  status: string
  priority: string
  notes: string | null
  created_at: string
  requested_by_profile?: {
    display_name: string | null
    email: string | null
  }
  assigned_to_profile?: {
    display_name: string | null
  }
}

interface CommitmentDetails {
  id: string
  deal_id: string
  investor_id: string
  requested_units: number | null
  requested_amount: number | null
  status: string
  created_at: string
  deals?: {
    name: string
    currency: string
    offer_unit_price: number | null
  }
  investors?: {
    legal_name: string
  }
  fee_plans?: {
    name: string
  }
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800', 
  high: 'bg-red-100 text-red-800'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

function ApprovalCard({ 
  approval, 
  commitmentDetails 
}: { 
  approval: PendingApproval,
  commitmentDetails?: CommitmentDetails
}) {
  const isCommitment = approval.entity_type === 'deal_commitment'
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isCommitment ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              {isCommitment ? 'Investment Commitment' : approval.entity_type.replace('_', ' ')}
            </CardTitle>
            <CardDescription>
              Requested by {approval.requested_by_profile?.display_name || 'Unknown User'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[approval.priority as keyof typeof priorityColors]}>
              {approval.priority}
            </Badge>
            <Badge className={statusColors[approval.status as keyof typeof statusColors]}>
              {approval.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isCommitment && commitmentDetails ? (
          <div className="space-y-4">
            {/* Commitment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Deal</div>
                <div className="text-lg">{commitmentDetails.deals?.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Investor</div>
                <div className="text-lg">{commitmentDetails.investors?.legal_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Amount</div>
                <div className="text-lg font-semibold text-green-600">
                  {commitmentDetails.requested_amount ? 
                    `${commitmentDetails.deals?.currency} ${commitmentDetails.requested_amount.toLocaleString()}` :
                    'Amount TBD'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Units</div>
                <div className="text-lg">
                  {commitmentDetails.requested_units?.toLocaleString() || 'Units TBD'}
                </div>
              </div>
            </div>

            {commitmentDetails.fee_plans && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Selected Fee Plan</div>
                <div className="text-sm text-blue-700">{commitmentDetails.fee_plans.name}</div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button size="sm" variant="ghost">
                <FileText className="mr-2 h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Entity: {approval.entity_type} • Action: {approval.action}
            </div>
            {approval.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">{approval.notes}</div>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm">Approve</Button>
              <Button size="sm" variant="outline">Reject</Button>
              <Button size="sm" variant="ghost">Review</Button>
            </div>
          </div>
        )}

        {/* Timing Info */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(approval.created_at).toLocaleDateString()} at {new Date(approval.created_at).toLocaleTimeString()}
          </div>
          <div>
            Assigned to: {approval.assigned_to_profile?.display_name || 'Unassigned'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ApprovalsPage() {
  const supabase = await createClient()
  
  // Get the current user and check permissions
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/versotech/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, title')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  // Get pending approvals
  const { data: approvals, error } = await supabase
    .from('approvals')
    .select(`
      *,
      requested_by_profile:requested_by (
        display_name,
        email
      ),
      assigned_to_profile:assigned_to (
        display_name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true }) // Oldest first (FIFO)

  // Get commitment details for commitment approvals
  const commitmentApprovals = approvals?.filter(a => a.entity_type === 'deal_commitment') || []
  const commitmentIds = commitmentApprovals.map(a => a.entity_id)
  
  let commitmentDetails: CommitmentDetails[] = []
  if (commitmentIds.length > 0) {
    const { data: commitments } = await supabase
      .from('deal_commitments')
      .select(`
        *,
        deals:deal_id (
          name,
          currency,
          offer_unit_price
        ),
        investors:investor_id (
          legal_name
        ),
        fee_plans:selected_fee_plan_id (
          name
        )
      `)
      .in('id', commitmentIds)

    commitmentDetails = commitments || []
  }

  // Calculate summary stats
  const summary = {
    total: approvals?.length || 0,
    highPriority: approvals?.filter(a => a.priority === 'high').length || 0,
    commitments: commitmentApprovals.length,
    assignedToMe: approvals?.filter(a => a.assigned_to === user.id).length || 0
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
            <p className="text-gray-600 mt-1">
              Review and approve pending commitments and requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                Total pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.highPriority}</div>
              <p className="text-xs text-muted-foreground">
                Urgent items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commitments
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.commitments}</div>
              <p className="text-xs text-muted-foreground">
                Investment commitments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assigned to Me
              </CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.assignedToMe}</div>
              <p className="text-xs text-muted-foreground">
                Your queue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {!approvals || approvals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No pending approvals at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* High Priority Section */}
              {summary.highPriority > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-900">High Priority</h2>
                    <Badge className="bg-red-100 text-red-800">{summary.highPriority}</Badge>
                  </div>
                  
                  {approvals
                    .filter(approval => approval.priority === 'high')
                    .map((approval) => {
                      const commitment = commitmentDetails.find(c => c.id === approval.entity_id)
                      return (
                        <ApprovalCard 
                          key={approval.id}
                          approval={approval}
                          commitmentDetails={commitment}
                        />
                      )
                    })}
                </div>
              )}

              {/* Normal Priority Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Pending Review</h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    {summary.total - summary.highPriority}
                  </Badge>
                </div>
                
                {approvals
                  .filter(approval => approval.priority !== 'high')
                  .map((approval) => {
                    const commitment = commitmentDetails.find(c => c.id === approval.entity_id)
                    return (
                      <ApprovalCard 
                        key={approval.id}
                        approval={approval}
                        commitmentDetails={commitment}
                      />
                    )
                  })}
              </div>
            </>
          )}
        </div>

        {/* Bulk Actions */}
        {summary.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bulk Actions
              </CardTitle>
              <CardDescription>
                Process multiple approvals at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve All Normal Priority
                </Button>
                <Button variant="outline">
                  <Timer className="mr-2 h-4 w-4" />
                  Set SLA Reminders
                </Button>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Reassign Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
