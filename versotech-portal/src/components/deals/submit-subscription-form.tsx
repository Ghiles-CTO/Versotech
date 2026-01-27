'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { EntitySelector } from '@/components/subscriptions/entity-selector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface DealCapacityInfo {
  target_raise: number | null
  min_ticket: number | null
  max_ticket: number | null
  total_subscribed: number
  subscription_count: number
}

interface SubmitSubscriptionFormProps {
  dealId: string
  currency: string
  existingSubmission: {
    id: string
    status: string
    submitted_at: string
    payload_json: Record<string, any>
  } | null
}

export function SubmitSubscriptionForm({ dealId, currency, existingSubmission }: SubmitSubscriptionFormProps) {
  const [amount, setAmount] = useState('')
  const [bankConfirmation, setBankConfirmation] = useState(false)
  const [notes, setNotes] = useState('')
  const [entitySelection, setEntitySelection] = useState<{
    subscription_type: 'personal' | 'entity'
    counterparty_entity_id?: string | null
  }>({
    subscription_type: 'personal',
    counterparty_entity_id: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dealCapacity, setDealCapacity] = useState<DealCapacityInfo | null>(null)
  const [loadingCapacity, setLoadingCapacity] = useState(true)

  // Fetch deal capacity information
  useEffect(() => {
    async function fetchDealCapacity() {
      try {
        const response = await fetch(`/api/deals/${dealId}/capacity`)
        if (response.ok) {
          const data = await response.json()
          setDealCapacity(data)
        }
      } catch (err) {
        console.error('Failed to fetch deal capacity:', err)
      } finally {
        setLoadingCapacity(false)
      }
    }
    fetchDealCapacity()
  }, [dealId])

  // Calculate subscription metrics
  const subscriptionPercentage = dealCapacity?.target_raise
    ? (dealCapacity.total_subscribed / dealCapacity.target_raise) * 100
    : 0
  const isOversubscribed = subscriptionPercentage > 100
  const remainingCapacity = dealCapacity?.target_raise
    ? Math.max(0, dealCapacity.target_raise - dealCapacity.total_subscribed)
    : null

  // Format currency amounts
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Only lock form during pending review to prevent duplicate submissions
  // Allow new submissions after approval/rejection (follow-on investments, entity changes)
  const isLocked = existingSubmission && existingSubmission.status === 'pending_review'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isLocked) return

    setIsSubmitting(true)
    setFeedback(null)
    setError(null)

    try {
      const numericAmount = parseFloat(amount)
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        setError('Enter a valid subscription amount.')
        setIsSubmitting(false)
        return
      }

      // Validate entity selection if entity type is chosen
      if (entitySelection.subscription_type === 'entity' && !entitySelection.counterparty_entity_id) {
        setError('Please select an entity or create one to invest through an entity.')
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/deals/${dealId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            amount: numericAmount,
            currency,
            bank_confirmation: bankConfirmation,
            notes: notes.trim() || null
          },
          subscription_type: entitySelection.subscription_type,
          counterparty_entity_id: entitySelection.counterparty_entity_id || null
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit subscription')
      }

      setFeedback('Subscription submitted for review. The VERSO team will follow up shortly.')
      setAmount('')
      setBankConfirmation(false)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error submitting subscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLocked) {
    const submittedAt = existingSubmission?.submitted_at
      ? new Date(existingSubmission.submitted_at).toLocaleString()
      : 'Recently'

    return (
      <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Subscription under review
          </div>
          <p>Submitted on {submittedAt}. The VERSO team is reviewing your request.</p>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be notified once a decision is made. Contact your relationship manager if you need to make urgent changes.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Validate amount against deal limits (non-blocking)
  const numericAmount = parseFloat(amount)
  const amountWarnings = []
  if (!isNaN(numericAmount) && numericAmount > 0) {
    if (dealCapacity?.min_ticket && numericAmount < dealCapacity.min_ticket) {
      amountWarnings.push(`Below minimum investment of ${formatAmount(dealCapacity.min_ticket)}`)
    }
    if (dealCapacity?.max_ticket && numericAmount > dealCapacity.max_ticket) {
      amountWarnings.push(`Above maximum investment of ${formatAmount(dealCapacity.max_ticket)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Deal Capacity Display */}
      {!loadingCapacity && dealCapacity && dealCapacity.target_raise && (
        <Card className={isOversubscribed ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20" : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"}>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Deal Progress</span>
                <span className="text-sm font-bold text-foreground">
                  {subscriptionPercentage.toFixed(1)}% subscribed
                </span>
              </div>

              <Progress
                value={Math.min(subscriptionPercentage, 100)}
                className={isOversubscribed ? "bg-orange-200 dark:bg-orange-800" : "bg-blue-200 dark:bg-blue-800"}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatAmount(dealCapacity.total_subscribed)} committed</span>
                <span>Target: {formatAmount(dealCapacity.target_raise)}</span>
              </div>

              {isOversubscribed && (
                <Alert className="border-orange-300 bg-orange-100">
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This deal is oversubscribed by {(subscriptionPercentage - 100).toFixed(1)}%.
                    You can still submit your interest, but allocation is not guaranteed.
                  </AlertDescription>
                </Alert>
              )}

              {dealCapacity.min_ticket && dealCapacity.max_ticket && (
                <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                  Investment range: {formatAmount(dealCapacity.min_ticket)} - {formatAmount(dealCapacity.max_ticket)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EntitySelector
        value={entitySelection}
        onChange={setEntitySelection}
      />

      <div className="space-y-2">
        <Label htmlFor={`subscription-amount-${dealId}`} className="text-base font-semibold">
          Subscription Amount ({currency})
        </Label>
        <Input
          id={`subscription-amount-${dealId}`}
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={event => setAmount(event.target.value)}
          placeholder="e.g. 250000"
          className="text-foreground text-lg h-12"
        />

        {/* Amount validation warnings */}
        {amountWarnings.length > 0 && (
          <Alert className="mt-2 border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-800">
              {amountWarnings.join('. ')}. You may still submit, but staff review is required.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Bank & Compliance</Label>
        <div className="flex items-start space-x-3 rounded-md border-2 border-border px-4 py-3 bg-muted">
          <Checkbox
            id={`bank-confirmation-${dealId}`}
            checked={bankConfirmation}
            onCheckedChange={checked => setBankConfirmation(Boolean(checked))}
            className="mt-0.5"
          />
          <Label htmlFor={`bank-confirmation-${dealId}`} className="text-sm text-foreground font-normal cursor-pointer leading-relaxed">
            I confirm my bank/KYC documentation is ready for the subscription pack.
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`subscription-notes-${dealId}`} className="text-base font-semibold">Additional Notes (optional)</Label>
        <Textarea
          id={`subscription-notes-${dealId}`}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          rows={3}
          placeholder="Share wiring preferences, co-investor details, or other information for the VERSO team."
          className="text-foreground"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
      )}
      {feedback && (
        <div className="text-sm text-emerald-600 font-medium bg-emerald-50 p-3 rounded-md border border-emerald-200">{feedback}</div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md"
      >
        {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
        Submit Subscription Request
      </Button>
    </form>
  )
}
