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
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Building2,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type AssignedDeal = {
  id: string
  name: string
  company_name: string | null
  company_logo_url: string | null
  deal_type: string
  status: string
  currency: string
  target_amount: number
  close_at: string | null
  created_at: string
  // Future: assignment_date, document_status, escrow_status, etc.
}

type LawyerInfo = {
  id: string
  firm_name: string
  display_name: string
  specializations: string[] | null
  is_active: boolean
}

type Summary = {
  totalAssigned: number
  activeDeals: number
  closedDeals: number
  pendingReview: number
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

export default function AssignedDealsPage() {
  const [lawyerInfo, setLawyerInfo] = useState<LawyerInfo | null>(null)
  const [deals, setDeals] = useState<AssignedDeal[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalAssigned: 0,
    activeDeals: 0,
    closedDeals: 0,
    pendingReview: 0,
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

        // Check if user is a lawyer
        const { data: lawyerUser, error: lawyerUserError } = await supabase
          .from('lawyer_users')
          .select('lawyer_id')
          .eq('user_id', user.id)
          .single()

        if (lawyerUserError || !lawyerUser) {
          // Maybe they're staff - show all deals as placeholder
          await fetchAllDeals(supabase)
          return
        }

        // Fetch lawyer info
        const { data: lawyer, error: lawyerError } = await supabase
          .from('lawyers')
          .select('id, firm_name, display_name, specializations, is_active')
          .eq('id', lawyerUser.lawyer_id)
          .single()

        if (lawyerError) throw lawyerError
        setLawyerInfo(lawyer)

        // Note: In the future, this will query a deal_lawyer_assignments table
        // or filter deals by lawyer_id. For now, lawyer-specific deals aren't tracked,
        // so we show an empty state for lawyer users.

        // Future query would be something like:
        // const { data: assignments } = await supabase
        //   .from('deal_lawyer_assignments')
        //   .select('deal:deal_id (*)')
        //   .eq('lawyer_id', lawyerUser.lawyer_id)

        setDeals([])
        setSummary({
          totalAssigned: 0,
          activeDeals: 0,
          closedDeals: 0,
          pendingReview: 0,
        })

        setError(null)
      } catch (err) {
        console.error('[AssignedDealsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load assigned deals')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllDeals(supabase: any) {
      // Staff view - show recent deals as placeholder
      const { data: dealsData, error: dealsError } = await supabase
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
          close_at,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (dealsError) throw dealsError

      const processedDeals: AssignedDeal[] = (dealsData || []).map((deal: any) => ({
        id: deal.id,
        name: deal.name || 'Untitled Deal',
        company_name: deal.company_name,
        company_logo_url: deal.company_logo_url,
        deal_type: deal.deal_type || 'unknown',
        status: deal.status || 'draft',
        currency: deal.currency || 'USD',
        target_amount: Number(deal.target_amount) || 0,
        close_at: deal.close_at,
        created_at: deal.created_at,
      }))

      setDeals(processedDeals)

      const active = processedDeals.filter(d => d.status === 'open' || d.status === 'allocation_pending').length
      const closed = processedDeals.filter(d => d.status === 'closed' || d.status === 'fully_subscribed').length

      setSummary({
        totalAssigned: processedDeals.length,
        activeDeals: active,
        closedDeals: closed,
        pendingReview: 0,
      })
    }

    fetchData()
  }, [])

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter
    const matchesSearch = !search ||
      deal.name?.toLowerCase().includes(search.toLowerCase()) ||
      deal.company_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading assigned deals...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Deals</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Deals</h1>
          <p className="text-muted-foreground mt-1">
            {lawyerInfo
              ? `Manage deal documentation and escrow as ${lawyerInfo.display_name}`
              : 'View all deals requiring legal review'}
          </p>
        </div>
        {lawyerInfo && lawyerInfo.specializations && lawyerInfo.specializations.length > 0 && (
          <div className="flex gap-1">
            {lawyerInfo.specializations.slice(0, 2).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {spec}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAssigned}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deals requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activeDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.closedDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{summary.pendingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your review
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
                  placeholder="Search by deal name or company..."
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

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
          <CardDescription>
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDeals.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No deals match your filters'
                  : lawyerInfo
                    ? 'No deals assigned to you yet'
                    : 'No deals requiring legal review'}
              </p>
              {lawyerInfo && deals.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You will be notified when deals are assigned for your review
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {deal.company_logo_url ? (
                            <img
                              src={deal.company_logo_url}
                              alt={deal.company_name || ''}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{deal.name}</div>
                            {deal.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {deal.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {deal.deal_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[deal.status] || STATUS_STYLES.draft)}
                        >
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(deal.target_amount, deal.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.close_at ? (
                          <div className="text-sm">
                            {formatDate(deal.close_at)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/versotech_main/opportunities/${deal.id}`}>
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
