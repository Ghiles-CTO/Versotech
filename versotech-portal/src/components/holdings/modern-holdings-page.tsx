'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ModernPortfolioDashboard } from '@/components/holdings/modern-portfolio-dashboard'
import { ModernHoldingsFilters, type FiltersState, type SortOption } from '@/components/holdings/modern-holdings-filters'
import { RealtimeHoldingsProvider } from '@/components/holdings/realtime-holdings-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Target,
  Eye,
  MoreVertical,
  Globe,
  Shield,
  ChevronRight,
  Info,
  Layers,
  Activity,
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

interface ModernHoldingsPageProps {
  initialData?: {
    kpis: any
    trends?: any
    summary: any
    asOfDate: string
    vehicleBreakdown?: any[]
  }
}

// Modern Vehicle Card Component
function ModernVehicleCard({ holding }: { holding: EnhancedHolding }) {
  const hasPosition = holding.position && holding.position.currentValue > 0
  const isPositive = holding.position?.unrealizedGainPct ? holding.position.unrealizedGainPct >= 0 : false

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        isPositive ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500"
      )} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">{holding.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                {holding.type.replace(/_/g, ' ')}
              </Badge>
              {holding.domicile && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {holding.domicile}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasPosition ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Value</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: holding.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(holding.position!.currentValue)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unrealized Gain</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: holding.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(holding.position!.unrealizedGain)}
                  </span>
                  <Badge 
                    variant={isPositive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(holding.position!.unrealizedGainPct).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Units</p>
                  <p className="font-medium">{holding.position!.units.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost Basis</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: holding.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(holding.position!.costBasis)}
                  </p>
                </div>
              </div>
            </div>

            {holding.valuation && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">NAV per Unit</span>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: holding.currency
                      }).format(holding.valuation.navPerUnit)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      as of {new Date(holding.valuation.asOfDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No position data available</p>
            {holding.subscription && (
              <div className="mt-4 space-y-2">
                <Badge variant="outline">
                  Commitment: {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: holding.subscription.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(holding.subscription.commitment)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Status: {holding.subscription.status}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Modern Deal Card Component
function ModernDealCard({ deal }: { deal: DealHolding }) {
  const isApproved = deal.allocation.status === 'approved'
  const isPending = deal.allocation.status === 'pending'
  
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-3 right-3">
        <Badge variant={isApproved ? "default" : isPending ? "secondary" : "outline"}>
          {deal.allocation.status}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold line-clamp-1 pr-20">{deal.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              {deal.dealType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {deal.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Allocation Value</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: deal.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(deal.allocation.totalValue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Markup</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: deal.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(deal.spread.totalMarkup)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {deal.spread.markupPct.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Units</p>
              <p className="font-medium">{deal.allocation.units.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price</p>
              <p className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: deal.currency
                }).format(deal.allocation.unitPrice)}
              </p>
            </div>
          </div>
        </div>

        {deal.reservation && (
          <Alert className="py-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Reservation expires {new Date(deal.reservation.expiresAt).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Deal
          </Button>
          {isPending && (
            <Button size="sm" className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Track Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ModernHoldingsPage({ initialData }: ModernHoldingsPageProps) {
  // State management
  const [holdings, setHoldings] = useState<EnhancedHolding[]>([])
  const [dealHoldings, setDealHoldings] = useState<DealHolding[]>([])
  const [portfolioData, setPortfolioData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [investorIds, setInvestorIds] = useState<string[]>([])
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'vehicles' | 'deals'>('all')

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

      const response = await fetch('/api/vehicles?related=true&includeDeals=true', fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch holdings: ${errorText}`)
      }

      const data = await response.json()
      setHoldings(data.vehicles || [])
      setDealHoldings(data.deals || [])
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

        // Fetch data in parallel
        const [portfolioResult] = await Promise.all([
          portfolioData ? Promise.resolve(portfolioData) : fetchPortfolioData(),
          fetchHoldings()
        ])

        setPortfolioData(portfolioResult)
      } catch (err) {
        console.error('Data load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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
      filtered = filtered.filter(h => h.subscription?.status === filters.status)
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

  // Filter deals
  const filteredDeals = useMemo(() => {
    let filtered = [...dealHoldings]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.dealType.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [dealHoldings, filters.search])

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
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
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

  const displayedHoldings = activeTab === 'deals' ? [] : filteredHoldings
  const displayedDeals = activeTab === 'vehicles' ? [] : filteredDeals
  const totalResults = displayedHoldings.length + displayedDeals.length

  return (
    <RealtimeHoldingsProvider
      investorIds={investorIds}
      onDataUpdate={() => handleRefresh()}
      enableNotifications={true}
    >
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Portfolio Holdings</h1>
              <p className="text-muted-foreground mt-1">
                Complete overview of your investments across all vehicles and deals
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Portfolio Dashboard */}
          {portfolioData && (
            <ModernPortfolioDashboard
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
            {/* Tabs and View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    <Layers className="h-4 w-4" />
                    All Holdings
                    <Badge variant="secondary" className="ml-1">
                      {holdings.length + dealHoldings.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="gap-2">
                    <Building className="h-4 w-4" />
                    Vehicles
                    <Badge variant="secondary" className="ml-1">
                      {holdings.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="deals" className="gap-2">
                    <Target className="h-4 w-4" />
                    Deals
                    <Badge variant="secondary" className="ml-1">
                      {dealHoldings.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  variant={activeView === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('grid')}
                >
                  <PieChart className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('list')}
                >
                  <Layers className="h-4 w-4" />
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
                {displayedHoldings.map((holding) => (
                  <ModernVehicleCard key={holding.id} holding={holding} />
                ))}
                {displayedDeals.map((deal) => (
                  <ModernDealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RealtimeHoldingsProvider>
  )
}
