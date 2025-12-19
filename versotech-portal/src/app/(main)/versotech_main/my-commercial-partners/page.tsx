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
  TrendingUp,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  Handshake,
  Globe,
  Users,
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
}

type Summary = {
  totalCPs: number
  activeCPs: number
  totalClients: number
  totalPlacementValue: number
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

export default function MyCommercialPartnersPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [commercialPartners, setCommercialPartners] = useState<CommercialPartner[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalCPs: 0,
    activeCPs: 0,
    totalClients: 0,
    totalPlacementValue: 0,
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
          await fetchAllCommercialPartners(supabase)
          return
        }

        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('id')
          .eq('arranger_entity_id', arrangerUser.arranger_id)

        if (dealsError) throw dealsError

        if (!deals || deals.length === 0) {
          setCommercialPartners([])
          setSummary({ totalCPs: 0, activeCPs: 0, totalClients: 0, totalPlacementValue: 0 })
          return
        }

        const dealIds = deals.map(d => d.id)

        const { data: referrals, error: refError } = await supabase
          .from('deal_memberships')
          .select(`referred_by_entity_id, investor_id, deal:deal_id (id, name)`)
          .in('deal_id', dealIds)
          .eq('referred_by_entity_type', 'commercial_partner')
          .not('referred_by_entity_id', 'is', null)

        if (refError) throw refError

        const cpIds = [...new Set((referrals || []).map(r => r.referred_by_entity_id))]

        if (cpIds.length === 0) {
          setCommercialPartners([])
          setSummary({ totalCPs: 0, activeCPs: 0, totalClients: 0, totalPlacementValue: 0 })
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
          .select('investor_id, commitment_amount')
          .in('investor_id', investorIds)

        const subsByInvestor = new Map<string, number>()
        ;(subs || []).forEach((s: any) => {
          const current = subsByInvestor.get(s.investor_id) || 0
          subsByInvestor.set(s.investor_id, current + (Number(s.commitment_amount) || 0))
        })

        const processedCPs: CommercialPartner[] = (cpsData || []).map((cp: any) => {
          const cpRefs = (referrals || []).filter(r => r.referred_by_entity_id === cp.id)
          const dealsInvolved = [...new Set(cpRefs.map(r => r.deal?.id).filter(Boolean))]
          const totalValue = cpRefs.reduce((sum, r) => {
            if (r.investor_id) return sum + (subsByInvestor.get(r.investor_id) || 0)
            return sum
          }, 0)

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
          }
        })

        setCommercialPartners(processedCPs)
        setSummary({
          totalCPs: processedCPs.length,
          activeCPs: processedCPs.filter(cp => cp.status === 'active').length,
          totalClients: processedCPs.reduce((sum, cp) => sum + cp.clients_count, 0),
          totalPlacementValue: processedCPs.reduce((sum, cp) => sum + cp.total_placement_value, 0),
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
      }))

      setCommercialPartners(processedCPs)
      setSummary({
        totalCPs: processedCPs.length,
        activeCPs: processedCPs.filter(cp => cp.status === 'active').length,
        totalClients: 0,
        totalPlacementValue: 0,
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
    return matchesStatus && matchesSearch
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Commercial Partners</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo ? `Commercial partners working with ${arrangerInfo.legal_name}` : 'View all commercial partners'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-green-600">{summary.activeCPs}</div>
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
            <div className="text-2xl font-bold text-blue-600">{summary.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Total clients served</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Placement Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalPlacementValue, 'USD')}</div>
            <p className="text-xs text-muted-foreground mt-1">Total placed</p>
          </CardContent>
        </Card>
      </div>

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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commercial Partners</CardTitle>
          <CardDescription>{filteredCPs.length} partner{filteredCPs.length !== 1 ? 's' : ''} found</CardDescription>
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
                    <TableHead>Clients</TableHead>
                    <TableHead>Placement Value</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCPs.map((cp) => {
                    const isExpiringSoon = cp.contract_end_date && new Date(cp.contract_end_date) <= thirtyDaysFromNow && new Date(cp.contract_end_date) > today
                    const isExpired = cp.contract_end_date && new Date(cp.contract_end_date) <= today
                    return (
                      <TableRow key={cp.id}>
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
                          <Badge variant="outline">{cp.clients_count} client{cp.clients_count !== 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(cp.total_placement_value, 'USD')}</div>
                          <div className="text-xs text-muted-foreground">{cp.deals_count} deal{cp.deals_count !== 1 ? 's' : ''}</div>
                        </TableCell>
                        <TableCell>
                          {cp.contract_end_date ? (
                            <div className={cn("text-sm", isExpired && "text-red-600", isExpiringSoon && "text-yellow-600")}>
                              <div className="flex items-center gap-1"><FileText className="h-3 w-3" />{formatDate(cp.contract_end_date)}</div>
                              {isExpired && <Badge variant="destructive" className="text-xs mt-1">Expired</Badge>}
                              {isExpiringSoon && <Badge variant="outline" className="text-xs mt-1 bg-yellow-100">Expiring Soon</Badge>}
                            </div>
                          ) : <span className="text-muted-foreground text-xs">No date</span>}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[cp.status] || STATUS_STYLES.active)}>{cp.status}</Badge>
                            {cp.kyc_status && <div><Badge variant="secondary" className={cn('text-xs', KYC_STYLES[cp.kyc_status] || '')}>KYC: {cp.kyc_status.replace('_', ' ')}</Badge></div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild><a href={`/versotech_main/users?type=commercial_partner&id=${cp.id}`}><ExternalLink className="h-4 w-4" /></a></Button>
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
    </div>
  )
}
