'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VehicleSummaryTable } from '@/components/subscriptions/vehicle-summary-table'
import {
  ArrowLeft,
  Building2,
  DollarSign,
  FileText,
  TrendingUp,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

export function VehicleSummaryPageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicleSummary()
  }, [])

  const fetchVehicleSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscriptions/vehicle-summary')
      if (!response.ok) throw new Error('Failed to fetch vehicle summary')

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch vehicle summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      toast.error('Failed to load vehicle summary')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleExport = () => {
    toast.info('Export functionality coming soon')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <Card className="bg-destructive/20 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchVehicleSummary}>Retry</Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vehicle Summary</h1>
              <p className="text-muted-foreground mt-1">
                Aggregated subscription data per vehicle/entity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchVehicleSummary}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Grand Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200 mb-1">Total Vehicles</p>
                  <p className="text-3xl font-bold text-white">
                    {data.total_vehicles}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    {data.grand_totals.total_subscriptions} subscriptions
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-200 mb-1">Total Commitment</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.grand_totals.total_commitment)}
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    Outstanding: {formatCurrency(data.grand_totals.total_outstanding)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-200 mb-1">Total Funded</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.grand_totals.total_funded)}
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    {((data.grand_totals.total_funded / data.grand_totals.total_commitment) * 100).toFixed(1)}% funded
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-200 mb-1">Total Fees</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(
                      (data.grand_totals.total_subscription_fees || 0) +
                      (data.grand_totals.total_bd_fees || 0) +
                      (data.grand_totals.total_finra_fees || 0) +
                      (data.grand_totals.total_spread_fees || 0)
                    )}
                  </p>
                  <p className="text-xs text-orange-300 mt-1">
                    All subscription fees
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-200 mb-1">Capital Calls</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.grand_totals.total_capital_calls || 0)}
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    Total called
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-300 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-200 mb-1">Distributions</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.grand_totals.total_distributions || 0)}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">
                    Total distributed
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-200 mb-1">Total NAV</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.grand_totals.total_nav || 0)}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">
                    Current net asset value
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-200 mb-1">Total Shares</p>
                  <p className="text-3xl font-bold text-white">
                    {(data.grand_totals.total_shares || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-indigo-300 mt-1">
                    Across all vehicles
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-indigo-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <VehicleSummaryTable summaries={data.summaries} />
      </div>
    </div>
  )
}
