'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Download, RefreshCw, Calendar, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { subDays, subMonths, subYears } from 'date-fns'
import type { DateRange } from 'react-day-picker'

// Placeholder imports for analytics modules (will be created next)
// import { VehiclesAnalytics } from './vehicles-analytics'
// import { InvestorsAnalytics } from './investors-analytics'
// import { SubscriptionsAnalytics } from './subscriptions-analytics'
// import { FeesAnalytics } from './fees-analytics'
// import { InvoicesAnalytics } from './invoices-analytics'
// import { TransactionsAnalytics } from './transactions-analytics'
// import { DealsAnalytics} from './deals-analytics'
// import { WorkflowsAnalytics } from './workflows-analytics'

// Coming Soon placeholder component
function ComingSoonPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-12">
      <div className="max-w-md text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-white/10 mb-4">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20">
              Coming Soon
            </Badge>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <TrendingUp className="w-4 h-4" />
          <span>Advanced analytics in development</span>
        </div>
      </div>
    </div>
  )
}

export function StaffAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate date range based on preset
  const getPresetDateRange = (preset: string): DateRange => {
    const to = new Date()
    let from: Date

    switch (preset) {
      case '7d':
        from = subDays(to, 7)
        break
      case '30d':
        from = subDays(to, 30)
        break
      case '90d':
        from = subDays(to, 90)
        break
      case '1y':
        from = subYears(to, 1)
        break
      case 'all':
        from = subYears(to, 10) // Arbitrary "all time" start
        break
      default:
        from = subDays(to, 30)
    }

    return { from, to }
  }

  // Get current effective date range
  const effectiveDateRange = customDateRange || getPresetDateRange(timeRange)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // TODO: Trigger data refresh with effectiveDateRange
    // When analytics modules are implemented, they should respect this date range
    console.log('[Analytics] Refreshing data for range:', effectiveDateRange)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // Clear custom range when selecting preset
    if (value !== 'custom') {
      setCustomDateRange(undefined)
    }
  }

  const handleCustomDateRangeChange = (range: DateRange | undefined) => {
    setCustomDateRange(range)
    if (range?.from || range?.to) {
      setTimeRange('custom')
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
          <p className="text-slate-400">Comprehensive data analysis across all operational verticals</p>
        </div>
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[140px] bg-black/40 border-white/10 text-slate-200">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1628] border-white/10 text-slate-200">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === 'custom' && (
              <DateRangePicker
                value={customDateRange}
                onChange={handleCustomDateRangeChange}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={cn(
                "bg-black/40 border-white/10 text-slate-200 hover:bg-white/10",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Modules Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-6" id="staff-analytics-tabs">
        <TabsList className="bg-black/40 border border-white/10 p-1 h-auto flex-wrap justify-start">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        {/* Analytics Module Content */}
        <TabsContent value="vehicles">
          <ComingSoonPlaceholder
            title="Vehicle Analytics"
            description="Comprehensive fund performance metrics, NAV trends, capital deployment analysis, and LP-level exposure breakdowns across all investment vehicles."
          />
        </TabsContent>

        <TabsContent value="investors">
          <ComingSoonPlaceholder
            title="Investor Analytics"
            description="Deep dive into LP behavior patterns, commitment trends, geographic distribution, AUM concentration analysis, and investor lifecycle metrics."
          />
        </TabsContent>

        <TabsContent value="subscriptions">
          <ComingSoonPlaceholder
            title="Subscription Analytics"
            description="Capital commitment flows, subscription conversion rates, time-to-close analysis, and predictive modeling for future fundraising cycles."
          />
        </TabsContent>

        <TabsContent value="deals">
          <ComingSoonPlaceholder
            title="Deal Analytics"
            description="Pipeline velocity metrics, deal source attribution, win/loss analysis, allocation efficiency, and co-investment patterns across the platform."
          />
        </TabsContent>

        <TabsContent value="fees">
          <ComingSoonPlaceholder
            title="Fee Analytics"
            description="Management fee calculations, carried interest waterfall analysis, GP catch-up provisions, and fee revenue forecasting across all fee structures."
          />
        </TabsContent>

        <TabsContent value="invoices">
          <ComingSoonPlaceholder
            title="Invoice Analytics"
            description="Billing cycle analysis, payment collection rates, aging reports, cash flow projections, and automated reconciliation insights."
          />
        </TabsContent>

        <TabsContent value="transactions">
          <ComingSoonPlaceholder
            title="Transaction Analytics"
            description="Capital call execution efficiency, distribution timing patterns, wire transfer audit trails, and transaction volume trends by entity."
          />
        </TabsContent>

        <TabsContent value="workflows">
          <ComingSoonPlaceholder
            title="Workflow Analytics"
            description="Process automation performance, workflow completion rates, bottleneck identification, SLA compliance tracking, and operational efficiency metrics."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
