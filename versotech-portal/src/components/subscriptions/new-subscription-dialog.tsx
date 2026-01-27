'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

interface NewSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vehicles: Array<{ id: string; name: string }>
  investors: Array<{ id: string; legal_name: string }>
}

export function NewSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
  vehicles,
  investors,
}: NewSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    investor_id: '',
    vehicle_id: '',
    commitment: '',
    currency: 'USD',
    status: 'pending',
    effective_date: '',
    funding_due_at: '',
    units: '',
    acknowledgement_notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.investor_id || !formData.vehicle_id || !formData.commitment) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commitment: parseFloat(formData.commitment),
          units: formData.units ? parseFloat(formData.units) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      toast.success('Subscription created successfully')
      onOpenChange(false)
      onSuccess()

      // Reset form
      setFormData({
        investor_id: '',
        vehicle_id: '',
        commitment: '',
        currency: 'USD',
        status: 'pending',
        effective_date: '',
        funding_due_at: '',
        units: '',
        acknowledgement_notes: '',
      })
    } catch (error) {
      console.error('Create subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Plus className="h-6 w-6 text-blue-400" />
            New Subscription
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new subscription for an investor in a vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Investor Selection */}
          <div className="space-y-2">
            <Label htmlFor="investor_id" className="text-foreground text-sm font-medium">
              Investor <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.investor_id}
              onValueChange={(value) => setFormData({ ...formData, investor_id: value })}
              required
            >
              <SelectTrigger id="investor_id" className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Select an investor" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border max-h-[200px]">
                {investors.map((investor) => (
                  <SelectItem key={investor.id} value={investor.id} className="text-foreground">
                    {investor.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_id" className="text-foreground text-sm font-medium">
              Vehicle <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
              required
            >
              <SelectTrigger id="vehicle_id" className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border max-h-[200px]">
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-foreground">
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commitment & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commitment" className="text-foreground text-sm font-medium">
                Commitment Amount <span className="text-red-400">*</span>
              </Label>
              <Input
                id="commitment"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.commitment}
                onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                className="bg-muted border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-foreground text-sm font-medium">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="USD" className="text-foreground">USD</SelectItem>
                  <SelectItem value="EUR" className="text-foreground">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-foreground">GBP</SelectItem>
                  <SelectItem value="CHF" className="text-foreground">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status" className="bg-muted border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
                <SelectItem value="committed" className="text-foreground">Committed</SelectItem>
                <SelectItem value="active" className="text-foreground">Active</SelectItem>
                <SelectItem value="closed" className="text-foreground">Closed</SelectItem>
                <SelectItem value="cancelled" className="text-foreground">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-foreground text-sm font-medium">
                Effective Date
              </Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding_due_at" className="text-foreground text-sm font-medium">
                Funding Due Date
              </Label>
              <Input
                id="funding_due_at"
                type="date"
                value={formData.funding_due_at}
                onChange={(e) => setFormData({ ...formData, funding_due_at: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>

          {/* Units */}
          <div className="space-y-2">
            <Label htmlFor="units" className="text-foreground text-sm font-medium">
              Number of Units
            </Label>
            <Input
              id="units"
              type="number"
              step="0.01"
              placeholder="Optional"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              className="bg-muted border-border text-foreground"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="acknowledgement_notes" className="text-foreground text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="acknowledgement_notes"
              placeholder="Add any additional notes..."
              value={formData.acknowledgement_notes}
              onChange={(e) => setFormData({ ...formData, acknowledgement_notes: e.target.value })}
              className="bg-muted border-border text-foreground min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-muted text-foreground border-border hover:bg-muted/80"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Subscription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
