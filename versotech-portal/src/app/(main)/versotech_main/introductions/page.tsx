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
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatBps } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Introduction = {
  id: string
  prospect_email: string
  status: string
  introduced_at: string | null
  commission_rate_override_bps: number | null
  notes: string | null
  deal: {
    id: string
    name: string
    company_name: string | null
  } | null
  investor: {
    id: string
    legal_name: string
  } | null
  commission: {
    accrual_amount: number
    currency: string
    status: string
  } | null
}

type IntroducerInfo = {
  id: string
  legal_name: string
  default_commission_bps: number
  status: string
}

type Summary = {
  totalIntroductions: number
  allocatedCount: number
  joinedCount: number
  invitedCount: number
  totalCommissionEarned: number
  pendingCommission: number
}

const STATUS_STYLES: Record<string, string> = {
  allocated: 'bg-green-100 text-green-800 border-green-200',
  joined: 'bg-blue-100 text-blue-800 border-blue-200',
  invited: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  lost: 'bg-red-100 text-red-800 border-red-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Invited', value: 'invited' },
  { label: 'Joined', value: 'joined' },
  { label: 'Allocated', value: 'allocated' },
  { label: 'Lost', value: 'lost' },
]

export default function IntroductionsPage() {
  const [introducerInfo, setIntroducerInfo] = useState<IntroducerInfo | null>(null)
  const [introductions, setIntroductions] = useState<Introduction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIntroductions: 0,
    allocatedCount: 0,
    joinedCount: 0,
    invitedCount: 0,
    totalCommissionEarned: 0,
    pendingCommission: 0,
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

        // Check if user is an introducer
        const { data: introducerUser, error: introducerUserError } = await supabase
          .from('introducer_users')
          .select('introducer_id')
          .eq('user_id', user.id)
          .single()

        if (introducerUserError || !introducerUser) {
          // Maybe they're staff - show all introductions
          await fetchAllIntroductions(supabase)
          return
        }

        // Fetch introducer info
        const { data: introducer, error: introducerError } = await supabase
          .from('introducers')
          .select('id, legal_name, default_commission_bps, status')
          .eq('id', introducerUser.introducer_id)
          .single()

        if (introducerError) throw introducerError
        setIntroducerInfo(introducer)

        // Fetch introductions for this introducer
        const { data: introData, error: introError } = await supabase
          .from('introductions')
          .select(`
            id,
            prospect_email,
            status,
            introduced_at,
            commission_rate_override_bps,
            notes,
            deal:deals (
              id,
              name,
              company_name
            ),
            investor:prospect_investor_id (
              id,
              legal_name
            )
          `)
          .eq('introducer_id', introducerUser.introducer_id)
          .order('introduced_at', { ascending: false })

        if (introError) throw introError

        // Fetch commissions for these introductions
        const introIds = (introData || []).map(i => i.id)
        let commissionsMap: Record<string, { accrual_amount: number; currency: string; status: string }> = {}

        if (introIds.length > 0) {
          const { data: commissions } = await supabase
            .from('introducer_commissions')
            .select('introduction_id, accrual_amount, currency, status')
            .in('introduction_id', introIds)

          for (const comm of commissions || []) {
            if (comm.introduction_id) {
              commissionsMap[comm.introduction_id] = {
                accrual_amount: Number(comm.accrual_amount) || 0,
                currency: comm.currency || 'USD',
                status: comm.status || 'accrued',
              }
            }
          }
        }

        // Combine data
        const processedIntroductions: Introduction[] = (introData || []).map(intro => ({
          id: intro.id,
          prospect_email: intro.prospect_email || '',
          status: intro.status || 'invited',
          introduced_at: intro.introduced_at,
          commission_rate_override_bps: intro.commission_rate_override_bps,
          notes: intro.notes,
          deal: (Array.isArray(intro.deal) ? intro.deal[0] : intro.deal) as Introduction['deal'],
          investor: (Array.isArray(intro.investor) ? intro.investor[0] : intro.investor) as Introduction['investor'],
          commission: commissionsMap[intro.id] || null,
        }))

        setIntroductions(processedIntroductions)

        // Calculate summary
        const allocated = processedIntroductions.filter(i => i.status === 'allocated').length
        const joined = processedIntroductions.filter(i => i.status === 'joined').length
        const invited = processedIntroductions.filter(i => i.status === 'invited').length

        let totalEarned = 0
        let pending = 0
        for (const intro of processedIntroductions) {
          if (intro.commission) {
            if (intro.commission.status === 'paid') {
              totalEarned += intro.commission.accrual_amount
            } else if (intro.commission.status === 'accrued' || intro.commission.status === 'invoiced') {
              pending += intro.commission.accrual_amount
            }
          }
        }

        setSummary({
          totalIntroductions: processedIntroductions.length,
          allocatedCount: allocated,
          joinedCount: joined,
          invitedCount: invited,
          totalCommissionEarned: totalEarned,
          pendingCommission: pending,
        })

        setError(null)
      } catch (err) {
        console.error('[IntroductionsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load introductions')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllIntroductions(supabase: any) {
      // Staff view - show all introductions
      const { data: introData, error: introError } = await supabase
        .from('introductions')
        .select(`
          id,
          prospect_email,
          status,
          introduced_at,
          commission_rate_override_bps,
          notes,
          deal:deals (
            id,
            name,
            company_name
          ),
          investor:prospect_investor_id (
            id,
            legal_name
          )
        `)
        .order('introduced_at', { ascending: false })
        .limit(100)

      if (introError) throw introError

      const processedIntroductions: Introduction[] = (introData || []).map((intro: any) => ({
        id: intro.id,
        prospect_email: intro.prospect_email || '',
        status: intro.status || 'invited',
        introduced_at: intro.introduced_at,
        commission_rate_override_bps: intro.commission_rate_override_bps,
        notes: intro.notes,
        deal: intro.deal,
        investor: intro.investor,
        commission: null,
      }))

      setIntroductions(processedIntroductions)

      const allocated = processedIntroductions.filter(i => i.status === 'allocated').length
      const joined = processedIntroductions.filter(i => i.status === 'joined').length
      const invited = processedIntroductions.filter(i => i.status === 'invited').length

      setSummary({
        totalIntroductions: processedIntroductions.length,
        allocatedCount: allocated,
        joinedCount: joined,
        invitedCount: invited,
        totalCommissionEarned: 0,
        pendingCommission: 0,
      })
    }

    fetchData()
  }, [])

  // Filter introductions
  const filteredIntroductions = introductions.filter(intro => {
    const matchesStatus = statusFilter === 'all' || intro.status === statusFilter
    const matchesSearch = !search ||
      intro.prospect_email.toLowerCase().includes(search.toLowerCase()) ||
      intro.deal?.name?.toLowerCase().includes(search.toLowerCase()) ||
      intro.deal?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      intro.investor?.legal_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading introductions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Introductions</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Introductions</h1>
          <p className="text-muted-foreground mt-1">
            {introducerInfo
              ? `Track your introductions and commissions as ${introducerInfo.legal_name}`
              : 'View all introductions across the platform'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Introductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalIntroductions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.invitedCount} invited, {summary.joinedCount} joined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.allocatedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCommissionEarned)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(summary.pendingCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
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
                  placeholder="Search by email, deal, or investor..."
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

      {/* Introductions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Introductions</CardTitle>
          <CardDescription>
            {filteredIntroductions.length} introduction{filteredIntroductions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIntroductions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No introductions match your filters'
                  : 'No introductions yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Introduced</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntroductions.map((intro) => (
                    <TableRow key={intro.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{intro.prospect_email}</div>
                          {intro.investor && (
                            <div className="text-xs text-muted-foreground">
                              {intro.investor.legal_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {intro.deal ? (
                          <div>
                            <div className="font-medium">{intro.deal.name}</div>
                            {intro.deal.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {intro.deal.company_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[intro.status] || STATUS_STYLES.inactive)}
                        >
                          {intro.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {intro.introduced_at ? formatDate(intro.introduced_at) : '—'}
                      </TableCell>
                      <TableCell>
                        {intro.commission ? (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(intro.commission.accrual_amount, intro.commission.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {intro.commission.status}
                            </div>
                          </div>
                        ) : intro.commission_rate_override_bps ? (
                          <div className="text-xs text-muted-foreground">
                            Rate: {formatBps(intro.commission_rate_override_bps)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {intro.deal && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/versotech_main/opportunities/${intro.deal.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
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
    </div>
  )
}
