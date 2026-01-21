'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { TransactionsDataTable } from './transactions-data-table'
import { transactionColumns, BankTransactionRow } from './transaction-columns'
import { InvoicesDataTable } from './invoices-data-table'
import { invoiceColumns, ReconciliationInvoiceRow } from './invoice-columns'
import { UploadCSVDialog, AutoMatchButton } from '@/components/staff/reconciliation-client'
import { toast } from 'sonner'

export function ReconciliationPageClient() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions')

  const [rawData, setRawData] = useState<BankTransactionRow[]>([])
  const [stats, setStats] = useState<any>(null)
  const [invoices, setInvoices] = useState<ReconciliationInvoiceRow[]>([])
  const [invoiceStats, setInvoiceStats] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [quickSearch, setQuickSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadData()
    loadInvoices()
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

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/staff/reconciliation/invoices')
      if (!response.ok) throw new Error('Failed to load invoices')

      const data = await response.json()
      setInvoices(data.invoices || [])
      setInvoiceStats(data.stats || {})
    } catch (err) {
      console.error('Invoice load error:', err)
      toast.error('Failed to load invoices')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetch('/api/staff/reconciliation').then(async (response) => {
          if (!response.ok) throw new Error('Failed to refresh transactions')
          const data = await response.json()
          setRawData(data.transactions || [])
          setStats(data.stats || {})
        }),
        fetch('/api/staff/reconciliation/invoices').then(async (response) => {
          if (!response.ok) throw new Error('Failed to refresh invoices')
          const data = await response.json()
          setInvoices(data.invoices || [])
          setInvoiceStats(data.stats || {})
        })
      ])
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
        const matchTerms = (txn.matches || []).flatMap(match => {
          const invoice = match.invoices
          return [
            invoice?.invoice_number,
            invoice?.investor?.legal_name,
            invoice?.deal?.name
          ]
        })
        const suggestionTerms = (txn.suggestions || []).flatMap(suggestion => {
          const invoice = suggestion.invoices
          return [
            invoice?.invoice_number,
            invoice?.investor?.legal_name,
            invoice?.deal?.name
          ]
        })

        const searchable = [
          txn.counterparty,
          txn.memo,
          txn.bank_reference,
          txn.account_ref,
          ...matchTerms,
          ...suggestionTerms
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(search)
      })
    }

    if (statusFilter) {
      result = result.filter(txn => txn.status === statusFilter)
    }

    return result
  }, [rawData, quickSearch, statusFilter])

  const filteredInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return []

    let result = invoices

    if (quickSearch) {
      const search = quickSearch.toLowerCase()
      result = result.filter(inv => {
        const searchable = [
          inv.invoice_number,
          inv.investor?.legal_name,
          inv.deal?.name
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(search)
      })
    }

    if (statusFilter) {
      // For invoices, statusFilter can be payment status or match status
      if (['paid', 'partially_paid', 'sent', 'overdue', 'draft'].includes(statusFilter)) {
        result = result.filter(inv => inv.status === statusFilter)
      } else if (['matched', 'partially_matched', 'unmatched'].includes(statusFilter)) {
        result = result.filter(inv => inv.match_status === statusFilter)
      }
    }

    return result
  }, [invoices, quickSearch, statusFilter])

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
  const partialRemainingAmount = rawData
    .filter(txn => txn.status === 'partially_matched')
    .reduce((sum, txn) => {
      const remaining = typeof txn.remaining_amount === 'number'
        ? txn.remaining_amount
        : Math.max((txn.amount || 0) - (txn.matched_amount_total || 0), 0)
      return sum + remaining
    }, 0)

  const currentStats = activeTab === 'transactions' ? stats : invoiceStats
  const currentData = activeTab === 'transactions' ? filteredTransactions : filteredInvoices

  // Summary stats based on filtered data (for the summary section)
  const filteredSummary = useMemo(() => {
    const txns = filteredTransactions
    const total = txns.length
    const matched = txns.filter(t => t.status === 'matched').length
    const partiallyMatched = txns.filter(t => t.status === 'partially_matched').length
    const unmatched = txns.filter(t => t.status === 'unmatched').length

    const totalAmount = txns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const matchedAmount = txns.reduce((sum, t) => sum + (Number(t.matched_amount_total) || 0), 0)
    const unmatchedAmount = txns
      .filter(t => t.status === 'unmatched')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const outstandingAmount = totalAmount - matchedAmount

    const matchPercentage = total > 0 ? Math.round((matched / total) * 100) : 0

    return {
      total,
      matched,
      partiallyMatched,
      unmatched,
      totalAmount,
      matchedAmount,
      unmatchedAmount,
      outstandingAmount,
      matchPercentage
    }
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bank Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            Import bank transactions and match payments to fee invoices
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

      {/* Reconciliation Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Reconciliation Summary
              </CardTitle>
              <CardDescription className="mt-1">
                Overall reconciliation status
                {(quickSearch || statusFilter) && (
                  <span className="text-amber-400 ml-2">(filtered view)</span>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">{filteredSummary.matchPercentage}%</div>
              <div className="text-sm text-muted-foreground">Match Rate</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Matching Progress</span>
              <span className="text-foreground font-medium">
                {filteredSummary.matched} of {filteredSummary.total} transactions
              </span>
            </div>
            <Progress value={filteredSummary.matchPercentage} className="h-3" />
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
                <div className="text-lg font-bold text-amber-200">{formatCurrency(filteredSummary.outstandingAmount)}</div>
                <div className="text-xs text-muted-foreground">{filteredSummary.unmatched + filteredSummary.partiallyMatched} transactions</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Matched</div>
                <div className="text-lg font-bold text-emerald-200">{formatCurrency(filteredSummary.matchedAmount)}</div>
                <div className="text-xs text-muted-foreground">{filteredSummary.matched} transactions</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <AlertCircle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Unmatched</div>
                <div className="text-lg font-bold text-rose-200">{formatCurrency(filteredSummary.unmatchedAmount)}</div>
                <div className="text-xs text-muted-foreground">{filteredSummary.unmatched} transactions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'transactions' | 'invoices')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transactions ({rawData.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fee Invoices ({invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
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
              <AlertCircle className="h-4 w-4" />
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-200">{stats?.partiallyMatched || stats?.partially_matched || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrency(partialRemainingAmount || 0)}
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
            <div className="text-2xl font-bold text-rose-200">{stats?.unmatched || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrency(stats?.unmatchedAmount || 0)}
            </div>
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

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
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
                    placeholder="Search by counterparty, invoice, investor, reference..."
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
                    variant={statusFilter === 'partially_matched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('partially_matched')}
                  >
                    Partial
                  </Button>
                  <Button
                    variant={statusFilter === 'matched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('matched')}
                  >
                    Matched
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
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Fee Invoices</CardTitle>
                  <CardDescription>
                    {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
                    {filteredInvoices.length !== invoices.length && ` (filtered from ${invoices.length})`}
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
                    placeholder="Search by invoice number, investor, deal..."
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
                    variant={statusFilter === 'sent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('sent')}
                  >
                    Sent
                  </Button>
                  <Button
                    variant={statusFilter === 'partially_paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('partially_paid')}
                  >
                    Partial
                  </Button>
                  <Button
                    variant={statusFilter === 'paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('paid')}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={statusFilter === 'matched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('matched')}
                  >
                    Matched
                  </Button>
                  <Button
                    variant={statusFilter === 'unmatched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('unmatched')}
                  >
                    Unmatched
                  </Button>
                </div>
              </div>

              {/* DataTable */}
              <InvoicesDataTable
                columns={invoiceColumns}
                data={filteredInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
