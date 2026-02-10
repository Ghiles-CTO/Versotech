'use client'

import { useEffect, useState, useCallback } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Briefcase,
  Handshake,
  MoreHorizontal,
  Mail,
  CreditCard,
  Eye,
  XCircle,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { RequestInvoiceDialog, type CommissionType } from '@/components/commissions/request-invoice-dialog'
import { RequestPaymentDialog } from '@/components/commissions/request-payment-dialog'
import { ViewInvoiceDialog } from '@/components/commissions/view-invoice-dialog'
import { type CurrencyTotals, currencyTotalsEntries, mergeCurrencyTotals } from '@/lib/currency-totals'

// ============================================================================
// Types
// ============================================================================

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
  currency: string | null
  status: string
  event_date: string
  invoice_id: string | null
}

type PaymentRequest = {
  id: string
  invoice_number: string
  currency: string | null
  deal_name: string
  investor_name: string
  total: number
  paid_amount: number
  status: string
  due_date: string
  created_at: string
}

type InboundSummary = {
  pendingFees: number
  pendingTotal: number
  pendingByCurrency: CurrencyTotals
  invoicedCount: number
  invoicedTotal: number
  invoicedByCurrency: CurrencyTotals
  paidCount: number
  paidTotal: number
  paidByCurrency: CurrencyTotals
  outstandingByCurrency: CurrencyTotals
}

// Outbound commission (fees I owe to partners/introducers/CPs)
type OutboundCommission = {
  id: string
  type: 'partner' | 'introducer' | 'commercial-partner'
  entity_id: string
  entity_name: string
  entity_type_label: string
  deal_id: string | null
  deal_name: string | null
  accrual_amount: number
  currency: string | null
  status: 'accrued' | 'invoice_requested' | 'invoiced' | 'paid' | 'cancelled'
  invoice_id: string | null
  created_at: string
  payment_due_date: string | null
}

type OutboundSummary = {
  total_accrued: number
  total_accrued_by_currency: CurrencyTotals
  total_invoice_requested: number
  total_invoice_requested_by_currency: CurrencyTotals
  total_invoiced: number
  total_invoiced_by_currency: CurrencyTotals
  total_paid: number
  total_paid_by_currency: CurrencyTotals
  total_owed: number // accrued + invoice_requested + invoiced
  total_owed_by_currency: CurrencyTotals
  count: number
  by_type: {
    partner: { count: number; total: number; total_by_currency: CurrencyTotals }
    introducer: { count: number; total: number; total_by_currency: CurrencyTotals }
    commercial_partner: { count: number; total: number; total_by_currency: CurrencyTotals }
  }
}

// ============================================================================
// Status Styling
// ============================================================================

const STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800 border-blue-200',
  invoice_requested: 'bg-amber-100 text-amber-800 border-amber-200',
  invoiced: 'bg-purple-100 text-purple-800 border-purple-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  sent: 'bg-purple-100 text-purple-800 border-purple-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  accrued: 'Accrued',
  invoice_requested: 'Invoice Requested',
  invoiced: 'Invoiced',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

const ENTITY_TYPE_ICONS: Record<string, React.ReactNode> = {
  partner: <Briefcase className="h-3 w-3" />,
  introducer: <Handshake className="h-3 w-3" />,
  'commercial-partner': <Building2 className="h-3 w-3" />,
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  partner: 'Partner',
  introducer: 'Introducer',
  'commercial-partner': 'Commercial Partner',
}

function formatCurrencyTotals(totals: CurrencyTotals): string {
  const entries = currencyTotalsEntries(totals)
  if (entries.length === 0) return '—'
  if (entries.length === 1) {
    const [currency, amount] = entries[0]
    return formatCurrency(amount, currency)
  }
  return entries.map(([currency, amount]) => `${currency} ${formatCurrency(amount, currency)}`).join(' / ')
}

function sumByCurrencyStrict<T>(
  items: T[],
  amountGetter: (item: T) => number | null | undefined,
  currencyGetter: (item: T) => string | null | undefined
): CurrencyTotals {
  return items.reduce<CurrencyTotals>((acc, item) => {
    const amount = Number(amountGetter(item)) || 0
    const currency = (currencyGetter(item) || '').trim().toUpperCase()
    if (!currency) return acc
    acc[currency] = (acc[currency] || 0) + amount
    return acc
  }, {})
}

function formatAmountWithCurrency(amount: number | null | undefined, currency: string | null | undefined): string {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return '—'
  const code = (currency || '').trim().toUpperCase()
  if (!code) return numeric.toLocaleString()
  return formatCurrency(numeric, code)
}

// ============================================================================
// Main Component
// ============================================================================

export default function PaymentRequestsPage() {
  // Arranger info
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)

  // Inbound data (fees owed TO arranger)
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [inboundSummary, setInboundSummary] = useState<InboundSummary>({
    pendingFees: 0,
    pendingTotal: 0,
    pendingByCurrency: {},
    invoicedCount: 0,
    invoicedTotal: 0,
    invoicedByCurrency: {},
    paidCount: 0,
    paidTotal: 0,
    paidByCurrency: {},
    outstandingByCurrency: {},
  })

  // Outbound data (fees arranger must PAY)
  const [outboundCommissions, setOutboundCommissions] = useState<OutboundCommission[]>([])
  const [outboundSummary, setOutboundSummary] = useState<OutboundSummary>({
    total_accrued: 0,
    total_accrued_by_currency: {},
    total_invoice_requested: 0,
    total_invoice_requested_by_currency: {},
    total_invoiced: 0,
    total_invoiced_by_currency: {},
    total_paid: 0,
    total_paid_by_currency: {},
    total_owed: 0,
    total_owed_by_currency: {},
    count: 0,
    by_type: {
      partner: { count: 0, total: 0, total_by_currency: {} },
      introducer: { count: 0, total: 0, total_by_currency: {} },
      commercial_partner: { count: 0, total: 0, total_by_currency: {} },
    },
  })

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFeeEvents, setSelectedFeeEvents] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  // Tab state
  const [mainTab, setMainTab] = useState<'inbound' | 'outbound'>('inbound')
  const [inboundSubTab, setInboundSubTab] = useState('pending')
  const [entityTypeFilter, setEntityTypeFilter] = useState<'all' | 'partner' | 'introducer' | 'commercial-partner'>('all')

  // Dialog state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [viewInvoiceDialogOpen, setViewInvoiceDialogOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<OutboundCommission | null>(null)

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchData = useCallback(async () => {
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

      // Parallel fetch all data
      const [inboundResult, outboundResult] = await Promise.all([
        fetchInboundData(supabase, arrangerUser.arranger_id),
        fetchOutboundData(arrangerUser.arranger_id),
      ])

      // Set inbound data
      setFeeEvents(inboundResult.feeEvents)
      setPaymentRequests(inboundResult.paymentRequests)
      setInboundSummary(inboundResult.summary)

      // Set outbound data
      setOutboundCommissions(outboundResult.commissions)
      setOutboundSummary(outboundResult.summary)

      setError(null)
    } catch (err) {
      console.error('[PaymentRequestsPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function fetchInboundData(supabase: any, arrangerId: string) {
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
        deal:deal_id (id, name),
        investor:investor_id (id, display_name, legal_name)
      `)
      .eq('payee_arranger_id', arrangerId)
      .order('event_date', { ascending: false })

    if (eventsError) throw eventsError

    const feeEvents: FeeEvent[] = (events || []).map((event: any) => ({
      id: event.id,
      deal_id: event.deal_id,
      deal_name: event.deal?.name || 'Unknown Deal',
      investor_name: event.investor?.display_name || event.investor?.legal_name || 'Unknown',
      fee_type: event.fee_type || 'fee',
      computed_amount: Number(event.computed_amount) || 0,
      currency: event.currency ? String(event.currency).toUpperCase() : null,
      status: event.status || 'accrued',
      event_date: event.event_date,
      invoice_id: event.invoice_id,
    }))

    // Fetch payment requests via API
    let paymentRequests: PaymentRequest[] = []
    const response = await fetch('/api/arrangers/me/payment-requests')
    if (response.ok) {
      const { payment_requests } = await response.json()
      paymentRequests = (payment_requests || []).map((req: any) => ({
        id: req.id,
        invoice_number: req.invoice_number,
        currency: req.currency ? String(req.currency).toUpperCase() : null,
        deal_name: req.deal?.name || 'Multiple',
        investor_name: req.investor?.display_name || req.investor?.legal_name || 'Multiple',
        total: Number(req.total) || 0,
        paid_amount: Number(req.paid_amount) || 0,
        status: req.status,
        due_date: req.due_date,
        created_at: req.created_at,
      }))
    }

    // Calculate summary
    const pendingEvents = feeEvents.filter(e => e.status === 'accrued')
    const invoicedEvents = feeEvents.filter(e => e.status === 'invoiced')
    const paidEvents = feeEvents.filter(e => e.status === 'paid')
    const pendingByCurrency = sumByCurrencyStrict(pendingEvents, (e) => e.computed_amount, (e) => e.currency)
    const invoicedByCurrency = sumByCurrencyStrict(invoicedEvents, (e) => e.computed_amount, (e) => e.currency)
    const paidByCurrency = sumByCurrencyStrict(paidEvents, (e) => e.computed_amount, (e) => e.currency)

    return {
      feeEvents,
      paymentRequests,
      summary: {
        pendingFees: pendingEvents.length,
        pendingTotal: pendingEvents.reduce((sum, e) => sum + e.computed_amount, 0),
        pendingByCurrency,
        invoicedCount: invoicedEvents.length,
        invoicedTotal: invoicedEvents.reduce((sum, e) => sum + e.computed_amount, 0),
        invoicedByCurrency,
        paidCount: paidEvents.length,
        paidTotal: paidEvents.reduce((sum, e) => sum + e.computed_amount, 0),
        paidByCurrency,
        outstandingByCurrency: mergeCurrencyTotals(pendingByCurrency, invoicedByCurrency),
      },
    }
  }

  async function fetchOutboundData(arrangerId: string) {
    // Fetch all 3 commission types in parallel
    const [partnerRes, introducerRes, cpRes] = await Promise.all([
      fetch('/api/arrangers/me/partner-commissions'),
      fetch('/api/arrangers/me/introducer-commissions'),
      fetch('/api/arrangers/me/commercial-partner-commissions'),
    ])

    const [partnerData, introducerData, cpData] = await Promise.all([
      partnerRes.ok ? partnerRes.json() : { data: [] },
      introducerRes.ok ? introducerRes.json() : { data: [] },
      cpRes.ok ? cpRes.json() : { data: [] },
    ])

    // Transform to unified format
    const commissions: OutboundCommission[] = []

    // Partner commissions
    for (const c of (partnerData.data || [])) {
      commissions.push({
        id: c.id,
        type: 'partner',
        entity_id: c.partner_id || c.partner?.id,
        entity_name: c.partner?.name || c.partner?.legal_name || 'Unknown Partner',
        entity_type_label: 'Partner',
        deal_id: c.deal_id || c.deal?.id || null,
        deal_name: c.deal?.name || null,
        accrual_amount: Number(c.accrual_amount) || 0,
        currency: c.currency ? String(c.currency).toUpperCase() : null,
        status: c.status || 'accrued',
        invoice_id: c.invoice_id || null,
        created_at: c.created_at,
        payment_due_date: c.payment_due_date || null,
      })
    }

    // Introducer commissions
    for (const c of (introducerData.data || [])) {
      commissions.push({
        id: c.id,
        type: 'introducer',
        entity_id: c.introducer_id || c.introducer?.id,
        entity_name: c.introducer?.name || c.introducer?.legal_name || 'Unknown Introducer',
        entity_type_label: 'Introducer',
        deal_id: c.deal_id || c.deal?.id || null,
        deal_name: c.deal?.name || null,
        accrual_amount: Number(c.accrual_amount) || 0,
        currency: c.currency ? String(c.currency).toUpperCase() : null,
        status: c.status || 'accrued',
        invoice_id: c.invoice_id || null,
        created_at: c.created_at,
        payment_due_date: c.payment_due_date || null,
      })
    }

    // Commercial partner commissions
    for (const c of (cpData.data || [])) {
      commissions.push({
        id: c.id,
        type: 'commercial-partner',
        entity_id: c.commercial_partner_id || c.commercial_partner?.id,
        entity_name: c.commercial_partner?.name || c.commercial_partner?.legal_name || 'Unknown Commercial Partner',
        entity_type_label: 'Commercial Partner',
        deal_id: c.deal_id || c.deal?.id || null,
        deal_name: c.deal?.name || null,
        accrual_amount: Number(c.accrual_amount) || 0,
        currency: c.currency ? String(c.currency).toUpperCase() : null,
        status: c.status || 'accrued',
        invoice_id: c.invoice_id || null,
        created_at: c.created_at,
        payment_due_date: c.payment_due_date || null,
      })
    }

    // Sort by created_at descending
    commissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calculate summary
    const activeCommissions = commissions.filter(c => c.status !== 'cancelled')
    const accrued = activeCommissions.filter(c => c.status === 'accrued')
    const invoiceRequested = activeCommissions.filter(c => c.status === 'invoice_requested')
    const invoiced = activeCommissions.filter(c => c.status === 'invoiced')
    const paid = activeCommissions.filter(c => c.status === 'paid')
    const accruedByCurrency = sumByCurrencyStrict(accrued, (c) => c.accrual_amount, (c) => c.currency)
    const invoiceRequestedByCurrency = sumByCurrencyStrict(invoiceRequested, (c) => c.accrual_amount, (c) => c.currency)
    const invoicedByCurrency = sumByCurrencyStrict(invoiced, (c) => c.accrual_amount, (c) => c.currency)
    const paidByCurrency = sumByCurrencyStrict(paid, (c) => c.accrual_amount, (c) => c.currency)

    const partnerCommissions = activeCommissions.filter(c => c.type === 'partner')
    const introducerCommissions = activeCommissions.filter(c => c.type === 'introducer')
    const cpCommissions = activeCommissions.filter(c => c.type === 'commercial-partner')
    const partnerByCurrency = sumByCurrencyStrict(partnerCommissions, (c) => c.accrual_amount, (c) => c.currency)
    const introducerByCurrency = sumByCurrencyStrict(introducerCommissions, (c) => c.accrual_amount, (c) => c.currency)
    const cpByCurrency = sumByCurrencyStrict(cpCommissions, (c) => c.accrual_amount, (c) => c.currency)

    return {
      commissions,
      summary: {
        total_accrued: accrued.reduce((sum, c) => sum + c.accrual_amount, 0),
        total_accrued_by_currency: accruedByCurrency,
        total_invoice_requested: invoiceRequested.reduce((sum, c) => sum + c.accrual_amount, 0),
        total_invoice_requested_by_currency: invoiceRequestedByCurrency,
        total_invoiced: invoiced.reduce((sum, c) => sum + c.accrual_amount, 0),
        total_invoiced_by_currency: invoicedByCurrency,
        total_paid: paid.reduce((sum, c) => sum + c.accrual_amount, 0),
        total_paid_by_currency: paidByCurrency,
        total_owed: [...accrued, ...invoiceRequested, ...invoiced].reduce((sum, c) => sum + c.accrual_amount, 0),
        total_owed_by_currency: mergeCurrencyTotals(
          accruedByCurrency,
          invoiceRequestedByCurrency,
          invoicedByCurrency
        ),
        count: activeCommissions.length,
        by_type: {
          partner: {
            count: partnerCommissions.length,
            total: partnerCommissions.reduce((sum, c) => sum + c.accrual_amount, 0),
            total_by_currency: partnerByCurrency,
          },
          introducer: {
            count: introducerCommissions.length,
            total: introducerCommissions.reduce((sum, c) => sum + c.accrual_amount, 0),
            total_by_currency: introducerByCurrency,
          },
          commercial_partner: {
            count: cpCommissions.length,
            total: cpCommissions.reduce((sum, c) => sum + c.accrual_amount, 0),
            total_by_currency: cpByCurrency,
          },
        },
      },
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

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

  // Commission actions
  const handleRequestInvoice = (commission: OutboundCommission) => {
    setSelectedCommission(commission)
    setInvoiceDialogOpen(true)
  }

  const handleRequestPayment = (commission: OutboundCommission) => {
    setSelectedCommission(commission)
    setPaymentDialogOpen(true)
  }

  const handleViewInvoice = (commission: OutboundCommission) => {
    setSelectedCommission(commission)
    setViewInvoiceDialogOpen(true)
  }

  const handleActionSuccess = () => {
    fetchData()
  }

  // ============================================================================
  // Filtered Data
  // ============================================================================

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

  const filteredOutboundCommissions = outboundCommissions
    .filter(c => c.status !== 'cancelled')
    .filter(c => entityTypeFilter === 'all' || c.type === entityTypeFilter)
    .filter(c => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        c.entity_name.toLowerCase().includes(searchLower) ||
        c.deal_name?.toLowerCase().includes(searchLower) ||
        c.entity_type_label.toLowerCase().includes(searchLower)
      )
    })

  const selectedTotalByCurrency = sumByCurrencyStrict(
    feeEvents.filter(e => selectedFeeEvents.has(e.id)),
    (e) => e.computed_amount,
    (e) => e.currency
  )

  // ============================================================================
  // Loading & Error States
  // ============================================================================

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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo
              ? `Manage fees for ${arrangerInfo.legal_name}`
              : 'Manage your fee collections and payments'}
          </p>
        </div>
        {arrangerInfo && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Arranger
          </Badge>
        )}
      </div>

      {/* Main Tabs: Inbound (Fees To Me) vs Outbound (Fees I Owe) */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'inbound' | 'outbound')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inbound" className="flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Fees Owed To Me
            <Badge variant="secondary" className="ml-1 text-xs">
              {formatCurrencyTotals(inboundSummary.outstandingByCurrency)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outbound" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Fees I Owe
            <Badge variant="secondary" className="ml-1 text-xs">
              {formatCurrencyTotals(outboundSummary.total_owed_by_currency)}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            INBOUND TAB (Fees Owed TO Arranger)
            ================================================================ */}
        <TabsContent value="inbound" className="space-y-4">
          {/* Inbound Summary Cards */}
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
                  {formatCurrencyTotals(inboundSummary.pendingByCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inboundSummary.pendingFees} event{inboundSummary.pendingFees !== 1 ? 's' : ''} awaiting invoice
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
                  {formatCurrencyTotals(inboundSummary.invoicedByCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inboundSummary.invoicedCount} event{inboundSummary.invoicedCount !== 1 ? 's' : ''} awaiting payment
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
                  {formatCurrencyTotals(inboundSummary.paidByCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inboundSummary.paidCount} event{inboundSummary.paidCount !== 1 ? 's' : ''} collected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
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

          {/* Inbound Sub-Tabs */}
          <Tabs value={inboundSubTab} onValueChange={setInboundSubTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Fees ({inboundSummary.pendingFees})
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
                            {selectedFeeEvents.size} selected ({formatCurrencyTotals(selectedTotalByCurrency)})
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
                                {formatAmountWithCurrency(event.computed_amount, event.currency)}
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
                                {formatAmountWithCurrency(request.total, request.currency)}
                              </TableCell>
                              <TableCell>
                                {request.paid_amount > 0 ? (
                                  <span className="text-green-600">
                                    {formatAmountWithCurrency(request.paid_amount, request.currency)}
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
        </TabsContent>

        {/* ================================================================
            OUTBOUND TAB (Fees Arranger Must PAY)
            ================================================================ */}
        <TabsContent value="outbound" className="space-y-4">
          {/* Outbound Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Owed Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrencyTotals(outboundSummary.total_owed_by_currency)}
                </div>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                  To partners, introducers & CPs
                </p>
              </CardContent>
            </Card>

            {/* By Entity Type Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrencyTotals(outboundSummary.by_type.partner.total_by_currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {outboundSummary.by_type.partner.count} commission{outboundSummary.by_type.partner.count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  Introducers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrencyTotals(outboundSummary.by_type.introducer.total_by_currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {outboundSummary.by_type.introducer.count} commission{outboundSummary.by_type.introducer.count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Commercial Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrencyTotals(outboundSummary.by_type.commercial_partner.total_by_currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {outboundSummary.by_type.commercial_partner.count} commission{outboundSummary.by_type.commercial_partner.count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Row */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by entity, deal, or type..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Entity Type Filter */}
                <Tabs value={entityTypeFilter} onValueChange={(v) => setEntityTypeFilter(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all" className="text-xs">
                      All ({outboundSummary.count})
                    </TabsTrigger>
                    <TabsTrigger value="partner" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Partners ({outboundSummary.by_type.partner.count})
                    </TabsTrigger>
                    <TabsTrigger value="introducer" className="text-xs">
                      <Handshake className="h-3 w-3 mr-1" />
                      Introducers ({outboundSummary.by_type.introducer.count})
                    </TabsTrigger>
                    <TabsTrigger value="commercial-partner" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      CPs ({outboundSummary.by_type.commercial_partner.count})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Outbound Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-orange-500" />
                Commissions To Pay
              </CardTitle>
              <CardDescription>
                {filteredOutboundCommissions.length} commission{filteredOutboundCommissions.length !== 1 ? 's' : ''} to process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOutboundCommissions.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? 'No commissions match your search'
                      : 'No commissions to pay'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Deal</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOutboundCommissions.map((commission) => (
                        <TableRow key={`${commission.type}-${commission.id}`}>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {ENTITY_TYPE_ICONS[commission.type]}
                              <span className="text-xs">{commission.entity_type_label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {commission.entity_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {commission.deal_name || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatAmountWithCurrency(commission.accrual_amount, commission.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(STATUS_STYLES[commission.status])}
                            >
                              {STATUS_LABELS[commission.status] || commission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {commission.payment_due_date
                              ? formatDate(commission.payment_due_date)
                              : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <CommissionActions
                              commission={commission}
                              onRequestInvoice={handleRequestInvoice}
                              onRequestPayment={handleRequestPayment}
                              onViewInvoice={handleViewInvoice}
                            />
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
      </Tabs>

      {/* Dialogs */}
      <RequestInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        commission={selectedCommission ? {
          id: selectedCommission.id,
          accrual_amount: selectedCommission.accrual_amount,
          currency: selectedCommission.currency,
          entity_name: selectedCommission.entity_name,
          deal: selectedCommission.deal_name ? { name: selectedCommission.deal_name } : undefined,
        } : null}
        commissionType={selectedCommission?.type || 'partner'}
        onSuccess={handleActionSuccess}
      />

      <RequestPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        commission={selectedCommission ? {
          id: selectedCommission.id,
          accrual_amount: selectedCommission.accrual_amount,
          currency: selectedCommission.currency,
          entity_name: selectedCommission.entity_name,
          deal_id: selectedCommission.deal_id || undefined,
          deal: selectedCommission.deal_name ? { id: selectedCommission.deal_id || '', name: selectedCommission.deal_name } : undefined,
        } : null}
        commissionType={selectedCommission?.type || 'partner'}
        onSuccess={handleActionSuccess}
      />

      <ViewInvoiceDialog
        open={viewInvoiceDialogOpen}
        onOpenChange={setViewInvoiceDialogOpen}
        commission={selectedCommission ? {
          id: selectedCommission.id,
          accrual_amount: selectedCommission.accrual_amount,
          currency: selectedCommission.currency,
          entity_name: selectedCommission.entity_name,
          invoice_id: selectedCommission.invoice_id,
          deal: selectedCommission.deal_name ? { name: selectedCommission.deal_name } : undefined,
        } : null}
        commissionType={selectedCommission?.type || 'partner'}
      />
    </div>
  )
}

// ============================================================================
// Commission Actions Component
// ============================================================================

function CommissionActions({
  commission,
  onRequestInvoice,
  onRequestPayment,
  onViewInvoice,
}: {
  commission: OutboundCommission
  onRequestInvoice: (c: OutboundCommission) => void
  onRequestPayment: (c: OutboundCommission) => void
  onViewInvoice: (c: OutboundCommission) => void
}) {
  switch (commission.status) {
    case 'accrued':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRequestInvoice(commission)}
          className="gap-1"
        >
          <Mail className="h-3.5 w-3.5" />
          Request Invoice
        </Button>
      )

    case 'invoice_requested':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Awaiting Invoice
        </Badge>
      )

    case 'invoiced':
      return (
        <div className="flex items-center gap-2">
          {commission.invoice_id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewInvoice(commission)}
              className="gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onRequestPayment(commission)}
            className="gap-1"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Request Payment
          </Button>
        </div>
      )

    case 'paid':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      )

    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )

    default:
      return null
  }
}
