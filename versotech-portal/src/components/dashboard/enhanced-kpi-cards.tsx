'use client'

import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Wallet, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPIData {
  currentNAV: number
  totalContributed: number
  totalDistributions: number
  unfundedCommitment: number
  currency?: string
  navChange?: number // percentage change
}

interface EnhancedKPICardsProps {
  data: KPIData
}

interface KPICardProps {
  title: string
  value: number
  currency: string
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  accentColor: string
}

function formatCurrency(value: number, currency: string): string {
  if (value >= 1000000) {
    return `${currency} ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${currency} ${(value / 1000).toFixed(0)}K`
  }
  return `${currency} ${value.toLocaleString()}`
}

function KPICard({ title, value, currency, icon: Icon, trend, trendLabel, accentColor }: KPICardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0
  
  return (
    <Card className={cn(
      "group relative overflow-hidden border-0 bg-white transition-all duration-300",
      "hover:shadow-lg hover:shadow-slate-200/50 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50",
      "before:absolute before:inset-0 before:rounded-lg before:border before:border-slate-200/60",
      "dark:before:border-zinc-700/60",
      "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:opacity-0",
      "after:transition-opacity after:duration-300 group-hover:after:opacity-100",
      accentColor
    )}>
      <CardContent className="relative z-10 p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(value, currency)}
              </p>
              {trend !== undefined && (
                <div className="flex items-center gap-1.5">
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ) : isNegative ? (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  ) : null}
                  <span className={cn(
                    "text-xs font-medium",
                    isPositive && "text-emerald-600 dark:text-emerald-400",
                    isNegative && "text-rose-600 dark:text-rose-400",
                    !isPositive && !isNegative && "text-slate-500"
                  )}>
                    {isPositive ? '+' : ''}{trend}%
                  </span>
                  {trendLabel && (
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                      {trendLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-slate-100 text-slate-600",
            "dark:bg-zinc-800 dark:text-zinc-400"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EnhancedKPICards({ data }: EnhancedKPICardsProps) {
  const currency = data.currency || 'USD'
  
  const cards = [
    {
      title: 'Current NAV',
      value: data.currentNAV,
      icon: Wallet,
      trend: data.navChange,
      trendLabel: 'vs last month',
      accentColor: 'after:from-blue-500/5 after:to-indigo-500/5'
    },
    {
      title: 'Total Contributed',
      value: data.totalContributed,
      icon: DollarSign,
      accentColor: 'after:from-emerald-500/5 after:to-teal-500/5'
    },
    {
      title: 'Distributions',
      value: data.totalDistributions,
      icon: PiggyBank,
      accentColor: 'after:from-amber-500/5 after:to-orange-500/5'
    },
    {
      title: 'Unfunded Commitment',
      value: data.unfundedCommitment,
      icon: Target,
      accentColor: 'after:from-purple-500/5 after:to-pink-500/5'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KPICard
          key={card.title}
          title={card.title}
          value={card.value}
          currency={currency}
          icon={card.icon}
          trend={card.trend}
          trendLabel={card.trendLabel}
          accentColor={card.accentColor}
        />
      ))}
    </div>
  )
}
