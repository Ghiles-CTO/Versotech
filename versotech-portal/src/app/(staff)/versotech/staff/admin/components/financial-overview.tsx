'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}

export function FinancialOverview({ metrics }: FinancialOverviewProps) {
  if (!metrics) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
          <p className="text-zinc-400">Loading financial metrics...</p>
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
    return <Minus className="h-3 w-3 text-zinc-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-400'
    if (value < 0) return 'text-red-400'
    return 'text-zinc-500'
  }

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-white">Financial Overview</CardTitle>
        </div>
        <Badge className="bg-zinc-700/50 text-zinc-300 border-zinc-600/30">
          <DollarSign className="h-3 w-3 mr-1" />
          USD
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AUM Section - Featured */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Assets Under Management</span>
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
          <p className="text-3xl font-bold text-white">
            {formatCurrency(metrics.aum?.total || 0)}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Commitments & Funding */}
          <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-zinc-300">Commitments</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500">Total</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(metrics.commitments?.total || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Funded</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(metrics.commitments?.funded || 0)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-500">Funding Rate</span>
                  <span className="text-zinc-300">{metrics.commitments?.funding_rate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Number(metrics.commitments?.funding_rate) || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue & Fees */}
          <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-zinc-300">Revenue</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-zinc-500">MTD</p>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(metrics.revenue?.revenue_mtd || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">YTD</p>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(metrics.revenue?.revenue_ytd || 0)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-zinc-500">Pending</p>
                  <p className="text-sm font-semibold text-amber-400">
                    {metrics.revenue?.pending_invoices?.count || 0}
                    <span className="text-xs text-zinc-500 ml-1">
                      ({formatCurrency(metrics.revenue?.pending_invoices?.amount || 0)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Overdue</p>
                  <p className={`text-sm font-semibold ${metrics.revenue?.overdue_invoices?.count > 0 ? 'text-red-400' : 'text-zinc-400'
                    }`}>
                    {metrics.revenue?.overdue_invoices?.count || 0}
                    <span className="text-xs text-zinc-500 ml-1">
                      ({formatCurrency(metrics.revenue?.overdue_invoices?.amount || 0)})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deal Pipeline */}
          <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-zinc-300">Deal Pipeline</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-zinc-500">Open Deals</p>
                  <p className="text-lg font-bold text-white">
                    {metrics.deal_pipeline?.open_deals || 0}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatCurrency(metrics.deal_pipeline?.total_pipeline_value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Closed YTD</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {metrics.deal_pipeline?.closed_deals_ytd || 0}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Conv: {metrics.deal_pipeline?.conversion_rate || 0}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Avg Deal Size</p>
                <p className="text-sm font-semibold text-zinc-300">
                  {formatCurrency(metrics.deal_pipeline?.average_deal_size || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Investors */}
          <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-zinc-300">Investor Base</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-zinc-500">Total</p>
                  <p className="text-lg font-bold text-white">
                    {metrics.investors?.total_active || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Approved</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {metrics.investors?.kyc_approved || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Pending</p>
                  <p className="text-lg font-bold text-amber-400">
                    {metrics.investors?.kyc_pending || 0}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">New This Month</p>
                <p className="text-sm font-semibold text-zinc-300 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  {metrics.investors?.new_investors_mtd || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-300">Performance Metrics</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">IRR (YTD)</p>
              <p className="text-xl font-bold text-emerald-400">
                {metrics.performance?.irr_ytd || 0}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">Multiple</p>
              <p className="text-xl font-bold text-blue-400">
                {metrics.performance?.multiple || 0}x
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">DPI</p>
              <p className="text-xl font-bold text-purple-400">
                {metrics.performance?.dpi || 0}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1">TVPI</p>
              <p className="text-xl font-bold text-cyan-400">
                {metrics.performance?.tvpi || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
              <span className="text-xs text-zinc-500">Portfolio Value</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(metrics.summary?.total_portfolio_value || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
              <span className="text-xs text-zinc-500">Distributions YTD</span>
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
