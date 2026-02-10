'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddFeeComponentModalProps {
  dealId: string
  feePlanId: string
}

export function AddFeeComponentModal({ dealId, feePlanId }: AddFeeComponentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    kind: 'subscription',
    calc_method: 'percent_of_investment',
    rate_bps: '',
    flat_amount: '',
    frequency: 'one_time',
    hurdle_rate_bps: '',
    has_high_water_mark: false,
    notes: ''
  })

  const handleSubmit = async () => {
    const usesFlatAmount = ['fixed', 'fixed_amount', 'per_unit_spread'].includes(formData.calc_method)
    const isPercentMethod = !usesFlatAmount
    
    if (isPercentMethod && !formData.rate_bps) {
      setError('Rate in basis points is required')
      return
    }

    if (usesFlatAmount && !formData.flat_amount) {
      setError(formData.calc_method === 'per_unit_spread' ? 'BI fee per share is required' : 'Flat amount is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/fee-plans/${feePlanId}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: formData.kind,
          calc_method: formData.calc_method,
          rate_bps: isPercentMethod && formData.rate_bps ? parseInt(formData.rate_bps) : undefined,
          flat_amount: usesFlatAmount && formData.flat_amount ? parseFloat(formData.flat_amount) : undefined,
          frequency: formData.frequency,
          hurdle_rate_bps: formData.hurdle_rate_bps ? parseInt(formData.hurdle_rate_bps) : undefined,
          has_high_water_mark: formData.has_high_water_mark,
          notes: formData.notes || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add fee component')
      }

      // Reset and close
      setFormData({
        kind: 'subscription',
        calc_method: 'percent_of_investment',
        rate_bps: '',
        flat_amount: '',
        frequency: 'one_time',
        hurdle_rate_bps: '',
        has_high_water_mark: false,
        notes: ''
      })
      setOpen(false)
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
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fee Component</DialogTitle>
          <DialogDescription>
            Add a fee component to this plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Fee Type *</Label>
              <Select value={formData.kind} onValueChange={(v) => setFormData(prev => ({ ...prev, kind: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription (Upfront)</SelectItem>
                  <SelectItem value="management">Management (Annual)</SelectItem>
                  <SelectItem value="performance">Performance (Carry)</SelectItem>
                  <SelectItem value="spread_markup">BI Fee PPS</SelectItem>
                  <SelectItem value="flat">Flat Fee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc_method">Calculation Method *</Label>
              <Select value={formData.calc_method} onValueChange={(v) => setFormData(prev => ({ ...prev, calc_method: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent_of_investment">% of Investment</SelectItem>
                  <SelectItem value="percent_per_annum">% Per Annum</SelectItem>
                  <SelectItem value="percent_of_profit">% of Profit</SelectItem>
                  <SelectItem value="per_unit_spread">Share Count</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!['fixed', 'fixed_amount', 'per_unit_spread'].includes(formData.calc_method) ? (
              <div className="space-y-2">
                <Label htmlFor="rate_bps">Rate (Basis Points) *</Label>
                <Input
                  id="rate_bps"
                  type="number"
                  placeholder="500 = 5%"
                  value={formData.rate_bps}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate_bps: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">100 bps = 1%</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="flat_amount">
                  {formData.calc_method === 'per_unit_spread' ? 'BI Fee PPS (Deal Currency) *' : 'Flat Amount *'}
                </Label>
                <Input
                  id="flat_amount"
                  type="number"
                  step="0.01"
                  placeholder={formData.calc_method === 'per_unit_spread' ? '5.00' : '1000.00'}
                  value={formData.flat_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, flat_amount: e.target.value }))}
                />
                {formData.calc_method === 'per_unit_spread' && (
                  <p className="text-xs text-muted-foreground">Total fee = BI fee per share × share count</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="on_exit">On Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.kind === 'performance' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hurdle_rate_bps">Hurdle Rate (bps)</Label>
                <Input
                  id="hurdle_rate_bps"
                  type="number"
                  placeholder="800 = 8%"
                  value={formData.hurdle_rate_bps}
                  onChange={(e) => setFormData(prev => ({ ...prev, hurdle_rate_bps: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="has_high_water_mark"
                  checked={formData.has_high_water_mark}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, has_high_water_mark: checked === true }))
                  }
                />
                <Label htmlFor="has_high_water_mark" className="cursor-pointer">
                  Use High Watermark
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                'Add Component'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
