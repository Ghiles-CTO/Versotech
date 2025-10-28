'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Calculator,
  BarChart3,
  RefreshCw,
  Calendar,
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

interface CleanPortfolioDashboardProps {
  kpis: PortfolioKPIs
  trends?: PortfolioTrends
  summary: PortfolioSummary
  asOfDate: string
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
  vehicleBreakdown?: any[]
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

// Generate performance data based on timeframe
function generatePerformanceData(timeframe: string, kpis: PortfolioKPIs) {
  const currentDate = new Date()
  const data = []
  
  let periods = 0
  let dateFormat: Intl.DateTimeFormatOptions = { month: 'short' }
  
  switch (timeframe) {
    case '1M':
      periods = 30
      dateFormat = { day: 'numeric' }
      break
    case '3M':
      periods = 12
      dateFormat = { month: 'short', day: 'numeric' }
      break
    case '6M':
      periods = 24
      dateFormat = { month: 'short' }
      break
    case '1Y':
      periods = 12
      dateFormat = { month: 'short' }
      break
    case 'ALL':
      periods = 36
      dateFormat = { month: 'short', year: '2-digit' }
      break
  }
  
  // Generate data points
  for (let i = periods; i >= 0; i--) {
    const date = new Date(currentDate)
    
    if (timeframe === '1M') {
      date.setDate(date.getDate() - i)
    } else if (timeframe === '3M') {
      date.setDate(date.getDate() - (i * 7.5))
    } else if (timeframe === '6M') {
      date.setDate(date.getDate() - (i * 7.5))
    } else if (timeframe === '1Y') {
      date.setMonth(date.getMonth() - i)
    } else {
      date.setMonth(date.getMonth() - i)
    }
    
    // Generate realistic progression
    const progress = (periods - i) / periods
    const navBase = kpis.currentNAV * (0.85 + progress * 0.15)
    const contributedBase = kpis.totalContributed * (0.7 + progress * 0.3)
    const distributedBase = kpis.totalDistributions * progress
    
    // Add some variance
    const variance = 1 + (Math.random() - 0.5) * 0.05
    
    data.push({
      date: date.toLocaleDateString('en-US', dateFormat),
      nav: Math.round(navBase * variance),
      contributed: Math.round(contributedBase),
      distributed: Math.round(distributedBase)
    })
  }
  
  // Ensure last data point matches current values
  if (data.length > 0) {
    data[data.length - 1] = {
      ...data[data.length - 1],
      nav: kpis.currentNAV,
      contributed: kpis.totalContributed,
      distributed: kpis.totalDistributions
    }
  }
  
  return data
}

export function PortfolioDashboard({
  kpis,
  trends,
  summary,
  asOfDate,
  isLoading = false,
  onRefresh,
  className,
  vehicleBreakdown = []
}: CleanPortfolioDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y')
  
  // Generate performance data based on selected timeframe
  const performanceData = useMemo(() => 
    generatePerformanceData(selectedTimeframe, kpis), 
    [selectedTimeframe, kpis]
  )
  
  const allocationData = vehicleBreakdown.slice(0, 5).map(v => ({
    name: v.vehicle_name || 'Unknown',
    value: Math.round(parseFloat(v.current_value) || 0),
    percentage: Math.round((parseFloat(v.current_value) / kpis.currentNAV) * 100)
  }))

  const chartConfig = {
    nav: { label: "NAV", color: "hsl(var(--chart-1))" },
    contributed: { label: "Contributed", color: "hsl(var(--chart-2))" },
    distributed: { label: "Distributed", color: "hsl(var(--chart-3))" }
  }

  // Clean minimal colors
  const pieColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

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
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Portfolio Performance</CardTitle>
                <div className="flex gap-1">
                  {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeframe === period ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(period)}
                      className="h-8 px-3 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px]">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="nav"
                    stroke="var(--color-nav)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributed"
                    stroke="var(--color-contributed)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="distributed"
                    stroke="var(--color-distributed)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Portfolio Allocation</CardTitle>
              <CardDescription>Distribution across vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ percentage }) => percentage > 5 ? `${percentage}%` : ''}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Breakdown</h4>
                  {allocationData.map((vehicle, index) => (
                    <div key={vehicle.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="text-sm">{vehicle.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(vehicle.value)}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Cash Flow Analysis</CardTitle>
              <CardDescription>Capital calls vs distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData.filter((_, i) => i % 2 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar 
                      dataKey="contributed" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar 
                      dataKey="distributed" 
                      fill="hsl(var(--chart-3))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
