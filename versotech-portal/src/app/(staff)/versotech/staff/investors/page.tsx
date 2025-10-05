import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
  Phone,
  FileText,
  Building2
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
      return <Clock className="h-4 w-4 text-muted-foreground" />
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
      return 'bg-gray-100 text-foreground'
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
      return 'bg-gray-100 text-foreground'
  }
}

export default async function InvestorsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/versotech/login')
  }

  // Fetch real investor data from Supabase
  const { data: investors, error: investorsError } = await supabase
    .from('investors')
    .select(`
      *,
      user_profile:user_id(display_name, email),
      allocations(committed_amount, contributed_amount)
    `)
    .order('created_at', { ascending: false })

  // Use mock data if database query fails or returns no data
  const investorList = investors && investors.length > 0 ? investors.map(inv => ({
    id: inv.id,
    name: inv.legal_name || inv.user_profile?.display_name || 'Unknown',
    type: inv.investor_type || 'individual',
    email: inv.user_profile?.email || '',
    kycStatus: inv.kyc_status || 'pending',
    onboardingStatus: inv.onboarding_status || 'pending',
    totalCommitment: inv.allocations?.reduce((sum: number, a: any) => sum + (a.committed_amount || 0), 0) || 0,
    totalContributed: inv.allocations?.reduce((sum: number, a: any) => sum + (a.contributed_amount || 0), 0) || 0,
    vehicleCount: inv.allocations?.length || 0,
    lastActivity: inv.updated_at || inv.created_at,
    relationshipManager: 'Staff',
    riskRating: inv.risk_rating || 'medium',
    country: inv.country || 'Unknown'
  })) : mockInvestors

  const stats = {
    total: investorList.length,
    active: investorList.filter(i => i.onboardingStatus === 'active').length,
    pending: investorList.filter(i => i.kycStatus === 'pending' || i.kycStatus === 'review').length,
    institutional: investorList.filter(i => i.type === 'institutional').length
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Investor Management</h1>
            <p className="text-muted-foreground mt-1">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground mt-1">Registered accounts</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-sm text-muted-foreground mt-1">Fully onboarded</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-muted-foreground mt-1">Require attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Institutional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.institutional}</div>
              <div className="text-sm text-muted-foreground mt-1">Professional investors</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              {investorList.map((investor) => (
                <div key={investor.id} className="border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-950/30 rounded-lg flex items-center justify-center border border-blue-800">
                        <Users className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{investor.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {investor.type}
                          </Badge>
                          {getKycStatusIcon(investor.kycStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                        <div className="text-sm text-muted-foreground">
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
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{investor.vehicleCount}</strong> vehicles
                      </span>
                      <span className="text-muted-foreground">
                        Last activity: <strong className="text-foreground">{new Date(investor.lastActivity).toLocaleDateString()}</strong>
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