import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  Building2,
  Handshake,
  AlertCircle,
  CheckCircle2,
  Timer,
  CircleDollarSign
} from 'lucide-react'
import { redirect } from 'next/navigation'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  created_at: string
  vehicles?: {
    name: string
    type: string
  }
  deal_memberships: any[]
  _inventory_summary?: {
    total_units: number
    available_units: number
    reserved_units: number
    allocated_units: number
  }
}

const dealTypeLabels = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

const statusColors = {
  draft: 'bg-gray-100 text-foreground',
  open: 'bg-green-100 text-green-800',
  allocation_pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default async function DealsPage() {
  const supabase = await createClient()
  
  // Get the current user and check permissions
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/versotech/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    redirect('/versotech/login')
  }

  // Fetch deals data
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        name,
        type
      ),
      deal_memberships (
        user_id,
        role
      )
    `)
    .order('created_at', { ascending: false })

  const dealsData: Deal[] = deals || []

  // Calculate summary statistics
  const summary = {
    total: dealsData.length,
    open: dealsData.filter(d => d.status === 'open').length,
    draft: dealsData.filter(d => d.status === 'draft').length,
    closed: dealsData.filter(d => d.status === 'closed').length,
    totalValue: dealsData.reduce((sum, deal) => {
      const price = deal.offer_unit_price || 0
      return sum + price * 1000 // Approximate based on typical deal sizes
    }, 0)
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Deal Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage deal-scoped opportunities, inventory, and investor access
            </p>
          </div>
          <Button asChild>
            <Link href="/versotech/staff/deals/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Deals
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{summary.open}</span> open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft Deals
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.draft}</div>
              <p className="text-xs text-muted-foreground">
                Pending setup
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Pipeline
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.open}</div>
              <p className="text-xs text-muted-foreground">
                Accepting investors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.closed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully closed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
            <CardDescription>
              Manage opportunities with deal-scoped collaboration and inventory tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dealsData.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No deals yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first deal opportunity</p>
                <Button asChild>
                  <Link href="/versotech/staff/deals/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Deal
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dealsData.map((deal) => (
                  <div key={deal.id} className="border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/versotech/staff/deals/${deal.id}`}
                            className="text-lg font-semibold text-blue-400 hover:text-blue-300"
                          >
                            {deal.name}
                          </Link>
                          <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
                            {deal.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                          </Badge>
                        </div>

                        {deal.vehicles && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <Building2 className="inline h-4 w-4 mr-1" />
                            {deal.vehicles.name} ({deal.vehicles.type})
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="text-muted-foreground">{deal.deal_memberships.length} participants</span>
                          </div>

                          {deal.offer_unit_price && (
                            <div className="flex items-center gap-1">
                              <CircleDollarSign className="h-4 w-4" />
                              <span className="text-muted-foreground">{deal.currency} {deal.offer_unit_price.toFixed(2)}/unit</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-muted-foreground">{new Date(deal.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/versotech/staff/deals/${deal.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Handshake className="h-5 w-5" />
                Deal Setup
              </CardTitle>
              <CardDescription>
                Create and configure new investment opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/versotech/staff/deals/new">
                  Set Up New Deal
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Manage share lots and allocation tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Track available units across all active deals
              </p>
              <Button variant="outline" className="w-full">
                View Inventory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="h-5 w-5" />
                Approvals Queue
              </CardTitle>
              <CardDescription>
                Review pending commitments and allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Process investor commitments and reservations
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/versotech/staff/approvals">
                  Review Approvals
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}


























