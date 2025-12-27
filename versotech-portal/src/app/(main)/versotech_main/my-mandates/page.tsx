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
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Users,
  Building2,
  PenTool,
  Calendar,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Mandate = {
  id: string
  name: string
  company_name: string | null
  company_logo_url: string | null
  deal_type: string
  status: string
  currency: string
  target_amount: number
  raised_amount: number
  minimum_investment: number
  sector: string | null
  stage: string | null
  location: string | null
  open_at: string | null
  close_at: string | null
  created_at: string
  investor_count: number
  pending_signatures: number
}

const DATE_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: 'year' },
]

type ArrangerInfo = {
  id: string
  legal_name: string
  license_type: string | null
  status: string | null
}

type Summary = {
  totalMandates: number
  activeMandates: number
  closedMandates: number
  totalRaised: number
  totalTarget: number
  currency: string
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-100 text-green-800 border-green-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  closed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  allocation_pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  fully_subscribed: 'bg-purple-100 text-purple-800 border-purple-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Draft', value: 'draft' },
  { label: 'Closed', value: 'closed' },
  { label: 'Fully Subscribed', value: 'fully_subscribed' },
]

export default function MyMandatesPage() {
  const [arrangerInfo, setArrangerInfo] = useState<ArrangerInfo | null>(null)
  const [mandates, setMandates] = useState<Mandate[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalMandates: 0,
    activeMandates: 0,
    closedMandates: 0,
    totalRaised: 0,
    totalTarget: 0,
    currency: 'USD',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [totalPendingSignatures, setTotalPendingSignatures] = useState(0)

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
          // Maybe they're staff - show all arranger mandates
          await fetchAllMandates(supabase)
          return
        }

        // Fetch arranger info
        const { data: arranger, error: arrangerError } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, license_type, status')
          .eq('id', arrangerUser.arranger_id)
          .single()

        if (arrangerError) throw arrangerError
        setArrangerInfo(arranger)

        // Fetch deals (mandates) for this arranger
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select(`
            id,
            name,
            company_name,
            company_logo_url,
            deal_type,
            status,
            currency,
            target_amount,
            raised_amount,
            minimum_investment,
            sector,
            stage,
            location,
            open_at,
            close_at,
            created_at
          `)
          .eq('arranger_entity_id', arrangerUser.arranger_id)
          .order('created_at', { ascending: false })

        if (dealsError) throw dealsError

        // Get investor counts for each deal
        const dealIds = (deals || []).map(d => d.id)
        let investorCounts: Record<string, number> = {}
        let pendingSignatures: Record<string, number> = {}

        if (dealIds.length > 0) {
          const { data: memberships } = await supabase
            .from('deal_memberships')
            .select('deal_id')
            .in('deal_id', dealIds)
            .eq('role', 'investor')

          for (const m of memberships || []) {
            if (m.deal_id) {
              investorCounts[m.deal_id] = (investorCounts[m.deal_id] || 0) + 1
            }
          }

          // Get pending signature counts for each deal
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('id, deal_id')
            .in('deal_id', dealIds)

          if (subscriptions && subscriptions.length > 0) {
            const subIds = subscriptions.map(s => s.id)
            const { data: sigRequests } = await supabase
              .from('signature_requests')
              .select('id, subscription_id, status, signer_role')
              .in('subscription_id', subIds)
              .eq('status', 'pending')
              .eq('signer_role', 'arranger')

            for (const sig of sigRequests || []) {
              const sub = subscriptions.find(s => s.id === sig.subscription_id)
              if (sub?.deal_id) {
                pendingSignatures[sub.deal_id] = (pendingSignatures[sub.deal_id] || 0) + 1
              }
            }
          }
        }

        const totalPending = Object.values(pendingSignatures).reduce((sum, count) => sum + count, 0)
        setTotalPendingSignatures(totalPending)

        const processedMandates: Mandate[] = (deals || []).map(deal => ({
          id: deal.id,
          name: deal.name || 'Untitled Deal',
          company_name: deal.company_name,
          company_logo_url: deal.company_logo_url,
          deal_type: deal.deal_type || 'unknown',
          status: deal.status || 'draft',
          currency: deal.currency || 'USD',
          target_amount: Number(deal.target_amount) || 0,
          raised_amount: Number(deal.raised_amount) || 0,
          minimum_investment: Number(deal.minimum_investment) || 0,
          sector: deal.sector,
          stage: deal.stage,
          location: deal.location,
          open_at: deal.open_at,
          close_at: deal.close_at,
          created_at: deal.created_at,
          investor_count: investorCounts[deal.id] || 0,
          pending_signatures: pendingSignatures[deal.id] || 0,
        }))

        setMandates(processedMandates)

        // Calculate summary
        const active = processedMandates.filter(m => m.status === 'open' || m.status === 'allocation_pending').length
        const closed = processedMandates.filter(m => m.status === 'closed' || m.status === 'fully_subscribed').length

        let totalRaised = 0
        let totalTarget = 0
        for (const m of processedMandates) {
          totalRaised += m.raised_amount
          totalTarget += m.target_amount
        }

        setSummary({
          totalMandates: processedMandates.length,
          activeMandates: active,
          closedMandates: closed,
          totalRaised,
          totalTarget,
          currency: 'USD',
        })

        setError(null)
      } catch (err) {
        console.error('[MyMandatesPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load mandates')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllMandates(supabase: any) {
      // Staff view - show all deals with arrangers
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          company_name,
          company_logo_url,
          deal_type,
          status,
          currency,
          target_amount,
          raised_amount,
          minimum_investment,
          sector,
          stage,
          location,
          open_at,
          close_at,
          created_at,
          arranger_entity_id
        `)
        .not('arranger_entity_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      if (dealsError) throw dealsError

      const processedMandates: Mandate[] = (deals || []).map((deal: any) => ({
        id: deal.id,
        name: deal.name || 'Untitled Deal',
        company_name: deal.company_name,
        company_logo_url: deal.company_logo_url,
        deal_type: deal.deal_type || 'unknown',
        status: deal.status || 'draft',
        currency: deal.currency || 'USD',
        target_amount: Number(deal.target_amount) || 0,
        raised_amount: Number(deal.raised_amount) || 0,
        minimum_investment: Number(deal.minimum_investment) || 0,
        sector: deal.sector,
        stage: deal.stage,
        location: deal.location,
        open_at: deal.open_at,
        close_at: deal.close_at,
        created_at: deal.created_at,
        investor_count: 0,
        pending_signatures: 0,
      }))

      setMandates(processedMandates)

      const active = processedMandates.filter(m => m.status === 'open' || m.status === 'allocation_pending').length
      const closed = processedMandates.filter(m => m.status === 'closed' || m.status === 'fully_subscribed').length

      let totalRaised = 0
      let totalTarget = 0
      for (const m of processedMandates) {
        totalRaised += m.raised_amount
        totalTarget += m.target_amount
      }

      setSummary({
        totalMandates: processedMandates.length,
        activeMandates: active,
        closedMandates: closed,
        totalRaised,
        totalTarget,
        currency: 'USD',
      })
    }

    fetchData()
  }, [])

  // Date filter helper
  const getDateFilterCutoff = (filter: string): Date | null => {
    const now = new Date()
    switch (filter) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      case 'year':
        return new Date(now.getFullYear(), 0, 1)
      default:
        return null
    }
  }

  // Filter mandates
  const filteredMandates = mandates.filter(mandate => {
    const matchesStatus = statusFilter === 'all' || mandate.status === statusFilter
    const matchesSearch = !search ||
      mandate.name?.toLowerCase().includes(search.toLowerCase()) ||
      mandate.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      mandate.sector?.toLowerCase().includes(search.toLowerCase())

    // Date filter
    const cutoffDate = getDateFilterCutoff(dateFilter)
    const matchesDate = !cutoffDate || new Date(mandate.created_at) >= cutoffDate

    return matchesStatus && matchesSearch && matchesDate
  })

  const getProgressPercent = (raised: number, target: number) => {
    if (target === 0) return 0
    return Math.min(100, Math.round((raised / target) * 100))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading mandates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Mandates</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Mandates</h1>
          <p className="text-muted-foreground mt-1">
            {arrangerInfo
              ? `Manage deals and placement activities as ${arrangerInfo.legal_name}`
              : 'View all arranger mandates across the platform'}
          </p>
        </div>
        {arrangerInfo && arrangerInfo.license_type && (
          <Badge variant="outline" className="capitalize">
            {arrangerInfo.license_type}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Mandates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMandates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.activeMandates} active, {summary.closedMandates} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activeMandates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently raising
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRaised, summary.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(summary.totalTarget, summary.currency)} target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalTarget > 0 ? getProgressPercent(summary.totalRaised, summary.totalTarget) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall fundraising
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Signatures Alert */}
      {totalPendingSignatures > 0 && (
        <Card className="border-amber-500/30 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <PenTool className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {totalPendingSignatures} Pending Signature{totalPendingSignatures !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You have subscription packs awaiting your countersignature
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/versotech_main/versosign">
                  <PenTool className="h-4 w-4 mr-2" />
                  Go to VERSOSign
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by deal name, company, or sector..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mandates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mandates</CardTitle>
          <CardDescription>
            {filteredMandates.length} mandate{filteredMandates.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMandates.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No mandates match your filters'
                  : 'No mandates yet'}
              </p>
              {!arrangerInfo && mandates.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Arranger mandates will appear here when deals are assigned to arranger entities
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Investors</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMandates.map((mandate) => (
                    <TableRow key={mandate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {mandate.company_logo_url ? (
                            <img
                              src={mandate.company_logo_url}
                              alt={mandate.company_name || ''}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{mandate.name}</div>
                            {mandate.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {mandate.company_name}
                                {mandate.sector && ` • ${mandate.sector}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[mandate.status] || STATUS_STYLES.draft)}
                        >
                          {mandate.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{formatCurrency(mandate.raised_amount, mandate.currency)}</span>
                            <span className="text-muted-foreground">
                              {getProgressPercent(mandate.raised_amount, mandate.target_amount)}%
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercent(mandate.raised_amount, mandate.target_amount)}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            of {formatCurrency(mandate.target_amount, mandate.currency)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{mandate.investor_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mandate.pending_signatures > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <PenTool className="h-3 w-3 mr-1" />
                            {mandate.pending_signatures}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {mandate.open_at && (
                            <div className="text-xs">
                              Open: {formatDate(mandate.open_at)}
                            </div>
                          )}
                          {mandate.close_at && (
                            <div className="text-xs text-muted-foreground">
                              Close: {formatDate(mandate.close_at)}
                            </div>
                          )}
                          {!mandate.open_at && !mandate.close_at && (
                            <span className="text-muted-foreground text-xs">No dates set</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/versotech_main/opportunities/${mandate.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
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
