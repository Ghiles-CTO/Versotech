'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Loader2, Download, Filter, RefreshCcw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type ReconciliationCommission = {
  id: string
  status: string
  basis_type: string
  rate_bps: number
  base_amount: number | null
  accrual_amount: number
  currency: string
  invoice_id: string | null
  paid_at: string | null
  payment_due_date: string | null
  payment_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
  introducer_id: string
  introducer_name: string
  introducer_email: string | null
  deal_id: string
  deal_name: string
  deal_company: string | null
  investor_id: string | null
  investor_name: string | null
  fee_plan_id: string | null
  fee_plan_name: string | null
}

type Summary = {
  total_count: number
  total_amount: number
  by_status: {
    accrued: { count: number; amount: number }
    invoice_requested: { count: number; amount: number }
    invoiced: { count: number; amount: number }
    paid: { count: number; amount: number }
    cancelled: { count: number; amount: number }
  }
  currency: string
}

type Introducer = {
  id: string
  legal_name: string
}

type Deal = {
  id: string
  name: string
}

interface ReconciliationReportProps {
  introducers?: Introducer[]
  deals?: Deal[]
}

const STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800',
  invoice_requested: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function ReconciliationReport({
  introducers = [],
  deals = [],
}: ReconciliationReportProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commissions, setCommissions] = useState<ReconciliationCommission[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  // Filter state
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [introducerId, setIntroducerId] = useState<string>('')
  const [dealId, setDealId] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const fetchReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      if (introducerId) params.append('introducer_id', introducerId)
      if (dealId) params.append('deal_id', dealId)
      if (status) params.append('status', status)

      const response = await fetch(
        `/api/arrangers/me/reports/introducer-reconciliation?${params.toString()}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch report')
      }

      const result = await response.json()
      setCommissions(result.data || [])
      setSummary(result.summary || null)
    } catch (err) {
      console.error('[ReconciliationReport] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    const params = new URLSearchParams()
    if (fromDate) params.append('from_date', fromDate)
    if (toDate) params.append('to_date', toDate)
    if (introducerId) params.append('introducer_id', introducerId)
    if (dealId) params.append('deal_id', dealId)
    if (status) params.append('status', status)
    params.append('format', 'csv')

    // Trigger download
    const link = document.createElement('a')
    link.href = `/api/arrangers/me/reports/introducer-reconciliation?${params.toString()}`
    link.download = 'introducer_reconciliation.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearFilters = () => {
    setFromDate('')
    setToDate('')
    setIntroducerId('')
    setDealId('')
    setStatus('')
  }

  // Load report on mount and when filters change
  useEffect(() => {
    fetchReport()
  }, [])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter the reconciliation report</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear
              </Button>
              <Button size="sm" onClick={fetchReport} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                <span className="ml-2">Apply</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Introducer Filter */}
            <div className="space-y-2">
              <Label>Introducer</Label>
              <Select value={introducerId} onValueChange={setIntroducerId}>
                <SelectTrigger>
                  <SelectValue placeholder="All introducers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All introducers</SelectItem>
                  {introducers.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal Filter */}
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select value={dealId} onValueChange={setDealId}>
                <SelectTrigger>
                  <SelectValue placeholder="All deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All deals</SelectItem>
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="accrued">Accrued</SelectItem>
                  <SelectItem value="invoice_requested">Invoice Requested</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Summary</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{summary.total_count}</div>
                <div className="text-xs text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(summary.total_amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">Total Amount</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.by_status.accrued.amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Accrued ({summary.by_status.accrued.count})
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.by_status.invoiced.amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Invoiced ({summary.by_status.invoiced.count})
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.by_status.paid.amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Paid ({summary.by_status.paid.count})
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.by_status.cancelled.amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cancelled ({summary.by_status.cancelled.count})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Commission Details</CardTitle>
          <CardDescription>
            {commissions.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commissions found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Introducer</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid At</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs capitalize', STATUS_STYLES[commission.status])}
                        >
                          {commission.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{commission.introducer_name}</div>
                          {commission.introducer_email && (
                            <div className="text-xs text-muted-foreground">{commission.introducer_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{commission.deal_name || '-'}</div>
                          {commission.deal_company && (
                            <div className="text-xs text-muted-foreground">{commission.deal_company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {commission.basis_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {(commission.rate_bps / 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(commission.accrual_amount, commission.currency)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {commission.payment_due_date ? formatDate(commission.payment_due_date) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {commission.paid_at ? formatDate(commission.paid_at) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(commission.created_at)}
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
