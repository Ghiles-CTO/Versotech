import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone
} from 'lucide-react'

const mockInvestors = [
  {
    id: '1',
    name: 'Acme Fund LP',
    type: 'institutional',
    email: 'contact@acmefund.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 2500000,
    totalContributed: 1800000,
    vehicleCount: 3,
    lastActivity: '2024-01-15',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'United States'
  },
  {
    id: '2', 
    name: 'John Smith',
    type: 'individual',
    email: 'john.smith@email.com',
    kycStatus: 'pending',
    onboardingStatus: 'in_progress',
    totalCommitment: 500000,
    totalContributed: 250000,
    vehicleCount: 1,
    lastActivity: '2024-01-14',
    relationshipManager: 'Michael Rodriguez',
    riskRating: 'medium',
    country: 'United Kingdom'
  },
  {
    id: '3',
    name: 'Global Investments LLC',
    type: 'institutional',
    email: 'investments@global.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 5000000,
    totalContributed: 4200000,
    vehicleCount: 5,
    lastActivity: '2024-01-16',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'Luxembourg'
  },
  {
    id: '4',
    name: 'Tech Ventures Fund',
    type: 'institutional',
    email: 'contact@techventures.com',
    kycStatus: 'review',
    onboardingStatus: 'pending',
    totalCommitment: 1000000,
    totalContributed: 0,
    vehicleCount: 0,
    lastActivity: '2024-01-10',
    relationshipManager: 'Michael Rodriguez',
    riskRating: 'high',
    country: 'Singapore'
  },
  {
    id: '5',
    name: 'Maria Rodriguez',
    type: 'individual',
    email: 'maria.rodriguez@email.com',
    kycStatus: 'completed',
    onboardingStatus: 'active',
    totalCommitment: 750000,
    totalContributed: 600000,
    vehicleCount: 2,
    lastActivity: '2024-01-13',
    relationshipManager: 'Sarah Chen',
    riskRating: 'low',
    country: 'Spain'
  }
]

function getKycStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'review':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getKycStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'review':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function InvestorsPage() {
  const stats = {
    total: mockInvestors.length,
    active: mockInvestors.filter(i => i.onboardingStatus === 'active').length,
    pending: mockInvestors.filter(i => i.kycStatus === 'pending' || i.kycStatus === 'review').length,
    institutional: mockInvestors.filter(i => i.type === 'institutional').length
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investor Management</h1>
            <p className="text-gray-600 mt-1">
              Manage investor accounts, KYC status, and onboarding
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">Registered accounts</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500 mt-1">Fully onboarded</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500 mt-1">Require attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Institutional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.institutional}</div>
              <div className="text-sm text-gray-500 mt-1">Professional investors</div>
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
                    placeholder="Search investors by name, email, or ID..."
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
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Investors</CardTitle>
            <CardDescription>
              Complete list of investors with status and key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvestors.map((investor) => (
                <div key={investor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{investor.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {investor.type}
                          </Badge>
                          {getKycStatusIcon(investor.kycStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {investor.email}
                          </span>
                          <span>•</span>
                          <span>{investor.country}</span>
                          <span>•</span>
                          <span>RM: {investor.relationshipManager}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(investor.totalCommitment)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((investor.totalContributed / investor.totalCommitment) * 100).toFixed(0)}% funded
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Badge className={getKycStatusColor(investor.kycStatus)}>
                          KYC: {investor.kycStatus}
                        </Badge>
                        <Badge className={getRiskColor(investor.riskRating)}>
                          Risk: {investor.riskRating}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/versotech/staff/investors/${investor.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <span className="text-gray-600">
                        <strong>{investor.vehicleCount}</strong> vehicles
                      </span>
                      <span className="text-gray-600">
                        Last activity: <strong>{new Date(investor.lastActivity).toLocaleDateString()}</strong>
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4 mr-1" />
                        KYC Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}