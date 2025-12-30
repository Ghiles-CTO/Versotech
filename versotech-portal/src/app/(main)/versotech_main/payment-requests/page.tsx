'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  Send,
  Receipt,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

type ArrangerInfo = {
  id: string
  legal_name: string
}

type FeeEvent = {
  id: string
  deal_id: string
  deal_name: string
  investor_name: string
  fee_type: string
  computed_amount: number
  currency: string
  status: string
  event_date: string
  invoice_id: string | null
}

type PaymentRequest = {
  id: string
  invoice_number: string
  deal_name: string
  investor_name: string
  total: number
  paid_amount: number
  status: string
  due_date: string
  created_at: string
}

type Summary = {
  pendingFees: number
  pendingTotal: number
  invoicedCount: number
  invoicedTotal: number
  paidCount: number
  paidTotal: number
}

const STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800 border-blue-200',
  invoiced: 'bg-amber-100 text-amber-800 border-amber-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  sent: 'bg-purple-100 text-purple-800 border-purple-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
}

export default function PaymentRequestsPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [summary, setSummary] = useState<Summary>({
    pendingFees: 0,
    pendingTotal: 0,
    invoicedCount: 0,
    invoicedTotal: 0,
    paidCount: 0,
    paidTotal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFeeEvents, setSelectedFeeEvents] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not authenticated')
          return
        }

        // Check if user is an arranger
        const { data: arrangerUser, error: arrangerUserError } = await supabase
          .from('arranger_users')
          .select('arranger_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (arrangerUserError || !arrangerUser) {
          setError('Only arrangers can access this page')
          return
        }

        // Fetch arranger info
        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        // Fetch fee events where arranger is the payee
        const { data: events, error: eventsError } = await supabase
          .from('fee_events')
          .select(`
            id,
            deal_id,
            investor_id,
            fee_type,
            computed_amount,
            currency,
            status,
            event_date,
            invoice_id,
            deal:deal_id (
              id,
              name
            ),
            investor:investor_id (
              id,
              display_name,
              legal_name
            )
          `)
          .eq('payee_arranger_id', arrangerUser.arranger_id)
          .order('event_date', { ascending: false })

        if (eventsError) throw eventsError

        const processedEvents: FeeEvent[] = (events || []).map((event: any) => ({
          id: event.id,
          deal_id: event.deal_id,
          deal_name: event.deal?.name || 'Unknown Deal',
          investor_name: event.investor?.display_name || event.investor?.legal_name || 'Unknown',
          fee_type: event.fee_type || 'fee',
          computed_amount: Number(event.computed_amount) || 0,
          currency: event.currency || 'USD',
          status: event.status || 'accrued',
          event_date: event.event_date,
          invoice_id: event.invoice_id,
        }))

        setFeeEvents(processedEvents)

        // Fetch payment requests
        const response = await fetch('/api/arrangers/me/payment-requests')
        if (response.ok) {
          const { payment_requests } = await response.json()
          const processedRequests: PaymentRequest[] = (payment_requests || []).map((req: any) => ({
            id: req.id,
            invoice_number: req.invoice_number,
            deal_name: req.deal?.name || 'Multiple',
            investor_name: req.investor?.display_name || req.investor?.legal_name || 'Multiple',
            total: Number(req.total) || 0,
            paid_amount: Number(req.paid_amount) || 0,
            status: req.status,
            due_date: req.due_date,
            created_at: req.created_at,
          }))
          setPaymentRequests(processedRequests)
        }

        // Calculate summary
        const pendingEvents = processedEvents.filter(e => e.status === 'accrued')
        const invoicedEvents = processedEvents.filter(e => e.status === 'invoiced')
        const paidEvents = processedEvents.filter(e => e.status === 'paid')

        setSummary({
          pendingFees: pendingEvents.length,
          pendingTotal: pendingEvents.reduce((sum, e) => sum + e.computed_amount, 0),
          invoicedCount: invoicedEvents.length,
          invoicedTotal: invoicedEvents.reduce((sum, e) => sum + e.computed_amount, 0),
          paidCount: paidEvents.length,
          paidTotal: paidEvents.reduce((sum, e) => sum + e.computed_amount, 0),
        })

        setError(null)
      } catch (err) {
        console.error('[PaymentRequestsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleFeeEvent = (id: string) => {
    const newSelected = new Set(selectedFeeEvents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedFeeEvents(newSelected)
  }

  const selectAllPending = () => {
    const pendingIds = feeEvents.filter(e => e.status === 'accrued').map(e => e.id)
    setSelectedFeeEvents(new Set(pendingIds))
  }

  const clearSelection = () => {
    setSelectedFeeEvents(new Set())
  }

  const handleSubmitRequest = async () => {
    if (selectedFeeEvents.size === 0) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/arrangers/me/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_event_ids: Array.from(selectedFeeEvents),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment request')
      }

      // Refresh page to show updated data
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment request')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter fee events
  const filteredPendingEvents = feeEvents
    .filter(e => e.status === 'accrued')
    .filter(e => {
      if (!search) return true
      return (
        e.deal_name.toLowerCase().includes(search.toLowerCase()) ||
        e.investor_name.toLowerCase().includes(search.toLowerCase())
      )
    })

  const filteredRequests = paymentRequests.filter(req => {
    if (!search) return true
    return (
      req.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      req.deal_name.toLowerCase().includes(search.toLowerCase())
    )
  })

  const selectedTotal = feeEvents
    .filter(e => selectedFeeEvents.has(e.id))
    .reduce((sum, e) => sum + e.computed_amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading payment data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Requests</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo
              ? `Manage fee collections for ${arrangerInfo.legal_name}`
              : 'Manage your fee collections and payment requests'}
          </p>
        </div>
        {arrangerInfo && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Arranger
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.pendingTotal, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.pendingFees} event{summary.pendingFees !== 1 ? 's' : ''} awaiting invoice
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(summary.invoicedTotal, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.invoicedCount} event{summary.invoicedCount !== 1 ? 's' : ''} awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paidTotal, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.paidCount} event{summary.paidCount !== 1 ? 's' : ''} collected
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
                  placeholder="Search by deal or investor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Fees ({summary.pendingFees})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payment Requests ({paymentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Fee Events</CardTitle>
                  <CardDescription>
                    Select fee events to create a payment request
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFeeEvents.size > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {selectedFeeEvents.size} selected ({formatCurrency(selectedTotal, 'USD')})
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearSelection}>
                        Clear
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={selectAllPending}>
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitRequest}
                    disabled={selectedFeeEvents.size === 0 || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Request Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPendingEvents.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <DollarSign className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? 'No pending fees match your search'
                      : 'No pending fee events to invoice'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Deal</TableHead>
                        <TableHead>Investor</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedFeeEvents.has(event.id)}
                              onCheckedChange={() => toggleFeeEvent(event.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{event.deal_name}</TableCell>
                          <TableCell>{event.investor_name}</TableCell>
                          <TableCell className="capitalize">
                            {event.fee_type.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(event.computed_amount, event.currency)}
                          </TableCell>
                          <TableCell>{formatDate(event.event_date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', STATUS_STYLES[event.status])}
                            >
                              {event.status}
                            </Badge>
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

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Payment Requests</CardTitle>
              <CardDescription>
                {filteredRequests.length} payment request{filteredRequests.length !== 1 ? 's' : ''} submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Receipt className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? 'No payment requests match your search'
                      : 'No payment requests submitted yet'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Deal</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-sm">
                            {request.invoice_number}
                          </TableCell>
                          <TableCell className="font-medium">{request.deal_name}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(request.total, 'USD')}
                          </TableCell>
                          <TableCell>
                            {request.paid_amount > 0 ? (
                              <span className="text-green-600">
                                {formatCurrency(request.paid_amount, 'USD')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(request.due_date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', STATUS_STYLES[request.status])}
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
