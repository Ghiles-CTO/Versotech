'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  Loader2,
  Download,
  Filter,
  RefreshCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

// Types
type Commission = {
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
  entity_id: string
  entity_name: string
  entity_email: string | null
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

type Entity = {
  id: string
  name: string
}

type Deal = {
  id: string
  name: string
}

interface CommissionTabProps {
  type: 'introducer' | 'partner' | 'commercial_partner'
  entities: Entity[]
  deals: Deal[]
  apiEndpoint: string
  entityLabel: string
  entityPlural: string
}

const STATUS_STYLES: Record<string, string> = {
  accrued: 'bg-blue-100 text-blue-800',
  invoice_requested: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAGE_SIZE = 50
const ALL_VALUE = '__all__' // Radix UI doesn't allow empty string as SelectItem value

export function CommissionTab({
  type,
  entities,
  deals,
  apiEndpoint,
  entityLabel,
  entityPlural,
}: CommissionTabProps) {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [entityId, setEntityId] = useState<string>('')
  const [dealId, setDealId] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Active filters count
  const activeFiltersCount = [fromDate, toDate, entityId, dealId, status].filter(Boolean).length

  // Fetch report
  const fetchReport = useCallback(async (resetPage = false) => {
    setLoading(true)
    setError(null)
    if (resetPage) setPage(1)

    try {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      if (entityId) {
        params.append(
          type === 'introducer' ? 'introducer_id' :
          type === 'partner' ? 'partner_id' : 'commercial_partner_id',
          entityId
        )
      }
      if (dealId) params.append('deal_id', dealId)
      if (status) params.append('status', status)
      params.append('limit', String(PAGE_SIZE))
      params.append('offset', String((resetPage ? 0 : (page - 1)) * PAGE_SIZE))

      const response = await fetch(`${apiEndpoint}?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch report')
      }

      const result = await response.json()

      // Transform entity fields based on type
      const transformedData = (result.data || []).map((c: any) => ({
        ...c,
        entity_id: c[`${type}_id`] || c.entity_id,
        entity_name: c[`${type}_name`] || c.entity_name || c.introducer_name || c.partner_name || c.commercial_partner_name,
        entity_email: c[`${type}_email`] || c.entity_email || c.introducer_email || c.partner_email || c.commercial_partner_email,
      }))

      setCommissions(transformedData)
      setSummary(result.summary || null)
      setTotalCount(result.pagination?.total || result.data?.length || 0)
    } catch (err) {
      console.error(`[CommissionTab:${type}] Error:`, err)
      setError(err instanceof Error ? err.message : 'Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, type, fromDate, toDate, entityId, dealId, status, page])

  // Export CSV
  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (fromDate) params.append('from_date', fromDate)
      if (toDate) params.append('to_date', toDate)
      if (entityId) {
        params.append(
          type === 'introducer' ? 'introducer_id' :
          type === 'partner' ? 'partner_id' : 'commercial_partner_id',
          entityId
        )
      }
      if (dealId) params.append('deal_id', dealId)
      if (status) params.append('status', status)
      params.append('format', 'csv')

      const link = document.createElement('a')
      link.href = `${apiEndpoint}?${params.toString()}`
      link.download = `${type}_reconciliation_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setTimeout(() => setExporting(false), 1000)
    }
  }

  // Clear filters
  const handleClearFilters = () => {
    setFromDate('')
    setToDate('')
    setEntityId('')
    setDealId('')
    setStatus('')
    setPage(1)
  }

  // Date validation
  const isDateRangeValid = !fromDate || !toDate || new Date(fromDate) <= new Date(toDate)

  // Load report on mount
  useEffect(() => {
    fetchReport(true)
  }, []) // Only on mount

  // Refetch when page changes (not on initial load)
  useEffect(() => {
    if (page > 1) {
      fetchReport(false)
    }
  }, [page])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => fetchReport(true)}
                disabled={loading || !isDateRangeValid}
              >
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
                max={toDate || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
              />
              {!isDateRangeValid && (
                <p className="text-xs text-destructive">End date must be after start date</p>
              )}
            </div>

            {/* Entity Filter */}
            <div className="space-y-2">
              <Label>{entityLabel}</Label>
              <Select
                value={entityId || ALL_VALUE}
                onValueChange={(v) => setEntityId(v === ALL_VALUE ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`All ${entityPlural.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All {entityPlural.toLowerCase()}</SelectItem>
                  {entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal Filter */}
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select
                value={dealId || ALL_VALUE}
                onValueChange={(v) => setDealId(v === ALL_VALUE ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All deals</SelectItem>
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
              <Select
                value={status || ALL_VALUE}
                onValueChange={(v) => setStatus(v === ALL_VALUE ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
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

      {/* Summary - Now includes all 5 statuses */}
      {summary && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting || commissions.length === 0}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
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
              {/* FIXED: Added Invoice Requested summary card */}
              <div className="text-center p-3 rounded-lg bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.by_status.invoice_requested.amount, summary.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Invoice Req. ({summary.by_status.invoice_requested.count})
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

      {/* Error with Retry */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" onClick={() => fetchReport(true)}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table with Pagination */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Commission Details</CardTitle>
              <CardDescription>
                {commissions.length} of {totalCount} records
                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                {activeFiltersCount > 0
                  ? `No commissions match your filters. Try adjusting or clearing filters.`
                  : `No ${entityPlural.toLowerCase()} commissions found yet.`}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* FIXED: Added overflow-x-auto for mobile */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>{entityLabel}</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead>Basis</TableHead>
                      <TableHead className="text-right">Rate (%)</TableHead>
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
                            <div className="font-medium text-sm">{commission.entity_name}</div>
                            {commission.entity_email && (
                              <div className="text-xs text-muted-foreground">{commission.entity_email}</div>
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
                          {commission.basis_type?.replace('_', ' ') || '-'}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <span className="text-sm font-medium">{page}</span>
                      <span className="text-sm text-muted-foreground">of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
