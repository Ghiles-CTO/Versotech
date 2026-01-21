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
import {
  Building2,
  Mail,
  Phone,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Plus,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CommissionSummary } from '@/components/common/commission-summary'
import { RecordCommissionDialog } from './record-commission-dialog'
import { RequestInvoiceDialog } from './request-invoice-dialog'
import { RequestPaymentDialog } from './request-payment-dialog'
import { DocumentViewer } from '@/components/documents/document-viewer'
import Link from 'next/link'
import type { IntroducerData } from '@/types/introducers'

interface IntroducerDetailDrawerProps {
  introducerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

const COMMISSION_STATUS_ICONS: Record<string, any> = {
  accrued: { icon: Clock, color: 'text-blue-600' },
  invoice_requested: { icon: FileText, color: 'text-yellow-600' },
  invoice_submitted: { icon: FileText, color: 'text-indigo-600' },
  invoiced: { icon: FileText, color: 'text-orange-600' },
  paid: { icon: CheckCircle, color: 'text-green-600' },
  cancelled: { icon: XCircle, color: 'text-red-600' },
  rejected: { icon: XCircle, color: 'text-red-600' },
}

export function IntroducerDetailDrawer({
  introducerId,
  open,
  onOpenChange,
}: IntroducerDetailDrawerProps) {
  const [data, setData] = useState<IntroducerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commissions, setCommissions] = useState<any[]>([])
  const [commissionsLoading, setCommissionsLoading] = useState(false)

  // Dialog states
  const [recordCommissionOpen, setRecordCommissionOpen] = useState(false)
  const [requestInvoiceOpen, setRequestInvoiceOpen] = useState(false)
  const [requestPaymentOpen, setRequestPaymentOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<any>(null)

  // View invoice state
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<{
    id: string
    name: string
    mimeType: string
  } | null>(null)

  const fetchIntroducerDetail = async () => {
    if (!introducerId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/arrangers/me/introducers/${introducerId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load introducer details')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      console.error('[IntroducerDetailDrawer] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load introducer details')
    } finally {
      setLoading(false)
    }
  }

  const fetchCommissions = async () => {
    if (!introducerId) return

    setCommissionsLoading(true)

    try {
      const response = await fetch(
        `/api/arrangers/me/introducer-commissions?introducer_id=${introducerId}&limit=20`
      )
      if (response.ok) {
        const result = await response.json()
        setCommissions(result.data || [])
      }
    } catch (err) {
      console.error('[IntroducerDetailDrawer] Error fetching commissions:', err)
    } finally {
      setCommissionsLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !introducerId) {
      setData(null)
      setError(null)
      setCommissions([])
      return
    }

    fetchIntroducerDetail()
    fetchCommissions()
  }, [open, introducerId])

  const handleRequestInvoice = (commission: any) => {
    setSelectedCommission(commission)
    setRequestInvoiceOpen(true)
  }

  const handleRequestPayment = (commission: any) => {
    setSelectedCommission(commission)
    setRequestPaymentOpen(true)
  }

  const handleViewInvoice = (commission: any) => {
    if (commission.invoice_id) {
      setSelectedInvoice({
        id: commission.invoice_id,
        name: `Invoice - ${commission.deal?.name || 'Commission'}`,
        mimeType: 'application/pdf',
      })
      setViewInvoiceOpen(true)
    }
  }

  const handleActionSuccess = () => {
    fetchIntroducerDetail()
    fetchCommissions()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading introducer details...</span>
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
                {data.introducer.logo_url ? (
                  <img
                    src={data.introducer.logo_url}
                    alt={data.introducer.legal_name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <SheetTitle>{data.introducer.legal_name}</SheetTitle>
                  <SheetDescription>
                    {data.introducer.contact_name && <span>{data.introducer.contact_name}</span>}
                  </SheetDescription>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={cn('capitalize', STATUS_STYLES[data.introducer.status] || STATUS_STYLES.active)}
                >
                  {data.introducer.status}
                </Badge>
                {data.introducer.default_commission_bps && (
                  <Badge variant="secondary" className="text-xs">
                    {(data.introducer.default_commission_bps / 100).toFixed(2)}% default rate
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
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Contact Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {data.introducer.contact_name && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{data.introducer.contact_name}</span>
                      </div>
                    )}
                    {data.introducer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${data.introducer.email}`} className="text-primary hover:underline">
                          {data.introducer.email}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Commission Terms */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Commission Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {data.introducer.default_commission_bps ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Default Rate:</span>
                        <span className="font-medium">{(data.introducer.default_commission_bps / 100).toFixed(2)}%</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No default rate set</p>
                    )}
                    {data.introducer.commission_cap_amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission Cap:</span>
                        <span className="font-medium">
                          {formatCurrency(data.introducer.commission_cap_amount, 'USD')}
                        </span>
                      </div>
                    )}
                    {data.introducer.payment_terms && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Terms:</span>
                        <span className="font-medium">{data.introducer.payment_terms}</span>
                      </div>
                    )}
                    {data.introducer.agreement_expiry_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agreement Expiry:</span>
                        <span className="font-medium">{formatDate(data.introducer.agreement_expiry_date)}</span>
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
                        {data.deals.map((deal: any) => (
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
                      <p className="text-sm text-muted-foreground">No fee plans assigned to this introducer</p>
                      <Link href="/versotech_main/fee-plans">
                        <Button variant="outline" size="sm" className="mt-3">
                          Create Fee Plan
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  data.fee_plans.map((plan: any) => (
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

                <CommissionSummary summary={data.commission_summary} />

                {/* Pending Commissions List */}
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
                      {commissions.slice(0, 10).map((commission: any) => {
                        const StatusIcon = COMMISSION_STATUS_ICONS[commission.status]?.icon || Clock
                        const statusColor = COMMISSION_STATUS_ICONS[commission.status]?.color || 'text-gray-600'

                        return (
                          <div key={commission.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn('h-4 w-4', statusColor)} />
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
                                {commission.status.replace('_', ' ')}
                              </Badge>
                              {commission.status === 'accrued' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRequestInvoice(commission)}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  Request Invoice
                                </Button>
                              )}
                              {commission.status === 'invoiced' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRequestPayment(commission)}
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                                  Request Payment
                                </Button>
                              )}
                              {(commission.status === 'invoiced' || commission.status === 'paid') &&
                                commission.invoice_id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewInvoice(commission)}
                                  className="text-blue-600"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ) : null}

                <div className="flex justify-end">
                  <Link href="/versotech_main/introducer-reconciliation">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Reconciliation
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="mt-4 space-y-4">
                {data.recent_referrals.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No referrals yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Referrals</CardTitle>
                      <CardDescription className="text-xs">Investors introduced to your deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.recent_referrals.map((referral: any) => (
                          <div key={referral.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div>
                              <div className="font-medium text-sm">
                                {referral.investor?.name || 'Unknown Investor'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {referral.deal?.name || 'Unknown Deal'}
                                {referral.deal?.company_name && ` • ${referral.deal.company_name}`}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(referral.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <RecordCommissionDialog
              open={recordCommissionOpen}
              onOpenChange={setRecordCommissionOpen}
              introducerId={data.introducer.id}
              introducerName={data.introducer.legal_name}
              deals={data.deals}
              feePlans={data.fee_plans}
              onSuccess={handleActionSuccess}
            />

            <RequestInvoiceDialog
              open={requestInvoiceOpen}
              onOpenChange={setRequestInvoiceOpen}
              commission={selectedCommission}
              onSuccess={handleActionSuccess}
            />

            <RequestPaymentDialog
              open={requestPaymentOpen}
              onOpenChange={setRequestPaymentOpen}
              commission={selectedCommission}
              onSuccess={handleActionSuccess}
            />

            {/* View Invoice Modal */}
            {selectedInvoice && (
              <DocumentViewer
                documentId={selectedInvoice.id}
                documentName={selectedInvoice.name}
                mimeType={selectedInvoice.mimeType}
                open={viewInvoiceOpen}
                onClose={() => {
                  setViewInvoiceOpen(false)
                  setSelectedInvoice(null)
                }}
              />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
