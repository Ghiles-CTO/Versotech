'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  PieChart,
  Briefcase,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface FinancialOverviewProps {
  metrics: any
}

export function FinancialOverview({ metrics }: FinancialOverviewProps) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading financial metrics...</p>
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
      return <ArrowUpRight className="h-3 w-3 text-green-500" />
    } else if (value < 0) {
      return <ArrowDownRight className="h-3 w-3 text-red-500" />
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Overview</CardTitle>
          <Badge variant="outline">
            <DollarSign className="h-3 w-3 mr-1" />
            USD
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AUM Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Assets Under Management</span>
            <span className="text-2xl font-bold">
              {formatCurrency(metrics.aum?.total || 0)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              {getTrendIcon(metrics.aum?.change_mtd || 0)}
              MTD: {metrics.aum?.change_mtd || 0}%
            </span>
            <span className="flex items-center gap-1">
              {getTrendIcon(metrics.aum?.change_ytd || 0)}
              YTD: {metrics.aum?.change_ytd || 0}%
            </span>
          </div>
        </div>

        {/* Commitments & Funding */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Commitments & Funding</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Commitments</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.commitments?.total || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Funded</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.commitments?.funded || 0)}
              </p>
            </div>
          </div>
          <div className="pl-6">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Funding Rate</span>
              <span>{metrics.commitments?.funding_rate || 0}%</span>
            </div>
            <Progress value={Number(metrics.commitments?.funding_rate) || 0} className="h-2" />
          </div>
        </div>

        {/* Revenue & Fees */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Revenue & Fees</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Revenue MTD</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.revenue?.revenue_mtd || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue YTD</p>
              <p className="text-lg font-semibold">
                {formatCurrency(metrics.revenue?.revenue_ytd || 0)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Pending Invoices</p>
              <p className="text-sm font-semibold">
                {metrics.revenue?.pending_invoices?.count || 0}
                <span className="text-xs text-muted-foreground ml-1">
                  ({formatCurrency(metrics.revenue?.pending_invoices?.amount || 0)})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className={`text-sm font-semibold ${
                metrics.revenue?.overdue_invoices?.count > 0 ? 'text-red-500' : ''
              }`}>
                {metrics.revenue?.overdue_invoices?.count || 0}
                <span className="text-xs text-muted-foreground ml-1">
                  ({formatCurrency(metrics.revenue?.overdue_invoices?.amount || 0)})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Deal Pipeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Deal Pipeline</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Open Deals</p>
              <p className="text-lg font-semibold">
                {metrics.deal_pipeline?.open_deals || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Value: {formatCurrency(metrics.deal_pipeline?.total_pipeline_value || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Closed YTD</p>
              <p className="text-lg font-semibold">
                {metrics.deal_pipeline?.closed_deals_ytd || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Conv: {metrics.deal_pipeline?.conversion_rate || 0}%
              </p>
            </div>
          </div>
          <div className="pl-6">
            <p className="text-xs text-muted-foreground">Avg Deal Size</p>
            <p className="text-sm font-semibold">
              {formatCurrency(metrics.deal_pipeline?.average_deal_size || 0)}
            </p>
          </div>
        </div>

        {/* Investors */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Investor Base</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">
                {metrics.investors?.total_active || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-semibold text-green-500">
                {metrics.investors?.kyc_approved || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-yellow-500">
                {metrics.investors?.kyc_pending || 0}
              </p>
            </div>
          </div>
          <div className="pl-6">
            <p className="text-xs text-muted-foreground">New This Month</p>
            <p className="text-sm font-semibold">
              {metrics.investors?.new_investors_mtd || 0}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2 border-t pt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Performance Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">IRR (YTD)</p>
              <p className="text-lg font-semibold">
                {metrics.performance?.irr_ytd || 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Multiple</p>
              <p className="text-lg font-semibold">
                {metrics.performance?.multiple || 0}x
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">DPI</p>
              <p className="text-sm font-semibold">
                {metrics.performance?.dpi || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TVPI</p>
              <p className="text-sm font-semibold">
                {metrics.performance?.tvpi || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Portfolio Value:</span>
              <span className="font-semibold ml-1">
                {formatCurrency(metrics.summary?.total_portfolio_value || 0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Distributions YTD:</span>
              <span className="font-semibold ml-1">
                {formatCurrency(metrics.summary?.total_distributions_ytd || 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}