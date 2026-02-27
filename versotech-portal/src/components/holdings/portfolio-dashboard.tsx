'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { PortfolioAllocationChart } from './portfolio-allocation-chart'
import { NAVPerformanceChart } from './nav-performance-chart'
import { CashFlowChart } from './cash-flow-chart'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Calculator,
  RefreshCw,
  Download,
  Wallet,
  Shield,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PortfolioKPIs {
  currentNAV: number
  totalContributed: number
  totalDistributions: number
  unfundedCommitment: number
  totalCommitment: number
  totalCostBasis: number
  unrealizedGain: number
  unrealizedGainPct: number
  dpi: number
  tvpi: number
  irr: number
}

export interface PortfolioTrends {
  navChange: number
  navChangePct: number
  performanceChange: number
  periodDays: number
}

export interface PortfolioSummary {
  totalPositions: number
  totalVehicles: number
  totalDeals: number
  totalDealValue: number
  pendingAllocations: number
  lastUpdated: string
}

interface AllocationData {
  name: string
  value: number
  percentage: number
}

interface PerformanceDataPoint {
  date: string
  value: number
  displayDate: string
}

interface CashFlowDataPoint {
  period: string
  contributions: number
  distributions: number
  displayPeriod: string
}

interface CleanPortfolioDashboardProps {
  kpis: PortfolioKPIs
  trends?: PortfolioTrends
  summary: PortfolioSummary
  asOfDate: string
  isLoading?: boolean
  onRefresh?: () => void
  onExport?: () => void
  className?: string
  vehicleBreakdown?: any[]
  allocationData?: AllocationData[]
  performanceData?: PerformanceDataPoint[]
  cashFlowData?: CashFlowDataPoint[]
  currencyBreakdown?: Array<{
    currency: string
    kpis: PortfolioKPIs
    summary: {
      totalPositions: number
      totalVehicles: number
    }
  }>
  selectedCurrency?: string | null
  onCurrencyChange?: (currency: string) => void
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  // Handle NaN, undefined, or null values
  const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: Math.abs(safeValue) >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(safeValue)
}

const formatPercentage = (value: number, decimals: number = 1) => {
  // Handle NaN, undefined, or null values
  const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value
  return `${safeValue > 0 ? '+' : ''}${safeValue.toFixed(decimals)}%`
}

const formatRatio = (value: number, decimals: number = 2) => {
  // Handle NaN, undefined, or null values
  const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value
  return `${safeValue.toFixed(decimals)}x`
}

type IconType = React.ComponentType<{ className?: string }>

// Clean KPI Card Component
function CleanKPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend,
  className
}: {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  icon?: IconType
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) {
  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  change >= 0 ? "text-muted-foreground" : "text-muted-foreground"
                )}>
                  {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatPercentage(change)}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function PortfolioDashboard({
  kpis,
  trends,
  summary,
  asOfDate,
  isLoading = false,
  onRefresh,
  onExport,
  className,
  vehicleBreakdown = [],
  allocationData = [],
  performanceData = [],
  cashFlowData = [],
  currencyBreakdown = [],
  selectedCurrency,
  onCurrencyChange
}: CleanPortfolioDashboardProps) {
  const hasMixedCurrency = currencyBreakdown.length > 1
  const activeCurrency = selectedCurrency || (currencyBreakdown[0]?.currency ?? 'USD')
  const activeKpis = currencyBreakdown.find(entry => entry.currency === activeCurrency)?.kpis || kpis
  const activeSummary = currencyBreakdown.find(entry => entry.currency === activeCurrency)?.summary || summary

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-muted-foreground">
            {activeSummary.totalVehicles} vehicles, {activeSummary.totalPositions} positions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            {new Date(asOfDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Badge>
          {currencyBreakdown.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground">
              <span>Currency</span>
              {hasMixedCurrency ? (
                <select
                  className="bg-transparent text-xs text-foreground outline-none"
                  value={activeCurrency}
                  onChange={(event) => onCurrencyChange?.(event.target.value)}
                >
                  {currencyBreakdown.map(entry => (
                    <option key={entry.currency} value={entry.currency}>
                      {entry.currency}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-foreground font-medium">{activeCurrency}</span>
              )}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={!onExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasMixedCurrency && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2 text-xs">
          Multiple currencies detected. KPIs shown for the selected currency only. No FX conversion is applied.
        </div>
      )}

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CleanKPICard
          title="Portfolio Value"
          value={formatCurrency(activeKpis.currentNAV, activeCurrency)}
          subtitle="Current NAV"
          change={trends?.navChangePct}
          icon={Wallet}
        />
        <CleanKPICard
          title="Invested"
          value={formatCurrency(activeKpis.totalContributed, activeCurrency)}
          subtitle={`${activeKpis.totalCommitment > 0 ? ((activeKpis.totalContributed / activeKpis.totalCommitment) * 100).toFixed(0) : 0}% deployed`}
          icon={PiggyBank}
        />
        <CleanKPICard
          title="Distributions"
          value={formatCurrency(activeKpis.totalDistributions, activeCurrency)}
          subtitle={`DPI: ${formatRatio(activeKpis.dpi)}`}
          icon={TrendingUp}
        />
        <CleanKPICard
          title="Gross Unrealized Gains"
          value={formatCurrency(activeKpis.unrealizedGain, activeCurrency)}
          subtitle={`${(activeKpis.unrealizedGainPct ?? 0).toFixed(1)}% return`}
          change={activeKpis.unrealizedGainPct}
          icon={Target}
        />
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Metrics */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">TVPI</span>
                <span className="text-sm font-medium">{formatRatio(activeKpis.tvpi)}</span>
              </div>
              <Progress value={(activeKpis.tvpi / 3) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">DPI</span>
                <span className="text-sm font-medium">{formatRatio(activeKpis.dpi)}</span>
              </div>
              <Progress value={(activeKpis.dpi / 2) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Net IRR</span>
                <span className="text-sm font-medium">{formatPercentage(activeKpis.irr)}</span>
              </div>
              <Progress value={Math.min((activeKpis.irr / 30) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Capital Deployment */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Capital Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Deployed</span>
                  <span className="text-sm font-medium">
                    {activeKpis.totalCommitment > 0 ? ((activeKpis.totalContributed / activeKpis.totalCommitment) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <Progress
                  value={activeKpis.totalCommitment > 0 ? (activeKpis.totalContributed / activeKpis.totalCommitment) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commitment</span>
                  <span>{formatCurrency(activeKpis.totalCommitment, activeCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contributed</span>
                  <span>{formatCurrency(activeKpis.totalContributed, activeCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unfunded</span>
                  <span>{formatCurrency(activeKpis.unfundedCommitment, activeCurrency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Stats */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Portfolio Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{activeSummary.totalVehicles}</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{activeSummary.totalPositions}</p>
                <p className="text-xs text-muted-foreground">Positions</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal Allocations</span>
                <span>{summary.totalDeals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal Value</span>
                <span>{hasMixedCurrency ? '—' : formatCurrency(summary.totalDealValue, activeCurrency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NAVPerformanceChart data={performanceData} currency={activeCurrency} />
        <PortfolioAllocationChart data={allocationData} currency={activeCurrency} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <CashFlowChart data={cashFlowData} currency={activeCurrency} />
      </div>

    </div>
  )
}
