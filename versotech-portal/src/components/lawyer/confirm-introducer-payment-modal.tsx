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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, AlertTriangle, Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { DocumentViewer } from '@/components/documents/document-viewer'

interface IntroducerCommission {
  id: string
  introducer_name: string
  deal_id: string | null
  deal_name: string | null
  accrual_amount: number
  currency: string
  status: string
  invoice_id: string | null
  created_at: string
}

interface ConfirmIntroducerPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: IntroducerCommission | null
  onSuccess?: () => void
}

export function ConfirmIntroducerPaymentModal({
  open,
  onOpenChange,
  commission,
  onSuccess,
}: ConfirmIntroducerPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [bankReference, setBankReference] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)

  const handleConfirm = async () => {
    if (!commission) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/lawyers/me/introducer-commissions/${commission.id}/confirm-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bank_reference: bankReference || undefined,
            payment_date: paymentDate || undefined,
            notes: notes || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment')
      }

      toast.success(data.message || 'Payment confirmed successfully')
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setBankReference('')
      setPaymentDate('')
      setNotes('')
    } catch (error) {
      console.error('[ConfirmIntroducerPaymentModal] Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm payment')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setBankReference('')
      setPaymentDate('')
      setNotes('')
    }
    onOpenChange(isOpen)
  }

  if (!commission) return null

  const formattedAmount = formatCurrency(commission.accrual_amount, commission.currency)

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirm Introducer Payment
            </DialogTitle>
            <DialogDescription>
              Confirm that payment has been made to the introducer. This will update the
              commission status and notify all parties.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Commission Summary */}
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Introducer:</span>
                <span className="font-medium">{commission.introducer_name}</span>
              </div>
              {commission.deal_name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deal:</span>
                  <span className="font-medium">{commission.deal_name}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-lg font-bold text-green-600">{formattedAmount}</span>
              </div>
            </div>

            {/* View Invoice Button */}
            {commission.invoice_id && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setViewInvoiceOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Submitted Invoice
              </Button>
            )}

            {!commission.invoice_id && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>No invoice document attached to this commission.</span>
              </div>
            )}

            {/* Bank Reference */}
            <div className="space-y-2">
              <Label htmlFor="bankReference">Bank Reference (Optional)</Label>
              <Input
                id="bankReference"
                placeholder="e.g., WIRE-2024-12345"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Wire transfer reference or payment identifier
              </p>
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date (Optional)</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to today if not specified
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Notification Warning */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
              <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Notifications will be sent to:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Arranger (payment confirmed)</li>
                  <li>Introducer (payment received)</li>
                  <li>Staff administrators</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer for Invoice */}
      {commission.invoice_id && (
        <DocumentViewer
          documentId={commission.invoice_id}
          documentName={`Invoice - ${commission.introducer_name}`}
          mimeType="application/pdf"
          open={viewInvoiceOpen}
          onClose={() => setViewInvoiceOpen(false)}
        />
      )}
    </>
  )
}
