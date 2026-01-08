'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Lock,
  DollarSign,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  Building2,
  Wallet,
  ArrowUpRight,
  AlertTriangle,
  CreditCard,
  BanknoteIcon,
  Download,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { EscrowConfirmModal } from '@/components/lawyer/escrow-confirm-modal'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
}

type ArrangerInfo = {
  id: string
  legal_name: string
  status: string  // 'active' | 'inactive' - arranger_entities uses status not is_active
}

type EscrowDeal = {
  id: string
  deal_id: string
  deal_name: string
  company_name: string | null
  status: string
  legal_counsel: string | null
  wire_escrow_agent: string | null
  wire_bank_name: string | null
  wire_account_holder: string | null
  wire_iban: string | null
  wire_bic: string | null
  escrow_fee_text: string | null
  target_amount: number
  currency: string
  subscriptions_count: number
  pending_funding: number
  funded_amount: number
}

type PendingSettlement = {
  id: string
  investor_name: string
  investor_entity: string | null
  deal_name: string
  deal_id: string
  commitment_amount: number
  funded_amount: number
  outstanding_amount: number
  currency: string
  funding_due_at: string | null
  status: string
  days_overdue: number
}

type FeeEvent = {
  id: string
  deal_id: string
  deal_name: string
  investor_name: string
  subscription_id: string | null
  fee_type: string | null
  base_amount: number | null
  computed_amount: number
  currency: string
  status: string
  event_date: string
  invoice_id: string | null
  invoice_number: string | null
  invoice_status: string | null
  invoice_due_date: string | null
  default_payment_type?: 'introducer' | 'commercial_partner' | 'partner' | 'seller'
  default_recipient_id?: string | null
}

type Summary = {
  totalDeals: number
  pendingSettlements: number
  totalPendingValue: number
  overdueSettlements: number
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  funded: 'bg-green-100 text-green-800 border-green-200',
  partially_funded: 'bg-blue-100 text-blue-800 border-blue-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const FEE_STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800 border-blue-200',
  invoiced: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  waived: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  disputed: 'bg-red-100 text-red-800 border-red-200',
  voided: 'bg-gray-100 text-gray-800 border-gray-200'
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Partially Funded', value: 'partially_funded' },
  { label: 'Funded', value: 'funded' },
  { label: 'Overdue', value: 'overdue' },
]

export default function EscrowPage() {
  const [lawyerInfo, setLawyerInfo] = useState<LawyerInfo | null>(null)
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [escrowDeals, setEscrowDeals] = useState<EscrowDeal[]>([])
  const [pendingSettlements, setPendingSettlements] = useState<PendingSettlement[]>([])
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalDeals: 0,
    pendingSettlements: 0,
    totalPendingValue: 0,
    overdueSettlements: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('deals')
  const [refreshKey, setRefreshKey] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Modal state for escrow confirmations
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmMode, setConfirmMode] = useState<'funding' | 'payment'>('funding')
  const [selectedSettlement, setSelectedSettlement] = useState<PendingSettlement | null>(null)
  const [selectedFeeEvent, setSelectedFeeEvent] = useState<FeeEvent | null>(null)

  const handleOpenConfirmFunding = (settlement: PendingSettlement) => {
    setConfirmMode('funding')
    setSelectedSettlement(settlement)
    setSelectedFeeEvent(null)
    setConfirmModalOpen(true)
  }

  const handleOpenConfirmPayment = (event: FeeEvent) => {
    setConfirmMode('payment')
    setSelectedFeeEvent(event)
    setSelectedSettlement(null)
    setConfirmModalOpen(true)
  }

  const handleConfirmSuccess = useCallback(() => {
    // Refresh data after successful confirmation without full page reload
    setRefreshKey(prev => prev + 1)
  }, [])

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

        // SECURITY: Block partners from accessing escrow/wire info
        // Partners should not see sensitive bank routing information
        const { data: partnerUser } = await supabase
          .from('partner_users')
          .select('partner_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (partnerUser) {
          setError('Access restricted. Partners cannot access escrow information.')
          return
        }

        // Check if user is a lawyer
        const { data: lawyerUser, error: lawyerUserError } = await supabase
          .from('lawyer_users')
          .select('lawyer_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (lawyerUser) {
          // Fetch lawyer info
          const { data: lawyer, error: lawyerError } = await supabase
            .from('lawyers')
            .select('id, firm_name, display_name, specializations, is_active, assigned_deals')
            .eq('id', lawyerUser.lawyer_id)
            .single()

          if (!lawyerError && lawyer) {
            setLawyerInfo(lawyer)
            // Fetch deals assigned to this lawyer
            await fetchLawyerEscrowData(supabase, lawyer.id, lawyer.assigned_deals)
            return
          }
        }

        // Check if user is an arranger
        const { data: arrangerUser, error: arrangerUserError } = await supabase
          .from('arranger_users')
          .select('arranger_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (arrangerUser) {
          // Fetch arranger info
          // Note: arranger_entities uses 'status' not 'is_active', and has no 'company_name'
          const { data: arranger, error: arrangerError } = await supabase
            .from('arranger_entities')
            .select('id, legal_name, status')
            .eq('id', arrangerUser.arranger_id)
            .single()

          if (!arrangerError && arranger) {
            setArrangerInfo(arranger)
            // Fetch deals managed by this arranger
            await fetchArrangerEscrowData(supabase, arranger.id)
            return
          }
        }

        // Staff view - show all escrow data
        await fetchAllEscrowData(supabase)

        setError(null)
      } catch (err) {
        console.error('[EscrowPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load escrow data')
      } finally {
        setLoading(false)
      }
    }

    async function fetchArrangerEscrowData(supabase: any, arrangerId: string) {
      // Get deals managed by this arranger (where arranger_entity_id matches)
      const { data: managedDeals, error: dealsError } = await supabase
        .from('deals')
        .select('id')
        .eq('arranger_entity_id', arrangerId)

      const dealIds = (managedDeals || []).map((d: any) => d.id)

      if (dealIds.length === 0) {
        // No deals managed by this arranger
        await processEscrowData(supabase, [])
        return
      }

      // Get deal fee structures for managed deals
      const { data: feeStructures, error: feeError } = await supabase
        .from('deal_fee_structures')
        .select(`
          id,
          deal_id,
          status,
          legal_counsel,
          wire_escrow_agent,
          wire_bank_name,
          wire_account_holder,
          wire_iban,
          wire_bic,
          escrow_fee_text,
          deal:deal_id (
            id,
            name,
            company_name,
            target_amount,
            currency,
            status
          )
        `)
        .in('deal_id', dealIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (feeError) throw feeError

      await processEscrowData(supabase, feeStructures || [])
    }

    async function fetchLawyerEscrowData(supabase: any, lawyerId: string, lawyerAssignedDeals: string[] | null) {
      // Get deals assigned to this lawyer via deal_lawyer_assignments table
      const { data: assignments, error: assignmentsError } = await supabase
        .from('deal_lawyer_assignments')
        .select('deal_id')
        .eq('lawyer_id', lawyerId)

      let dealIds = (assignments || []).map((a: any) => a.deal_id)

      // Fallback to lawyers.assigned_deals array if no assignments found
      if ((!dealIds.length || assignmentsError) && lawyerAssignedDeals?.length) {
        dealIds = lawyerAssignedDeals
      }

      if (dealIds.length === 0) {
        // No deals assigned
        await processEscrowData(supabase, [])
        return
      }

      // Get deal fee structures for assigned deals
      const { data: feeStructures, error: feeError } = await supabase
        .from('deal_fee_structures')
        .select(`
          id,
          deal_id,
          status,
          legal_counsel,
          wire_escrow_agent,
          wire_bank_name,
          wire_account_holder,
          wire_iban,
          wire_bic,
          escrow_fee_text,
          deal:deal_id (
            id,
            name,
            company_name,
            target_amount,
            currency,
            status
          )
        `)
        .in('deal_id', dealIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (feeError) throw feeError

      await processEscrowData(supabase, feeStructures || [])
    }

    async function fetchAllEscrowData(supabase: any) {
      // Staff view - get all deals with fee structures that have escrow data
      const { data: feeStructures, error: feeError } = await supabase
        .from('deal_fee_structures')
        .select(`
          id,
          deal_id,
          status,
          legal_counsel,
          wire_escrow_agent,
          wire_bank_name,
          wire_account_holder,
          wire_iban,
          wire_bic,
          escrow_fee_text,
          deal:deal_id (
            id,
            name,
            company_name,
            target_amount,
            currency,
            status
          )
        `)
        .not('wire_escrow_agent', 'is', null)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(100)

      if (feeError) throw feeError

      await processEscrowData(supabase, feeStructures || [])
    }

    async function processEscrowData(supabase: any, feeStructures: any[]) {
      if (feeStructures.length === 0) {
        setEscrowDeals([])
        setPendingSettlements([])
        setFeeEvents([])
        setSummary({
          totalDeals: 0,
          pendingSettlements: 0,
          totalPendingValue: 0,
          overdueSettlements: 0,
        })
        return
      }

      const dealIds = feeStructures.map((fs: any) => fs.deal_id)

      // Get subscriptions for these deals
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          deal_id,
          investor_id,
          introducer_id,
          proxy_commercial_partner_id,
          commitment,
          funded_amount,
          outstanding_amount,
          funding_due_at,
          status,
          funded_at,
          investor:investor_id (
            id,
            display_name,
            legal_name
          )
        `)
        .in('deal_id', dealIds)
        .in('status', ['committed', 'approved', 'funded', 'active', 'partially_funded'])
        .order('created_at', { ascending: false })

      if (subError) throw subError

      // Process escrow deals
      const deals: EscrowDeal[] = feeStructures.map((fs: any) => {
        const dealSubs = (subscriptions || []).filter((s: any) => s.deal_id === fs.deal_id)
        const pendingFunding = dealSubs.reduce((sum: number, s: any) =>
          sum + (Number(s.outstanding_amount) || 0), 0)
        const fundedAmount = dealSubs.reduce((sum: number, s: any) =>
          sum + (Number(s.funded_amount) || 0), 0)

        return {
          id: fs.id,
          deal_id: fs.deal_id,
          deal_name: fs.deal?.name || 'Unknown Deal',
          company_name: fs.deal?.company_name,
          status: fs.status,
          legal_counsel: fs.legal_counsel,
          wire_escrow_agent: fs.wire_escrow_agent,
          wire_bank_name: fs.wire_bank_name,
          wire_account_holder: fs.wire_account_holder,
          wire_iban: fs.wire_iban,
          wire_bic: fs.wire_bic,
          escrow_fee_text: fs.escrow_fee_text,
          target_amount: Number(fs.deal?.target_amount) || 0,
          currency: fs.deal?.currency || 'USD',
          subscriptions_count: dealSubs.length,
          pending_funding: pendingFunding,
          funded_amount: fundedAmount,
        }
      })

      setEscrowDeals(deals)

      // Process pending settlements
      const today = new Date()
      const settlements: PendingSettlement[] = (subscriptions || [])
        .filter((s: any) => (Number(s.outstanding_amount) || 0) > 0)
        .map((s: any) => {
          const dueDate = s.funding_due_at ? new Date(s.funding_due_at) : null
          const daysOverdue = dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
          const deal = feeStructures.find((fs: any) => fs.deal_id === s.deal_id)

          let status = s.status
          if (daysOverdue > 0) status = 'overdue'
          else if (Number(s.funded_amount) > 0) status = 'partially_funded'
          else status = 'pending'

          return {
            id: s.id,
            investor_name: s.investor?.display_name || 'Unknown Investor',
            investor_entity: s.investor?.legal_name,
            deal_name: deal?.deal?.name || 'Unknown Deal',
            deal_id: s.deal_id,
            commitment_amount: Number(s.commitment) || 0,
            funded_amount: Number(s.funded_amount) || 0,
            outstanding_amount: Number(s.outstanding_amount) || 0,
            currency: deal?.deal?.currency || 'USD',
            funding_due_at: s.funding_due_at,
            status,
            days_overdue: Math.max(0, daysOverdue),
          }
        })

      setPendingSettlements(settlements)

      const subscriptionMetaById = new Map<string, { introducer_id: string | null; proxy_commercial_partner_id: string | null }>()
      ;(subscriptions || []).forEach((sub: any) => {
        if (sub?.id) {
          subscriptionMetaById.set(sub.id, {
            introducer_id: sub.introducer_id || null,
            proxy_commercial_partner_id: sub.proxy_commercial_partner_id || null
          })
        }
      })

      // Calculate summary
      const overdueCount = settlements.filter(s => s.days_overdue > 0).length
      const totalPending = settlements.reduce((sum, s) => sum + s.outstanding_amount, 0)

      setSummary({
        totalDeals: deals.length,
        pendingSettlements: settlements.length,
        totalPendingValue: totalPending,
        overdueSettlements: overdueCount,
      })

      // Fetch fee events for assigned deals (payment confirmations)
      const { data: feeEventsData, error: feeEventsError } = await supabase
        .from('fee_events')
        .select(`
          id,
          deal_id,
          investor_id,
          fee_type,
          base_amount,
          computed_amount,
          currency,
          status,
          event_date,
          invoice_id,
          allocation_id,
          investors (
            display_name,
            legal_name
          ),
          invoices:invoice_id (
            invoice_number,
            status,
            due_date
          )
        `)
        .in('deal_id', dealIds)
        .order('event_date', { ascending: false })

      if (feeEventsError) {
        console.error('[EscrowPage] Failed to load fee events:', feeEventsError)
        setFeeEvents([])
      } else {
        const dealNameById = new Map<string, string>()
        feeStructures.forEach((fs: any) => {
          if (fs?.deal_id && fs?.deal?.name) {
            dealNameById.set(fs.deal_id, fs.deal.name)
          }
        })

        const mappedFeeEvents: FeeEvent[] = (feeEventsData || []).map((event: any) => {
          const investor = Array.isArray(event.investors) ? event.investors[0] : event.investors
          const invoice = Array.isArray(event.invoices) ? event.invoices[0] : event.invoices
          const subscriptionMeta = event.allocation_id ? subscriptionMetaById.get(event.allocation_id) : null
          let defaultPaymentType: FeeEvent['default_payment_type']
          let defaultRecipientId: string | null = null

          if (subscriptionMeta?.introducer_id) {
            defaultPaymentType = 'introducer'
            defaultRecipientId = subscriptionMeta.introducer_id
          } else if (subscriptionMeta?.proxy_commercial_partner_id) {
            defaultPaymentType = 'commercial_partner'
            defaultRecipientId = subscriptionMeta.proxy_commercial_partner_id
          }

          return {
            id: event.id,
            deal_id: event.deal_id,
            deal_name: dealNameById.get(event.deal_id) || 'Unknown Deal',
            investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
            subscription_id: event.allocation_id || null,
            fee_type: event.fee_type || null,
            base_amount: event.base_amount ?? null,
            computed_amount: Number(event.computed_amount || 0),
            currency: event.currency || 'USD',
            status: event.status || 'accrued',
            event_date: event.event_date,
            invoice_id: event.invoice_id || null,
            invoice_number: invoice?.invoice_number || null,
            invoice_status: invoice?.status || null,
            invoice_due_date: invoice?.due_date || null,
            default_payment_type: defaultPaymentType,
            default_recipient_id: defaultRecipientId
          }
        })

        setFeeEvents(mappedFeeEvents)
      }
    }

    fetchData()
  }, [refreshKey])

  // Filter settlements
  const filteredSettlements = pendingSettlements.filter(settlement => {
    const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter
    const matchesSearch = !search ||
      settlement.investor_name?.toLowerCase().includes(search.toLowerCase()) ||
      settlement.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
      settlement.investor_entity?.toLowerCase().includes(search.toLowerCase())

    // Date range filter
    let matchesDateRange = true
    if (dateRange?.from && settlement.funding_due_at) {
      const dueDate = new Date(settlement.funding_due_at)
      matchesDateRange = dueDate >= dateRange.from
      if (dateRange.to) {
        matchesDateRange = matchesDateRange && dueDate <= dateRange.to
      }
    }

    return matchesStatus && matchesSearch && matchesDateRange
  })

  // Filter deals
  const filteredDeals = escrowDeals.filter(deal => {
    const matchesSearch = !search ||
      deal.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
      deal.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      deal.wire_escrow_agent?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Filter fee events
  const filteredFeeEvents = feeEvents.filter(event => {
    const matchesSearch = !search ||
      event.deal_name.toLowerCase().includes(search.toLowerCase()) ||
      event.investor_name.toLowerCase().includes(search.toLowerCase())

    // Date range filter
    let matchesDateRange = true
    if (dateRange?.from && event.event_date) {
      const eventDate = new Date(event.event_date)
      matchesDateRange = eventDate >= dateRange.from
      if (dateRange.to) {
        matchesDateRange = matchesDateRange && eventDate <= dateRange.to
      }
    }

    return matchesSearch && matchesDateRange
  })

  // Export to CSV function
  const exportToCSV = useCallback(() => {
    const headers = ['Deal', 'Investor', 'Entity', 'Commitment', 'Funded', 'Outstanding', 'Status', 'Due Date']
    const rows = filteredSettlements.map(s => [
      s.deal_name,
      s.investor_name,
      s.investor_entity || '',
      s.commitment_amount.toString(),
      s.funded_amount.toString(),
      s.outstanding_amount.toString(),
      s.status.replace('_', ' '),
      s.funding_due_at || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `escrow-settlements-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredSettlements])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading escrow data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Escrow Data</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Escrow Management</h1>
          <p className="text-muted-foreground mt-1">
            {lawyerInfo
              ? `Manage escrow accounts and settlements for ${lawyerInfo.display_name}`
              : arrangerInfo
                ? `View escrow status for deals managed by ${arrangerInfo.legal_name}`
                : 'Monitor all escrow accounts and pending settlements'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingSettlements.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          {lawyerInfo && lawyerInfo.specializations && lawyerInfo.specializations.length > 0 && (
            <div className="flex gap-1">
              {lawyerInfo.specializations.slice(0, 2).map((spec, idx) => (
                <Badge key={idx} variant="outline" className="capitalize">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
          {arrangerInfo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Arranger View
            </Badge>
          )}
        </div>
      </div>

      {/* Arranger Info Banner - explains view-only access */}
      {arrangerInfo && !lawyerInfo && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">View-Only Access</p>
            <p className="text-blue-700 dark:text-blue-300 mt-0.5">
              As an arranger, you can monitor escrow status and view transaction details for deals you manage.
              Funding confirmations and fee payments are handled by assigned lawyers.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Escrow Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active escrow accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingSettlements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting funding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalPendingValue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueSettlements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Past due date
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
                  placeholder="Search deals, investors, or escrow agents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'settlements' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(activeTab === 'settlements' || activeTab === 'payments') && (
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full md:w-auto"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Escrow Accounts ({escrowDeals.length})
          </TabsTrigger>
          <TabsTrigger value="settlements" className="flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4" />
            Pending Settlements ({pendingSettlements.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fee Payments ({feeEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Accounts</CardTitle>
              <CardDescription>
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} with escrow accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDeals.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? 'No escrow accounts match your search'
                      : lawyerInfo
                        ? 'No deals with you as legal counsel'
                        : arrangerInfo
                          ? 'No deals managed by your arranger entity'
                          : 'No deals with escrow accounts found'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal</TableHead>
                        <TableHead>Escrow Agent</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Subscriptions</TableHead>
                        <TableHead>Funded / Pending</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeals.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{deal.deal_name}</div>
                                {deal.company_name && (
                                  <div className="text-xs text-muted-foreground">
                                    {deal.company_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {deal.wire_escrow_agent || '—'}
                            </div>
                            {deal.escrow_fee_text && (
                              <div className="text-xs text-muted-foreground">
                                {deal.escrow_fee_text}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{deal.wire_bank_name || '—'}</div>
                              {deal.wire_iban && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {deal.wire_iban.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {deal.subscriptions_count} investor{deal.subscriptions_count !== 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(deal.funded_amount, deal.currency)} funded
                              </div>
                              {deal.pending_funding > 0 && (
                                <div className="text-xs text-yellow-600">
                                  {formatCurrency(deal.pending_funding, deal.currency)} pending
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={lawyerInfo ? `/versotech_main/lawyer-deal/${deal.deal_id}` : `/versotech_main/opportunities/${deal.deal_id}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
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

        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <CardTitle>Pending Settlements</CardTitle>
              <CardDescription>
                {filteredSettlements.length} settlement{filteredSettlements.length !== 1 ? 's' : ''} awaiting funding
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSettlements.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search || statusFilter !== 'all'
                      ? 'No settlements match your filters'
                      : 'No pending settlements'}
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
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSettlements.map((settlement) => (
                        <TableRow key={settlement.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{settlement.investor_name}</div>
                              {settlement.investor_entity && (
                                <div className="text-xs text-muted-foreground">
                                  {settlement.investor_entity}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={lawyerInfo ? `/versotech_main/lawyer-deal/${settlement.deal_id}` : `/versotech_main/opportunities/${settlement.deal_id}`}
                              className="text-primary hover:underline"
                            >
                              {settlement.deal_name}
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(settlement.commitment_amount, settlement.currency)}
                            </div>
                            {settlement.funded_amount > 0 && (
                              <div className="text-xs text-green-600">
                                {formatCurrency(settlement.funded_amount, settlement.currency)} received
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-yellow-600">
                              {formatCurrency(settlement.outstanding_amount, settlement.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {settlement.funding_due_at ? (
                              <div className={cn(
                                "text-sm",
                                settlement.days_overdue > 0 && "text-red-600 font-medium"
                              )}>
                                {formatDate(settlement.funding_due_at)}
                                {settlement.days_overdue > 0 && (
                                  <div className="text-xs">
                                    {settlement.days_overdue} day{settlement.days_overdue !== 1 ? 's' : ''} overdue
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', STATUS_STYLES[settlement.status] || STATUS_STYLES.pending)}
                            >
                              {settlement.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {settlement.status !== 'funded' && lawyerInfo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConfirmFunding(settlement)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Confirm Funding
                              </Button>
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

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Fee Payments</CardTitle>
              <CardDescription>
                {filteredFeeEvents.length} fee event{filteredFeeEvents.length !== 1 ? 's' : ''} for assigned deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFeeEvents.length === 0 ? (
                <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No fee events match your filters' : 'No fee events to display'}
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
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeeEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="font-medium">{event.deal_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{event.investor_name}</div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {(event.fee_type || 'fee').replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(event.computed_amount, event.currency)}
                            </div>
                            {event.base_amount != null && (
                              <div className="text-xs text-muted-foreground">
                                Base: {formatCurrency(event.base_amount, event.currency)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {event.invoice_number ? (
                              <div>
                                <div className="text-sm font-medium">{event.invoice_number}</div>
                                {event.invoice_status && (
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {event.invoice_status.replace('_', ' ')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not issued</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {event.invoice_due_date ? (
                              <div className="text-sm">{formatDate(event.invoice_due_date)}</div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', FEE_STATUS_STYLES[event.status] || 'bg-gray-100 text-gray-800 border-gray-200')}
                            >
                              {event.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {['accrued', 'invoiced'].includes(event.status) && event.subscription_id && lawyerInfo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConfirmPayment(event)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Confirm Payment
                              </Button>
                            )}
                            {['accrued', 'invoiced'].includes(event.status) && !event.subscription_id && lawyerInfo && (
                              <span className="text-xs text-muted-foreground">No subscription</span>
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
      </Tabs>

      {/* Escrow Confirmation Modal */}
      {(selectedSettlement || selectedFeeEvent) && (
        <EscrowConfirmModal
          open={confirmModalOpen}
          onOpenChange={setConfirmModalOpen}
          mode={confirmMode}
          subscriptionId={selectedSettlement?.id || selectedFeeEvent?.subscription_id || ''}
          investorName={selectedSettlement?.investor_name || selectedFeeEvent?.investor_name || 'Recipient'}
          dealName={selectedSettlement?.deal_name || selectedFeeEvent?.deal_name || 'Deal'}
          commitment={selectedSettlement?.commitment_amount || 0}
          fundedAmount={selectedSettlement?.funded_amount || 0}
          currency={selectedSettlement?.currency || selectedFeeEvent?.currency || 'USD'}
          feeEventId={selectedFeeEvent?.id || null}
          defaultAmount={selectedFeeEvent?.computed_amount || null}
          defaultPaymentType={selectedFeeEvent?.default_payment_type}
          defaultRecipientId={selectedFeeEvent?.default_recipient_id || null}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  )
}
