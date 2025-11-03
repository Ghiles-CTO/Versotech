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
  PieChart,
  LayoutGrid,
  List
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

interface HoldingsPageProps {
  initialData?: {
    kpis: any
    trends?: any
    summary: any
    asOfDate: string
    vehicleBreakdown?: any[]
  }
}

export function HoldingsPage({ initialData }: HoldingsPageProps) {
  // State management
  const [holdings, setHoldings] = useState<EnhancedHolding[]>([])
  // Removed dealHoldings - only showing holdings per user request
  const [portfolioData, setPortfolioData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [investorIds, setInvestorIds] = useState<string[]>([])
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')
  // Removed tabs - only show holdings per user request

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

      setHoldings(normalized)
      // No longer tracking deals
    } catch (err) {
      console.error('Holdings fetch error:', err)
      throw err
    }
  }, [])

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
  }, [initialData])

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
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export portfolio data')
  }

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
                onClick={() => window.location.href = '/versoholdings/deals'}
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
              vehicleBreakdown={portfolioData.vehicleBreakdown}
            />
          )}

          {/* Holdings Section */}
          <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Your Holdings</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredHoldings.length} total holdings
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'grid' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === 'list' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
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
              <div className={cn(
                "grid gap-4",
                activeView === 'grid' 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {filteredHoldings.map((holding) => (
                  <VehicleCard key={holding.id} holding={holding} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RealtimeHoldingsProvider>
  )
}
