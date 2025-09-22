import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  FileText,
  TrendingUp,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  Eye,
  Edit,
  Play
} from 'lucide-react'

const mockRequests = [
  {
    id: 'REQ-001',
    title: 'Tax Year 2023 Detailed Breakdown',
    description: 'Need comprehensive tax documentation including K-1s, capital gains breakdown, and foreign tax credits for all vehicles',
    category: 'Tax Documents',
    priority: 'high',
    status: 'open',
    investorName: 'Acme Fund LP',
    investorId: 'inv-001',
    submittedAt: '2024-01-15T14:30:00Z',
    dueDate: '2024-01-20T23:59:59Z',
    assignedTo: 'Sarah Chen',
    estimatedTime: '4-6 hours',
    relatedVehicles: ['VERSO FUND', 'REAL Empire']
  },
  {
    id: 'REQ-002',
    title: 'Monthly Performance Analysis',
    description: 'Request for detailed monthly performance analysis comparing our returns to benchmark indices',
    category: 'Performance Report',
    priority: 'medium',
    status: 'in_progress',
    investorName: 'John Smith',
    investorId: 'inv-002',
    submittedAt: '2024-01-14T11:20:00Z',
    dueDate: '2024-01-18T23:59:59Z',
    assignedTo: 'Michael Rodriguez',
    estimatedTime: '2-3 hours',
    relatedVehicles: ['SPV Delta'],
    linkedWorkflowRun: 'wf-run-001'
  },
  {
    id: 'REQ-003',
    title: 'Contribution History Export',
    description: 'Excel export of all historical capital contributions with dates, amounts, and allocation details',
    category: 'Data Export',
    priority: 'low',
    status: 'ready',
    investorName: 'Global Investments LLC',
    investorId: 'inv-003',
    submittedAt: '2024-01-13T16:45:00Z',
    completedAt: '2024-01-15T10:30:00Z',
    assignedTo: 'Sarah Chen',
    relatedVehicles: ['VERSO FUND', 'REAL Empire', 'SPV Delta'],
    resultDocumentId: 'doc-001'
  },
  {
    id: 'REQ-004',
    title: 'Investment Committee Presentation',
    description: 'Prepare presentation materials for upcoming investment committee meeting including portfolio overview and new opportunities',
    category: 'Presentation',
    priority: 'high',
    status: 'assigned',
    investorName: 'Tech Ventures Fund',
    investorId: 'inv-004',
    submittedAt: '2024-01-12T09:15:00Z',
    dueDate: '2024-01-19T09:00:00Z',
    assignedTo: 'Michael Rodriguez',
    estimatedTime: '6-8 hours',
    relatedVehicles: ['VERSO FUND']
  },
  {
    id: 'REQ-005',
    title: 'Quarterly Newsletter Update',
    description: 'Include our fund performance in the upcoming quarterly investor newsletter',
    category: 'Communication',
    priority: 'medium',
    status: 'closed',
    investorName: 'Maria Rodriguez',
    investorId: 'inv-005',
    submittedAt: '2024-01-10T14:20:00Z',
    completedAt: '2024-01-14T16:00:00Z',
    assignedTo: 'Sarah Chen',
    relatedVehicles: ['REAL Empire']
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'assigned':
      return <User className="h-4 w-4 text-blue-600" />
    case 'in_progress':
      return <Play className="h-4 w-4 text-blue-600" />
    case 'ready':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'closed':
      return <CheckCircle className="h-4 w-4 text-gray-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800'
    case 'assigned':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'ready':
      return 'bg-green-100 text-green-800'
    case 'closed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function RequestsPage() {
  const stats = {
    total: mockRequests.length,
    open: mockRequests.filter(r => r.status === 'open').length,
    inProgress: mockRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
    ready: mockRequests.filter(r => r.status === 'ready').length,
    overdue: mockRequests.filter(r => {
      if (!r.dueDate) return false
      return new Date(r.dueDate) < new Date() && !['ready', 'closed'].includes(r.status)
    }).length
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-600 mt-1">
            Handle investor requests and track processing status
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">All time</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
              <div className="text-sm text-gray-500 mt-1">Need assignment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-500 mt-1">Being worked on</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-gray-500 mt-1">Awaiting delivery</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-500 mt-1">Past due date</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests by ID, title, or investor..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Sort by Due Date
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {mockRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {request.id}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {request.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4">{request.description}</p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">Investor</div>
                        <div className="text-gray-600">{request.investorName}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Submitted</div>
                        <div className="text-gray-600">{new Date(request.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Assigned To</div>
                        <div className="text-gray-600">{request.assignedTo || 'Unassigned'}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Due Date</div>
                        <div className={`${
                          request.dueDate && new Date(request.dueDate) < new Date() 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'No deadline'}
                        </div>
                      </div>
                    </div>

                    {/* Related Vehicles */}
                    {request.relatedVehicles && request.relatedVehicles.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">Related Vehicles</div>
                        <div className="flex gap-1">
                          {request.relatedVehicles.map((vehicle, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {vehicle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status-specific Information */}
                    {request.linkedWorkflowRun && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Play className="h-4 w-4" />
                          <span className="text-sm font-medium">Workflow in progress: {request.linkedWorkflowRun}</span>
                        </div>
                      </div>
                    )}

                    {request.resultDocumentId && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-700">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">Result document ready for delivery</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            View Document
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {request.status === 'open' && (
                      <Button size="sm">
                        Assign
                      </Button>
                    )}
                    {request.status === 'assigned' && (
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start Work
                      </Button>
                    )}
                    {request.status === 'ready' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Deliver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common request management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold">Bulk Assign</div>
                  <div className="text-sm text-gray-500">Assign multiple requests</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold">Generate Report</div>
                  <div className="text-sm text-gray-500">Request status summary</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold">Set Reminders</div>
                  <div className="text-sm text-gray-500">Due date notifications</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold">Export Data</div>
                  <div className="text-sm text-gray-500">Download request list</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}