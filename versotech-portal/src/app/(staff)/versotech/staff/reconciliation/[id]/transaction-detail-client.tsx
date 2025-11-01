'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Link as LinkIcon,
  Unlink,
  Clock,
  User,
  DollarSign,
  Calendar,
  FileText,
  Building2
} from 'lucide-react'

interface TransactionDetailClientProps {
  transaction: any
  openInvoices: any[]
  staffProfile: any
}

type NumericLike = number | string | null | undefined

const TOLERANCE = 0.01

const toNumber = (value: NumericLike): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const formatCurrency = (amount: number, currency: string = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

const getStatusBadge = (status: string) => {
  const variants: Record<string, { color: string; label: string }> = {
    matched: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', label: 'Matched' },
    partially_matched: { color: 'bg-amber-900/30 text-amber-300 border-amber-700', label: 'Partially Matched' },
    unmatched: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', label: 'Unmatched' }
  }

  const variant = variants[status] || variants.unmatched
  return (
    <Badge className={`${variant.color} gap-1.5`}>
      <CheckCircle2 className="h-3 w-3" />
      {variant.label}
    </Badge>
  )
}

export function TransactionDetailClient({ transaction, openInvoices, staffProfile }: TransactionDetailClientProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('')
  const [manualAmount, setManualAmount] = useState<string>('')
  const [manualNotes, setManualNotes] = useState<string>('')

  const matches = useMemo(() => (transaction.matches || []) as any[], [transaction])
  const suggestions = useMemo(() => (transaction.suggestions || []) as any[], [transaction])

  const matchedAmount = useMemo(
    () => matches.reduce((sum, match) => sum + toNumber(match.matched_amount), 0),
    [matches]
  )

  const transactionAmount = toNumber(transaction.amount)
  const remainingAmount = Math.max(transactionAmount - matchedAmount, 0)

  const selectedInvoice = useMemo(
    () => openInvoices.find(invoice => invoice.id === selectedInvoiceId) || null,
    [openInvoices, selectedInvoiceId]
  )

  useEffect(() => {
    if (!selectedInvoice) {
      setManualAmount('')
      return
    }

    const invoiceBalance = selectedInvoice.balance_due !== null && selectedInvoice.balance_due !== undefined
      ? toNumber(selectedInvoice.balance_due)
      : Math.max(toNumber(selectedInvoice.total) - toNumber(selectedInvoice.paid_amount), 0)

    const defaultAmount = Math.min(invoiceBalance, remainingAmount)
    setManualAmount(defaultAmount > TOLERANCE ? defaultAmount.toFixed(2) : '')
  }, [selectedInvoice, remainingAmount])

  const handleAcceptSuggestedMatch = async (suggestedMatchId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/match/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggested_match_id: suggestedMatchId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept match')
      }

      toast.success(data.message || 'Match accepted')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept match')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectSuggestedMatch = async (suggestedMatchId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/match/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggested_match_id: suggestedMatchId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject match')
      }

      toast.success(data.message || 'Match rejected')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject match')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualMatch = async () => {
    if (!selectedInvoiceId) {
      toast.error('Please select an invoice')
      return
    }

    const payload: Record<string, any> = {
      bank_transaction_id: transaction.id,
      invoice_id: selectedInvoiceId
    }

    if (manualAmount) {
      const numericAmount = parseFloat(manualAmount)
      if (Number.isNaN(numericAmount) || numericAmount <= 0) {
        toast.error('Enter a valid match amount')
        return
      }
      payload.matched_amount = numericAmount
    }

    if (manualNotes.trim()) {
      payload.notes = manualNotes.trim()
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/match/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create manual match')
      }

      toast.success('Manual match created successfully')
      setSelectedInvoiceId('')
      setManualNotes('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create manual match')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnmatch = async (matchId?: string) => {
    const confirmationMessage = matchId
      ? 'Unmatch this invoice from the transaction?'
      : 'Unmatch all invoices from this transaction?'

    if (!confirm(confirmationMessage)) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/unmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_transaction_id: transaction.id, match_id: matchId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unmatch transaction')
      }

      toast.success(data.message || 'Unmatched successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unmatch transaction')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderMatchCard = (match: any) => {
    const invoice = match.invoices
    const currency = invoice?.currency || transaction.currency || 'USD'
    const invoiceNumber = invoice?.invoice_number || invoice?.id?.slice(0, 8)
    const investor = invoice?.investor?.legal_name
    const dealName = invoice?.deal?.name

    return (
      <Card key={match.id} className="border-emerald-800/40 bg-emerald-950/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="h-4 w-4 text-emerald-300" />
              {invoiceNumber}
            </CardTitle>
            <CardDescription>
              {investor || 'Investor'} {dealName ? `• ${dealName}` : ''}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-300 hover:text-rose-200"
            onClick={() => handleUnmatch(match.id)}
            disabled={isProcessing}
          >
            <Unlink className="h-4 w-4 mr-2" />
            Unmatch
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Matched Amount</Label>
            <div className="text-sm font-semibold text-foreground">
              {formatCurrency(toNumber(match.matched_amount), currency)}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Invoice Total</Label>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(toNumber(invoice?.total), currency)}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Status</Label>
            <div className="text-xs capitalize text-emerald-200">
              {match.match_type.replace('_', ' ')}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Reason</Label>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {match.match_reason || 'Manual reconciliation'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSuggestionCard = (suggestion: any) => {
    const invoice = suggestion.invoices
    const currency = invoice?.currency || transaction.currency || 'USD'
    const invoiceNumber = invoice?.invoice_number || invoice?.id?.slice(0, 8)
    const investor = invoice?.investor?.legal_name
    const dealName = invoice?.deal?.name

    return (
      <Card key={suggestion.id} className="border-amber-800/40 bg-amber-950/10">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-amber-300" />
              {invoiceNumber}
            </span>
            {suggestion.confidence !== null && suggestion.confidence !== undefined && (
              <Badge className={
                suggestion.confidence >= 80
                  ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                  : suggestion.confidence >= 60
                  ? 'bg-amber-900/30 text-amber-300 border-amber-700'
                  : 'bg-rose-900/30 text-rose-300 border-rose-700'
              }>
                {suggestion.confidence}% confidence
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {investor || 'Investor'} {dealName ? `• ${dealName}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Invoice Total</Label>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(toNumber(invoice?.total), currency)}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Balance Due</Label>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(
                  invoice?.balance_due !== undefined && invoice?.balance_due !== null
                    ? toNumber(invoice.balance_due)
                    : Math.max(toNumber(invoice?.total) - toNumber(invoice?.paid_amount), 0),
                  currency
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Suggested Reason</Label>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {suggestion.match_reason}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAcceptSuggestedMatch(suggestion.id)}
              disabled={isProcessing}
            >
              <Check className="h-4 w-4 mr-2" /> Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRejectSuggestedMatch(suggestion.id)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech/staff/reconciliation">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transaction Details</h1>
            <p className="text-muted-foreground mt-1">
              {transaction.bank_reference || transaction.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {getStatusBadge(transaction.status)}
          {transaction.match_confidence && (
            <Badge className={
              transaction.match_confidence >= 80
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                : transaction.match_confidence >= 60
                ? 'bg-amber-900/30 text-amber-300 border-amber-700'
                : 'bg-rose-900/30 text-rose-300 border-rose-700'
            }>
              {transaction.match_confidence}% confidence
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Amount</Label>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(transactionAmount, transaction.currency)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Value Date</Label>
                  <div className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(transaction.value_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Counterparty</Label>
                  <div className="text-lg font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {transaction.counterparty || '—'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Remaining Amount</Label>
                  <div className="text-lg font-medium text-amber-200">
                    {remainingAmount > TOLERANCE
                      ? formatCurrency(remainingAmount, transaction.currency)
                      : 'Fully allocated'}
                  </div>
                </div>
              </div>

              {transaction.memo && (
                <div>
                  <Label className="text-muted-foreground text-xs">Memo</Label>
                  <div className="text-sm text-foreground flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    {transaction.memo}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Account Reference</Label>
                  <div className="text-sm font-mono text-foreground">{transaction.account_ref || '—'}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Bank Reference</Label>
                  <div className="text-sm font-mono text-foreground">{transaction.bank_reference || '—'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-emerald-300" />
                  Approved Matches
                </CardTitle>
                <CardDescription>
                  {matches.length > 0
                    ? `${matches.length} invoice${matches.length === 1 ? '' : 's'} matched`
                    : 'No invoices matched yet'}
                </CardDescription>
              </div>
              {matches.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnmatch()}
                  disabled={isProcessing}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Unmatch All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No matches yet. Accept a suggestion or create a manual match.
                </div>
              )}
              {matches.map(renderMatchCard)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-300" />
                Suggested Matches
              </CardTitle>
              <CardDescription>
                {suggestions.length > 0
                  ? 'Review and accept high-confidence matches'
                  : 'No pending suggestions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Auto-matching has not produced any suggestions for this transaction.
                </div>
              )}
              {suggestions.map(renderSuggestionCard)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Match</CardTitle>
              <CardDescription>
                Link this transaction to an invoice that still has an outstanding balance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                <Select
                  value={selectedInvoiceId}
                  onValueChange={value => setSelectedInvoiceId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {openInvoices.length === 0 && (
                      <SelectItem value="" disabled>
                        No open invoices available
                      </SelectItem>
                    )}
                    {openInvoices.map(invoice => {
                      const currency = invoice.currency || transaction.currency || 'USD'
                      const balance = invoice.balance_due !== null && invoice.balance_due !== undefined
                        ? toNumber(invoice.balance_due)
                        : Math.max(toNumber(invoice.total) - toNumber(invoice.paid_amount), 0)
                      return (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number || invoice.id.slice(0, 8)} • {invoice.investor?.legal_name || 'Investor'} • {formatCurrency(balance, currency)} due
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Match Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder={remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00'}
                />
                <p className="text-xs text-muted-foreground">
                  Remaining transaction amount: {formatCurrency(remainingAmount, transaction.currency)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Document any context for this manual match"
                  rows={3}
                />
              </div>

              <Button onClick={handleManualMatch} disabled={isProcessing || !selectedInvoiceId} className="w-full">
                <Check className="h-4 w-4 mr-2" /> Create Manual Match
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reconciliation Summary</CardTitle>
              <CardDescription>Overview of this transaction's allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total matched</span>
                <span className="font-medium text-emerald-200">{formatCurrency(matchedAmount, transaction.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium text-amber-200">{formatCurrency(remainingAmount, transaction.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Matches created by</span>
                <span className="font-medium text-foreground">{staffProfile?.displayName || 'Staff'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
