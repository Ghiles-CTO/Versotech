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
  Scale,
  Building2,
  TrendingUp,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

type ArrangerInfo = {
  id: string
  legal_name: string
  status: string
}

type Lawyer = {
  id: string
  firm_name: string
  display_name: string
  legal_entity_type: string | null
  specializations: string[] | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  country: string | null
  logo_url: string | null
  kyc_status: string | null
  is_active: boolean
  deals_count: number
  total_deal_value: number
  // Escrow/funding status
  total_subscriptions: number
  funded_subscriptions: number
  total_funded_amount: number
  total_commitment: number
}

type Summary = {
  totalLawyers: number
  activeLawyers: number
  totalDeals: number
  totalDealValue: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
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
  { label: 'Inactive', value: 'inactive' },
]

export default function MyLawyersPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalLawyers: 0,
    activeLawyers: 0,
    totalDeals: 0,
    totalDealValue: 0,
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
          await fetchAllLawyers(supabase)
          return
        }

        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        // Get deals for this arranger with fee structures (to find lawyers)
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('id, target_amount, currency')
          .eq('arranger_entity_id', arrangerUser.arranger_id)

        if (dealsError) throw dealsError

        if (!deals || deals.length === 0) {
          setLawyers([])
          setSummary({ totalLawyers: 0, activeLawyers: 0, totalDeals: 0, totalDealValue: 0 })
          return
        }

        const dealIds = deals.map(d => d.id)

        // Get fee structures to find legal counsel
        const { data: feeStructures, error: fsError } = await supabase
          .from('deal_fee_structures')
          .select('deal_id, legal_counsel')
          .in('deal_id', dealIds)
          .not('legal_counsel', 'is', null)
          .eq('status', 'published')

        if (fsError) throw fsError

        // Get unique lawyer names/firms
        const lawyerNames = [...new Set((feeStructures || []).map(fs => fs.legal_counsel))]

        if (lawyerNames.length === 0) {
          setLawyers([])
          setSummary({ totalLawyers: 0, activeLawyers: 0, totalDeals: 0, totalDealValue: 0 })
          return
        }

        // Fetch lawyers matching these names
        const { data: lawyersData, error: lawyersError } = await supabase
          .from('lawyers')
          .select('*')
          .or(lawyerNames.map(n => `firm_name.ilike.%${n}%,display_name.ilike.%${n}%`).join(','))
          .order('firm_name')

        if (lawyersError) throw lawyersError

        const dealValueMap = new Map<string, number>()
        deals.forEach(d => dealValueMap.set(d.id, Number(d.target_amount) || 0))

        // Fetch subscriptions for escrow status
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('id, deal_id, commitment, funded_amount, status')
          .in('deal_id', dealIds)

        const subscriptionsByDeal = new Map<string, typeof subscriptions>()
        ;(subscriptions || []).forEach(sub => {
          const existing = subscriptionsByDeal.get(sub.deal_id) || []
          existing.push(sub)
          subscriptionsByDeal.set(sub.deal_id, existing)
        })

        const processedLawyers: Lawyer[] = (lawyersData || []).map((l: any) => {
          // Find deals where this lawyer is legal counsel
          const lawyerDeals = (feeStructures || []).filter(fs => {
            const counsel = fs.legal_counsel?.toLowerCase() || ''
            return counsel.includes(l.firm_name?.toLowerCase() || '') ||
                   counsel.includes(l.display_name?.toLowerCase() || '')
          })
          const dealsInvolved = [...new Set(lawyerDeals.map(fs => fs.deal_id))]
          const totalValue = dealsInvolved.reduce((sum, dealId) => sum + (dealValueMap.get(dealId) || 0), 0)

          // Calculate escrow/funding status for this lawyer's deals
          let totalSubscriptions = 0
          let fundedSubscriptions = 0
          let totalFundedAmount = 0
          let totalCommitment = 0

          dealsInvolved.forEach(dealId => {
            const dealSubs = subscriptionsByDeal.get(dealId) || []
            dealSubs.forEach(sub => {
              totalSubscriptions++
              const commitment = Number(sub.commitment) || 0
              const funded = Number(sub.funded_amount) || 0
              totalCommitment += commitment
              totalFundedAmount += funded
              if (commitment > 0 && funded >= commitment) {
                fundedSubscriptions++
              }
            })
          })

          return {
            id: l.id,
            firm_name: l.firm_name,
            display_name: l.display_name,
            legal_entity_type: l.legal_entity_type,
            specializations: l.specializations,
            primary_contact_name: l.primary_contact_name,
            primary_contact_email: l.primary_contact_email,
            primary_contact_phone: l.primary_contact_phone,
            country: l.country,
            logo_url: l.logo_url,
            kyc_status: l.kyc_status,
            is_active: l.is_active,
            deals_count: dealsInvolved.length,
            total_deal_value: totalValue,
            total_subscriptions: totalSubscriptions,
            funded_subscriptions: fundedSubscriptions,
            total_funded_amount: totalFundedAmount,
            total_commitment: totalCommitment,
          }
        })

        setLawyers(processedLawyers)
        setSummary({
          totalLawyers: processedLawyers.length,
          activeLawyers: processedLawyers.filter(l => l.is_active).length,
          totalDeals: processedLawyers.reduce((sum, l) => sum + l.deals_count, 0),
          totalDealValue: processedLawyers.reduce((sum, l) => sum + l.total_deal_value, 0),
        })
        setError(null)
      } catch (err) {
        console.error('[MyLawyersPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load lawyers')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllLawyers(supabase: any) {
      const { data: lawyersData, error: lawyersError } = await supabase
        .from('lawyers')
        .select('*')
        .order('firm_name')
        .limit(100)

      if (lawyersError) throw lawyersError

      const processedLawyers: Lawyer[] = (lawyersData || []).map((l: any) => ({
        id: l.id,
        firm_name: l.firm_name,
        display_name: l.display_name,
        legal_entity_type: l.legal_entity_type,
        specializations: l.specializations,
        primary_contact_name: l.primary_contact_name,
        primary_contact_email: l.primary_contact_email,
        primary_contact_phone: l.primary_contact_phone,
        country: l.country,
        logo_url: l.logo_url,
        kyc_status: l.kyc_status,
        is_active: l.is_active,
        deals_count: 0,
        total_deal_value: 0,
        total_subscriptions: 0,
        funded_subscriptions: 0,
        total_funded_amount: 0,
        total_commitment: 0,
      }))

      setLawyers(processedLawyers)
      setSummary({
        totalLawyers: processedLawyers.length,
        activeLawyers: processedLawyers.filter(l => l.is_active).length,
        totalDeals: 0,
        totalDealValue: 0,
      })
    }

    fetchData()
  }, [])

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && lawyer.is_active) ||
      (statusFilter === 'inactive' && !lawyer.is_active)
    const matchesSearch = !search ||
      lawyer.firm_name?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.primary_contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.specializations?.some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading lawyers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Lawyers</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Lawyers</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo ? `Legal counsel working with ${arrangerInfo.legal_name}` : 'View all registered law firms'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />Total Lawyers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLawyers}</div>
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
            <div className="text-2xl font-bold text-green-600">{summary.activeLawyers}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />Deals Handled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">Legal counsel on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalDealValue, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">Total handled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search lawyers, firms, or specializations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lawyers & Law Firms</CardTitle>
          <CardDescription>{filteredLawyers.length} firm{filteredLawyers.length !== 1 ? 's' : ''} found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLawyers.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Scale className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{search || statusFilter !== 'all' ? 'No lawyers match your filters' : 'No lawyers in your network yet'}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firm</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Escrow Status</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLawyers.map((lawyer) => (
                    <TableRow key={lawyer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {lawyer.logo_url ? (
                            <img src={lawyer.logo_url} alt={lawyer.firm_name} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Scale className="h-5 w-5 text-muted-foreground" /></div>
                          )}
                          <div>
                            <div className="font-medium">{lawyer.firm_name}</div>
                            {lawyer.display_name !== lawyer.firm_name && <div className="text-xs text-muted-foreground">{lawyer.display_name}</div>}
                            {lawyer.country && <div className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{lawyer.country}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lawyer.specializations && lawyer.specializations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {lawyer.specializations.slice(0, 2).map((spec, idx) => (
                              <Badge key={idx} variant="secondary" className="capitalize text-xs">{spec}</Badge>
                            ))}
                            {lawyer.specializations.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{lawyer.specializations.length - 2}</Badge>
                            )}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lawyer.primary_contact_name && <div className="text-sm">{lawyer.primary_contact_name}</div>}
                          {lawyer.primary_contact_email && <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{lawyer.primary_contact_email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lawyer.deals_count} deal{lawyer.deals_count !== 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>
                        {lawyer.total_subscriptions > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-xs',
                                  lawyer.funded_subscriptions === lawyer.total_subscriptions
                                    ? 'bg-green-100 text-green-800'
                                    : lawyer.funded_subscriptions > 0
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                )}
                              >
                                {lawyer.funded_subscriptions}/{lawyer.total_subscriptions} funded
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(lawyer.total_funded_amount, 'USD')} / {formatCurrency(lawyer.total_commitment, 'USD')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No subs</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(lawyer.total_deal_value, 'USD')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={cn('capitalize', lawyer.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive)}>
                            {lawyer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {lawyer.kyc_status && <div><Badge variant="secondary" className={cn('text-xs', KYC_STYLES[lawyer.kyc_status] || '')}>KYC: {lawyer.kyc_status.replace('_', ' ')}</Badge></div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild><a href={`/versotech_main/users?type=lawyer&id=${lawyer.id}`}><ExternalLink className="h-4 w-4" /></a></Button>
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
