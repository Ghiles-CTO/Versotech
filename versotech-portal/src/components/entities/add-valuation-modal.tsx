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
import { Loader2, TrendingUp } from 'lucide-react'

interface AddValuationModalProps {
  vehicleId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddValuationModal({ vehicleId, open, onClose, onSuccess }: AddValuationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nav_total: '',
    nav_per_unit: '',
    as_of_date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/staff/vehicles/${vehicleId}/valuations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nav_total: parseFloat(formData.nav_total),
          nav_per_unit: parseFloat(formData.nav_per_unit),
          as_of_date: formData.as_of_date
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add valuation')
      }

      // Reset form
      setFormData({
        nav_total: '',
        nav_per_unit: '',
        as_of_date: new Date().toISOString().split('T')[0]
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <DialogTitle>Add Valuation</DialogTitle>
            </div>
            <DialogDescription>
              Add a new NAV valuation for this vehicle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="as_of_date">Valuation Date *</Label>
              <Input
                id="as_of_date"
                type="date"
                value={formData.as_of_date}
                onChange={(e) => setFormData({ ...formData, as_of_date: e.target.value })}
                required
                className="bg-zinc-900 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nav_total">Total NAV *</Label>
              <Input
                id="nav_total"
                type="number"
                step="0.01"
                placeholder="1000000.00"
                value={formData.nav_total}
                onChange={(e) => setFormData({ ...formData, nav_total: e.target.value })}
                required
                className="bg-zinc-900 border-white/10"
              />
              <p className="text-xs text-muted-foreground">Total Net Asset Value</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nav_per_unit">NAV Per Unit *</Label>
              <Input
                id="nav_per_unit"
                type="number"
                step="0.0001"
                placeholder="100.00"
                value={formData.nav_per_unit}
                onChange={(e) => setFormData({ ...formData, nav_per_unit: e.target.value })}
                required
                className="bg-zinc-900 border-white/10"
              />
              <p className="text-xs text-muted-foreground">NAV per individual unit/share</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Valuation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
