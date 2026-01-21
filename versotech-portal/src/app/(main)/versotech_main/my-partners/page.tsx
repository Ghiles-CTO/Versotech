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
  Users,
  Building2,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  Globe,
  Mail,
  Handshake,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PartnerDetailDrawer } from '@/components/partners/partner-detail-drawer'
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

type Partner = {
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
  deals_count: number
  referrals_count: number
  total_referral_value: number
  last_activity: string | null
  fee_plans: FeePlan[]
  commission_summary: CommissionSummary
}

type Summary = {
  totalPartners: number
  activePartners: number
  totalReferrals: number
  totalReferralValue: number
  totalOwed: number
  totalPaid: number
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

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
]

export default function MyPartnersPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [arrangerId, setArrangerId] = useState<string | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalPartners: 0,
    activePartners: 0,
    totalReferrals: 0,
    totalReferralValue: 0,
    totalOwed: 0,
    totalPaid: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dealFilter, setDealFilter] = useState('all')

  // Detail drawer state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartnerId(partnerId)
    setDrawerOpen(true)
  }

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
          .single()

        if (arrangerUserError || !arrangerUser) {
          // Staff view - show all partners
          await fetchAllPartners(supabase)
          return
        }

        setArrangerId(arrangerUser.arranger_id)

        // Fetch arranger info
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
          setPartners([])
          setSummary({
            totalPartners: 0,
            activePartners: 0,
            totalReferrals: 0,
            totalReferralValue: 0,
            totalOwed: 0,
            totalPaid: 0,
          })
          return
        }

        const dealIds = arrangerDeals.map(d => d.id)

        // CORRECT APPROACH: Get partners via fee_plans (partner assignment to deals)
        // Partners are linked to deals when CEO dispatches with a fee model
        const { data: feePlansWithPartners, error: fpError } = await supabase
          .from('fee_plans')
          .select(`
            id,
            name,
            is_active,
            partner_id,
            deal_id,
            created_at,
            deal:deals(id, name, currency, created_at)
          `)
          .in('deal_id', dealIds)
          .not('partner_id', 'is', null)

        if (fpError) throw fpError

        // Get unique partner IDs from fee_plans
        const partnerIds = [...new Set((feePlansWithPartners || []).map(fp => fp.partner_id).filter(Boolean))]

        if (partnerIds.length === 0) {
          setPartners([])
          setSummary({
            totalPartners: 0,
            activePartners: 0,
            totalReferrals: 0,
            totalReferralValue: 0,
            totalOwed: 0,
            totalPaid: 0,
          })
          return
        }

        // Fetch partner details
        const { data: partnersData, error: partnersError } = await supabase
          .from('partners')
          .select('*')
          .in('id', partnerIds)
          .order('name')

        if (partnersError) throw partnersError

        // Build fee plans by partner
        const feePlansByPartner = new Map<string, FeePlan[]>()
        const dealsByPartner = new Map<string, Set<string>>()
        ;(feePlansWithPartners || []).forEach((fp: any) => {
          if (!fp.partner_id) return
          const existing = feePlansByPartner.get(fp.partner_id) || []
          existing.push({ id: fp.id, name: fp.name, is_active: fp.is_active })
          feePlansByPartner.set(fp.partner_id, existing)

          // Track which deals this partner is assigned to
          const dealSet = dealsByPartner.get(fp.partner_id) || new Set()
          if (fp.deal_id) dealSet.add(fp.deal_id)
          dealsByPartner.set(fp.partner_id, dealSet)
        })

        // Get commissions for these partners
        const { data: commissions } = await supabase
          .from('partner_commissions')
          .select('partner_id, status, accrual_amount, currency')
          .in('partner_id', partnerIds)
          .eq('arranger_id', arrangerUser.arranger_id)

        // Build commission summaries by partner
        const commissionsByPartner = new Map<string, CommissionSummary>()
        partnerIds.forEach(pid => {
          commissionsByPartner.set(pid, {
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

        ;(commissions || []).forEach((c: any) => {
          const summary = commissionsByPartner.get(c.partner_id)
          if (!summary) return
          const amount = Number(c.accrual_amount) || 0
          if (c.status === 'accrued') summary.accrued += amount
          else if (c.status === 'invoice_requested') summary.invoice_requested += amount
          else if (c.status === 'invoice_submitted') summary.invoice_submitted = (summary.invoice_submitted || 0) + amount
          else if (c.status === 'invoiced') summary.invoiced += amount
          else if (c.status === 'paid') summary.paid += amount
          else if (c.status === 'cancelled') summary.cancelled += amount
          if (['accrued', 'invoice_requested', 'invoice_submitted', 'invoiced'].includes(c.status)) {
            summary.total_owed += amount
          }
          if (c.currency) summary.currency = c.currency
        })

        // Process partners with stats
        const processedPartners: Partner[] = (partnersData || []).map((p: any) => {
          const partnerFeePlans = feePlansByPartner.get(p.id) || []
          const partnerDealIds = dealsByPartner.get(p.id) || new Set()

          return {
            id: p.id,
            name: p.name || p.legal_name || 'Unknown Partner',
            legal_name: p.legal_name,
            partner_type: p.partner_type,
            status: p.status || 'active',
            contact_name: p.contact_name,
            contact_email: p.contact_email,
            contact_phone: p.contact_phone,
            country: p.country,
            logo_url: p.logo_url,
            kyc_status: p.kyc_status,
            deals_count: partnerDealIds.size,
            referrals_count: 0, // Will be populated if we track referrals separately
            total_referral_value: 0, // Will be populated if we track referrals separately
            last_activity: null,
            fee_plans: partnerFeePlans,
            commission_summary: commissionsByPartner.get(p.id) || {
              accrued: 0,
              invoice_requested: 0,
              invoice_submitted: 0,
              invoiced: 0,
              paid: 0,
              cancelled: 0,
              total_owed: 0,
              currency: 'USD',
            },
          }
        })

        setPartners(processedPartners)

        const active = processedPartners.filter(p => p.status === 'active').length
        const totalRefs = processedPartners.reduce((sum, p) => sum + p.referrals_count, 0)
        const totalVal = processedPartners.reduce((sum, p) => sum + p.total_referral_value, 0)
        const totalOwed = processedPartners.reduce((sum, p) => sum + p.commission_summary.total_owed, 0)
        const totalPaid = processedPartners.reduce((sum, p) => sum + p.commission_summary.paid, 0)

        setSummary({
          totalPartners: processedPartners.length,
          activePartners: active,
          totalReferrals: totalRefs,
          totalReferralValue: totalVal,
          totalOwed,
          totalPaid,
        })

        setError(null)
      } catch (err) {
        console.error('[MyPartnersPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load partners')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllPartners(supabase: any) {
      // Staff view - show all partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .order('name')
        .limit(100)

      if (partnersError) throw partnersError

      const emptyCommission: CommissionSummary = {
        accrued: 0,
        invoice_requested: 0,
        invoiced: 0,
        paid: 0,
        cancelled: 0,
        total_owed: 0,
        currency: 'USD',
      }

      const processedPartners: Partner[] = (partnersData || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.legal_name || 'Unknown Partner',
        legal_name: p.legal_name,
        partner_type: p.partner_type,
        status: p.status || 'active',
        contact_name: p.contact_name,
        contact_email: p.contact_email,
        contact_phone: p.contact_phone,
        country: p.country,
        logo_url: p.logo_url,
        kyc_status: p.kyc_status,
        deals_count: 0,
        referrals_count: 0,
        total_referral_value: 0,
        last_activity: null,
        fee_plans: [],
        commission_summary: emptyCommission,
      }))

      setPartners(processedPartners)
      setSummary({
        totalPartners: processedPartners.length,
        activePartners: processedPartners.filter(p => p.status === 'active').length,
        totalReferrals: 0,
        totalReferralValue: 0,
        totalOwed: 0,
        totalPaid: 0,
      })
    }

    fetchData()
  }, [])

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
    const matchesSearch = !search ||
      partner.name?.toLowerCase().includes(search.toLowerCase()) ||
      partner.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      partner.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      partner.country?.toLowerCase().includes(search.toLowerCase())

    // Deal filter - only applies if we have deal data
    // Note: This is a simplified filter. For a real deal filter, you'd need
    // to store which deals each partner has referrals on.
    const matchesDeal = dealFilter === 'all' // TODO: Implement deal-specific filtering

    return matchesStatus && matchesSearch && matchesDeal
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading partners...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Partners</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Partners</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo
              ? `Partners working with ${arrangerInfo.legal_name}`
              : 'View all distribution partners'}
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
              <Users className="h-4 w-4" />
              Total Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPartners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activePartners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Investors referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Referral Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.totalReferralValue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total commitments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fees Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.totalOwed, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Fees Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalPaid, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total paid out
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
                  placeholder="Search partners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>
            {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
            {arrangerInfo && ' • Click a row to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No partners match your filters'
                  : 'No partners in your network yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Fee Plans</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow
                      key={partner.id}
                      className={cn(
                        arrangerInfo && 'cursor-pointer hover:bg-muted/50 transition-colors'
                      )}
                      onClick={() => arrangerInfo && handlePartnerClick(partner.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            {partner.country && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {partner.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.partner_type ? (
                          <Badge variant="secondary" className="capitalize">
                            {partner.partner_type.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {partner.contact_name && (
                            <div className="text-sm">{partner.contact_name}</div>
                          )}
                          {partner.contact_email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {partner.contact_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.fee_plans.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {partner.fee_plans.slice(0, 2).map((fp) => (
                              <Badge
                                key={fp.id}
                                variant={fp.is_active ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {fp.name}
                              </Badge>
                            ))}
                            {partner.fee_plans.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{partner.fee_plans.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No fee plans</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{partner.referrals_count} referrals</div>
                          {partner.total_referral_value > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(partner.total_referral_value, 'USD')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PartnerCommissionSummary
                          summary={partner.commission_summary}
                          variant="inline"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={cn('capitalize', STATUS_STYLES[partner.status] || STATUS_STYLES.active)}
                          >
                            {partner.status}
                          </Badge>
                          {partner.kyc_status && (
                            <div>
                              <Badge
                                variant="secondary"
                                className={cn('text-xs', KYC_STYLES[partner.kyc_status] || '')}
                              >
                                KYC: {partner.kyc_status.replace('_', ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {arrangerInfo && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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

      {/* Partner Detail Drawer */}
      <PartnerDetailDrawer
        partnerId={selectedPartnerId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
