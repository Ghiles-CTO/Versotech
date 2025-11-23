'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddShareLotModalProps {
  dealId: string
  onSuccess?: () => void
}

export function AddShareLotModal({ dealId, onSuccess }: AddShareLotModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    source_type: 'company',
    counterparty_name: '',
    units_total: '',
    unit_cost: '',
    currency: 'USD',
    acquired_at: '',
    lockup_until: '',
    notes: ''
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.units_total || !formData.unit_cost) {
      setError('Units and cost are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: formData.source_type,
          counterparty_name: formData.counterparty_name,
          units_total: parseFloat(formData.units_total),
          unit_cost: parseFloat(formData.unit_cost),
          currency: formData.currency,
          acquired_at: formData.acquired_at || null,
          lockup_until: formData.lockup_until || null,
          notes: formData.notes || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add share lot')
      }

      // Reset form and close modal
      setFormData({
        source_type: 'company',
        counterparty_name: '',
        units_total: '',
        unit_cost: '',
        currency: 'USD',
        acquired_at: '',
        lockup_until: '',
        notes: ''
      })
      setOpen(false)

      // Trigger callback to refresh parent component
      if (onSuccess) {
        onSuccess()
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Share Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Share Lot</DialogTitle>
          <DialogDescription>
            Add inventory to this deal from a share source
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_type">Source Type *</Label>
              <Select value={formData.source_type} onValueChange={(v) => updateField('source_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="counterparty_name">Counterparty Name</Label>
              <Input
                id="counterparty_name"
                placeholder="e.g., Former Employee"
                value={formData.counterparty_name}
                onChange={(e) => updateField('counterparty_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units_total">Total Units *</Label>
              <Input
                id="units_total"
                type="number"
                step="0.00000001"
                placeholder="50000"
                value={formData.units_total}
                onChange={(e) => updateField('units_total', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost *</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.000001"
                placeholder="120.00"
                value={formData.unit_cost}
                onChange={(e) => updateField('unit_cost', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(v) => updateField('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquired_at">Acquired Date</Label>
              <Input
                id="acquired_at"
                type="date"
                value={formData.acquired_at}
                onChange={(e) => updateField('acquired_at', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockup_until">Lockup Until</Label>
              <Input
                id="lockup_until"
                type="date"
                value={formData.lockup_until}
                onChange={(e) => updateField('lockup_until', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this share lot..."
              rows={3}
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Share Lot'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

