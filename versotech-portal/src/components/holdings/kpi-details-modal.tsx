'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  TrendingUp,
  TrendingDown,
  Building2,
  HandCoins,
  Banknote,
  BarChart3,
  Calendar,
  Users,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Simple Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
)

// Simple ScrollArea replacement
const ScrollArea = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("overflow-y-auto", className)}>
    {children}
  </div>
)

interface KPIDetail {
  id: string
  name: string
  type: string
  value: number
  percentage: number
  metadata: {
    units?: number
    nav_per_unit?: number
    cost_basis?: number
    last_valuation_date?: string
    commitment?: number
    currency?: string
    contribution_count?: number
    last_contribution_date?: string
    distribution_count?: number
    last_distribution_date?: string
    status?: string
    company_name?: string
    sector?: string
    unit_price?: number
  }
}

interface KPIDetailsResponse {
  items: KPIDetail[]
  total: number
  kpiType: string
  asOfDate: string
  error?: string
  message?: string
  debug?: {
    queryType: string
    itemCount: number
    totalValue: number
    investorCount: number
  }
}

interface KPIDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  kpiType: string
  title: string
  description?: string
}

const KPI_TYPE_CONFIG = {
  nav_breakdown: {
    icon: BarChart3,
    color: 'blue',
    formatValue: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value),
    description: 'Current market value by holding'
  },
  contributions_breakdown: {
    icon: HandCoins,
    color: 'orange',
    formatValue: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value),
    description: 'Capital contributions by investment'
  },
  distributions_breakdown: {
    icon: Banknote,
    color: 'green',
    formatValue: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value),
    description: 'Distributions received by investment'
  },
  deal_breakdown: {
    icon: Users,
    color: 'purple',
    formatValue: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value),
    description: 'Deal allocations by company'
  }
}

export function KPIDetailsModal({
  isOpen,
  onClose,
  kpiType,
  title,
  description
}: KPIDetailsModalProps) {
  const [data, setData] = useState<KPIDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = KPI_TYPE_CONFIG[kpiType as keyof typeof KPI_TYPE_CONFIG]
  const IconComponent = config?.icon || BarChart3

  const fetchKPIDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/portfolio/kpi-details?type=${encodeURIComponent(kpiType)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch KPI details: ${response.statusText}`)
      }

      const result: KPIDetailsResponse = await response.json()

      if (result.error) {
        throw new Error(result.message || result.error)
      }

      setData(result)
    } catch (err) {
      console.error('Error fetching KPI details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load KPI details')

      // Set empty data on error
      setData({
        items: [],
        total: 0,
        kpiType: kpiType,
        asOfDate: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }, [kpiType])

  useEffect(() => {
    if (isOpen && kpiType) {
      fetchKPIDetails()
    }
  }, [isOpen, kpiType, fetchKPIDetails])

  const renderDetailItem = (item: KPIDetail) => {
    const { metadata } = item

    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md transition-all duration-300 hover:scale-[1.01] group"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
            `bg-${config.color}-100`
          )}>
            <Building2 className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", `text-${config.color}-600`)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
              {metadata.company_name && metadata.company_name !== item.name && (
                <Badge variant="secondary" className="text-xs">
                  {metadata.company_name}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              {metadata.units && (
                <span>{metadata.units.toLocaleString()} units</span>
              )}
              {metadata.nav_per_unit && (
                <span>${metadata.nav_per_unit.toFixed(3)}/unit</span>
              )}
              {metadata.unit_price && (
                <span>${metadata.unit_price.toFixed(2)}/unit</span>
              )}
              {metadata.contribution_count && (
                <span>{metadata.contribution_count} contributions</span>
              )}
              {metadata.distribution_count && (
                <span>{metadata.distribution_count} distributions</span>
              )}
            </div>

            {(metadata.last_valuation_date || metadata.last_contribution_date || metadata.last_distribution_date) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  Last: {new Date(
                    metadata.last_valuation_date ||
                    metadata.last_contribution_date ||
                    metadata.last_distribution_date ||
                    ''
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {metadata.sector && (
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {metadata.sector}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold text-lg">
            {config?.formatValue(item.value) || item.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {item.percentage.toFixed(1)}%
          </div>
          {metadata.commitment && (
            <div className="text-xs text-gray-400">
              Commitment: {config?.formatValue(metadata.commitment) || metadata.commitment.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 via-white to-purple-50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shadow-sm",
              `bg-${config?.color || 'blue'}-100`
            )}>
              <IconComponent className={cn("h-6 w-6", `text-${config?.color || 'blue'}-600`)} />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-gray-600">
                {description || config?.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-red-600 font-medium mb-2">Failed to load details</div>
                <div className="text-gray-500 text-sm mb-4">{error}</div>
                <Button onClick={fetchKPIDetails} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="h-full flex flex-col animate-in fade-in-50 duration-300">
              <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.items.length} {data.items.length === 1 ? 'Item' : 'Items'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total: <span className="font-medium">{config?.formatValue(data.total) || data.total.toLocaleString()}</span> • As of {new Date(data.asOfDate).toLocaleDateString()}
                    </p>
                  </div>
                  {data.total > 0 && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {config?.formatValue(data.total) || data.total.toLocaleString()}
                        </div>
                      <div className="text-xs text-gray-500">Total Value</div>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                {data.items.length > 0 ? (
                  <div className="space-y-4">
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && data.debug && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="font-medium text-blue-800 mb-1">Debug Info:</div>
                        <div className="text-blue-700">
                          Query: {data.debug.queryType} • Items: {data.debug.itemCount} • 
                          Total: ${data.debug.totalValue?.toLocaleString()} • 
                          Investors: {data.debug.investorCount}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid gap-3">
                      {data.items.map(renderDetailItem)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full animate-in fade-in-50 duration-300">
                    <div className="text-center max-w-md px-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Building2 className="w-10 h-10 text-blue-600" />
                      </div>
                      <div className="text-gray-900 font-semibold text-lg mb-2">No data available</div>
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {kpiType === 'distributions_breakdown'
                          ? 'No distributions have been received yet. This is normal for early-stage investments. Distributions will appear as your investments mature.'
                          : kpiType === 'deal_breakdown'
                          ? 'No deal allocations found. Deals will appear here once you participate in investment opportunities through our platform.'
                          : kpiType === 'contributions_breakdown'
                          ? 'No contribution data found. This may indicate missing cashflow records. Contact your relationship manager if you believe this is an error.'
                          : 'There are no items for this metric yet. Data will populate as transactions and valuations are recorded.'
                        }
                      </div>
                      {/* Show debug info for troubleshooting */}
                      {process.env.NODE_ENV === 'development' && data.debug && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-left">
                          <div className="font-medium text-yellow-800">Debug Info:</div>
                          <div className="text-yellow-700 mt-1">
                            Expected data but got 0 items. Check console for detailed logs.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}