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
  TrendingUp,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Handshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

type ArrangerInfo = {
  id: string
  legal_name: string
  status: string
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
}

type Summary = {
  totalPartners: number
  activePartners: number
  totalReferrals: number
  totalReferralValue: number
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
  const [partners, setPartners] = useState<Partner[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalPartners: 0,
    activePartners: 0,
    totalReferrals: 0,
    totalReferralValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

        // Fetch arranger info
        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        // Get deals for this arranger
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('id')
          .eq('arranger_entity_id', arrangerUser.arranger_id)

        if (dealsError) throw dealsError

        if (!deals || deals.length === 0) {
          setPartners([])
          setSummary({ totalPartners: 0, activePartners: 0, totalReferrals: 0, totalReferralValue: 0 })
          return
        }

        const dealIds = deals.map(d => d.id)

        // Get partner referrals on these deals
        const { data: referrals, error: refError } = await supabase
          .from('deal_memberships')
          .select(`
            referred_by_entity_id,
            investor_id,
            deal:deal_id (id, name, currency, created_at)
          `)
          .in('deal_id', dealIds)
          .eq('referred_by_entity_type', 'partner')
          .not('referred_by_entity_id', 'is', null)

        if (refError) throw refError

        // Get unique partner IDs
        const partnerIds = [...new Set((referrals || []).map(r => r.referred_by_entity_id))]

        if (partnerIds.length === 0) {
          setPartners([])
          setSummary({ totalPartners: 0, activePartners: 0, totalReferrals: 0, totalReferralValue: 0 })
          return
        }

        // Fetch partner details
        const { data: partnersData, error: partnersError } = await supabase
          .from('partners')
          .select('*')
          .in('id', partnerIds)
          .order('name')

        if (partnersError) throw partnersError

        // Get subscription values for referrals
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

        // Process partners with stats
        const processedPartners: Partner[] = (partnersData || []).map((p: any) => {
          const partnerRefs = (referrals || []).filter(r => r.referred_by_entity_id === p.id)
          const dealsInvolved = [...new Set(partnerRefs.map(r => {
            const deal = Array.isArray(r.deal) ? r.deal[0] : r.deal
            return deal?.id
          }).filter(Boolean))]
          const totalValue = partnerRefs.reduce((sum, r) => {
            if (r.investor_id) {
              return sum + (subsByInvestor.get(r.investor_id) || 0)
            }
            return sum
          }, 0)
          const lastRef = partnerRefs.sort((a: any, b: any) => {
            const aDeal = Array.isArray(a.deal) ? a.deal[0] : a.deal
            const bDeal = Array.isArray(b.deal) ? b.deal[0] : b.deal
            return new Date(bDeal?.created_at || 0).getTime() - new Date(aDeal?.created_at || 0).getTime()
          })[0]
          const lastRefDeal = lastRef ? (Array.isArray(lastRef.deal) ? lastRef.deal[0] : lastRef.deal) : null

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
            deals_count: dealsInvolved.length,
            referrals_count: partnerRefs.length,
            total_referral_value: totalValue,
            last_activity: lastRefDeal?.created_at || null,
          }
        })

        setPartners(processedPartners)

        const active = processedPartners.filter(p => p.status === 'active').length
        const totalRefs = processedPartners.reduce((sum, p) => sum + p.referrals_count, 0)
        const totalVal = processedPartners.reduce((sum, p) => sum + p.total_referral_value, 0)

        setSummary({
          totalPartners: processedPartners.length,
          activePartners: active,
          totalReferrals: totalRefs,
          totalReferralValue: totalVal,
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
      }))

      setPartners(processedPartners)
      setSummary({
        totalPartners: processedPartners.length,
        activePartners: processedPartners.filter(p => p.status === 'active').length,
        totalReferrals: 0,
        totalReferralValue: 0,
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
    return matchesStatus && matchesSearch
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Total commitment value
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
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>
            {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} found
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
                    <TableHead>Deals</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
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
                        <Badge variant="outline">
                          {partner.deals_count} deal{partner.deals_count !== 1 ? 's' : ''}
                        </Badge>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/versotech_main/users?type=partner&id=${partner.id}`}>
                            <ExternalLink className="h-4 w-4" />
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
    </div>
  )
}
