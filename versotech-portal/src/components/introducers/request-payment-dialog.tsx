'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CreditCard, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface Commission {
  id: string
  accrual_amount: number
  currency: string
  deal_id?: string
  introducer?: {
    legal_name: string
  }
  deal?: {
    name: string
  }
}

interface Lawyer {
  id: string
  legal_name: string
}

interface RequestPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  lawyers?: Lawyer[]
  onSuccess: () => void
}

export function RequestPaymentDialog({
  open,
  onOpenChange,
  commission,
  lawyers = [],
  onSuccess,
}: RequestPaymentDialogProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedLawyerId('')
      setNotes('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!commission) return

    setSending(true)
    setError(null)

    try {
      const payload: { lawyer_id?: string; notes?: string } = {}
      if (selectedLawyerId) {
        payload.lawyer_id = selectedLawyerId
      }
      if (notes) {
        payload.notes = notes
      }

      const response = await fetch(
        `/api/arrangers/me/introducer-commissions/${commission.id}/request-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request payment')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('[RequestPaymentDialog] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to request payment')
    } finally {
      setSending(false)
    }
  }

  if (!commission) return null

  const formattedAmount = formatCurrency(
    commission.accrual_amount,
    commission.currency || 'USD'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Request Payment
          </DialogTitle>
          <DialogDescription>
            Request payment approval from the legal team or CEO.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Introducer:</span>
              <span className="font-medium">{commission.introducer?.legal_name || 'Unknown'}</span>
            </div>
            {commission.deal && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal:</span>
                <span className="font-medium">{commission.deal.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-primary">{formattedAmount}</span>
            </div>
          </div>

          {/* Lawyer Selection (Optional) */}
          {lawyers.length > 0 && (
            <div className="space-y-2">
              <Label>Priority Lawyer (Optional)</Label>
              <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lawyer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Send to all assigned</SelectItem>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Optionally select a specific lawyer to prioritize for this payment request.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any payment instructions or notes..."
              rows={2}
            />
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              This will notify the assigned lawyers and CEO/admin staff to process
              the payment to the introducer. Make sure the invoice has been received
              before requesting payment.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
