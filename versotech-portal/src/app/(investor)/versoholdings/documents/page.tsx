import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  Shield
} from 'lucide-react'

const mockDocuments = [
  {
    id: '1',
    name: 'Q4 2024 Position Statement',
    type: 'Statement',
    vehicleName: 'VERSO FUND',
    size: '245 KB',
    createdAt: '2024-01-15',
    status: 'Available'
  },
  {
    id: '2',
    name: 'Annual Performance Report 2024',
    type: 'Report',
    vehicleName: 'REAL Empire',
    size: '1.2 MB',
    createdAt: '2024-01-10',
    status: 'Available'
  },
  {
    id: '3',
    name: 'Subscription Agreement',
    type: 'Legal',
    vehicleName: 'SPV Delta',
    size: '890 KB',
    createdAt: '2023-12-20',
    status: 'Available'
  },
  {
    id: '4',
    name: 'NDA - VERSO Holdings',
    type: 'Legal',
    vehicleName: 'General',
    size: '156 KB',
    createdAt: '2023-11-15',
    status: 'Available'
  },
  {
    id: '5',
    name: 'Tax Package K-1 2023',
    type: 'Tax',
    vehicleName: 'VERSO FUND',
    size: '523 KB',
    createdAt: '2024-03-01',
    status: 'Available'
  }
]

function getDocumentIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'statement':
      return '📊'
    case 'report':
      return '📈'
    case 'legal':
      return '📄'
    case 'tax':
      return '🧾'
    default:
      return '📁'
  }
}

export default function DocumentsPage() {
  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-600 mt-1">
            Access your statements, reports, and legal documents
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Statements</div>
              <div className="text-sm text-gray-500">2 documents</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold">Reports</div>
              <div className="text-sm text-gray-500">1 document</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Legal</div>
              <div className="text-sm text-gray-500">2 documents</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🧾</div>
              <div className="font-semibold">Tax</div>
              <div className="text-sm text-gray-500">1 document</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              All documents are automatically watermarked and tracked for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                        <span>•</span>
                        <span>{doc.vehicleName}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Document Security</div>
                <div className="text-sm text-blue-700">
                  All documents are watermarked with your name and download timestamp. 
                  Access is logged for compliance and security purposes.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}