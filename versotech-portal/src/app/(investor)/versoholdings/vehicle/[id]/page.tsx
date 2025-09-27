import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Download
} from 'lucide-react'

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: vehicleId } = await params

  // Get current user - AppLayout already handles auth checks
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Authentication required')
  }

  const supabaseUser = {
    id: user.id,
    email: user.email
  }

  // Get vehicle details
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single()

  if (vehicleError || !vehicle) {
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
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .in('investor_id', investorIds)
    .single()

  if (!subscription) {
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
    supabase.from('documents').select('id, type, created_at, created_by').eq('vehicle_id', vehicleId).or(`owner_investor_id.in.(${investorIds.join(',')}),owner_investor_id.is.null`).order('created_at', { ascending: false }),
    supabase.from('positions').select('*').eq('vehicle_id', vehicleId).in('investor_id', investorIds).single(),
    supabase.from('cashflows').select('*').eq('vehicle_id', vehicleId).in('investor_id', investorIds).order('date', { ascending: false })
  ])

  // Process position data
  let positionData = null
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
  const subscriptionData = {
    commitment: subscription.commitment,
    currency: subscription.currency,
    status: subscription.status,
    signedDate: subscription.created_at
  }

  // Process cashflow data
  let cashflowData = null
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

  // Create vehicleData object similar to API response
  const vehicleData = {
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      domicile: vehicle.domicile,
      currency: vehicle.currency,
      created_at: vehicle.created_at
    },
    position: positionData,
    subscription: subscriptionData,
    cashflows: cashflowData,
    valuations: valuations?.map(v => ({
      navTotal: v.nav_total,
      navPerUnit: v.nav_per_unit,
      asOfDate: v.as_of_date
    })) || [],
    capitalCalls: capitalCalls?.map(cc => ({
      id: cc.id,
      name: cc.name,
      callPct: cc.call_pct,
      dueDate: cc.due_date,
      status: cc.status
    })) || [],
    distributions: distributions?.map(d => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      date: d.date,
      classification: d.classification
    })) || [],
    documents: documents?.map(doc => ({
      id: doc.id,
      type: doc.type,
      createdAt: doc.created_at
    })) || []
  }


  // Data is already available from earlier queries

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/versoholdings/holdings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Holdings
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {vehicle.type}
                    </Badge>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{vehicle.domicile}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{vehicle.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Request Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Statement
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {position && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: vehicle.currency || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(position.currentValue)}
                </div>
                {position.unrealizedGainPct !== undefined && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${
                    position.unrealizedGainPct > 0 ? 'text-green-600' : 
                    position.unrealizedGainPct < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {position.unrealizedGainPct > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : position.unrealizedGainPct < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {position.unrealizedGainPct > 0 ? '+' : ''}{position.unrealizedGainPct.toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Units Held</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US').format(position.units)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total shares/units</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Cost Basis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: vehicle.currency || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(position.costBasis)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total invested</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Unrealized Gain/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  position.unrealizedGain > 0 ? 'text-green-600' : 
                  position.unrealizedGain < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {position.unrealizedGain > 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: vehicle.currency || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(position.unrealizedGain)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Mark-to-market</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Investment Summary and Cash Flows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
              <CardDescription>
                Your commitment and funding status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Commitment</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: subscription.currency || 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(subscription.commitment)}
                    </span>
                  </div>
                  {cashflows && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Contributions</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: subscription.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(cashflows.totalContributions)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Distributions</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: subscription.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(cashflows.totalDistributions)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unfunded Commitment</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: subscription.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(cashflows.unfundedCommitment)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subscription Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    {subscription?.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Cash Flows */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cash Flows</CardTitle>
              <CardDescription>
                Latest capital calls and distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashflows && cashflows.history && cashflows.history.length > 0 ? (
                <div className="space-y-3">
                  {cashflows.history.slice(0, 5).map((flow: { type: string; date: string; amount: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-medium capitalize">{flow.type}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(flow.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        flow.type === 'call' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {flow.type === 'call' ? '-' : '+'}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: vehicle.currency || 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(Math.abs(flow.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No cash flow history available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance History */}
        {valuations && valuations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>
                Historical NAV and valuation data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {valuations.slice(0, 10).map((valuation: { asOfDate: string; navPerUnit?: number; navTotal?: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {new Date(valuation.asOfDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">Valuation Date</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${valuation.navPerUnit?.toFixed(3)} per unit
                      </div>
                      {valuation.navTotal && (
                        <div className="text-sm text-gray-500">
                          Total NAV: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: vehicle.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(valuation.navTotal)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>
                Documents specific to this investment vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc: { id: string; type: string; createdAt: string }) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{doc.type}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

                Your commitment and funding status

              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              {subscription && (

                <div className="space-y-3">

                  <div className="flex justify-between">

                    <span className="text-gray-600">Total Commitment</span>

                    <span className="font-semibold">

                      {new Intl.NumberFormat('en-US', {

                        style: 'currency',

                        currency: subscription.currency || 'USD',

                        minimumFractionDigits: 0,

                        maximumFractionDigits: 0

                      }).format(subscription.commitment)}

                    </span>

                  </div>

                  {cashflows && (

                    <>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Contributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalContributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Distributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalDistributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Unfunded Commitment</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.unfundedCommitment)}

                        </span>

                      </div>

                    </>

                  )}

                </div>

              )}

              

              <div className="pt-3 border-t">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Subscription Status</span>

                  <Badge className="bg-green-100 text-green-800">

                    {subscription?.status || 'Active'}

                  </Badge>

                </div>

              </div>

            </CardContent>

          </Card>



          {/* Recent Cash Flows */}

          <Card>

            <CardHeader>

              <CardTitle>Recent Cash Flows</CardTitle>

              <CardDescription>

                Latest capital calls and distributions

              </CardDescription>

            </CardHeader>

            <CardContent>

              {cashflows && cashflows.history && cashflows.history.length > 0 ? (

                <div className="space-y-3">

                  {cashflows.history.slice(0, 5).map((flow: { type: string; date: string; amount: number }, index: number) => (

                    <div key={index} className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className={`w-2 h-2 rounded-full ${

                          flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'

                        }`} />

                        <div>

                          <div className="font-medium capitalize">{flow.type}</div>

                          <div className="text-sm text-gray-500">

                            {new Date(flow.date).toLocaleDateString()}

                          </div>

                        </div>

                      </div>

                      <div className={`font-semibold ${

                        flow.type === 'call' ? 'text-red-600' : 'text-green-600'

                      }`}>

                        {flow.type === 'call' ? '-' : '+'}

                        {new Intl.NumberFormat('en-US', {

                          style: 'currency',

                          currency: vehicle.currency || 'USD',

                          minimumFractionDigits: 0,

                          maximumFractionDigits: 0

                        }).format(Math.abs(flow.amount))}

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="text-center py-6 text-gray-500">

                  No cash flow history available

                </div>

              )}

            </CardContent>

          </Card>

        </div>



        {/* Performance History */}

        {valuations && valuations.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Performance History</CardTitle>

              <CardDescription>

                Historical NAV and valuation data

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {valuations.slice(0, 10).map((valuation: { asOfDate: string; navPerUnit?: number; navTotal?: number }, index: number) => (

                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">

                    <div className="flex items-center gap-3">

                      <Calendar className="h-4 w-4 text-gray-400" />

                      <div>

                        <div className="font-medium">

                          {new Date(valuation.asOfDate).toLocaleDateString()}

                        </div>

                        <div className="text-sm text-gray-500">Valuation Date</div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-semibold">

                        ${valuation.navPerUnit?.toFixed(3)} per unit

                      </div>

                      {valuation.navTotal && (

                        <div className="text-sm text-gray-500">

                          Total NAV: {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: vehicle.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(valuation.navTotal)}

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}



        {/* Documents */}

        {documents && documents.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Related Documents</CardTitle>

              <CardDescription>

                Documents specific to this investment vehicle

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {documents.map((doc: { id: string; type: string; createdAt: string }) => (

                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center gap-3">

                      <FileText className="h-5 w-5 text-gray-400" />

                      <div>

                        <div className="font-medium">{doc.type}</div>

                        <div className="text-sm text-gray-500">

                          {new Date(doc.createdAt).toLocaleDateString()}

                        </div>

                      </div>

                    </div>

                    <Button variant="outline" size="sm">

                      <Download className="h-4 w-4 mr-2" />

                      Download

                    </Button>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}

      </div>

    </AppLayout>

  )

}

                Your commitment and funding status

              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              {subscription && (

                <div className="space-y-3">

                  <div className="flex justify-between">

                    <span className="text-gray-600">Total Commitment</span>

                    <span className="font-semibold">

                      {new Intl.NumberFormat('en-US', {

                        style: 'currency',

                        currency: subscription.currency || 'USD',

                        minimumFractionDigits: 0,

                        maximumFractionDigits: 0

                      }).format(subscription.commitment)}

                    </span>

                  </div>

                  {cashflows && (

                    <>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Contributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalContributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Distributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalDistributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Unfunded Commitment</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.unfundedCommitment)}

                        </span>

                      </div>

                    </>

                  )}

                </div>

              )}

              

              <div className="pt-3 border-t">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Subscription Status</span>

                  <Badge className="bg-green-100 text-green-800">

                    {subscription?.status || 'Active'}

                  </Badge>

                </div>

              </div>

            </CardContent>

          </Card>



          {/* Recent Cash Flows */}

          <Card>

            <CardHeader>

              <CardTitle>Recent Cash Flows</CardTitle>

              <CardDescription>

                Latest capital calls and distributions

              </CardDescription>

            </CardHeader>

            <CardContent>

              {cashflows && cashflows.history && cashflows.history.length > 0 ? (

                <div className="space-y-3">

                  {cashflows.history.slice(0, 5).map((flow: { type: string; date: string; amount: number }, index: number) => (

                    <div key={index} className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className={`w-2 h-2 rounded-full ${

                          flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'

                        }`} />

                        <div>

                          <div className="font-medium capitalize">{flow.type}</div>

                          <div className="text-sm text-gray-500">

                            {new Date(flow.date).toLocaleDateString()}

                          </div>

                        </div>

                      </div>

                      <div className={`font-semibold ${

                        flow.type === 'call' ? 'text-red-600' : 'text-green-600'

                      }`}>

                        {flow.type === 'call' ? '-' : '+'}

                        {new Intl.NumberFormat('en-US', {

                          style: 'currency',

                          currency: vehicle.currency || 'USD',

                          minimumFractionDigits: 0,

                          maximumFractionDigits: 0

                        }).format(Math.abs(flow.amount))}

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="text-center py-6 text-gray-500">

                  No cash flow history available

                </div>

              )}

            </CardContent>

          </Card>

        </div>



        {/* Performance History */}

        {valuations && valuations.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Performance History</CardTitle>

              <CardDescription>

                Historical NAV and valuation data

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {valuations.slice(0, 10).map((valuation: { asOfDate: string; navPerUnit?: number; navTotal?: number }, index: number) => (

                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">

                    <div className="flex items-center gap-3">

                      <Calendar className="h-4 w-4 text-gray-400" />

                      <div>

                        <div className="font-medium">

                          {new Date(valuation.asOfDate).toLocaleDateString()}

                        </div>

                        <div className="text-sm text-gray-500">Valuation Date</div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-semibold">

                        ${valuation.navPerUnit?.toFixed(3)} per unit

                      </div>

                      {valuation.navTotal && (

                        <div className="text-sm text-gray-500">

                          Total NAV: {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: vehicle.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(valuation.navTotal)}

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}



        {/* Documents */}

        {documents && documents.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Related Documents</CardTitle>

              <CardDescription>

                Documents specific to this investment vehicle

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {documents.map((doc: { id: string; type: string; createdAt: string }) => (

                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center gap-3">

                      <FileText className="h-5 w-5 text-gray-400" />

                      <div>

                        <div className="font-medium">{doc.type}</div>

                        <div className="text-sm text-gray-500">

                          {new Date(doc.createdAt).toLocaleDateString()}

                        </div>

                      </div>

                    </div>

                    <Button variant="outline" size="sm">

                      <Download className="h-4 w-4 mr-2" />

                      Download

                    </Button>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}

      </div>

    </AppLayout>

  )

}

                Your commitment and funding status

              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              {subscription && (

                <div className="space-y-3">

                  <div className="flex justify-between">

                    <span className="text-gray-600">Total Commitment</span>

                    <span className="font-semibold">

                      {new Intl.NumberFormat('en-US', {

                        style: 'currency',

                        currency: subscription.currency || 'USD',

                        minimumFractionDigits: 0,

                        maximumFractionDigits: 0

                      }).format(subscription.commitment)}

                    </span>

                  </div>

                  {cashflows && (

                    <>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Contributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalContributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Total Distributions</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.totalDistributions)}

                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-600">Unfunded Commitment</span>

                        <span className="font-semibold">

                          {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: subscription.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(cashflows.unfundedCommitment)}

                        </span>

                      </div>

                    </>

                  )}

                </div>

              )}

              

              <div className="pt-3 border-t">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-600">Subscription Status</span>

                  <Badge className="bg-green-100 text-green-800">

                    {subscription?.status || 'Active'}

                  </Badge>

                </div>

              </div>

            </CardContent>

          </Card>



          {/* Recent Cash Flows */}

          <Card>

            <CardHeader>

              <CardTitle>Recent Cash Flows</CardTitle>

              <CardDescription>

                Latest capital calls and distributions

              </CardDescription>

            </CardHeader>

            <CardContent>

              {cashflows && cashflows.history && cashflows.history.length > 0 ? (

                <div className="space-y-3">

                  {cashflows.history.slice(0, 5).map((flow: { type: string; date: string; amount: number }, index: number) => (

                    <div key={index} className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className={`w-2 h-2 rounded-full ${

                          flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'

                        }`} />

                        <div>

                          <div className="font-medium capitalize">{flow.type}</div>

                          <div className="text-sm text-gray-500">

                            {new Date(flow.date).toLocaleDateString()}

                          </div>

                        </div>

                      </div>

                      <div className={`font-semibold ${

                        flow.type === 'call' ? 'text-red-600' : 'text-green-600'

                      }`}>

                        {flow.type === 'call' ? '-' : '+'}

                        {new Intl.NumberFormat('en-US', {

                          style: 'currency',

                          currency: vehicle.currency || 'USD',

                          minimumFractionDigits: 0,

                          maximumFractionDigits: 0

                        }).format(Math.abs(flow.amount))}

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="text-center py-6 text-gray-500">

                  No cash flow history available

                </div>

              )}

            </CardContent>

          </Card>

        </div>



        {/* Performance History */}

        {valuations && valuations.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Performance History</CardTitle>

              <CardDescription>

                Historical NAV and valuation data

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {valuations.slice(0, 10).map((valuation: { asOfDate: string; navPerUnit?: number; navTotal?: number }, index: number) => (

                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">

                    <div className="flex items-center gap-3">

                      <Calendar className="h-4 w-4 text-gray-400" />

                      <div>

                        <div className="font-medium">

                          {new Date(valuation.asOfDate).toLocaleDateString()}

                        </div>

                        <div className="text-sm text-gray-500">Valuation Date</div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-semibold">

                        ${valuation.navPerUnit?.toFixed(3)} per unit

                      </div>

                      {valuation.navTotal && (

                        <div className="text-sm text-gray-500">

                          Total NAV: {new Intl.NumberFormat('en-US', {

                            style: 'currency',

                            currency: vehicle.currency || 'USD',

                            minimumFractionDigits: 0,

                            maximumFractionDigits: 0

                          }).format(valuation.navTotal)}

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}



        {/* Documents */}

        {documents && documents.length > 0 && (

          <Card>

            <CardHeader>

              <CardTitle>Related Documents</CardTitle>

              <CardDescription>

                Documents specific to this investment vehicle

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {documents.map((doc: { id: string; type: string; createdAt: string }) => (

                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center gap-3">

                      <FileText className="h-5 w-5 text-gray-400" />

                      <div>

                        <div className="font-medium">{doc.type}</div>

                        <div className="text-sm text-gray-500">

                          {new Date(doc.createdAt).toLocaleDateString()}

                        </div>

                      </div>

                    </div>

                    <Button variant="outline" size="sm">

                      <Download className="h-4 w-4 mr-2" />

                      Download

                    </Button>

                  </div>

                ))}

              </div>

            </CardContent>

          </Card>

        )}

      </div>

    </AppLayout>

  )

}
