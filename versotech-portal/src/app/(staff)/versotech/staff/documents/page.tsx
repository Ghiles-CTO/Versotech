import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  FileText,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Share,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Folder,
  Plus
} from 'lucide-react'

const mockDocuments = [
  {
    id: 'doc-001',
    name: 'Q4-2024-Position-Statement.pdf',
    category: 'Position Statements',
    type: 'Generated Report',
    size: '2.4 MB',
    createdAt: '2024-01-15T16:45:00Z',
    createdBy: 'System (Automated)',
    status: 'ready',
    investors: ['Acme Fund LP'],
    description: 'Automated position statement for Q4 2024',
    tags: ['quarterly', 'automated', 'position-statement']
  },
  {
    id: 'doc-002', 
    name: 'NDA-TechVentures-2024.pdf',
    category: 'Legal Documents',
    type: 'NDA',
    size: '156 KB',
    createdAt: '2024-01-15T11:20:00Z',
    createdBy: 'Michael Rodriguez',
    status: 'pending_signature',
    investors: ['Tech Ventures Fund'],
    description: 'Standard NDA for new investor onboarding',
    tags: ['nda', 'legal', 'onboarding']
  },
  {
    id: 'doc-003',
    name: 'Annual-Tax-Summary-2023.pdf',
    category: 'Tax Documents',
    type: 'Tax Summary',
    size: '1.8 MB',
    createdAt: '2024-01-12T14:30:00Z',
    createdBy: 'Sarah Chen',
    status: 'delivered',
    investors: ['Global Investments LLC', 'Maria Rodriguez'],
    description: 'Comprehensive tax summary for 2023 tax year',
    tags: ['tax', 'annual', 'summary']
  },
  {
    id: 'doc-004',
    name: 'Vehicle-Setup-SPV-Delta.pdf',
    category: 'Vehicle Documents',
    type: 'Legal Structure',
    size: '3.2 MB',
    createdAt: '2024-01-10T09:15:00Z',
    createdBy: 'Michael Rodriguez',
    status: 'under_review',
    investors: ['Tech Ventures Fund'],
    description: 'Legal documentation for SPV Delta establishment',
    tags: ['spv', 'vehicle', 'legal']
  },
  {
    id: 'doc-005',
    name: 'Monthly-Newsletter-Jan-2024.pdf',
    category: 'Communications',
    type: 'Newsletter',
    size: '1.1 MB',
    createdAt: '2024-01-08T16:00:00Z',
    createdBy: 'Sarah Chen',
    status: 'published',
    investors: ['All Investors'],
    description: 'Monthly investor newsletter for January 2024',
    tags: ['newsletter', 'monthly', 'communication']
  },
  {
    id: 'doc-006',
    name: 'KYC-Documentation-JohnSmith.pdf',
    category: 'KYC Documents',
    type: 'KYC Package',
    size: '4.7 MB',
    createdAt: '2024-01-07T10:30:00Z',
    createdBy: 'System (Upload)',
    status: 'processing',
    investors: ['John Smith'],
    description: 'Complete KYC documentation package',
    tags: ['kyc', 'compliance', 'individual']
  }
]

const documentCategories = [
  'All Documents',
  'Position Statements',
  'Legal Documents', 
  'Tax Documents',
  'Vehicle Documents',
  'Communications',
  'KYC Documents'
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'ready':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'pending_signature':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-blue-600" />
    case 'under_review':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case 'published':
      return <CheckCircle className="h-4 w-4 text-purple-600" />
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ready':
      return 'bg-green-100 text-green-800'
    case 'pending_signature':
      return 'bg-yellow-100 text-yellow-800'
    case 'delivered':
      return 'bg-blue-100 text-blue-800'
    case 'under_review':
      return 'bg-orange-100 text-orange-800'
    case 'published':
      return 'bg-purple-100 text-purple-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function StaffDocumentsPage() {
  const stats = {
    total: mockDocuments.length,
    pending: mockDocuments.filter(d => ['pending_signature', 'under_review', 'processing'].includes(d.status)).length,
    ready: mockDocuments.filter(d => d.status === 'ready').length,
    delivered: mockDocuments.filter(d => d.status === 'delivered').length
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-1">
              Manage investor documents, reports, and automated generation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">In system</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500 mt-1">Need attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ready for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-gray-500 mt-1">Awaiting send</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
              <div className="text-sm text-gray-500 mt-1">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filters, and Categories */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents by name, type, or investor..."
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
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {documentCategories.map((category, index) => (
                  <Button 
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {mockDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{document.name}</h3>
                        {getStatusIcon(document.status)}
                        <Badge className={getStatusColor(document.status)}>
                          {document.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-3">{document.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Category</div>
                          <div className="text-gray-600">{document.category}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Type</div>
                          <div className="text-gray-600">{document.type}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Size</div>
                          <div className="text-gray-600">{document.size}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Created</div>
                          <div className="text-gray-600">{new Date(document.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Created by:</span>
                          <span className="text-gray-600 ml-1">{document.createdBy}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Investors:</span>
                          <span className="text-gray-600 ml-1">{document.investors.join(', ')}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex gap-1">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {document.status === 'ready' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Send to Investor
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
            <CardTitle>Quick Document Actions</CardTitle>
            <CardDescription>
              Common document generation and management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Position Statement
                  </div>
                  <div className="text-sm text-gray-500">Create investor position report</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Bulk Document Send
                  </div>
                  <div className="text-sm text-gray-500">Send documents to multiple investors</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Reports
                  </div>
                  <div className="text-sm text-gray-500">Automate periodic reporting</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Archive Management
                  </div>
                  <div className="text-sm text-gray-500">Manage document retention</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}