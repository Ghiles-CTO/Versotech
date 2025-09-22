import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const quickReports = [
  {
    id: 'position-statement',
    name: 'Position Statement',
    description: 'Current holdings across all vehicles with detailed breakdowns',
    icon: FileText,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'performance-report',
    name: 'Performance Report',
    description: 'Return analysis with benchmark comparisons and metrics',
    icon: TrendingUp,
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'cashflow-statement',
    name: 'Cash Flow Statement', 
    description: 'Historical and projected capital movements with timing',
    icon: Calendar,
    estimatedTime: '2-4 minutes'
  }
]

const recentRequests = [
  {
    id: '1',
    name: 'Q4 2024 Position Statement',
    type: 'Position Statement',
    status: 'completed',
    requestedAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:33:00Z'
  },
  {
    id: '2',
    name: 'Annual Performance Analysis',
    type: 'Performance Report',
    status: 'processing',
    requestedAt: '2024-01-14T14:20:00Z',
    estimatedCompletion: '2024-01-14T14:25:00Z'
  },
  {
    id: '3',
    name: 'Tax Year 2023 Summary',
    type: 'Custom Report',
    status: 'failed',
    requestedAt: '2024-01-13T09:15:00Z',
    error: 'Missing tax data for SPV Delta'
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ReportsPage() {
  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Generate custom reports and track your investment performance
          </p>
        </div>

        {/* Quick Report Generation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickReports.map((report) => {
            const Icon = report.icon
            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    {report.name}
                  </CardTitle>
                  <CardDescription>
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {report.estimatedTime}
                    </div>
                    <Button size="sm">
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Custom Report Request */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Report Request</CardTitle>
            <CardDescription>
              Request a custom report with specific parameters and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-title">Report Title</Label>
                <Input 
                  id="report-title"
                  placeholder="e.g., Q1 2024 Tax Summary"
                />
              </div>
              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Input 
                  id="date-range"
                  type="date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description & Requirements</Label>
              <textarea 
                id="description"
                className="w-full mt-1 p-3 border rounded-lg resize-none"
                rows={4}
                placeholder="Describe what specific data and analysis you need in this report..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Options
              </Button>
              <Button>
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Report Requests</CardTitle>
            <CardDescription>
              Track the status of your report generations and downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold">{request.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {request.type}
                        </Badge>
                        <span>•</span>
                        <span>Requested {new Date(request.requestedAt).toLocaleDateString()}</span>
                        {request.status === 'completed' && request.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed {new Date(request.completedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {request.status === 'failed' && request.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {request.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    {request.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {request.status === 'failed' && (
                      <Button variant="outline" size="sm">
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Report Templates</CardTitle>
            <CardDescription>
              Commonly requested report formats you can generate instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Year-End Tax Package</h3>
                    <p className="text-sm text-gray-500">K-1s, capital gains, and tax summaries</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Quarterly Review</h3>
                    <p className="text-sm text-gray-500">Performance summary and portfolio updates</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}