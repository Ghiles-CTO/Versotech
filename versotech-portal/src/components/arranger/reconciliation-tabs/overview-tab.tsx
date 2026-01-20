'use client'

import { useEffect, useState, useMemo } from 'react'
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
  Loader2,
  RefreshCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

// Types
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
  fee_type: string | null
  rate_bps: number | null
  base_amount: number | null
  computed_amount: number | null
  currency: string
  status: string
  processed_at: string | null
  event_date: string
  created_at: string
  invoice_number: string | null
  invoice_status: string | null
}

interface OverviewTabProps {
  deals: Deal[]
}

const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
  committed: 'bg-blue-100 text-blue-800 border-blue-200',
  partially_funded: 'bg-amber-100 text-amber-800 border-amber-200',
  funded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  active: 'bg-green-100 text-green-800 border-green-200',
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  committed: 'Awaiting Funding',
  partially_funded: 'Partial',
  funded: 'Fully Funded',
  active: 'Active',
}

const FEE_STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  invoiced: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  waived: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  disputed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
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

export function OverviewTab({ deals }: OverviewTabProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([])
  const [search, setSearch] = useState('')
  const [dealFilter, setDealFilter] = useState('all')
  const [activeSubTab, setActiveSubTab] = useState('subscriptions')

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (deals.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const dealIds = deals.map(d => d.id)

        // Fetch subscriptions
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            deal_id,
            investor_id,
            status,
            commitment,
            currency,
            funded_amount,
            outstanding_amount,
            committed_at,
            funded_at,
            investors (id, legal_name, display_name)
          `)
          .in('deal_id', dealIds)
          .in('status', ['committed', 'partially_funded', 'funded', 'active'])
          .order('committed_at', { ascending: false })

        if (subsError) throw subsError

        // Fetch fee events
        const { data: feesData, error: feesError } = await supabase
          .from('fee_events')
          .select(`
            id,
            deal_id,
            investor_id,
            fee_type,
            rate_bps,
            base_amount,
            computed_amount,
            currency,
            status,
            processed_at,
            event_date,
            created_at,
            invoice_id,
            investors (id, legal_name, display_name),
            invoices:invoice_id (invoice_number, status)
          `)
          .in('deal_id', dealIds)
          .order('created_at', { ascending: false })

        if (feesError) throw feesError

        // Transform subscriptions
        const transformedSubs = (subsData || []).map((sub: any) => {
          const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors
          const deal = deals.find(d => d.id === sub.deal_id)
          return {
            id: sub.id,
            deal_id: sub.deal_id,
            deal_name: deal?.name || 'Unknown Deal',
            investor_id: sub.investor_id,
            investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
            status: sub.status,
            commitment: sub.commitment || 0,
            currency: sub.currency || 'USD',
            funded_amount: sub.funded_amount || 0,
            outstanding_amount: sub.outstanding_amount || 0,
            committed_at: sub.committed_at,
            funded_at: sub.funded_at,
          }
        })

        // Transform fee events
        const transformedFees = (feesData || []).map((fee: any) => {
          const investor = Array.isArray(fee.investors) ? fee.investors[0] : fee.investors
          const invoice = Array.isArray(fee.invoices) ? fee.invoices[0] : fee.invoices
          const deal = deals.find(d => d.id === fee.deal_id)
          return {
            id: fee.id,
            deal_id: fee.deal_id,
            deal_name: deal?.name || 'Unknown Deal',
            investor_id: fee.investor_id,
            investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
            fee_type: fee.fee_type,
            rate_bps: fee.rate_bps,
            base_amount: fee.base_amount,
            computed_amount: fee.computed_amount,
            currency: fee.currency || 'USD',
            status: fee.status,
            processed_at: fee.processed_at,
            event_date: fee.event_date,
            created_at: fee.created_at,
            invoice_number: invoice?.invoice_number || null,
            invoice_status: invoice?.status || null,
          }
        })

        setSubscriptions(transformedSubs)
        setFeeEvents(transformedFees)
      } catch (err) {
        console.error('[OverviewTab] Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [deals])

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalCommitment = subscriptions.reduce((sum, s) => sum + s.commitment, 0)
    const totalFunded = subscriptions.reduce((sum, s) => sum + s.funded_amount, 0)
    const totalOutstanding = subscriptions.reduce((sum, s) => sum + s.outstanding_amount, 0)
    const awaitingFunding = subscriptions.filter(s => s.status === 'committed').length
    const partiallyFunded = subscriptions.filter(s => s.status === 'partially_funded').length
    const fullyFunded = subscriptions.filter(s => s.status === 'funded' || s.status === 'active').length

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
        fee.investor_name.toLowerCase().includes(search.toLowerCase()) ||
        fee.deal_name.toLowerCase().includes(search.toLowerCase())
      return matchesDeal && matchesSearch
    })
  }, [feeEvents, dealFilter, search])

  // Calculate deal summary
  const dealSummary = useMemo(() => {
    return deals.map(deal => {
      const dealSubs = subscriptions.filter(s => s.deal_id === deal.id)
      const dealFees = feeEvents.filter(f => f.deal_id === deal.id)

      const totalCommitment = dealSubs.reduce((sum, s) => sum + s.commitment, 0)
      const totalFunded = dealSubs.reduce((sum, s) => sum + s.funded_amount, 0)
      const totalFees = dealFees.reduce((sum, f) => sum + (f.computed_amount || 0), 0)
      const paidFees = dealFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.computed_amount || 0), 0)

      return {
        ...deal,
        subscription_count: dealSubs.length,
        total_commitment: totalCommitment,
        total_funded: totalFunded,
        funding_percentage: totalCommitment > 0 ? Math.round((totalFunded / totalCommitment) * 100) : 0,
        total_fees: totalFees,
        paid_fees: paidFees,
        fee_count: dealFees.length,
      }
    })
  }, [deals, subscriptions, feeEvents])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading overview data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Managed Deals
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
              <DollarSign className="h-4 w-4" />
              Total Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary.totalCommitment, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalFunded, 'USD')} funded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Funding Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary.fullyFunded}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.awaitingFunding} awaiting • {summary.partiallyFunded} partial • {summary.fullyFunded} fully funded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fee Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFeeEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalFeesPaid, 'USD')} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors or deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dealFilter} onValueChange={setDealFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="All Deals" />
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

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Subscriptions ({filteredSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Fee Events ({filteredFeeEvents.length})
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Deal Summary
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Subscriptions</CardTitle>
              <CardDescription>
                {filteredSubscriptions.length} active subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead className="text-right">Commitment</TableHead>
                      <TableHead className="text-right">Funded</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Funded Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map(sub => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.investor_name}</TableCell>
                          <TableCell>{sub.deal_name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sub.commitment, sub.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sub.funded_amount, sub.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sub.outstanding_amount, sub.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', SUBSCRIPTION_STATUS_STYLES[sub.status])}
                            >
                              {SUBSCRIPTION_STATUS_LABELS[sub.status] || sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sub.funded_at ? (
                              <span className="text-sm">{formatDate(sub.funded_at)}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Events Tab */}
        <TabsContent value="fees">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Fee Events</CardTitle>
              <CardDescription>
                {filteredFeeEvents.length} fee events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Investor</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Event Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeeEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No fee events found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeeEvents.map(fee => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.deal_name}</TableCell>
                          <TableCell>{fee.investor_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {FEE_TYPE_LABELS[fee.fee_type || ''] || fee.fee_type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(fee.computed_amount || 0, fee.currency)}
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
                              className={cn('text-xs capitalize', FEE_STATUS_STYLES[fee.status])}
                            >
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fee.event_date ? (
                              <span className="text-sm">{formatDate(fee.event_date)}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Deal Summary</CardTitle>
              <CardDescription>
                Aggregated metrics by deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-right">Subscriptions</TableHead>
                      <TableHead className="text-right">Commitment</TableHead>
                      <TableHead className="text-right">Funded</TableHead>
                      <TableHead className="text-right">Funding %</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealSummary.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No deals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      dealSummary.map(deal => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">{deal.name}</TableCell>
                          <TableCell>{deal.company_name || '-'}</TableCell>
                          <TableCell className="text-right">{deal.subscription_count}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.total_commitment, deal.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.total_funded, deal.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                deal.funding_percentage >= 100
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : deal.funding_percentage >= 50
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {deal.funding_percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.total_fees, deal.currency)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
