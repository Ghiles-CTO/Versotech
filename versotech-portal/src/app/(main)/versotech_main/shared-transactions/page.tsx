'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Share2,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Building2,
  Handshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { type CurrencyTotals, formatCurrencyTotals } from '@/lib/currency-totals'

type SharedTransaction = {
  id: string // Synthetic ID from deal_id + investor_id
  deal_id: string
  deal_name: string
  deal_status: string
  investor_id: string | null
  investor_name: string
  commitment_amount: number
  currency: string | null
  dispatched_at: string | null
  partner_share: number // Percentage share
  co_referrer_name: string | null
  co_referrer_type: string | null
}

type PartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  status: string
  logo_url: string | null
}

type Summary = {
  totalShared: number
  activeDeals: number
  totalValue: number
  totalValueByCurrency: CurrencyTotals
  coPartners: number
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_FILTERS = [
  { label: 'All Status', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
  { label: 'Pending', value: 'pending' },
]

const isValidCurrencyCode = (currency?: string | null): currency is string =>
  typeof currency === 'string' && currency.trim().length === 3

const formatAmountWithCurrency = (amount: number, currency?: string | null) => {
  if (isValidCurrencyCode(currency)) return formatCurrency(amount, currency.toUpperCase())
  return amount.toLocaleString('en-US')
}

const sumByCurrencyStrict = <T,>(
  items: T[],
  amountGetter: (item: T) => number | null | undefined,
  currencyGetter: (item: T) => string | null | undefined
): CurrencyTotals => {
  return items.reduce<CurrencyTotals>((totals, item) => {
    const currency = currencyGetter(item)
    if (!isValidCurrencyCode(currency)) return totals
    const amount = Number(amountGetter(item)) || 0
    const code = currency.toUpperCase()
    totals[code] = (totals[code] || 0) + amount
    return totals
  }, {})
}

export default function SharedTransactionsPage() {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [transactions, setTransactions] = useState<SharedTransaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalShared: 0,
    activeDeals: 0,
    totalValue: 0,
    totalValueByCurrency: {},
    coPartners: 0,
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
          // Maybe they're staff - show example data
          await fetchAllSharedTransactions(supabase)
          return
        }

        // Fetch partner info
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('id, name, legal_name, status, logo_url')
          .eq('id', partnerUser.partner_id)
          .single()

        if (partnerError) throw partnerError
        setPartnerInfo(partner)

        // Fetch shared transactions for this partner
        // Looking for deals where this partner referred AND there are other referrers
        // Note: deal_memberships has no 'id' or 'created_at' columns - use composite key and dispatched_at
        const { data: memberships, error: membershipsError } = await supabase
          .from('deal_memberships')
          .select(`
            deal_id,
            investor_id,
            dispatched_at,
            referred_by_entity_id,
            referred_by_entity_type,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
              id,
              name,
              status,
              currency,
              target_amount
            )
          `)
          .eq('referred_by_entity_id', partnerUser.partner_id)
          .eq('referred_by_entity_type', 'partner')
          .order('dispatched_at', { ascending: false })

        if (membershipsError) throw membershipsError

        // Get subscription amounts for these investors
        const investorIds = (memberships || [])
          .filter((m: any) => {
            const investor = Array.isArray(m.investor) ? m.investor[0] : m.investor
            return investor?.id
          })
          .map((m: any) => {
            const investor = Array.isArray(m.investor) ? m.investor[0] : m.investor
            return investor.id
          })

        let subscriptionsMap: Record<string, any> = {}
        if (investorIds.length > 0) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('investor_id, commitment, status')
            .in('investor_id', investorIds)

          if (subs) {
            subs.forEach((s: any) => {
              if (!subscriptionsMap[s.investor_id]) {
                subscriptionsMap[s.investor_id] = s
              }
            })
          }
        }

        // Find deals with multiple referrers (shared deals)
        const dealIds = [...new Set((memberships || []).filter((m: any) => {
          const deal = Array.isArray(m.deal) ? m.deal[0] : m.deal
          return deal?.id
        }).map((m: any) => {
          const deal = Array.isArray(m.deal) ? m.deal[0] : m.deal
          return deal.id
        }))]

        let sharedDealInfo: Record<string, any[]> = {}
        if (dealIds.length > 0) {
          const { data: allReferrals } = await supabase
            .from('deal_memberships')
            .select('deal_id, referred_by_entity_id, referred_by_entity_type')
            .in('deal_id', dealIds)
            .not('referred_by_entity_id', 'is', null)
            .neq('referred_by_entity_id', partnerUser.partner_id)

          if (allReferrals) {
            allReferrals.forEach((r: any) => {
              if (!sharedDealInfo[r.deal_id]) {
                sharedDealInfo[r.deal_id] = []
              }
              sharedDealInfo[r.deal_id].push(r)
            })
          }
        }

        processTransactions(memberships || [], subscriptionsMap, sharedDealInfo)
        setError(null)
      } catch (err) {
        console.error('[SharedTransactionsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load shared transactions')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllSharedTransactions(supabase: any) {
      // Staff view - show deals with multiple referrers
      // Note: deal_memberships has no 'id' or 'created_at' columns
      const { data: memberships, error: membershipsError } = await supabase
        .from('deal_memberships')
        .select(`
          deal_id,
          investor_id,
          dispatched_at,
          referred_by_entity_id,
          referred_by_entity_type,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name,
            status,
            currency,
            target_amount
          )
        `)
        .not('referred_by_entity_id', 'is', null)
        .order('dispatched_at', { ascending: false })
        .limit(50)

      if (membershipsError) throw membershipsError
      processTransactions(memberships || [], {}, {})
    }

    function processTransactions(
      data: any[],
      subscriptionsMap: Record<string, any>,
      sharedDealInfo: Record<string, any[]>
    ) {
      const processed: SharedTransaction[] = data.map((membership) => {
        // Handle Supabase returning array for joined foreign key
        const investor = Array.isArray(membership.investor) ? membership.investor[0] : membership.investor
        const deal = Array.isArray(membership.deal) ? membership.deal[0] : membership.deal

        const subscription = investor?.id
          ? subscriptionsMap[investor.id]
          : null

        const coReferrers = sharedDealInfo[deal?.id] || []
        const hasCoReferrer = coReferrers.length > 0
        const coReferrer = coReferrers[0]

        // Create synthetic ID from composite key (deal_memberships has no 'id' column)
        const syntheticId = `${membership.deal_id || 'no-deal'}-${membership.investor_id || 'no-investor'}`

        return {
          id: syntheticId,
          deal_id: deal?.id || '',
          deal_name: deal?.name || 'Unknown Deal',
          deal_status: deal?.status || 'draft',
          investor_id: investor?.id || null,
          investor_name: investor?.legal_name || 'Unknown',
          commitment_amount: subscription?.commitment || 0,
          currency: deal?.currency ? String(deal.currency).toUpperCase() : null,
          dispatched_at: membership.dispatched_at,
          partner_share: hasCoReferrer ? 50 : 100, // Simplified share calculation
          co_referrer_name: hasCoReferrer ? `Co-referrer (${coReferrer.referred_by_entity_type})` : null,
          co_referrer_type: coReferrer?.referred_by_entity_type || null,
        }
      })

      // Filter to only shared transactions (where there's a co-referrer)
      const sharedOnly = processed.filter(t => t.co_referrer_name !== null)

      setTransactions(processed) // Show all for now, filter can be applied

      const uniqueDeals = new Set(processed.map(t => t.deal_id))
      const uniqueCoPartners = new Set(processed.filter(t => t.co_referrer_name).map(t => t.co_referrer_name))
      const totalValue = processed.reduce((sum, t) => sum + t.commitment_amount, 0)
      const totalValueByCurrency = sumByCurrencyStrict(
        processed,
        (transaction) => transaction.commitment_amount,
        (transaction) => transaction.currency
      )

      setSummary({
        totalShared: sharedOnly.length,
        activeDeals: uniqueDeals.size,
        totalValue,
        totalValueByCurrency,
        coPartners: uniqueCoPartners.size,
      })
    }

    fetchData()
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesStatus = statusFilter === 'all' || tx.deal_status === statusFilter
    const matchesSearch = !search ||
      tx.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.investor_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading shared transactions...</span>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shared Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {partnerInfo
              ? `View deals shared with other partners as ${partnerInfo.name}`
              : 'View all transactions with shared referrals'}
          </p>
        </div>
        {partnerInfo && (
          <div className="flex items-center gap-2">
            {partnerInfo.logo_url ? (
              <img
                src={partnerInfo.logo_url}
                alt={partnerInfo.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Shared Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalShared}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With co-referrers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Deals Involved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.activeDeals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrencyTotals(summary.totalValueByCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Commitment value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Co-Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary.coPartners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Partner relationships
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
                  placeholder="Search by deal or investor name..."
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
              <Share2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No transactions match your filters'
                  : partnerInfo
                    ? 'No shared transactions yet'
                    : 'No shared transactions found'}
              </p>
              {partnerInfo && transactions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Shared transactions appear when you co-refer deals with other partners
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Your Share</TableHead>
                    <TableHead>Co-Referrer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tx.deal_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{tx.investor_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.partner_share === 100 ? 'default' : 'secondary'}>
                          {tx.partner_share}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.co_referrer_name ? (
                          <div className="flex items-center gap-1">
                            <Handshake className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{tx.co_referrer_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmountWithCurrency(tx.commitment_amount, tx.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.dispatched_at ? formatDate(tx.dispatched_at) : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_STYLES[tx.deal_status] || '')}
                        >
                          {tx.deal_status}
                        </Badge>
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
