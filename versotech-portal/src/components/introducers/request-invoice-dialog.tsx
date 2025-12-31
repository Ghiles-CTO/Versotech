'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface Commission {
  id: string
  accrual_amount: number
  currency: string
  introducer?: {
    legal_name: string
    email?: string
  }
  deal?: {
    name: string
  }
}

interface RequestInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  onSuccess: () => void
}

export function RequestInvoiceDialog({
  open,
  onOpenChange,
  commission,
  onSuccess,
}: RequestInvoiceDialogProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!commission) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/arrangers/me/introducer-commissions/${commission.id}/request-invoice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request invoice')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('[RequestInvoiceDialog] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to request invoice')
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
            <FileText className="h-5 w-5" />
            Request Invoice
          </DialogTitle>
          <DialogDescription>
            Send an invoice request notification to the introducer.
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

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              The introducer will receive a notification asking them to submit their invoice
              for this commission. The commission status will be updated to "Invoice Requested".
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
                <Mail className="h-4 w-4 mr-2" />
                Request Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
