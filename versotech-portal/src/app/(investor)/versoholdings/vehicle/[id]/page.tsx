import { AppLayout } from '@/components/layout/app-layout'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VehicleDocumentsList } from '@/components/holdings/vehicle-documents-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  DollarSign,
  Layers,
  MessageSquare,
  BarChart3,
  Clock,
  Users,
  Target,
  Info
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Position {
  units: number
  costBasis: number
  currentValue: number
  unrealizedGain: number
  unrealizedGainPct: number
  lastUpdated?: string
}

interface Subscription {
  commitment: number
  currency: string
  status: string
  signedDate: string
}

interface CashflowData {
  totalContributions: number
  totalDistributions: number
  unfundedCommitment: number
  history: Array<{
    type: string
    amount: number
    date: string
    reference?: string
  }>
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: vehicleId } = await params

  // Get current user - AppLayout already handles auth checks
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  // Get vehicle details
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .maybeSingle()

  if (vehicleError) {
    console.error('[VehicleDetailPage] Vehicle query error:', vehicleError)
    redirect('/versoholdings/holdings')
  }

  if (!vehicle) {
    console.warn('[VehicleDetailPage] Vehicle not found:', vehicleId)
    redirect('/versoholdings/holdings')
  }

  // Get investor IDs for this user
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    redirect('/versoholdings/holdings')
  }

  const investorIds = investorLinks.map(link => link.investor_id)

  // Check if investor has access to this vehicle
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .in('investor_id', investorIds)
    .maybeSingle()

  if (subscriptionError) {
    console.error('[VehicleDetailPage] Subscription query error:', subscriptionError)
    redirect('/versoholdings/holdings')
  }

  if (!subscription) {
    console.warn('[VehicleDetailPage] No subscription found for vehicle:', vehicleId, 'investorIds:', investorIds)
    redirect('/versoholdings/holdings')
  }

  // Get additional data
  const [
    { data: valuations },
    { data: capitalCalls },
    { data: distributions },
    { data: documents },
    { data: position },
    { data: cashflows }
  ] = await Promise.all([
    supabase.from('valuations').select('*').eq('vehicle_id', vehicleId).order('as_of_date', { ascending: false }),
    supabase.from('capital_calls').select('*').eq('vehicle_id', vehicleId).order('due_date', { ascending: false }),
    supabase.from('distributions').select('*').eq('vehicle_id', vehicleId).order('date', { ascending: false }),
    supabase.from('documents').select('id, name, type, file_key, status, is_published, created_at, created_by, vehicle_id, owner_investor_id, deal_id').eq('is_published', true).eq('vehicle_id', vehicleId).order('created_at', { ascending: false }),
    supabase.from('positions').select('*').eq('vehicle_id', vehicleId).in('investor_id', investorIds).maybeSingle(),
    supabase.from('cashflows').select('*').eq('vehicle_id', vehicleId).in('investor_id', investorIds).order('date', { ascending: false })
  ])

  // Process position data
  let positionData: Position | null = null
  if (position) {
    const latestValuation = valuations?.[0]
    const currentValue = position.units * (latestValuation?.nav_per_unit || position.last_nav || 0)
    const unrealizedGain = currentValue - (position.cost_basis || 0)
    const unrealizedGainPct = position.cost_basis > 0 ? (unrealizedGain / position.cost_basis) * 100 : 0

    positionData = {
      units: position.units,
      costBasis: position.cost_basis,
      currentValue: Math.round(currentValue),
      unrealizedGain: Math.round(unrealizedGain),
      unrealizedGainPct: Math.round(unrealizedGainPct * 100) / 100,
      lastUpdated: position.as_of_date
    }
  }

  // Process subscription data
  const subscriptionData: Subscription = {
    commitment: subscription.commitment,
    currency: subscription.currency,
    status: subscription.status,
    signedDate: subscription.created_at
  }

  // Process cashflow data
  let cashflowData: CashflowData | null = null
  if (cashflows) {
    const contributions = cashflows
      .filter(cf => cf.type === 'call')
      .reduce((sum, cf) => sum + (cf.amount || 0), 0)

    const distributionsReceived = cashflows
      .filter(cf => cf.type === 'distribution')
      .reduce((sum, cf) => sum + (cf.amount || 0), 0)

    cashflowData = {
      totalContributions: Math.round(contributions),
      totalDistributions: Math.round(distributionsReceived),
      unfundedCommitment: Math.round(Math.max(0, (subscriptionData?.commitment || 0) - contributions)),
      history: cashflows.map(cf => ({
        type: cf.type,
        amount: cf.amount,
        date: cf.date,
        reference: cf.ref_id
      }))
    }
  }

  // Format currency helper
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: vehicle.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

  const formatUnits = (units: number) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(units)

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/versoholdings/holdings">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Holdings
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                  {vehicle.logo_url ? (
                    <Image
                      src={vehicle.logo_url}
                      alt={vehicle.investment_name || vehicle.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
                  {vehicle.investment_name && (
                    <p className="text-lg text-gray-600 mt-1 font-medium">
                      {vehicle.investment_name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="capitalize font-medium px-3 py-1">
                      {vehicle.type}
                    </Badge>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-medium">{vehicle.domicile}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-medium">{vehicle.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Position Statement
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Documents
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        {positionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Current Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(positionData.currentValue)}
                </div>
                {positionData.unrealizedGainPct !== undefined && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${positionData.unrealizedGainPct > 0 ? 'text-green-600' :
                    positionData.unrealizedGainPct < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                    {positionData.unrealizedGainPct > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : positionData.unrealizedGainPct < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    {positionData.unrealizedGainPct > 0 ? '+' : ''}{positionData.unrealizedGainPct.toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Units Held
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatUnits(positionData.units)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Total shares/units</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Cost Basis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(positionData.costBasis)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Total invested</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Unrealized P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${positionData.unrealizedGain > 0 ? 'text-green-600' :
                  positionData.unrealizedGain < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                  {positionData.unrealizedGain > 0 ? '+' : ''}
                  {formatCurrency(positionData.unrealizedGain)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Mark-to-market</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Tabs Layout */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="cashflows">Cash Flows</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Summary */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Investment Summary
                  </CardTitle>
                  <CardDescription>
                    Your commitment and funding status for this vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Commitment</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(subscriptionData.commitment)}
                      </span>
                    </div>
                    {cashflowData && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Contributions</span>
                          <span className="font-semibold">
                            {formatCurrency(cashflowData.totalContributions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Distributions</span>
                          <span className="font-semibold">
                            {formatCurrency(cashflowData.totalDistributions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Unfunded Commitment</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(cashflowData.unfundedCommitment)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subscription Status</span>
                      <Badge className={`${subscriptionData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {subscriptionData.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Signed Date</span>
                      <span className="text-sm text-gray-500">
                        {new Date(subscriptionData.signedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Recent Cash Flows
                  </CardTitle>
                  <CardDescription>
                    Latest capital calls and distributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cashflowData && cashflowData.history && cashflowData.history.length > 0 ? (
                    <div className="space-y-4">
                      {cashflowData.history.slice(0, 5).map((flow, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                              }`} />
                            <div>
                              <div className="font-medium capitalize">{flow.type}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(flow.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className={`font-semibold ${flow.type === 'call' ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {flow.type === 'call' ? '-' : '+'}
                            {formatCurrency(Math.abs(flow.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No cash flow history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Position Tab */}
          <TabsContent value="position" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  Position Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed unit-level position information and cost basis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positionData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatUnits(positionData.units)}</div>
                        <div className="text-sm text-gray-600">Total Units</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${valuations?.[0]?.nav_per_unit?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">NAV per Unit</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          ${(positionData.costBasis / positionData.units).toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600">Cost per Unit</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Valuation Methodology</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p><strong>Valuation Source:</strong> Latest NAV reported by the fund administrator</p>
                            <p className="mt-1"><strong>Frequency:</strong> Monthly/Quarterly basis</p>
                            <p className="mt-1"><strong>Last Updated:</strong> {positionData.lastUpdated ? new Date(positionData.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No position data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flows Tab */}
          <TabsContent value="cashflows" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Complete Cash Flow History
                </CardTitle>
                <CardDescription>
                  All capital calls and distributions for this investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cashflowData && cashflowData.history && cashflowData.history.length > 0 ? (
                  <div className="space-y-3">
                    {cashflowData.history.map((flow, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                            }`} />
                          <div>
                            <div className="font-medium">
                              {flow.type === 'call' ? 'Capital Call' : 'Distribution'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(flow.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold text-lg ${flow.type === 'call' ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {flow.type === 'call' ? '-' : '+'}
                            {formatCurrency(Math.abs(flow.amount))}
                          </div>
                          {flow.reference && (
                            <div className="text-xs text-gray-400">
                              Ref: {flow.reference}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No cash flow history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Performance History
                </CardTitle>
                <CardDescription>
                  Historical NAV and valuation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {valuations && valuations.length > 0 ? (
                  <div className="space-y-4">
                    {valuations.slice(0, 10).map((valuation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {new Date(valuation.as_of_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">Valuation Date</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            ${valuation.nav_per_unit?.toFixed(3)} per unit
                          </div>
                          {valuation.nav_total && (
                            <div className="text-sm text-gray-500">
                              Total NAV: {formatCurrency(valuation.nav_total)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No performance history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <VehicleDocumentsList documents={documents || []} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}