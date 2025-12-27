'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, AlertTriangle, TrendingDown, Info, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SellPositionFormProps {
  subscriptionId: string
  vehicleName: string
  fundedAmount: number
  currency: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SellPositionForm({
  subscriptionId,
  vehicleName,
  fundedAmount,
  currency,
  onSuccess,
  onCancel
}: SellPositionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [askingPrice, setAskingPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Calculate percentage of position being sold
  const amountValue = parseFloat(amount) || 0
  const sellPercentage = fundedAmount > 0 ? (amountValue / fundedAmount) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Quick sell percentage buttons
  const handleQuickPercent = (percent: number) => {
    const value = (fundedAmount * percent) / 100
    setAmount(value.toFixed(2))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!amount || amountValue <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountValue > fundedAmount) {
      setError(`Amount cannot exceed your position value of ${formatCurrency(fundedAmount)}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/investor/sell-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          amount_to_sell: amountValue,
          asking_price_per_unit: askingPrice ? parseFloat(askingPrice) : undefined,
          notes: notes || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Sale request submitted successfully')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/versotech_main/portfolio')
        router.refresh()
      }
    } catch (err) {
      console.error('Submit error:', err)
      const message = err instanceof Error ? err.message : 'Failed to submit request'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Position Summary */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/50">
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg tracking-tight">Sell Position</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {vehicleName}
            </p>
          </div>
        </div>

        {/* Position Value Display */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Position Value</span>
            <span className="text-xl font-semibold tabular-nums tracking-tight">
              {formatCurrency(fundedAmount)}
            </span>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Warning Alert */}
        <Alert className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
            Sale requests are subject to review and buyer matching.
            The process typically takes 2-4 weeks.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Amount to Sell */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount to Sell
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currency || 'USD'}
            </span>
          </div>

          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={fundedAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={loading}
              className="text-lg h-12 pr-20 font-medium tabular-nums"
            />
            {amountValue > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                <Percent className="h-3 w-3" />
                <span className="tabular-nums">{sellPercentage.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Quick Percentage Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPercent(percent)}
                disabled={loading}
                className={cn(
                  "flex-1 text-xs h-8 transition-all",
                  sellPercentage === percent && "bg-primary/5 border-primary/30 text-primary"
                )}
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* Asking Price (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="askingPrice" className="text-sm font-medium">
              Asking Price per Unit
            </Label>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              OPTIONAL
            </span>
          </div>
          <Input
            id="askingPrice"
            type="number"
            step="0.0001"
            min="0"
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
            placeholder="Leave blank for market price"
            disabled={loading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            If not specified, current market valuation will be used
          </p>
        </div>

        {/* Notes (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes
            </Label>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              OPTIONAL
            </span>
          </div>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requirements or context for your request..."
            rows={3}
            maxLength={1000}
            disabled={loading}
            className="resize-none"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {notes.length}/1000
            </span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Summary before submit */}
        {amountValue > 0 && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Request Summary
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Selling</span>
              <span className="font-semibold tabular-nums">{formatCurrency(amountValue)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">of position</span>
              <span className="text-sm tabular-nums">{sellPercentage.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || amountValue <= 0}
            className="flex-1 h-11 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Sale Request'
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="h-11"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
