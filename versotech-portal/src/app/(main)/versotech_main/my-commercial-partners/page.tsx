'use client'

import { useEffect, useState } from 'react'
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
  Building2,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  Globe,
  Users,
  FileText,
  DollarSign,
  Handshake,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { addCurrencyAmount, type CurrencyTotals, formatCurrencyTotals, mergeCurrencyTotals, sumByCurrency } from '@/lib/currency-totals'
import Link from 'next/link'
import { CommercialPartnerDetailDrawer } from '@/components/commercial-partners/commercial-partner-detail-drawer'
import {
  PartnerCommissionSummary,
  type CommissionSummary,
} from '@/components/partners/partner-commission-summary'

type ArrangerInfo = {
  id: string
  legal_name: string
  status: string
}

type Deal = {
  id: string
  name: string
  company_name: string | null
}

type FeePlan = {
  id: string
  name: string
  is_active: boolean
}

type CommercialPartner = {
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
  deals_count: number
  clients_count: number
  total_placement_value: number
  total_placement_value_by_currency: CurrencyTotals
  fee_plans: FeePlan[]
  commission_summary: CommissionSummary
  deal_ids: string[] // Added for deal filtering
}

type Summary = {
  totalCPs: number
  activeCPs: number
  totalClients: number
  totalPlacementValue: number
  totalPlacementValueByCurrency: CurrencyTotals
  totalOwed: number
  totalOwedByCurrency: CurrencyTotals
  totalPaid: number
  totalPaidByCurrency: CurrencyTotals
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
  pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  suspended: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
}

const KYC_STYLES: Record<string, string> = {
  approved: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
  pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  expired: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
  not_started: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
]

export default function MyCommercialPartnersPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [arrangerId, setArrangerId] = useState<string | null>(null)
  const [commercialPartners, setCommercialPartners] = useState<CommercialPartner[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalCPs: 0,
    activeCPs: 0,
    totalClients: 0,
    totalPlacementValue: 0,
    totalPlacementValueByCurrency: {},
    totalOwed: 0,
    totalOwedByCurrency: {},
    totalPaid: 0,
    totalPaidByCurrency: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dealFilter, setDealFilter] = useState('all')

  // Detail drawer state
  const [selectedCPId, setSelectedCPId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleCPClick = (cpId: string) => {
    setSelectedCPId(cpId)
    setDrawerOpen(true)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not authenticated')
          return
        }

        const { data: arrangerUser, error: arrangerUserError } = await supabase
          .from('arranger_users')
          .select('arranger_id')
          .eq('user_id', user.id)
          .single()

        if (arrangerUserError || !arrangerUser) {
          await fetchAllCommercialPartners(supabase)
          return
        }

        setArrangerId(arrangerUser.arranger_id)

        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        // Get deals for this arranger (for filter dropdown)
        const { data: arrangerDeals, error: dealsError } = await supabase
          .from('deals')
          .select('id, name, company_name')
          .eq('arranger_entity_id', arrangerUser.arranger_id)
          .order('name')

        if (dealsError) throw dealsError
        setDeals(arrangerDeals || [])

        if (!arrangerDeals || arrangerDeals.length === 0) {
          setCommercialPartners([])
          setSummary({
            totalCPs: 0,
            activeCPs: 0,
            totalClients: 0,
            totalPlacementValue: 0,
            totalPlacementValueByCurrency: {},
            totalOwed: 0,
            totalOwedByCurrency: {},
            totalPaid: 0,
            totalPaidByCurrency: {},
          })
          return
        }

        const dealIds = arrangerDeals.map(d => d.id)

        const { data: referrals, error: refError } = await supabase
          .from('deal_memberships')
          .select(`referred_by_entity_id, investor_id, deal_id, deal:deal_id (id, name)`)
          .in('deal_id', dealIds)
          .eq('referred_by_entity_type', 'commercial_partner')
          .not('referred_by_entity_id', 'is', null)

        if (refError) throw refError

        const cpIds = [...new Set((referrals || []).map(r => r.referred_by_entity_id))]

        if (cpIds.length === 0) {
          setCommercialPartners([])
          setSummary({
            totalCPs: 0,
            activeCPs: 0,
            totalClients: 0,
            totalPlacementValue: 0,
            totalPlacementValueByCurrency: {},
            totalOwed: 0,
            totalOwedByCurrency: {},
            totalPaid: 0,
            totalPaidByCurrency: {},
          })
          return
        }

        const { data: cpsData, error: cpsError } = await supabase
          .from('commercial_partners')
          .select('*')
          .in('id', cpIds)
          .order('name')

        if (cpsError) throw cpsError

        // Get client counts
        const { data: clients } = await supabase
          .from('commercial_partner_clients')
          .select('commercial_partner_id')
          .in('commercial_partner_id', cpIds)

        const clientCountsByCP = new Map<string, number>()
        ;(clients || []).forEach((c: any) => {
          const current = clientCountsByCP.get(c.commercial_partner_id) || 0
          clientCountsByCP.set(c.commercial_partner_id, current + 1)
        })

        const investorIds = [...new Set((referrals || []).filter(r => r.investor_id).map(r => r.investor_id))]
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('investor_id, commitment, currency')
          .in('investor_id', investorIds)

        const subsByInvestor = new Map<string, CurrencyTotals>()
        ;(subs || []).forEach((s: any) => {
          const current = subsByInvestor.get(s.investor_id) || {}
          addCurrencyAmount(current, s.commitment, s.currency)
          subsByInvestor.set(s.investor_id, current)
        })

        // Get fee plans for these CPs (created by this arranger)
        const { data: feePlans } = await supabase
          .from('fee_plans')
          .select('id, name, is_active, commercial_partner_id')
          .in('commercial_partner_id', cpIds)
          .eq('created_by_arranger_id', arrangerUser.arranger_id)

        const feePlansByCP = new Map<string, FeePlan[]>()
        ;(feePlans || []).forEach((fp: any) => {
          const existing = feePlansByCP.get(fp.commercial_partner_id) || []
          existing.push({ id: fp.id, name: fp.name, is_active: fp.is_active })
          feePlansByCP.set(fp.commercial_partner_id, existing)
        })

        // Get commissions for these CPs
        const { data: commissions } = await supabase
          .from('commercial_partner_commissions')
          .select('commercial_partner_id, status, accrual_amount, currency')
          .in('commercial_partner_id', cpIds)
          .eq('arranger_id', arrangerUser.arranger_id)

        // Build commission summaries by CP
        const commissionsByCP = new Map<string, CommissionSummary>()
        cpIds.forEach(cpId => {
          commissionsByCP.set(cpId, {
            accrued: 0,
            invoice_requested: 0,
            invoiced: 0,
            paid: 0,
            cancelled: 0,
            total_owed: 0,
            currency: '',
          })
        })

        ;(commissions || []).forEach((c: any) => {
          const summary = commissionsByCP.get(c.commercial_partner_id)
          if (!summary) return
          const amount = Number(c.accrual_amount) || 0
          if (c.status === 'accrued') summary.accrued += amount
          else if (c.status === 'invoice_requested') summary.invoice_requested += amount
          else if (c.status === 'invoiced') summary.invoiced += amount
          else if (c.status === 'paid') summary.paid += amount
          else if (c.status === 'cancelled') summary.cancelled += amount
          if (['accrued', 'invoice_requested', 'invoiced'].includes(c.status)) {
            summary.total_owed += amount
          }
          if (c.currency) summary.currency = String(c.currency).toUpperCase()
        })

        const processedCPs: CommercialPartner[] = (cpsData || []).map((cp: any) => {
          const cpRefs = (referrals || []).filter(r => r.referred_by_entity_id === cp.id)
          const dealsInvolved = [...new Set(cpRefs.map(r => {
            const deal = Array.isArray(r.deal) ? r.deal[0] : r.deal
            return deal?.id
          }).filter(Boolean))]
          const totalPlacementValueByCurrency = cpRefs.reduce<CurrencyTotals>((totals, referral) => {
            if (!referral.investor_id) return totals
            return mergeCurrencyTotals(totals, subsByInvestor.get(referral.investor_id) || {})
          }, {})
          const totalValue = Object.values(totalPlacementValueByCurrency).reduce((sum, value) => sum + value, 0)

          return {
            id: cp.id,
            name: cp.name || cp.legal_name || 'Unknown CP',
            legal_name: cp.legal_name,
            cp_type: cp.cp_type,
            status: cp.status || 'active',
            regulatory_status: cp.regulatory_status,
            jurisdiction: cp.jurisdiction,
            contact_name: cp.contact_name,
            contact_email: cp.contact_email,
            contact_phone: cp.contact_phone,
            country: cp.country,
            logo_url: cp.logo_url,
            kyc_status: cp.kyc_status,
            contract_end_date: cp.contract_end_date,
            deals_count: dealsInvolved.length,
            clients_count: clientCountsByCP.get(cp.id) || 0,
            total_placement_value: totalValue,
            total_placement_value_by_currency: totalPlacementValueByCurrency,
            fee_plans: feePlansByCP.get(cp.id) || [],
            commission_summary: commissionsByCP.get(cp.id) || {
              accrued: 0,
              invoice_requested: 0,
              invoiced: 0,
              paid: 0,
              cancelled: 0,
              total_owed: 0,
              currency: '',
            },
            deal_ids: dealsInvolved as string[],
          }
        })

        setCommercialPartners(processedCPs)

        const active = processedCPs.filter(cp => cp.status === 'active').length
        const totalClients = processedCPs.reduce((sum, cp) => sum + cp.clients_count, 0)
        const totalVal = processedCPs.reduce((sum, cp) => sum + cp.total_placement_value, 0)
        const totalOwed = processedCPs.reduce((sum, cp) => sum + cp.commission_summary.total_owed, 0)
        const totalPaid = processedCPs.reduce((sum, cp) => sum + cp.commission_summary.paid, 0)
        const totalPlacementValueByCurrency = processedCPs.reduce<CurrencyTotals>((totals, cp) => {
          return mergeCurrencyTotals(totals, cp.total_placement_value_by_currency)
        }, {})
        const totalOwedByCurrency = sumByCurrency(
          (commissions || []).filter((commission: any) => ['accrued', 'invoice_requested', 'invoiced'].includes(commission.status)),
          (commission: any) => commission.accrual_amount,
          (commission: any) => commission.currency
        )
        const totalPaidByCurrency = sumByCurrency(
          (commissions || []).filter((commission: any) => commission.status === 'paid'),
          (commission: any) => commission.accrual_amount,
          (commission: any) => commission.currency
        )

        setSummary({
          totalCPs: processedCPs.length,
          activeCPs: active,
          totalClients,
          totalPlacementValue: totalVal,
          totalPlacementValueByCurrency,
          totalOwed,
          totalOwedByCurrency,
          totalPaid,
          totalPaidByCurrency,
        })
        setError(null)
      } catch (err) {
        console.error('[MyCommercialPartnersPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load commercial partners')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllCommercialPartners(supabase: any) {
      const { data: cpsData, error: cpsError } = await supabase
        .from('commercial_partners')
        .select('*')
        .order('name')
        .limit(100)

      if (cpsError) throw cpsError

      const emptyCommission: CommissionSummary = {
        accrued: 0,
        invoice_requested: 0,
        invoiced: 0,
        paid: 0,
        cancelled: 0,
        total_owed: 0,
        currency: '',
      }

      const processedCPs: CommercialPartner[] = (cpsData || []).map((cp: any) => ({
        id: cp.id,
        name: cp.name || cp.legal_name || 'Unknown CP',
        legal_name: cp.legal_name,
        cp_type: cp.cp_type,
        status: cp.status || 'active',
        regulatory_status: cp.regulatory_status,
        jurisdiction: cp.jurisdiction,
        contact_name: cp.contact_name,
        contact_email: cp.contact_email,
        contact_phone: cp.contact_phone,
        country: cp.country,
        logo_url: cp.logo_url,
        kyc_status: cp.kyc_status,
        contract_end_date: cp.contract_end_date,
        deals_count: 0,
        clients_count: 0,
        total_placement_value: 0,
        total_placement_value_by_currency: {},
        fee_plans: [],
        commission_summary: emptyCommission,
        deal_ids: [],
      }))

      setCommercialPartners(processedCPs)
      setSummary({
        totalCPs: processedCPs.length,
        activeCPs: processedCPs.filter(cp => cp.status === 'active').length,
        totalClients: 0,
        totalPlacementValue: 0,
        totalPlacementValueByCurrency: {},
        totalOwed: 0,
        totalOwedByCurrency: {},
        totalPaid: 0,
        totalPaidByCurrency: {},
      })
    }

    fetchData()
  }, [])

  const filteredCPs = commercialPartners.filter(cp => {
    const matchesStatus = statusFilter === 'all' || cp.status === statusFilter
    const matchesSearch = !search ||
      cp.name?.toLowerCase().includes(search.toLowerCase()) ||
      cp.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      cp.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      cp.jurisdiction?.toLowerCase().includes(search.toLowerCase())
    const matchesDeal = dealFilter === 'all' || cp.deal_ids.includes(dealFilter)
    return matchesStatus && matchesSearch && matchesDeal
  })

  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading commercial partners...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Commercial Partners</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Commercial Partners</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo ? `Commercial partners working with ${arrangerInfo.legal_name}` : 'View all commercial partners'}
          </p>
        </div>
        <Link href="/versotech_main/fee-plans">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Fee Plans
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />Total CPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCPs}</div>
            <p className="text-xs text-muted-foreground mt-1">In your network</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.activeCPs}</div>
            <p className="text-xs text-muted-foreground mt-1">With valid contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Total clients served</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Handshake className="h-4 w-4" />Placement Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrencyTotals(summary.totalPlacementValueByCurrency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />Fees Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrencyTotals(summary.totalOwedByCurrency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />Fees Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrencyTotals(summary.totalPaidByCurrency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search commercial partners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {deals.length > 0 && (
              <Select value={dealFilter} onValueChange={setDealFilter}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Filter by deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commercial Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commercial Partners</CardTitle>
          <CardDescription>
            {filteredCPs.length} partner{filteredCPs.length !== 1 ? 's' : ''} found
            {arrangerInfo && ' • Click a row to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCPs.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{search || statusFilter !== 'all' ? 'No partners match your filters' : 'No commercial partners in your network yet'}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Fee Plans</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCPs.map((cp) => {
                    const isExpiringSoon = cp.contract_end_date && new Date(cp.contract_end_date) <= thirtyDaysFromNow && new Date(cp.contract_end_date) > today
                    const isExpired = cp.contract_end_date && new Date(cp.contract_end_date) <= today
                    return (
                      <TableRow
                        key={cp.id}
                        className={cn(arrangerInfo && 'cursor-pointer hover:bg-muted/50 transition-colors')}
                        onClick={() => arrangerInfo && handleCPClick(cp.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {cp.logo_url ? (
                              <img src={cp.logo_url} alt={cp.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
                            )}
                            <div>
                              <div className="font-medium">{cp.name}</div>
                              {cp.contact_email && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{cp.contact_email}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cp.cp_type ? <Badge variant="secondary" className="capitalize">{cp.cp_type.replace('_', ' ')}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          {cp.jurisdiction ? (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{cp.jurisdiction}</span>
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          {cp.fee_plans.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {cp.fee_plans.slice(0, 2).map((fp) => (
                                <Badge
                                  key={fp.id}
                                  variant={fp.is_active ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {fp.name}
                                </Badge>
                              ))}
                              {cp.fee_plans.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{cp.fee_plans.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No fee plans</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrencyTotals(cp.total_placement_value_by_currency)}</div>
                            <div className="text-xs text-muted-foreground">{cp.deals_count} deal{cp.deals_count !== 1 ? 's' : ''} • {cp.clients_count} client{cp.clients_count !== 1 ? 's' : ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PartnerCommissionSummary
                            summary={cp.commission_summary}
                            variant="inline"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[cp.status] || STATUS_STYLES.active)}>{cp.status}</Badge>
                            {cp.kyc_status && <div><Badge variant="secondary" className={cn('text-xs', KYC_STYLES[cp.kyc_status] || '')}>KYC: {cp.kyc_status.replace('_', ' ')}</Badge></div>}
                            {isExpired && <Badge variant="destructive" className="text-xs">Contract Expired</Badge>}
                            {isExpiringSoon && !isExpired && <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">Expiring Soon</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {arrangerInfo && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <CommercialPartnerDetailDrawer
        commercialPartnerId={selectedCPId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
