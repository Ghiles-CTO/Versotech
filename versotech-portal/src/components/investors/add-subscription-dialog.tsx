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

type Vehicle = {
  id: string
  name: string
  type: string | null
  currency: string
}

type AddSubscriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  investorId: string
  onSuccess: () => void
}

export function AddSubscriptionDialog({
  open,
  onOpenChange,
  investorId,
  onSuccess
}: AddSubscriptionDialogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    vehicle_id: '',
    commitment: '',
    currency: 'USD',
    status: 'committed',
    effective_date: '',
    funding_due_at: '',
    acknowledgement_notes: ''
  })

  useEffect(() => {
    if (open) {
      fetchVehicles()
    } else {
      // Reset form when dialog closes
      setFormData({
        vehicle_id: '',
        commitment: '',
        currency: 'USD',
        status: 'committed',
        effective_date: '',
        funding_due_at: '',
        acknowledgement_notes: ''
      })
    }
  }, [open])

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const res = await fetch('/api/vehicles')

      if (!res.ok) {
        throw new Error('Failed to fetch vehicles')
      }

      const data = await res.json()
      setVehicles(data.vehicles || [])
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
      toast.error('Failed to load vehicles')
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
      currency: vehicle?.currency || 'USD'
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vehicle_id || !formData.commitment) {
      toast.error('Please fill in all required fields')
      return
    }

    const commitment = parseFloat(formData.commitment)
    if (isNaN(commitment) || commitment <= 0) {
      toast.error('Commitment must be a positive number')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch(`/api/investors/${investorId}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: formData.vehicle_id,
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
        if (res.status === 409) {
          toast.error('Duplicate subscription detected', {
            description: result.error || 'A subscription with identical details already exists'
          })
        } else {
          throw new Error(result.error || 'Failed to create subscription')
        }
        return
      }

      toast.success(result.message || 'Subscription created successfully')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to create subscription:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create subscription')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Create a new subscription for this investor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">
              Vehicle <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={handleVehicleChange}
              disabled={loadingVehicles}
            >
              <SelectTrigger id="vehicle_id">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} {vehicle.type ? `(${vehicle.type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commitment">
                Commitment <span className="text-destructive">*</span>
              </Label>
              <Input
                id="commitment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.commitment}
                onChange={(e) => setFormData(prev => ({ ...prev, commitment: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="committed">Committed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding_due_at">Funding Due</Label>
              <Input
                id="funding_due_at"
                type="date"
                value={formData.funding_due_at}
                onChange={(e) => setFormData(prev => ({ ...prev, funding_due_at: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acknowledgement_notes">Notes</Label>
            <Textarea
              id="acknowledgement_notes"
              placeholder="Optional notes about this subscription"
              rows={3}
              value={formData.acknowledgement_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, acknowledgement_notes: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loadingVehicles}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Subscription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
