'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PortfolioDashboard } from '@/components/holdings/portfolio-dashboard'
import { ModernHoldingsFilters, type FiltersState, type SortOption } from '@/components/holdings/modern-holdings-filters'
import { VehicleCard } from '@/components/holdings/vehicle-card'
// Removed CleanDealCard - only showing holdings per user request
import { RealtimeHoldingsProvider } from '@/components/holdings/realtime-holdings-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Removed Tabs import - no longer using tabs per user request
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  TrendingDown,
  Building,
  AlertCircle,
  RefreshCw,
  Target,
  PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced holding interface
interface EnhancedHolding {
  id: string
  name: string
  type: string
  domicile?: string
  currency: string
  created_at: string
  logo_url?: string
  website_url?: string
  investment_name?: string
  allocation_status?: string | null
  invite_sent_at?: string | null
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
    lastUpdated?: string
  } | null
  subscription: {
    id?: string  // For sell request form
    commitment: number | null
    currency: string
    status: string
    effective_date?: string | null
    funding_due_at?: string | null
    units?: number | null
  } | null
  valuation: {
    navTotal: number
    navPerUnit: number
    asOfDate: string
  } | null
  performance: {
    unrealizedGainPct: number
  } | null
  status?: string
}

const deriveHoldingStatus = (holding: Partial<EnhancedHolding>) => {
  if (holding.status) return holding.status

  const allocation = holding.allocation_status?.toLowerCase()
  if (allocation === 'active' || allocation === 'committed' || allocation === 'pending') {
    return allocation
  }
  if (allocation === 'closed' || allocation === 'cancelled') {
    return 'closed'
  }

  const raw = holding.subscription?.status?.toLowerCase()
  if (raw === 'active') return 'active'
  if (raw === 'committed' || raw === 'pending') return 'pending'
  if (raw === 'closed' || raw === 'cancelled') return 'closed'

  if (holding.position && holding.position.currentValue > 0) return 'active'
  return 'pending'
}

// Removed DealHolding interface - only showing holdings per user request

interface PortfolioData {
  kpis: any
  trends?: any
  summary: any
  asOfDate: string
  vehicleBreakdown?: any[]
  currencyBreakdown?: Array<{
    currency: string
    kpis: any
    summary: {
      totalPositions: number
      totalVehicles: number
    }
  }>
}

interface HoldingsPageProps {
  initialData?: PortfolioData
  detailsBasePath?: string
  holdingsPath?: string
  dealsPath?: string
  positionsOnly?: boolean
}

export function HoldingsPage({
  initialData,
  detailsBasePath = '/versotech_main/portfolio',
  holdingsPath = '/versotech_main/portfolio',
  dealsPath = '/versotech_main/opportunities',
  positionsOnly = false
}: HoldingsPageProps) {
  // State management
  const [holdings, setHoldings] = useState<EnhancedHolding[]>([])
  // Removed dealHoldings - only showing holdings per user request
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [investorIds, setInvestorIds] = useState<string[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  // Removed view toggle - only grid view per user request

  // Chart data states
  const [allocationData, setAllocationData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [cashFlowData, setCashFlowData] = useState<any[]>([])

  // Filter and sort state
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    type: 'all',
    status: 'all',
    performance: 'all',
    size: 'all',
    vintage: 'all',
    domicile: 'all'
  })
  const [sortBy, setSortBy] = useState<SortOption>('value_desc')

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async (includeBreakdown = true, includeTrends = true, useCache = true) => {
    try {
      const params = new URLSearchParams()
      if (includeBreakdown) params.append('breakdown', 'true')
      if (includeTrends) params.append('trends', 'true')

      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (!useCache) {
        fetchOptions.cache = 'no-store'
      }

      const response = await fetch(`/api/portfolio?${params.toString()}`, fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch portfolio data: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Portfolio fetch error:', err)
      throw err
    }
  }, [])

  // Fetch holdings data
  const fetchHoldings = useCallback(async (useCache = true) => {
    try {
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (!useCache) {
        fetchOptions.cache = 'no-store'
      }

      const response = await fetch('/api/vehicles?related=true', fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch holdings: ${errorText}`)
      }

      const data = await response.json()
      const normalized: EnhancedHolding[] = (data.vehicles || []).map((holding: EnhancedHolding) => {
        const status = deriveHoldingStatus(holding)
        const normalizedSubscription = holding.subscription
          ? {
              ...holding.subscription,
              commitment:
                holding.subscription.commitment === null || holding.subscription.commitment === undefined
                  ? null
                  : Number(holding.subscription.commitment),
              currency: holding.subscription.currency || holding.currency,
              status: holding.subscription.status || holding.allocation_status || status
            }
          : holding.subscription

        return {
          ...holding,
          status,
          allocation_status: holding.allocation_status || normalizedSubscription?.status || status,
          subscription: normalizedSubscription
        }
      })

      const filteredHoldings = positionsOnly
        ? normalized.filter(holding => (holding.position?.units ?? 0) > 0)
        : normalized

      setHoldings(filteredHoldings)
      // No longer tracking deals
    } catch (err) {
      console.error('Holdings fetch error:', err)
      throw err
    }
  }, [positionsOnly])

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get investor IDs first
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: investorLinks } = await supabase
            .from('investor_users')
            .select('investor_id')
            .eq('user_id', user.id)

          if (investorLinks) {
            const ids = investorLinks.map(link => link.investor_id)
            setInvestorIds(ids)
          }
        }

        // Use server-provided initial data if available, otherwise fetch
        if (initialData) {
          setPortfolioData(initialData)
          await fetchHoldings()
        } else {
          // Fetch data in parallel only if no initial data
          const [portfolioResult] = await Promise.all([
            fetchPortfolioData(),
            fetchHoldings()
          ])
          setPortfolioData(portfolioResult)
        }
      } catch (err) {
        console.error('Data load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [initialData, fetchPortfolioData, fetchHoldings])

  useEffect(() => {
    const currencyBreakdown = portfolioData?.currencyBreakdown ?? []
    if (currencyBreakdown.length === 0) return

    setSelectedCurrency((current) => {
      if (current && currencyBreakdown.some(entry => entry.currency === current)) {
        return current
      }
      return currencyBreakdown[0]?.currency ?? null
    })
  }, [portfolioData])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      const [portfolioResult] = await Promise.all([
        fetchPortfolioData(true, true, false),
        fetchHoldings(false)
      ])

      setPortfolioData(portfolioResult)
    } catch (err) {
      console.error('Refresh error:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Prepare chart data
  useEffect(() => {
    const prepareChartData = async () => {
      if (!portfolioData || !investorIds.length) return

      const supabase = createClient()
      const activeCurrency = selectedCurrency || portfolioData.currencyBreakdown?.[0]?.currency || null
      const holdingCurrencyMap = new Map(holdings.map(holding => [holding.id, holding.currency]))
      const vehicleBreakdown = portfolioData.vehicleBreakdown || []
      const filteredVehicleBreakdown = activeCurrency
        ? vehicleBreakdown.filter((vehicle: any) => (vehicle.currency || holdingCurrencyMap.get(vehicle.vehicleId)) === activeCurrency)
        : vehicleBreakdown

      try {
        // 1. Allocation Chart - from vehicleBreakdown
        if (filteredVehicleBreakdown.length > 0) {
          const totalValue = filteredVehicleBreakdown.reduce((sum: number, v: any) => sum + (v.currentValue || 0), 0)
          const allocation = filteredVehicleBreakdown.map((v: any) => ({
            name: v.vehicleName || 'Unknown',
            value: v.currentValue || 0,
            percentage: totalValue > 0 ? ((v.currentValue || 0) / totalValue) * 100 : 0
          }))
          setAllocationData(allocation)
        } else {
          setAllocationData([])
        }

        // 2. Performance Chart - fetch valuations
        const performanceVehicleIds = activeCurrency
          ? holdings.filter(holding => holding.currency === activeCurrency).map(holding => holding.id)
          : holdings.map(holding => holding.id)

        if (performanceVehicleIds.length > 0) {
          const { data: valuations } = await supabase
            .from('valuations')
            .select('vehicle_id, nav_total, as_of_date')
            .in('vehicle_id', performanceVehicleIds)
            .order('as_of_date', { ascending: true })
            .limit(50)

          if (valuations && valuations.length > 0) {
            // Group by date and sum NAV
            const navByDate = valuations.reduce((acc: any, v: any) => {
              const date = v.as_of_date.split('T')[0]
              if (!acc[date]) {
                acc[date] = 0
              }
              acc[date] += v.nav_total || 0
              return acc
            }, {})

            const performance = Object.entries(navByDate).map(([date, value]: [string, any]) => ({
              date,
              value,
              displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }))
            setPerformanceData(performance)
          } else {
            setPerformanceData([])
          }
        } else {
          setPerformanceData([])
        }

        // 3. Cash Flow Chart - fetch from cashflows table (has investor_id)
        const { data: cashflowsData } = await supabase
          .from('cashflows')
          .select('vehicle_id, type, amount, date')
          .in('investor_id', investorIds)
          .order('date', { ascending: true })
          .limit(100)

        // Group by period
        const cashFlowMap: any = {}

        cashflowsData?.forEach((cf: any) => {
          if (activeCurrency) {
            const cashflowCurrency = holdingCurrencyMap.get(cf.vehicle_id)
            if (cashflowCurrency && cashflowCurrency !== activeCurrency) {
              return
            }
          }
          const period = new Date(cf.date).toISOString().substring(0, 7) // YYYY-MM
          if (!cashFlowMap[period]) {
            cashFlowMap[period] = { period, contributions: 0, distributions: 0 }
          }
          if (cf.type === 'call') {
            cashFlowMap[period].contributions += cf.amount || 0
          } else if (cf.type === 'distribution') {
            cashFlowMap[period].distributions += cf.amount || 0
          }
        })

        const cashFlow = Object.values(cashFlowMap).map((cf: any) => ({
          ...cf,
          displayPeriod: new Date(cf.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }))
        setCashFlowData(cashFlow)

      } catch (err) {
        console.error('Chart data preparation error:', err)
      }
    }

    prepareChartData()
  }, [portfolioData, investorIds, holdings, selectedCurrency])

  // Filter holdings
  const filteredHoldings = useMemo(() => {
    let filtered = [...holdings]

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchLower) ||
        h.type.toLowerCase().includes(searchLower) ||
        (h.domicile && h.domicile.toLowerCase().includes(searchLower))
      )
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(h => h.type === filters.type)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(h => deriveHoldingStatus(h) === filters.status)
    }

    if (filters.performance !== 'all') {
      filtered = filtered.filter(h => {
        const gain = h.position?.unrealizedGainPct || 0
        switch (filters.performance) {
          case 'positive':
            return gain > 0
          case 'negative':
            return gain < 0
          case 'breakeven':
            return Math.abs(gain) <= 1
          default:
            return true
        }
      })
    }

    if (filters.size !== 'all') {
      filtered = filtered.filter(h => {
        const value = h.position?.currentValue || 0
        switch (filters.size) {
          case 'large':
            return value > 1000000
          case 'medium':
            return value >= 100000 && value <= 1000000
          case 'small':
            return value < 100000
          default:
            return true
        }
      })
    }

    if (filters.domicile !== 'all') {
      filtered = filtered.filter(h =>
        (h.domicile?.toLowerCase() || 'other') === filters.domicile
      )
    }

    // Vintage filter
    if (filters.vintage !== 'all') {
      const now = new Date()
      filtered = filtered.filter(h => {
        const created = new Date(h.created_at)
        const yearsOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
        switch (filters.vintage) {
          case 'recent':
            return yearsOld < 2
          case 'mature':
            return yearsOld >= 2 && yearsOld <= 5
          case 'legacy':
            return yearsOld > 5
          default:
            return true
        }
      })
    }

    // Value range filter
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      filtered = filtered.filter(h => {
        const value = h.position?.currentValue || 0
        const min = filters.minValue ?? 0
        const max = filters.maxValue ?? Infinity
        return value >= min && value <= max
      })
    }

    // Return range filter
    if (filters.minReturn !== undefined || filters.maxReturn !== undefined) {
      filtered = filtered.filter(h => {
        const returnPct = h.position?.unrealizedGainPct || 0
        const min = filters.minReturn ?? -Infinity
        const max = filters.maxReturn ?? Infinity
        return returnPct >= min && returnPct <= max
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'value_asc':
          return (a.position?.currentValue || 0) - (b.position?.currentValue || 0)
        case 'value_desc':
          return (b.position?.currentValue || 0) - (a.position?.currentValue || 0)
        case 'performance_asc':
          return (a.position?.unrealizedGainPct || 0) - (b.position?.unrealizedGainPct || 0)
        case 'performance_desc':
          return (b.position?.unrealizedGainPct || 0) - (a.position?.unrealizedGainPct || 0)
        case 'commitment_asc':
          return (a.subscription?.commitment || 0) - (b.subscription?.commitment || 0)
        case 'commitment_desc':
          return (b.subscription?.commitment || 0) - (a.subscription?.commitment || 0)
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [holdings, filters, sortBy])

  // Removed deal filtering - only showing holdings per user request

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all'
  ).length + (filters.search ? 1 : 0)

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      performance: 'all',
      size: 'all',
      vintage: 'all',
      domicile: 'all'
    })
  }

  // Handle export
  const handleExport = useCallback(() => {
    if (filteredHoldings.length === 0) return

    // CSV headers
    const headers = [
      'Name',
      'Type',
      'Domicile',
      'Status',
      'Currency',
      'Current Value',
      'Cost Basis',
      'Unrealized Gain',
      'Unrealized Gain %',
      'Units',
      'Commitment',
      'Created Date'
    ]

    // CSV rows
    const rows = filteredHoldings.map(h => [
      h.name,
      h.type.replace(/_/g, ' '),
      h.domicile || '',
      deriveHoldingStatus(h),
      h.currency,
      h.position?.currentValue?.toFixed(2) || '0',
      h.position?.costBasis?.toFixed(2) || '0',
      h.position?.unrealizedGain?.toFixed(2) || '0',
      h.position?.unrealizedGainPct?.toFixed(2) || '0',
      h.position?.units?.toString() || '0',
      h.subscription?.commitment?.toFixed(2) || '0',
      new Date(h.created_at).toLocaleDateString()
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `portfolio-holdings-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredHoldings])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && !portfolioData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalResults = filteredHoldings.length

  return (
    <RealtimeHoldingsProvider
      investorIds={investorIds}
      onDataUpdate={() => handleRefresh()}
      enableNotifications={true}
      holdingsPath={holdingsPath}
    >
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Holdings</h1>
              <p className="text-muted-foreground mt-1">
                Complete overview of your investments
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.location.href = dealsPath}
              >
                <Target className="h-4 w-4 mr-2" />
                Explore Active Deals
              </Button>
            </div>
          </div>

          {/* Portfolio Dashboard */}
          {portfolioData && (
            <PortfolioDashboard
              kpis={portfolioData.kpis}
              trends={portfolioData.trends}
              summary={portfolioData.summary}
              asOfDate={portfolioData.asOfDate}
              isLoading={isRefreshing}
              onRefresh={handleRefresh}
              onExport={handleExport}
              vehicleBreakdown={portfolioData.vehicleBreakdown}
              allocationData={allocationData}
              performanceData={performanceData}
              cashFlowData={cashFlowData}
              currencyBreakdown={portfolioData.currencyBreakdown}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
          )}

          {/* Holdings Section */}
          <div className="space-y-4">
            {/* Section Header */}
            <div>
              <h2 className="text-xl font-semibold">Your Holdings</h2>
              <p className="text-sm text-muted-foreground">
                {filteredHoldings.length} total holdings
              </p>
            </div>

            {/* Filters */}
            <ModernHoldingsFilters
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
              totalResults={totalResults}
            />

            {/* Holdings Grid/List */}
            {totalResults === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No holdings found</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    {activeFiltersCount > 0
                      ? 'Try adjusting your filters to see more results'
                      : 'Your holdings will appear here once investments are made'}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {filteredHoldings.map((holding) => (
                  <VehicleCard
                    key={holding.id}
                    holding={holding}
                    detailsBasePath={detailsBasePath}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RealtimeHoldingsProvider>
  )
}
