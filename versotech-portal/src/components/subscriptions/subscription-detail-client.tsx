'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Minus,
} from 'lucide-react'
import { getCountryName } from '@/components/kyc/country-select'
import Link from 'next/link'
import { SubscriptionEditDialog } from './subscription-edit-dialog'
import { CapitalActivityTable } from './capital-activity-table'
import { SubscriptionWithRelations, SubscriptionMetrics } from '@/types/subscription'
import { SubscriptionDocumentsTab } from './subscription-documents-tab'

interface SubscriptionDetailClientProps {
  subscription: SubscriptionWithRelations
  cashflows: any[]
  capitalCalls: any[]
  distributions: any[]
  metrics: SubscriptionMetrics
}

export function SubscriptionDetailClient({
  subscription,
  cashflows,
  capitalCalls,
  distributions,
  metrics,
}: SubscriptionDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPreciseCurrency = (amount: number) => {
    const str = amount.toString()
    const decimalIndex = str.indexOf('.')
    const decimals = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription.currency || 'USD',
      minimumFractionDigits: Math.max(2, decimals),
      maximumFractionDigits: Math.max(2, decimals),
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-600 dark:text-green-400',
      committed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
      closed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
    }
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/subscriptions">
            <Button variant="outline" size="sm" className="bg-muted text-foreground border-border hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscriptions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Subscription #{subscription.subscription_number}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subscription.investor?.legal_name || 'Unknown Investor'} · {subscription.vehicle?.name || 'No Vehicle'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Subscription
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        <Badge className={getStatusColor(subscription.status)}>
          {subscription.status.toUpperCase()}
        </Badge>
        {subscription.investor?.kyc_status && (
          <Badge variant="outline" className="border-border text-muted-foreground">
            KYC: {subscription.investor.kyc_status}
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics.total_commitment)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {subscription.currency}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.total_contributed)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {metrics.total_contributed > 0
                ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}% funded`
                : 'No contributions'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unfunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(metrics.unfunded_commitment)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Minus className="h-3 w-3" />
              Remaining commitment
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current NAV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(metrics.current_nav)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Distributed: {formatCurrency(metrics.total_distributed)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full" id={`subscription-tabs-${subscription.id}`}>
        <TabsList className="bg-card border-border">
          <TabsTrigger value="details" className="data-[state=active]:bg-muted text-foreground">
            Details
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-muted text-foreground">
            Capital Activity
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-muted text-foreground">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Subscription Number</div>
                    <div className="text-sm font-semibold text-foreground">
                      #{String(subscription.subscription_number).padStart(5, '0')}
                    </div>
                  </div>
                </div>

                <Separator className="bg-muted" />

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Effective Date</div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(subscription.effective_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Funding Due Date</div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(subscription.funding_due_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Committed At</div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(subscription.committed_at)}
                    </div>
                  </div>
                </div>

                {subscription.units && (
                  <>
                    <Separator className="bg-muted" />
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Units</div>
                        <div className="text-sm font-medium text-foreground">
                          {subscription.units.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {subscription.acknowledgement_notes && (
                  <>
                    <Separator className="bg-muted" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Notes</div>
                      <div className="text-sm text-foreground bg-muted p-3 rounded-md">
                        {subscription.acknowledgement_notes}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investor Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Investor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.investor ? (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Legal Name</div>
                        <Link
                          href={`/versotech_main/investors/${subscription.investor.id}`}
                          className="text-sm font-semibold text-foreground hover:underline"
                        >
                          {subscription.investor.legal_name}
                        </Link>
                      </div>
                    </div>

                    <Separator className="bg-muted" />

                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="text-sm font-medium text-foreground capitalize">
                          {subscription.investor.type}
                        </div>
                      </div>
                    </div>

                    {subscription.investor.country && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Country</div>
                          <div className="text-sm font-medium text-foreground">
                            {getCountryName(subscription.investor.country)}
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.investor.email && (
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="text-sm font-medium text-foreground">
                            {subscription.investor.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No investor linked</div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.vehicle ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Vehicle Name</div>
                        <div className="text-sm font-semibold text-foreground">
                          {subscription.vehicle.name}
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-muted" />

                    {subscription.vehicle.entity_code && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Entity Code</div>
                          <div className="text-sm font-medium text-foreground">
                            {subscription.vehicle.entity_code}
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.vehicle.type && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Type</div>
                          <div className="text-sm font-medium text-foreground capitalize">
                            {subscription.vehicle.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.vehicle.currency && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Currency</div>
                          <div className="text-sm font-medium text-foreground">
                            {subscription.vehicle.currency}
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.vehicle.domicile && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Domicile</div>
                          <div className="text-sm font-medium text-foreground">
                            {subscription.vehicle.domicile}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No vehicle linked</div>
                )}
              </CardContent>
            </Card>

            {/* Capital Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Capital Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Calls</span>
                  <span className="text-sm font-semibold text-foreground">{metrics.total_calls}</span>
                </div>

                <Separator className="bg-muted" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Calls</span>
                  <span className="text-sm font-semibold text-yellow-400">{metrics.pending_calls}</span>
                </div>

                <Separator className="bg-muted" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contribution Rate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {metrics.total_commitment > 0
                      ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>

                <Separator className="bg-muted" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capital Calls Total</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(subscription.capital_calls_total || 0)}
                  </span>
                </div>

                <Separator className="bg-muted" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Distributions Total</span>
                  <span className="text-sm font-semibold text-green-400">
                    {formatCurrency(subscription.distributions_total || 0)}
                  </span>
                </div>

                {subscription.outstanding_amount != null && (
                  <>
                    <Separator className="bg-muted" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Outstanding Amount</span>
                      <span className="text-sm font-semibold text-yellow-400">
                        {formatCurrency(subscription.outstanding_amount)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Share Structure */}
            {(subscription.num_shares != null || subscription.price_per_share != null || subscription.cost_per_share != null) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Share Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.num_shares != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Number of Shares</span>
                        <span className="text-sm font-semibold text-foreground">
                          {subscription.num_shares.toLocaleString()}
                        </span>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.price_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price Per Share</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPreciseCurrency(subscription.price_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.cost_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cost Per Share</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPreciseCurrency(subscription.cost_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.spread_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spread Per Share</span>
                        <span className="text-sm font-semibold text-green-400">
                          {formatPreciseCurrency(subscription.spread_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.spread_fee_amount != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spread Fee Amount</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPreciseCurrency(subscription.spread_fee_amount)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fee Structure */}
            {(subscription.subscription_fee_amount != null || subscription.bd_fee_amount != null || subscription.finra_fee_amount != null) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Fee Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.subscription_fee_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subscription Fee</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {formatCurrency(subscription.subscription_fee_amount || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            {subscription.subscription_fee_percent}%
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.bd_fee_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Broker-Dealer Fee</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {formatCurrency(subscription.bd_fee_amount || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            {subscription.bd_fee_percent}%
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.finra_fee_amount != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">FINRA Fee</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(subscription.finra_fee_amount)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Performance Fees */}
            {(subscription.performance_fee_tier1_percent != null || subscription.performance_fee_tier2_percent != null) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Performance Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.performance_fee_tier1_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tier 1</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-purple-400">
                            {subscription.performance_fee_tier1_percent}%
                          </div>
                          {subscription.performance_fee_tier1_threshold != null && (
                            <div className="text-xs text-muted-foreground/70">
                              Threshold: {formatCurrency(subscription.performance_fee_tier1_threshold)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.performance_fee_tier2_percent != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tier 2</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-purple-300">
                          {subscription.performance_fee_tier2_percent}%
                        </div>
                        {subscription.performance_fee_tier2_threshold != null && (
                          <div className="text-xs text-muted-foreground/70">
                            Threshold: {formatCurrency(subscription.performance_fee_tier2_threshold)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Opportunity & Contract */}
            {(subscription.opportunity_name || subscription.contract_date || subscription.sourcing_contract_ref) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Opportunity & Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.opportunity_name && (
                    <>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Opportunity Name</div>
                          <div className="text-sm font-medium text-foreground">
                            {subscription.opportunity_name}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.contract_date && (
                    <>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Contract Date</div>
                          <div className="text-sm font-medium text-foreground">
                            {formatDate(subscription.contract_date)}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.sourcing_contract_ref && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Sourcing Contract Reference</div>
                        <div className="text-sm font-medium text-foreground font-mono">
                          {subscription.sourcing_contract_ref}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Relationships */}
            {(subscription.introducer_id || subscription.introduction_id) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Relationships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.introducer_id && (
                    <>
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Introducer ID</div>
                          <div className="text-sm font-medium text-foreground font-mono text-xs">
                            {subscription.introducer_id}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-muted" />
                    </>
                  )}

                  {subscription.introduction_id && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Introduction ID</div>
                        <div className="text-sm font-medium text-foreground font-mono text-xs">
                          {subscription.introduction_id}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Capital Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                View all cashflows, capital calls, and distributions for this subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CapitalActivityTable
                cashflows={cashflows}
                capitalCalls={capitalCalls}
                distributions={distributions}
                currency={subscription.currency}
                vehicleId={subscription.vehicle_id}
                investorId={subscription.investor_id}
                isStaff={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <SubscriptionDocumentsTab subscriptionId={subscription.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <SubscriptionEditDialog
        subscription={subscription}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
