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
import { Loader2 } from 'lucide-react'

interface Position {
  id: string
  investor_id: string
  units: number | null
  cost_basis: number | null
  last_nav: number | null
  as_of_date: string | null
}

interface PositionModalProps {
  vehicleId: string
  position: Position | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PositionModal({
  vehicleId,
  position,
  open,
  onClose,
  onSuccess
}: PositionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    investor_id: '',
    units: '',
    cost_basis: '',
    last_nav: '',
    as_of_date: ''
  })

  useEffect(() => {
    if (position) {
      setFormData({
        investor_id: position.investor_id,
        units: position.units != null ? String(position.units) : '',
        cost_basis: position.cost_basis != null ? String(position.cost_basis) : '',
        last_nav: position.last_nav != null ? String(position.last_nav) : '',
        as_of_date: position.as_of_date || ''
      })
      setError(null)
    } else {
      setFormData({
        investor_id: '',
        units: '',
        cost_basis: '',
        last_nav: '',
        as_of_date: ''
      })
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: any = {
        investor_id: formData.investor_id,
        units: parseFloat(formData.units),
      }
      if (formData.cost_basis) payload.cost_basis = parseFloat(formData.cost_basis)
      if (formData.last_nav) payload.last_nav = parseFloat(formData.last_nav)
      if (formData.as_of_date) payload.as_of_date = formData.as_of_date

      const endpoint = position
        ? `/api/staff/vehicles/${vehicleId}/positions/${position.id}`
        : `/api/staff/vehicles/${vehicleId}/positions`

      const res = await fetch(endpoint, {
        method: position ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save position')
      }

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
      <DialogContent className="sm:max-w-[520px] bg-zinc-950 border-white/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">{position ? 'Edit Position' : 'Add Position'}</DialogTitle>
            <DialogDescription>
              Manual position entry or correction for this vehicle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="investor_id">Investor ID *</Label>
              <Input
                id="investor_id"
                value={formData.investor_id}
                onChange={(e) => setFormData({ ...formData, investor_id: e.target.value })}
                required
                disabled={!!position}
                className="bg-zinc-900 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Units / Shares *</Label>
              <Input
                id="units"
                type="number"
                step="0.0001"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                required
                className="bg-zinc-900 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_basis">Cost Basis</Label>
                <Input
                  id="cost_basis"
                  type="number"
                  step="0.01"
                  value={formData.cost_basis}
                  onChange={(e) => setFormData({ ...formData, cost_basis: e.target.value })}
                  className="bg-zinc-900 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_nav">Last NAV</Label>
                <Input
                  id="last_nav"
                  type="number"
                  step="0.0001"
                  value={formData.last_nav}
                  onChange={(e) => setFormData({ ...formData, last_nav: e.target.value })}
                  className="bg-zinc-900 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="as_of_date">As of Date</Label>
              <Input
                id="as_of_date"
                type="date"
                value={formData.as_of_date}
                onChange={(e) => setFormData({ ...formData, as_of_date: e.target.value })}
                className="bg-zinc-900 border-white/10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {position ? 'Save Changes' : 'Add Position'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

