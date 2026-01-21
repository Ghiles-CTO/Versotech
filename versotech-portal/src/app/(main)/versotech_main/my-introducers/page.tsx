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
  UserPlus,
  Building2,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mail,
  Handshake,
  Percent,
  FileText,
  PenTool,
  Clock,
  Plus,
  Wallet,
  CreditCard,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { CreateAgreementDialog } from '@/components/staff/introducers/create-agreement-dialog'
import { IntroducerDetailDrawer } from '@/components/introducers/introducer-detail-drawer'
import { CommissionSummary } from '@/components/common/commission-summary'
import type { CommissionSummary as CommissionSummaryType } from '@/components/common/commission-summary'

type ArrangerInfo = {
  id: string
  legal_name: string
  status: string
}

type FeePlan = {
  id: string
  name: string
  is_active: boolean
}

type Introducer = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  status: string
  default_commission_bps: number | null
  commission_cap_amount: number | null
  agreement_expiry_date: string | null
  logo_url: string | null
  deals_count: number
  referrals_count: number
  total_referral_value: number
  fee_plans: FeePlan[]
  commission_summary: CommissionSummaryType
}

type Deal = {
  id: string
  name: string
}

type Summary = {
  totalIntroducers: number
  activeIntroducers: number
  totalReferrals: number
  totalFeesOwed: number
  totalFeesPaid: number
  totalCommissions: number
}

type PendingAgreement = {
  id: string
  introducer_name: string
  introducer_id: string
  agreement_type: string
  created_at: string
  status: string
  signing_url: string | null
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
]

export default function MyIntroducersPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [introducers, setIntroducers] = useState<Introducer[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [pendingAgreements, setPendingAgreements] = useState<PendingAgreement[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIntroducers: 0,
    activeIntroducers: 0,
    totalReferrals: 0,
    totalFeesOwed: 0,
    totalFeesPaid: 0,
    totalCommissions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dealFilter, setDealFilter] = useState('all')
  const [createAgreementOpen, setCreateAgreementOpen] = useState(false)
  const [selectedIntroducerForAgreement, setSelectedIntroducerForAgreement] = useState<Introducer | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedIntroducerId, setSelectedIntroducerId] = useState<string | null>(null)

  const fetchData = async () => {
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
        await fetchAllIntroducers(supabase)
        return
      }

      const { data: arranger, error: arrangerError } = await supabase
        .from('arranger_entities')
        .select('id, legal_name, status')
        .eq('id', arrangerUser.arranger_id)
        .single()

      if (arrangerError) throw arrangerError
      setArrangerInfo(arranger)

      // Fetch pending introducer agreements for this arranger
      const { data: pendingAgreementsData } = await supabase
        .from('introducer_agreements')
        .select(`
          id,
          agreement_type,
          status,
          created_at,
          arranger_signature_request_id,
          introducer:introducer_id (id, legal_name)
        `)
        .eq('arranger_id', arrangerUser.arranger_id)
        .in('status', ['approved', 'pending_arranger_signature'])
        .order('created_at', { ascending: false })

      const pendingList: PendingAgreement[] = []
      for (const agreement of pendingAgreementsData || []) {
        const introducer = Array.isArray(agreement.introducer) ? agreement.introducer[0] : agreement.introducer
        let signingUrl = null

        if (agreement.arranger_signature_request_id) {
          const { data: sigReq } = await supabase
            .from('signature_requests')
            .select('signing_token, status, token_expires_at')
            .eq('id', agreement.arranger_signature_request_id)
            .eq('status', 'pending')
            .single()

          if (sigReq && new Date(sigReq.token_expires_at) > new Date()) {
            signingUrl = `/versotech_main/versosign/sign/${sigReq.signing_token}`
          }
        }

        pendingList.push({
          id: agreement.id,
          introducer_name: introducer?.legal_name || 'Unknown Introducer',
          introducer_id: introducer?.id || '',
          agreement_type: agreement.agreement_type,
          created_at: agreement.created_at,
          status: agreement.status,
          signing_url: signingUrl,
        })
      }
      setPendingAgreements(pendingList)

      // Fetch arranger's deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id, name')
        .eq('arranger_entity_id', arrangerUser.arranger_id)

      if (dealsError) throw dealsError

      setDeals(dealsData || [])

      if (!dealsData || dealsData.length === 0) {
        setIntroducers([])
        setSummary({ totalIntroducers: 0, activeIntroducers: 0, totalReferrals: 0, totalFeesOwed: 0, totalFeesPaid: 0, totalCommissions: 0 })
        return
      }

      const dealIds = dealsData.map(d => d.id)

      // Fetch referrals from all deals
      const { data: referrals, error: refError } = await supabase
        .from('deal_memberships')
        .select(`referred_by_entity_id, investor_id, deal_id`)
        .in('deal_id', dealIds)
        .eq('referred_by_entity_type', 'introducer')
        .not('referred_by_entity_id', 'is', null)

      if (refError) throw refError

      const introducerIds = [...new Set((referrals || []).map(r => r.referred_by_entity_id))]

      if (introducerIds.length === 0) {
        setIntroducers([])
        setSummary({ totalIntroducers: 0, activeIntroducers: 0, totalReferrals: 0, totalFeesOwed: 0, totalFeesPaid: 0, totalCommissions: 0 })
        return
      }

      // Fetch introducer data
      const { data: introducersData, error: introducersError } = await supabase
        .from('introducers')
        .select('*')
        .in('id', introducerIds)
        .order('legal_name')

      if (introducersError) throw introducersError

      // Fetch fee plans for each introducer
      const { data: feePlansData } = await supabase
        .from('fee_plans')
        .select('id, name, is_active, introducer_id')
        .eq('created_by_arranger_id', arrangerUser.arranger_id)
        .in('introducer_id', introducerIds)

      // Group fee plans by introducer
      const feePlansByIntroducer = new Map<string, FeePlan[]>()
      ;(feePlansData || []).forEach((fp: any) => {
        const existing = feePlansByIntroducer.get(fp.introducer_id) || []
        existing.push({ id: fp.id, name: fp.name, is_active: fp.is_active })
        feePlansByIntroducer.set(fp.introducer_id, existing)
      })

      // Fetch commissions for each introducer
      const { data: commissionsData } = await supabase
        .from('introducer_commissions')
        .select('introducer_id, status, accrual_amount, currency')
        .eq('arranger_id', arrangerUser.arranger_id)
        .in('introducer_id', introducerIds)

      // Group commissions by introducer
      const commissionsByIntroducer = new Map<string, CommissionSummaryType>()
      introducerIds.forEach(id => {
        commissionsByIntroducer.set(id, {
          accrued: 0,
          invoice_requested: 0,
          invoice_submitted: 0,
          invoiced: 0,
          paid: 0,
          cancelled: 0,
          total_owed: 0,
          currency: 'USD',
        })
      })

      ;(commissionsData || []).forEach((c: any) => {
        const summary = commissionsByIntroducer.get(c.introducer_id)
        if (summary) {
          const amount = Number(c.accrual_amount) || 0
          if (c.status === 'accrued') summary.accrued += amount
          else if (c.status === 'invoice_requested') summary.invoice_requested += amount
          else if (c.status === 'invoice_submitted') summary.invoice_submitted = (summary.invoice_submitted || 0) + amount
          else if (c.status === 'invoiced') summary.invoiced += amount
          else if (c.status === 'paid') summary.paid += amount
          else if (c.status === 'cancelled') summary.cancelled += amount
          if (c.currency) summary.currency = c.currency
        }
      })

      // Calculate total_owed for each
      commissionsByIntroducer.forEach((summary) => {
        summary.total_owed = summary.accrued + summary.invoice_requested + (summary.invoice_submitted || 0) + summary.invoiced
      })

      // Get subscription values for referral value calculation
      const investorIds = [...new Set((referrals || []).filter(r => r.investor_id).map(r => r.investor_id))]
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('investor_id, commitment')
        .in('investor_id', investorIds)

      const subsByInvestor = new Map<string, number>()
      ;(subs || []).forEach((s: any) => {
        const current = subsByInvestor.get(s.investor_id) || 0
        subsByInvestor.set(s.investor_id, current + (Number(s.commitment) || 0))
      })

      // Build introducer objects
      const processedIntroducers: Introducer[] = (introducersData || []).map((i: any) => {
        const introRefs = (referrals || []).filter(r => r.referred_by_entity_id === i.id)
        const dealsInvolved = [...new Set(introRefs.map(r => r.deal_id).filter(Boolean))]
        const totalValue = introRefs.reduce((sum, r) => {
          if (r.investor_id) return sum + (subsByInvestor.get(r.investor_id) || 0)
          return sum
        }, 0)

        const commissionSummary = commissionsByIntroducer.get(i.id) || {
          accrued: 0,
          invoice_requested: 0,
          invoice_submitted: 0,
          invoiced: 0,
          paid: 0,
          cancelled: 0,
          total_owed: 0,
          currency: 'USD',
        }

        return {
          id: i.id,
          legal_name: i.legal_name || 'Unknown Introducer',
          contact_name: i.contact_name,
          email: i.email,
          status: i.status || 'active',
          default_commission_bps: i.default_commission_bps,
          commission_cap_amount: i.commission_cap_amount ? Number(i.commission_cap_amount) : null,
          agreement_expiry_date: i.agreement_expiry_date,
          logo_url: i.logo_url,
          deals_count: dealsInvolved.length,
          referrals_count: introRefs.length,
          total_referral_value: totalValue,
          fee_plans: feePlansByIntroducer.get(i.id) || [],
          commission_summary: commissionSummary,
        }
      })

      setIntroducers(processedIntroducers)

      // Calculate overall summary
      let totalFeesOwed = 0
      let totalFeesPaid = 0
      processedIntroducers.forEach(i => {
        totalFeesOwed += i.commission_summary.total_owed
        totalFeesPaid += i.commission_summary.paid
      })

      setSummary({
        totalIntroducers: processedIntroducers.length,
        activeIntroducers: processedIntroducers.filter(i => i.status === 'active').length,
        totalReferrals: processedIntroducers.reduce((sum, i) => sum + i.referrals_count, 0),
        totalFeesOwed,
        totalFeesPaid,
        totalCommissions: totalFeesOwed + totalFeesPaid,
      })
      setError(null)
    } catch (err) {
      console.error('[MyIntroducersPage] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load introducers')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAllIntroducers(supabase: any) {
    const { data: introducersData, error: introducersError } = await supabase
      .from('introducers')
      .select('*')
      .order('legal_name')
      .limit(100)

    if (introducersError) throw introducersError

    const processedIntroducers: Introducer[] = (introducersData || []).map((i: any) => ({
      id: i.id,
      legal_name: i.legal_name || 'Unknown Introducer',
      contact_name: i.contact_name,
      email: i.email,
      status: i.status || 'active',
      default_commission_bps: i.default_commission_bps,
      commission_cap_amount: i.commission_cap_amount ? Number(i.commission_cap_amount) : null,
      agreement_expiry_date: i.agreement_expiry_date,
      logo_url: i.logo_url,
      deals_count: 0,
      referrals_count: 0,
      total_referral_value: 0,
      fee_plans: [],
      commission_summary: {
        accrued: 0,
        invoice_requested: 0,
        invoiced: 0,
        paid: 0,
        cancelled: 0,
        total_owed: 0,
        currency: 'USD',
      },
    }))

    setIntroducers(processedIntroducers)
    setSummary({
      totalIntroducers: processedIntroducers.length,
      activeIntroducers: processedIntroducers.filter(i => i.status === 'active').length,
      totalReferrals: 0,
      totalFeesOwed: 0,
      totalFeesPaid: 0,
      totalCommissions: 0,
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter introducers by deal (check if they have referrals on selected deal)
  const filteredIntroducers = introducers.filter(introducer => {
    const matchesStatus = statusFilter === 'all' || introducer.status === statusFilter
    const matchesSearch = !search ||
      introducer.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      introducer.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      introducer.email?.toLowerCase().includes(search.toLowerCase())
    // For deal filter, we'd need deal-specific referral data - for now show all if dealFilter is set
    const matchesDeal = dealFilter === 'all' || true
    return matchesStatus && matchesSearch && matchesDeal
  })

  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const handleRowClick = (introducerId: string) => {
    setSelectedIntroducerId(introducerId)
    setDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading introducers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Introducers</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Introducers</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo ? `Introducers working with ${arrangerInfo.legal_name}` : 'View all registered introducers'}
          </p>
        </div>
      </div>

      {/* Pending Agreements Section */}
      {pendingAgreements.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Agreements Awaiting Your Signature ({pendingAgreements.length})
            </CardTitle>
            <CardDescription>
              Review and sign these introducer agreements to activate them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAgreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-medium">{agreement.introducer_name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {agreement.agreement_type.replace(/_/g, ' ')} • Created {formatDate(agreement.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agreement.signing_url ? (
                      <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600">
                        <Link href={agreement.signing_url}>
                          <PenTool className="h-4 w-4 mr-1" />
                          Sign Now
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/introducer-agreements/${agreement.id}/sign`, {
                              method: 'POST'
                            })
                            if (res.ok) {
                              const data = await res.json()
                              if (data.signing_url) {
                                window.location.href = data.signing_url
                              }
                            }
                          } catch (err) {
                            console.error('Failed to initiate signing:', err)
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <PenTool className="h-4 w-4 mr-1" />
                        Initiate Signing
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/versotech_main/introducer-agreements/${agreement.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards - 6 cards like My Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />Total Introducers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalIntroducers}</div>
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
            <div className="text-2xl font-bold text-green-600">{summary.activeIntroducers}</div>
            <p className="text-xs text-muted-foreground mt-1">With valid agreements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Handshake className="h-4 w-4" />Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">Investors introduced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalCommissions, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />Fees Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalFeesOwed, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />Fees Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalFeesPaid, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search introducers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {deals.length > 0 && (
              <Select value={dealFilter} onValueChange={setDealFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by deal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Introducers</CardTitle>
          <CardDescription>{filteredIntroducers.length} introducer{filteredIntroducers.length !== 1 ? 's' : ''} found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIntroducers.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{search || statusFilter !== 'all' ? 'No introducers match your filters' : 'No introducers in your network yet'}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Introducer</TableHead>
                    <TableHead>Rate / Fee Plans</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Commission Status</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntroducers.map((introducer) => {
                    const isExpiringSoon = introducer.agreement_expiry_date && new Date(introducer.agreement_expiry_date) <= thirtyDaysFromNow && new Date(introducer.agreement_expiry_date) > today
                    const isExpired = introducer.agreement_expiry_date && new Date(introducer.agreement_expiry_date) <= today
                    return (
                      <TableRow
                        key={introducer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(introducer.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {introducer.logo_url ? (
                              <img src={introducer.logo_url} alt={introducer.legal_name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
                            )}
                            <div>
                              <div className="font-medium">{introducer.legal_name}</div>
                              {introducer.email && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{introducer.email}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            {introducer.default_commission_bps ? (
                              <div className="font-medium flex items-center gap-1"><Percent className="h-3 w-3" />{(introducer.default_commission_bps / 100).toFixed(2)}%</div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No default rate</span>
                            )}
                            {introducer.fee_plans.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {introducer.fee_plans.slice(0, 2).map((fp) => (
                                  <Badge key={fp.id} variant={fp.is_active ? 'default' : 'secondary'} className="text-xs">
                                    {fp.name}
                                  </Badge>
                                ))}
                                {introducer.fee_plans.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{introducer.fee_plans.length - 2}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{introducer.referrals_count} referrals</div>
                            <div className="text-xs text-muted-foreground">{introducer.deals_count} deal{introducer.deals_count !== 1 ? 's' : ''}</div>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <CommissionSummary summary={introducer.commission_summary} variant="inline" />
                        </TableCell>
                        <TableCell>
                          {introducer.agreement_expiry_date ? (
                            <div className={cn("text-sm", isExpired && "text-red-600", isExpiringSoon && "text-yellow-600")}>
                              <div className="flex items-center gap-1"><FileText className="h-3 w-3" />{formatDate(introducer.agreement_expiry_date)}</div>
                              {isExpired && <Badge variant="destructive" className="text-xs mt-1">Expired</Badge>}
                              {isExpiringSoon && <Badge variant="outline" className="text-xs mt-1 bg-yellow-100">Expiring Soon</Badge>}
                            </div>
                          ) : <span className="text-muted-foreground text-xs">No agreement</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[introducer.status] || STATUS_STYLES.active)}>{introducer.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {arrangerInfo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedIntroducerForAgreement(introducer)
                                  setCreateAgreementOpen(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agreement
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(introducer.id)
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Create Agreement Dialog */}
      {selectedIntroducerForAgreement && (
        <CreateAgreementDialog
          open={createAgreementOpen}
          onOpenChange={(open) => {
            setCreateAgreementOpen(open)
            if (!open) setSelectedIntroducerForAgreement(null)
          }}
          introducerId={selectedIntroducerForAgreement.id}
          introducerName={selectedIntroducerForAgreement.legal_name}
          defaultCommissionBps={selectedIntroducerForAgreement.default_commission_bps || 100}
        />
      )}

      {/* Introducer Detail Drawer */}
      <IntroducerDetailDrawer
        introducerId={selectedIntroducerId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
