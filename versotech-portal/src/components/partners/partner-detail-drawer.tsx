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
  Mail,
  Phone,
  Globe,
  FileText,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PartnerCommissionSummary, type CommissionSummary } from './partner-commission-summary'
import { RecordCommissionDialog } from './record-commission-dialog'
import Link from 'next/link'
import { Plus } from 'lucide-react'

type PartnerDetail = {
  id: string
  name: string
  legal_name: string | null
  partner_type: string | null
  status: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  country: string | null
  logo_url: string | null
  kyc_status: string | null
  created_at: string | null
}

type FeePlan = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  effective_from: string | null
  effective_until: string | null
  deal_id: string | null
  created_at: string | null
  components: any[]
}

type Deal = {
  id: string
  name: string
  company_name: string | null
  status: string
  currency: string
}

type Referral = {
  id: string
  created_at: string
  investor: { id: string; name: string } | null
  deal: { id: string; name: string; company_name: string | null } | null
}

type PartnerData = {
  partner: PartnerDetail
  fee_plans: FeePlan[]
  commission_summary: CommissionSummary
  deals: Deal[]
  recent_referrals: Referral[]
  stats: {
    total_deals: number
    total_referrals: number
    active_fee_plans: number
  }
}

interface PartnerDetailDrawerProps {
  partnerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

const KYC_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  not_started: 'bg-gray-100 text-gray-800',
}

export function PartnerDetailDrawer({
  partnerId,
  open,
  onOpenChange,
}: PartnerDetailDrawerProps) {
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordCommissionOpen, setRecordCommissionOpen] = useState(false)

  const fetchPartnerDetail = async () => {
    if (!partnerId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/arrangers/me/partners/${partnerId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load partner details')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      console.error('[PartnerDetailDrawer] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load partner details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !partnerId) {
      setData(null)
      setError(null)
      return
    }

    fetchPartnerDetail()
  }, [open, partnerId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading partner details...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}

        {data && (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-center gap-3">
                {data.partner.logo_url ? (
                  <img
                    src={data.partner.logo_url}
                    alt={data.partner.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <SheetTitle>{data.partner.name}</SheetTitle>
                  <SheetDescription>
                    {data.partner.partner_type && (
                      <span className="capitalize">{data.partner.partner_type.replace('_', ' ')}</span>
                    )}
                    {data.partner.country && ` • ${getCountryName(data.partner.country)}`}
                  </SheetDescription>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={cn('capitalize', STATUS_STYLES[data.partner.status] || STATUS_STYLES.active)}
                >
                  {data.partner.status}
                </Badge>
                {data.partner.kyc_status && (
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', KYC_STYLES[data.partner.kyc_status] || '')}
                  >
                    KYC: {data.partner.kyc_status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <Separator className="my-4" />

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="p-3">
                <div className="text-2xl font-bold text-primary">{data.stats.total_deals}</div>
                <div className="text-xs text-muted-foreground">Deals</div>
              </Card>
              <Card className="p-3">
                <div className="text-2xl font-bold text-blue-600">{data.stats.total_referrals}</div>
                <div className="text-xs text-muted-foreground">Referrals</div>
              </Card>
              <Card className="p-3">
                <div className="text-2xl font-bold text-purple-600">{data.stats.active_fee_plans}</div>
                <div className="text-xs text-muted-foreground">Fee Plans</div>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fees">Fee Plans</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Contact Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {data.partner.contact_name && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{data.partner.contact_name}</span>
                      </div>
                    )}
                    {data.partner.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${data.partner.contact_email}`} className="text-primary hover:underline">
                          {data.partner.contact_email}
                        </a>
                      </div>
                    )}
                    {data.partner.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{data.partner.contact_phone}</span>
                      </div>
                    )}
                    {data.partner.country && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{getCountryName(data.partner.country)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Deals List */}
                {data.deals.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Deals Involved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.deals.map((deal) => (
                          <div key={deal.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div>
                              <div className="font-medium text-sm">{deal.name}</div>
                              {deal.company_name && (
                                <div className="text-xs text-muted-foreground">{deal.company_name}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {deal.status}
                              </Badge>
                              <Link href={`/versotech_main/opportunities/${deal.id}`}>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Fee Plans Tab */}
              <TabsContent value="fees" className="mt-4 space-y-4">
                {data.fee_plans.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No fee plans assigned to this partner</p>
                      <Link href="/versotech_main/fee-plans">
                        <Button variant="outline" size="sm" className="mt-3">
                          Create Fee Plan
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
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
                          <CardDescription className="text-xs">{plan.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {plan.components && plan.components.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {plan.components.map((comp: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {comp.kind}: {comp.rate_bps ? `${(comp.rate_bps / 100).toFixed(2)}%` : comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No fee components defined</p>
                        )}
                        {plan.effective_from && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Effective from {formatDate(plan.effective_from)}
                            {plan.effective_until && ` to ${formatDate(plan.effective_until)}`}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Commissions Tab */}
              <TabsContent value="commissions" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Commission Summary</h3>
                  <Button
                    size="sm"
                    onClick={() => setRecordCommissionOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Record Commission
                  </Button>
                </div>

                <PartnerCommissionSummary summary={data.commission_summary} />

                <div className="flex justify-end">
                  <Link href="/versotech_main/lawyer-reconciliation">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Reconciliation
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Activity Tab - Shows fee plan assignments */}
              <TabsContent value="activity" className="mt-4 space-y-4">
                {data.recent_referrals.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No activity yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Activity</CardTitle>
                      <CardDescription className="text-xs">Fee plan assignments to deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.recent_referrals.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div>
                              <div className="font-medium text-sm">
                                Assigned to {activity.deal?.name || 'Unknown Deal'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {activity.deal?.company_name && `${activity.deal.company_name} • `}
                                {activity.created_at && formatDate(activity.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Record Commission Dialog */}
            <RecordCommissionDialog
              open={recordCommissionOpen}
              onOpenChange={setRecordCommissionOpen}
              partnerId={data.partner.id}
              partnerName={data.partner.name}
              deals={data.deals}
              feePlans={data.fee_plans}
              onSuccess={fetchPartnerDetail}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
