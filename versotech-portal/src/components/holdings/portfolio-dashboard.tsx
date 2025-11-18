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
  className?: string
  vehicleBreakdown?: any[]
  allocationData?: AllocationData[]
  performanceData?: PerformanceDataPoint[]
  cashFlowData?: CashFlowDataPoint[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(value)
}

const formatPercentage = (value: number, decimals: number = 1) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

const formatRatio = (value: number, decimals: number = 2) => {
  return `${value.toFixed(decimals)}x`
}

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
  icon?: React.ElementType
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
  className,
  vehicleBreakdown = [],
  allocationData = [],
  performanceData = [],
  cashFlowData = []
}: CleanPortfolioDashboardProps) {
  // Export functionality
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export portfolio data')
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-muted-foreground">
            {summary.totalVehicles} vehicles, {summary.totalPositions} positions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            {new Date(asOfDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
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
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CleanKPICard
          title="Portfolio Value"
          value={formatCurrency(kpis.currentNAV)}
          subtitle="Current NAV"
          change={trends?.navChangePct}
          icon={Wallet}
        />
        <CleanKPICard
          title="Invested"
          value={formatCurrency(kpis.totalContributed)}
          subtitle={`${((kpis.totalContributed / kpis.totalCommitment) * 100).toFixed(0)}% deployed`}
          icon={PiggyBank}
        />
        <CleanKPICard
          title="Distributions"
          value={formatCurrency(kpis.totalDistributions)}
          subtitle={`DPI: ${formatRatio(kpis.dpi)}`}
          icon={TrendingUp}
        />
        <CleanKPICard
          title="Unrealized"
          value={formatCurrency(kpis.unrealizedGain)}
          subtitle={`${kpis.unrealizedGainPct.toFixed(1)}% return`}
          change={kpis.unrealizedGainPct}
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
                <span className="text-sm font-medium">{formatRatio(kpis.tvpi)}</span>
              </div>
              <Progress value={(kpis.tvpi / 3) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">DPI</span>
                <span className="text-sm font-medium">{formatRatio(kpis.dpi)}</span>
              </div>
              <Progress value={(kpis.dpi / 2) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Net IRR</span>
                <span className="text-sm font-medium">{formatPercentage(kpis.irr)}</span>
              </div>
              <Progress value={Math.min((kpis.irr / 30) * 100, 100)} className="h-2" />
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
                    {((kpis.totalContributed / kpis.totalCommitment) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(kpis.totalContributed / kpis.totalCommitment) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commitment</span>
                  <span>{formatCurrency(kpis.totalCommitment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contributed</span>
                  <span>{formatCurrency(kpis.totalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unfunded</span>
                  <span>{formatCurrency(kpis.unfundedCommitment)}</span>
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
                <p className="text-2xl font-bold">{summary.totalVehicles}</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{summary.totalPositions}</p>
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
                <span>{formatCurrency(summary.totalDealValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NAVPerformanceChart data={performanceData} />
        <PortfolioAllocationChart data={allocationData} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <CashFlowChart data={cashFlowData} />
      </div>

    </div>
  )
}
