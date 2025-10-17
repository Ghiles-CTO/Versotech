'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  MapPin,
  Target
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
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  allocation_pending: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200'
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
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Featured opportunities</h2>
          <p className="text-sm text-muted-foreground">Available investment opportunities.</p>
        </div>
        <Link href="/versoholdings/deals">
          <Button variant="outline" size="sm">
            View all deals
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {safeDeals.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-semibold">No deals available yet</CardTitle>
            <CardDescription>
              We&apos;ll surface new opportunities here as they are shared with you.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Need access to a specific deal? Contact your VERSO relationship manager.
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safeDeals.map((deal) => {
            const dealStatus = deal.status ?? 'open'
            const statusClass = statusStyles[dealStatus] ?? statusStyles.open
            const typeLabel = typeLabels[deal.deal_type] ?? 'Opportunity'
            const headline = deal.company_name || deal.name
            const initial = (headline ?? 'V').trim().charAt(0).toUpperCase() || 'V'
            const closingCopy = formatDeadlineCopy(deal.close_at, dealStatus)
            const formattedPrice = formatCurrency(deal.offer_unit_price, deal.currency)

            return (
              <Card key={deal.id} className="group relative overflow-hidden flex flex-col h-full">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
                </div>
                <CardHeader className="relative space-y-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      {deal.company_logo_url ? (
                        <AvatarImage src={deal.company_logo_url} alt={headline ?? deal.name} />
                      ) : (
                        <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                          {initial}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-h-[3rem] flex flex-col justify-center">
                      <CardTitle className="text-lg leading-tight">{deal.name}</CardTitle>
                      {deal.company_name && (
                        <CardDescription className="text-sm">{deal.company_name}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn('border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide', statusClass)}>
                      {dealStatus.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {typeLabel}
                    </Badge>
                    {deal.vehicles?.name && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                        <Building2 className="h-3 w-3" />
                        {deal.vehicles.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 text-sm text-muted-foreground flex-grow">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarClock className="h-4 w-4 text-indigo-600" />
                    <span>{closingCopy}</span>
                  </div>
                  {formattedPrice && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <span>Unit price {formattedPrice}</span>
                    </div>
                  )}
                  {deal.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{deal.location}</span>
                    </div>
                  )}
                  {deal.sector && (
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Sector: {deal.sector}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="relative border-t pt-4 mt-auto">
                  <Link href={`/versoholdings/deal/${deal.id}`} className="w-full">
                    <Button className="w-full justify-between">
                      Review opportunity
                      <ArrowUpRight className="h-4 w-4" />
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
