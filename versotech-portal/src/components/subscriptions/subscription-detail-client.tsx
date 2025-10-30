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
  TrendingDown,
  Minus,
} from 'lucide-react'
import Link from 'next/link'
import { SubscriptionEditDialog } from './subscription-edit-dialog'
import { CapitalActivityTable } from './capital-activity-table'
import { SubscriptionWithRelations, SubscriptionMetrics } from '@/types/subscription'

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
      active: 'bg-green-900 text-green-200',
      committed: 'bg-blue-900 text-blue-200',
      pending: 'bg-yellow-900 text-yellow-200',
      closed: 'bg-gray-700 text-gray-300',
      cancelled: 'bg-red-900 text-red-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-700 text-gray-300'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech/staff/subscriptions">
            <Button variant="outline" size="sm" className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscriptions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Subscription #{subscription.subscription_number}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {subscription.investor.legal_name} · {subscription.vehicle.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="bg-white text-black hover:bg-gray-200"
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
        {subscription.investor.kyc_status && (
          <Badge variant="outline" className="border-gray-700 text-gray-300">
            KYC: {subscription.investor.kyc_status}
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(metrics.total_commitment)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <DollarSign className="h-3 w-3" />
              {subscription.currency}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Contributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.total_contributed)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <TrendingDown className="h-3 w-3" />
              {metrics.total_contributed > 0
                ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}% funded`
                : 'No contributions'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Unfunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(metrics.unfunded_commitment)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Minus className="h-3 w-3" />
              Remaining commitment
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Current NAV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(metrics.current_nav)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <TrendingUp className="h-3 w-3" />
              Distributed: {formatCurrency(metrics.total_distributed)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="details" className="data-[state=active]:bg-gray-800 text-white">
            Details
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-gray-800 text-white">
            Capital Activity
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-gray-800 text-white">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Subscription Number</div>
                    <div className="text-sm font-semibold text-white">
                      #{String(subscription.subscription_number).padStart(5, '0')}
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Effective Date</div>
                    <div className="text-sm font-medium text-white">
                      {formatDate(subscription.effective_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Funding Due Date</div>
                    <div className="text-sm font-medium text-white">
                      {formatDate(subscription.funding_due_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Committed At</div>
                    <div className="text-sm font-medium text-white">
                      {formatDate(subscription.committed_at)}
                    </div>
                  </div>
                </div>

                {subscription.units && (
                  <>
                    <Separator className="bg-gray-800" />
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">Units</div>
                        <div className="text-sm font-medium text-white">
                          {subscription.units.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {subscription.acknowledgement_notes && (
                  <>
                    <Separator className="bg-gray-800" />
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Notes</div>
                      <div className="text-sm text-white bg-gray-800 p-3 rounded-md">
                        {subscription.acknowledgement_notes}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investor Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Investor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Legal Name</div>
                    <Link
                      href={`/versotech/staff/investors/${subscription.investor.id}`}
                      className="text-sm font-semibold text-white hover:underline"
                    >
                      {subscription.investor.legal_name}
                    </Link>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Type</div>
                    <div className="text-sm font-medium text-white capitalize">
                      {subscription.investor.type}
                    </div>
                  </div>
                </div>

                {subscription.investor.country && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Country</div>
                      <div className="text-sm font-medium text-white">
                        {subscription.investor.country}
                      </div>
                    </div>
                  </div>
                )}

                {subscription.investor.email && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-sm font-medium text-white">
                        {subscription.investor.email}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Vehicle Name</div>
                    <div className="text-sm font-semibold text-white">
                      {subscription.vehicle.name}
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                {subscription.vehicle.entity_code && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Entity Code</div>
                      <div className="text-sm font-medium text-white">
                        {subscription.vehicle.entity_code}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Type</div>
                    <div className="text-sm font-medium text-white capitalize">
                      {subscription.vehicle.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">Currency</div>
                    <div className="text-sm font-medium text-white">
                      {subscription.vehicle.currency}
                    </div>
                  </div>
                </div>

                {subscription.vehicle.domicile && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400">Domicile</div>
                      <div className="text-sm font-medium text-white">
                        {subscription.vehicle.domicile}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capital Summary */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Capital Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Calls</span>
                  <span className="text-sm font-semibold text-white">{metrics.total_calls}</span>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Pending Calls</span>
                  <span className="text-sm font-semibold text-yellow-400">{metrics.pending_calls}</span>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Contribution Rate</span>
                  <span className="text-sm font-semibold text-white">
                    {metrics.total_commitment > 0
                      ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Capital Calls Total</span>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(subscription.capital_calls_total || 0)}
                  </span>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Distributions Total</span>
                  <span className="text-sm font-semibold text-green-400">
                    {formatCurrency(subscription.distributions_total || 0)}
                  </span>
                </div>

                {subscription.outstanding_amount != null && (
                  <>
                    <Separator className="bg-gray-800" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Outstanding Amount</span>
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Share Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.num_shares != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Number of Shares</span>
                        <span className="text-sm font-semibold text-white">
                          {subscription.num_shares.toLocaleString()}
                        </span>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.price_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Price Per Share</span>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(subscription.price_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.cost_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Cost Per Share</span>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(subscription.cost_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.spread_per_share != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Spread Per Share</span>
                        <span className="text-sm font-semibold text-green-400">
                          {formatCurrency(subscription.spread_per_share)}
                        </span>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.spread_fee_amount != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Spread Fee Amount</span>
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(subscription.spread_fee_amount)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fee Structure */}
            {(subscription.subscription_fee_amount != null || subscription.bd_fee_amount != null || subscription.finra_fee_amount != null) && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Fee Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.subscription_fee_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Subscription Fee</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {formatCurrency(subscription.subscription_fee_amount || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subscription.subscription_fee_percent}%
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.bd_fee_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Broker-Dealer Fee</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {formatCurrency(subscription.bd_fee_amount || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subscription.bd_fee_percent}%
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.finra_fee_amount != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">FINRA Fee</span>
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(subscription.finra_fee_amount)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Performance Fees */}
            {(subscription.performance_fee_tier1_percent != null || subscription.performance_fee_tier2_percent != null) && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Performance Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.performance_fee_tier1_percent != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Tier 1</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-purple-400">
                            {subscription.performance_fee_tier1_percent}%
                          </div>
                          {subscription.performance_fee_tier1_threshold != null && (
                            <div className="text-xs text-gray-500">
                              Threshold: {formatCurrency(subscription.performance_fee_tier1_threshold)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.performance_fee_tier2_percent != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Tier 2</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-purple-300">
                          {subscription.performance_fee_tier2_percent}%
                        </div>
                        {subscription.performance_fee_tier2_threshold != null && (
                          <div className="text-xs text-gray-500">
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Opportunity & Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.opportunity_name && (
                    <>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-400">Opportunity Name</div>
                          <div className="text-sm font-medium text-white">
                            {subscription.opportunity_name}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.contract_date && (
                    <>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-400">Contract Date</div>
                          <div className="text-sm font-medium text-white">
                            {formatDate(subscription.contract_date)}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.sourcing_contract_ref && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">Sourcing Contract Reference</div>
                        <div className="text-sm font-medium text-white font-mono">
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Relationships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription.introducer_id && (
                    <>
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-400">Introducer ID</div>
                          <div className="text-sm font-medium text-white font-mono text-xs">
                            {subscription.introducer_id}
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-800" />
                    </>
                  )}

                  {subscription.introduction_id && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-400">Introduction ID</div>
                        <div className="text-sm font-medium text-white font-mono text-xs">
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
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Capital Activity</CardTitle>
              <CardDescription className="text-gray-400">
                View all cashflows, capital calls, and distributions for this subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CapitalActivityTable
                cashflows={cashflows}
                capitalCalls={capitalCalls}
                distributions={distributions}
                currency={subscription.currency}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Documents</CardTitle>
              <CardDescription className="text-gray-400">
                Subscription agreements and related documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Document management coming soon</p>
              </div>
            </CardContent>
          </Card>
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
