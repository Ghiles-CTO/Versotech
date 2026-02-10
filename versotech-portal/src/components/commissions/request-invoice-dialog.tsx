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

export type CommissionType = 'partner' | 'introducer' | 'commercial-partner'

interface Commission {
  id: string
  accrual_amount: number
  currency: string | null
  entity_name: string
  deal?: {
    name: string
  }
}

interface RequestInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  commissionType: CommissionType
  onSuccess: () => void
}

const ENTITY_LABELS: Record<CommissionType, string> = {
  'partner': 'Partner',
  'introducer': 'Introducer',
  'commercial-partner': 'Commercial Partner',
}

/**
 * Generic Request Invoice Dialog
 * Works for all commission types: partner, introducer, commercial-partner
 * Sends invoice request notification to the entity
 */
export function RequestInvoiceDialog({
  open,
  onOpenChange,
  commission,
  commissionType,
  onSuccess,
}: RequestInvoiceDialogProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!commission) return

    setSending(true)
    setError(null)

    try {
      // Build API URL based on commission type
      const apiUrl = `/api/arrangers/me/${commissionType}-commissions/${commission.id}/request-invoice`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

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

  const entityLabel = ENTITY_LABELS[commissionType]
  const currencyCode = (commission.currency || '').trim().toUpperCase()
  const formattedAmount = currencyCode
    ? formatCurrency(commission.accrual_amount, currencyCode)
    : Number(commission.accrual_amount || 0).toLocaleString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Request Invoice
          </DialogTitle>
          <DialogDescription>
            Send an invoice request notification to the {entityLabel.toLowerCase()}.
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
              <span className="text-muted-foreground">{entityLabel}:</span>
              <span className="font-medium">{commission.entity_name || 'Unknown'}</span>
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
              The {entityLabel.toLowerCase()} will receive a notification asking them to submit their invoice
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
