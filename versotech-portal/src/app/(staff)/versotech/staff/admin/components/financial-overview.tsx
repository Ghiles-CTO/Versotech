'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  Users,
  PieChart,
  Briefcase,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

interface FinancialOverviewProps {
  metrics: any
  isDark?: boolean
}

export function FinancialOverview({ metrics, isDark = true }: FinancialOverviewProps) {
  if (!metrics) {
    return (
      <Card className={cn(
        isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <CardContent className="p-6">
          <h3 className={cn('text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Financial Overview</h3>
          <p className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Loading financial metrics...</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-3 w-3 text-emerald-400" />
    } else if (value < 0) {
      return <ArrowDownRight className="h-3 w-3 text-red-400" />
    }
    return <Minus className={cn('h-3 w-3', isDark ? 'text-zinc-500' : 'text-gray-400')} />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-400'
    if (value < 0) return 'text-red-400'
    return isDark ? 'text-zinc-500' : 'text-gray-400'
  }

  return (
    <Card className={cn(
      isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', isDark ? 'bg-blue-500/10' : 'bg-blue-50')}>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <CardTitle className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Financial Overview</CardTitle>
        </div>
        <Badge className={cn(
          isDark ? 'bg-zinc-700/50 text-zinc-300 border-zinc-600/30' : 'bg-gray-100 text-gray-600 border-gray-200'
        )}>
          <DollarSign className="h-3 w-3 mr-1" />
          USD
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AUM Section - Featured */}
        <div className={cn(
          'p-4 rounded-lg border',
          isDark
            ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20'
            : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className={isDark ? 'text-sm text-zinc-400' : 'text-sm text-gray-500'}>Assets Under Management</span>
            <div className="flex items-center gap-3 text-xs">
              <span className={`flex items-center gap-1 ${getTrendColor(metrics.aum?.change_mtd || 0)}`}>
                {getTrendIcon(metrics.aum?.change_mtd || 0)}
                MTD: {metrics.aum?.change_mtd || 0}%
              </span>
              <span className={`flex items-center gap-1 ${getTrendColor(metrics.aum?.change_ytd || 0)}`}>
                {getTrendIcon(metrics.aum?.change_ytd || 0)}
                YTD: {metrics.aum?.change_ytd || 0}%
              </span>
            </div>
          </div>
          <p className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
            {formatCurrency(metrics.aum?.total || 0)}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Commitments & Funding */}
          <div className={cn(
            'p-4 rounded-lg border',
            isDark ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-purple-400" />
              <span className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-gray-700')}>Commitments</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Total</p>
                <p className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  {formatCurrency(metrics.commitments?.total || 0)}
                </p>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Funded</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(metrics.commitments?.funded || 0)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isDark ? 'text-zinc-500' : 'text-gray-400'}>Funding Rate</span>
                  <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{metrics.commitments?.funding_rate || 0}%</span>
                </div>
                <div className={cn('w-full h-2 rounded-full overflow-hidden', isDark ? 'bg-zinc-700' : 'bg-gray-200')}>
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Number(metrics.commitments?.funding_rate) || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue & Fees */}
          <div className={cn(
            'p-4 rounded-lg border',
            isDark ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-gray-700')}>Revenue</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>MTD</p>
                  <p className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    {formatCurrency(metrics.revenue?.revenue_mtd || 0)}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>YTD</p>
                  <p className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    {formatCurrency(metrics.revenue?.revenue_ytd || 0)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Pending</p>
                  <p className="text-sm font-semibold text-amber-400">
                    {metrics.revenue?.pending_invoices?.count || 0}
                    <span className={cn('text-xs ml-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>
                      ({formatCurrency(metrics.revenue?.pending_invoices?.amount || 0)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Overdue</p>
                  <p className={`text-sm font-semibold ${metrics.revenue?.overdue_invoices?.count > 0 ? 'text-red-400' : (isDark ? 'text-zinc-400' : 'text-gray-500')
                    }`}>
                    {metrics.revenue?.overdue_invoices?.count || 0}
                    <span className={cn('text-xs ml-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>
                      ({formatCurrency(metrics.revenue?.overdue_invoices?.amount || 0)})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deal Pipeline */}
          <div className={cn(
            'p-4 rounded-lg border',
            isDark ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-cyan-400" />
              <span className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-gray-700')}>Deal Pipeline</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Open Deals</p>
                  <p className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    {metrics.deal_pipeline?.open_deals || 0}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>
                    {formatCurrency(metrics.deal_pipeline?.total_pipeline_value || 0)}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Closed YTD</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {metrics.deal_pipeline?.closed_deals_ytd || 0}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>
                    Conv: {metrics.deal_pipeline?.conversion_rate || 0}%
                  </p>
                </div>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Avg Deal Size</p>
                <p className={cn('text-sm font-semibold', isDark ? 'text-zinc-300' : 'text-gray-700')}>
                  {formatCurrency(metrics.deal_pipeline?.average_deal_size || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Investors */}
          <div className={cn(
            'p-4 rounded-lg border',
            isDark ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-orange-400" />
              <span className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-gray-700')}>Investor Base</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Total</p>
                  <p className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    {metrics.investors?.total_active || 0}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Approved</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {metrics.investors?.kyc_approved || 0}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Pending</p>
                  <p className="text-lg font-bold text-amber-400">
                    {metrics.investors?.kyc_pending || 0}
                  </p>
                </div>
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>New This Month</p>
                <p className={cn('text-sm font-semibold flex items-center gap-1', isDark ? 'text-zinc-300' : 'text-gray-700')}>
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  {metrics.investors?.new_investors_mtd || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={cn(
          'p-4 rounded-lg border',
          isDark ? 'bg-zinc-800/30 border-zinc-700/30' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className={cn('text-sm font-medium', isDark ? 'text-zinc-300' : 'text-gray-700')}>Performance Metrics</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className={cn('text-center p-3 rounded-lg', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
              <p className={cn('text-xs mb-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>IRR (YTD)</p>
              <p className="text-xl font-bold text-emerald-400">
                {metrics.performance?.irr_ytd || 0}%
              </p>
            </div>
            <div className={cn('text-center p-3 rounded-lg', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
              <p className={cn('text-xs mb-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>Multiple</p>
              <p className="text-xl font-bold text-blue-400">
                {metrics.performance?.multiple || 0}x
              </p>
            </div>
            <div className={cn('text-center p-3 rounded-lg', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
              <p className={cn('text-xs mb-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>DPI</p>
              <p className="text-xl font-bold text-purple-400">
                {metrics.performance?.dpi || 0}
              </p>
            </div>
            <div className={cn('text-center p-3 rounded-lg', isDark ? 'bg-zinc-800/50' : 'bg-gray-100')}>
              <p className={cn('text-xs mb-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>TVPI</p>
              <p className="text-xl font-bold text-cyan-400">
                {metrics.performance?.tvpi || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className={cn('pt-4 border-t', isDark ? 'border-zinc-800' : 'border-gray-200')}>
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              isDark ? 'bg-zinc-800/30' : 'bg-gray-50'
            )}>
              <span className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Portfolio Value</span>
              <span className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(metrics.summary?.total_portfolio_value || 0)}
              </span>
            </div>
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              isDark ? 'bg-zinc-800/30' : 'bg-gray-50'
            )}>
              <span className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-gray-400')}>Distributions YTD</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(metrics.summary?.total_distributions_ytd || 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
