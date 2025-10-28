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
      <DialogContent className="bg-black border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-6 w-6 text-blue-400" />
            New Subscription
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new subscription for an investor in a vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Investor Selection */}
          <div className="space-y-2">
            <Label htmlFor="investor_id" className="text-white text-sm font-medium">
              Investor <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.investor_id}
              onValueChange={(value) => setFormData({ ...formData, investor_id: value })}
              required
            >
              <SelectTrigger id="investor_id" className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select an investor" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 max-h-[200px]">
                {investors.map((investor) => (
                  <SelectItem key={investor.id} value={investor.id} className="text-white">
                    {investor.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_id" className="text-white text-sm font-medium">
              Vehicle <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
              required
            >
              <SelectTrigger id="vehicle_id" className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 max-h-[200px]">
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-white">
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commitment & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commitment" className="text-white text-sm font-medium">
                Commitment Amount <span className="text-red-400">*</span>
              </Label>
              <Input
                id="commitment"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.commitment}
                onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white text-sm font-medium">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="USD" className="text-white">USD</SelectItem>
                  <SelectItem value="EUR" className="text-white">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-white">GBP</SelectItem>
                  <SelectItem value="CHF" className="text-white">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-white text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status" className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="pending" className="text-white">Pending</SelectItem>
                <SelectItem value="committed" className="text-white">Committed</SelectItem>
                <SelectItem value="active" className="text-white">Active</SelectItem>
                <SelectItem value="closed" className="text-white">Closed</SelectItem>
                <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date" className="text-white text-sm font-medium">
                Effective Date
              </Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding_due_at" className="text-white text-sm font-medium">
                Funding Due Date
              </Label>
              <Input
                id="funding_due_at"
                type="date"
                value={formData.funding_due_at}
                onChange={(e) => setFormData({ ...formData, funding_due_at: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Units */}
          <div className="space-y-2">
            <Label htmlFor="units" className="text-white text-sm font-medium">
              Number of Units
            </Label>
            <Input
              id="units"
              type="number"
              step="0.01"
              placeholder="Optional"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="acknowledgement_notes" className="text-white text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="acknowledgement_notes"
              placeholder="Add any additional notes..."
              value={formData.acknowledgement_notes}
              onChange={(e) => setFormData({ ...formData, acknowledgement_notes: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-gray-200"
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
