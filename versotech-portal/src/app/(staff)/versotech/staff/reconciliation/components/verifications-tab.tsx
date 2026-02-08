'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MinusCircle,
  RefreshCw,
  FileCheck,
  Info
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Verification = {
  id: string
  bank_transaction_id: string
  subscription_id: string | null
  invoice_id: string | null
  deal_id: string | null
  matched_amount: number
  match_type: string
  match_confidence: number | null
  match_notes: string | null
  status: 'pending' | 'verified' | 'discrepancy' | 'ignored'
  discrepancy_type: string | null
  discrepancy_notes: string | null
  matched_at: string
  verified_at: string | null
  created_at: string
  bank_transactions: {
    id: string
    amount: number
    currency: string
    counterparty: string | null
    value_date: string | null
    bank_reference: string | null
    memo: string | null
    status: string
  } | null
  subscriptions: {
    id: string
    commitment: number
    funded_amount: number
    status: string
    currency: string
    investors: {
      id: string
      display_name: string | null
      legal_name: string | null
    } | null
  } | null
  invoices: {
    id: string
    invoice_number: string
    total: number
    paid_amount: number
    status: string
    currency: string
  } | null
  deals: {
    id: string
    name: string
  } | null
  matched_by_profile: {
    id: string
    email: string
    display_name: string | null
  } | null
  verified_by_profile: {
    id: string
    email: string
    display_name: string | null
  } | null
}

type Summary = {
  total: number
  pending: number
  verified: number
  discrepancy: number
  ignored: number
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: <Clock className="h-4 w-4" />
  },
  verified: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  discrepancy: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  ignored: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-200',
    icon: <MinusCircle className="h-4 w-4" />
  }
}

export function VerificationsTab() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, verified: 0, discrepancy: 0, ignored: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Resolve dialog state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [resolveStatus, setResolveStatus] = useState<'ignored' | 'discrepancy'>('ignored')
  const [resolveNotes, setResolveNotes] = useState('')
  const [resolving, setResolving] = useState(false)

  const loadVerifications = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/staff/reconciliation/verifications?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load verifications')

      const data = await response.json()
      setVerifications(data.data || [])
      setSummary(data.summary || { total: 0, pending: 0, verified: 0, discrepancy: 0, ignored: 0 })
    } catch (error) {
      console.error('Failed to load verifications:', error)
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadVerifications()
  }, [loadVerifications])

  const filteredVerifications = verifications.filter(v => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      v.bank_transactions?.counterparty?.toLowerCase().includes(searchLower) ||
      v.bank_transactions?.bank_reference?.toLowerCase().includes(searchLower) ||
      v.subscriptions?.investors?.display_name?.toLowerCase().includes(searchLower) ||
      v.subscriptions?.investors?.legal_name?.toLowerCase().includes(searchLower) ||
      v.deals?.name?.toLowerCase().includes(searchLower) ||
      v.invoices?.invoice_number?.toLowerCase().includes(searchLower)
    )
  })

  const handleOpenResolve = (verification: Verification) => {
    setSelectedVerification(verification)
    setResolveStatus('ignored')
    setResolveNotes('')
    setResolveDialogOpen(true)
  }

  const handleResolve = async () => {
    if (!selectedVerification) return

    setResolving(true)
    try {
      const response = await fetch(`/api/staff/reconciliation/verifications/${selectedVerification.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolveStatus,
          notes: resolveNotes
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resolve verification')
      }

      toast.success(`Verification marked as ${resolveStatus}`)
      setResolveDialogOpen(false)
      loadVerifications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve verification')
    } finally {
      setResolving(false)
    }
  }

  const getInvestorName = (v: Verification) => {
    if (v.subscriptions?.investors?.display_name) return v.subscriptions.investors.display_name
    if (v.subscriptions?.investors?.legal_name) return v.subscriptions.investors.legal_name
    return 'Unknown Investor'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading verifications...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100">Verification-Only Mode</p>
          <p className="text-blue-700 dark:text-blue-300 mt-0.5">
            Bank matches are recorded here for review. Status changes (subscription funded, invoice paid) only happen
            when a lawyer confirms funding via the escrow page. This ensures the lawyer&apos;s confirmation is the legal source of truth.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.pending}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.verified}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Verified</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.discrepancy}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Discrepancies</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{summary.ignored}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ignored</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by investor, deal, counterparty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="discrepancy">Discrepancy</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadVerifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Bank Match Verifications
          </CardTitle>
          <CardDescription>
            {filteredVerifications.length} verification{filteredVerifications.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No verifications found</p>
              <p className="text-sm mt-1">Bank matches will appear here after reconciliation</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank Transaction</TableHead>
                    <TableHead>Matched To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Matched By</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerifications.map((v) => {
                    const style = STATUS_STYLES[v.status] || STATUS_STYLES.pending
                    const bankTx = v.bank_transactions
                    const currency = bankTx?.currency || v.subscriptions?.currency || 'USD'

                    return (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('flex items-center gap-1 w-fit', style.bg, style.text)}
                          >
                            {style.icon}
                            <span className="capitalize">{v.status}</span>
                          </Badge>
                          {v.discrepancy_notes && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={v.discrepancy_notes}>
                              {v.discrepancy_notes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(bankTx?.amount || 0, currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bankTx?.counterparty || 'Unknown'}
                            </div>
                            {bankTx?.value_date && (
                              <div className="text-xs text-muted-foreground">
                                {formatDate(bankTx.value_date)}
                              </div>
                            )}
                            {bankTx?.bank_reference && (
                              <div className="text-xs font-mono text-muted-foreground truncate max-w-[150px]" title={bankTx.bank_reference}>
                                Ref: {bankTx.bank_reference}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{getInvestorName(v)}</div>
                            {v.deals?.name && (
                              <div className="text-xs text-muted-foreground">{v.deals.name}</div>
                            )}
                            {v.invoices?.invoice_number && (
                              <div className="text-xs text-muted-foreground">
                                Invoice: {v.invoices.invoice_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(v.matched_amount, currency)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {v.match_type} match
                          </div>
                          {v.match_confidence && (
                            <div className="text-xs text-muted-foreground">
                              {v.match_confidence}% confidence
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {v.matched_by_profile?.display_name || v.matched_by_profile?.email || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(v.matched_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {v.verified_by_profile ? (
                            <>
                              <div className="text-sm">
                                {v.verified_by_profile.display_name || v.verified_by_profile.email}
                              </div>
                              {v.verified_at && (
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(v.verified_at)}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not verified</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {v.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenResolve(v)}
                            >
                              Resolve
                            </Button>
                          )}
                          {v.status === 'discrepancy' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenResolve(v)}
                            >
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Verification</DialogTitle>
            <DialogDescription>
              Mark this verification as resolved. Use &quot;Ignored&quot; for non-applicable matches or
              &quot;Discrepancy&quot; for known issues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolveStatus} onValueChange={(v) => setResolveStatus(v as 'ignored' | 'discrepancy')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ignored">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-gray-500" />
                      Ignored - Not applicable
                    </div>
                  </SelectItem>
                  <SelectItem value="discrepancy">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Discrepancy - Known issue
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Explain why this verification is being resolved..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)} disabled={resolving}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolving}>
              {resolving ? 'Resolving...' : 'Resolve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
