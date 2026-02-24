'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getCountryName } from '@/components/kyc/country-select'
import {
  Building2,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  Users,
  FileText,
  DollarSign,
  Handshake,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  Scale,
  CalendarDays,
  CreditCard,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import {
  PartnerCommissionSummary,
  type CommissionSummary,
} from '@/components/partners/partner-commission-summary'
import { RecordCPCommissionDialog } from './record-cp-commission-dialog'
import Link from 'next/link'

type CommercialPartnerDetail = {
  id: string
  name: string
  legal_name: string | null
  cp_type: string | null
  status: string
  regulatory_status: string | null
  jurisdiction: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  country: string | null
  logo_url: string | null
  kyc_status: string | null
  contract_end_date: string | null
  created_at: string
}

type FeeComponent = {
  id: string
  kind: string
  rate_bps: number | null
  flat_amount: number | null
}

type FeePlan = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  effective_from: string | null
  effective_until: string | null
  deal_id: string | null
  created_at: string
  components: FeeComponent[]
}

type PlacementAgreement = {
  id: string
  agreement_type: string
  default_commission_bps: number
  commission_cap_amount: number | null
  territory: string | null
  exclusivity_level: string | null
  effective_date: string | null
  expiry_date: string | null
  status: string
  created_at: string
}

type Deal = {
  id: string
  name: string
  company_name: string | null
  status: string
  currency: string | null
}

type Referral = {
  id: string
  created_at: string
  investor: { id: string; name: string } | null
  deal: { id: string; name: string; company_name: string | null } | null
}

type Commission = {
  id: string
  status: string
  accrual_amount: number
  currency: string
  created_at: string
  deal?: { id: string; name: string } | null
}

const COMMISSION_STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string }> = {
  accrued: { icon: Clock, color: 'text-blue-600' },
  invoice_requested: { icon: Send, color: 'text-yellow-600' },
  invoice_submitted: { icon: FileText, color: 'text-indigo-600' },
  invoiced: { icon: FileText, color: 'text-orange-600' },
  paid: { icon: CheckCircle2, color: 'text-green-600' },
  cancelled: { icon: AlertCircle, color: 'text-gray-400' },
  rejected: { icon: AlertCircle, color: 'text-red-600' },
}

type CPData = {
  commercial_partner: CommercialPartnerDetail
  fee_plans: FeePlan[]
  commission_summary: CommissionSummary
  placement_agreements: PlacementAgreement[]
  deals: Deal[]
  recent_referrals: Referral[]
  stats: {
    total_deals: number
    total_referrals: number
    active_fee_plans: number
    active_agreements: number
  }
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  pending_internal_approval: 'bg-orange-100 text-orange-800 border-orange-200',
  pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

const KYC_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  not_started: 'bg-gray-100 text-gray-800',
}

interface CommercialPartnerDetailDrawerProps {
  commercialPartnerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommercialPartnerDetailDrawer({
  commercialPartnerId,
  open,
  onOpenChange,
}: CommercialPartnerDetailDrawerProps) {
  const [data, setData] = useState<CPData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordCommissionOpen, setRecordCommissionOpen] = useState(false)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [commissionsLoading, setCommissionsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchCPDetails = async () => {
    if (!commercialPartnerId) return
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/arrangers/me/commercial-partners/${commercialPartnerId}`)

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to fetch commercial partner details')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      console.error('[CPDetailDrawer] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load details')
    } finally {
      setLoading(false)
    }
  }

  const fetchCommissions = async () => {
    if (!commercialPartnerId) return
    try {
      setCommissionsLoading(true)
      const response = await fetch(
        `/api/arrangers/me/commercial-partner-commissions?commercial_partner_id=${commercialPartnerId}`
      )
      if (response.ok) {
        const result = await response.json()
        setCommissions(result.data || [])
      }
    } catch (err) {
      console.error('[CPDetailDrawer] Error fetching commissions:', err)
    } finally {
      setCommissionsLoading(false)
    }
  }

  useEffect(() => {
    if (!commercialPartnerId || !open) {
      setData(null)
      setCommissions([])
      return
    }
    fetchCPDetails()
    fetchCommissions()
  }, [commercialPartnerId, open])

  const handleCommissionRecorded = () => {
    fetchCPDetails()
    fetchCommissions()
  }

  const handleRequestInvoice = async (commission: Commission) => {
    setActionLoading(commission.id)
    try {
      const response = await fetch(
        `/api/arrangers/me/commercial-partner-commissions/${commission.id}/request-invoice`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      )
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to request invoice')
      }
      // Refresh data
      fetchCPDetails()
      fetchCommissions()
    } catch (err) {
      console.error('[CPDetailDrawer] Request invoice error:', err)
      alert(err instanceof Error ? err.message : 'Failed to request invoice')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestPayment = async (commission: Commission) => {
    setActionLoading(commission.id)
    try {
      const response = await fetch(
        `/api/arrangers/me/commercial-partner-commissions/${commission.id}/request-payment`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      )
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to request payment')
      }
      // Refresh data
      fetchCPDetails()
      fetchCommissions()
    } catch (err) {
      console.error('[CPDetailDrawer] Request payment error:', err)
      alert(err instanceof Error ? err.message : 'Failed to request payment')
    } finally {
      setActionLoading(null)
    }
  }

  if (!open) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : data ? (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start gap-4">
                  {data.commercial_partner.logo_url ? (
                    <img
                      src={data.commercial_partner.logo_url}
                      alt={data.commercial_partner.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{data.commercial_partner.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                      {data.commercial_partner.cp_type && (
                        <Badge variant="secondary" className="capitalize">
                          {data.commercial_partner.cp_type.replace('_', ' ')}
                        </Badge>
                      )}
                      {data.commercial_partner.jurisdiction && (
                        <span className="flex items-center gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          {data.commercial_partner.jurisdiction}
                        </span>
                      )}
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn('capitalize', STATUS_STYLES[data.commercial_partner.status])}
                      >
                        {data.commercial_partner.status}
                      </Badge>
                      {data.commercial_partner.kyc_status && (
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', KYC_STYLES[data.commercial_partner.kyc_status])}
                        >
                          KYC: {data.commercial_partner.kyc_status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 py-4">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Deals</div>
                  <div className="text-lg font-semibold">{data.stats.total_deals}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Referrals</div>
                  <div className="text-lg font-semibold">{data.stats.total_referrals}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Fee Plans</div>
                  <div className="text-lg font-semibold">{data.stats.active_fee_plans}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Agreements</div>
                  <div className="text-lg font-semibold">{data.stats.active_agreements}</div>
                </Card>
              </div>

              <Separator />

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="fee-plans">Fee Plans</TabsTrigger>
                  <TabsTrigger value="commissions">Commissions</TabsTrigger>
                  <TabsTrigger value="agreements">Agreements</TabsTrigger>
                  <TabsTrigger value="referrals">Referrals</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.commercial_partner.contact_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {data.commercial_partner.contact_name}
                        </div>
                      )}
                      {data.commercial_partner.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${data.commercial_partner.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {data.commercial_partner.contact_email}
                          </a>
                        </div>
                      )}
                      {data.commercial_partner.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {data.commercial_partner.contact_phone}
                        </div>
                      )}
                      {data.commercial_partner.country && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {getCountryName(data.commercial_partner.country)}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Regulatory Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.commercial_partner.regulatory_status && (
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          Status: {data.commercial_partner.regulatory_status}
                        </div>
                      )}
                      {data.commercial_partner.jurisdiction && (
                        <div className="flex items-center gap-2 text-sm">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          Jurisdiction: {data.commercial_partner.jurisdiction}
                        </div>
                      )}
                      {data.commercial_partner.contract_end_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          Contract expires: {formatDate(data.commercial_partner.contract_end_date)}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {data.deals.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Deals Involved</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {data.deals.slice(0, 5).map((deal) => (
                            <div
                              key={deal.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{deal.name}</span>
                              <Badge variant="outline" className="capitalize">
                                {deal.status}
                              </Badge>
                            </div>
                          ))}
                          {data.deals.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{data.deals.length - 5} more deals
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Fee Plans Tab */}
                <TabsContent value="fee-plans" className="space-y-4 mt-4">
                  {data.fee_plans.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No fee plans assigned</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="/versotech_main/fee-plans">Create Fee Plan</Link>
                      </Button>
                    </div>
                  ) : (
                    data.fee_plans.map((plan) => (
                      <Card key={plan.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{plan.name}</CardTitle>
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {plan.description && (
                            <CardDescription className="text-xs">
                              {plan.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground mb-2">
                            Effective: {formatDate(plan.effective_from || '')}
                            {plan.effective_until && ` - ${formatDate(plan.effective_until)}`}
                          </div>
                          {plan.components && plan.components.length > 0 && (
                            <div className="space-y-1">
                              {plan.components.map((comp) => (
                                <div
                                  key={comp.id}
                                  className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded"
                                >
                                  <span className="capitalize">{comp.kind.replace('_', ' ')}</span>
                                  <span className="font-medium">
                                    {comp.rate_bps
                                      ? `${(comp.rate_bps / 100).toFixed(2)}%`
                                      : formatCurrency(comp.flat_amount || 0, 'USD')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Commissions Tab */}
                <TabsContent value="commissions" className="space-y-4 mt-4">
                  <PartnerCommissionSummary summary={data.commission_summary} variant="card" />

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecordCommissionOpen(true)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Commission
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/versotech_main/lawyer-reconciliation">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Reconciliation
                      </Link>
                    </Button>
                  </div>

                  {/* Commissions List with Actions */}
                  {commissionsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : commissions.length > 0 ? (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Recent Commissions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {commissions.slice(0, 10).map((commission) => {
                          const config = COMMISSION_STATUS_CONFIG[commission.status] || COMMISSION_STATUS_CONFIG.accrued
                          const StatusIcon = config.icon

                          return (
                            <div key={commission.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                              <div className="flex items-center gap-2">
                                <StatusIcon className={cn('h-4 w-4', config.color)} />
                                <div>
                                  <div className="font-medium text-sm">
                                    {formatCurrency(commission.accrual_amount, commission.currency)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {commission.deal?.name || 'No deal'} • {formatDate(commission.created_at)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {commission.status.replace(/_/g, ' ')}
                                </Badge>
                                {commission.status === 'accrued' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRequestInvoice(commission)}
                                    disabled={actionLoading === commission.id}
                                  >
                                    {actionLoading === commission.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <FileText className="h-3.5 w-3.5 mr-1" />
                                        Request Invoice
                                      </>
                                    )}
                                  </Button>
                                )}
                                {commission.status === 'invoiced' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRequestPayment(commission)}
                                    disabled={actionLoading === commission.id}
                                  >
                                    {actionLoading === commission.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                                        Request Payment
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-6 text-center text-muted-foreground text-sm">
                        No commissions recorded yet
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Agreements Tab */}
                <TabsContent value="agreements" className="space-y-4 mt-4">
                  {data.placement_agreements.length === 0 ? (
                    <div className="text-center py-8">
                      <Handshake className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No placement agreements</p>
                    </div>
                  ) : (
                    data.placement_agreements.map((agreement) => (
                      <Card key={agreement.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm capitalize">
                              {agreement.agreement_type.replace('_', ' ')} Agreement
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', STATUS_STYLES[agreement.status])}
                            >
                              {agreement.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Commission:</span>
                              <span className="ml-1 font-medium">
                                {(agreement.default_commission_bps / 100).toFixed(2)}%
                              </span>
                            </div>
                            {agreement.commission_cap_amount && (
                              <div>
                                <span className="text-muted-foreground">Cap:</span>
                                <span className="ml-1 font-medium">
                                  {formatCurrency(agreement.commission_cap_amount, 'USD')}
                                </span>
                              </div>
                            )}
                            {agreement.territory && (
                              <div>
                                <span className="text-muted-foreground">Territory:</span>
                                <span className="ml-1">{agreement.territory}</span>
                              </div>
                            )}
                            {agreement.exclusivity_level && (
                              <div>
                                <span className="text-muted-foreground">Exclusivity:</span>
                                <span className="ml-1 capitalize">
                                  {agreement.exclusivity_level.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </div>
                          {agreement.effective_date && (
                            <div className="text-xs text-muted-foreground">
                              Effective: {formatDate(agreement.effective_date)}
                              {agreement.expiry_date && ` - ${formatDate(agreement.expiry_date)}`}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Referrals Tab */}
                <TabsContent value="referrals" className="space-y-4 mt-4">
                  {data.recent_referrals.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No referrals yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.recent_referrals.map((referral) => (
                        <Card key={referral.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">
                                {referral.investor?.name || 'Unknown Investor'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {referral.deal?.name || 'Unknown Deal'}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(referral.created_at)}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {data && (
        <RecordCPCommissionDialog
          open={recordCommissionOpen}
          onOpenChange={setRecordCommissionOpen}
          commercialPartnerId={data.commercial_partner.id}
          commercialPartnerName={data.commercial_partner.name}
          deals={data.deals}
          feePlans={data.fee_plans}
          onSuccess={handleCommissionRecorded}
        />
      )}
    </>
  )
}
