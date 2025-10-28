'use client'

import { useCallback, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react'

interface InterestModalProps {
  dealId: string
  dealName: string
  currency?: string | null
  investorId: string
  defaultAmount?: number | null
  isClosed?: boolean
  onSubmitted?: () => Promise<void> | void
  children: React.ReactNode
}

export function InterestModal({
  dealId,
  dealName,
  currency,
  investorId,
  defaultAmount,
  isClosed = false,
  onSubmitted,
  children
}: InterestModalProps) {
  const [open, setOpen] = useState(false)
  const [indicativeAmount, setIndicativeAmount] = useState(
    defaultAmount ? defaultAmount.toString() : ''
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetState = useCallback(() => {
    setIndicativeAmount(defaultAmount ? defaultAmount.toString() : '')
    setNotes('')
    setSubmitting(false)
    setError(null)
    setSuccess(false)
  }, [defaultAmount])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const parsedAmount = indicativeAmount.trim()
      const payload: Record<string, unknown> = {
        investor_id: investorId,
        notes: notes.trim() || undefined
      }

      if (parsedAmount) {
        const numericAmount = Number(parsedAmount.replace(/[^0-9.]/g, ''))
        if (Number.isFinite(numericAmount) && numericAmount > 0) {
          payload.indicative_amount = numericAmount
          if (currency) {
            payload.indicative_currency = currency
          }
        } else {
          throw new Error('Enter a valid indicative amount or leave the field blank.')
        }
      }

      if (isClosed) {
        payload.is_post_close = true
      }

      const response = await fetch(`/api/deals/${dealId}/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Unable to submit interest right now.')
      }

      setSuccess(true)
      if (onSubmitted) {
        await onSubmitted()
      }

      setTimeout(() => {
        setOpen(false)
        resetState()
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {isClosed ? "Notify Me About Similar Deals" : "I'm Interested"}
          </DialogTitle>
          <DialogDescription>
            {isClosed
              ? `Let the VERSO team know you&apos;re interested in similar opportunities to ${dealName}. We'll notify you when comparable deals become available.`
              : `Share a quick signal and the VERSO team will review your interest in ${dealName}.`
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-green-700">
              Interest submitted
            </p>
            <p className="text-sm text-green-600">
              We&apos;ll notify you as soon as the team responds.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="indicative-amount">
                Indicative amount or range
              </Label>
              <Input
                id="indicative-amount"
                placeholder={`e.g. ${currency ?? ''} 250k`}
                value={indicativeAmount}
                onChange={(event) => setIndicativeAmount(event.target.value)}
                inputMode="decimal"
              />
              <p className="text-xs text-muted-foreground">
                Optional — helps the team size the allocation. You can share a single number or range.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest-notes">Notes for the team</Label>
              <Textarea
                id="interest-notes"
                placeholder="Add any context or questions you'd like the team to review."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending
                  </>
                ) : (
                  'Submit interest'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
