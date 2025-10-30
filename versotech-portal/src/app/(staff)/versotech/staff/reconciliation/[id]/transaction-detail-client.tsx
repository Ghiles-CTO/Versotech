'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Check,
  X,
  Link as LinkIcon,
  Unlink,
  Clock,
  User,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  TrendingUp,
  History
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface TransactionDetailClientProps {
  transaction: any
  allSubscriptions: any[]
  staffProfile: any
}

export function TransactionDetailClient({
  transaction,
  allSubscriptions,
  staffProfile
}: TransactionDetailClientProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('')
  const [resolutionType, setResolutionType] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const matchedSubscription = transaction.subscriptions
  const suggestedMatches = transaction.suggested_matches || []

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      matched: { color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', icon: CheckCircle2, label: 'Matched' },
      unmatched: { color: 'bg-slate-800/50 text-slate-300 border-slate-700', icon: Clock, label: 'Unmatched' },
      resolved: { color: 'bg-blue-900/30 text-blue-300 border-blue-700', icon: CheckCircle2, label: 'Resolved' },
    }
    const variant = variants[status] || variants.unmatched
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} gap-1.5`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    )
  }

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
      router.push('/versotech/staff/reconciliation')
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
    if (!selectedSubscriptionId) {
      toast.error('Please select a subscription')
      return
    }

    setIsProcessing(true)
    try {
      // Create manual match by creating a suggested match with 100% confidence and accepting it
      const response = await fetch('/api/staff/reconciliation/match/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_transaction_id: transaction.id,
          subscription_id: selectedSubscriptionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create manual match')
      }

      toast.success('Manual match created successfully')
      router.push('/versotech/staff/reconciliation')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create manual match')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResolveDiscrepancy = async () => {
    if (!resolutionType) {
      toast.error('Please select a resolution type')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_transaction_id: transaction.id,
          resolution_type: resolutionType,
          notes: resolutionNotes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve discrepancy')
      }

      toast.success(data.message || 'Discrepancy resolved')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve discrepancy')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnmatch = async () => {
    if (!confirm('Are you sure you want to unmatch this transaction?')) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/unmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_transaction_id: transaction.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unmatch')
      }

      toast.success('Transaction unmatched successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unmatch')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex gap-2">
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
        {/* Left Column - Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Value Date</Label>
                  <div className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(transaction.value_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Counterparty</Label>
                <div className="text-lg font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {transaction.counterparty}
                </div>
              </div>

              {transaction.memo && (
                <div>
                  <Label className="text-muted-foreground">Memo / Description</Label>
                  <div className="text-sm text-foreground flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    {transaction.memo}
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Account Reference</Label>
                  <div className="text-sm font-mono text-foreground">{transaction.account_ref}</div>
                </div>
                {transaction.bank_reference && (
                  <div>
                    <Label className="text-muted-foreground">Bank Reference</Label>
                    <div className="text-sm font-mono text-foreground">{transaction.bank_reference}</div>
                  </div>
                )}
              </div>

              {transaction.discrepancy_amount && transaction.discrepancy_amount !== 0 && (
                <>
                  <Separator />
                  <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-amber-200">Discrepancy Detected</div>
                        <div className="text-sm text-amber-300 mt-1">
                          Amount difference: {formatCurrency(Math.abs(transaction.discrepancy_amount), transaction.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Matched Subscription */}
          {matchedSubscription && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-emerald-400" />
                    Matched Subscription
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnmatch}
                    disabled={isProcessing}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Unmatch
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Investor</Label>
                    <div className="text-lg font-medium text-foreground">
                      {matchedSubscription.investors?.legal_name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Vehicle</Label>
                    <div className="text-lg font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {matchedSubscription.vehicles?.name}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Commitment</Label>
                    <div className="text-sm font-semibold text-foreground">
                      {formatCurrency(matchedSubscription.commitment, matchedSubscription.currency)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Funded</Label>
                    <div className="text-sm font-semibold text-emerald-400">
                      {formatCurrency(matchedSubscription.funded_amount || 0, matchedSubscription.currency)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Subscription #</Label>
                    <div className="text-sm font-mono text-foreground">
                      {matchedSubscription.subscription_number}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Matches */}
          {suggestedMatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Suggested Matches ({suggestedMatches.length})
                </CardTitle>
                <CardDescription>
                  AI-powered matching suggestions based on name similarity, amount, and date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedMatches.map((match: any) => {
                  const sub = match.subscriptions
                  const confidence = match.confidence

                  return (
                    <div
                      key={match.id}
                      className="border border-white/10 rounded-lg p-4 bg-white/5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              confidence >= 80
                                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                                : confidence >= 60
                                ? 'bg-amber-900/30 text-amber-300 border-amber-700'
                                : 'bg-rose-900/30 text-rose-300 border-rose-700'
                            }>
                              {confidence}% match
                            </Badge>
                            <div className="text-xs text-muted-foreground">{match.match_reason}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <Label className="text-xs text-muted-foreground">Investor</Label>
                              <div className="font-medium text-foreground">{sub?.investors?.legal_name}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Vehicle</Label>
                              <div className="font-medium text-foreground">{sub?.vehicles?.name}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Commitment</Label>
                              <div className="font-medium text-foreground">
                                {formatCurrency(sub?.commitment || 0, sub?.currency)}
                              </div>
                            </div>
                            {match.amount_difference !== 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Amount Difference</Label>
                                <div className="font-medium text-amber-400">
                                  {formatCurrency(Math.abs(match.amount_difference), transaction.currency)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptSuggestedMatch(match.id)}
                            disabled={isProcessing}
                            className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectSuggestedMatch(match.id)}
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Manual Match */}
          {!matchedSubscription && transaction.status !== 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Match</CardTitle>
                <CardDescription>
                  Select a subscription to manually match this transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Subscription</Label>
                  <Select value={selectedSubscriptionId} onValueChange={setSelectedSubscriptionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subscription..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubscriptions.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.investors?.legal_name} - {sub.vehicles?.name} ({formatCurrency(sub.commitment, sub.currency)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleManualMatch}
                  disabled={!selectedSubscriptionId || isProcessing}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Create Manual Match
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resolve Discrepancy */}
          {transaction.discrepancy_amount && transaction.discrepancy_amount !== 0 && transaction.status !== 'resolved' && (
            <Card>
              <CardHeader>
                <CardTitle>Resolve Discrepancy</CardTitle>
                <CardDescription>
                  Document the reason for the amount difference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Resolution Type</Label>
                  <Select value={resolutionType} onValueChange={setResolutionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Fee">Bank Fee</SelectItem>
                      <SelectItem value="Wire Transfer Fee">Wire Transfer Fee</SelectItem>
                      <SelectItem value="Currency Conversion">Currency Conversion</SelectItem>
                      <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                      <SelectItem value="Amount Error">Amount Error</SelectItem>
                      <SelectItem value="Duplicate Entry">Duplicate Entry</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Explain the discrepancy..."
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleResolveDiscrepancy}
                  disabled={!resolutionType || isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Imported</Label>
                <div className="text-foreground">{formatDate(transaction.created_at)}</div>
              </div>

              {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <div className="text-foreground">{formatDate(transaction.updated_at)}</div>
                </div>
              )}

              {transaction.resolved_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolved</Label>
                  <div className="text-foreground">{formatDate(transaction.resolved_at)}</div>
                </div>
              )}

              {transaction.resolution_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution Notes</Label>
                  <div className="text-sm text-foreground bg-blue-900/20 border border-blue-700/50 rounded p-2 mt-1">
                    {transaction.resolution_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
