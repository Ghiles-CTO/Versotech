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

const statusStyles: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  allocation_pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  draft: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  closed: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20'
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
  const safeDeals = Array.isArray(deals) ? deals.filter(Boolean) : []

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-medium font-serif text-slate-900">Featured Opportunities</h2>
          <p className="text-sm text-slate-500">Exclusive investment access curated for your mandate.</p>
        </div>
        <Link href="/versotech_main/opportunities">
          <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            View all deals
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {safeDeals.length === 0 ? (
        <Card className="glass-panel border-dashed border-slate-300">
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 shadow-sm">
              <Briefcase className="h-8 w-8 text-slate-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">No active opportunities</CardTitle>
            <CardDescription className="mt-2 max-w-md text-slate-600">
              There are currently no deals matching your profile. You can browse our complete historical archive or request access to specific sectors.
            </CardDescription>
            <div className="mt-6 flex gap-3">
              <Link href="/versotech_main/opportunities?view=archive">
                <Button variant="outline" className="gap-2">
                  Browse archive
                </Button>
              </Link>
              <Link href="/versotech_main/inbox">
                <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
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
            const statusClass = statusStyles[dealStatus] ?? statusStyles.open
            const typeLabel = typeLabels[deal.deal_type] ?? 'Opportunity'
            const headline = deal.company_name || deal.name
            const initial = (headline ?? 'V').trim().charAt(0).toUpperCase() || 'V'
            const closingCopy = formatDeadlineCopy(deal.close_at, dealStatus)
            const formattedPrice = formatCurrency(deal.offer_unit_price, deal.currency)

            return (
              <Card key={deal.id} className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 ring-1 ring-slate-200/50 hover:ring-amber-200/50">
                {/* Premium gradient overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/30 via-slate-50/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <CardHeader className="relative space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <Avatar className="h-14 w-14 border border-slate-100 bg-white shadow-sm">
                        {deal.company_logo_url ? (
                          <AvatarImage src={deal.company_logo_url} alt={headline ?? deal.name} className="object-contain p-2" />
                        ) : (
                          <AvatarFallback className="bg-slate-900 font-serif text-lg text-white">
                            {initial}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-slate-100 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            {deal.sector || 'Private Equity'}
                          </Badge>
                          {dealStatus === 'open' && (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                              Open
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-1 font-serif text-xl text-slate-900 group-hover:text-amber-900/80 transition-colors">
                          {deal.name}
                        </CardTitle>
                        {deal.company_name && (
                          <CardDescription className="line-clamp-1 text-sm text-slate-500">
                            {deal.company_name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative flex-grow space-y-4 px-6 pb-6">
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50/50 p-4 group-hover:bg-white/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Unit Price</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Target className="h-3.5 w-3.5 text-amber-600" />
                        {formattedPrice || 'TBD'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Closing</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <CalendarClock className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="line-clamp-1 text-xs">{closingCopy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 shadow-sm">
                      <Briefcase className="h-3 w-3 text-slate-400" />
                      {typeLabel}
                    </div>
                    {deal.location && (
                      <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 shadow-sm">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {deal.location}
                      </div>
                    )}
                    {deal.vehicles?.name && (
                      <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 shadow-sm">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {deal.vehicles.name}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="relative border-t border-slate-100 p-4">
                  <Link href={`/versotech_main/opportunities/${deal.id}`} className="w-full">
                    <Button className="w-full justify-between bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 group-hover:border-amber-200 group-hover:text-amber-900 shadow-sm" variant="outline">
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
