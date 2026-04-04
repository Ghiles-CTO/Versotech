'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
// Card components removed — using plain rounded-2xl divs matching investor dashboard pattern
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Briefcase,
  Users,
  UserPlus,
  Building2,
  Scale,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  FileSignature,
  Package,
  Lock,
  Calculator,
  ClipboardList,
} from 'lucide-react'
// Alert removed — using inline styled divs
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { ArrangerOnboardingChecklist } from '@/components/arranger/arranger-onboarding-checklist'
import {
  type CurrencyTotals,
  sumByCurrency,
  mergeCurrencyTotals,
  currencyTotalsEntries,
  normalizeCurrencyCode,
} from '@/lib/currency-totals'

// ─── Types ───────────────────────────────────────────────

type Persona = {
  persona_type: string
  entity_id: string
  entity_name: string
  role_in_entity?: string | null
  can_sign?: boolean
  logo_url?: string | null
}

interface ArrangerDashboardProps {
  arrangerId: string
  userId: string
  persona: Persona
}

type ArrangerMetrics = {
  totalMandates: number
  activeMandates: number
  pendingMandates: number
  totalPartners: number
  totalIntroducers: number
  totalCommercialPartners: number
  totalLawyers: number
  pendingAgreements: number
}

type EscrowMetrics = {
  totalExpectedByCurrency: CurrencyTotals
  totalFundedByCurrency: CurrencyTotals
  totalOutstandingByCurrency: CurrencyTotals
}

type FeeMetrics = {
  dueByCurrency: CurrencyTotals
  invoicedByCurrency: CurrencyTotals
  paidByCurrency: CurrencyTotals
  pipelineByCurrency: CurrencyTotals
}

type RecentMandate = {
  id: string
  name: string
  status: string
  target_amount: number | null
  currency: string | null
  created_at: string
}

type PendingAgreement = {
  id: string
  entity_name: string
  entity_type: 'introducer' | 'commercial_partner'
  status: string
  created_at: string
}

type SubscriptionPackMetrics = {
  awaitingInvestorSignature: number
  awaitingArrangerSignature: number
  awaitingCEOSignature: number
  signedThisMonth: number
  totalPending: number
}

type DetailRow = {
  dealName: string
  count: number
  amount: number
  extra?: number
  extra2?: number
}

// ─── Currency Styling ────────────────────────────────────

const CURRENCY_COLORS: Record<string, { accent: string; bg: string; darkBg: string; bar: string }> = {
  USD: { accent: 'text-emerald-500', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
  EUR: { accent: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', bar: 'bg-blue-500' },
  GBP: { accent: 'text-violet-500', bg: 'bg-violet-50', darkBg: 'bg-violet-500/10', bar: 'bg-violet-500' },
  CHF: { accent: 'text-rose-500', bg: 'bg-rose-50', darkBg: 'bg-rose-500/10', bar: 'bg-rose-500' },
  ETH: { accent: 'text-cyan-500', bg: 'bg-cyan-50', darkBg: 'bg-cyan-500/10', bar: 'bg-cyan-500' },
}
const defaultCc = { accent: 'text-gray-500', bg: 'bg-gray-50', darkBg: 'bg-gray-500/10', bar: 'bg-gray-500' }
const cc = (code: string) => CURRENCY_COLORS[code] || defaultCc

// ─── Component ───────────────────────────────────────────

export function ArrangerDashboard({ arrangerId, userId, persona }: ArrangerDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  // Core state
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<ArrangerMetrics | null>(null)
  const [arrangerInfo, setArrangerInfo] = useState<{
    legal_name: string
    status: string
    kyc_status: string | null
  } | null>(null)
  const [recentMandates, setRecentMandates] = useState<RecentMandate[]>([])
  const [pendingAgreements, setPendingAgreements] = useState<PendingAgreement[]>([])
  const [subPackMetrics, setSubPackMetrics] = useState<SubscriptionPackMetrics | null>(null)

  // New financial state
  const [commitmentByCurrency, setCommitmentByCurrency] = useState<CurrencyTotals>({})
  const [escrowMetrics, setEscrowMetrics] = useState<EscrowMetrics | null>(null)
  const [feeMetrics, setFeeMetrics] = useState<FeeMetrics | null>(null)

  // Refs for dialog queries
  const dealIdsRef = useRef<string[]>([])

  // Dialog state
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean
    title: string
    data: DetailRow[]
    loading: boolean
    columns: string[]
  }>({ open: false, title: '', data: [], loading: false, columns: [] })

  const formatAmountWithCurrency = (amount: number, currency?: string | null) => {
    if (currency) return formatCurrency(amount, currency)
    return amount.toLocaleString('en-US')
  }

  // ─── Data Fetching ──────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch arranger entity info
        const { data: arranger } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status, kyc_status')
          .eq('id', arrangerId)
          .maybeSingle()

        if (arranger) {
          setArrangerInfo({
            legal_name: arranger.legal_name,
            status: arranger.status,
            kyc_status: arranger.kyc_status,
          })
        }

        // VEHICLE-LEVEL: Fetch vehicles assigned to this arranger
        const { data: arrangerVehicles } = await supabase
          .from('vehicles')
          .select('id, name, lawyer_id')
          .eq('arranger_entity_id', arrangerId)

        const vehicleIds = (arrangerVehicles || []).map((v: any) => v.id)

        // Fetch all deals under those vehicles (mandates)
        let deals: any[] = []
        if (vehicleIds.length > 0) {
          const { data: vehicleDeals } = await supabase
            .from('deals')
            .select('id, name, status, target_amount, currency, created_at, vehicle_id')
            .in('vehicle_id', vehicleIds)
            .order('created_at', { ascending: false })
          deals = vehicleDeals || []
        }

        const mandates = deals || []
        const activeMandates = mandates.filter((d: any) => d.status === 'open' || d.status === 'allocation_pending')
        const pendingMandates = mandates.filter((d: any) => d.status === 'draft')

        setRecentMandates(mandates.slice(0, 5).map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          target_amount: d.target_amount,
          currency: d.currency ? String(d.currency).toUpperCase() : null,
          created_at: d.created_at,
        })))

        const dealIds = mandates.map((d: any) => d.id)
        dealIdsRef.current = dealIds

        // ── Commitment & Escrow by Currency ──
        let totalCommitmentByCurrency: CurrencyTotals = {}
        let escrow: EscrowMetrics = {
          totalExpectedByCurrency: {},
          totalFundedByCurrency: {},
          totalOutstandingByCurrency: {},
        }

        if (dealIds.length > 0) {
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('commitment, funded_amount, outstanding_amount, currency, status')
            .in('deal_id', dealIds)
            .in('status', ['committed', 'partially_funded', 'funded', 'active', 'signed'])

          totalCommitmentByCurrency = sumByCurrency(
            subscriptions || [],
            (s: any) => s.commitment,
            (s: any) => s.currency
          )

          escrow = {
            totalExpectedByCurrency: sumByCurrency(
              subscriptions || [],
              (s: any) => s.commitment,
              (s: any) => s.currency
            ),
            totalFundedByCurrency: sumByCurrency(
              subscriptions || [],
              (s: any) => s.funded_amount,
              (s: any) => s.currency
            ),
            totalOutstandingByCurrency: sumByCurrency(
              subscriptions || [],
              (s: any) => s.outstanding_amount,
              (s: any) => s.currency
            ),
          }
        }

        setCommitmentByCurrency(totalCommitmentByCurrency)
        setEscrowMetrics(escrow)

        // ── Fee Metrics (scoped to arranger's deals) ──
        let validFees: any[] = []
        if (dealIds.length > 0) {
          const { data: feeData } = await supabase
            .from('fee_events')
            .select('computed_amount, status, currency')
            .in('deal_id', dealIds)

          validFees = (feeData || []).filter((f: any) => f.status !== 'voided' && f.status !== 'cancelled')
        }
        const accruedFees = validFees.filter((f: any) => f.status === 'accrued')
        const invoicedFees = validFees.filter((f: any) => f.status === 'invoiced')
        const paidFees = validFees.filter((f: any) => f.status === 'paid')

        const dueByCurrency = sumByCurrency(accruedFees, (f: any) => f.computed_amount, (f: any) => f.currency)
        const invoicedByCurrency = sumByCurrency(invoicedFees, (f: any) => f.computed_amount, (f: any) => f.currency)
        const paidByCurrency = sumByCurrency(paidFees, (f: any) => f.computed_amount, (f: any) => f.currency)

        setFeeMetrics({
          dueByCurrency,
          invoicedByCurrency,
          paidByCurrency,
          pipelineByCurrency: mergeCurrencyTotals(dueByCurrency, invoicedByCurrency),
        })

        // ── Entity Counts (scoped to arranger's deals) ──
        let partnersCount = 0
        let introducersCount = 0
        let cpCount = 0

        const uniqueLawyers = new Set(
          (arrangerVehicles || [])
            .filter((v: any) => v.lawyer_id)
            .map((v: any) => v.lawyer_id)
        )
        const lawyersCount = uniqueLawyers.size

        if (dealIds.length > 0) {
          const { data: dealSubscriptions } = await supabase
            .from('subscriptions')
            .select('id, investor_id, introducer_id, proxy_commercial_partner_id')
            .in('deal_id', dealIds)

          const introducerIds = new Set(
            (dealSubscriptions || [])
              .filter((s: any) => s.introducer_id)
              .map((s: any) => s.introducer_id)
          )
          introducersCount = introducerIds.size

          const { data: partnerReferrals } = await supabase
            .from('deal_memberships')
            .select('referred_by_entity_id')
            .in('deal_id', dealIds)
            .eq('referred_by_entity_type', 'partner')
            .not('referred_by_entity_id', 'is', null)

          partnersCount = new Set(
            (partnerReferrals || []).map((r: any) => r.referred_by_entity_id)
          ).size

          const cpIds = new Set(
            (dealSubscriptions || [])
              .filter((s: any) => s.proxy_commercial_partner_id)
              .map((s: any) => s.proxy_commercial_partner_id)
          )
          cpCount = cpIds.size
        }

        // ── Pending Agreements ──
        const { data: introducerAgreements } = await supabase
          .from('introducer_agreements')
          .select(`
            id, status, created_at,
            introducers (id, display_name, legal_name)
          `)
          .eq('arranger_id', arrangerId)
          .in('status', ['sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_introducer_signature'])
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: placementAgreements } = await supabase
          .from('placement_agreements')
          .select(`
            id, status, created_at,
            commercial_partners (id, display_name, legal_name)
          `)
          .eq('arranger_id', arrangerId)
          .in('status', ['sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_cp_signature'])
          .order('created_at', { ascending: false })
          .limit(5)

        const allPendingAgreements: PendingAgreement[] = []

        ;(introducerAgreements || []).forEach((a: any) => {
          const intro = Array.isArray(a.introducers) ? a.introducers[0] : a.introducers
          allPendingAgreements.push({
            id: a.id,
            entity_name: intro?.display_name || intro?.legal_name || 'Unknown',
            entity_type: 'introducer',
            status: a.status,
            created_at: a.created_at,
          })
        })

        ;(placementAgreements || []).forEach((a: any) => {
          const cp = Array.isArray(a.commercial_partners) ? a.commercial_partners[0] : a.commercial_partners
          allPendingAgreements.push({
            id: a.id,
            entity_name: cp?.display_name || cp?.legal_name || 'Unknown',
            entity_type: 'commercial_partner',
            status: a.status,
            created_at: a.created_at,
          })
        })

        allPendingAgreements.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setPendingAgreements(allPendingAgreements.slice(0, 5))

        // ── Subscription Pack Pipeline ──
        if (dealIds.length > 0) {
          const { data: subDocs } = await supabase
            .from('documents')
            .select(`
              id, subscription_id, status, ready_for_signature,
              signature_requests(id, signer_role, status)
            `)
            .not('subscription_id', 'is', null)
            .in('status', ['published', 'pending_signature'])

          const { data: arrangerSubscriptions } = await supabase
            .from('subscriptions')
            .select('id')
            .in('deal_id', dealIds)

          const arrangerSubIds = new Set((arrangerSubscriptions || []).map((s: any) => s.id))
          const arrangerDocs = (subDocs || []).filter((doc: any) => arrangerSubIds.has(doc.subscription_id))

          let awaitingInvestor = 0
          let awaitingArranger = 0
          let awaitingCEO = 0

          arrangerDocs.forEach((doc: any) => {
            if (doc.status !== 'pending_signature') return
            const requests = doc.signature_requests || []
            if (requests.some((r: any) => r.signer_role === 'investor' && r.status === 'pending')) awaitingInvestor++
            if (requests.some((r: any) => r.signer_role === 'arranger' && r.status === 'pending')) awaitingArranger++
            if (requests.some((r: any) => r.signer_role === 'admin' && r.status === 'pending')) awaitingCEO++
          })

          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)

          const { count: signedThisMonth } = await supabase
            .from('subscriptions')
            .select('id', { count: 'exact', head: true })
            .in('deal_id', dealIds)
            .not('signed_at', 'is', null)
            .gte('signed_at', startOfMonth.toISOString())

          setSubPackMetrics({
            awaitingInvestorSignature: awaitingInvestor,
            awaitingArrangerSignature: awaitingArranger,
            awaitingCEOSignature: awaitingCEO,
            signedThisMonth: signedThisMonth || 0,
            totalPending: awaitingInvestor + awaitingArranger + awaitingCEO,
          })
        } else {
          setSubPackMetrics({
            awaitingInvestorSignature: 0,
            awaitingArrangerSignature: 0,
            awaitingCEOSignature: 0,
            signedThisMonth: 0,
            totalPending: 0,
          })
        }

        setMetrics({
          totalMandates: mandates.length,
          activeMandates: activeMandates.length,
          pendingMandates: pendingMandates.length,
          totalPartners: partnersCount || 0,
          totalIntroducers: introducersCount || 0,
          totalCommercialPartners: cpCount || 0,
          totalLawyers: lawyersCount,
          pendingAgreements: allPendingAgreements.length,
        })
      } catch (error) {
        console.error('Error fetching arranger data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [arrangerId])

  // ─── Dialog Detail Fetchers ─────────────────────────────

  async function openOutstandingDetail(currency: string) {
    setDetailDialog({ open: true, title: `Outstanding — ${currency}`, data: [], loading: true, columns: ['Deal', 'Subscriptions', 'Commitment', 'Funded', 'Outstanding'] })
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('subscriptions')
        .select('commitment, funded_amount, outstanding_amount, currency, deal_id, deals(name)')
        .in('deal_id', dealIdsRef.current)
        .in('status', ['committed', 'partially_funded', 'funded', 'active', 'signed'])

      const filtered = (data || []).filter((s: any) => normalizeCurrencyCode(s.currency) === currency && (s.outstanding_amount || 0) > 0)

      // Group by deal
      const byDeal = new Map<string, { name: string; count: number; commitment: number; funded: number; outstanding: number }>()
      filtered.forEach((s: any) => {
        const dealName = (s.deals as any)?.name || 'Unknown Deal'
        const existing = byDeal.get(dealName) || { name: dealName, count: 0, commitment: 0, funded: 0, outstanding: 0 }
        existing.count++
        existing.commitment += s.commitment || 0
        existing.funded += s.funded_amount || 0
        existing.outstanding += s.outstanding_amount || 0
        byDeal.set(dealName, existing)
      })

      const rows: DetailRow[] = Array.from(byDeal.values()).map(d => ({
        dealName: d.name,
        count: d.count,
        amount: d.commitment,
        extra: d.funded,
        extra2: d.outstanding,
      }))

      setDetailDialog(prev => ({ ...prev, data: rows, loading: false }))
    } catch {
      setDetailDialog(prev => ({ ...prev, loading: false }))
    }
  }

  async function openFeesDetail(currency: string, type: 'pipeline' | 'due' | 'invoiced' | 'paid') {
    const labels: Record<string, string> = { pipeline: 'Fees Pipeline', due: 'Due Fees', invoiced: 'Invoiced Fees', paid: 'Paid Fees' }
    setDetailDialog({ open: true, title: `${labels[type]} — ${currency}`, data: [], loading: true, columns: ['Deal', 'Events', 'Total Amount'] })
    try {
      const supabase = createClient()
      const statusFilter = type === 'pipeline' ? ['accrued', 'invoiced'] : type === 'due' ? ['accrued'] : [type]

      const { data } = await supabase
        .from('fee_events')
        .select('computed_amount, status, currency, deal_id, deals(name)')
        .in('deal_id', dealIdsRef.current)
        .in('status', statusFilter)

      const filtered = (data || []).filter((f: any) => normalizeCurrencyCode(f.currency) === currency)

      const byDeal = new Map<string, { name: string; count: number; amount: number }>()
      filtered.forEach((f: any) => {
        const dealName = (f.deals as any)?.name || 'Unknown Deal'
        const existing = byDeal.get(dealName) || { name: dealName, count: 0, amount: 0 }
        existing.count++
        existing.amount += f.computed_amount || 0
        byDeal.set(dealName, existing)
      })

      const rows: DetailRow[] = Array.from(byDeal.values()).map(d => ({
        dealName: d.name,
        count: d.count,
        amount: d.amount,
      }))

      setDetailDialog(prev => ({ ...prev, data: rows, loading: false }))
    } catch {
      setDetailDialog(prev => ({ ...prev, loading: false }))
    }
  }

  // ─── Loading ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    )
  }

  // ─── Style Maps ─────────────────────────────────────────

  const dealStatusStyles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    open: 'bg-green-500/20 text-green-400',
    allocation_pending: 'bg-amber-500/20 text-amber-400',
    closed: 'bg-purple-500/20 text-purple-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  const agreementStatusStyles: Record<string, string> = {
    sent: 'bg-blue-500/20 text-blue-400',
    pending_approval: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    pending_ceo_signature: 'bg-purple-500/20 text-purple-400',
    pending_introducer_signature: 'bg-indigo-500/20 text-indigo-400',
    pending_cp_signature: 'bg-indigo-500/20 text-indigo-400',
  }

  const agreementStatusLabels: Record<string, string> = {
    sent: 'Sent',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    pending_ceo_signature: 'Awaiting CEO Signature',
    pending_introducer_signature: 'Awaiting Signature',
    pending_cp_signature: 'Awaiting Signature',
  }

  // Fixed currencies per Linear issue — always show all 5
  const CURRENCIES = ['USD', 'CHF', 'EUR', 'GBP', 'ETH'] as const

  const commitmentEntries = currencyTotalsEntries(commitmentByCurrency)

  // ─── Render ─────────────────────────────────────────────

  // Unified design tokens — high contrast, readable, consistent
  const S = {
    card: cn("rounded-2xl border p-5", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"),
    cardHover: cn("rounded-2xl border p-5 transition-all cursor-pointer", isDark ? "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"),
    heading: cn("text-sm font-semibold tracking-tight", isDark ? "text-zinc-100" : "text-slate-900"),
    label: cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-300" : "text-slate-600"),
    value: cn("text-2xl font-semibold tabular-nums tracking-tight", isDark ? "text-white" : "text-slate-900"),
    valueSm: cn("text-base font-semibold tabular-nums", isDark ? "text-white" : "text-slate-900"),
    helper: cn("text-xs font-medium", isDark ? "text-zinc-400" : "text-slate-500"),
    cta: "mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-primary",
  }

  // Clickable currency row — used for Outstanding + Fees Pipeline
  const currencyRow = (code: string, amount: number, onClick: () => void) => {
    const c = cc(code)
    return (
      <button key={code} onClick={onClick} className={cn("w-full flex items-center justify-between rounded-xl p-3 border transition-colors cursor-pointer", isDark ? `${c.darkBg} border-white/5 hover:border-white/20` : `${c.bg} border-black/5 hover:border-black/15`)}>
        <span className={cn("text-xs font-semibold uppercase", c.accent)}>{code}</span>
        <span className={S.valueSm}>{formatCurrency(amount, code)}</span>
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          Arranger Dashboard
        </h1>
        <p className={cn("mt-1 text-sm", isDark ? "text-zinc-300" : "text-slate-600")}>
          {arrangerInfo?.legal_name || persona.entity_name}
        </p>
      </div>

      {/* Alert for inactive/pending arranger */}
      {arrangerInfo && arrangerInfo.status !== 'active' && (
        <div className={cn("rounded-2xl border p-4 flex items-center gap-3", isDark ? "border-amber-500/30 bg-amber-500/10" : "border-amber-300 bg-amber-50")}>
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
              Account {arrangerInfo.status === 'pending' ? 'Pending Approval' : 'Inactive'}
            </p>
            <p className={S.helper}>
              Contact the VERSO team for {arrangerInfo.status === 'pending' ? 'status updates' : 'assistance'}.
            </p>
          </div>
        </div>
      )}

      {/* Onboarding Checklist */}
      {arrangerInfo?.kyc_status !== 'approved' && (
        <ArrangerOnboardingChecklist arrangerId={arrangerId} compact />
      )}

      {/* ── 1. Top Boxes: Total Mandates · Active Network · Assigned Lawyers ── */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Link href="/versotech_main/my-mandates" className={cn(S.cardHover, "group flex flex-col")}>
          <p className={S.label}>Total Mandates</p>
          <p className={cn(S.value, "mt-2")}>{metrics?.totalMandates || 0}</p>
          <p className={cn(S.helper, "mt-1")}>{metrics?.activeMandates || 0} active · {metrics?.pendingMandates || 0} pending</p>
          <span className={S.cta}>View mandates <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/versotech_main/my-introducers" className={cn(S.cardHover, "group flex flex-col")}>
          <p className={S.label}>Active Network</p>
          <p className={cn(S.value, "mt-2")}>{(metrics?.totalPartners || 0) + (metrics?.totalIntroducers || 0) + (metrics?.totalCommercialPartners || 0)}</p>
          <p className={cn(S.helper, "mt-1")}>Partners, introducers &amp; CPs</p>
          <span className={S.cta}>View network <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/versotech_main/my-lawyers" className={cn(S.cardHover, "group flex flex-col")}>
          <p className={S.label}>Assigned Lawyers</p>
          <p className={cn(S.value, "mt-2")}>{metrics?.totalLawyers || 0}</p>
          <p className={cn(S.helper, "mt-1")}>Across your vehicles</p>
          <span className={S.cta}>View lawyers <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </Link>
      </div>

      {/* ── 2. Total Commitment — one box per currency, always all 5 ── */}
      <div className={S.card}>
        <p className={S.heading}>Total Commitment</p>
        <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {CURRENCIES.map((code) => {
            const c = cc(code)
            return (
              <div key={code} className={cn("rounded-xl border p-4 flex flex-col", isDark ? `${c.darkBg} border-white/5` : `${c.bg} border-black/5`)}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider", c.accent)}>{code}</p>
                <p className={cn(S.valueSm, "mt-1.5")}>{formatCurrency(commitmentByCurrency[code] || 0, code)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Escrow Funding Status — always all 5 currencies ── */}
      <div className={S.card}>
        <p className={S.heading}>Escrow Funding Status</p>
        <div className="mt-3 space-y-3">
          {CURRENCIES.map((code) => {
            const funded = escrowMetrics?.totalFundedByCurrency[code] || 0
            const expected = escrowMetrics?.totalExpectedByCurrency[code] || 0
            const pct = expected > 0 ? (funded / expected) * 100 : 0
            const c = cc(code)
            return (
              <div key={code}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className={cn("text-sm font-semibold tabular-nums", isDark ? "text-white" : "text-slate-900")}>
                    <span className={cn("text-xs mr-1.5", c.accent)}>{code}</span>
                    {formatCurrency(funded, code)}
                  </span>
                  <span className={cn(S.helper, "font-medium tabular-nums")}>{pct.toFixed(1)}% funded</span>
                </div>
                <div className={cn("h-2 w-full rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-slate-200")}>
                  <div className={cn("h-full rounded-full transition-all duration-500", c.bar)} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 6 & 7. Outstanding + Fees Pipeline — always all 5 currencies, clickable ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={S.card}>
          <p className={S.heading}>Outstanding</p>
          <p className={cn(S.helper, "mt-0.5 mb-3")}>Click for details</p>
          <div className="space-y-2">
            {CURRENCIES.map((code) => currencyRow(code, escrowMetrics?.totalOutstandingByCurrency[code] || 0, () => openOutstandingDetail(code)))}
          </div>
        </div>
        <div className={S.card}>
          <p className={S.heading}>Fees Pipeline</p>
          <p className={cn(S.helper, "mt-0.5 mb-3")}>Click for details</p>
          <div className="space-y-2">
            {CURRENCIES.map((code) => currencyRow(code, feeMetrics?.pipelineByCurrency[code] || 0, () => openFeesDetail(code, 'pipeline')))}
          </div>
        </div>
      </div>

      {/* ── 8. Fees Payment Status — always all 5 currencies ── */}
      <div className={S.card}>
        <p className={S.heading}>Fees Payment Status</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("border-b", isDark ? "border-white/10" : "border-slate-200")}>
                <th className={cn("text-left py-2 pr-4", S.label)}>Currency</th>
                <th className={cn("text-right py-2 px-4", S.label)}>Due</th>
                <th className={cn("text-right py-2 px-4", S.label)}>Invoiced</th>
                <th className={cn("text-right py-2 pl-4", S.label)}>Paid</th>
              </tr>
            </thead>
            <tbody>
              {CURRENCIES.map((code) => {
                const due = feeMetrics?.dueByCurrency[code] || 0
                const inv = feeMetrics?.invoicedByCurrency[code] || 0
                const paid = feeMetrics?.paidByCurrency[code] || 0
                return (
                  <tr key={code} className={cn("border-b last:border-0", isDark ? "border-white/5" : "border-slate-100")}>
                    <td className="py-3 pr-4"><span className={cn(S.label, cc(code).accent)}>{code}</span></td>
                    <td className="text-right py-3 px-4">
                      {due > 0 ? <button onClick={() => openFeesDetail(code, 'due')} className={cn("tabular-nums font-semibold hover:underline cursor-pointer", isDark ? "text-amber-400" : "text-amber-600")}>{formatCurrency(due, code)}</button> : <span className={cn("tabular-nums", isDark ? "text-zinc-500" : "text-slate-400")}>—</span>}
                    </td>
                    <td className="text-right py-3 px-4">
                      {inv > 0 ? <button onClick={() => openFeesDetail(code, 'invoiced')} className={cn("tabular-nums font-semibold hover:underline cursor-pointer", isDark ? "text-blue-400" : "text-blue-600")}>{formatCurrency(inv, code)}</button> : <span className={cn("tabular-nums", isDark ? "text-zinc-500" : "text-slate-400")}>—</span>}
                    </td>
                    <td className="text-right py-3 pl-4">
                      {paid > 0 ? <button onClick={() => openFeesDetail(code, 'paid')} className={cn("tabular-nums font-semibold hover:underline cursor-pointer", isDark ? "text-green-400" : "text-green-600")}>{formatCurrency(paid, code)}</button> : <span className={cn("tabular-nums", isDark ? "text-zinc-500" : "text-slate-400")}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Subscription Pack Pipeline ── */}
      <div className={S.card}>
        <p className={S.heading}>Subscription Pack Pipeline</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/versotech_main/subscription-packs" className={cn("rounded-xl border p-4 text-center transition-all hover:scale-[1.02]", isDark ? "bg-amber-500/10 border-white/5 hover:border-amber-500/30" : "bg-amber-50 border-amber-100/50 hover:border-amber-300")}>
            <p className={cn(S.value, "text-amber-500")}>{subPackMetrics?.awaitingInvestorSignature || 0}</p>
            <p className={cn(S.helper, "mt-1")}>Awaiting Investor</p>
          </Link>
          <Link href="/versotech_main/subscription-packs" className={cn("rounded-xl border p-4 text-center transition-all hover:scale-[1.02]", isDark ? "bg-purple-500/10 border-white/5 hover:border-purple-500/30" : "bg-purple-50 border-purple-100/50 hover:border-purple-300")}>
            <p className={cn(S.value, "text-purple-500")}>{subPackMetrics?.awaitingArrangerSignature || 0}</p>
            <p className={cn(S.helper, "mt-1")}>Awaiting Your Signature</p>
          </Link>
          <Link href="/versotech_main/subscription-packs" className={cn("rounded-xl border p-4 text-center transition-all hover:scale-[1.02]", isDark ? "bg-blue-500/10 border-white/5 hover:border-blue-500/30" : "bg-blue-50 border-blue-100/50 hover:border-blue-300")}>
            <p className={cn(S.value, "text-blue-500")}>{subPackMetrics?.awaitingCEOSignature || 0}</p>
            <p className={cn(S.helper, "mt-1")}>Awaiting CEO</p>
          </Link>
          <Link href="/versotech_main/subscription-packs" className={cn("rounded-xl border p-4 text-center transition-all hover:scale-[1.02]", isDark ? "bg-green-500/10 border-white/5 hover:border-green-500/30" : "bg-green-50 border-green-100/50 hover:border-green-300")}>
            <p className={cn(S.value, "text-green-500")}>{subPackMetrics?.signedThisMonth || 0}</p>
            <p className={cn(S.helper, "mt-1")}>Signed This Month</p>
          </Link>
        </div>
        {(subPackMetrics?.awaitingArrangerSignature || 0) > 0 && (
          <div className={cn("mt-3 rounded-xl border p-3 flex items-center justify-between", isDark ? "border-purple-500/30 bg-purple-500/10" : "border-purple-200 bg-purple-50")}>
            <div className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-purple-500" />
              <span className={cn("text-sm", isDark ? "text-gray-300" : "text-slate-700")}>{subPackMetrics?.awaitingArrangerSignature} doc(s) awaiting your signature</span>
            </div>
            <Button variant="link" asChild className="p-0 h-auto text-purple-500 text-sm">
              <Link href="/versotech_main/versosign">Sign Now →</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Network: Partners · Introducers · Commercial Partners ── */}
      <div className={S.card}>
        <p className={S.heading}>Network</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/versotech_main/my-partners" className={cn("group flex items-center gap-4 rounded-xl border p-4 transition-colors", isDark ? "border-white/5 hover:border-pink-500/30 hover:bg-white/5" : "border-slate-200/80 hover:border-pink-300 hover:bg-pink-50/50")}>
            <div className="p-2.5 rounded-xl bg-pink-500/20"><Users className="h-5 w-5 text-pink-500" /></div>
            <div className="flex-1 min-w-0">
              <p className={S.value}>{metrics?.totalPartners || 0}</p>
              <p className={S.helper}>Partners</p>
            </div>
            <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", isDark ? "text-zinc-500" : "text-slate-400")} />
          </Link>
          <Link href="/versotech_main/my-introducers" className={cn("group flex items-center gap-4 rounded-xl border p-4 transition-colors", isDark ? "border-white/5 hover:border-orange-500/30 hover:bg-white/5" : "border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/50")}>
            <div className="p-2.5 rounded-xl bg-orange-500/20"><UserPlus className="h-5 w-5 text-orange-500" /></div>
            <div className="flex-1 min-w-0">
              <p className={S.value}>{metrics?.totalIntroducers || 0}</p>
              <p className={S.helper}>Introducers</p>
            </div>
            <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", isDark ? "text-zinc-500" : "text-slate-400")} />
          </Link>
          <Link href="/versotech_main/my-commercial-partners" className={cn("group flex items-center gap-4 rounded-xl border p-4 transition-colors", isDark ? "border-white/5 hover:border-cyan-500/30 hover:bg-white/5" : "border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/50")}>
            <div className="p-2.5 rounded-xl bg-cyan-500/20"><Building2 className="h-5 w-5 text-cyan-500" /></div>
            <div className="flex-1 min-w-0">
              <p className={S.value}>{metrics?.totalCommercialPartners || 0}</p>
              <p className={S.helper}>Commercial Partners</p>
            </div>
            <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", isDark ? "text-zinc-500" : "text-slate-400")} />
          </Link>
        </div>
      </div>

      {/* ═══════════ Recent Mandates + Pending Agreements ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={S.card}>
          <div className="flex items-center justify-between mb-4">
            <p className={S.heading}>Recent Mandates</p>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/versotech_main/my-mandates">View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
          {recentMandates.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className={cn("h-8 w-8 mx-auto mb-2", isDark ? "text-zinc-500" : "text-slate-400")} />
              <p className={cn("text-sm", isDark ? "text-zinc-300" : "text-slate-500")}>No mandates assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMandates.map((mandate) => (
                <Link
                  key={mandate.id}
                  href="/versotech_main/my-mandates"
                  className={cn("flex items-center justify-between p-3 rounded-xl transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-slate-100")}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm truncate", isDark ? "text-white" : "text-slate-900")}>{mandate.name}</p>
                    <p className={cn("text-xs", isDark ? "text-zinc-300" : "text-slate-500")}>
                      {mandate.target_amount ? `${formatAmountWithCurrency(mandate.target_amount, mandate.currency)} target` : 'No target set'}
                    </p>
                  </div>
                  <Badge className={dealStatusStyles[mandate.status] || 'bg-gray-500/20 text-gray-400'}>{mandate.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={S.card}>
          <div className="flex items-center justify-between mb-4">
            <p className={S.heading}>Pending Agreements</p>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/versotech_main/versosign">View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
          {pendingAgreements.length === 0 ? (
            <div className="text-center py-8">
              <FileSignature className={cn("h-8 w-8 mx-auto mb-2", isDark ? "text-zinc-500" : "text-slate-400")} />
              <p className={cn("text-sm", isDark ? "text-zinc-300" : "text-slate-500")}>All agreements are up to date</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAgreements.map((agreement) => (
                <div key={agreement.id} className={cn("flex items-center justify-between p-3 rounded-xl", isDark ? "bg-white/[0.03]" : "bg-slate-50")}>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm truncate", isDark ? "text-white" : "text-slate-900")}>{agreement.entity_name}</p>
                    <p className={cn("text-xs", isDark ? "text-zinc-300" : "text-slate-500")}>
                      {agreement.entity_type === 'introducer' ? 'Introducer Agreement' : 'Placement Agreement'}
                    </p>
                  </div>
                  <Badge className={agreementStatusStyles[agreement.status] || 'bg-gray-500/20 text-gray-400'}>
                    {agreementStatusLabels[agreement.status] || agreement.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ Quick Actions ═══════════ */}
      <div>
        <p className={S.heading}>Quick Actions</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'View Mandates', href: '/versotech_main/my-mandates', icon: Briefcase },
            { label: 'Subscription Packs', href: '/versotech_main/subscription-packs', icon: Package },
            { label: 'Fee Plans', href: '/versotech_main/fee-plans', icon: Calculator },
            { label: 'Escrow', href: '/versotech_main/escrow', icon: Lock },
            { label: 'My Partners', href: '/versotech_main/my-partners', icon: Users },
            { label: 'My Introducers', href: '/versotech_main/my-introducers', icon: UserPlus },
            { label: 'Payment Requests', href: '/versotech_main/payment-requests', icon: ClipboardList },
            { label: 'VERSOSIGN', href: '/versotech_main/versosign', icon: FileSignature },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors text-center",
                  isDark
                    ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20"
                    : "border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <Icon className={cn("h-5 w-5", isDark ? "text-zinc-300" : "text-slate-500")} />
                <span className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-slate-700")}>{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ═══════════ Detail Dialog ═══════════ */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog(prev => ({ ...prev, open }))}>
        <DialogContent className={cn("max-w-2xl", isDark ? "bg-zinc-900 border-white/10" : "")}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : ""}>{detailDialog.title}</DialogTitle>
          </DialogHeader>
          {detailDialog.loading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
              <p className={cn("text-sm mt-2", isDark ? "text-zinc-300" : "text-slate-500")}>Loading details...</p>
            </div>
          ) : detailDialog.data.length === 0 ? (
            <p className={cn("text-sm text-center py-8", isDark ? "text-zinc-300" : "text-slate-500")}>No data found</p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className={isDark ? "border-white/10" : ""}>
                    {detailDialog.columns.map((col) => (
                      <TableHead key={col} className={cn(col === 'Deal' ? "text-left" : "text-right", isDark ? "text-zinc-300" : "")}>
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailDialog.data.map((row, i) => {
                    const currency = detailDialog.title.split('— ')[1] || 'USD'
                    const isOutstanding = detailDialog.columns.length === 5
                    return (
                      <TableRow key={i} className={isDark ? "border-white/5" : ""}>
                        <TableCell className={cn("font-medium", isDark ? "text-white" : "")}>{row.dealName}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        <TableCell className={cn("text-right tabular-nums font-medium", isDark ? "text-white" : "")}>
                          {formatCurrency(row.amount, currency)}
                        </TableCell>
                        {isOutstanding && (
                          <>
                            <TableCell className="text-right tabular-nums">{formatCurrency(row.extra || 0, currency)}</TableCell>
                            <TableCell className={cn("text-right tabular-nums font-semibold", isDark ? "text-amber-400" : "text-amber-600")}>
                              {formatCurrency(row.extra2 || 0, currency)}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
