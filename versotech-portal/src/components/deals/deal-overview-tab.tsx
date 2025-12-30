'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  TrendingUp,
  DollarSign,
  Building2
} from 'lucide-react'

interface DealOverviewTabProps {
  deal: any
  memberships?: any[]
  subscriptionsForJourney?: any[]
}

export function DealOverviewTab({ deal, memberships = [], subscriptionsForJourney = [] }: DealOverviewTabProps) {
  const progressPercent = deal.target_amount
    ? Math.round((deal.raised_amount / deal.target_amount) * 100)
    : 0

  // Create subscription map for journey tracking
  const subscriptionMap = new Map(
    subscriptionsForJourney.map(s => [s.investor_id, s])
  )

  // Enhance memberships with subscription data
  const enhancedMembers = memberships.map(m => ({
    ...m,
    subscription: m.investor_id ? subscriptionMap.get(m.investor_id) : null
  }))

  // Calculate journey stats
  const journeyStats = {
    total: enhancedMembers.length,
    dispatched: enhancedMembers.filter(m => m.dispatched_at).length,
    viewed: enhancedMembers.filter(m => m.viewed_at).length,
    interested: enhancedMembers.filter(m => m.interest_confirmed_at).length,
    ndaSigned: enhancedMembers.filter(m => m.nda_signed_at).length,
    dataRoom: enhancedMembers.filter(m => m.data_room_granted_at).length,
    packGen: enhancedMembers.filter(m => m.subscription?.pack_generated_at).length,
    packSent: enhancedMembers.filter(m => m.subscription?.pack_sent_at).length,
    signed: enhancedMembers.filter(m => m.subscription?.signed_at).length,
    funded: enhancedMembers.filter(m => m.subscription?.funded_at).length,
  }

  const journeyStages = [
    { label: 'Dispatched', count: journeyStats.dispatched },
    { label: 'Viewed', count: journeyStats.viewed },
    { label: 'Interested', count: journeyStats.interested },
    { label: 'NDA', count: journeyStats.ndaSigned },
    { label: 'Data Room', count: journeyStats.dataRoom },
    { label: 'Pack Gen', count: journeyStats.packGen },
    { label: 'Pack Sent', count: journeyStats.packSent },
    { label: 'Signed', count: journeyStats.signed },
    { label: 'Funded', count: journeyStats.funded },
  ]

  // Calculate conversion from previous stage
  const getConversion = (idx: number) => {
    if (idx === 0) return journeyStats.total > 0 ? Math.round((journeyStages[0].count / journeyStats.total) * 100) : 0
    const prev = journeyStages[idx - 1].count
    if (prev === 0) return 0
    return Math.round((journeyStages[idx].count / prev) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Investor Journey Pipeline - Minimalist Design */}
      {memberships.length > 0 && (
        <Card className="border border-white/10 bg-white/[0.02] overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Investor Pipeline
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {journeyStats.total} total
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {/* Pipeline visualization */}
            <div className="relative pt-2">
              {/* Connecting line */}
              <div className="absolute top-[26px] left-5 right-5 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent" />

              {/* Stage nodes */}
              <div className="relative flex items-start justify-between">
                {journeyStages.map((stage, idx) => {
                  const isActive = stage.count > 0
                  const isFinal = stage.label === 'Funded'
                  const conversion = getConversion(idx)

                  return (
                    <div
                      key={stage.label}
                      className="flex flex-col items-center group"
                      style={{ flex: '1 1 0' }}
                    >
                      {/* Node circle */}
                      <div
                        className={`
                          relative z-10 w-11 h-11 rounded-full flex items-center justify-center
                          text-sm font-semibold transition-all duration-300 cursor-default
                          ${isActive
                            ? isFinal
                              ? 'bg-emerald-500/25 text-emerald-300 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                              : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                            : 'bg-white/5 text-muted-foreground/60'
                          }
                          group-hover:scale-110 group-hover:ring-emerald-400/40
                        `}
                      >
                        {stage.count}
                      </div>

                      {/* Label */}
                      <span className={`
                        text-[10px] mt-2 text-center leading-tight transition-colors
                        ${isActive ? 'text-foreground/70' : 'text-muted-foreground/50'}
                        group-hover:text-foreground
                      `}>
                        {stage.label}
                      </span>

                      {/* Conversion rate tooltip on hover */}
                      {idx > 0 && (
                        <span className={`
                          text-[9px] mt-0.5 transition-opacity
                          ${stage.count > 0 ? 'text-emerald-400/60' : 'text-muted-foreground/30'}
                        `}>
                          {conversion}%
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary stats row */}
            <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-white/5">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{journeyStats.funded}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Funded</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {journeyStats.total > 0 ? Math.round((journeyStats.funded / journeyStats.total) * 100) : 0}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{journeyStats.signed}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Signed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Information */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground">Deal Information</CardTitle>
          <CardDescription>Core details and structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deal Name</label>
              <p className="text-lg text-foreground mt-1">{deal.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <p className="text-lg text-foreground mt-1">{deal.company_name || '—'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
              <div className="flex items-center gap-2 mt-1">
                {deal.vehicles ? (
                  <>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{deal.vehicles.name}</span>
                    <Badge variant="outline" className="border-white/20">
                      {deal.vehicles.type}
                    </Badge>
                  </>
                ) : (
                  <span className="text-muted-foreground">No vehicle assigned</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Arranger</label>
              <div className="flex items-center gap-2 mt-1">
                {deal.arranger_entities ? (
                  <>
                    <Building2 className="h-4 w-4 text-amber-500" />
                    <span className="text-foreground">
                      {deal.arranger_entities.company_name || deal.arranger_entities.legal_name}
                    </span>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
                      Mandate
                    </Badge>
                  </>
                ) : (
                  <span className="text-muted-foreground">No arranger assigned</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Sector / Stage</label>
              <p className="text-foreground mt-1">
                {deal.sector || '—'} {deal.stage && `• ${deal.stage}`}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-foreground mt-1">{deal.location || '—'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Currency</label>
              <p className="text-foreground mt-1">{deal.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Terms
          </CardTitle>
          <CardDescription>Pricing and investment parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Offer Price per Unit</label>
              <p className="text-2xl font-bold text-foreground mt-1">
                {deal.currency} {deal.offer_unit_price?.toFixed(2) || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Target Amount</label>
              <p className="text-2xl font-bold text-foreground mt-1">
                {deal.currency} {deal.target_amount?.toLocaleString() || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Minimum Investment</label>
              <p className="text-lg text-foreground mt-1">
                {deal.currency} {deal.minimum_investment?.toLocaleString() || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Maximum Investment</label>
              <p className="text-lg text-foreground mt-1">
                {deal.currency} {deal.maximum_investment?.toLocaleString() || '—'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Raised Amount</span>
              <span className="font-medium text-foreground">
                {deal.currency} {deal.raised_amount?.toLocaleString() || 0} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Timeline
          </CardTitle>
          <CardDescription>Important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Open Date</label>
              <p className="text-foreground mt-1">
                {deal.open_at ? new Date(deal.open_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Close Date</label>
              <p className="text-foreground mt-1">
                {deal.close_at ? new Date(deal.close_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-foreground mt-1">
                {new Date(deal.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {deal.close_at && new Date(deal.close_at) > new Date() && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
                <p className="text-2xl font-bold text-emerald-200 mt-1">
                  {Math.ceil((new Date(deal.close_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description & Thesis */}
      {(deal.description || deal.investment_thesis) && (
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Deal Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground mt-2 whitespace-pre-wrap">{deal.description}</p>
              </div>
            )}

            {deal.investment_thesis && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Investment Thesis</label>
                <p className="text-foreground mt-2 whitespace-pre-wrap">{deal.investment_thesis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
