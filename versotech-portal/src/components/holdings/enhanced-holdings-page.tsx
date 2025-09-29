'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PortfolioKPIDashboard, type PortfolioKPIs, type PortfolioTrends, type PortfolioSummary } from '@/components/holdings/portfolio-kpi-dashboard'
import { EnhancedHoldingsFilters, type FiltersState, type SortOption } from '@/components/holdings/enhanced-holdings-filters'
import { RealtimeHoldingsProvider } from '@/components/holdings/realtime-holdings-provider'
import { DealHoldingCard } from '@/components/holdings/deal-holding-card'
import { VehicleHoldingCard } from '@/components/holdings/vehicle-holding-card'
import { EmptyHoldingsState } from '@/components/holdings/empty-holdings-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// Simple Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  FileText,
  Download,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced vehicle/holding interface
interface EnhancedHolding {
  id: string
  name: string
  type: string
  domicile?: string
  currency: string
  created_at: string
  position: {
    units: number
    costBasis: number
    currentValue: number
    unrealizedGain: number
    unrealizedGainPct: number
    lastUpdated?: string
  } | null
  subscription: {
    commitment: number
    currency: string
    status: string
  } | null
  valuation: {
    navTotal: number
    navPerUnit: number
    asOfDate: string
  } | null
  performance: {
    unrealizedGainPct: number
  } | null
}

// Deal holding interface
interface DealHolding {
  id: string
  dealId: string
  name: string
  type: 'deal'
  dealType: string
  status: string
  currency: string
  allocation: {
    units: number
    unitPrice: number
    totalValue: number
    status: string
    approvedAt?: string
  }
  spread: {
    markupPerUnit: number
    totalMarkup: number
    markupPct: number
  }
  reservation?: {
    id: string
    requestedUnits: number
    status: string
    expiresAt: string
  } | null
}

interface EnhancedHoldingsPageProps {
  initialData?: {
    kpis: PortfolioKPIs
    trends?: PortfolioTrends
    summary: PortfolioSummary
    asOfDate: string
    vehicleBreakdown?: any[]
  }
}

export function EnhancedHoldingsPage({ initialData }: EnhancedHoldingsPageProps) {
  // State management - simplified and more reliable
  const [holdings, setHoldings] = useState<EnhancedHolding[]>([])
  const [dealHoldings, setDealHoldings] = useState<DealHolding[]>([])
  const [portfolioData, setPortfolioData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(true) // Always start with loading
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [investorIds, setInvestorIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'vehicles' | 'deals'>('all')

  // Debug logging
  console.log('EnhancedHoldingsPage - initialData:', initialData ? 'HAS DATA' : 'NO DATA')
  console.log('EnhancedHoldingsPage - isLoading:', isLoading)
  console.log('EnhancedHoldingsPage - holdings count:', holdings.length)
  console.log('EnhancedHoldingsPage - deal holdings count:', dealHoldings.length)

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

  // Fetch portfolio data with improved error handling
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
        throw new Error(`Failed to fetch portfolio data (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid portfolio data received')
      }

      console.log('Portfolio data fetched successfully:', {
        hasKpis: !!data.kpis,
        hasTrends: !!data.trends,
        hasBreakdown: !!data.vehicleBreakdown,
        positionCount: data.summary?.totalPositions || 0
      })

      return data
    } catch (err) {
      console.error('Portfolio fetch error:', err)
      throw err // Let caller handle the error
    }
  }, [])

  // Fetch holdings data including deals
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

      const response = await fetch('/api/vehicles?related=true&includeDeals=true', fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch holdings (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      
      // Validate data structure
      if (!data || !Array.isArray(data.vehicles)) {
        throw new Error('Invalid holdings data received')
      }

      console.log('Holdings data fetched successfully:', {
        vehicleCount: data.vehicles.length,
        dealCount: data.deals?.length || 0,
        totalCount: data.total || 0
      })

      setHoldings(data.vehicles)
      setDealHoldings(data.deals || [])
      
      return {
        vehicles: data.vehicles,
        deals: data.deals || []
      }
    } catch (err) {
      console.error('Holdings fetch error:', err)
      throw err // Let caller handle the error
    }
  }, [])

  // Simplified data loading - always fetch fresh data for consistency
  useEffect(() => {
    let isMounted = true

    const loadAllData = async () => {
      console.log('Loading portfolio data...')
      setIsLoading(true)
      setError(null)

      try {
        // Always fetch fresh data to ensure consistency
        const [portfolioResult, holdingsResult, investorIdsResult] = await Promise.allSettled([
          fetchPortfolioData(),
          fetchHoldings(),
          fetchInvestorIds()
        ])

        // Only update state if component is still mounted
        if (!isMounted) return

        // Handle portfolio data
        if (portfolioResult.status === 'fulfilled') {
          setPortfolioData(portfolioResult.value)
        } else {
          console.warn('Portfolio data fetch failed:', portfolioResult.reason)
          // Use initial data as fallback if available
          if (initialData) {
            setPortfolioData(initialData)
          }
        }

        // Handle holdings data
        if (holdingsResult.status === 'fulfilled') {
          // Holdings data is set by fetchHoldings function
        } else {
          console.warn('Holdings data fetch failed:', holdingsResult.reason)
          // Try to use vehicle breakdown from initial data as fallback
          if (initialData?.vehicleBreakdown) {
            const formattedHoldings: EnhancedHolding[] = initialData.vehicleBreakdown.map((vehicle: any) => ({
              id: vehicle.vehicleId || vehicle.vehicle_id,
              name: vehicle.vehicleName || vehicle.vehicle_name,
              type: vehicle.vehicleType || vehicle.vehicle_type || 'fund',
              domicile: vehicle.domicile || 'Luxembourg',
              currency: vehicle.currency || 'USD',
              created_at: new Date().toISOString(),
              position: {
                units: vehicle.units || 0,
                costBasis: vehicle.costBasis || vehicle.cost_basis || 0,
                currentValue: vehicle.currentValue || vehicle.current_value || 0,
                unrealizedGain: vehicle.unrealizedGain || vehicle.unrealized_gain || 0,
                unrealizedGainPct: vehicle.unrealizedGainPct || vehicle.unrealized_gain_pct || 0,
                lastUpdated: vehicle.lastValuationDate || vehicle.last_valuation_date
              },
              subscription: {
                commitment: vehicle.commitment || 0,
                currency: 'USD',
                status: 'active'
              },
              valuation: {
                navTotal: 0,
                navPerUnit: vehicle.navPerUnit || vehicle.nav_per_unit || 0,
                asOfDate: vehicle.lastValuationDate || vehicle.last_valuation_date || new Date().toISOString()
              },
              performance: {
                unrealizedGainPct: vehicle.unrealizedGainPct || vehicle.unrealized_gain_pct || 0
              }
            }))
            setHoldings(formattedHoldings)
          }
        }

        // Handle investor IDs (for realtime subscriptions)
        if (investorIdsResult.status === 'rejected') {
          console.warn('Investor IDs fetch failed:', investorIdsResult.reason)
        }

        // If any critical data failed, show error but don't block the UI
        if (portfolioResult.status === 'rejected' && holdingsResult.status === 'rejected') {
          setError('Failed to load portfolio data. Please try refreshing the page.')
        }

      } catch (err) {
        console.error('Failed to load portfolio data:', err)
        if (isMounted) {
          setError('Failed to load portfolio data. Please try refreshing the page.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          console.log('Portfolio data loading complete')
        }
      }
    }

    loadAllData()

    return () => {
      isMounted = false
    }
  }, []) // Remove initialData dependency to prevent unnecessary re-renders

  // Refresh data function with cache bypass
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      console.log('Refreshing portfolio data...')
      
      // Bypass cache on refresh to get latest data
      const [portfolioResult, holdingsResult] = await Promise.allSettled([
        fetchPortfolioData(true, true, false), // Don't use cache
        fetchHoldings(false) // Don't use cache
      ])

      // Update portfolio data if successful
      if (portfolioResult.status === 'fulfilled') {
        setPortfolioData(portfolioResult.value)
      } else {
        console.error('Portfolio refresh failed:', portfolioResult.reason)
        setError('Failed to refresh portfolio data')
      }

      // Holdings data is updated by fetchHoldings directly
      if (holdingsResult.status === 'rejected') {
        console.error('Holdings refresh failed:', holdingsResult.reason)
        setError(prevError => prevError || 'Failed to refresh holdings data')
      }

      console.log('Portfolio refresh complete')
    } catch (err) {
      console.error('Unexpected error during refresh:', err)
      setError('Failed to refresh data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchPortfolioData, fetchHoldings])

  // Get investor IDs for realtime subscriptions
  const fetchInvestorIds = async () => {
    try {
      const response = await fetch('/api/me')
      if (!response.ok) throw new Error('Failed to fetch user data')

      const userData = await response.json()
      if (userData.investorLinks && Array.isArray(userData.investorLinks)) {
        const ids = userData.investorLinks.map((link: any) => link.investor_id)
        setInvestorIds(ids)
      }
    } catch (err) {
      console.error('Failed to fetch investor IDs:', err)
    }
  }

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(async (update: any) => {
    console.log('Received realtime update:', update)

    switch (update.type) {
      case 'position_update':
      case 'valuation_update':
        // Refresh both portfolio data and holdings
        try {
          await Promise.all([
            fetchPortfolioData(),
            fetchHoldings()
          ])
        } catch (err) {
          console.error('Error refreshing data after realtime update:', err)
        }
        break

      case 'allocation_update':
        // For deal allocations, mainly refresh portfolio data
        try {
          await fetchPortfolioData()
        } catch (err) {
          console.error('Error refreshing portfolio after allocation update:', err)
        }
        break

      case 'kpi_update':
        // For performance snapshots, refresh portfolio data
        try {
          await fetchPortfolioData()
        } catch (err) {
          console.error('Error refreshing KPIs after update:', err)
        }
        break
    }
  }, [fetchPortfolioData, fetchHoldings])

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = holdings.filter((holding) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!holding.name.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Type filter
      if (filters.type !== 'all' && holding.type !== filters.type) {
        return false
      }

      // Status filter
      if (filters.status !== 'all') {
        const status = holding.subscription?.status || 'unknown'
        if (status !== filters.status) {
          return false
        }
      }

      // Performance filter
      if (filters.performance !== 'all') {
        const gain = holding.position?.unrealizedGainPct || 0
        switch (filters.performance) {
          case 'positive':
            if (gain <= 0) return false
            break
          case 'negative':
            if (gain >= 0) return false
            break
          case 'breakeven':
            if (Math.abs(gain) > 1) return false
            break
        }
      }

      // Size filter
      if (filters.size !== 'all') {
        const value = holding.position?.currentValue || 0
        switch (filters.size) {
          case 'large':
            if (value <= 1000000) return false
            break
          case 'medium':
            if (value <= 100000 || value > 1000000) return false
            break
          case 'small':
            if (value > 100000) return false
            break
        }
      }

      // Vintage filter (simplified - would need creation date from vehicle)
      if (filters.vintage !== 'all') {
        const year = new Date(holding.created_at).getFullYear()
        const currentYear = new Date().getFullYear()
        switch (filters.vintage) {
          case 'recent':
            if (year < currentYear - 2) return false
            break
          case 'mature':
            if (year < currentYear - 5 || year >= currentYear - 2) return false
            break
          case 'legacy':
            if (year >= currentYear - 5) return false
            break
        }
      }

      // Domicile filter
      if (filters.domicile !== 'all') {
        const domicile = holding.domicile?.toLowerCase() || 'other'
        if (domicile !== filters.domicile) {
          return false
        }
      }

      return true
    })

    // Sort filtered results
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

  // Clear all filters
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* KPI Dashboard Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Holdings Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  // Error state with graceful degradation
  if (error && !portfolioData) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error loading portfolio data:</strong> {error}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mr-2"
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? 'Retrying...' : 'Retry'}
              </Button>
              <span className="text-sm text-gray-600">
                We're having trouble loading your portfolio data. Please try refreshing or contact support if the issue persists.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <RealtimeHoldingsProvider
      investorIds={investorIds}
      onDataUpdate={handleRealtimeUpdate}
      enableNotifications={true}
    >
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portfolio Holdings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Complete overview of your investments across all vehicles and deals
          </p>
        </div>
        
        {/* Mobile Quick Actions */}
        <div className="flex gap-2 sm:hidden">
          <Button size="sm" variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Portfolio KPI Dashboard */}
      {portfolioData && (
        <PortfolioKPIDashboard
          kpis={portfolioData.kpis}
          trends={portfolioData.trends}
          summary={portfolioData.summary}
          asOfDate={portfolioData.asOfDate}
          isLoading={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Warning:</strong> Some data may not be current. {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Holdings Filters */}
      <EnhancedHoldingsFilters
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        totalCount={holdings.length}
        filteredCount={filteredAndSortedHoldings.length}
        dealCount={dealHoldings.length}
        onClearFilters={handleClearFilters}
        onRequestReport={() => {
          // TODO: Implement portfolio report request
          console.log('Portfolio report requested')
        }}
      />

      {/* Enhanced Holdings Display with Responsive Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'vehicles' | 'deals')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="all" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All Holdings</span>
            <span className="sm:hidden">All</span>
            <span className="ml-1">({holdings.length + dealHoldings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Vehicles</span>
            <span className="sm:hidden">Funds</span>
            <span className="ml-1">({holdings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Deals</span>
            <span className="sm:hidden">Deals</span>
            <span className="ml-1">({dealHoldings.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* All Holdings Tab */}
        <TabsContent value="all" className="space-y-6">
          {(filteredAndSortedHoldings.length > 0 || dealHoldings.length > 0) ? (
            <div className="space-y-8">
              {/* Vehicle Holdings Section */}
              {filteredAndSortedHoldings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Investment Vehicles</h3>
                    <Badge variant="outline">{filteredAndSortedHoldings.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAndSortedHoldings.map((holding) => (
                      <VehicleHoldingCard key={holding.id} holding={holding} />
                    ))}
                  </div>
                </div>
              )}

              {/* Deal Holdings Section */}
              {dealHoldings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Deal Allocations</h3>
                    <Badge variant="outline">{dealHoldings.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {dealHoldings.map((deal) => (
                      <DealHoldingCard key={deal.id} deal={deal} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyHoldingsState 
              hasAnyHoldings={holdings.length > 0 || dealHoldings.length > 0}
              onClearFilters={handleClearFilters}
            />
          )}
        </TabsContent>

        {/* Vehicles Only Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          {filteredAndSortedHoldings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredAndSortedHoldings.map((holding) => (
                <VehicleHoldingCard key={holding.id} holding={holding} />
              ))}
            </div>
          ) : (
            <EmptyHoldingsState 
              hasAnyHoldings={holdings.length > 0}
              onClearFilters={handleClearFilters}
              message="No vehicle holdings found"
            />
          )}
        </TabsContent>

        {/* Deals Only Tab */}
        <TabsContent value="deals" className="space-y-6">
          {dealHoldings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {dealHoldings.map((deal) => (
                <DealHoldingCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <EmptyHoldingsState 
              hasAnyHoldings={false}
              onClearFilters={handleClearFilters}
              message="No deal allocations found"
              description="You don't have any deal allocations yet. Deals will appear here once you participate in investment opportunities."
            />
          )}
        </TabsContent>
      </Tabs>
      </div>
    </RealtimeHoldingsProvider>
  )
}