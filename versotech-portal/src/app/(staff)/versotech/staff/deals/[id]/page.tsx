import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Building2,
  Handshake,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Timer,
  CircleDollarSign,
  Package,
  UserCheck,
  Settings,
  Activity,
  Eye
} from 'lucide-react'
import { redirect } from 'next/navigation'

interface DealDetail {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  created_at: string
  vehicles?: {
    id: string
    name: string
    type: string
    currency: string
  }
  deal_memberships: Array<{
    user_id: string
    role: string
    invited_at: string
    accepted_at: string | null
    profiles?: {
      display_name: string | null
      email: string | null
    }
    investors?: {
      legal_name: string
    }
  }>
  fee_plans: Array<{
    id: string
    name: string
    description: string | null
    is_default: boolean
  }>
  share_lots: Array<{
    id: string
    units_total: number
    unit_cost: number
    units_remaining: number
    status: string
    acquired_at: string | null
    share_sources?: {
      kind: string
      counterparty_name: string | null
    }
  }>
}

const dealTypeLabels = {
  equity_secondary: 'Secondary Equity',
  equity_primary: 'Primary Equity',
  credit_trade_finance: 'Credit & Trade Finance',
  other: 'Other'
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  allocation_pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}

const roleLabels = {
  investor: 'Investor',
  co_investor: 'Co-Investor',
  spouse: 'Spouse',
  advisor: 'Advisor',
  lawyer: 'Lawyer',
  banker: 'Banker',
  introducer: 'Introducer',
  viewer: 'Viewer',
  verso_staff: 'VERSO Staff'
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
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

  // Fetch deal details
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        id,
        name,
        type,
        currency
      ),
      deal_memberships (
        user_id,
        role,
        invited_at,
        accepted_at,
        profiles:user_id (
          display_name,
          email
        ),
        investors:investor_id (
          legal_name
        )
      ),
      fee_plans (
        id,
        name,
        description,
        is_default
      ),
      share_lots (
        id,
        units_total,
        unit_cost,
        units_remaining,
        status,
        acquired_at,
        share_sources:source_id (
          kind,
          counterparty_name
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !deal) {
    redirect('/versotech/staff/deals')
  }

  const dealData: DealDetail = deal

  // Get inventory summary
  const { data: inventorySummary } = await supabase
    .rpc('fn_deal_inventory_summary', { p_deal_id: params.id })
    .single()

  // Get recent reservations
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id,
      investor_id,
      requested_units,
      proposed_unit_price,
      status,
      expires_at,
      created_at,
      investors:investor_id (
        legal_name
      )
    `)
    .eq('deal_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent allocations
  const { data: allocations } = await supabase
    .from('allocations')
    .select(`
      id,
      investor_id,
      units,
      unit_price,
      status,
      approved_at,
      investors:investor_id (
        legal_name
      )
    `)
    .eq('deal_id', params.id)
    .order('approved_at', { ascending: false })
    .limit(5)

  // Calculate totals
  const totalInventoryValue = dealData.share_lots.reduce((sum, lot) => 
    sum + (lot.units_total * lot.unit_cost), 0
  )

  const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0
  const membersByRole = dealData.deal_memberships.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech/staff/deals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Deals
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{dealData.name}</h1>
                <Badge className={statusColors[dealData.status as keyof typeof statusColors]}>
                  {dealData.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {dealTypeLabels[dealData.deal_type as keyof typeof dealTypeLabels]}
                </Badge>
              </div>
              <p className="text-gray-600">
                {dealData.vehicles ? 
                  `${dealData.vehicles.name} (${dealData.vehicles.type})` : 
                  'Direct investment opportunity'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button>
              <UserCheck className="mr-2 h-4 w-4" />
              Invite Participants
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealData.deal_memberships.length}</div>
              <p className="text-xs text-muted-foreground">
                {membersByRole.investor || 0} investors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Units
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventorySummary?.available_units?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {inventorySummary?.total_units?.toLocaleString() || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Offer Price
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dealData.offer_unit_price ? 
                  `${dealData.currency} ${dealData.offer_unit_price.toFixed(2)}` : 
                  'TBD'
                }
              </div>
              <p className="text-xs text-muted-foreground">per unit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Actions
              </CardTitle>
              <Timer className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReservations}</div>
              <p className="text-xs text-muted-foreground">reservations awaiting</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Inventory & Allocations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Inventory & Allocations
              </CardTitle>
              <CardDescription>
                Available share lots and reservation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Inventory Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-800">
                      {inventorySummary?.total_units?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-blue-600">Total Units</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {inventorySummary?.available_units?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-green-600">Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {inventorySummary?.reserved_units?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-yellow-600">Reserved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-800">
                      {inventorySummary?.allocated_units?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-purple-600">Allocated</div>
                  </div>
                </div>
              </div>

              {/* Share Lots */}
              <div className="space-y-3">
                <h4 className="font-medium">Share Lots</h4>
                {dealData.share_lots.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No share lots configured yet</p>
                ) : (
                  dealData.share_lots.map((lot) => (
                    <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {lot.units_total.toLocaleString()} units
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {lot.share_sources?.kind || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Cost: {dealData.currency} {lot.unit_cost.toFixed(2)} • 
                          Available: {lot.units_remaining.toLocaleString()} • 
                          From: {lot.share_sources?.counterparty_name || 'N/A'}
                        </div>
                      </div>
                      <Badge className={lot.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {lot.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deal Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
              <CardDescription>
                Deal members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dealData.deal_memberships.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {member.profiles?.display_name || 
                         member.investors?.legal_name || 
                         member.profiles?.email ||
                         'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {roleLabels[member.role as keyof typeof roleLabels]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.accepted_at ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Users className="mr-2 h-4 w-4" />
                  Invite More Participants
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Recent Reservations
              </CardTitle>
              <CardDescription>
                Latest inventory reservations requiring action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reservations && reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {reservation.investors?.legal_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reservation.requested_units.toLocaleString()} units @ {dealData.currency} {reservation.proposed_unit_price}
                        </p>
                      </div>
                      <Badge className={
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {reservation.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-4">No reservations yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Plans
              </CardTitle>
              <CardDescription>
                Available fee structures for investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dealData.fee_plans.length > 0 ? (
                  dealData.fee_plans.map((plan) => (
                    <div key={plan.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{plan.name}</span>
                        {plan.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-4">No fee plans configured yet</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Activity Log
          </Button>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Manage Allocations
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
