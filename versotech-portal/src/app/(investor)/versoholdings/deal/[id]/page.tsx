import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RealTimeInventory } from '@/components/deals/real-time-inventory'
import {
  Building2,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer
} from 'lucide-react'

interface DealParticipationPageProps {
  params: { id: string }
}

// Fetch deal data from API
async function fetchDealData(dealId: string) {
  try {
    const response = await fetch(`/api/deals/${dealId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch deal data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching deal:', error)
    return null
  }
}

export default async function DealParticipationPage({ params }: DealParticipationPageProps) {
  // Fetch real deal data
  const dealData = await fetchDealData(params.id)

  if (!dealData) {
    return (
      <AppLayout brand="versoholdings">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal not found</h2>
            <p className="text-gray-600">The requested deal could not be found or you don't have access to it.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const { deal, inventorySummary, reservations, allocations } = dealData

  const utilizationPercent = inventorySummary
    ? parseFloat(inventorySummary.utilization_percent)
    : 0

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-8">

        {/* Deal Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
              <p className="text-lg text-gray-600 mt-1 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {deal.vehicle_name} • {deal.deal_type.replace('_', ' ').toUpperCase()}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {deal.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Closes {new Date(deal.close_date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Share Price</p>
              <p className="text-2xl font-bold">${deal.offer_unit_price}</p>
              <p className="text-sm text-gray-500">{deal.currency}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Deal Details & Inventory */}
          <div className="lg:col-span-2 space-y-6">

            {/* Real-time Inventory */}
            <RealTimeInventory
              dealId={params.id}
              initialData={{
                units_available: inventorySummary?.units_available || deal.units_remaining || 0,
                active_reservations: inventorySummary?.active_reservations || deal.active_reservations || 0,
                utilization_percent: inventorySummary?.utilization_percent || utilizationPercent.toString(),
                total_units: inventorySummary?.total_units || deal.total_units || 0
              }}
            />

            {/* Fee Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Fee Structure</CardTitle>
                <CardDescription>
                  Choose your preferred fee arrangement for this investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deal.fee_plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        plan.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.is_default && (
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                      <div className="space-y-1 text-xs">
                        {plan.components.map((component, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="capitalize">{component.kind} Fee:</span>
                            <span>{(component.rate_bps / 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Commitment Form */}
          <div className="space-y-6">

            {/* Commitment Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Make Commitment
                </CardTitle>
                <CardDescription>
                  Reserve shares and generate your term sheet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Units Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Units</label>
                  <input
                    type="number"
                    placeholder="e.g., 1000"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    max={deal.units_remaining}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {deal.units_remaining.toLocaleString()} units available
                  </p>
                </div>

                {/* Investment Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated: Units × ${deal.offer_unit_price}
                  </p>
                </div>

                {/* Fee Calculation */}
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Fee Breakdown (All-in 5%)</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Investment Amount:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upfront Fee (5%):</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-2">
                      <span>Total Commitment:</span>
                      <span>$0.00</span>
                    </div>
                  </div>
                </div>

                {/* Reservation Timer */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Reservation Hold</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Shares will be held for 30 minutes after commitment
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Commit & Generate Term Sheet
                  </Button>

                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your commitment will require VERSO approval before allocation
                </p>
              </CardContent>
            </Card>

            {/* Status Tracker (if user has existing commitment) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Reserved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Committed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Allocated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Settled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}