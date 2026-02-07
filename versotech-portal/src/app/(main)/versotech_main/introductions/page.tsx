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
import type { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
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
  Download,
  FolderOpen,
  Building2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatBps } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

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

type DealDetails = {
  id: string
  name: string
  company_name: string | null
  description: string | null
  investment_thesis: string | null
  sector: string | null
  stage: string | null
  location: string | null
  deal_type: string | null
  currency: string | null
  minimum_investment: number | null
  maximum_investment: number | null
  target_amount: number | null
  raised_amount: number | null
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  status: string
  company_website: string | null
  stock_type: string | null
  deal_round: string | null
}

type IntroducerInfo = {
  id: string
  legal_name: string
  default_commission_bps: number
  status: string
}

type Summary = {
  totalIntroductions: number
  interestedCount: number
  approvedCount: number
  signedCount: number
  fundedCount: number
  passedCount: number
  totalCommissionEarned: number
  pendingCommission: number
}

type JourneyStage = 'interested' | 'approved' | 'signed' | 'funded' | 'passed'

const JOURNEY_STAGE_RANK: Record<JourneyStage, number> = {
  passed: 0,
  interested: 1,
  approved: 2,
  signed: 3,
  funded: 4,
}

function getStageFromSubscription(status: string | null): JourneyStage {
  switch (status) {
    case 'funded':
    case 'active':
    case 'completed':
      return 'funded'
    case 'signed':
    case 'committed':
      return 'signed'
    case 'approved':
    case 'pending':
    case 'pending_review':
      return 'approved'
    case 'cancelled':
    case 'rejected':
    case 'withdrawn':
      return 'passed'
    default:
      return 'interested'
  }
}

function getStageFromIntroduction(status: string | null): JourneyStage {
  switch (status) {
    case 'allocated':
      return 'signed'
    case 'joined':
      return 'approved'
    case 'lost':
    case 'inactive':
      return 'passed'
    case 'invited':
    default:
      return 'interested'
  }
}

const STATUS_STYLES: Record<JourneyStage, string> = {
  interested: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-purple-100 text-purple-800 border-purple-200',
  signed: 'bg-amber-100 text-amber-800 border-amber-200',
  funded: 'bg-green-100 text-green-800 border-green-200',
  passed: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Interested', value: 'interested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Signed', value: 'signed' },
  { label: 'Funded', value: 'funded' },
  { label: 'Passed', value: 'passed' },
]

export default function IntroductionsPage() {
  const [introducerInfo, setIntroducerInfo] = useState<IntroducerInfo | null>(null)
  const [introductions, setIntroductions] = useState<Introduction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIntroductions: 0,
    interestedCount: 0,
    approvedCount: 0,
    signedCount: 0,
    fundedCount: 0,
    passedCount: 0,
    totalCommissionEarned: 0,
    pendingCommission: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [exporting, setExporting] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<DealDetails | null>(null)
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [loadingDeal, setLoadingDeal] = useState(false)

  const handleViewDeal = async (dealId: string) => {
    try {
      setLoadingDeal(true)
      setDealDialogOpen(true)

      const supabase = createClient()
      const { data: deal, error } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          company_name,
          description,
          investment_thesis,
          sector,
          stage,
          location,
          deal_type,
          currency,
          minimum_investment,
          maximum_investment,
          target_amount,
          raised_amount,
          offer_unit_price,
          open_at,
          close_at,
          status,
          company_website,
          stock_type,
          deal_round
        `)
        .eq('id', dealId)
        .single()

      if (error) throw error
      setSelectedDeal(deal)
    } catch (err) {
      console.error('[IntroductionsPage] Error fetching deal:', err)
      toast.error('Failed to load deal details')
      setDealDialogOpen(false)
    } finally {
      setLoadingDeal(false)
    }
  }

  const handleExport = async () => {
    if (!introducerInfo) {
      toast.error('Export is only available for introducer users')
      return
    }

    try {
      setExporting(true)
      const response = await fetch('/api/introducers/me/introductions/export')

      if (response.status === 429) {
        toast.error('Please wait 1 minute between export requests')
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Download the CSV
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `introductions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Introductions exported successfully')
    } catch (err) {
      console.error('[IntroductionsPage] Export error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to export introductions')
    } finally {
      setExporting(false)
    }
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

        // Fetch subscription statuses for journey stage alignment
        const investorIds = (introData || [])
          .map(intro => {
            const investor = Array.isArray(intro.investor) ? intro.investor[0] : intro.investor
            return investor?.id || null
          })
          .filter(Boolean) as string[]

        const dealIds = (introData || [])
          .map(intro => {
            const deal = Array.isArray(intro.deal) ? intro.deal[0] : intro.deal
            return deal?.id || null
          })
          .filter(Boolean) as string[]

        const subscriptionStageMap: Record<string, JourneyStage> = {}

        if (investorIds.length > 0 && dealIds.length > 0) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('investor_id, deal_id, status')
            .in('investor_id', investorIds)
            .in('deal_id', dealIds)

          for (const sub of subs || []) {
            const stage = getStageFromSubscription(sub.status || null)
            const key = `${sub.investor_id}:${sub.deal_id}`
            const current = subscriptionStageMap[key]
            if (!current || JOURNEY_STAGE_RANK[stage] > JOURNEY_STAGE_RANK[current]) {
              subscriptionStageMap[key] = stage
            }
          }
        }

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
        const processedIntroductions: Introduction[] = (introData || []).map(intro => {
          const deal = (Array.isArray(intro.deal) ? intro.deal[0] : intro.deal) as Introduction['deal']
          const investor = (Array.isArray(intro.investor) ? intro.investor[0] : intro.investor) as Introduction['investor']
          const stageKey = investor?.id && deal?.id ? `${investor.id}:${deal.id}` : null
          const stageFromSubscription = stageKey ? subscriptionStageMap[stageKey] : null
          let journeyStage = stageFromSubscription || getStageFromIntroduction(intro.status || null)
          if (!stageFromSubscription && intro.status === 'allocated' && commissionsMap[intro.id]) {
            journeyStage = 'funded'
          }

          return {
            id: intro.id,
            prospect_email: intro.prospect_email || '',
            status: journeyStage,
            introduced_at: intro.introduced_at,
            commission_rate_override_bps: intro.commission_rate_override_bps,
            notes: intro.notes,
            deal,
            investor,
            commission: commissionsMap[intro.id] || null,
          }
        })

        setIntroductions(processedIntroductions)

        // Calculate summary
        const interested = processedIntroductions.filter(i => i.status === 'interested').length
        const approved = processedIntroductions.filter(i => i.status === 'approved').length
        const signed = processedIntroductions.filter(i => i.status === 'signed').length
        const funded = processedIntroductions.filter(i => i.status === 'funded').length
        const passed = processedIntroductions.filter(i => i.status === 'passed').length

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
          interestedCount: interested,
          approvedCount: approved,
          signedCount: signed,
          fundedCount: funded,
          passedCount: passed,
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
        status: getStageFromIntroduction(intro.status || null),
        introduced_at: intro.introduced_at,
        commission_rate_override_bps: intro.commission_rate_override_bps,
        notes: intro.notes,
        deal: intro.deal,
        investor: intro.investor,
        commission: null,
      }))

      setIntroductions(processedIntroductions)

      const interested = processedIntroductions.filter(i => i.status === 'interested').length
      const approved = processedIntroductions.filter(i => i.status === 'approved').length
      const signed = processedIntroductions.filter(i => i.status === 'signed').length
      const funded = processedIntroductions.filter(i => i.status === 'funded').length
      const passed = processedIntroductions.filter(i => i.status === 'passed').length

      setSummary({
        totalIntroductions: processedIntroductions.length,
        interestedCount: interested,
        approvedCount: approved,
        signedCount: signed,
        fundedCount: funded,
        passedCount: passed,
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

    // Date range filter (PRD 6.6.4-01: view revenues between 2 DATES)
    let matchesDateRange = true
    if (dateRange?.from || dateRange?.to) {
      if (!intro.introduced_at) {
        matchesDateRange = false
      } else {
        const introDate = new Date(intro.introduced_at)
        if (dateRange.from && introDate < dateRange.from) matchesDateRange = false
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to)
          endOfDay.setHours(23, 59, 59, 999)
          if (introDate > endOfDay) matchesDateRange = false
        }
      }
    }

    return matchesStatus && matchesSearch && matchesDateRange
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Introductions</h1>
          <p className="text-muted-foreground mt-1">
            {introducerInfo
              ? `Track your introductions and commissions as ${introducerInfo.legal_name}`
              : 'View all introductions across the platform'}
          </p>
        </div>
        {introducerInfo && (
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || introductions.length === 0}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
        )}
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
              {summary.interestedCount} interested, {summary.approvedCount} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.fundedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.signedCount} signed
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
            {/* Date Range Filter - PRD 6.6.4-01 */}
            <div className="flex items-center gap-2">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-auto"
              />
              {dateRange && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateRange(undefined)}
                  title="Clear date filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {/* Active filter indicator */}
          {(statusFilter !== 'all' || search || dateRange) && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setSearch('')
                  setDateRange(undefined)
                }}
                className="text-muted-foreground p-0 h-auto"
              >
                Clear all filters
              </Button>
            </div>
          )}
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
                            <button
                              onClick={() => handleViewDeal(intro.deal!.id)}
                              className="font-medium text-left hover:text-primary hover:underline transition-colors"
                            >
                              {intro.deal.name}
                            </button>
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
                          className={cn('capitalize', STATUS_STYLES[intro.status as JourneyStage] || STATUS_STYLES.passed)}
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDeal(intro.deal!.id)}
                              title="View Deal Details"
                            >
                              <FolderOpen className="h-4 w-4 mr-1" />
                              View Deal
                            </Button>
                          </div>
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

      {/* Deal Details Dialog */}
      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingDeal ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading deal details...</span>
            </div>
          ) : selectedDeal ? (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl">{selectedDeal.name}</DialogTitle>
                    {selectedDeal.company_name && (
                      <DialogDescription className="text-base">
                        {selectedDeal.company_name}
                      </DialogDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDealDialogOpen(false)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Key Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.sector && (
                    <Badge variant="secondary">{selectedDeal.sector}</Badge>
                  )}
                  {selectedDeal.stage && (
                    <Badge variant="outline">{selectedDeal.stage}</Badge>
                  )}
                  {selectedDeal.location && (
                    <Badge variant="outline">{selectedDeal.location}</Badge>
                  )}
                  {selectedDeal.status && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        selectedDeal.status === 'active' && 'bg-green-100 text-green-800 border-green-200',
                        selectedDeal.status === 'draft' && 'bg-gray-100 text-gray-800 border-gray-200',
                        selectedDeal.status === 'closed' && 'bg-red-100 text-red-800 border-red-200'
                      )}
                    >
                      {selectedDeal.status}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Description */}
                {selectedDeal.description && (
                  <div>
                    <Label className="text-base font-semibold">Description</Label>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                      {selectedDeal.description}
                    </p>
                  </div>
                )}

                {/* Investment Thesis */}
                {selectedDeal.investment_thesis && (
                  <div>
                    <Label className="text-base font-semibold">Investment Thesis</Label>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                      {selectedDeal.investment_thesis}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Deal Details Grid */}
                <div>
                  <Label className="text-base font-semibold">Deal Information</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {selectedDeal.deal_type && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Deal Type</Label>
                        <p className="font-medium mt-1 capitalize">
                          {selectedDeal.deal_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.stock_type && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Stock Type</Label>
                        <p className="font-medium mt-1 capitalize">
                          {selectedDeal.stock_type === 'common'
                            ? 'Common and Ordinary Shares'
                            : selectedDeal.stock_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.deal_round && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Round</Label>
                        <p className="font-medium mt-1">{selectedDeal.deal_round}</p>
                      </div>
                    )}
                    {selectedDeal.target_amount && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Target Raise</Label>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedDeal.target_amount, selectedDeal.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.raised_amount !== null && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Raised</Label>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedDeal.raised_amount, selectedDeal.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.minimum_investment && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Min Investment</Label>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedDeal.minimum_investment, selectedDeal.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.maximum_investment && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Max Investment</Label>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedDeal.maximum_investment, selectedDeal.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.offer_unit_price && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Unit Price</Label>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedDeal.offer_unit_price, selectedDeal.currency || 'USD')}
                        </p>
                      </div>
                    )}
                    {selectedDeal.open_at && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Opens</Label>
                        <p className="font-medium mt-1">{formatDate(selectedDeal.open_at)}</p>
                      </div>
                    )}
                    {selectedDeal.close_at && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Closes</Label>
                        <p className="font-medium mt-1">{formatDate(selectedDeal.close_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Website */}
                {selectedDeal.company_website && (
                  <div>
                    <Label className="text-base font-semibold">Company Website</Label>
                    <a
                      href={selectedDeal.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-2 text-primary hover:underline"
                    >
                      {selectedDeal.company_website}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                <Separator />

                {/* Action Button */}
                <div className="space-y-3">
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDealDialogOpen(false)}>
                      Close
                    </Button>
                    <Button asChild>
                      <Link href={`/versotech_main/opportunities/${selectedDeal.id}?from=introductions`}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        View as Investor
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    Data room access requires investor persona with deal membership
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Deal Not Found</h3>
              <p className="text-muted-foreground">Unable to load deal details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
