'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  DollarSign
} from 'lucide-react'
import { TransactionsDataTable } from './transactions-data-table'
import { transactionColumns, BankTransactionRow } from './transaction-columns'
import { UploadCSVDialog, AutoMatchButton } from '@/components/staff/reconciliation-client'
import { toast } from 'sonner'

export function ReconciliationPageClient() {
  const router = useRouter()

  const [rawData, setRawData] = useState<BankTransactionRow[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [quickSearch, setQuickSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/reconciliation')
      if (!response.ok) throw new Error('Failed to load transactions')

      const data = await response.json()
      setRawData(data.transactions || [])
      setStats(data.stats || {})
    } catch (err) {
      console.error('Load error:', err)
      toast.error('Failed to load reconciliation data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/staff/reconciliation')
      if (!response.ok) throw new Error('Failed to refresh')

      const data = await response.json()
      setRawData(data.transactions || [])
      setStats(data.stats || {})
      toast.success('Data refreshed')
    } catch (err) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!rawData || rawData.length === 0) return []

    let result = rawData

    if (quickSearch) {
      const search = quickSearch.toLowerCase()
      result = result.filter(txn => {
        const searchable = [
          txn.counterparty,
          txn.memo,
          txn.bank_reference,
          txn.account_ref,
          txn.subscriptions?.investors?.legal_name,
          txn.subscriptions?.vehicles?.name,
        ].filter(Boolean).join(' ').toLowerCase()
        return searchable.includes(search)
      })
    }

    if (statusFilter) {
      result = result.filter(txn => txn.status === statusFilter)
    }

    return result
  }, [rawData, quickSearch, statusFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Loading reconciliation data...</div>
        </div>
      </div>
    )
  }

  const matchRate = stats?.total > 0 ? Math.round((stats.matched / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bank Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            Import bank transactions and match with investor subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <UploadCSVDialog />
          <AutoMatchButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Match Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-200">{matchRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats?.matched || 0} of {stats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Matched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-200">{stats?.matched || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrency(stats?.matchedAmount || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unmatched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-200">{stats?.unmatched || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrency(stats?.unmatchedAmount || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              With Discrepancies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-200">{stats?.withDiscrepancies || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Need resolution</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Suggested Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-200">{stats?.suggestedMatchesCount || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Ready for review</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                {filteredTransactions.length !== rawData.length && ` (filtered from ${rawData.length})`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by counterparty, investor, vehicle, reference..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'unmatched' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('unmatched')}
              >
                Unmatched
              </Button>
              <Button
                variant={statusFilter === 'matched' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('matched')}
              >
                Matched
              </Button>
              <Button
                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('resolved')}
              >
                Resolved
              </Button>
            </div>
          </div>

          {/* DataTable */}
          <TransactionsDataTable
            columns={transactionColumns}
            data={filteredTransactions}
            pageSize={25}
          />
        </CardContent>
      </Card>
    </div>
  )
}
