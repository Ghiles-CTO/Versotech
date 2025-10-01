'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { KPIDetailsModal } from '@/components/holdings/kpi-details-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Calculator,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Calendar,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Type definitions matching enhanced portfolio API response
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

interface PortfolioKPIDashboardProps {
  kpis: PortfolioKPIs
  trends?: PortfolioTrends
  summary: PortfolioSummary
  asOfDate: string
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
}

export function PortfolioKPIDashboard({
  kpis,
  trends,
  summary,
  asOfDate,
  isLoading = false,
  onRefresh,
  className
}: PortfolioKPIDashboardProps) {
  const [selectedKPIType, setSelectedKPIType] = useState<string>('')
  const [selectedKPITitle, setSelectedKPITitle] = useState<string>('')
  const [showKPIModal, setShowKPIModal] = useState(false)

  // Format numbers with proper localization
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
  }

  const formatRatio = (value: number, decimals: number = 2) => {
    return `${value.toFixed(decimals)}x`
  }

  // Handle KPI card click for drill-down
  const handleKPIClick = (kpiType: string, title: string) => {
    setSelectedKPIType(kpiType)
    setSelectedKPITitle(title)
    setShowKPIModal(true)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Overview</h2>
          <p className="text-sm text-gray-600">
            {summary.totalPositions} positions across {summary.totalVehicles} vehicles
            {summary.totalDeals > 0 && (
              <span> • {summary.totalDeals} deal allocations</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">As of</p>
            <p className="text-sm font-medium">
              {new Date(asOfDate).toLocaleDateString()}
            </p>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Primary KPIs */}
        <KPICard
          title="Current NAV"
          value={kpis.currentNAV}
          icon={DollarSign}
          trend={trends ? {
            value: trends.navChangePct,
            isPositive: trends.navChangePct >= 0
          } : undefined}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('nav_breakdown', 'Current NAV Breakdown')}
          additionalInfo={{
            change: trends ? {
              period: `${trends.periodDays} days`,
              value: formatCurrency(trends.navChange)
            } : undefined,
            breakdown: [
              { label: 'Cost Basis', value: formatCurrency(kpis.totalCostBasis) },
              { label: 'Unrealized Gain', value: formatCurrency(kpis.unrealizedGain) }
            ]
          }}
        />

        <KPICard
          title="Total Contributed"
          value={kpis.totalContributed}
          icon={PiggyBank}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('contributions_breakdown', 'Capital Contributions Breakdown')}
          additionalInfo={{
            breakdown: [
              { label: 'Commitment', value: formatCurrency(kpis.totalCommitment) },
              { label: 'Unfunded', value: formatCurrency(kpis.unfundedCommitment) }
            ]
          }}
        />

        <KPICard
          title="Distributions"
          value={kpis.totalDistributions}
          icon={TrendingDown}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('distributions_breakdown', 'Distributions Breakdown')}
          additionalInfo={{
            breakdown: [
              { label: 'DPI Ratio', value: formatRatio(kpis.dpi) }
            ]
          }}
        />

        {/* Performance Ratios */}
        <KPICard
          title="DPI"
          value={formatRatio(kpis.dpi)}
          subtitle="Distributions / Paid-in"
          icon={Calculator}
          trend={{
            value: kpis.dpi > 0.5 ? 15 : -10,
            isPositive: kpis.dpi > 0.5
          }}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('distributions_breakdown', 'DPI Analysis')}
          className={cn(
            kpis.dpi > 1 ? "border-green-200 bg-green-50" :
            kpis.dpi > 0.5 ? "border-yellow-200 bg-yellow-50" :
            "border-red-200 bg-red-50"
          )}
        />

        <KPICard
          title="TVPI"
          value={formatRatio(kpis.tvpi)}
          subtitle="Total Value / Paid-in"
          icon={Target}
          trend={{
            value: kpis.tvpi > 1.2 ? 20 : -5,
            isPositive: kpis.tvpi > 1.2
          }}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('nav_breakdown', 'TVPI Analysis')}
          className={cn(
            kpis.tvpi > 2 ? "border-green-200 bg-green-50" :
            kpis.tvpi > 1.2 ? "border-yellow-200 bg-yellow-50" :
            "border-red-200 bg-red-50"
          )}
        />

        <KPICard
          title="Net IRR"
          value={formatPercentage(kpis.irr)}
          subtitle="Annualized Return"
          icon={BarChart3}
          trend={{
            value: kpis.irr,
            isPositive: kpis.irr > 0
          }}
          interactive
          hasDetails
          onDrillDown={() => handleKPIClick('nav_breakdown', 'IRR Analysis')}
          className={cn(
            kpis.irr > 15 ? "border-green-200 bg-green-50" :
            kpis.irr > 8 ? "border-yellow-200 bg-yellow-50" :
            "border-red-200 bg-red-50"
          )}
        />
      </div>

      {/* Enhanced Performance Summary with Trends */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Performance Summary
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Updated {new Date(summary.lastUpdated).toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Unrealized Gain</p>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-xl font-bold",
                  kpis.unrealizedGain >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(kpis.unrealizedGain)}
                </p>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  kpis.unrealizedGain >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {kpis.unrealizedGain >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatPercentage(kpis.unrealizedGainPct)}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {Math.abs(kpis.unrealizedGainPct).toFixed(1)}% of cost basis
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Unfunded Commitment</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(kpis.unfundedCommitment)}
                </p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Target className="h-3 w-3" />
                  {formatPercentage((kpis.unfundedCommitment / kpis.totalCommitment) * 100)}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {formatCurrency(kpis.totalContributed)} of {formatCurrency(kpis.totalCommitment)} deployed
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Total Return</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(kpis.currentNAV + kpis.totalDistributions)}
                </p>
                {trends && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    trends.navChangePct >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {trends.navChangePct >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {trends.navChangePct > 0 ? '+' : ''}{trends.navChangePct.toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                NAV + Distributions
                {trends && (
                  <span className="ml-1">• {trends.periodDays}d trend</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Deployment Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">
                  {formatPercentage((kpis.totalContributed / kpis.totalCommitment) * 100)}
                </p>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  (kpis.totalContributed / kpis.totalCommitment) > 0.8 ? "bg-green-100 text-green-700" : 
                  (kpis.totalContributed / kpis.totalCommitment) > 0.5 ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  <PiggyBank className="h-3 w-3" />
                  Deployed
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Capital utilization rate
              </p>
            </div>
          </div>

          {/* Trend Analysis */}
          {trends && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {trends.periodDays}-Day Performance Trend
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className={cn(
                    "flex items-center gap-1",
                    trends.navChangePct >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {trends.navChangePct >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    NAV: {formatCurrency(trends.navChange)} ({formatPercentage(trends.navChangePct)})
                  </div>
                  <div className={cn(
                    "flex items-center gap-1",
                    trends.performanceChange >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    Performance: {formatPercentage(trends.performanceChange)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Benchmarks Alert */}
      {(kpis.tvpi < 1.2 || kpis.dpi < 0.2) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Performance Notice:</strong>
            {kpis.tvpi < 1.2 && " TVPI below 1.2x may indicate underperformance."}
            {kpis.dpi < 0.2 && " Low DPI suggests limited cash distributions to date."}
            {" Consider reviewing individual vehicle performance for optimization opportunities."}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Details Modal */}
      <KPIDetailsModal
        isOpen={showKPIModal}
        onClose={() => setShowKPIModal(false)}
        kpiType={selectedKPIType}
        title={selectedKPITitle}
      />
    </div>
  )
}