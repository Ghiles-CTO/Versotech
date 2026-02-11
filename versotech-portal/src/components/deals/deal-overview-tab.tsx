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
  subscriptionSubmissions?: any[]
}

export function DealOverviewTab({
  deal,
  memberships = [],
  subscriptionsForJourney = [],
  subscriptionSubmissions = []
}: DealOverviewTabProps) {
  const progressPercent = deal.target_amount
    ? Math.round((deal.raised_amount / deal.target_amount) * 100)
    : 0

  // Create subscription maps for journey tracking
  const subscriptionMap = new Map(
    subscriptionsForJourney.map(s => [s.investor_id, s])
  )
  const submissionMap = new Map(
    subscriptionSubmissions.map(s => [s.investor_id, s])
  )

  // Enhance memberships with subscription data
  const enhancedMembers = memberships.map(m => ({
    ...m,
    subscription: m.investor_id ? subscriptionMap.get(m.investor_id) : null,
    subscriptionSubmission: m.investor_id ? submissionMap.get(m.investor_id) : null
  }))

  const hasSubscriptionActivity = (member: any) => (
    !!member.subscriptionSubmission?.submitted_at ||
    !!member.subscription?.pack_generated_at ||
    !!member.subscription?.pack_sent_at ||
    !!member.subscription?.signed_at ||
    !!member.subscription?.funded_at
  )

  const buildJourneyStats = (members: any[]) => ({
    total: members.length,
    dispatched: members.filter(m => m.dispatched_at).length,
    viewed: members.filter(m => m.viewed_at).length,
    interested: members.filter(m => m.interest_confirmed_at).length,
    ndaSigned: members.filter(m => m.nda_signed_at).length,
    dataRoom: members.filter(m => m.data_room_granted_at).length,
    subscriptionRequested: members.filter(m => hasSubscriptionActivity(m)).length,
    packGen: members.filter(m => m.subscription?.pack_generated_at).length,
    packSent: members.filter(m => m.subscription?.pack_sent_at).length,
    signed: members.filter(m => m.subscription?.signed_at).length,
    funded: members.filter(m => m.subscription?.funded_at).length,
  })

  const overallStats = buildJourneyStats(enhancedMembers)

  const journeyStages: { label: string; key: keyof ReturnType<typeof buildJourneyStats> }[] = [
    { label: 'Dispatched', key: 'dispatched' },
    { label: 'Viewed', key: 'viewed' },
    { label: 'Access Requested', key: 'interested' },
    { label: 'NDA Signed', key: 'ndaSigned' },
    { label: 'Data Room', key: 'dataRoom' },
    { label: 'Subscribed', key: 'subscriptionRequested' },
    { label: 'Subscription Pack', key: 'packGen' },
    { label: 'Pack Sent', key: 'packSent' },
    { label: 'Signed', key: 'signed' },
    { label: 'Funded', key: 'funded' },
  ]

  const renderPipeline = (
    title: string,
    stats: ReturnType<typeof buildJourneyStats>,
    stages: { label: string; key: keyof ReturnType<typeof buildJourneyStats> }[],
    showHeader = true
  ) => {
    const stagesWithCounts = stages.map(stage => ({
      ...stage,
      count: stats[stage.key] as number
    }))

    const getConversion = (idx: number) => {
      if (idx === 0) return stats.total > 0 ? Math.round((stagesWithCounts[0].count / stats.total) * 100) : 0
      const prev = stagesWithCounts[idx - 1].count
      if (prev === 0) return 0
      return Math.round((stagesWithCounts[idx].count / prev) * 100)
    }

    return (
      <div className="space-y-3">
        {showHeader && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">{stats.total} total</span>
          </div>
        )}
        <div className="relative pt-2">
          <div className="absolute top-[26px] left-5 right-5 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent" />
          <div className="relative flex items-start justify-between">
            {stagesWithCounts.map((stage, idx) => {
              const isActive = stage.count > 0
              const isFinal = stage.label === 'Funded'
              const conversion = getConversion(idx)

              return (
                <div
                  key={`${title}-${stage.label}`}
                  className="flex flex-col items-center group"
                  style={{ flex: '1 1 0' }}
                >
                  <div
                    className={`
                      relative z-10 w-11 h-11 rounded-full flex items-center justify-center
                      text-sm font-semibold transition-all duration-300 cursor-default
                      ${isActive
                        ? isFinal
                          ? 'bg-emerald-500/25 text-emerald-300 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                        : 'bg-muted text-muted-foreground/60'
                      }
                      group-hover:scale-110 group-hover:ring-emerald-400/40
                    `}
                  >
                    {stage.count}
                  </div>

                  <span className={`
                    text-[10px] mt-2 text-center leading-tight transition-colors
                    ${isActive ? 'text-foreground/70' : 'text-muted-foreground/50'}
                    group-hover:text-foreground
                  `}>
                    {stage.label}
                  </span>

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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Investor Journey Pipeline */}
      {memberships.length > 0 && (
        <Card className="border border-border bg-muted/30 overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Investor Pipeline
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {overallStats.total} total
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {renderPipeline('Investor Journey', overallStats, journeyStages, false)}

            {/* Summary stats row */}
            <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{overallStats.funded}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Funded</div>
              </div>
              <div className="w-px h-8 bg-muted" />
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {overallStats.total > 0 ? Math.round((overallStats.funded / overallStats.total) * 100) : 0}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</div>
              </div>
              <div className="w-px h-8 bg-muted" />
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">{overallStats.signed}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Signed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Information */}
      <Card className="border border-border bg-muted/50">
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
                    <Badge variant="outline" className="border-border">
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
      <Card className="border border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fundraising Progress
          </CardTitle>
          <CardDescription>Target and raised amounts. Investment terms (price, min/max) are defined in the Term Sheet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Target Amount</label>
              <p className="text-2xl font-bold text-foreground mt-1">
                {deal.currency} {deal.target_amount?.toLocaleString() || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Raised Amount</label>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {deal.currency} {deal.raised_amount?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {deal.target_amount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {progressPercent}% of target
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border border-border bg-muted/50">
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
                  day: 'numeric',
                  timeZone: 'UTC'
                }) : '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Close Date</label>
              <p className="text-foreground mt-1">
                {deal.close_at ? new Date(deal.close_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC'
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
        <Card className="border border-border bg-muted/50">
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
