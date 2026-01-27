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
  DollarSign,
  Layers,
  BarChart3,
  Clock,
  Target,
  Info,
  Receipt
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

interface FeeStructure {
  subscriptionFeePercent: number | null
  subscriptionFeeAmount: number | null
  spreadFeeAmount: number | null
  bdFeePercent: number | null
  bdFeeAmount: number | null
  finraFeeAmount: number | null
  managementFeePercent: number | null
  managementFeeAmount: number | null
  managementFeeFrequency: string | null
  performanceFeePercent: number | null
  performanceFeeThreshold: number | null
  totalUpfrontFees: number
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
    redirect('/versotech_main/portfolio')
  }

  if (!vehicle) {
    console.warn('[VehicleDetailPage] Vehicle not found:', vehicleId)
    redirect('/versotech_main/portfolio')
  }

  // Get investor IDs for this user
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  if (!investorLinks || investorLinks.length === 0) {
    redirect('/versotech_main/portfolio')
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
    redirect('/versotech_main/portfolio')
  }

  if (!subscription) {
    console.warn('[VehicleDetailPage] No subscription found for vehicle:', vehicleId, 'investorIds:', investorIds)
    redirect('/versotech_main/portfolio')
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

  // Process fee structure data
  // Use percent if set, otherwise use flat amount (never both)
  const subscriptionFee = subscription.subscription_fee_percent && subscription.commitment
    ? (subscription.subscription_fee_percent / 100) * subscription.commitment
    : (subscription.subscription_fee_amount || 0)

  const totalUpfrontFees =
    subscriptionFee +
    (subscription.spread_fee_amount || 0) +
    (subscription.bd_fee_amount || 0) +
    (subscription.finra_fee_amount || 0)

  const feeStructure: FeeStructure = {
    subscriptionFeePercent: subscription.subscription_fee_percent,
    subscriptionFeeAmount: subscription.subscription_fee_amount,
    spreadFeeAmount: subscription.spread_fee_amount,
    bdFeePercent: subscription.bd_fee_percent,
    bdFeeAmount: subscription.bd_fee_amount,
    finraFeeAmount: subscription.finra_fee_amount,
    managementFeePercent: subscription.management_fee_percent,
    managementFeeAmount: subscription.management_fee_amount,
    managementFeeFrequency: subscription.management_fee_frequency,
    performanceFeePercent: subscription.performance_fee_tier1_percent,
    performanceFeeThreshold: subscription.performance_fee_tier1_threshold,
    totalUpfrontFees: Math.round(totalUpfrontFees)
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
            <Link href="/versotech_main/portfolio">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Holdings
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{vehicle.name}</h1>
                  {vehicle.investment_name && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      {vehicle.investment_name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="capitalize font-medium px-3 py-1">
                      {vehicle.type}
                    </Badge>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{vehicle.domicile}</span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{vehicle.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Key Performance Metrics */}
        {positionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Current Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(positionData.currentValue)}
                </div>
                {positionData.unrealizedGainPct !== undefined && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${positionData.unrealizedGainPct > 0 ? 'text-green-600' :
                    positionData.unrealizedGainPct < 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
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
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Units Held
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatUnits(positionData.units)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total shares/units</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Cost Basis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(positionData.costBasis)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total invested</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Unrealized P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${positionData.unrealizedGain > 0 ? 'text-green-600' :
                  positionData.unrealizedGain < 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                  {positionData.unrealizedGain > 0 ? '+' : ''}
                  {formatCurrency(positionData.unrealizedGain)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Mark-to-market</div>
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
                      <span className="text-gray-600 dark:text-gray-400">Total Commitment</span>
                      <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {formatCurrency(subscriptionData.commitment)}
                      </span>
                    </div>
                    {cashflowData && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Total Contributions</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(cashflowData.totalContributions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Total Distributions</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(cashflowData.totalDistributions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Unfunded Commitment</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(cashflowData.unfundedCommitment)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Subscription Status</span>
                      <Badge className={`${subscriptionData.status === 'active' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                        }`}>
                        {subscriptionData.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 dark:text-gray-400">Signed Date</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                              }`} />
                            <div>
                              <div className="font-medium capitalize text-gray-900 dark:text-gray-100">{flow.type}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
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
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p>No cash flow history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Fee Structure */}
            {(feeStructure.subscriptionFeePercent ||
              feeStructure.subscriptionFeeAmount ||
              feeStructure.spreadFeeAmount ||
              feeStructure.managementFeePercent ||
              feeStructure.performanceFeePercent) && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Fee Structure
                  </CardTitle>
                  <CardDescription>
                    Fees applicable to your investment in this vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upfront Fees */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">Upfront Fees</h4>

                      {(feeStructure.subscriptionFeePercent || feeStructure.subscriptionFeeAmount) && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">Subscription Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {feeStructure.subscriptionFeePercent
                              ? `${feeStructure.subscriptionFeePercent}%`
                              : feeStructure.subscriptionFeeAmount
                                ? formatCurrency(feeStructure.subscriptionFeeAmount)
                                : '—'
                            }
                            {feeStructure.subscriptionFeePercent && subscriptionData.commitment && (
                              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                ({formatCurrency((feeStructure.subscriptionFeePercent / 100) * subscriptionData.commitment)})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {feeStructure.spreadFeeAmount && feeStructure.spreadFeeAmount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">Spread Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.spreadFeeAmount)}</span>
                        </div>
                      )}

                      {feeStructure.bdFeeAmount && feeStructure.bdFeeAmount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">BD Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.bdFeeAmount)}</span>
                        </div>
                      )}

                      {feeStructure.finraFeeAmount && feeStructure.finraFeeAmount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">FINRA Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.finraFeeAmount)}</span>
                        </div>
                      )}

                      {feeStructure.totalUpfrontFees > 0 && (
                        <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-zinc-800 rounded-lg px-3 mt-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">Total Upfront Fees</span>
                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(feeStructure.totalUpfrontFees)}</span>
                        </div>
                      )}
                    </div>

                    {/* Ongoing Fees */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">Ongoing Fees</h4>

                      {(feeStructure.managementFeePercent || feeStructure.managementFeeAmount) && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">Management Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {feeStructure.managementFeePercent
                              ? `${feeStructure.managementFeePercent}%`
                              : feeStructure.managementFeeAmount
                                ? formatCurrency(feeStructure.managementFeeAmount)
                                : '—'
                            }
                            {feeStructure.managementFeeFrequency && (
                              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                ({feeStructure.managementFeeFrequency.replace(/_/g, ' ')})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {feeStructure.performanceFeePercent && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span className="text-gray-600 dark:text-gray-400">Performance Fee (Carry)</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {feeStructure.performanceFeePercent}%
                            {feeStructure.performanceFeeThreshold && (
                              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                (above {feeStructure.performanceFeeThreshold}% hurdle)
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {!feeStructure.managementFeePercent && !feeStructure.managementFeeAmount && !feeStructure.performanceFeePercent && (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <p>No ongoing fees recorded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatUnits(positionData.units)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Units</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${valuations?.[0]?.nav_per_unit?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">NAV per Unit</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                          ${(positionData.costBasis / positionData.units).toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Cost per Unit</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Valuation Methodology</h4>
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p><strong>Valuation Source:</strong> Latest NAV reported by the fund administrator</p>
                            <p className="mt-1"><strong>Frequency:</strong> Monthly/Quarterly basis</p>
                            <p className="mt-1"><strong>Last Updated:</strong> {positionData.lastUpdated ? new Date(positionData.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 dark:border-zinc-700">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                            }`} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {flow.type === 'call' ? 'Capital Call' : 'Distribution'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Ref: {flow.reference}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
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
                      <div key={index} className="flex items-center justify-between p-4 border dark:border-zinc-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(valuation.as_of_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Valuation Date</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            ${valuation.nav_per_unit?.toFixed(3)} per unit
                          </div>
                          {valuation.nav_total && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Total NAV: {formatCurrency(valuation.nav_total)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
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