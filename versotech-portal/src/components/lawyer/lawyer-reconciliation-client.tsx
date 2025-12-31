'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DollarSign,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  AlertCircle,
  CreditCard,
  Users,
  CheckCircle,
} from 'lucide-react'
import { ConfirmIntroducerPaymentModal } from './confirm-introducer-payment-modal'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
}

type Deal = {
  id: string
  name: string
  company_name: string | null
  target_amount: number | null
  currency: string
  status: string
}

type Subscription = {
  id: string
  deal_id: string
  deal_name: string
  investor_id: string
  investor_name: string
  status: string
  commitment: number
  currency: string
  funded_amount: number
  outstanding_amount: number
  committed_at: string | null
  funded_at: string | null
}

type FeeEvent = {
  id: string
  deal_id: string
  deal_name: string
  investor_id: string | null
  investor_name: string
  subscription_id: string | null
  fee_type: string | null
  rate_bps: number | null
  base_amount: number | null
  computed_amount: number | null
  currency: string
  status: string
  processed_at: string | null
  notes: string | null
  event_date: string
  created_at: string
  invoice_id: string | null
  invoice_number: string | null
  invoice_status: string | null
  invoice_due_date: string | null
  invoice_paid_at: string | null
}

type IntroducerCommission = {
  id: string
  introducer_name: string
  deal_id: string | null
  deal_name: string | null
  accrual_amount: number
  currency: string
  status: string
  invoice_id: string | null
  created_at: string
}

type LawyerReconciliationClientProps = {
  lawyerInfo: LawyerInfo | null
  deals: Deal[]
  subscriptions: Subscription[]
  feeEvents: FeeEvent[]
  introducerCommissions: IntroducerCommission[]
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
  committed: 'bg-blue-100 text-blue-800 border-blue-200',
  partially_funded: 'bg-amber-100 text-amber-800 border-amber-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  committed: 'Awaiting Funding',
  partially_funded: 'Partial',
  active: 'Funded',
}

const FEE_STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800 border-blue-200',
  invoiced: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  waived: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  disputed: 'bg-red-100 text-red-800 border-red-200',
  voided: 'bg-gray-100 text-gray-800 border-gray-200',
}

const FEE_TYPE_LABELS: Record<string, string> = {
  mgmt: 'Management Fee',
  perf: 'Performance Fee',
  carry: 'Carried Interest',
  upfront: 'Upfront Fee',
  placement: 'Placement Fee',
  transaction: 'Transaction Fee',
  admin: 'Admin Fee',
}

export function LawyerReconciliationClient({
  lawyerInfo,
  deals,
  subscriptions,
  feeEvents,
  introducerCommissions
}: LawyerReconciliationClientProps) {
  const [search, setSearch] = useState('')
  const [dealFilter, setDealFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('subscriptions')
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<IntroducerCommission | null>(null)

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalCommitment = subscriptions.reduce((sum, s) => sum + s.commitment, 0)
    const totalFunded = subscriptions.reduce((sum, s) => sum + s.funded_amount, 0)
    const totalOutstanding = subscriptions.reduce((sum, s) => sum + s.outstanding_amount, 0)
    const awaitingFunding = subscriptions.filter(s => s.status === 'committed').length
    const partiallyFunded = subscriptions.filter(s => s.status === 'partially_funded').length
    const fullyFunded = subscriptions.filter(s => s.status === 'active').length

    const totalFeesAccrued = feeEvents.reduce((sum, f) => sum + (f.computed_amount || 0), 0)
    const feesPaid = feeEvents.filter(f => f.status === 'paid')
    const totalFeesPaid = feesPaid.reduce((sum, f) => sum + (f.computed_amount || 0), 0)
    const feesPending = feeEvents.filter(f => f.status === 'accrued' || f.status === 'invoiced')
    const totalFeesPending = feesPending.reduce((sum, f) => sum + (f.computed_amount || 0), 0)

    return {
      totalDeals: deals.length,
      totalSubscriptions: subscriptions.length,
      totalCommitment,
      totalFunded,
      totalOutstanding,
      awaitingFunding,
      partiallyFunded,
      fullyFunded,
      totalFeeEvents: feeEvents.length,
      totalFeesAccrued,
      totalFeesPaid,
      totalFeesPending,
      feesPaidCount: feesPaid.length,
      feesPendingCount: feesPending.length,
    }
  }, [deals, subscriptions, feeEvents])

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesDeal = dealFilter === 'all' || sub.deal_id === dealFilter
      const matchesSearch = !search ||
        sub.investor_name.toLowerCase().includes(search.toLowerCase()) ||
        sub.deal_name.toLowerCase().includes(search.toLowerCase())
      return matchesDeal && matchesSearch
    })
  }, [subscriptions, dealFilter, search])

  // Filter fee events
  const filteredFeeEvents = useMemo(() => {
    return feeEvents.filter(fee => {
      const matchesDeal = dealFilter === 'all' || fee.deal_id === dealFilter
      const matchesSearch = !search ||
        fee.deal_name.toLowerCase().includes(search.toLowerCase()) ||
        fee.investor_name.toLowerCase().includes(search.toLowerCase()) ||
        (fee.fee_type && fee.fee_type.toLowerCase().includes(search.toLowerCase()))
      return matchesDeal && matchesSearch
    })
  }, [feeEvents, dealFilter, search])

  // Filter introducer commissions
  const filteredIntroducerCommissions = useMemo(() => {
    return introducerCommissions.filter(ic => {
      const matchesDeal = dealFilter === 'all' || ic.deal_id === dealFilter
      const matchesSearch = !search ||
        ic.introducer_name.toLowerCase().includes(search.toLowerCase()) ||
        (ic.deal_name && ic.deal_name.toLowerCase().includes(search.toLowerCase()))
      return matchesDeal && matchesSearch
    })
  }, [introducerCommissions, dealFilter, search])

  // Deal summary by deal
  const dealSummaries = useMemo(() => {
    return deals.map(deal => {
      const dealSubs = subscriptions.filter(s => s.deal_id === deal.id)
      const dealFees = feeEvents.filter(f => f.deal_id === deal.id)

      const committed = dealSubs.reduce((sum, s) => sum + s.commitment, 0)
      const funded = dealSubs.reduce((sum, s) => sum + s.funded_amount, 0)
      const outstanding = dealSubs.reduce((sum, s) => sum + s.outstanding_amount, 0)
      const feesTotal = dealFees.reduce((sum, f) => sum + (f.computed_amount || 0), 0)
      const feesPaid = dealFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.computed_amount || 0), 0)

      return {
        ...deal,
        subscriptions_count: dealSubs.length,
        committed,
        funded,
        outstanding,
        fees_total: feesTotal,
        fees_paid: feesPaid,
        fees_pending: feesTotal - feesPaid,
      }
    })
  }, [deals, subscriptions, feeEvents])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            {lawyerInfo
              ? `Financial reconciliation for ${lawyerInfo.display_name}'s assigned deals`
              : 'Financial reconciliation for assigned deals'}
          </p>
        </div>
        {lawyerInfo?.specializations?.length ? (
          <div className="flex gap-1">
            {lawyerInfo.specializations.slice(0, 2).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {spec}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Assigned Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalSubscriptions} subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalCommitment)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.awaitingFunding} awaiting funding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Total Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalFunded)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalOutstanding)} outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fee Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.totalFeesPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalFeesPending)} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors or deals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={dealFilter} onValueChange={setDealFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deals</SelectItem>
                {deals.map(deal => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* No data state */}
      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Deals Assigned
              </h3>
              <p className="text-muted-foreground">
                You don't have any deals assigned yet. Contact the VERSO team to be assigned to deals.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Subscriptions ({filteredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fee Payments ({filteredFeeEvents.length})
            </TabsTrigger>
            <TabsTrigger value="introducer-fees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Introducer Fees ({filteredIntroducerCommissions.length})
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Deal Summary ({deals.length})
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Reconciliation</CardTitle>
                <CardDescription>
                  Funding status for all signed subscriptions in your assigned deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSubscriptions.length === 0 ? (
                  <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No subscriptions match your filters
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Investor</TableHead>
                          <TableHead>Deal</TableHead>
                          <TableHead>Commitment</TableHead>
                          <TableHead>Funded</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Funded Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <div className="font-medium">{sub.investor_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{sub.deal_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(sub.commitment, sub.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-emerald-600">
                                {formatCurrency(sub.funded_amount, sub.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={cn(
                                "font-medium",
                                sub.outstanding_amount > 0 ? "text-amber-600" : "text-muted-foreground"
                              )}>
                                {formatCurrency(sub.outstanding_amount, sub.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('capitalize', SUBSCRIPTION_STATUS_STYLES[sub.status])}
                              >
                                {SUBSCRIPTION_STATUS_LABELS[sub.status] || sub.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {sub.funded_at ? (
                                <div className="text-sm">{formatDate(sub.funded_at)}</div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Payments Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fee Payment Reconciliation</CardTitle>
                <CardDescription>
                  Fee accruals and payments for your assigned deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFeeEvents.length === 0 ? (
                  <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <DollarSign className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No fee events match your filters
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deal</TableHead>
                          <TableHead>Investor</TableHead>
                          <TableHead>Fee Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Event Date</TableHead>
                          <TableHead>Processed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeeEvents.map((fee) => (
                          <TableRow key={fee.id}>
                            <TableCell>
                              <div className="font-medium">{fee.deal_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{fee.investor_name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {FEE_TYPE_LABELS[fee.fee_type || ''] || fee.fee_type || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(fee.computed_amount || 0, fee.currency)}
                              </div>
                              {fee.base_amount && (
                                <div className="text-xs text-muted-foreground">
                                  of {formatCurrency(fee.base_amount, fee.currency)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {fee.invoice_number ? (
                                <div>
                                  <div className="text-sm font-medium">{fee.invoice_number}</div>
                                  {fee.invoice_status && (
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {fee.invoice_status.replace('_', ' ')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Not issued</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('capitalize', FEE_STATUS_STYLES[fee.status])}
                              >
                                {fee.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {fee.event_date ? (
                                <div className="text-sm">{formatDate(fee.event_date)}</div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {fee.processed_at ? (
                                <div className="text-sm">{formatDate(fee.processed_at)}</div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Introducer Fees Tab */}
          <TabsContent value="introducer-fees">
            <Card>
              <CardHeader>
                <CardTitle>Introducer Fee Payments</CardTitle>
                <CardDescription>
                  Introducer commissions awaiting payment confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredIntroducerCommissions.length === 0 ? (
                  <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <Users className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No introducer commissions awaiting payment
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Introducer</TableHead>
                          <TableHead>Deal</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIntroducerCommissions.map((ic) => (
                          <TableRow key={ic.id}>
                            <TableCell>
                              <div className="font-medium">{ic.introducer_name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{ic.deal_name || '—'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                {formatCurrency(ic.accrual_amount, ic.currency)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-amber-100 text-amber-800 border-amber-200"
                              >
                                Awaiting Payment
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(ic.created_at)}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedCommission(ic)
                                  setConfirmPaymentOpen(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm Payment
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deal Summary Tab */}
          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Deal-Level Summary</CardTitle>
                <CardDescription>
                  Aggregated financial data by deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal</TableHead>
                        <TableHead>Subscriptions</TableHead>
                        <TableHead>Committed</TableHead>
                        <TableHead>Funded</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Fees Paid</TableHead>
                        <TableHead>Fees Pending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dealSummaries.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell>
                            <div className="font-medium">{deal.name}</div>
                            {deal.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {deal.company_name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {deal.subscriptions_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(deal.committed, deal.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-emerald-600">
                              {formatCurrency(deal.funded, deal.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "font-medium",
                              deal.outstanding > 0 ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              {formatCurrency(deal.outstanding, deal.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-emerald-600">
                              {formatCurrency(deal.fees_paid, deal.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "font-medium",
                              deal.fees_pending > 0 ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              {formatCurrency(deal.fees_pending, deal.currency)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Confirm Introducer Payment Modal */}
      <ConfirmIntroducerPaymentModal
        open={confirmPaymentOpen}
        onOpenChange={setConfirmPaymentOpen}
        commission={selectedCommission}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
