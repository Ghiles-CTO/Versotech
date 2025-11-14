'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { EntitySelector } from '@/components/subscriptions/entity-selector'

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

  // Only lock form after approval - allow resubmission during pending review to enable corrections
  const isLocked = existingSubmission && existingSubmission.status === 'approved'

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
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="py-4 text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Submission {existingSubmission?.status.replace('_', ' ')}
          </div>
          <p>Submitted on {submittedAt}.</p>
          <p className="text-xs text-gray-500">
            Need to update your request? Contact your relationship manager or the VERSO team directly.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EntitySelector
        value={entitySelection}
        onChange={setEntitySelection}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`subscription-amount-${dealId}`}>Subscription Amount ({currency})</Label>
          <Input
            id={`subscription-amount-${dealId}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={event => setAmount(event.target.value)}
            placeholder="e.g. 250000"
            className="text-black"
          />
        </div>
        <div className="space-y-2">
          <Label>Bank & Compliance</Label>
          <div className="flex items-center space-x-2 rounded-md border border-gray-200 px-3 py-2">
            <Checkbox
              id={`bank-confirmation-${dealId}`}
              checked={bankConfirmation}
              onCheckedChange={checked => setBankConfirmation(Boolean(checked))}
            />
            <Label htmlFor={`bank-confirmation-${dealId}`} className="text-xs text-black font-normal cursor-pointer">
              I confirm my bank/KYC documentation is ready for the subscription pack.
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`subscription-notes-${dealId}`}>Additional Notes (optional)</Label>
        <Textarea
          id={`subscription-notes-${dealId}`}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          rows={4}
          placeholder="Share wiring preferences, co-investor details, or other information for the VERSO team."
          className="text-black"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {feedback && (
        <div className="text-sm text-emerald-600">{feedback}</div>
      )}

      <Button type="submit" disabled={isSubmitting} variant="outline" className="gap-2 border-2 border-blue-600 text-black hover:bg-blue-50">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Subscription
      </Button>
    </form>
  )
}
