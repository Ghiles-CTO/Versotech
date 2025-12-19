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
  ArrowRightLeft,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type PartnerTransaction = {
  id: string
  investor: {
    id: string
    legal_name: string
  } | null
  deal: {
    id: string
    name: string
    company_name: string | null
    status: string
  } | null
  subscription: {
    id: string
    commitment: number
    currency: string
    status: string
    committed_at: string | null
  } | null
  referred_at: string | null
  role: string
}

type PartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  partner_type: string
  status: string
}

type Summary = {
  totalReferrals: number
  convertedCount: number
  pendingCount: number
  totalCommitmentValue: number
  currency: string
}

const STATUS_STYLES: Record<string, string> = {
  funded: 'bg-green-100 text-green-800 border-green-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Funded', value: 'funded' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
]

export default function PartnerTransactionsPage() {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalReferrals: 0,
    convertedCount: 0,
    pendingCount: 0,
    totalCommitmentValue: 0,
    currency: 'USD',
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

        // Check if user is a partner
        const { data: partnerUser, error: partnerUserError } = await supabase
          .from('partner_users')
          .select('partner_id')
          .eq('user_id', user.id)
          .single()

        if (partnerUserError || !partnerUser) {
          // Maybe they're staff - show all partner transactions
          await fetchAllPartnerTransactions(supabase)
          return
        }

        // Fetch partner info
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('id, name, legal_name, partner_type, status')
          .eq('id', partnerUser.partner_id)
          .single()

        if (partnerError) throw partnerError
        setPartnerInfo(partner)

        // Fetch deal memberships referred by this partner
        const { data: memberships, error: membershipsError } = await supabase
          .from('deal_memberships')
          .select(`
            id,
            role,
            created_at,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
              id,
              name,
              company_name,
              status
            )
          `)
          .eq('referred_by_entity_id', partnerUser.partner_id)
          .eq('referred_by_entity_type', 'partner')
          .order('created_at', { ascending: false })

        if (membershipsError) throw membershipsError

        // For each membership, try to find related subscription
        const processedTransactions: PartnerTransaction[] = []

        for (const membership of memberships || []) {
          const investorData = membership.investor as any
          const dealData = membership.deal as any

          // Try to find subscription for this investor in vehicles associated with this deal
          let subscriptionData = null
          if (investorData?.id && dealData?.id) {
            const { data: subs } = await supabase
              .from('subscriptions')
              .select('id, commitment, currency, status, committed_at')
              .eq('investor_id', investorData.id)
              .order('committed_at', { ascending: false })
              .limit(1)

            if (subs && subs.length > 0) {
              subscriptionData = subs[0]
            }
          }

          processedTransactions.push({
            id: membership.id,
            investor: investorData ? {
              id: investorData.id,
              legal_name: investorData.legal_name || 'Unknown',
            } : null,
            deal: dealData ? {
              id: dealData.id,
              name: dealData.name || 'Unknown Deal',
              company_name: dealData.company_name,
              status: dealData.status || 'unknown',
            } : null,
            subscription: subscriptionData ? {
              id: subscriptionData.id,
              commitment: Number(subscriptionData.commitment) || 0,
              currency: subscriptionData.currency || 'USD',
              status: subscriptionData.status || 'pending',
              committed_at: subscriptionData.committed_at,
            } : null,
            referred_at: membership.created_at,
            role: membership.role || 'investor',
          })
        }

        setTransactions(processedTransactions)

        // Calculate summary
        const converted = processedTransactions.filter(t =>
          t.subscription?.status === 'funded' || t.subscription?.status === 'approved'
        ).length
        const pending = processedTransactions.filter(t =>
          t.subscription?.status === 'pending' || t.subscription?.status === 'pending_approval'
        ).length

        let totalValue = 0
        for (const t of processedTransactions) {
          if (t.subscription && (t.subscription.status === 'funded' || t.subscription.status === 'approved')) {
            totalValue += t.subscription.commitment
          }
        }

        setSummary({
          totalReferrals: processedTransactions.length,
          convertedCount: converted,
          pendingCount: pending,
          totalCommitmentValue: totalValue,
          currency: 'USD',
        })

        setError(null)
      } catch (err) {
        console.error('[PartnerTransactionsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllPartnerTransactions(supabase: any) {
      // Staff view - show all partner-referred transactions
      const { data: memberships, error: membershipsError } = await supabase
        .from('deal_memberships')
        .select(`
          id,
          role,
          created_at,
          referred_by_entity_id,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name,
            company_name,
            status
          )
        `)
        .eq('referred_by_entity_type', 'partner')
        .order('created_at', { ascending: false })
        .limit(100)

      if (membershipsError) throw membershipsError

      const processedTransactions: PartnerTransaction[] = (memberships || []).map((m: any) => ({
        id: m.id,
        investor: m.investor ? {
          id: m.investor.id,
          legal_name: m.investor.legal_name || 'Unknown',
        } : null,
        deal: m.deal ? {
          id: m.deal.id,
          name: m.deal.name || 'Unknown Deal',
          company_name: m.deal.company_name,
          status: m.deal.status || 'unknown',
        } : null,
        subscription: null,
        referred_at: m.created_at,
        role: m.role || 'investor',
      }))

      setTransactions(processedTransactions)

      setSummary({
        totalReferrals: processedTransactions.length,
        convertedCount: 0,
        pendingCount: 0,
        totalCommitmentValue: 0,
        currency: 'USD',
      })
    }

    fetchData()
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const txStatus = tx.subscription?.status || 'no_subscription'
    const matchesStatus = statusFilter === 'all' || txStatus === statusFilter
    const matchesSearch = !search ||
      tx.investor?.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.deal?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.deal?.company_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Transactions</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {partnerInfo
              ? `Track referrals and investments as ${partnerInfo.name}`
              : 'View all partner-referred transactions across the platform'}
          </p>
        </div>
        {partnerInfo && (
          <Badge variant="outline" className="capitalize">
            {partnerInfo.partner_type}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Investors referred to deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.convertedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{summary.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCommitmentValue, summary.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Converted commitments
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
                  placeholder="Search by investor, deal, or company..."
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

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No transactions match your filters'
                  : 'No partner transactions yet'}
              </p>
              {!partnerInfo && transactions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Partner referrals will appear here when investors are referred via partner relationships
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Commitment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referred</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.investor ? (
                          <div className="font-medium">{tx.investor.legal_name}</div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.deal ? (
                          <div>
                            <div className="font-medium">{tx.deal.name}</div>
                            {tx.deal.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {tx.deal.company_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.subscription ? (
                          <div className="font-medium">
                            {formatCurrency(tx.subscription.commitment, tx.subscription.currency)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not subscribed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.subscription ? (
                          <Badge
                            variant="outline"
                            className={cn('capitalize', STATUS_STYLES[tx.subscription.status] || STATUS_STYLES.pending)}
                          >
                            {tx.subscription.status.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Referred
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {tx.referred_at ? formatDate(tx.referred_at) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tx.deal && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/versotech_main/opportunities/${tx.deal.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
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
