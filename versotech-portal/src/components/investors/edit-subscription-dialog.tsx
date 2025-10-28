'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Subscription = {
  id: string
  subscription_number: number
  vehicle_id: string
  commitment: number
  currency: string
  status: string
  effective_date: string | null
  funding_due_at: string | null
  acknowledgement_notes: string | null
  vehicle?: {
    id: string
    name: string
    type: string | null
  }
}

type EditSubscriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  investorId: string
  subscription: Subscription
  onSuccess: () => void
}

export function EditSubscriptionDialog({
  open,
  onOpenChange,
  investorId,
  subscription,
  onSuccess
}: EditSubscriptionDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    commitment: subscription.commitment.toString(),
    currency: subscription.currency,
    status: subscription.status,
    effective_date: subscription.effective_date || '',
    funding_due_at: subscription.funding_due_at || '',
    acknowledgement_notes: subscription.acknowledgement_notes || ''
  })

  // Reset form when subscription changes
  useEffect(() => {
    setFormData({
      commitment: subscription.commitment.toString(),
      currency: subscription.currency,
      status: subscription.status,
      effective_date: subscription.effective_date || '',
      funding_due_at: subscription.funding_due_at || '',
      acknowledgement_notes: subscription.acknowledgement_notes || ''
    })
  }, [subscription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const commitment = parseFloat(formData.commitment)
    if (isNaN(commitment) || commitment <= 0) {
      toast.error('Commitment must be a positive number')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch(`/api/investors/${investorId}/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment,
          currency: formData.currency,
          status: formData.status,
          effective_date: formData.effective_date || null,
          funding_due_at: formData.funding_due_at || null,
          acknowledgement_notes: formData.acknowledgement_notes || null
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update subscription')
      }

      toast.success(result.message || 'Subscription updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to update subscription:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update subscription')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Subscription #{subscription.subscription_number}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update subscription details for {subscription.vehicle?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Vehicle (Immutable)</Label>
            <Input
              value={subscription.vehicle?.name || 'Unknown Vehicle'}
              disabled
              className="bg-white/5 border-white/10 text-gray-400"
            />
            <p className="text-xs text-gray-400">
              Vehicle cannot be changed after subscription creation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commitment" className="text-white">
                Commitment <span className="text-red-400">*</span>
              </Label>
              <Input
                id="commitment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.commitment}
                onChange={(e) => setFormData(prev => ({ ...prev, commitment: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="currency" className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="USD" className="text-white">USD</SelectItem>
                  <SelectItem value="EUR" className="text-white">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-white">GBP</SelectItem>
                  <SelectItem value="CHF" className="text-white">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-white">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status" className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="pending" className="text-white">Pending</SelectItem>
                <SelectItem value="committed" className="text-white">Committed</SelectItem>
                <SelectItem value="active" className="text-white">Active</SelectItem>
                <SelectItem value="closed" className="text-white">Closed</SelectItem>
                <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-white">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formatDate(formData.effective_date)}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding_due_at" className="text-white">Funding Due</Label>
              <Input
                id="funding_due_at"
                type="date"
                value={formatDate(formData.funding_due_at)}
                onChange={(e) => setFormData(prev => ({ ...prev, funding_due_at: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acknowledgement_notes" className="text-white">Notes</Label>
            <Textarea
              id="acknowledgement_notes"
              placeholder="Optional notes about this subscription"
              rows={3}
              value={formData.acknowledgement_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, acknowledgement_notes: e.target.value }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="border-white/10 text-white hover:bg-white/10 bg-white/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
