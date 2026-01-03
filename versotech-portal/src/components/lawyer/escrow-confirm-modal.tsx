'use client'

import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EscrowConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionId: string
  dealName: string
  investorName: string
  commitment: number
  fundedAmount: number
  currency: string
  mode: 'funding' | 'payment'
  onSuccess?: () => void
  feeEventId?: string | null
  defaultAmount?: number | null
  defaultPaymentType?: 'partner' | 'introducer' | 'commercial_partner' | 'seller'
  defaultRecipientId?: string | null
}

export function EscrowConfirmModal({
  open,
  onOpenChange,
  subscriptionId,
  dealName,
  investorName,
  commitment,
  fundedAmount,
  currency,
  mode,
  onSuccess,
  feeEventId = null,
  defaultAmount = null,
  defaultPaymentType = undefined,
  defaultRecipientId = null
}: EscrowConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankReference, setBankReference] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentType, setPaymentType] = useState<string>('')
  const [recipientId, setRecipientId] = useState('')

  const remainingAmount = commitment - fundedAmount

  useEffect(() => {
    if (!open) return
    if (mode === 'payment') {
      setAmount(defaultAmount != null ? String(defaultAmount) : '')
      setPaymentType(defaultPaymentType || '')
      setRecipientId(defaultRecipientId || '')
    } else {
      setAmount('')
      setPaymentType('')
      setRecipientId('')
    }
  }, [open, mode, defaultAmount, defaultPaymentType, defaultRecipientId])

  const handleConfirmFunding = async () => {
    if (!subscriptionId) {
      toast.error('Invalid subscription reference')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/escrow/${subscriptionId}/confirm-funding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          bank_reference: bankReference || undefined,
          confirmation_notes: notes || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm funding')
      }

      toast.success(data.data.message)
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setAmount('')
      setBankReference('')
      setNotes('')
    } catch (error) {
      console.error('Funding confirmation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm funding')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!subscriptionId) {
      toast.error('Invalid subscription reference')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!paymentType) {
      toast.error('Please select a payment type')
      return
    }
    if (paymentType !== 'seller' && !recipientId) {
      toast.error('Please enter a recipient ID')
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        payment_type: paymentType,
        amount: parseFloat(amount),
        bank_reference: bankReference || undefined,
        confirmation_notes: notes || undefined,
        fee_event_id: feeEventId || undefined
      }

      if (paymentType !== 'seller') {
        payload.recipient_id = recipientId
      }

      const response = await fetch(`/api/escrow/${subscriptionId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment')
      }

      toast.success(data.data.message)
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setAmount('')
      setBankReference('')
      setNotes('')
      setPaymentType('')
      setRecipientId('')
    } catch (error) {
      console.error('Payment confirmation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'funding' ? 'Confirm Escrow Funding' : 'Confirm Fee Payment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'funding' ? (
              <>
                Confirm funding received for <strong>{investorName}</strong>'s subscription in <strong>{dealName}</strong>.
              </>
            ) : (
              <>
                Confirm fee payment processed for <strong>{dealName}</strong>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'funding' && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commitment:</span>
                <span className="font-medium">{commitment.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Funded:</span>
                <span className="font-medium">{fundedAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-bold text-amber-600">{remainingAmount.toLocaleString()} {currency}</span>
              </div>
            </div>
          )}

          {mode === 'payment' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner Fee</SelectItem>
                    <SelectItem value="introducer">Introducer Fee</SelectItem>
                    <SelectItem value="commercial_partner">Commercial Partner Fee</SelectItem>
                    <SelectItem value="seller">Payment to Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType !== 'seller' && (
                <div className="space-y-2">
                  <Label htmlFor="recipientId">Recipient ID</Label>
                  <Input
                    id="recipientId"
                    placeholder="Enter recipient entity ID"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Confirmed ({currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder={mode === 'funding' ? `e.g., ${remainingAmount.toLocaleString()}` : 'Enter amount'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankReference">Bank Reference (Optional)</Label>
            <Input
              id="bankReference"
              placeholder="Wire transfer reference"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={mode === 'funding' ? handleConfirmFunding : handleConfirmPayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm {mode === 'funding' ? 'Funding' : 'Payment'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
