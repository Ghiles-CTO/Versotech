'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, TrendingUp, DollarSign, Building2 } from 'lucide-react'

interface DealOverviewTabProps {
  deal: any
}

export function DealOverviewTab({ deal }: DealOverviewTabProps) {
  const progressPercent = deal.target_amount
    ? Math.round((deal.raised_amount / deal.target_amount) * 100)
    : 0

  return (
    <div className="space-y-6">
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

