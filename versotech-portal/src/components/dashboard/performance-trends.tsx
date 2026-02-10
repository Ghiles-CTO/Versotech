'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Target, DollarSign, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChartColors, useChartPalette } from '@/lib/theme-colors'
import { normalizeCurrencyCode } from '@/lib/currency-totals'

interface PerformanceData {
  period: string
  date: string
  nav: number
  contributions: number
  distributions: number
  dpi: number
  tvpi: number
  irr: number
}

interface PerformanceTrendsProps {
  investorIds: string[]
  selectedDealId?: string | null
  className?: string
}

export function PerformanceTrends({ investorIds, selectedDealId, className }: PerformanceTrendsProps) {
  const [data, setData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'12M' | '24M' | 'ALL'>('12M')
  const [currencyCode, setCurrencyCode] = useState('')
  const chartColors = useChartColors()
  const palette = useChartPalette()

  // Fetch real historical performance data from Supabase
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (investorIds.length === 0) return

      setLoading(true)
      try {
        const supabase = createClient()
        let scopedCurrencyCode = ''

        // Calculate date range based on selected period
        const months = selectedPeriod === '12M' ? 12 : selectedPeriod === '24M' ? 24 : 36
        const fromDate = new Date()
        fromDate.setMonth(fromDate.getMonth() - months)

        // Fetch real performance snapshots from database
        const snapshotQuery = supabase
          .from('performance_snapshots')
          .select('*')
          .in('investor_id', investorIds)
          .gte('snapshot_date', fromDate.toISOString().split('T')[0])
          .order('snapshot_date', { ascending: true })

        if (selectedDealId) {
          const { data: dealRecord, error: dealLookupError } = await supabase
            .from('deals')
            .select('vehicle_id, currency')
            .eq('id', selectedDealId)
            .single()

          if (dealLookupError || !dealRecord?.vehicle_id) {
            setData([])
            setLoading(false)
            return
          }

          scopedCurrencyCode = normalizeCurrencyCode(dealRecord.currency, '')

          snapshotQuery.eq('vehicle_id', dealRecord.vehicle_id)
        }

        const { data: snapshots, error } = await snapshotQuery

        if (error) {
          console.error('Error fetching performance data:', error)
          setData([])
          setLoading(false)
          return
        }

        // Transform snapshots to chart data format
        const performanceData: PerformanceData[] = []
        const snapshotsByDate = new Map<string, any[]>()

        // Group snapshots by date
        snapshots?.forEach(snapshot => {
          const date = snapshot.snapshot_date
          if (!snapshotsByDate.has(date)) {
            snapshotsByDate.set(date, [])
          }
          snapshotsByDate.get(date)!.push(snapshot)
        })

        // Aggregate data by date for multiple investors
        Array.from(snapshotsByDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, snapshots]) => {
            const totalNav = snapshots.reduce((sum, s) => sum + (s.nav_value || 0), 0)
            const totalContributed = snapshots.reduce((sum, s) => sum + (s.contributed || 0), 0)
            const totalDistributed = snapshots.reduce((sum, s) => sum + (s.distributed || 0), 0)

            // Calculate weighted averages for multiples
            const avgDpi = totalContributed > 0 ? totalDistributed / totalContributed : 0
            const avgTvpi = totalContributed > 0 ? (totalNav + totalDistributed) / totalContributed : 1
            const avgIrr = snapshots.reduce((sum, s) => sum + (s.irr_net || 0), 0) / snapshots.length

            performanceData.push({
              period: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              date,
              nav: totalNav,
              contributions: totalContributed,
              distributions: totalDistributed,
              dpi: Math.round(avgDpi * 100) / 100,
              tvpi: Math.round(avgTvpi * 100) / 100,
              irr: Math.round(avgIrr * 10000) / 100 // Convert to percentage
            })
          })

        setData(performanceData)
        setCurrencyCode(scopedCurrencyCode)
      } catch (error) {
        console.error('Error in fetchPerformanceData:', error)
        setData([])
        setCurrencyCode('')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [selectedPeriod, investorIds, selectedDealId])

  const formatChartCurrency = (value: number) => {
    if (!currencyCode) {
      return Number(value || 0).toLocaleString('en-US', {
        maximumFractionDigits: 1,
        notation: Math.abs(value || 0) >= 1000 ? 'compact' : 'standard',
        compactDisplay: 'short',
      })
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 1,
      notation: Math.abs(value || 0) >= 1000 ? 'compact' : 'standard',
      compactDisplay: 'short',
    }).format(value || 0)
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatMultiple = (value: number) => `${value.toFixed(2)}x`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'nav' || entry.dataKey === 'contributions' || entry.dataKey === 'distributions'
                  ? formatChartCurrency(entry.value)
                  : entry.dataKey === 'irr'
                  ? formatPercentage(entry.value)
                  : formatMultiple(entry.value)
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const pieData = data.length > 0 ? [
    { name: 'Realized Value', value: data[data.length - 1].distributions, color: chartColors.success },
    { name: 'Unrealized Value', value: data[data.length - 1].nav - data[data.length - 1].distributions, color: chartColors.primary },
  ] : []

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]
  const navChange = latestData && previousData ?
    ((latestData.nav - previousData.nav) / previousData.nav * 100) : 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends{selectedDealId ? ' (Deal-Scoped)' : ''}
          </CardTitle>
          <CardDescription>
            {selectedDealId
              ? 'Historical performance metrics for the selected deal'
              : 'Historical performance metrics and portfolio evolution'
            }
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {(['12M', '24M', 'ALL'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {latestData ? formatChartCurrency(latestData.nav) : formatChartCurrency(0)}
            </div>
            <div className="text-sm text-muted-foreground">Current NAV</div>
            {navChange !== 0 && (
              <div className={cn(
                "flex items-center justify-center gap-1 text-sm",
                navChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {navChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercentage(Math.abs(navChange))} MoM
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {latestData ? formatMultiple(latestData.dpi) : '0.00x'}
            </div>
            <div className="text-sm text-muted-foreground">Current DPI</div>
            <Badge variant={latestData?.dpi > 0.5 ? 'default' : 'secondary'} className="text-xs mt-1">
              {latestData?.dpi > 1 ? 'Strong' : latestData?.dpi > 0.5 ? 'Good' : 'Early'}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {latestData ? formatMultiple(latestData.tvpi) : '0.00x'}
            </div>
            <div className="text-sm text-muted-foreground">Current TVPI</div>
            <Badge variant={latestData?.tvpi > 1.2 ? 'default' : 'secondary'} className="text-xs mt-1">
              {latestData?.tvpi > 1.5 ? 'Excellent' : latestData?.tvpi > 1.2 ? 'Good' : 'Fair'}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {latestData ? formatPercentage(latestData.irr) : '0.0%'}
            </div>
            <div className="text-sm text-muted-foreground">Current IRR</div>
            <Badge variant={latestData?.irr > 15 ? 'default' : 'secondary'} className="text-xs mt-1">
              Net Returns
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="nav-growth" className="space-y-4" id="performance-trends-tabs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nav-growth">NAV Growth</TabsTrigger>
            <TabsTrigger value="multiples">DPI / TVPI</TabsTrigger>
            <TabsTrigger value="cashflows">Cash Flows</TabsTrigger>
            <TabsTrigger value="composition">Composition</TabsTrigger>
          </TabsList>

          <TabsContent value="nav-growth" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <YAxis
                    tickFormatter={formatChartCurrency}
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="nav"
                    stroke={chartColors.primary}
                    fill={chartColors.primary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="multiples" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <YAxis
                    tickFormatter={formatMultiple}
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="dpi"
                    stroke={chartColors.success}
                    strokeWidth={2}
                    name="DPI"
                    dot={{ fill: chartColors.success, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tvpi"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    name="TVPI"
                    dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="cashflows" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <YAxis
                    tickFormatter={formatChartCurrency}
                    tick={{ fontSize: 12, fill: chartColors.axis }}
                    tickLine={false}
                    stroke={chartColors.axisLine}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="contributions"
                    fill={chartColors.warning}
                    name="Contributions"
                    opacity={0.8}
                  />
                  <Bar
                    dataKey="distributions"
                    fill={chartColors.success}
                    name="Distributions"
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="composition" className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatChartCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-6 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatChartCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
