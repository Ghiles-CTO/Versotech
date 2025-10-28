'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { SubscriptionWithRelations } from '@/types/subscription'

interface SubscriptionEditDialogProps {
  subscription: SubscriptionWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubscriptionEditDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: SubscriptionEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: subscription.status,
    commitment: subscription.commitment.toString(),
    currency: subscription.currency,
    effective_date: subscription.effective_date || '',
    funding_due_at: subscription.funding_due_at || '',
    units: subscription.units?.toString() || '',
    acknowledgement_notes: subscription.acknowledgement_notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          commitment: parseFloat(formData.commitment),
          currency: formData.currency,
          effective_date: formData.effective_date || null,
          funding_due_at: formData.funding_due_at || null,
          units: formData.units ? parseFloat(formData.units) : null,
          acknowledgement_notes: formData.acknowledgement_notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscription')
      }

      toast.success('Subscription updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Subscription #{subscription.subscription_number}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update subscription details for {subscription.investor.legal_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger id="status" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="committed" className="text-white">Committed</SelectItem>
                  <SelectItem value="active" className="text-white">Active</SelectItem>
                  <SelectItem value="closed" className="text-white">Closed</SelectItem>
                  <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commitment" className="text-white">Commitment Amount</Label>
              <Input
                id="commitment"
                type="number"
                step="0.01"
                value={formData.commitment}
                onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="USD" className="text-white">USD</SelectItem>
                  <SelectItem value="EUR" className="text-white">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-white">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units" className="text-white">Units (Optional)</Label>
              <Input
                id="units"
                type="number"
                step="0.01"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-white">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding_due_at" className="text-white">Funding Due Date</Label>
              <Input
                id="funding_due_at"
                type="date"
                value={formData.funding_due_at}
                onChange={(e) => setFormData({ ...formData, funding_due_at: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Acknowledgement Notes</Label>
            <Textarea
              id="notes"
              value={formData.acknowledgement_notes}
              onChange={(e) => setFormData({ ...formData, acknowledgement_notes: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              placeholder="Add any notes or acknowledgements..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
