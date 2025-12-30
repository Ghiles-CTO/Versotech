'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  MapPin,
  Target,
  Briefcase,
  Lock
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

export interface FeaturedDeal {
  id: string
  name: string
  status: string
  deal_type: string
  currency: string | null
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  company_name: string | null
  company_logo_url: string | null
  sector: string | null
  location: string | null
  vehicles?: {
    id: string
    name: string
    type: string | null
  } | null
}

interface FeaturedDealsSectionProps {
  deals: FeaturedDeal[]
}

function getStatusStyles(status: string, isDark: boolean): string {
  const styles: Record<string, { light: string; dark: string }> = {
    open: {
      light: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      dark: 'bg-emerald-900/30 text-emerald-400 border-emerald-700 ring-emerald-500/20'
    },
    allocation_pending: {
      light: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      dark: 'bg-amber-900/30 text-amber-400 border-amber-700 ring-amber-500/20'
    },
    draft: {
      light: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
      dark: 'bg-zinc-800 text-zinc-400 border-zinc-700 ring-zinc-500/20'
    },
    cancelled: {
      light: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      dark: 'bg-rose-900/30 text-rose-400 border-rose-700 ring-rose-500/20'
    },
    closed: {
      light: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
      dark: 'bg-zinc-800 text-zinc-400 border-zinc-700 ring-zinc-500/20'
    }
  }
  const style = styles[status] ?? styles.open
  return isDark ? style.dark : style.light
}

const typeLabels: Record<string, string> = {
  equity_secondary: 'Secondary Equity',
  equity_primary: 'Primary Equity',
  credit_trade_finance: 'Credit & Trade Finance',
  other: 'Other Opportunity'
}

function formatDeadlineCopy(closeAt: string | null, status: string) {
  if (!closeAt) {
    return status === 'closed' ? 'Closed' : 'Timeline to be announced'
  }

  const closeDate = new Date(closeAt)
  const now = new Date()

  if (status === 'closed' || closeDate < now) {
    return `Closed ${closeDate.toLocaleDateString()}`
  }

  const diffMs = closeDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Closing soon'
  if (diffDays === 1) return 'Closes tomorrow'
  if (diffDays <= 14) return `Closes in ${diffDays} days`

  return `Closes ${closeDate.toLocaleDateString()}`
}

function formatCurrency(amount: number | null, currency: string | null) {
  if (amount === null || amount === undefined) return null
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency ?? 'USD',
      maximumFractionDigits: amount >= 1000 ? 0 : 2
    }).format(amount)
  } catch {
    return `${currency ?? 'USD'} ${amount.toLocaleString()}`
  }
}

export function FeaturedDealsSection({ deals }: FeaturedDealsSectionProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const safeDeals = Array.isArray(deals) ? deals.filter(Boolean) : []

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className={cn(
            "text-2xl font-medium font-serif",
            isDark ? "text-white" : "text-slate-900"
          )}>Featured Opportunities</h2>
          <p className={cn(
            "text-sm",
            isDark ? "text-zinc-400" : "text-slate-500"
          )}>Exclusive investment access curated for your mandate.</p>
        </div>
        <Link href="/versotech_main/opportunities">
          <Button variant="outline" className={cn(
            "gap-2",
            isDark
              ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          )}>
            View all deals
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {safeDeals.length === 0 ? (
        <Card className={cn(
          "glass-panel border-dashed",
          isDark ? "border-zinc-700" : "border-slate-300"
        )}>
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className={cn(
              "mb-4 rounded-full p-4 shadow-sm",
              isDark ? "bg-zinc-800" : "bg-slate-100"
            )}>
              <Briefcase className={cn(
                "h-8 w-8",
                isDark ? "text-zinc-500" : "text-slate-400"
              )} />
            </div>
            <CardTitle className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>No active opportunities</CardTitle>
            <CardDescription className={cn(
              "mt-2 max-w-md",
              isDark ? "text-zinc-400" : "text-slate-600"
            )}>
              There are currently no deals matching your profile. You can browse our complete historical archive or request access to specific sectors.
            </CardDescription>
            <div className="mt-6 flex gap-3">
              <Link href="/versotech_main/opportunities?view=archive">
                <Button variant="outline" className={cn(
                  "gap-2",
                  isDark && "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                )}>
                  Browse archive
                </Button>
              </Link>
              <Link href="/versotech_main/inbox">
                <Button className={cn(
                  "gap-2",
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                )}>
                  Contact Relationship Manager
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeDeals.map((deal) => {
            const dealStatus = deal.status ?? 'open'
            const statusClass = getStatusStyles(dealStatus, isDark)
            const typeLabel = typeLabels[deal.deal_type] ?? 'Opportunity'
            const headline = deal.company_name || deal.name
            const initial = (headline ?? 'V').trim().charAt(0).toUpperCase() || 'V'
            const closingCopy = formatDeadlineCopy(deal.close_at, dealStatus)
            const formattedPrice = formatCurrency(deal.offer_unit_price, deal.currency)

            return (
              <Card key={deal.id} className={cn(
                "glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 ring-1 hover:ring-amber-200/50",
                isDark ? "ring-white/10" : "ring-slate-200/50"
              )}>
                {/* Premium gradient overlay on hover */}
                <div className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  isDark
                    ? "from-amber-900/20 via-zinc-900/10 to-transparent"
                    : "from-amber-50/30 via-slate-50/10 to-transparent"
                )} />

                <CardHeader className="relative space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <Avatar className={cn(
                        "h-14 w-14 border shadow-sm",
                        isDark ? "border-zinc-700 bg-zinc-900" : "border-slate-100 bg-white"
                      )}>
                        {deal.company_logo_url ? (
                          <AvatarImage src={deal.company_logo_url} alt={headline ?? deal.name} className="object-contain p-2" />
                        ) : (
                          <AvatarFallback className={cn(
                            "font-serif text-lg",
                            isDark ? "bg-white text-black" : "bg-slate-900 text-white"
                          )}>
                            {initial}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className={cn(
                            "text-[10px] font-medium uppercase tracking-wider",
                            isDark
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            {deal.sector || 'Private Equity'}
                          </Badge>
                          {dealStatus === 'open' && (
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-semibold uppercase tracking-wider",
                              isDark
                                ? "border-emerald-700 bg-emerald-900/30 text-emerald-400"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            )}>
                              Open
                            </Badge>
                          )}
                        </div>
                        <CardTitle className={cn(
                          "line-clamp-1 font-serif text-xl transition-colors group-hover:text-amber-600",
                          isDark ? "text-white" : "text-slate-900"
                        )}>
                          {deal.name}
                        </CardTitle>
                        {deal.company_name && (
                          <CardDescription className={cn(
                            "line-clamp-1 text-sm",
                            isDark ? "text-zinc-400" : "text-slate-500"
                          )}>
                            {deal.company_name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative flex-grow space-y-4 px-6 pb-6">
                  <div className={cn(
                    "grid grid-cols-2 gap-4 rounded-xl p-4 transition-colors",
                    isDark
                      ? "bg-zinc-800/50 group-hover:bg-zinc-800"
                      : "bg-slate-50/50 group-hover:bg-white/50"
                  )}>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        isDark ? "text-zinc-500" : "text-slate-400"
                      )}>Unit Price</p>
                      <div className={cn(
                        "flex items-center gap-1.5 font-semibold",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        <Target className="h-3.5 w-3.5 text-amber-600" />
                        {formattedPrice || 'TBD'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        isDark ? "text-zinc-500" : "text-slate-400"
                      )}>Closing</p>
                      <div className={cn(
                        "flex items-center gap-1.5 font-semibold",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        <CalendarClock className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="line-clamp-1 text-xs">{closingCopy}</span>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "flex flex-wrap gap-2 text-xs",
                    isDark ? "text-zinc-400" : "text-slate-500"
                  )}>
                    <div className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-sm",
                      isDark ? "border-zinc-700 bg-zinc-800" : "border-slate-100 bg-white"
                    )}>
                      <Briefcase className={cn(
                        "h-3 w-3",
                        isDark ? "text-zinc-500" : "text-slate-400"
                      )} />
                      {typeLabel}
                    </div>
                    {deal.location && (
                      <div className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-sm",
                        isDark ? "border-zinc-700 bg-zinc-800" : "border-slate-100 bg-white"
                      )}>
                        <MapPin className={cn(
                          "h-3 w-3",
                          isDark ? "text-zinc-500" : "text-slate-400"
                        )} />
                        {deal.location}
                      </div>
                    )}
                    {deal.vehicles?.name && (
                      <div className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-sm",
                        isDark ? "border-zinc-700 bg-zinc-800" : "border-slate-100 bg-white"
                      )}>
                        <Building2 className={cn(
                          "h-3 w-3",
                          isDark ? "text-zinc-500" : "text-slate-400"
                        )} />
                        {deal.vehicles.name}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className={cn(
                  "relative border-t p-4",
                  isDark ? "border-white/10" : "border-slate-100"
                )}>
                  <Link href={`/versotech_main/opportunities/${deal.id}`} className="w-full">
                    <Button className={cn(
                      "w-full justify-between shadow-sm group-hover:border-amber-200 group-hover:text-amber-600",
                      isDark
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )} variant="outline">
                      Review opportunity
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
